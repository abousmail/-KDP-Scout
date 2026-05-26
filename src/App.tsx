import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import KeywordResearch from './pages/KeywordResearch';
import NicheAnalysis from './pages/NicheAnalysis';
import History from './pages/History';
import AuthModal from './components/features/AuthModal';
import { useStore } from './store/useStore';

export default function App() {
  const { page, isAuthModalOpen } = useStore();

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
