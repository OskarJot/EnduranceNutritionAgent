import json
import re
import urllib.request
from datetime import date, timedelta
from typing import Any, Optional

from google.adk.events.event import Event

from .models import DanePogodowe, PogodaDnia
from .nutrition_data import FALLBACK_MAKRO, OFF_QUERY, PRODUKTY_BAZOWE, PRODUKTY_FAZY


# ---------------------------------------------------------------------------
# Helpers HTTP
# ---------------------------------------------------------------------------

def _http_get(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "NutritionAgent/1.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        return json.loads(resp.read())


# ---------------------------------------------------------------------------
# Node 1 — parsowanie wejścia (profil + opcjonalny xlsx)
# ---------------------------------------------------------------------------

def parsuj_plik_jesli_podano(node_input: Any) -> Event:
    """Wyciąga profil sportowca regexem i parsuje xlsx jeśli podano."""
    xlsx_tresc = ""

    if hasattr(node_input, "parts"):
        tekst = " ".join(
            part.text for part in node_input.parts
            if hasattr(part, "text") and part.text
        )
    else:
        tekst = str(node_input)

    waga_m = re.search(r"[Ww]aga:\s*(\d+(?:[.,]\d+)?)\s*kg", tekst)
    cel_m  = re.search(r"[Cc]el:\s*(bazowy|budowanie|BPS|redukcja)", tekst, re.IGNORECASE)
    plec_m = re.search(r"[Pp][łl][eę][cć]:\s*([MKmk])", tekst)

    profil = {
        "waga_kg": float(waga_m.group(1).replace(",", ".")) if waga_m else 70.0,
        "cel":     cel_m.group(1).lower() if cel_m else "bazowy",
        "plec":    plec_m.group(1).upper() if plec_m else None,
    }

    try:
        match = re.search(r"(?:Plik|plik|File|file):\s*([^\n]+\.xlsx)", tekst, re.IGNORECASE)
        if match:
            import pandas as pd
            sciezka = match.group(1).strip().strip("\"'")
            df = pd.read_excel(sciezka)
            naglowki = "\t".join(str(c) for c in df.columns)
            wiersze = ["\t".join(str(v) if str(v) != "nan" else "" for v in row) for row in df.values]
            xlsx_tresc = f"[Plan treningowy z pliku: {sciezka}]\n{naglowki}\n" + "\n".join(wiersze)
    except Exception as exc:
        xlsx_tresc = f"[Błąd parsowania pliku xlsx: {exc}]"

    return Event(output=node_input, state={
        "xlsx_tresc": xlsx_tresc,
        "profil_uzytkownika": json.dumps(profil, ensure_ascii=False),
    })


# ---------------------------------------------------------------------------
# Node 3 — pogoda (Open-Meteo API)
# ---------------------------------------------------------------------------

def _opis_pogody_z_kodu(kod: int) -> str:
    _kody = {
        range(0, 3):   "Bezchmurnie / głównie słonecznie",
        range(3, 4):   "Pochmurno",
        range(45, 49): "Mgła",
        range(51, 68): "Deszcz",
        range(71, 87): "Śnieg / opady zimowe",
        range(95, 100):"Burza",
    }
    return next((v for r, v in _kody.items() if kod in r), f"Mieszane warunki (kod {kod})")


def _zalecenie_nawodnienia(t_avg: float, humidity: int) -> str:
    if t_avg > 25.0:
        return (
            f"⚠️ WYSOKIE NAWODNIENIE (temp. {t_avg}°C): zwiększ płyny o 500–750 ml, "
            "dodaj elektrolity (sód, potas) podczas i po treningu."
        )
    return f"Standardowe nawodnienie (temp. {t_avg}°C, wilgotność {humidity}%)."


def pobierz_pogode(node_input: Any, tydzien_treningowy: Any) -> Event:
    """Pobiera 7-dniową prognozę z Open-Meteo dla lokalizacji z planu treningowego."""
    dane = tydzien_treningowy if isinstance(tydzien_treningowy, dict) else json.loads(tydzien_treningowy)
    miasto = (dane.get("lokalizacja") or "Warsaw").strip()
    data_str = dane.get("data_startowa") or date.today().isoformat()

    try:
        start_dt = date.fromisoformat(data_str)
    except ValueError:
        start_dt = date.today()
    end_dt = start_dt + timedelta(days=6)

    try:
        geo = _http_get(
            f"https://geocoding-api.open-meteo.com/v1/search"
            f"?name={urllib.request.quote(miasto)}&count=1&language=pl&format=json"
        )
        if geo.get("results"):
            lat  = geo["results"][0]["latitude"]
            lon  = geo["results"][0]["longitude"]
            nazwa = geo["results"][0].get("name", miasto)
        else:
            lat, lon, nazwa = 52.2297, 21.0122, "Warszawa (domyślna)"
    except Exception:
        lat, lon, nazwa = 52.2297, 21.0122, "Warszawa (domyślna)"

    pogoda_tygodnia: list[dict] = []
    fallback_dzien = {
        "temperatura_max_c": 20.0, "temperatura_min_c": 14.0,
        "temperatura_odczuwalna_max_c": 18.0, "temperatura_odczuwalna_min_c": 12.0,
        "wiatr_max_kmh": 10.0, "wilgotnosc_procent": 60,
        "opady_prawdopodobienstwo_procent": 30, "kod_pogody": 0,
    }

    try:
        w = _http_get(
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_max,temperature_2m_min,"
            f"apparent_temperature_max,apparent_temperature_min,"
            f"precipitation_probability_max,relative_humidity_2m_mean,"
            f"wind_speed_10m_max,weather_code"
            f"&start_date={start_dt}&end_date={end_dt}"
            f"&timezone=Europe%2FWarsaw"
        )
        daily = w.get("daily", {})
        daty  = daily.get("time", [])

        for i, data_dnia in enumerate(daty):
            def _v(key, fallback=0.0, _i=i):
                vals = daily.get(key, [])
                return float(vals[_i]) if _i < len(vals) and vals[_i] is not None else fallback

            t_max = _v("temperature_2m_max", 20.0)
            t_min = _v("temperature_2m_min", 14.0)
            t_avg = round((t_max + t_min) / 2, 1)

            pogoda_tygodnia.append(PogodaDnia(
                data=data_dnia,
                dzien_tygodnia=i + 1,
                temperatura_max_c=t_max,
                temperatura_min_c=t_min,
                temperatura_odczuwalna_max_c=_v("apparent_temperature_max", t_max),
                temperatura_odczuwalna_min_c=_v("apparent_temperature_min", t_min),
                wiatr_max_kmh=_v("wind_speed_10m_max", 10.0),
                wilgotnosc_procent=int(_v("relative_humidity_2m_mean", 60)),
                opady_prawdopodobienstwo_procent=int(_v("precipitation_probability_max", 30)),
                kod_pogody=int(_v("weather_code", 0)),
                opis_pogody=_opis_pogody_z_kodu(int(_v("weather_code", 0))),
                wysokie_nawodnienie=t_avg > 25.0,
                zalecenie_nawodnienia=_zalecenie_nawodnienia(t_avg, int(_v("relative_humidity_2m_mean", 60))),
            ).model_dump())

    except Exception as exc:
        for i in range(7):
            d = dict(fallback_dzien)
            d["data"] = (start_dt + timedelta(days=i)).isoformat()
            d["dzien_tygodnia"] = i + 1
            d["opis_pogody"] = f"Brak danych ({exc})"
            d["wysokie_nawodnienie"] = False
            d["zalecenie_nawodnienia"] = "Stosuj standardowe nawodnienie."
            pogoda_tygodnia.append(d)

    p0    = pogoda_tygodnia[0] if pogoda_tygodnia else fallback_dzien
    t_avg0 = round((p0.get("temperatura_max_c", 20) + p0.get("temperatura_min_c", 14)) / 2, 1)
    pogoda_ogolna = DanePogodowe(
        lokalizacja=nazwa,
        temperatura_max_c=p0.get("temperatura_max_c", 20.0),
        temperatura_min_c=p0.get("temperatura_min_c", 14.0),
        temperatura_srednia_c=t_avg0,
        temperatura_odczuwalna_max_c=p0.get("temperatura_odczuwalna_max_c", 18.0),
        temperatura_odczuwalna_min_c=p0.get("temperatura_odczuwalna_min_c", 12.0),
        wiatr_max_kmh=p0.get("wiatr_max_kmh", 10.0),
        wilgotnosc_procent=p0.get("wilgotnosc_procent", 60),
        opady_prawdopodobienstwo_procent=p0.get("opady_prawdopodobienstwo_procent", 30),
        kod_pogody=p0.get("kod_pogody", 0),
        opis_pogody=p0.get("opis_pogody", ""),
        wysokie_nawodnienie=p0.get("wysokie_nawodnienie", False),
        zalecenie=p0.get("zalecenie_nawodnienia", ""),
    )

    return Event(output=node_input, state={
        "dane_pogodowe":      pogoda_ogolna.model_dump_json(),
        "pogoda_tygodnia":    json.dumps(pogoda_tygodnia, ensure_ascii=False),
        "lokalizacja_treningu": nazwa,
    })


# ---------------------------------------------------------------------------
# Node 4 — dobór ubioru (deterministyczny)
# ---------------------------------------------------------------------------

def _ubior_dla_sesji(
    temp_odczuwalna_c: float,
    dyscyplina: str,
    intensywnosc: str,
    dystans_km: Optional[float],
    deszcz_procent: int,
    wiatr_kmh: float,
    opis_pogody: str,
) -> str:
    dys  = dyscyplina.lower()
    heat = {
        "bardzo wysoka": {"bieg": 14, "rower": 8},
        "wysoka":        {"bieg": 12, "rower": 7},
        "umiarkowana":   {"bieg": 10, "rower": 5},
        "niska":         {"bieg":  8, "rower": 4},
        "regeneracja":   {"bieg":  7, "rower": 3},
    }
    sport  = "bieg" if "bieg" in dys else "rower" if "rower" in dys else "bieg"
    korekta = heat.get(intensywnosc.lower(), {}).get(sport, 8)
    t_eff  = temp_odczuwalna_c + korekta

    if t_eff > 24:
        baza = "Singlet lub koszulka bezrękawnik + spodenki biegowe"
    elif t_eff > 18:
        baza = "Koszulka techniczna krótki rękaw + spodenki"
    elif t_eff > 12:
        baza = "Koszulka techniczna długi rękaw + 3/4 legginsy lub spodenki z gazetami"
    elif t_eff > 6:
        baza = "Koszulka termiczna + legginsy biegowe"
    elif t_eff > 0:
        baza = "Koszulka termiczna + bluza techniczna + legginsy termiczne"
    else:
        baza = "Bielizna termiczna + bluza z fleece + legginsy zimowe"

    czesci = [baza]

    if deszcz_procent >= 60:
        czesci.append("Kurtka przeciwdeszczowa (Gore-Tex lub membrana)")
    elif deszcz_procent >= 35:
        czesci.append("Lekka kurtka wiatrówka / wododporna (możliwy przelotny deszcz)")

    if wiatr_kmh > 30 and "kurtka" not in " ".join(czesci).lower():
        czesci.append("Gilet/kamizelka wiatroszczelna")

    akcesoria = []
    if t_eff < 12:
        akcesoria.append("cienkie rękawiczki")
    if t_eff < 6:
        akcesoria.append("opaska na uszy lub czapka biegowa")
    if t_eff < 0:
        akcesoria.append("buff/komin na szyję")
    if "słonecznie" in opis_pogody.lower() and t_eff > 18:
        akcesoria.append("czapeczka z daszkiem + krem SPF")
    if akcesoria:
        czesci.append("Akcesoria: " + ", ".join(akcesoria))

    if sport == "rower":
        czesci.append("Kask rowerowy (obowiązkowy) + rękawiczki rowerowe")
        if t_eff < 12:
            czesci.append("Ochraniacze na buty (neopren)")

    if dystans_km:
        pred_kmh = 10 if sport == "bieg" else 25
        czas_est = dystans_km / pred_kmh * 60
        if czas_est > 90:
            czesci.append(
                f"⏱ Długa sesja ({dystans_km:.0f} km ≈ {int(czas_est)} min): "
                "możesz wyjść lekko przegrzany — ciało nagrzeje się po 10-15 min"
            )

    return " | ".join(czesci)


def dobierz_ubior(node_input: Any, pogoda_tygodnia: str, wynik_trenera: Any) -> Event:
    """Generuje rekomendacje ubioru per sesja na podstawie pogody konkretnego dnia."""
    tygodniowa = json.loads(pogoda_tygodnia) if isinstance(pogoda_tygodnia, str) else pogoda_tygodnia
    trener     = wynik_trenera if isinstance(wynik_trenera, dict) else json.loads(wynik_trenera)

    pogoda_per_dzien: dict[int, dict] = {int(p.get("dzien_tygodnia", 0)): p for p in tygodniowa}
    zalecenia: dict[str, str] = {}

    for sesja in trener.get("sesje", []):
        if sesja.get("dyscyplina", "").lower() == "odpoczynek":
            continue
        nr_dnia = sesja.get("dzien", 1)
        p       = pogoda_per_dzien.get(nr_dnia, tygodniowa[0] if tygodniowa else {})
        t_feel_avg = (p.get("temperatura_odczuwalna_max_c", 18) + p.get("temperatura_odczuwalna_min_c", 12)) / 2

        rekomendacja = _ubior_dla_sesji(
            temp_odczuwalna_c=t_feel_avg,
            dyscyplina=sesja.get("dyscyplina", "Bieg"),
            intensywnosc=sesja.get("intensywnosc", "umiarkowana"),
            dystans_km=sesja.get("dystans_km"),
            deszcz_procent=p.get("opady_prawdopodobienstwo_procent", 30),
            wiatr_kmh=p.get("wiatr_max_kmh", 10.0),
            opis_pogody=p.get("opis_pogody", ""),
        )
        data_dnia  = p.get("data", "")
        dzien_label = f"Dzień {nr_dnia} ({sesja.get('dyscyplina', '')})"
        zalecenia[dzien_label] = f"[{data_dnia}] {rekomendacja}" if data_dnia else rekomendacja

    return Event(output=node_input, state={"zalecenia_ubioru": json.dumps(zalecenia, ensure_ascii=False)})


# ---------------------------------------------------------------------------
# Node 5 — baza produktów (OpenFoodFacts + fallback lokalny)
# ---------------------------------------------------------------------------

def pobierz_makro_produktow(node_input: Any, wynik_trenera: Any) -> Event:
    """Pobiera makro z OpenFoodFacts; dobiera produkty wg fazy treningowej."""
    trener = wynik_trenera if isinstance(wynik_trenera, dict) else json.loads(wynik_trenera)
    faza   = trener.get("profil", {}).get("cel", "bazowy")

    seen: set[str] = set()
    produkty: list[str] = []
    for nazwa in PRODUKTY_BAZOWE + PRODUKTY_FAZY.get(faza, PRODUKTY_FAZY["bazowy"]):
        if nazwa not in seen:
            seen.add(nazwa)
            produkty.append(nazwa)

    wyniki = []
    for polska_nazwa in produkty:
        makro = dict(FALLBACK_MAKRO.get(polska_nazwa, {}))
        query = OFF_QUERY.get(polska_nazwa)
        if query:
            try:
                url = (
                    "https://world.openfoodfacts.org/cgi/search.pl"
                    f"?search_terms={urllib.request.quote(query)}"
                    "&json=true&action=process"
                    "&fields=product_name,nutriments"
                    "&page_size=5&sort_by=unique_scans_n"
                )
                data = _http_get(url)
                for produkt in data.get("products", []):
                    n    = produkt.get("nutriments", {})
                    kcal = n.get("energy-kcal_100g") or (n.get("energy_100g", 0) or 0) / 4.184
                    bialko = n.get("proteins_100g", 0) or 0
                    wegl   = n.get("carbohydrates_100g", 0) or 0
                    tl     = n.get("fat_100g", 0) or 0
                    if kcal > 10 and (bialko + wegl + tl) > 0:
                        makro = {
                            "kcal": round(kcal), "bialko": round(bialko, 1),
                            "weglowodany": round(wegl, 1), "tluszcze": round(tl, 1),
                        }
                        break
            except Exception:
                pass

        wyniki.append({
            "nazwa":            polska_nazwa,
            "kcal_100g":        makro.get("kcal", 0),
            "bialko_100g":      makro.get("bialko", 0),
            "weglowodany_100g": makro.get("weglowodany", 0),
            "tluszcze_100g":    makro.get("tluszcze", 0),
        })

    return Event(output=node_input, state={"baza_produktow": json.dumps(wyniki, ensure_ascii=False)})
