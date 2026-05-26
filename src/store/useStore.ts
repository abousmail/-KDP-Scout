import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Page, Market, SearchData, CompetitorBook,
  HistoryItem, FavoriteItem, HistoryTab, AuthUser,
} from '../types';
import { generateSearchData, generateCompetitorBooks } from '../lib/mockData';
import { fetchSuggestions, buildKeywordsFromSuggestions, DataSource } from '../lib/amazonApi';
import { supabase } from '../lib/supabase';

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
  dataSource: DataSource;
  searchData: SearchData | null;
  competitors: CompetitorBook[];

  // ── History & Favorites ───────────────────────────────────────────────────
  historyTab: HistoryTab;
  setHistoryTab: (t: HistoryTab) => void;
  history: HistoryItem[];
  favorites: FavoriteItem[];

  // ── Actions ───────────────────────────────────────────────────────────────
  search: (keyword: string) => Promise<void>;
  toggleFavorite: (item: { keyword: string; volumeScore: number; competition: number; opportunityScore: string }) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // ── Auth ──────────────────────────────────────────────────────────────────
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
      market: 'amazon.com',
      setMarket: (market) => set({ market }),
      isSearching: false,
      dataSource: 'mock' as DataSource,
      searchData: null,
      competitors: [],

      // ── History & Favorites ────────────────────────────────────────────────
      historyTab: 'history',
      setHistoryTab: (historyTab) => set({ historyTab }),
      history: [],
      favorites: [],

      // ── Search action ──────────────────────────────────────────────────────
      search: async (keyword) => {
        if (!keyword.trim()) return;
        set({ isSearching: true, searchQuery: keyword, dataSource: 'mock' });

        const start = Date.now();

        try {
          const { market, favorites } = get();

          // ① Try real API (Amazon → Google fallback); silently fall back to mock on error
          let realSuggestions: string[] = [];
          let resolvedSource: DataSource = 'mock';
          try {
            const result = await fetchSuggestions(keyword, market);
            if (result.suggestions.length > 0) {
              realSuggestions = result.suggestions;
              resolvedSource  = result.source;
            }
          } catch {
            // Local dev without vercel dev, network error, etc. — use mock
          }

          // ② Generate base KPI data (volume score, competition, opportunity grade)
          //    These remain estimated regardless of the data source.
          const baseData = generateSearchData(keyword, market);
          const books    = generateCompetitorBooks(keyword, market);

          const favoriteKeywords = new Set(favorites.map(f => f.keyword));

          // ③ Build related keywords: real suggestions OR mock fallback
          const relatedKeywords = (
            realSuggestions.length > 0
              ? buildKeywordsFromSuggestions(realSuggestions, baseData.competition)
              : baseData.relatedKeywords
          ).map(kw => ({ ...kw, isFavorite: favoriteKeywords.has(kw.keyword) }));

          const data: SearchData = { ...baseData, relatedKeywords };

          // ④ Enforce minimum skeleton duration so the UI doesn't flash
          const elapsed = Date.now() - start;
          if (elapsed < 700) {
            await new Promise(r => setTimeout(r, 700 - elapsed));
          }

          const historyItem: HistoryItem = {
            id: Date.now().toString(),
            keyword,
            market,
            opportunityScore: data.opportunityScore,
            searchedAt: new Date(),
          };

          set(state => ({
            isSearching: false,
            dataSource: resolvedSource,
            searchData: data,
            competitors: books,
            history: [historyItem, ...state.history.filter(h => h.keyword !== keyword)].slice(0, 50),
          }));
        } catch (err) {
          console.error('[KDP Scout] Search failed:', err);
          set({ isSearching: false });
        }
      },

      toggleFavorite: (item) => {
        const { market, favorites, searchData } = get();
        const exists = favorites.findIndex(f => f.keyword === item.keyword && f.market === market);

        let newFavorites: FavoriteItem[];
        if (exists >= 0) {
          newFavorites = favorites.filter((_, i) => i !== exists);
        } else {
          newFavorites = [
            {
              keyword: item.keyword,
              market,
              volumeScore: item.volumeScore,
              competition: item.competition,
              opportunityScore: item.opportunityScore as FavoriteItem['opportunityScore'],
              savedAt: new Date(),
            },
            ...favorites,
          ];
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
      setUser: (user) => set({ user }),
      isAuthModalOpen: false,
      setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          set({
            user: { id: data.user.id, email: data.user.email!, name: data.user.email!.split('@')[0] },
            isAuthModalOpen: false,
          });
        }
      },

      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.user.identities?.length) {
          throw new Error('Un compte existe déjà avec cet email.');
        }
        if (data.session?.user) {
          set({
            user: {
              id: data.session.user.id,
              email: data.session.user.email!,
              name: data.session.user.email!.split('@')[0],
            },
            isAuthModalOpen: false,
          });
        }
      },

      logout: () => {
        supabase.auth.signOut();
        set({ user: null });
      },
    }),
    {
      name: 'kdp-scout-storage',
      partialize: (state) => ({
        history: state.history,
        favorites: state.favorites,
        market: state.market,
      }),
    }
  )
);
