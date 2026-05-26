import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// ─── Market config (mirrors /api/suggestions.ts for local dev) ───────────────
type MarketCfg = { baseUrl: string; lop: string; lang: string; hl: string; host: string };

const MARKET_CONFIG: Record<string, MarketCfg> = {
  'amazon.fr':    { baseUrl: 'https://completion.amazon.fr',    lop: 'fr_FR', lang: 'fr-FR,fr;q=0.9', hl: 'fr', host: 'www.amazon.fr'    },
  'amazon.com':   { baseUrl: 'https://completion.amazon.com',   lop: 'en_US', lang: 'en-US,en;q=0.9', hl: 'en', host: 'www.amazon.com'   },
  'amazon.co.uk': { baseUrl: 'https://completion.amazon.co.uk', lop: 'en_GB', lang: 'en-GB,en;q=0.9', hl: 'en', host: 'www.amazon.co.uk' },
};

interface Suggestion { value: string }

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

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':           'application/json, text/javascript, */*; q=0.01',
        'Accept-Language':  cfg.lang,
        'Referer':          `https://${cfg.host}/`,
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Dest':   'empty',
        'Sec-Fetch-Mode':   'cors',
        'Sec-Fetch-Site':   'same-site',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!resp.ok) {
      console.error(`  [dev-api] ❌ Amazon HTTP ${resp.status} for "${keyword}" — ${url}`);
      return [];
    }

    const data = await resp.json() as { suggestions?: Suggestion[] };
    const results = data.suggestions?.filter(s => s?.value) ?? [];
    console.log(`  [dev-api] ✅ Amazon → ${results.length} suggestions for "${keyword}"`);
    return results;
  } catch (e) {
    console.error(`  [dev-api] ❌ Amazon fetch error for "${keyword}":`, e instanceof Error ? e.message : String(e));
    return [];
  }
}

async function tryGoogle(keyword: string, hl: string): Promise<Suggestion[]> {
  const params = new URLSearchParams({ client: 'firefox', q: keyword, hl });
  const url = `https://suggestqueries.google.com/complete/search?${params}`;

  try {
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (!resp.ok) {
      console.error(`  [dev-api] ❌ Google HTTP ${resp.status} for "${keyword}"`);
      return [];
    }

    const data = await resp.json() as unknown[];
    if (Array.isArray(data) && Array.isArray(data[1])) {
      const results = (data[1] as string[]).map(v => ({ value: v }));
      console.log(`  [dev-api] ✅ Google → ${results.length} suggestions for "${keyword}"`);
      return results;
    }
    return [];
  } catch (e) {
    console.error(`  [dev-api] ❌ Google fetch error for "${keyword}":`, e instanceof Error ? e.message : String(e));
    return [];
  }
}

// ─── Vite plugin: handles /api/suggestions during local dev ──────────────────
// In production, Vercel routes this to /api/suggestions.ts (Edge function).
// In dev (npm run dev), this middleware runs inside the Vite Node.js server
// so there is NO CORS issue — the request to Amazon is server-to-server.
function devApiPlugin(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(
        '/api/suggestions',
        // Use loose types to avoid requiring @types/node
        async (req: { url?: string }, res: { setHeader(k: string, v: string): void; statusCode: number; end(s: string): void }) => {
          const raw = req.url ?? '';
          const qi  = raw.indexOf('?');
          const qs  = qi >= 0 ? raw.slice(qi + 1) : '';
          const sp  = new URLSearchParams(qs);

          const keyword = sp.get('keyword')?.trim();
          const market  = sp.get('market') ?? 'amazon.com';

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (!keyword) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'keyword required' }));
            return;
          }

          const cfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['amazon.com'];
          console.log(`\n[dev-api] 🔍 "${keyword}" on ${market}`);

          // Amazon first
          let suggestions = await tryAmazon(keyword, cfg);
          let source = 'amazon';

          // Google fallback
          if (!suggestions.length) {
            console.log(`  [dev-api] 🔄 Amazon empty → Google fallback`);
            suggestions = await tryGoogle(keyword, cfg.hl);
            source = 'google';
          }

          if (!suggestions.length) {
            console.warn(`  [dev-api] ⚠️  Both sources empty for "${keyword}" → frontend will use mock data`);
          }

          res.end(JSON.stringify({ suggestions, source }));
        }
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
