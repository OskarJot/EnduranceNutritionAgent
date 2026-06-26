'use client';
import { useState } from 'react';
import { Droplets, ChevronRight } from 'lucide-react';
import type { PlanZywieniowy, DzienZywieniowy } from '@/lib/types';
import { DAY_NAMES, weatherEmoji, formatDate, intensityColor } from '@/lib/utils';
import DayDetailPanel from './DayDetailPanel';

interface Props {
  plan: PlanZywieniowy;
}

function intensityBar(typDnia: string): string {
  const t = typDnia.toLowerCase();
  if (t.includes('odpoczynek')) return 'bg-zinc-700';
  if (t.includes('interwał') || t.includes('interval') || t.includes('podbiegi')) return 'bg-orange-500';
  if (t.includes('długi') || t.includes('dlug')) return 'bg-blue-500';
  if (t.includes('siłownia') || t.includes('silownia')) return 'bg-purple-500';
  return 'bg-lime-500';
}

function DayCard({
  dzien,
  index,
  onClick,
}: {
  dzien: DzienZywieniowy;
  index: number;
  onClick: () => void;
}) {
  const isRest = dzien.typ_dnia.toLowerCase().includes('odpoczynek');
  const dateStr = formatDate(dzien.data, index);
  const dayLabel = DAY_NAMES[index] ?? DAY_NAMES[dzien.dzien - 1] ?? `D${dzien.dzien}`;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col"
    >
      {/* Intensity accent bar */}
      <div className={`h-0.5 w-full ${intensityBar(dzien.typ_dnia)} transition-all`} />

      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Day header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {dayLabel}
            </span>
            {dzien.data && (
              <span className="text-xs text-zinc-600">{dateStr}</span>
            )}
          </div>
          <span className="text-base leading-none">{weatherEmoji(dzien.typ_dnia)}</span>
        </div>

        {/* Training type */}
        <p className={`text-sm font-semibold leading-snug ${intensityColor(dzien.typ_dnia)}`}>
          {dzien.typ_dnia}
        </p>

        {/* Kcal + Hydration */}
        {isRest ? (
          <p className="text-zinc-600 text-xs mt-auto">Dzień regeneracji</p>
        ) : (
          <div className="flex items-center justify-between mt-auto pt-1">
            <span className="text-white font-bold">{dzien.kcal_cel} kcal</span>
            <span className="flex items-center gap-1 text-blue-400 text-xs">
              <Droplets size={11} />
              {dzien.nawodnienie_l}L
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-zinc-600 text-xs">{dzien.posilki.length} posiłków</span>
        <ChevronRight
          size={14}
          className="text-zinc-700 group-hover:text-lime-500 transition-colors"
        />
      </div>
    </button>
  );
}

export default function WeeklyCalendar({ plan }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedDzien = selectedIndex !== null ? plan.dni[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {plan.dni.map((dzien, i) => (
          <DayCard
            key={i}
            dzien={dzien}
            index={i}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {selectedDzien && selectedIndex !== null && (
        <DayDetailPanel
          dzien={selectedDzien}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
