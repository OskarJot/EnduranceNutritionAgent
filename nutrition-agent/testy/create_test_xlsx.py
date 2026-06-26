import os
import pandas as pd

os.makedirs(os.path.dirname(__file__), exist_ok=True)

data = {
    "Dzien": [
        "Poniedzialek", "Wtorek", "Sroda",
        "Czwartek", "Piatek", "Sobota", "Niedziela"
    ],
    "Typ treningu": [
        "Odpoczynek", "Interway", "Bieg spokojny",
        "Bieg progowy", "Odpoczynek", "Bieg spokojny", "Wybieganie"
    ],
    "Dystans": ["0 km", "11 km", "10 km", "12 km", "0 km", "5 km", "24 km"],
    "Opis jednostki": [
        "Wolne / Regeneracja lub lekki stretching.",
        "3 km rozgrzewki + 6 x 800m z 400m truchtu + 2 km schlodzenia.",
        "Bieg regeneracyjny, niska intensywnosc (Strefa 2).",
        "3 km rozgrzewki + 6 km tempem maratonskim + 3 km schlodzenia.",
        "Calkowity odpoczynek lub rolowanie.",
        "Krotki rozruch, na koniec 4 x 100m przebiezki (Rytmy).",
        "Bieg dlugi. Dobre nawodnienie i testowanie zeli energetycznych.",
    ],
    "Docelowe tempo": [
        "-", "5:00-5:10 min/km", "6:15-6:30 min/km",
        "5:40-5:45 min/km", "-", "6:15-6:30 min/km", "6:15-6:25 min/km"
    ],
}

output_path = os.path.join(os.path.dirname(__file__), "plan_treningowy_test.xlsx")
pd.DataFrame(data).to_excel(output_path, index=False)
print(f"Gotowe: {output_path}")
