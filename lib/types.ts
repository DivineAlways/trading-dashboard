export interface PBRecord {
  id: string;
  collectionId: string;
  collectionName: string;
}

export interface PBList<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface MarketDataRecord extends PBRecord {
  symbol: string;
  timeframe: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketState {
  atr: number;
  close: number;
  high: number;
  hl_range: number;
  is_news: boolean;
  low: number;
  open: number;
  real_volume: number;
  spread: number;
  tick_volume: number;
  time: string;
}

export interface TrainingExperienceRecord extends PBRecord {
  symbol: string;
  strategy: string;
  action: { type: string };
  reward: number;
  state: MarketState;
  next_state: MarketState;
  done: boolean;
}

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CollectionStats {
  name: string;
  totalRecords: number;
}

export interface StatsResponse {
  market_data: { total: number; bySymbol: Record<string, number> };
  training_experiences: { total: number };
  healthy: boolean;
}
