export type Page = 'keywords' | 'niche' | 'history' | 'trends';
export type Market = 'amazon.fr' | 'amazon.com' | 'amazon.co.uk';
export type VolumeLevel = 'Haut' | 'Moyen' | 'Bas';
export type OpportunityScore = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'E';
export type HistoryTab = 'history' | 'favorites';

export interface KeywordResult {
  keyword: string;
  volumeScore: number;
  volumeLevel: VolumeLevel;
  competition: number;
  opportunityScore: OpportunityScore;
  isFavorite: boolean;
}

export interface SearchData {
  keyword: string;
  market: Market;
  volumeScore: number;
  volumeLevel: VolumeLevel;
  competition: number;
  opportunityScore: OpportunityScore;
  relatedKeywords: KeywordResult[];
}

export interface CompetitorBook {
  rank: number;
  title: string;
  author: string;
  price: number;
  bsr: number;
  monthlySales: number;
  coverColor: string;
}

export interface HistoryItem {
  id: string;
  keyword: string;
  market: Market;
  opportunityScore: OpportunityScore;
  searchedAt: Date;
}

export interface FavoriteItem {
  keyword: string;
  market: Market;
  volumeScore: number;
  competition: number;
  opportunityScore: OpportunityScore;
  savedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}
