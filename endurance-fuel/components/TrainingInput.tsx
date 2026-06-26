'use client';
import { useState } from 'react';
import { Zap, Calendar, FileText, AlertCircle } from 'lucide-react';
import type { UserProfile, PlanZywieniowy, DebugState } from '@/lib/types';

interface Props {
  profile: UserProfile;
  onPlanGenerated: (plan: PlanZywieniowy, debug: DebugState) => void;
}

function getThisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

const PLACEHOLDER = `Przykład — wklej tu plan od trenera:

Poniedziałek: Odpoczynek
Wtorek: Bieg OWB1, R: 14km
Środa: Siłownia 60 min + GS
Czwartek: Interwały 8x 150m pod górkę, R: 12km
Piątek: Odpoczynek
Sobota: Długi bieg OWB1, R: 22km, Żele + WODA
Niedziela: Bieg regeneracyjny GR, R: 8km`;

const STEPS = [
  'Parsowanie planu treningowego…',
  'Obliczanie wydatku energetycznego…',
  'Pobieranie prognozy pogody…',
  'Dobieranie ubioru…',
  'Pobieranie wartości odżywczych…',
  'Tworzenie planu posiłków…',
];

export default function TrainingInput({ profile, onPlanGenerated }: Props) {
  const [trainingPlan, setTrainingPlan] = useState('');
  const [weekStart, setWeekStart] = useState(getThisMonday());
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingPlan.trim()) {
      setError('Wklej plan treningowy przed wygenerowaniem planu.');
      return;
    }
    setError(null);
    setLoading(true);
    setStepIndex(0);

    // Animate steps while waiting
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % STEPS.length);
    }, 4000);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, trainingPlan, weekStart }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Nieznany błąd serwera');
      onPlanGenerated(data.plan as PlanZywieniowy, (data.debug ?? {}) as DebugState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd połączenia z backendem');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tydzień */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={12} /> Tydzień od
        </label>
        <input
          type="date"
          value={weekStart}
          onChange={e => setWeekStart(e.target.value)}
          className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:border-lime-500 transition-all text-sm"
        />
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileText size={12} /> Plan treningowy
        </label>
        <textarea
          value={trainingPlan}
          onChange={e => setTrainingPlan(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={11}
          disabled={loading}
          className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-500 transition-all resize-none font-mono text-xs leading-relaxed disabled:opacity-50"
        />
        <p className="text-right text-zinc-600 text-xs">{trainingPlan.length} znaków</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-950/60 border border-red-800/60 px-4 py-3 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all shadow-lg shadow-lime-500/20 disabled:shadow-none text-base"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
            <span className="text-zinc-300">{STEPS[stepIndex]}</span>
          </>
        ) : (
          <>
            <Zap size={18} fill="currentColor" />
            Generuj plan żywieniowy
          </>
        )}
      </button>

      {loading && (
        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === stepIndex ? 'w-4 bg-lime-500' : 'w-1 bg-zinc-700'
              }`}
            />
          ))}
        </div>
      )}
    </form>
  );
}
