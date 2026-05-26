import { SearchData, CompetitorBook, KeywordResult, Market } from '../types';
import { getVolumeLevel, calculateOpportunityScore, estimateMonthlySales } from './scoring';

// ─── Seeded PRNG (FNV-1a 32-bit) ────────────────────────────────────────────

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function seededFloat(seed: string, salt: number): number {
  return (fnv1a(seed + '::' + salt) % 100_000) / 100_000;
}

function seededInt(seed: string, salt: number, min: number, max: number): number {
  return min + Math.floor(seededFloat(seed, salt) * (max - min + 1));
}

function pick<T>(arr: T[], seed: string, salt: number): T {
  return arr[seededInt(seed, salt, 0, arr.length - 1)];
}

// ─── Predefined realistic KDP data ───────────────────────────────────────────

const PREDEFINED: Record<string, {
  volumeScore: number;
  competition: number;
  relatedKeywords: string[];
  books: Array<{ title: string; author: string; price: number; bsr: number }>;
}> = {
  'carnet de note': {
    volumeScore: 72,
    competition: 8_543,
    relatedKeywords: [
      'carnet de notes ligné A5',
      'bullet journal carnet',
      'journal intime carnet',
      'cahier de notes pointillé',
      'carnet pointillé premium',
      'carnet de bord personnel',
      'journal de gratitude',
      'notebook 200 pages',
      'carnet moleskine style',
      'cahier papier blanc',
    ],
    books: [
      { title: 'Mon Bullet Journal Premium – 200 Pages Pointillées', author: 'Sophie Martin', price: 8.99, bsr: 1_234 },
      { title: 'Carnet de Notes Ligné A5 – Couverture Souple', author: 'Éditions Fleurus', price: 6.99, bsr: 2_108 },
      { title: 'Journal de Gratitude 365 Jours – Mon Quotidien', author: 'Marie Dupont', price: 9.99, bsr: 3_892 },
      { title: 'Carnet Pointillé Aquarelle – Collection Nature', author: 'Art & Studio', price: 7.49, bsr: 8_741 },
      { title: 'Mon Journal Intime – Design Minimaliste', author: 'Studio Print Co.', price: 5.99, bsr: 15_223 },
    ],
  },
  'coloriage enfant': {
    volumeScore: 85,
    competition: 14_287,
    relatedKeywords: [
      'livre de coloriage enfant 3-6 ans',
      'coloriage animaux forêt',
      'coloriage princesse fée',
      'coloriage dinosaures garçon',
      'mandala enfant facile',
      'coloriage licorne magique',
      'coloriage magique CE1',
      'cahier de coloriage 4-8 ans',
      'coloriage grandes cases maternelle',
      'livre coloriage éducatif',
    ],
    books: [
      { title: '100 Coloriages Animaux de la Forêt – 3 à 6 ans', author: 'Kiddy Press Studio', price: 7.99, bsr: 892 },
      { title: 'Livre de Coloriage Licornes & Fées', author: 'Magie Colors Éditions', price: 6.99, bsr: 1_543 },
      { title: 'Coloriages Dinosaures – Mes Premiers Grands Dessins', author: 'Dino Kids Studio', price: 5.99, bsr: 2_891 },
      { title: 'Mandalas Doux pour Enfants – 4 à 10 ans', author: 'Zen Kiddo', price: 8.99, bsr: 5_234 },
      { title: 'Coloriages Magiques CE1 – Maths & Lettres', author: 'Éducatif Press', price: 6.49, bsr: 11_087 },
    ],
  },
};

const COVER_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-indigo-600',
  'from-sky-500 to-blue-600',
  'from-green-500 to-emerald-600',
];

const FIRST_NAMES = ['Sophie', 'Marie', 'Julie', 'Emma', 'Lucas', 'Thomas', 'Pierre', 'Marc', 'Laura', 'Camille'];
const LAST_NAMES = ['Martin', 'Dupont', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Moreau', 'Simon', 'Laurent'];
const BOOK_SUFFIXES = [
  'Premium – Édition Collector',
  'pour Débutants',
  '– Manuel Complet',
  'Professionnel 2024',
  '– 200 Pages',
  'Grand Format A4',
  '– Édition Spéciale',
  'Quotidien',
  '– Carnet Élégant',
  'Tout-en-Un',
];

const KW_MODIFIERS: Array<(kw: string) => string> = [
  kw => kw,
  kw => `${kw} pour adultes`,
  kw => `${kw} pour débutants`,
  kw => `livre de ${kw}`,
  kw => `${kw} A5 premium`,
  kw => `${kw} 2024`,
  kw => `cahier ${kw}`,
  kw => `${kw} grand format`,
  kw => `${kw} pour enfants`,
  kw => `meilleur ${kw}`,
];

const MARKET_SCALE: Record<Market, number> = {
  'amazon.com': 1.0,
  'amazon.co.uk': 0.35,
  'amazon.fr': 0.22,
};

function normKey(kw: string): string {
  return kw
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateSearchData(rawKeyword: string, market: Market): SearchData {
  const key = normKey(rawKeyword);
  const pre = PREDEFINED[key];
  const scale = MARKET_SCALE[market];

  const volumeScore = pre ? pre.volumeScore : seededInt(key, 0, 28, 88);
  const competition = pre
    ? Math.round(pre.competition / scale)
    : seededInt(key, 1, 1_200, 52_000);

  const volumeLevel = getVolumeLevel(volumeScore);
  const opportunityScore = calculateOpportunityScore(volumeScore, competition);

  const relatedKeywords: KeywordResult[] = pre
    ? pre.relatedKeywords.map((kw, i) => {
        const vs = seededInt(kw, i + 50, Math.max(volumeScore - 25, 20), Math.min(volumeScore + 20, 95));
        const comp = seededInt(kw, i + 60, Math.round(competition * 0.3), Math.round(competition * 2.5));
        return {
          keyword: kw,
          volumeScore: vs,
          volumeLevel: getVolumeLevel(vs),
          competition: comp,
          opportunityScore: calculateOpportunityScore(vs, comp),
          isFavorite: false,
        };
      })
    : KW_MODIFIERS.map((mod, i) => {
        const kw = mod(key);
        const vs = seededInt(kw, i + 10, 25, 90);
        const comp = seededInt(kw, i + 100, 800, 45_000);
        return {
          keyword: kw,
          volumeScore: vs,
          volumeLevel: getVolumeLevel(vs),
          competition: comp,
          opportunityScore: calculateOpportunityScore(vs, comp),
          isFavorite: false,
        };
      });

  return { keyword: rawKeyword, market, volumeScore, volumeLevel, competition, opportunityScore, relatedKeywords };
}

export function generateCompetitorBooks(rawKeyword: string, market: Market): CompetitorBook[] {
  const key = normKey(rawKeyword);
  const pre = PREDEFINED[key];
  const scale = MARKET_SCALE[market];

  if (pre) {
    return pre.books.map((b, i) => {
      const scaledBsr = Math.round(b.bsr / scale);
      return {
        rank: i + 1,
        title: b.title,
        author: b.author,
        price: b.price,
        bsr: scaledBsr,
        monthlySales: estimateMonthlySales(scaledBsr),
        coverColor: COVER_COLORS[i % COVER_COLORS.length],
      };
    });
  }

  const books: CompetitorBook[] = [];
  for (let i = 0; i < 5; i++) {
    const bsr = Math.round(seededInt(key, i * 10, 800, 160_000) / scale);
    const price = parseFloat((seededFloat(key, i * 10 + 1) * 9 + 5.99).toFixed(2));
    const author = `${pick(FIRST_NAMES, key, i * 10 + 2)} ${pick(LAST_NAMES, key, i * 10 + 3)}`;
    const suffix = pick(BOOK_SUFFIXES, key, i * 10 + 4);
    const capKw = rawKeyword.charAt(0).toUpperCase() + rawKeyword.slice(1);
    books.push({
      rank: i + 1,
      title: `${capKw} – ${suffix}`,
      author,
      price,
      bsr,
      monthlySales: estimateMonthlySales(bsr),
      coverColor: COVER_COLORS[i % COVER_COLORS.length],
    });
  }

  return books
    .sort((a, b) => a.bsr - b.bsr)
    .map((b, i) => ({ ...b, rank: i + 1 }));
}
