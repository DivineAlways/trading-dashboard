export interface PBRecord {
  id: string;
  created: string;
  updated: string;
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

export interface ExperienceRecord extends PBRecord {
  symbol: string;
  strategy: "ICC" | "Mean_Reversion" | "Green_Wall";
  action: string;
  reward: number;
  pnl: number;
  entry_price: number;
  exit_price: number;
  duration_hours: number;
  narrative: string;
}

export interface TrainingExperienceRecord extends PBRecord {
  symbol: string;
  strategy: "ICC" | "Mean_Reversion" | "Green_Wall";
  action: Record<string, unknown>;
  reward: number;
  state: Record<string, unknown>;
  next_state: Record<string, unknown>;
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
  experiences: { total: number };
  training_experiences: { total: number };
  healthy: boolean;
}
