from google.adk.apps import App
from google.adk.workflow import Workflow

from .agents import agent_czytnik, agent_dietetyk, agent_trener
from .nodes import (
    dobierz_ubior,
    parsuj_plik_jesli_podano,
    pobierz_pogode,
)

root_agent = Workflow(
    name="pipeline_nutrition",
    edges=[
        ("START",                  parsuj_plik_jesli_podano),  # regex: profil + xlsx
        (parsuj_plik_jesli_podano, agent_czytnik),             # LLM: parsowanie planu
        (agent_czytnik,            agent_trener),              # LLM: kalkulacja kcal
        (agent_trener,             pobierz_pogode),            # API: Open-Meteo
        (pobierz_pogode,           dobierz_ubior),             # deterministyczny: ubiór
        (dobierz_ubior,            agent_dietetyk),            # LLM + MCP: plan żywieniowy
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
