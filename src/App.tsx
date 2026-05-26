import { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import KeywordResearch from './pages/KeywordResearch';
import NicheAnalysis from './pages/NicheAnalysis';
import History from './pages/History';
import AuthModal from './components/features/AuthModal';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';

export default function App() {
  const { page, isAuthModalOpen, setUser } = useStore();

  // Sync Supabase auth state on mount and on changes
  useEffect(() => {
    // Restore session that may already exist (e.g. after page reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!.split('@')[0],
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!.split('@')[0],
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/50">
          <div key={page} className="animate-fade-in">
            {page === 'keywords' && <KeywordResearch />}
            {page === 'niche' && <NicheAnalysis />}
            {page === 'history' && <History />}
          </div>
        </main>
      </div>

      {isAuthModalOpen && <AuthModal />}
    </div>
  );
}
