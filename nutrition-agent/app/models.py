from typing import Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Agent-Czytnik — plan treningowy
# ---------------------------------------------------------------------------

class SesjaTreningowa(BaseModel):
    dzien: Optional[int] = Field(
        None,
        description="Numer dnia tygodnia: 1=poniedziałek, 7=niedziela. Null jeśli dzień nieznany.",
    )
    dyscyplina: str = Field(
        description="Główna dyscyplina sesji: Bieg, Rower, Silownia, Odpoczynek lub Mieszany."
    )
    strefy_intensywnosci: Optional[list[str]] = Field(
        None,
        description=(
            "Lista kodów stref i elementów treningu z notacji polskiej, np. ['OWB1', 'GR', 'GS']. "
            "OWB1=ogólna wytrzymałość biegowa (strefa tlenowa), GR=gimnastyka regeneracyjna, "
            "GS=gimnastyka siłowa, Przeb.=przebieżki (strides), Podbiegi=biegi pod górę."
        ),
    )
    dystans_km: Optional[float] = Field(
        None, description="Łączny dystans sesji w kilometrach. Np. 'R: 14km' → 14.0."
    )
    czas_trwania_min: Optional[int] = Field(
        None, description="Szacowany lub podany czas trwania sesji w minutach."
    )
    interwaly_liczba: Optional[int] = Field(
        None,
        description=(
            "Liczba powtórzeń elementu interwałowego. "
            "Np. '12x(Przeb.)' → 12, '8x 150m' → 8."
        ),
    )
    interwaly_dystans_m: Optional[float] = Field(
        None,
        description=(
            "Dystans pojedynczego interwału w metrach. "
            "Np. '8x 150m pod górkę' → 150.0."
        ),
    )
    tempo_docelowe: Optional[str] = Field(
        None,
        description=(
            "Docelowe tempo biegu w formacie 'min:ss min/km' lub przedział 'min:ss - min:ss min/km'. "
            "Np. '5:00 - 5:10 min/km', '6:15 min/km'. Null jeśli nie podano lub '-'."
        ),
    )
    RPE: Optional[int] = Field(
        None,
        description="Subiektywne odczucie wysiłku w skali 1–10. Null jeśli nie podano.",
    )
    odzywianie: Optional[str] = Field(
        None,
        description=(
            "Zalecenia żywieniowe lub nawodnienie przypisane do tej sesji. "
            "Np. 'Żele + WODA'. Null jeśli brak."
        ),
    )
    dodatkowy_opis: Optional[str] = Field(
        None,
        description="Wszelkie dodatkowe informacje nieujęte w innych polach.",
    )


class TydzienTreningowy(BaseModel):
    sesje: list[SesjaTreningowa] = Field(
        description=(
            "Lista wszystkich sesji treningowych w tygodniu w kolejności ich wystąpienia. "
            "Jeden dzień może mieć wiele sesji (ten sam numer dzien). "
            "Dni odpoczynku dodawaj tylko gdy pusta linia sugeruje wyraźną przerwę między blokami."
        )
    )
    laczny_dystans_km: Optional[float] = Field(
        None,
        description="Suma dystansów biegowych i rowerowych wszystkich sesji w tygodniu.",
    )
    lokalizacja: Optional[str] = Field(
        None,
        description=(
            "Miasto lub region treningu, np. 'Kraków', 'Warszawa'. "
            "Wyodrębnij jeśli podano w tekście (np. 'Trening w Krakowie', 'Lokalizacja: Gdańsk'). "
            "Null jeśli nie podano."
        ),
    )
    data_startowa: Optional[str] = Field(
        None,
        description=(
            "Data pierwszego dnia tygodnia treningowego w formacie ISO: 'YYYY-MM-DD'. "
            "Wyodrębnij z fraz: 'Tydzień od: 23.06.2025', 'Start: 2025-06-23', "
            "'Trening od 23 czerwca', 'Tydzień: 23-29 czerwca'. "
            "Zawsze konwertuj do formatu YYYY-MM-DD. Null jeśli nie podano."
        ),
    )


# ---------------------------------------------------------------------------
# Pogoda (modele wewnętrzne dla nodes.py)
# ---------------------------------------------------------------------------

class DanePogodowe(BaseModel):
    lokalizacja: str
    temperatura_max_c: float
    temperatura_min_c: float
    temperatura_srednia_c: float
    temperatura_odczuwalna_max_c: float
    temperatura_odczuwalna_min_c: float
    wiatr_max_kmh: float
    wilgotnosc_procent: int
    opady_prawdopodobienstwo_procent: int
    kod_pogody: int
    opis_pogody: str
    wysokie_nawodnienie: bool
    zalecenie: str


class PogodaDnia(BaseModel):
    data: str
    dzien_tygodnia: int
    temperatura_max_c: float
    temperatura_min_c: float
    temperatura_odczuwalna_max_c: float
    temperatura_odczuwalna_min_c: float
    wiatr_max_kmh: float
    wilgotnosc_procent: int
    opady_prawdopodobienstwo_procent: int
    kod_pogody: int
    opis_pogody: str
    wysokie_nawodnienie: bool
    zalecenie_nawodnienia: str


# ---------------------------------------------------------------------------
# Agent-Trener — kalkulacja kcal
# ---------------------------------------------------------------------------

class ProfilUzytkownika(BaseModel):
    waga_kg: float = Field(description="Masa ciała sportowca w kilogramach.")
    plec: Optional[str] = Field(
        None, description="Płeć: 'M' (mężczyzna) lub 'K' (kobieta). Null jeśli nieznana."
    )
    cel: str = Field(
        description=(
            "Faza periodyzacji treningowej. Możliwe wartości:\n"
            "  'redukcja'  — deficyt kaloryczny, priorytet: utrata masy przy zachowaniu formy\n"
            "  'bazowy'    — faza bazowa (General Preparation): wysokie objętości, niska intensywność, "
            "budowa bazy tlenowej; start daleko — brak strategii startowych\n"
            "  'budowanie' — faza budowania (Specific Preparation): rosnąca intensywność, "
            "trening specyficzny; start w perspektywie kilku tygodni\n"
            "  'BPS'       — Bezpośrednie Przygotowanie Startowe: tapering, start wkrótce, "
            "ładowanie węglowodanami, strategia wyścigu"
        )
    )


class SesjaZKcal(BaseModel):
    dzien: Optional[int] = Field(None, description="Numer dnia tygodnia (1–7).")
    dyscyplina: str = Field(description="Dyscyplina sesji.")
    dystans_km: Optional[float] = Field(None, description="Dystans sesji w km.")
    intensywnosc: str = Field(
        description=(
            "Poziom intensywności sesji: 'regeneracja', 'niska', 'umiarkowana', 'wysoka', 'bardzo wysoka'. "
            "Podstawa: strefy/tempo/RPE/typ sesji z danych Czytnika."
        )
    )
    kcal_szacowane: Optional[int] = Field(
        None,
        description=(
            "Szacowany wydatek energetyczny sesji w kcal (tylko aktywność, bez BMR). "
            "Null dla sesji 'Odpoczynek'."
        ),
    )
    uzasadnienie_kcal: str = Field(
        description="Krótkie uzasadnienie obliczeń, np. '75kg × 14km × 1.04 × 1.1 (wysoka)'."
    )


class WynikTrenera(BaseModel):
    profil: ProfilUzytkownika = Field(description="Profil sportowca wyodrębniony z wiadomości.")
    sesje: list[SesjaZKcal] = Field(description="Lista sesji z obliczonymi kcal.")
    laczne_kcal_tydzien: int = Field(description="Suma kcal ze wszystkich sesji treningowych.")
    srednio_kcal_dzien_treningowy: int = Field(
        description="Średni wydatek kcal per dzień treningowy (bez dni odpoczynku)."
    )
    profil_obciazenia: str = Field(
        description=(
            "Ogólna ocena tygodnia: 'lekki', 'umiarkowany', 'ciezki' lub 'bardzo ciezki'. "
            "Podstawa: łączny kcal i liczba sesji wysokointensywnych."
        )
    )
    zalecenia_dla_dietetyka: str = Field(
        description=(
            "Kluczowe wnioski dla Agent-Dietetyka w 2–4 zdaniach: "
            "ile kcal dodać/odjąć, które dni wymagają większego załadowania węglowodanami, "
            "czy cel to redukcja czy BPS."
        )
    )


# ---------------------------------------------------------------------------
# Agent-Dietetyk — plan żywieniowy
# ---------------------------------------------------------------------------

class Posilek(BaseModel):
    pora: str = Field(
        description=(
            "Nazwa posiłku i moment dnia: 'Śniadanie', 'II śniadanie', "
            "'Posiłek przed treningiem (2-3h)', 'Żywienie podczas treningu', "
            "'Posiłek po treningu (do 30min)', 'Obiad', 'Kolacja', 'Przekąska'."
        )
    )
    czas_wzgledem_treningu: Optional[str] = Field(
        None,
        description="Np. '2-3h przed', 'W trakcie (co 45 min)', 'Do 30 min po'. Null dla dni bez treningu.",
    )
    skladniki: list[str] = Field(
        description="Lista składników z gramaturą, np. ['Płatki owsiane 80g', 'Banan 120g', 'Mleko 200ml']."
    )
    kcal: int = Field(description="Szacowana wartość kaloryczna posiłku.")
    bialko_g: int = Field(description="Białko w gramach.")
    weglowodany_g: int = Field(description="Węglowodany w gramach.")
    tluszcze_g: int = Field(description="Tłuszcze w gramach.")


class DzienZywieniowy(BaseModel):
    dzien: int = Field(description="Numer dnia tygodnia (1–7).")
    data: Optional[str] = Field(
        None,
        description=(
            "Konkretna data dnia w formacie 'YYYY-MM-DD', np. '2025-06-23'. "
            "Wyszukaj w pogoda_tygodnia po dzien_tygodnia == dzien. Null jeśli brak."
        ),
    )
    typ_dnia: str = Field(description="Opis dnia, np. 'Bieg OWB1 14km', 'Siłownia + Podbiegi', 'Odpoczynek'.")
    kcal_spalone: Optional[int] = Field(None, description="Kcal spalone podczas treningu. Null dla dni odpoczynku.")
    kcal_cel: int = Field(description="Docelowa podaż kaloryczna na ten dzień.")
    posilki: list[Posilek] = Field(description="Lista posiłków na ten dzień w kolejności chronologicznej.")
    nawodnienie_l: float = Field(description="Zalecana całkowita ilość płynów w litrach (woda + napoje).")
    zalecenie_ubioru: Optional[str] = Field(
        None,
        description=(
            "Rekomendacja ubioru dla sesji treningowej tego dnia. "
            "Skopiuj dosłownie wartość z zalecenia_ubioru dla tego dnia. "
            "Null dla dni odpoczynku."
        ),
    )
    uwagi: Optional[str] = Field(None, description="Specyficzne wskazówki dla tego dnia, np. strategia żelowania.")


class PlanZywieniowy(BaseModel):
    streszczenie: str = Field(
        description=(
            "2-3 zdania podsumowania planu. OBOWIĄZKOWO zawrzyj: "
            "(1) rzeczywistą wagę sportowca z profil.waga_kg — nigdy nie używaj wartości domyślnej 70 kg jeśli podano inną, "
            "(2) rzeczywistą fazę periodyzacji z profil.cel słowami: 'faza bazowa', 'faza budowania', "
            "'bezpośrednie przygotowanie startowe' lub 'redukcja' — nigdy nie pisz 'BPS' gdy cel='bazowy' lub 'budowanie', "
            "(3) główną strategię żywieniową dopasowaną do tej fazy."
        )
    )
    cel_kcal_dzien_treningowy: int = Field(description="Docelowa podaż kcal w dniach treningowych.")
    cel_kcal_dzien_odpoczynku: int = Field(description="Docelowa podaż kcal w dniach odpoczynku.")
    dni: list[DzienZywieniowy] = Field(description="Plan żywieniowy dla każdego dnia tygodnia.")
    zasady_kluczowe: list[str] = Field(
        description=(
            "3-5 kluczowych zasad żywieniowych dla tego tygodnia (krótkie punkty). "
            "Każda zasada musi być spójna z faktyczną fazą periodyzacji (profil.cel): "
            "dla 'bazowy'/'budowanie' NIE pisz o strategii startowej, ładowaniu przed wyścigiem ani BPS."
        )
    )
    lista_zakupow: list[str] = Field(
        description="Zgrupowana lista zakupów na cały tydzień (produkty bez gramatur, posortowane kategorią)."
    )
