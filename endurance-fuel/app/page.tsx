'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import TrainingInput from '@/components/TrainingInput';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import DebugPanel from '@/components/DebugPanel';
import type { PlanZywieniowy, DebugState } from '@/lib/types';
import { Zap, MapPin, User, Target, ShoppingCart, Shield } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { profile, loaded } = useProfile();
  const [plan, setPlan] = useState<PlanZywieniowy | null>(null);
  const [debug, setDebug] = useState<DebugState | null>(null);

  useEffect(() => {
    if (loaded && !profile) {
      router.replace('/profile');
    }
  }, [loaded, profile, router]);

  if (!loaded || !profile) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="flex items-center gap-2 text-lime-500 animate-pulse">
          <Zap size={24} fill="currentColor" />
          <span className="text-lg font-bold">EnduranceFuel</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Glassmorphism header */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-md border-b border-zinc-800/60 px-5 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-lime-500 shrink-0">
            <Zap size={20} fill="currentColor" />
            <span className="font-black tracking-tight text-base">EnduranceFuel</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 min-w-0">
            <span className="flex items-center gap-1">
              <User size={11} />
              {profile.name}, {profile.weight} kg
            </span>
            <span className="text-zinc-700">·</span>
            <span className="flex items-center gap-1">
              <Target size={11} />
              {profile.goal}
            </span>
            <span className="text-zinc-700">·</span>
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} />
              {profile.location}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {plan && (
              <button
                onClick={() => setPlan(null)}
                className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                Nowy plan
              </button>
            )}
            <button
              onClick={() => router.push('/profile')}
              className="text-xs text-lime-500 hover:text-lime-400 font-medium transition-colors"
            >
              Edytuj profil
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        {!plan ? (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-black text-white mb-2">
                Hej, {profile.name}! 👋
              </h1>
              <p className="text-zinc-400 text-lg">
                Wklej plan treningowy — wygeneruję spersonalizowany plan żywieniowy z prognozą pogody.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              <TrainingInput
                profile={profile}
                onPlanGenerated={(p, d) => { setPlan(p); setDebug(d); }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Streszczenie */}
            <div className="relative overflow-hidden bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              {/* Subtle lime glow in top-right */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-lime-500/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-zinc-300 leading-relaxed text-sm relative">{plan.streszczenie}</p>
              <div className="flex gap-6 mt-5 pt-4 border-t border-zinc-800">
                <div>
                  <p className="text-zinc-500 text-xs mb-0.5">Dzień treningowy</p>
                  <p className="text-lime-400 font-black text-xl">{plan.cel_kcal_dzien_treningowy} kcal</p>
                </div>
                <div className="w-px bg-zinc-800" />
                <div>
                  <p className="text-zinc-500 text-xs mb-0.5">Dzień odpoczynku</p>
                  <p className="text-white font-black text-xl">{plan.cel_kcal_dzien_odpoczynku} kcal</p>
                </div>
              </div>
            </div>

            {/* Weekly calendar */}
            <div>
              <h2 className="text-lg font-black text-white mb-3">Plan tygodniowy</h2>
              <WeeklyCalendar plan={plan} />
            </div>

            {/* Zasady kluczowe */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-lime-500" />
                <h2 className="text-base font-black text-white">Zasady kluczowe</h2>
              </div>
              <ul className="space-y-2.5">
                {plan.zasady_kluczowe.map((z, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-500 text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {z}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lista zakupów */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={16} className="text-lime-500" />
                <h2 className="text-base font-black text-white">Lista zakupów</h2>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                {plan.lista_zakupow.map((item, i) => (
                  <li key={i} className="text-zinc-400 text-sm flex items-start gap-1.5">
                    <span className="text-zinc-700 mt-0.5 shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Debug panel */}
            {debug && <DebugPanel debug={debug} />}
          </div>
        )}
      </main>
    </div>
  );
}
