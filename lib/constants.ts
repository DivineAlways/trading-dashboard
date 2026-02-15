export const SYMBOLS = [
  { name: "EUR_USD", label: "EUR/USD", type: "forex" as const, isLive: true, trainingName: "EURUSD" },
  { name: "GBP_USD", label: "GBP/USD", type: "forex" as const, isLive: true, trainingName: "GBPUSD" },
  { name: "USD_JPY", label: "USD/JPY", type: "forex" as const, isLive: true, trainingName: "USDJPY" },
  { name: "XAU_USD", label: "XAU/USD", type: "commodity" as const, isLive: true, trainingName: "XAUUSD" },
  { name: "BTC_USD", label: "BTC/USD", type: "crypto" as const, isLive: false, trainingName: "BTCUSD" },
  { name: "OIL_USD", label: "OIL/USD", type: "commodity" as const, isLive: false, trainingName: "OILUSD" },
  { name: "SPX500_USD", label: "S&P 500", type: "index" as const, isLive: false, trainingName: "SPX500USD" },
  { name: "US30_USD", label: "Dow 30", type: "index" as const, isLive: false, trainingName: "US30USD" },
  { name: "NAS100_USD", label: "NASDAQ 100", type: "index" as const, isLive: false, trainingName: "NAS100USD" },
];

export const STRATEGIES = [
  { name: "ICC", label: "ICC", color: "hsl(263, 70%, 50%)", description: "Indication-Correction-Continuation" },
  { name: "Mean_Reversion", label: "Mean Reversion", color: "hsl(29, 70%, 50%)", description: "Bollinger Band Z-Score Reversal" },
  { name: "Green_Wall", label: "Green Wall", color: "hsl(145, 60%, 40%)", description: "Lorentzian KNN + Elephant Bar" },
];

export const REWARD_RULES = [
  { condition: "Profitable trade (PnL > 0)", points: "+10", type: "base" },
  { condition: "ICC strategy bonus", points: "+5", type: "bonus" },
  { condition: "Green Wall strategy bonus", points: "+3", type: "bonus" },
  { condition: "Loss (PnL <= 0)", points: "-10", type: "penalty" },
  { condition: "Trade held > 4 hours", points: "-2", type: "penalty" },
  { condition: "Trading into news event", points: "-20", type: "penalty" },
];

export const TIMEFRAMES = [
  { value: "M1", label: "1 Minute" },
  { value: "M5", label: "5 Minutes" },
  { value: "M15", label: "15 Minutes" },
  { value: "H1", label: "1 Hour" },
  { value: "H4", label: "4 Hours" },
  { value: "D1", label: "Daily" },
];
