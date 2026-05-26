import { Market, KeywordResult } from '../types';
import { getVolumeLevel, calculateOpportunityScore } from './scoring';

interface AmazonSuggestion {
  value: string;
  type?: string;
}

interface AmazonApiResponse {
  suggestions?: AmazonSuggestion[];
  error?: string;
}

// FNV-1a hash — deterministic variance, no Math.random()
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
 * Calls /api/suggestions (our Vercel Edge proxy) to get real Amazon autocomplete.
 * Throws on network error or API failure — callers should catch and fall back.
 */
export async function fetchAmazonSuggestions(
  keyword: string,
  market: Market
): Promise<string[]> {
  const params = new URLSearchParams({ keyword: keyword.trim(), market });
  const resp = await fetch(`/api/suggestions?${params}`, {
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) throw new Error(`/api/suggestions returned ${resp.status}`);

  const data: AmazonApiResponse = await resp.json();
  if (data.error) throw new Error(data.error);

  const lower = keyword.toLowerCase().trim();
  return (data.suggestions ?? [])
    .filter(s => s.value && s.value.toLowerCase().trim() !== lower)
    .map(s => s.value.trim())
    .slice(0, 10);
}

/**
 * Converts Amazon suggestion list into KeywordResult[] with estimated
 * volume / competition scores.
 *
 * Volume logic: Amazon autocomplete is sorted by search frequency, so
 * position 0 ≈ highest volume. We map that linearly to a 40-92 score
 * plus a small deterministic variance so two keywords always get the same
 * numbers on the same query.
 */
export function buildKeywordsFromSuggestions(
  suggestions: string[],
  mainCompetition: number
): KeywordResult[] {
  const n = suggestions.length;

  return suggestions.map((kw, i) => {
    // Earlier position → higher volume
    const posWeight  = 1 - (i / Math.max(n - 1, 1)) * 0.55;
    const baseScore  = Math.round(40 + posWeight * 52);
    const variance   = (fnv1a(kw) % 17) - 8;          // ±8 deterministic noise
    const volumeScore = Math.max(20, Math.min(96, baseScore + variance));

    // Competition grows with position (deeper = less popular = more niche)
    const compMult   = 0.45 + (i / Math.max(n - 1, 1)) * 1.55;
    const compNoise  = (fnv1a(kw + ':comp') % 2801) - 1400;
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
