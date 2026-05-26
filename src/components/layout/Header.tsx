import { LogIn, LogOut, ChevronDown, Telescope } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  keywords: { title: 'Recherche de Mots-Clés', subtitle: 'Analyse du volume et de la concurrence KDP' },
  niche: { title: 'Analyse de Niche', subtitle: 'Top concurrents pour votre mot-clé' },
  history: { title: 'Historique & Favoris', subtitle: 'Vos recherches sauvegardées' },
};

export default function Header() {
  const { page, user, setIsAuthModalOpen, logout } = useStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { title, subtitle } = PAGE_TITLES[page] ?? PAGE_TITLES.keywords;

  return (
    <header className="h-16 shrink-0 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-6 relative z-10">
      <div>
        <h1 className="text-white font-semibold text-base">{title}</h1>
        <p className="text-slate-500 text-xs">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Market badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
          <Telescope className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-300 text-xs font-medium">KDP Scout v0.1</span>
        </div>

        {/* Auth button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-colors text-sm text-slate-300"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-700/60">
                  <p className="text-xs text-slate-500">Connecté en tant que</p>
                  <p className="text-sm text-slate-200 font-medium truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-white text-sm font-medium shadow-lg shadow-indigo-500/25"
          >
            <LogIn className="w-4 h-4" />
            <span>Connexion</span>
          </button>
        )}
      </div>
    </header>
  );
}
