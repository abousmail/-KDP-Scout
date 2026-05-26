import { VolumeLevel, OpportunityScore } from './index';

export type Difficulty = 'Facile' | 'Moyen' | 'Dur';
export type Trend = 'hot' | 'up' | 'stable';

export interface TrendingNiche {
  id: string;
  keyword: string;
  title: string;
  subtitle: string;
  emoji: string;
  category: string;
  difficulty: Difficulty;
  volumeScore: number;
  volumeLevel: VolumeLevel;
  opportunityScore: OpportunityScore;
  trend: Trend;
  description: string;
  tags: string[];
  monthlySearches: string;
}
