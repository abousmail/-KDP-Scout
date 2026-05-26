import { OpportunityScore, VolumeLevel } from '../types';

export function getVolumeLevel(score: number): VolumeLevel {
  if (score >= 65) return 'Haut';
  if (score >= 35) return 'Moyen';
  return 'Bas';
}

export function calculateOpportunityScore(
  volumeScore: number,
  competition: number
): OpportunityScore {
  const v = volumeScore;
  const c = competition;

  if (v >= 70 && c < 3000) return 'A+';
  if (v >= 70 && c < 8000) return 'A';
  if (v >= 65 && c < 4000) return 'A';
  if (v >= 65 && c < 12000) return 'B+';
  if (v >= 70 && c < 20000) return 'B+';
  if (v >= 55 && c < 5000) return 'B+';
  if (v >= 55 && c < 18000) return 'B';
  if (v >= 70) return 'B';
  if (v >= 45 && c < 8000) return 'C+';
  if (v >= 45 && c < 22000) return 'C';
  if (v >= 35 && c < 10000) return 'C+';
  if (v >= 35 && c < 28000) return 'C';
  if (v >= 25) return 'D';
  return 'E';
}

export function getScoreTextColor(score: OpportunityScore): string {
  const map: Record<OpportunityScore, string> = {
    'A+': 'text-emerald-400',
    'A': 'text-green-400',
    'B+': 'text-lime-400',
    'B': 'text-yellow-400',
    'C+': 'text-amber-400',
    'C': 'text-orange-400',
    'D': 'text-red-400',
    'E': 'text-red-600',
  };
  return map[score];
}

export function getScoreBadgeClasses(score: OpportunityScore): string {
  const map: Record<OpportunityScore, string> = {
    'A+': 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25',
    'A': 'bg-green-400/10 text-green-400 border-green-400/25',
    'B+': 'bg-lime-400/10 text-lime-400 border-lime-400/25',
    'B': 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',
    'C+': 'bg-amber-400/10 text-amber-400 border-amber-400/25',
    'C': 'bg-orange-400/10 text-orange-400 border-orange-400/25',
    'D': 'bg-red-400/10 text-red-400 border-red-400/25',
    'E': 'bg-red-600/10 text-red-500 border-red-600/25',
  };
  return map[score];
}

export function getScoreDescription(score: OpportunityScore): string {
  const map: Record<OpportunityScore, string> = {
    'A+': 'Opportunité exceptionnelle — Foncez !',
    'A': 'Très bonne opportunité',
    'B+': 'Bonne opportunité à saisir',
    'B': 'Opportunité correcte',
    'C+': 'Opportunité limitée',
    'C': 'Marché saturé',
    'D': 'Concurrence très forte',
    'E': 'Niche à éviter',
  };
  return map[score];
}

export function getVolumeLevelClasses(level: VolumeLevel): string {
  const map: Record<VolumeLevel, string> = {
    'Haut': 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25',
    'Moyen': 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25',
    'Bas': 'bg-red-400/10 text-red-400 border-red-400/25',
  };
  return map[level];
}

export function formatCompetition(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function estimateMonthlySales(bsr: number): number {
  if (bsr <= 0) return 0;
  const base = Math.round(480_000 / bsr);
  return Math.max(1, base);
}
