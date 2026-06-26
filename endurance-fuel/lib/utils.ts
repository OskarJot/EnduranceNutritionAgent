export const DAY_NAMES = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
export const DAY_NAMES_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

export function weatherEmoji(typDnia: string): string {
  const t = typDnia.toLowerCase();
  if (t.includes('odpoczynek')) return '🛌';
  if (t.includes('interval') || t.includes('interwał') || t.includes('podbiegi')) return '⚡';
  if (t.includes('rower')) return '🚴';
  if (t.includes('siłownia') || t.includes('silownia')) return '🏋️';
  if (t.includes('bieg')) return '🏃';
  return '🏃';
}

export function formatDate(isoDate: string | null, dayIndex: number): string {
  if (isoDate) {
    const d = new Date(isoDate + 'T12:00:00');
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }
  return `Dzień ${dayIndex + 1}`;
}

export function intensityColor(typDnia: string): string {
  const t = typDnia.toLowerCase();
  if (t.includes('odpoczynek')) return 'text-zinc-500';
  if (t.includes('interval') || t.includes('interwał') || t.includes('podbiegi')) return 'text-orange-400';
  if (t.includes('długi') || t.includes('dlug')) return 'text-blue-400';
  return 'text-lime-400';
}
