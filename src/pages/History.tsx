import { Clock, Star, Trash2, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { getScoreBadgeClasses } from '../lib/scoring';

const MARKET_FLAGS: Record<string, string> = {
  'amazon.fr': '🇫🇷',
  'amazon.com': '🇺🇸',
  'amazon.co.uk': '🇬🇧',
};

function timeAgo(date: Date): string {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function History() {
  const {
    historyTab, setHistoryTab,
    history, favorites,
    removeFromHistory, clearHistory,
    search, setPage,
    toggleFavorite,
  } = useStore();

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 w-fit">
        <button
          onClick={() => setHistoryTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            historyTab === 'history'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          Historique
          {history.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
              {history.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setHistoryTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            historyTab === 'favorites'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Star className="w-4 h-4" />
          Favoris
          {favorites.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
              {favorites.length}
            </span>
          )}
        </button>
      </div>

      {/* History tab */}
      {historyTab === 'history' && (
        <>
          {history.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucun historique"
              description="Vos recherches passées apparaîtront ici. Lancez votre première recherche !"
              action={
                <button
                  onClick={() => setPage('keywords')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
                >
                  <Search className="w-4 h-4" /> Rechercher un mot-clé
                </button>
              }
            />
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-xs">{history.length} recherche{history.length > 1 ? 's' : ''}</p>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Tout effacer
                </button>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                {history.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-700/20 transition-colors group ${
                      i < history.length - 1 ? 'border-b border-slate-800/60' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                      <Search className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 font-medium text-sm truncate group-hover:text-white transition-colors">
                        {item.keyword}
                      </p>
                      <p className="text-slate-600 text-xs">
                        {MARKET_FLAGS[item.market]} {item.market} · {timeAgo(item.searchedAt)}
                      </p>
                    </div>
                    <Badge className={getScoreBadgeClasses(item.opportunityScore)}>
                      {item.opportunityScore}
                    </Badge>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { search(item.keyword); setPage('keywords'); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="Relancer la recherche"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromHistory(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Favorites tab */}
      {historyTab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <EmptyState
              icon={Star}
              title="Aucun favori"
              description="Ajoutez des mots-clés en favoris depuis le tableau de la page Recherche en cliquant sur l'étoile ★."
              action={
                <button
                  onClick={() => setPage('keywords')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
                >
                  <Star className="w-4 h-4" /> Trouver des mots-clés
                </button>
              }
            />
          ) : (
            <div className="space-y-3 animate-fade-in">
              <p className="text-slate-500 text-xs">{favorites.length} favori{favorites.length > 1 ? 's' : ''}</p>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60 bg-slate-900/40">
                      {['Mot-clé', 'Volume', 'Concurrence', 'Score', 'Marché', 'Sauvegardé', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {favorites.map((fav) => (
                      <tr key={fav.keyword + fav.market} className="hover:bg-slate-700/20 transition-colors group">
                        <td className="px-4 py-3.5">
                          <span className="text-slate-200 font-medium group-hover:text-white transition-colors">
                            {fav.keyword}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-400 tabular-nums text-sm">{fav.volumeScore}/100</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-400 tabular-nums text-sm">
                            {fav.competition >= 1_000
                              ? `${(fav.competition / 1_000).toFixed(1)}k`
                              : fav.competition}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={getScoreBadgeClasses(fav.opportunityScore)}>
                            {fav.opportunityScore}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-500 text-xs">
                            {MARKET_FLAGS[fav.market]} {fav.market}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-600 text-xs">{timeAgo(fav.savedAt)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { search(fav.keyword); setPage('keywords'); }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                              title="Relancer la recherche"
                            >
                              <Search className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleFavorite({
                                keyword: fav.keyword,
                                volumeScore: fav.volumeScore,
                                competition: fav.competition,
                                opportunityScore: fav.opportunityScore,
                              })}
                              className="p-1.5 rounded-lg text-amber-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Retirer des favoris"
                            >
                              <Star className="w-3.5 h-3.5" fill="currentColor" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
