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
  const params = new URLSearchParams({
    limit: '11',
    prefix: keyword,
    'suggestion-type': 'WIDGET',
    'page-type': 'Search',
    lop: cfg.lop,
    'site-variant': 'desktop',
    'client-info': 'amazon-search-ui',
  });

  const url = `${cfg.baseUrl}/api/2017/suggestions?${params}`;
  console.log(`[Amazon] → GET ${url}`);

  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 5000);

  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':           'application/json, text/javascript, */*; q=0.01',
        'Accept-Language':  'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding':  'gzip, deflate, br',
        'Referer':          `https://${cfg.host}/`,
        'Origin':           `https://${cfg.host}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Dest':   'empty',
        'Sec-Fetch-Mode':   'cors',
        'Sec-Fetch-Site':   'same-site',
        'Connection':       'keep-alive',
      },
    });
    clearTimeout(tid);

    if (!resp.ok) {
      const body = await resp.text().catch(() => '(unreadable)');
      console.error(`[Amazon] ❌ HTTP ${resp.status} ${resp.statusText} for "${keyword}"`);
      console.error(`[Amazon] Response body: ${body.slice(0, 500)}`);
      console.error(`[Amazon] Response headers: ${JSON.stringify(Object.fromEntries(resp.headers))}`);
      return [];
    }

    const data = await resp.json() as { suggestions?: Suggestion[] };
    const results = (data.suggestions ?? []).filter(s => s?.value);
    console.log(`[Amazon] ✅ ${results.length} suggestions for "${keyword}"`);
    return results;
  } catch (e) {
    clearTimeout(tid);
    console.error(`[Amazon] ❌ Fetch exception for "${keyword}":`, e instanceof Error ? e.message : String(e));
    return [];
  }
}

// ─── Google Suggest fallback ──────────────────────────────────────────────────
// Returns JSON: ["query", ["sug1","sug2",...], [...], {...}]

async function tryGoogle(keyword: string, hl: string): Promise<Suggestion[]> {
  const params = new URLSearchParams({ client: 'firefox', q: keyword, hl });
  const url = `https://suggestqueries.google.com/complete/search?${params}`;
  console.log(`[Google] → GET ${url}`);

  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 4000);

  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(tid);

    if (!resp.ok) {
      const body = await resp.text().catch(() => '(unreadable)');
      console.error(`[Google] ❌ HTTP ${resp.status} ${resp.statusText} for "${keyword}"`);
      console.error(`[Google] Response body: ${body.slice(0, 300)}`);
      return [];
    }

    const data = await resp.json() as unknown[];
    if (Array.isArray(data) && Array.isArray(data[1])) {
      const results = (data[1] as string[]).map(value => ({ value }));
      console.log(`[Google] ✅ ${results.length} suggestions for "${keyword}"`);
      return results;
    }
    console.warn(`[Google] ⚠️  Unexpected response shape for "${keyword}"`);
    return [];
  } catch (e) {
    clearTimeout(tid);
    console.error(`[Google] ❌ Fetch exception for "${keyword}":`, e instanceof Error ? e.message : String(e));
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
  const market  = searchParams.get('market') ?? 'amazon.com';

  if (!keyword) return json({ error: 'keyword is required' }, 400);

  const cfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['amazon.com'];
  console.log(`\n[suggestions] keyword="${keyword}" market=${market}`);

  // 1st try: Amazon
  let suggestions = await tryAmazon(keyword, cfg);
  let source: 'amazon' | 'google' = 'amazon';

  // 2nd try: Google if Amazon returned nothing
  if (suggestions.length === 0) {
    console.log(`[suggestions] Amazon returned 0 → trying Google fallback`);
    suggestions = await tryGoogle(keyword, cfg.hl);
    source = 'google';
  }

  console.log(`[suggestions] Final: source=${source} count=${suggestions.length}`);

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
