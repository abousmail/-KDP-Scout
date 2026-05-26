import { Star, TrendingUp } from 'lucide-react';
import { KeywordResult } from '../../types';
import {
  getScoreBadgeClasses,
  getVolumeLevelClasses,
  formatCompetition,
} from '../../lib/scoring';
import { Badge } from '../ui/Badge';
import { useStore } from '../../store/useStore';

interface Props {
  keywords: KeywordResult[];
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800/60">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-4 py-3.5">
          <div className="skeleton h-4 rounded" style={{ width: `${60 + i * 7}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function KeywordTableSkeleton() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60 bg-slate-800/60">
            {['Mot-clé associé', 'Volume', 'Concurrence', 'Score', 'Favoris'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </tbody>
      </table>
    </div>
  );
}

export default function KeywordTable({ keywords }: Props) {
  const { toggleFavorite, market } = useStore();

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden animate-slide-up">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Mots-clés associés</h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
            {keywords.length}
          </span>
        </div>
        <p className="text-slate-600 text-xs">
          Cliquez sur ★ pour mettre en favoris
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 bg-slate-900/40">
              <th className="text-left px-5 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Mot-clé
              </th>
              <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Volume
              </th>
              <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Concurrence
              </th>
              <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Score
              </th>
              <th className="text-center px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Favori
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {keywords.map((kw, i) => (
              <tr
                key={i}
                className="hover:bg-slate-700/20 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <span className="text-slate-200 font-medium group-hover:text-white transition-colors">
                    {kw.keyword}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-700/60 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
                        style={{ width: `${kw.volumeScore}%` }}
                      />
                    </div>
                    <Badge className={getVolumeLevelClasses(kw.volumeLevel)}>
                      {kw.volumeLevel}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-slate-300 tabular-nums">
                    {formatCompetition(kw.competition)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <Badge className={getScoreBadgeClasses(kw.opportunityScore)}>
                    {kw.opportunityScore}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button
                    onClick={() => toggleFavorite({
                      keyword: kw.keyword,
                      volumeScore: kw.volumeScore,
                      competition: kw.competition,
                      opportunityScore: kw.opportunityScore,
                    })}
                    className={`transition-all duration-150 p-1.5 rounded-lg hover:bg-slate-700/60 ${
                      kw.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={kw.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={kw.isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30">
        <p className="text-slate-600 text-xs">
          Marché : <span className="text-slate-400">{market}</span> · Données simulées à titre indicatif
        </p>
      </div>
    </div>
  );
}
