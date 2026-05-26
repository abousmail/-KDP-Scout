import { Market, KeywordResult } from '../types';
import { getVolumeLevel, calculateOpportunityScore } from './scoring';

export type DataSource = 'amazon' | 'google' | 'mock';

export interface SuggestionsResult {
  suggestions: string[];
  source: DataSource;
}

interface RawSuggestion { value: string }

// ─── Market config ────────────────────────────────────────────────────────────

const MARKET_CONFIG: Record<Market, { baseUrl: string; lop: string; lang: string; hl: string; host: string }> = {
  'amazon.fr':    { baseUrl: 'https://completion.amazon.fr',    lop: 'fr_FR', lang: 'fr-FR,fr;q=0.9', hl: 'fr', host: 'www.amazon.fr'    },
  'amazon.com':   { baseUrl: 'https://completion.amazon.com',   lop: 'en_US', lang: 'en-US,en;q=0.9', hl: 'en', host: 'www.amazon.com'   },
  'amazon.co.uk': { baseUrl: 'https://completion.amazon.co.uk', lop: 'en_GB', lang: 'en-GB,en;q=0.9', hl: 'en', host: 'www.amazon.co.uk' },
};

// ─── FNV-1a (deterministic variance, no Math.random) ─────────────────────────

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// ─── Direct browser fetches ───────────────────────────────────────────────────

async function tryAmazon(keyword: string, market: Market): Promise<RawSuggestion[]> {
  const cfg = MARKET_CONFIG[market];
  const params = new URLSearchParams({
    limit: '11',
    prefix: keyword,
    'suggestion-type': 'WIDGET',
    'page-type': 'Search',
    lop: cfg.lop,
    'site-variant': 'desktop',
    'client-info': 'amazon-search-ui',
  });

  try {
    const resp = await fetch(`${cfg.baseUrl}/api/2017/suggestions?${params}`, {
      headers: {
        'Accept':           'application/json, text/javascript, */*; q=0.01',
        'Accept-Language':  cfg.lang,
        'Referer':          `https://${cfg.host}/`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return [];
    const data = await resp.json() as { suggestions?: RawSuggestion[] };
    return data.suggestions?.filter(s => s?.value) ?? [];
  } catch {
    return [];
  }
}

async function tryGoogle(keyword: string, market: Market): Promise<RawSuggestion[]> {
  const { hl } = MARKET_CONFIG[market];
  const params = new URLSearchParams({ client: 'firefox', q: keyword, hl });

  try {
    const resp = await fetch(`https://suggestqueries.google.com/complete/search?${params}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!resp.ok) return [];
    const data = await resp.json() as unknown[];
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return (data[1] as string[]).map(v => ({ value: v }));
    }
    return [];
  } catch {
    return [];
  }
}

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * Calls Amazon autocomplete directly from the browser (requires Allow-CORS extension
 * or a permissive browser environment). Falls back to Google Suggest if Amazon is empty.
 * Throws on total failure — callers should catch and fall back to mock data.
 */
export async function fetchSuggestions(
  keyword: string,
  market: Market
): Promise<SuggestionsResult> {
  const kw = keyword.trim();

  let raw = await tryAmazon(kw, market);
  let source: DataSource = 'amazon';

  if (!raw.length) {
    raw = await tryGoogle(kw, market);
    source = 'google';
  }

  if (!raw.length) throw new Error('Both Amazon and Google returned no suggestions');

  const lower = kw.toLowerCase();
  const suggestions = raw
    .filter(s => s.value.toLowerCase().trim() !== lower)
    .map(s => s.value.trim())
    .slice(0, 10);

  return { suggestions, source };
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
