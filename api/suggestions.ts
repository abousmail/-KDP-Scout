export const config = { runtime: 'edge' };

type MarketCfg = { baseUrl: string; lop: string; lang: string; hl: string; host: string };

const MARKET_CONFIG: Record<string, MarketCfg> = {
  'amazon.fr':    { baseUrl: 'https://completion.amazon.fr',    lop: 'fr_FR', lang: 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7', hl: 'fr', host: 'www.amazon.fr'    },
  'amazon.com':   { baseUrl: 'https://completion.amazon.com',   lop: 'en_US', lang: 'en-US,en;q=0.9',                       hl: 'en', host: 'www.amazon.com'   },
  'amazon.co.uk': { baseUrl: 'https://completion.amazon.co.uk', lop: 'en_GB', lang: 'en-GB,en;q=0.9',                       hl: 'en', host: 'www.amazon.co.uk' },
};

interface Suggestion { value: string }

// ─── Amazon autocomplete ──────────────────────────────────────────────────────

async function tryAmazon(keyword: string, cfg: MarketCfg): Promise<Suggestion[]> {
  // Minimal, clean params — empty values trigger bot-detection
  const params = new URLSearchParams({
    limit: '11',
    prefix: keyword,
    'suggestion-type': 'WIDGET',
    'page-type': 'Search',          // was "Gateway" — caused empty results
    lop: cfg.lop,
    'site-variant': 'desktop',
    'client-info': 'amazon-search-ui',
  });

  const url = `${cfg.baseUrl}/api/2017/suggestions?${params}`;

  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 5000);

  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent':        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':            'application/json, text/javascript, */*; q=0.01',
        'Accept-Language':   cfg.lang,
        'Referer':           `https://${cfg.host}/`,
        'Origin':            `https://${cfg.host}`,
        'X-Requested-With':  'XMLHttpRequest',
        'Sec-Fetch-Dest':    'empty',
        'Sec-Fetch-Mode':    'cors',
        'Sec-Fetch-Site':    'same-site',
      },
    });
    clearTimeout(tid);

    if (!resp.ok) return [];

    const data = await resp.json() as { suggestions?: Suggestion[] };
    return (data.suggestions ?? []).filter(s => s?.value);
  } catch {
    clearTimeout(tid);
    return [];
  }
}

// ─── Google Suggest fallback ──────────────────────────────────────────────────
// Returns JSON: ["query", ["sug1","sug2",...], [...], {...}]

async function tryGoogle(keyword: string, hl: string): Promise<Suggestion[]> {
  const params = new URLSearchParams({ client: 'firefox', q: keyword, hl });
  const url = `https://suggestqueries.google.com/complete/search?${params}`;

  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 4000);

  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(tid);

    if (!resp.ok) return [];

    // Shape: ["query", ["sug1", "sug2", ...], ...]
    const data = await resp.json() as unknown[];
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return (data[1] as string[]).map(value => ({ value }));
    }
    return [];
  } catch {
    clearTimeout(tid);
    return [];
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword')?.trim();
  const market  = searchParams.get('market') ?? 'amazon.fr';

  if (!keyword) return json({ error: 'keyword is required' }, 400);

  const cfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['amazon.fr'];

  // 1st try: Amazon
  let suggestions = await tryAmazon(keyword, cfg);
  let source: 'amazon' | 'google' = 'amazon';

  // 2nd try: Google if Amazon returned nothing
  if (suggestions.length === 0) {
    suggestions = await tryGoogle(keyword, cfg.hl);
    source = 'google';
  }

  return json({ suggestions, source }, 200, {
    'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
  });
}

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', ...extra },
  });
}
