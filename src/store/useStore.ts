import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Page, Market, SearchData, CompetitorBook,
  HistoryItem, FavoriteItem, HistoryTab, AuthUser,
} from '../types';
import { generateSearchData, generateCompetitorBooks } from '../lib/mockData';

interface AppStore {
  // ── Navigation ───────────────────────────────────────────────────────────
  page: Page;
  setPage: (p: Page) => void;

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  market: Market;
  setMarket: (m: Market) => void;
  isSearching: boolean;
  searchData: SearchData | null;
  competitors: CompetitorBook[];

  // ── History & Favorites ───────────────────────────────────────────────────
  historyTab: HistoryTab;
  setHistoryTab: (t: HistoryTab) => void;
  history: HistoryItem[];
  favorites: FavoriteItem[];

  // ── Actions ───────────────────────────────────────────────────────────────
  search: (keyword: string) => void;
  toggleFavorite: (item: { keyword: string; volumeScore: number; competition: number; opportunityScore: string }) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // ── Auth (Supabase-ready stub) ─────────────────────────────────────────────
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, _password: string) => Promise<void>;
  logout: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Navigation ─────────────────────────────────────────────────────────
      page: 'keywords',
      setPage: (page) => set({ page }),

      // ── Search ─────────────────────────────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      market: 'amazon.fr',
      setMarket: (market) => set({ market }),
      isSearching: false,
      searchData: null,
      competitors: [],

      // ── History & Favorites ────────────────────────────────────────────────
      historyTab: 'history',
      setHistoryTab: (historyTab) => set({ historyTab }),
      history: [],
      favorites: [],

      // ── Actions ────────────────────────────────────────────────────────────
      search: (keyword) => {
        if (!keyword.trim()) return;
        set({ isSearching: true, searchQuery: keyword });

        // Simulate async API call
        setTimeout(() => {
          const { market, favorites } = get();
          const data = generateSearchData(keyword, market);
          const books = generateCompetitorBooks(keyword, market);
          const favoriteKeywords = new Set(favorites.map(f => f.keyword));

          const dataWithFavs: SearchData = {
            ...data,
            relatedKeywords: data.relatedKeywords.map(kw => ({
              ...kw,
              isFavorite: favoriteKeywords.has(kw.keyword),
            })),
          };

          const historyItem: HistoryItem = {
            id: Date.now().toString(),
            keyword,
            market,
            opportunityScore: data.opportunityScore,
            searchedAt: new Date(),
          };

          set(state => ({
            isSearching: false,
            searchData: dataWithFavs,
            competitors: books,
            history: [historyItem, ...state.history.filter(h => h.keyword !== keyword)].slice(0, 50),
          }));
        }, 1_300);
      },

      toggleFavorite: (item) => {
        const { market, favorites, searchData } = get();
        const exists = favorites.findIndex(f => f.keyword === item.keyword && f.market === market);

        let newFavorites: FavoriteItem[];
        if (exists >= 0) {
          newFavorites = favorites.filter((_, i) => i !== exists);
        } else {
          const fav: FavoriteItem = {
            keyword: item.keyword,
            market,
            volumeScore: item.volumeScore,
            competition: item.competition,
            opportunityScore: item.opportunityScore as FavoriteItem['opportunityScore'],
            savedAt: new Date(),
          };
          newFavorites = [fav, ...favorites];
        }

        const favoriteKeywords = new Set(newFavorites.map(f => f.keyword));
        const updatedSearchData = searchData
          ? {
              ...searchData,
              relatedKeywords: searchData.relatedKeywords.map(kw => ({
                ...kw,
                isFavorite: favoriteKeywords.has(kw.keyword),
              })),
            }
          : null;

        set({ favorites: newFavorites, searchData: updatedSearchData });
      },

      removeFromHistory: (id) =>
        set(state => ({ history: state.history.filter(h => h.id !== id) })),

      clearHistory: () => set({ history: [] }),

      // ── Auth ───────────────────────────────────────────────────────────────
      user: null,
      isAuthModalOpen: false,
      setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),

      login: async (email, _password) => {
        // TODO: Replace with supabase.auth.signInWithPassword({ email, password })
        // Mocked for now
        await new Promise(res => setTimeout(res, 800));
        set({
          user: { id: '1', email, name: email.split('@')[0] },
          isAuthModalOpen: false,
        });
      },

      logout: () => {
        // TODO: supabase.auth.signOut()
        set({ user: null });
      },
    }),
    {
      name: 'kdp-scout-storage',
      partialize: (state) => ({
        history: state.history,
        favorites: state.favorites,
        market: state.market,
        user: state.user,
      }),
    }
  )
);
