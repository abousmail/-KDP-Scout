import { Market, KeywordResult } from '../types';
import { getVolumeLevel, calculateOpportunityScore } from './scoring';

export type DataSource = 'amazon' | 'google' | 'mock';

export interface SuggestionsResult {
  suggestions: string[];
  source: DataSource;
}

// ─── FNV-1a (deterministic variance, no Math.random) ─────────────────────────

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * Calls /api/suggestions (Vercel Edge proxy in production, Vite middleware in dev).
 * The proxy handles Amazon → Google fallback server-side, avoiding any CORS issue.
 * Throws on network/HTTP error — callers should catch and fall back to mock data.
 */
export async function fetchSuggestions(
  keyword: string,
  market: Market
): Promise<SuggestionsResult> {
  const params = new URLSearchParams({ keyword: keyword.trim(), market });
  const resp = await fetch(`/api/suggestions?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (!resp.ok) throw new Error(`/api/suggestions returned ${resp.status}`);

  const data = await resp.json() as { suggestions?: { value: string }[]; source?: string; error?: string };
  if (data.error && !data.suggestions?.length) throw new Error(data.error);

  const lower = keyword.toLowerCase().trim();
  const suggestions = (data.suggestions ?? [])
    .filter(s => s.value && s.value.toLowerCase().trim() !== lower)
    .map(s => s.value.trim())
    .slice(0, 10);

  return { suggestions, source: (data.source ?? 'amazon') as DataSource };
}

/**
 * Converts a suggestions list into KeywordResult[] with estimated volume/competition.
 * Amazon/Google sort by search frequency → position encodes volume rank.
 */
export function buildKeywordsFromSuggestions(
  suggestions: string[],
  mainCompetition: number
): KeywordResult[] {
  const n = suggestions.length;

  return suggestions.map((kw, i) => {
    const posWeight   = 1 - (i / Math.max(n - 1, 1)) * 0.55;
    const baseScore   = Math.round(40 + posWeight * 52);
    const variance    = (fnv1a(kw) % 17) - 8;
    const volumeScore = Math.max(20, Math.min(96, baseScore + variance));

    const compMult    = 0.45 + (i / Math.max(n - 1, 1)) * 1.55;
    const compNoise   = (fnv1a(kw + ':comp') % 2801) - 1400;
    const competition = Math.max(400, Math.round(mainCompetition * compMult) + compNoise);

    return {
      keyword: kw,
      volumeScore,
      volumeLevel: getVolumeLevel(volumeScore),
      competition,
      opportunityScore: calculateOpportunityScore(volumeScore, competition),
      isFavorite: false,
    };
  });
}
