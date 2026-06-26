'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Bug } from 'lucide-react';
import type { DebugState } from '@/lib/types';

interface Props {
  debug: DebugState;
}

interface Section {
  key: keyof DebugState;
  label: string;
  description: string;
  emoji: string;
}

const SECTIONS: Section[] = [
  {
    key: 'tydzien_treningowy',
    label: 'Agent-Czytnik',
    description: 'Sparsowany plan treningowy (sesje, dystanse, strefy)',
    emoji: '📖',
  },
  {
    key: 'wynik_trenera',
    label: 'Agent-Trener',
    description: 'Kalkulacja kcal per sesja, profil obciążenia',
    emoji: '🏋️',
  },
  {
    key: 'dane_pogodowe',
    label: 'Pogoda (ogólna)',
    description: 'Dane pogodowe dla lokalizacji (temp, wiatr, nawodnienie)',
    emoji: '🌤️',
  },
  {
    key: 'pogoda_tygodnia',
    label: 'Pogoda (7 dni)',
    description: 'Prognoza per dzień tygodnia z Open-Meteo',
    emoji: '📅',
  },
  {
    key: 'zalecenia_ubioru',
    label: 'Doradca Ubioru',
    description: 'Rekomendacje ubioru per sesja treningowa',
    emoji: '👕',
  },
  {
    key: 'baza_produktow',
    label: 'Baza Produktów',
    description: 'Produkty dobrane pod fazę + wartości odżywcze z OpenFoodFacts',
    emoji: '🥗',
  },
];

function tryParse(raw: string | undefined): unknown {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}

function SectionCard({ section, debug }: { section: Section; debug: DebugState }) {
  const [open, setOpen] = useState(false);
  const parsed = tryParse(debug[section.key]);
  const hasData = parsed !== null && parsed !== undefined && parsed !== '';

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors text-left"
      >
        <span className="text-base shrink-0">{section.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{section.label}</p>
          <p className="text-xs text-zinc-500 truncate">{section.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasData ? (
            <span className="text-xs bg-lime-500/10 text-lime-400 border border-lime-500/20 px-2 py-0.5 rounded-full font-medium">
              OK
            </span>
          ) : (
            <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
              brak
            </span>
          )}
          {open
            ? <ChevronDown size={13} className="text-zinc-500" />
            : <ChevronRight size={13} className="text-zinc-500" />}
        </div>
      </button>

      {open && hasData && (
        <div className="border-t border-zinc-800 bg-zinc-950 p-4">
          <pre className="text-xs text-zinc-300 overflow-auto max-h-80 leading-relaxed whitespace-pre-wrap break-words">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function DebugPanel({ debug }: Props) {
  const [open, setOpen] = useState(false);
  const loc = debug.lokalizacja_treningu;

  return (
    <div className="border border-zinc-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-zinc-800/20 transition-colors text-left"
      >
        <Bug size={15} className="text-zinc-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-400">Debug — Pipeline ADK</p>
          {loc && (
            <p className="text-xs text-zinc-600">
              Lokalizacja: <span className="text-zinc-500">{loc}</span>
            </p>
          )}
        </div>
        {open
          ? <ChevronDown size={13} className="text-zinc-600" />
          : <ChevronRight size={13} className="text-zinc-600" />}
      </button>

      {open && (
        <div className="border-t border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
          <p className="text-xs text-zinc-600 mb-3 px-1">
            Pełny stan sesji ADK — outputs poszczególnych agentów i node&apos;ów pipeline.
          </p>
          {SECTIONS.map(s => (
            <SectionCard key={s.key} section={s} debug={debug} />
          ))}
        </div>
      )}
    </div>
  );
}
