import { useState } from 'react';
import { Zap, TrendingUp, Minus, ArrowRight, Flame, Filter } from 'lucide-react';
import { TRENDING_NICHES, CATEGORIES } from '../lib/trendingNiches';
import { TrendingNiche, Difficulty, Trend } from '../types/niches';
import { getScoreTextColor } from '../lib/scoring';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyClasses(d: Difficulty): string {
  return {
    Facile: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25',
    Moyen:  'bg-amber-400/10 text-amber-400 border-amber-400/25',
    Dur:    'bg-red-400/10 text-red-400 border-red-400/25',
  }[d];
}

function TrendBadge({ trend }: { trend: Trend }) {
  if (trend === 'hot') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
      <Flame className="w-3 h-3" />
      Tendance
    </span>
  );
  if (trend === 'up') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
      <TrendingUp className="w-3 h-3" />
      En hausse
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/60 border border-slate-600/30 text-slate-400 text-xs">
      <Minus className="w-3 h-3" />
      Stable
    </span>
  );
}

// ─── Niche card ────────────────────────────────────────────────────────────────

function NicheCard({ niche, onAnalyze }: { niche: TrendingNiche; onAnalyze: (kw: string) => void }) {
  return (
    <div className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-700/60 flex items-center justify-center text-2xl shrink-0">
            {niche.emoji}
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">{niche.category}</p>
            <h3 className="text-white font-bold text-base leading-tight">{niche.title}</h3>
            <p className="text-slate-500 text-xs">{niche.subtitle}</p>
          </div>
        </div>
        <TrendBadge trend={niche.trend} />
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed">{niche.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {niche.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-lg bg-slate-700/50 text-slate-500 text-xs">
            #{tag}
          </span>
        ))}
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge className={difficultyClasses(niche.difficulty)}>
          {niche.difficulty}
        </Badge>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-700/60 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
              style={{ width: `${niche.volumeScore}%` }}
            />
          </div>
          <span className="text-slate-400 text-xs">Volume {niche.volumeLevel}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xl font-black ${getScoreTextColor(niche.opportunityScore)}`}>
            {niche.opportunityScore}
          </span>
          <span className="text-slate-600 text-xs">{niche.monthlySearches}/mois</span>
        </div>
      </div>

      {/* Divider + CTA */}
      <div className="pt-1 border-t border-slate-700/50">
        <button
          onClick={() => onAnalyze(niche.keyword)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-all duration-150"
        >
          Analyser cette niche
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrendingNiches() {
  const { search, setPage } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? TRENDING_NICHES.filter(n => n.category === activeCategory)
    : TRENDING_NICHES;

  const handleAnalyze = (keyword: string) => {
    search(keyword);
    setPage('keywords');
  };

  // Counts per difficulty for the stats bar
  const counts = {
    Facile: TRENDING_NICHES.filter(n => n.difficulty === 'Facile').length,
    Moyen:  TRENDING_NICHES.filter(n => n.difficulty === 'Moyen').length,
    Dur:    TRENDING_NICHES.filter(n => n.difficulty === 'Dur').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Hero header */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-slate-800/30 to-violet-500/5 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">
                Sélection manuelle · Mis à jour en 2025
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Niches KDP à fort potentiel
            </h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Niches sélectionnées selon leur ratio volume / concurrence sur Amazon KDP.
              Cliquez sur une niche pour lancer l'analyse complète automatiquement.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4">
            {([['Facile', 'text-emerald-400'], ['Moyen', 'text-amber-400'], ['Dur', 'text-red-400']] as const).map(([d, cls]) => (
              <div key={d} className="text-center">
                <p className={`text-2xl font-black ${cls}`}>{counts[d]}</p>
                <p className="text-slate-500 text-xs">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            !activeCategory
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-slate-200'
          }`}
        >
          Toutes ({TRENDING_NICHES.length})
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === cat
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
        {filtered.map(niche => (
          <NicheCard key={niche.id} niche={niche} onAnalyze={handleAnalyze} />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-slate-600 text-xs text-center pb-2">
        Les scores de volume et d'opportunité sont des estimations basées sur des données Amazon KDP publiques.
        Cliquez sur "Analyser" pour obtenir les vraies suggestions Amazon en temps réel.
      </p>
    </div>
  );
}
