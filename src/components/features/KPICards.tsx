import { TrendingUp, Users, Target } from 'lucide-react';
import { SearchData } from '../../types';
import {
  getVolumeLevelClasses,
  getScoreBadgeClasses,
  getScoreTextColor,
  getScoreDescription,
} from '../../lib/scoring';
import { Badge } from '../ui/Badge';

interface Props {
  data: SearchData;
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-3">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-8 w-32 rounded" />
      <div className="skeleton h-4 w-16 rounded-full" />
      <div className="skeleton h-2 w-full rounded" />
    </div>
  );
}

export function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export default function KPICards({ data }: Props) {
  const { volumeScore, volumeLevel, competition, opportunityScore, market } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
      {/* Volume de recherche */}
      <div className="relative overflow-hidden bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/60 transition-colors group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <Badge className={getVolumeLevelClasses(volumeLevel)}>
            {volumeLevel}
          </Badge>
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          Volume de Recherche
        </p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-white">{volumeScore}</span>
          <span className="text-slate-500 text-sm">/100</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${volumeScore}%` }}
          />
        </div>
      </div>

      {/* Concurrence */}
      <div className="relative overflow-hidden bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/60 transition-colors group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          <Badge className={
            competition < 5_000
              ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25'
              : competition < 20_000
              ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25'
              : 'bg-red-400/10 text-red-400 border-red-400/25'
          }>
            {competition < 5_000 ? 'Faible' : competition < 20_000 ? 'Moyen' : 'Fort'}
          </Badge>
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          Concurrence
        </p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-white">
            {competition >= 1_000 ? `${(competition / 1_000).toFixed(1)}k` : competition}
          </span>
        </div>
        <p className="text-slate-500 text-xs">résultats sur {market}</p>
      </div>

      {/* Score Opportunité */}
      <div className="relative overflow-hidden bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/60 transition-colors group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          Score Opportunité KDP
        </p>
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-4xl font-black ${getScoreTextColor(opportunityScore)}`}>
            {opportunityScore}
          </span>
          <Badge className={getScoreBadgeClasses(opportunityScore)}>
            {opportunityScore}
          </Badge>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          {getScoreDescription(opportunityScore)}
        </p>
      </div>
    </div>
  );
}
