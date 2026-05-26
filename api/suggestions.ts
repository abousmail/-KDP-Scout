export const config = { runtime: 'edge' };

const MARKET_CONFIG: Record<string, { baseUrl: string; lop: string; lang: string }> = {
  'amazon.fr':    { baseUrl: 'https://completion.amazon.fr',    lop: 'fr_FR', lang: 'fr-FR,fr;q=0.9' },
  'amazon.com':   { baseUrl: 'https://completion.amazon.com',   lop: 'en_US', lang: 'en-US,en;q=0.9' },
  'amazon.co.uk': { baseUrl: 'https://completion.amazon.co.uk', lop: 'en_GB', lang: 'en-GB,en;q=0.9' },
};

export default async function handler(request: Request): Promise<Response> {
  // Handle CORS preflight
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
  const market  = searchParams.get('market') || 'amazon.fr';

  if (!keyword) {
    return jsonResponse({ error: 'keyword is required' }, 400);
  }

  const cfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['amazon.fr'];

  const params = new URLSearchParams({
    limit: '11',
    prefix: keyword,
    'suggestion-type': 'WIDGET',
    'page-type': 'Gateway',
    lop: cfg.lop,
    'site-variant': 'desktop',
    'customer-id': '',
    'request-id': '',
    'session-id': '',
    'device-type': 'web',
    'client-info': 'amazon-search-ui',
  });

  const amazonUrl = `${cfg.baseUrl}/api/2017/suggestions?${params}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const resp = await fetch(amazonUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': cfg.lang,
        'Origin':  `https://www.${market}`,
        'Referer': `https://www.${market}/`,
      },
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return jsonResponse({ error: `Amazon API returned ${resp.status}`, suggestions: [] }, 502);
    }

    const data = await resp.json() as unknown;

    return jsonResponse(data, 200, {
      'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const aborted = err instanceof Error && err.name === 'AbortError';
    return jsonResponse(
      { error: aborted ? 'Amazon API timeout' : 'Failed to fetch suggestions', suggestions: [] },
      aborted ? 504 : 502
    );
  }
}

function jsonResponse(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extra,
    },
  });
}
