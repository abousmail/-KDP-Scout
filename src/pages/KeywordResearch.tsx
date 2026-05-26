import { Sparkles } from 'lucide-react';
import SearchBar from '../components/features/SearchBar';
import KPICards, { KPICardsSkeleton } from '../components/features/KPICards';
import KeywordTable, { KeywordTableSkeleton } from '../components/features/KeywordTable';
import { useStore } from '../store/useStore';

function WelcomeHero() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10">
        <Sparkles className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">
        Trouvez votre prochaine niche KDP
      </h2>
      <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-8">
        Entrez un mot-clé dans la barre ci-dessus pour analyser son potentiel sur Amazon KDP —
        volume de recherche, niveau de concurrence et score d'opportunité calculés instantanément.
      </p>
      <div className="grid grid-cols-3 gap-6 text-center">
        {[
          { icon: '📊', label: 'Score de volume', desc: 'Indice 0–100' },
          { icon: '🎯', label: 'Concurrence', desc: 'Nbre de résultats' },
          { icon: '💡', label: 'Opportunité', desc: 'Note de A+ à E' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{icon}</span>
            <span className="text-slate-300 text-xs font-semibold">{label}</span>
            <span className="text-slate-600 text-xs">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KeywordResearch() {
  const { searchData, isSearching } = useStore();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Search bar */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-5">
        <SearchBar />
      </div>

      {/* Content */}
      {isSearching ? (
        <div className="space-y-6 animate-pulse">
          <KPICardsSkeleton />
          <KeywordTableSkeleton />
        </div>
      ) : searchData ? (
        <div className="space-y-6">
          <KPICards data={searchData} />
          <KeywordTable keywords={searchData.relatedKeywords} />
        </div>
      ) : (
        <WelcomeHero />
      )}
    </div>
  );
}
