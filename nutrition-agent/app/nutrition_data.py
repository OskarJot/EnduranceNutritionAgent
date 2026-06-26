# Wartości referencyjne na wypadek błędu API (źródło: USDA / polskie tablice żywnościowe IŻŻ)
FALLBACK_MAKRO: dict[str, dict] = {
    # Białko
    "Pierś z kurczaka":       {"kcal": 165, "bialko": 31.0, "weglowodany":  0.0, "tluszcze":  3.6},
    "Pierś z indyka":         {"kcal": 135, "bialko": 29.0, "weglowodany":  0.0, "tluszcze":  1.5},
    "Łosoś":                  {"kcal": 208, "bialko": 20.0, "weglowodany":  0.0, "tluszcze": 13.4},
    "Tuńczyk w wodzie":       {"kcal":  99, "bialko": 23.5, "weglowodany":  0.0, "tluszcze":  0.5},
    "Jajko kurze":            {"kcal": 143, "bialko": 12.6, "weglowodany":  0.6, "tluszcze":  9.5},
    "Białko jajka":           {"kcal":  52, "bialko": 10.9, "weglowodany":  0.7, "tluszcze":  0.2},
    "Twaróg półtłusty":       {"kcal": 105, "bialko": 16.0, "weglowodany":  3.0, "tluszcze":  3.4},
    "Skyr naturalny":         {"kcal":  63, "bialko": 11.0, "weglowodany":  4.0, "tluszcze":  0.2},
    "Jogurt grecki":          {"kcal": 100, "bialko":  9.0, "weglowodany":  3.6, "tluszcze":  5.0},
    "Odżywka białkowa":       {"kcal": 380, "bialko": 75.0, "weglowodany": 10.0, "tluszcze":  5.0},
    "Mozzarella":             {"kcal": 280, "bialko": 17.0, "weglowodany":  2.2, "tluszcze": 22.0},
    # Węglowodany złożone
    "Płatki owsiane":         {"kcal": 374, "bialko": 13.2, "weglowodany": 67.7, "tluszcze":  6.9},
    "Ryż biały":              {"kcal": 130, "bialko":  2.7, "weglowodany": 28.2, "tluszcze":  0.3},
    "Ryż brązowy":            {"kcal": 123, "bialko":  2.7, "weglowodany": 25.6, "tluszcze":  0.9},
    "Kasza gryczana":         {"kcal": 343, "bialko": 13.3, "weglowodany": 71.5, "tluszcze":  3.4},
    "Kasza jaglana":          {"kcal": 353, "bialko": 11.0, "weglowodany": 72.9, "tluszcze":  4.2},
    "Quinoa":                 {"kcal": 368, "bialko": 14.1, "weglowodany": 64.2, "tluszcze":  6.1},
    "Makaron pełnoziarnisty": {"kcal": 352, "bialko": 13.0, "weglowodany": 67.0, "tluszcze":  2.5},
    "Makaron biały":          {"kcal": 371, "bialko": 13.0, "weglowodany": 74.7, "tluszcze":  1.5},
    "Chleb żytni":            {"kcal": 259, "bialko":  8.5, "weglowodany": 48.3, "tluszcze":  3.3},
    "Chleb pełnoziarnisty":   {"kcal": 247, "bialko":  9.0, "weglowodany": 43.0, "tluszcze":  3.5},
    "Chleb tostowy":          {"kcal": 265, "bialko":  8.0, "weglowodany": 49.0, "tluszcze":  3.2},
    "Ziemniak":               {"kcal":  77, "bialko":  2.0, "weglowodany": 17.0, "tluszcze":  0.1},
    "Batat":                  {"kcal":  86, "bialko":  1.6, "weglowodany": 20.1, "tluszcze":  0.1},
    "Soczewica czerwona":     {"kcal": 116, "bialko":  9.0, "weglowodany": 20.0, "tluszcze":  0.4},
    "Wafle ryżowe":           {"kcal": 387, "bialko":  8.0, "weglowodany": 81.5, "tluszcze":  2.8},
    # Szybkie węglowodany (trening)
    "Banan":                  {"kcal":  89, "bialko":  1.1, "weglowodany": 23.0, "tluszcze":  0.3},
    "Daktyle":                {"kcal": 282, "bialko":  2.5, "weglowodany": 75.0, "tluszcze":  0.4},
    "Rodzynki":               {"kcal": 299, "bialko":  3.1, "weglowodany": 79.2, "tluszcze":  0.5},
    "Miód":                   {"kcal": 304, "bialko":  0.3, "weglowodany": 82.4, "tluszcze":  0.0},
    "Dżem truskawkowy":       {"kcal": 250, "bialko":  0.5, "weglowodany": 65.0, "tluszcze":  0.1},
    "Żel energetyczny":       {"kcal": 100, "bialko":  0.0, "weglowodany": 25.0, "tluszcze":  0.0},
    "Sok pomarańczowy":       {"kcal":  45, "bialko":  0.7, "weglowodany": 10.4, "tluszcze":  0.2},
    "Napój izotoniczny":      {"kcal":  28, "bialko":  0.0, "weglowodany":  7.0, "tluszcze":  0.0},
    # Warzywa
    "Brokuły":                {"kcal":  34, "bialko":  2.8, "weglowodany":  7.0, "tluszcze":  0.4},
    "Szpinak":                {"kcal":  23, "bialko":  2.9, "weglowodany":  3.6, "tluszcze":  0.4},
    "Marchew":                {"kcal":  41, "bialko":  0.9, "weglowodany":  9.6, "tluszcze":  0.2},
    "Ogórek":                 {"kcal":  16, "bialko":  0.7, "weglowodany":  3.6, "tluszcze":  0.1},
    "Pomidor":                {"kcal":  18, "bialko":  0.9, "weglowodany":  3.9, "tluszcze":  0.2},
    "Papryka czerwona":       {"kcal":  31, "bialko":  1.0, "weglowodany":  7.3, "tluszcze":  0.3},
    "Cukinia":                {"kcal":  17, "bialko":  1.2, "weglowodany":  3.1, "tluszcze":  0.3},
    # Tłuszcze zdrowe
    "Awokado":                {"kcal": 160, "bialko":  2.0, "weglowodany":  9.0, "tluszcze": 15.0},
    "Oliwa z oliwek":         {"kcal": 884, "bialko":  0.0, "weglowodany":  0.0, "tluszcze":100.0},
    "Orzechy włoskie":        {"kcal": 654, "bialko": 15.2, "weglowodany": 13.7, "tluszcze": 65.2},
    "Migdały":                {"kcal": 579, "bialko": 21.2, "weglowodany": 21.6, "tluszcze": 49.9},
    "Masło orzechowe":        {"kcal": 588, "bialko": 25.1, "weglowodany": 20.1, "tluszcze": 50.4},
    "Nasiona chia":           {"kcal": 486, "bialko": 16.5, "weglowodany": 42.1, "tluszcze": 30.7},
    # Owoce
    "Jabłko":                 {"kcal":  52, "bialko":  0.3, "weglowodany": 13.8, "tluszcze":  0.2},
    "Borówki":                {"kcal":  57, "bialko":  0.7, "weglowodany": 14.5, "tluszcze":  0.3},
    "Truskawki":              {"kcal":  32, "bialko":  0.7, "weglowodany":  7.7, "tluszcze":  0.3},
    "Pomarańcza":             {"kcal":  47, "bialko":  0.9, "weglowodany": 11.8, "tluszcze":  0.1},
    # Nabiał uzupełniający
    "Mleko 2%":               {"kcal":  50, "bialko":  3.4, "weglowodany":  4.8, "tluszcze":  2.0},
    "Mleko owsiane":          {"kcal":  46, "bialko":  1.0, "weglowodany":  7.7, "tluszcze":  1.5},
}

# Zapytania OpenFoodFacts per produkt (english search term)
OFF_QUERY: dict[str, str] = {
    "Pierś z kurczaka": "chicken breast",       "Pierś z indyka": "turkey breast",
    "Łosoś": "salmon fillet",                   "Tuńczyk w wodzie": "tuna in water",
    "Jajko kurze": "chicken egg",               "Białko jajka": "egg white liquid",
    "Twaróg półtłusty": "cottage cheese",       "Skyr naturalny": "skyr natural",
    "Jogurt grecki": "greek yogurt",            "Odżywka białkowa": "whey protein",
    "Mozzarella": "mozzarella",                 "Płatki owsiane": "oats rolled",
    "Ryż biały": "white rice",                  "Ryż brązowy": "brown rice",
    "Kasza gryczana": "buckwheat groats",       "Kasza jaglana": "millet groats",
    "Quinoa": "quinoa",                         "Makaron pełnoziarnisty": "whole wheat pasta",
    "Makaron biały": "pasta white",             "Chleb żytni": "rye bread",
    "Chleb pełnoziarnisty": "whole grain bread","Chleb tostowy": "toast bread white",
    "Ziemniak": "potato",                       "Batat": "sweet potato",
    "Soczewica czerwona": "red lentils",        "Wafle ryżowe": "rice cakes",
    "Banan": "banana fresh",                    "Daktyle": "dates medjool",
    "Rodzynki": "raisins",                      "Miód": "honey",
    "Dżem truskawkowy": "strawberry jam",       "Żel energetyczny": "energy gel maltodextrin",
    "Sok pomarańczowy": "orange juice",         "Napój izotoniczny": "isotonic sports drink",
    "Brokuły": "broccoli fresh",                "Szpinak": "spinach fresh",
    "Marchew": "carrot fresh",                  "Ogórek": "cucumber fresh",
    "Pomidor": "tomato fresh",                  "Papryka czerwona": "red bell pepper",
    "Cukinia": "zucchini fresh",                "Awokado": "avocado fresh",
    "Oliwa z oliwek": "olive oil extra virgin", "Orzechy włoskie": "walnuts",
    "Migdały": "almonds raw",                   "Masło orzechowe": "peanut butter natural",
    "Nasiona chia": "chia seeds",               "Jabłko": "apple fresh",
    "Borówki": "blueberries fresh",             "Truskawki": "strawberries fresh",
    "Pomarańcza": "orange fresh",               "Mleko 2%": "milk 2 percent",
    "Mleko owsiane": "oat milk",
}

# Produkty zawsze obecne w bazie (niezależnie od fazy)
PRODUKTY_BAZOWE: list[str] = [
    "Pierś z kurczaka", "Jajko kurze", "Płatki owsiane", "Banan",
    "Jogurt grecki", "Twaróg półtłusty", "Ryż biały", "Chleb żytni",
    "Łosoś", "Odżywka białkowa",
]

# Produkty dobierane dynamicznie wg fazy periodyzacji
PRODUKTY_FAZY: dict[str, list[str]] = {
    "bazowy": [
        "Pierś z indyka", "Batat", "Ryż brązowy", "Kasza gryczana",
        "Makaron pełnoziarnisty", "Ziemniak", "Soczewica czerwona",
        "Brokuły", "Szpinak", "Awokado", "Orzechy włoskie", "Oliwa z oliwek",
        "Tuńczyk w wodzie", "Skyr naturalny", "Borówki",
    ],
    "budowanie": [
        "Pierś z indyka", "Batat", "Ryż brązowy", "Makaron pełnoziarnisty",
        "Quinoa", "Daktyle", "Brokuły", "Szpinak", "Migdały",
        "Masło orzechowe", "Sok pomarańczowy", "Mozzarella",
        "Tuńczyk w wodzie", "Truskawki", "Miód",
    ],
    "BPS": [
        "Makaron biały", "Daktyle", "Miód", "Sok pomarańczowy",
        "Żel energetyczny", "Chleb tostowy", "Dżem truskawkowy",
        "Wafle ryżowe", "Napój izotoniczny", "Batat",
        "Jabłko", "Rodzynki", "Kasza jaglana", "Ziemniak", "Mozzarella",
    ],
    "redukcja": [
        "Pierś z indyka", "Tuńczyk w wodzie", "Białko jajka", "Skyr naturalny",
        "Brokuły", "Szpinak", "Ogórek", "Pomidor", "Papryka czerwona",
        "Cukinia", "Migdały", "Nasiona chia", "Soczewica czerwona",
        "Batat", "Jabłko",
    ],
}
