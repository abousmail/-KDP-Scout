import { Search, Loader2 } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useStore } from '../../store/useStore';
import { Market } from '../../types';

const MARKETS: Array<{ value: Market; label: string; flag: string }> = [
  { value: 'amazon.com', label: 'Amazon.com', flag: '🇺🇸' },
  { value: 'amazon.fr', label: 'Amazon.fr', flag: '🇫🇷' },
  { value: 'amazon.co.uk', label: 'Amazon.co.uk', flag: '🇬🇧' },
];

export default function SearchBar() {
  const { search, market, setMarket, isSearching, searchQuery } = useStore();
  const [input, setInput] = useState(searchQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSearching) search(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        {/* Market selector */}
        <div className="relative">
          <select
            value={market}
            onChange={e => setMarket(e.target.value as Market)}
            className="h-12 pl-3 pr-8 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-200 text-sm font-medium appearance-none cursor-pointer hover:border-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-colors min-w-[140px]"
          >
            {MARKETS.map(m => (
              <option key={m.value} value={m.value}>
                {m.flag} {m.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Ex : "carnet de note", "coloriage enfant", "journal de bord"'
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSearching || !input.trim()}
          className="h-12 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-150 flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyse...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Analyser</span>
            </>
          )}
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-slate-600 text-xs">Essayez :</span>
        {['carnet de note', 'coloriage enfant', 'journal de bord', 'livre de recettes'].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => { setInput(s); if (!isSearching) search(s); }}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  );
}
