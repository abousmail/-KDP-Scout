import { Search, BarChart3, BookMarked, Telescope, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Page } from '../../types';

const NAV_ITEMS: Array<{ page: Page; label: string; icon: typeof Search; description: string }> = [
  { page: 'keywords', label: 'Mots-Clés', icon: Search, description: 'Recherche & KPIs' },
  { page: 'niche', label: 'Analyse de Niche', icon: BarChart3, description: 'Top concurrents' },
  { page: 'history', label: 'Historique', icon: BookMarked, description: 'Favoris & historique' },
  { page: 'trends', label: 'Niches Tendances', icon: Zap, description: 'Niches rentables' },
];

export default function Sidebar() {
  const { page, setPage, dataSource } = useStore();

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800/60 flex flex-col h-screen">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Telescope className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">KDP Scout</span>
            <p className="text-slate-500 text-xs">Amazon KDP Tools</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {NAV_ITEMS.map(({ page: p, label, icon: Icon, description }) => {
          const active = page === p;
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                active ? 'bg-indigo-500/20' : 'bg-slate-800 group-hover:bg-slate-700'
              }`}>
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              </div>
              <div className="text-left">
                <div className={active ? 'text-indigo-300' : ''}>{label}</div>
                <div className="text-xs text-slate-600 font-normal">{description}</div>
              </div>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer — source indicator */}
      <div className="px-5 py-4 border-t border-slate-800/60">
        {dataSource === 'amazon' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400/80 text-xs">Amazon réel</span>
          </div>
        )}
        {dataSource === 'google' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400/80 text-xs">Google Suggest</span>
          </div>
        )}
        {dataSource === 'mock' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-slate-500 text-xs">Mode démo — données simulées</span>
          </div>
        )}
      </div>
    </aside>
  );
}
