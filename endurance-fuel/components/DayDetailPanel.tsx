'use client';
import { X, Droplets, Shirt, UtensilsCrossed, Flame } from 'lucide-react';
import type { DzienZywieniowy, Posilek } from '@/lib/types';
import { DAY_NAMES_FULL, weatherEmoji, formatDate } from '@/lib/utils';

interface Props {
  dzien: DzienZywieniowy;
  index: number;
  onClose: () => void;
}

function MacroBar({
  label,
  value,
  max,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  bgColor: string;
}) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className={`font-bold ${color}`}>{value}g</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bgColor} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MealCard({ meal, index }: { meal: Posilek; index: number }) {
  return (
    <div
      className="bg-zinc-900 rounded-xl border border-zinc-800 p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-white text-sm leading-tight">{meal.pora}</p>
          {meal.czas_wzgledem_treningu && (
            <span className="inline-block mt-1 text-xs bg-lime-500/10 text-lime-400 border border-lime-500/20 px-2 py-0.5 rounded-full">
              {meal.czas_wzgledem_treningu}
            </span>
          )}
        </div>
        <span className="text-lime-400 font-bold text-sm whitespace-nowrap shrink-0">
          {meal.kcal} kcal
        </span>
      </div>

      <ul className="space-y-1 mb-3">
        {meal.skladniki.map((s, i) => (
          <li key={i} className="text-zinc-400 text-xs flex items-start gap-1.5">
            <span className="text-lime-600 mt-0.5 shrink-0">·</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-zinc-800">
        {[
          { label: 'Białko', value: meal.bialko_g, color: 'text-blue-400' },
          { label: 'Węgle', value: meal.weglowodany_g, color: 'text-yellow-400' },
          { label: 'Tłuszcze', value: meal.tluszcze_g, color: 'text-orange-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className={`text-xs font-bold ${color}`}>{value}g</p>
            <p className="text-zinc-600 text-xs">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DayDetailPanel({ dzien, index, onClose }: Props) {
  const totalKcal = dzien.posilki.reduce((s, p) => s + p.kcal, 0);
  const totalProtein = dzien.posilki.reduce((s, p) => s + p.bialko_g, 0);
  const totalCarbs = dzien.posilki.reduce((s, p) => s + p.weglowodany_g, 0);
  const totalFat = dzien.posilki.reduce((s, p) => s + p.tluszcze_g, 0);

  const dayName = DAY_NAMES_FULL[index] ?? DAY_NAMES_FULL[dzien.dzien - 1] ?? `Dzień ${dzien.dzien}`;
  const dateStr = formatDate(dzien.data, index);
  const kcalPct = dzien.kcal_cel > 0 ? Math.min(100, (totalKcal / dzien.kcal_cel) * 100) : 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f1117] border-l border-zinc-800 z-50 flex flex-col"
          style={{ animation: 'slideInRight 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
        {/* Sticky header */}
        <div className="shrink-0 bg-[#0f1117]/95 backdrop-blur border-b border-zinc-800 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{weatherEmoji(dzien.typ_dnia)}</span>
              <div>
                <h2 className="text-base font-black text-white leading-tight">
                  {dayName}
                  <span className="text-zinc-500 font-normal ml-2 text-sm">{dateStr}</span>
                </h2>
                <p className="text-sm text-zinc-400 mt-0.5 leading-tight">{dzien.typ_dnia}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg p-1.5 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* Kalorie + progress */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                <Flame size={14} className="text-lime-500" />
                Cel kaloryczny
              </div>
              <span className="text-lime-400 font-black text-lg">{dzien.kcal_cel} kcal</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-1 overflow-hidden">
              <div
                className="bg-lime-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${kcalPct}%` }}
              />
            </div>
            <p className="text-right text-zinc-600 text-xs mb-4">
              {totalKcal} z {dzien.kcal_cel} kcal zaplanowane
            </p>

            {/* Macro bars */}
            <div className="space-y-2.5">
              <MacroBar label="Białko" value={totalProtein} max={Math.round(totalProtein * 1.2)} color="text-blue-400" bgColor="bg-blue-500" />
              <MacroBar label="Węglowodany" value={totalCarbs} max={Math.round(totalCarbs * 1.2)} color="text-yellow-400" bgColor="bg-yellow-500" />
              <MacroBar label="Tłuszcze" value={totalFat} max={Math.round(totalFat * 1.2)} color="text-orange-400" bgColor="bg-orange-500" />
            </div>
          </div>

          {/* Nawodnienie */}
          <div className="flex items-center gap-3 bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplets size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Nawodnienie: <span className="text-blue-400">{dzien.nawodnienie_l} L</span>
              </p>
              {dzien.uwagi && (
                <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{dzien.uwagi}</p>
              )}
            </div>
          </div>

          {/* Ubiór */}
          {dzien.zalecenie_ubioru && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-lime-500/10 flex items-center justify-center">
                  <Shirt size={14} className="text-lime-500" />
                </div>
                <span className="text-sm font-semibold text-white">Ubiór na trening</span>
              </div>
              <div className="space-y-1">
                {dzien.zalecenie_ubioru.split(' | ').map((item, i) => (
                  <p key={i} className="text-zinc-400 text-xs leading-relaxed flex items-start gap-1.5">
                    <span className="text-lime-600 mt-0.5 shrink-0">·</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Posiłki */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-lime-500/10 flex items-center justify-center">
                <UtensilsCrossed size={14} className="text-lime-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Plan żywieniowy
                <span className="text-zinc-500 font-normal ml-1.5">({dzien.posilki.length} posiłków)</span>
              </h3>
            </div>
            <div className="space-y-2.5">
              {dzien.posilki.map((meal, i) => (
                <MealCard key={i} meal={meal} index={i} />
              ))}
            </div>
          </div>

          {/* Bottom padding for mobile safe area */}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
}
