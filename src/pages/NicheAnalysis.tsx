import { BarChart3, ArrowRight } from 'lucide-react';
import CompetitorTable, { CompetitorTableSkeleton } from '../components/features/CompetitorTable';
import { EmptyState } from '../components/ui/EmptyState';
import { useStore } from '../store/useStore';
import { getScoreBadgeClasses, getScoreDescription } from '../lib/scoring';
import { Badge } from '../components/ui/Badge';

export default function NicheAnalysis() {
  const { searchData, competitors, isSearching, setPage } = useStore();

  if (!searchData && !isSearching) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <EmptyState
          icon={BarChart3}
          title="Aucun mot-clé analysé"
          description="Effectuez d'abord une recherche sur la page Mots-Clés pour voir l'analyse de niche correspondante."
          action={
            <button
              onClick={() => setPage('keywords')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/25"
            >
              Aller à la recherche
              <ArrowRight className="w-4 h-4" />
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Summary header */}
      {searchData && !isSearching && (
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 animate-fade-in">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
              Analyse de niche pour
            </p>
            <h2 className="text-xl font-bold text-white">
              "{searchData.keyword}"
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">{searchData.market}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-1">Volume</p>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-slate-700/60 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
                    style={{ width: `${searchData.volumeScore}%` }}
                  />
                </div>
                <span className="text-slate-200 font-semibold text-sm tabular-nums">
                  {searchData.volumeScore}/100
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-1">Concurrence</p>
              <span className="text-slate-200 font-semibold text-sm">
                {searchData.competition >= 1_000
                  ? `${(searchData.competition / 1_000).toFixed(1)}k`
                  : searchData.competition}
              </span>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-1">Score</p>
              <Badge className={getScoreBadgeClasses(searchData.opportunityScore)}>
                {searchData.opportunityScore}
              </Badge>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
              <p className="text-indigo-300 text-xs font-medium">
                💡 {getScoreDescription(searchData.opportunityScore)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Competitor table */}
      {isSearching ? (
        <CompetitorTableSkeleton />
      ) : competitors.length > 0 ? (
        <CompetitorTable books={competitors} keyword={searchData!.keyword} />
      ) : null}

      {/* Tips */}
      {!isSearching && competitors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          {[
            {
              icon: '💰',
              title: 'Prix moyen',
              value: `$${(competitors.reduce((s, b) => s + b.price, 0) / competitors.length).toFixed(2)}`,
              sub: 'Top 5 concurrents',
            },
            {
              icon: '📈',
              title: 'BSR médian',
              value: `#${Math.round(competitors.sort((a, b) => a.bsr - b.bsr)[Math.floor(competitors.length / 2)]?.bsr ?? 0).toLocaleString('fr-FR')}`,
              sub: 'Position médiane',
            },
            {
              icon: '🛒',
              title: 'Ventes totales',
              value: `~${competitors.reduce((s, b) => s + b.monthlySales, 0).toLocaleString('fr-FR')} / mois`,
              sub: 'Cumul top 5',
            },
          ].map(({ icon, title, value, sub }) => (
            <div key={title} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-slate-500 text-xs">{title}</p>
                <p className="text-white font-bold text-lg">{value}</p>
                <p className="text-slate-600 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
