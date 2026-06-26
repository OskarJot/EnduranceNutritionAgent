'use client';
import { useState } from 'react';
import type { UserProfile, Gender, Goal } from '@/lib/types';
import { User, Scale, MapPin, Target, ChevronRight } from 'lucide-react';

interface Props {
  initial?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const GOALS: Goal[] = ['Faza bazowa', 'Faza budowania', 'BPS / Start', 'Redukcja'];
const GOAL_LABELS: Record<Goal, string> = {
  'Faza bazowa':    'Faza bazowa',
  'Faza budowania': 'Faza budowania',
  'BPS / Start':    'BPS / Start',
  'Redukcja':       'Redukcja',
};
const GOAL_DESC: Record<Goal, string> = {
  'Faza bazowa':    '🏗 baza tlenowa',
  'Faza budowania': '📈 intensywność',
  'BPS / Start':    '🏁 start w zasięgu',
  'Redukcja':       '↓ masa ciała',
};

const inputClass =
  'w-full rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-white placeholder-zinc-500 ' +
  'focus:outline-none focus:border-lime-500 focus:bg-zinc-800 transition-all text-sm';

export default function ProfileForm({ initial, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? '');
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'M');
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? 'Redukcja');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Podaj imię';
    const w = parseFloat(weight);
    if (isNaN(w) || w < 30 || w > 250) e.weight = 'Podaj wagę (30–250 kg)';
    if (!location.trim()) e.location = 'Podaj lokalizację';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      weight: parseFloat(weight),
      gender,
      goal,
      location: location.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Imię */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <User size={12} /> Imię
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="np. Jan"
          className={inputClass}
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
      </div>

      {/* Waga */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Scale size={12} /> Waga (kg)
        </label>
        <input
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="np. 75"
          type="number"
          min={30}
          max={250}
          className={inputClass}
        />
        {errors.weight && <p className="text-red-400 text-xs">{errors.weight}</p>}
      </div>

      {/* Płeć */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Płeć</label>
        <div className="flex gap-2">
          {(['M', 'K'] as Gender[]).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                gender === g
                  ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                  : 'bg-zinc-800/60 border border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {g === 'M' ? '♂ Mężczyzna' : '♀ Kobieta'}
            </button>
          ))}
        </div>
      </div>

      {/* Cel */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Target size={12} /> Cel treningowy
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`py-3 px-3 rounded-xl text-sm transition-all text-left ${
                goal === g
                  ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                  : 'bg-zinc-800/60 border border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <p className="font-semibold leading-tight">{GOAL_LABELS[g]}</p>
              <p className={`text-xs mt-0.5 ${goal === g ? 'text-black/60' : 'text-zinc-500'}`}>
                {GOAL_DESC[g]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Lokalizacja */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={12} /> Lokalizacja
        </label>
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="np. Kraków"
          className={inputClass}
        />
        {errors.location && <p className="text-red-400 text-xs">{errors.location}</p>}
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 active:scale-[0.98] text-black font-black py-4 rounded-xl transition-all shadow-lg shadow-lime-500/20 text-base"
      >
        Zapisz profil <ChevronRight size={18} />
      </button>
    </form>
  );
}
