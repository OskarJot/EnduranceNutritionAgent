export type Gender = 'M' | 'K';
export type Goal = 'Redukcja' | 'Faza bazowa' | 'Faza budowania' | 'BPS / Start';

export interface UserProfile {
  id: string;
  name: string;
  weight: number;
  gender: Gender;
  goal: Goal;
  location: string;
}

export interface DebugState {
  tydzien_treningowy?: string;
  wynik_trenera?: string;
  dane_pogodowe?: string;
  pogoda_tygodnia?: string;
  zalecenia_ubioru?: string;
  baza_produktow?: string;
  lokalizacja_treningu?: string;
}

// Matches ADK PlanZywieniowy output schema exactly
export interface Posilek {
  pora: string;
  czas_wzgledem_treningu: string | null;
  skladniki: string[];
  kcal: number;
  bialko_g: number;
  weglowodany_g: number;
  tluszcze_g: number;
}

export interface DzienZywieniowy {
  dzien: number;
  data: string | null;
  typ_dnia: string;
  kcal_spalone: number | null;
  kcal_cel: number;
  posilki: Posilek[];
  nawodnienie_l: number;
  zalecenie_ubioru: string | null;
  uwagi: string | null;
}

export interface PlanZywieniowy {
  streszczenie: string;
  cel_kcal_dzien_treningowy: number;
  cel_kcal_dzien_odpoczynku: number;
  dni: DzienZywieniowy[];
  zasady_kluczowe: string[];
  lista_zakupow: string[];
}
