import { BookOpen, TrendingDown, TrendingUp } from 'lucide-react';
import { CompetitorBook } from '../../types';

interface Props {
  books: CompetitorBook[];
  keyword: string;
}

function CoverPlaceholder({ color, rank }: { color: string; rank: number }) {
  return (
    <div className={`w-10 h-14 rounded-md bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0 relative`}>
      <BookOpen className="w-5 h-5 text-white/80" />
      {rank <= 3 && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
          <span className="text-[9px] font-black text-amber-900">{rank}</span>
        </div>
      )}
    </div>
  );
}

function SalesTrend({ sales }: { sales: number }) {
  const isGood = sales >= 100;
  return (
    <div className={`flex items-center gap-1 ${isGood ? 'text-emerald-400' : 'text-slate-400'}`}>
      {isGood ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      <span className="tabular-nums font-semibold">~{sales.toLocaleString('fr-FR')}</span>
      <span className="text-xs text-slate-500">/ mois</span>
    </div>
  );
}

export function CompetitorTableSkeleton() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60 bg-slate-800/60">
            {['#', 'Couverture', 'Titre & Auteur', 'Prix', 'BSR', 'Ventes estimées'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-4"><div className="skeleton h-4 w-4 rounded" /></td>
              <td className="px-4 py-4"><div className="skeleton w-10 h-14 rounded-md" /></td>
              <td className="px-4 py-4 space-y-2">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </td>
              <td className="px-4 py-4"><div className="skeleton h-4 w-14 rounded" /></td>
              <td className="px-4 py-4"><div className="skeleton h-4 w-16 rounded" /></td>
              <td className="px-4 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompetitorTable({ books, keyword }: Props) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden animate-slide-up">
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Top 5 concurrents
          </h3>
          <span className="text-slate-600 text-sm">·</span>
          <span className="text-indigo-400 text-sm font-medium">"{keyword}"</span>
        </div>
        <p className="text-slate-500 text-xs mt-1">
          Livres les mieux classés — BSR et ventes estimées
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 bg-slate-900/40">
              <th className="text-left px-5 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider w-10">
                #
              </th>
              <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider w-16">
                Cover
              </th>
              <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Titre & Auteur
              </th>
              <th className="text-right px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Prix
              </th>
              <th className="text-right px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                BSR
              </th>
              <th className="text-right px-5 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Ventes est.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {books.map((book) => (
              <tr key={book.rank} className="hover:bg-slate-700/20 transition-colors group">
                <td className="px-5 py-4">
                  <span className={`text-lg font-black tabular-nums ${
                    book.rank === 1 ? 'text-amber-400' :
                    book.rank === 2 ? 'text-slate-300' :
                    book.rank === 3 ? 'text-amber-600' :
                    'text-slate-600'
                  }`}>
                    {book.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <CoverPlaceholder color={book.coverColor} rank={book.rank} />
                </td>
                <td className="px-4 py-4 max-w-[260px]">
                  <p className="text-slate-200 font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {book.title}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">{book.author}</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-slate-200 font-semibold tabular-nums">
                    {book.price.toFixed(2)} €
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="text-right">
                    <span className="text-slate-300 tabular-nums font-mono text-xs">
                      #{book.bsr.toLocaleString('fr-FR')}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <SalesTrend sales={book.monthlySales} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30">
        <p className="text-slate-600 text-xs">
          BSR = Book Sellers Rank · Ventes estimées basées sur le BSR (formule indicative)
        </p>
      </div>
    </div>
  );
}
