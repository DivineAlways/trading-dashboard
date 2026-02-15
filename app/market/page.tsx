"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandlestickChart } from "@/components/market/candlestick-chart";
import { SYMBOLS } from "@/lib/constants";
import { CandlestickData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketPage() {
  const [symbol, setSymbol] = useState("EUR_USD");
  const [data, setData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pocketbase/market-data/${symbol}?count=500`)
      .then((res) => res.json())
      .then((json) => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  }, [symbol]);

  const latest = data.length > 0 ? data[data.length - 1] : null;
  const prev = data.length > 1 ? data[data.length - 2] : null;
  const change = latest && prev ? ((latest.close - prev.close) / prev.close) * 100 : 0;
  const high = data.length > 0 ? Math.max(...data.map((d) => d.high)) : 0;
  const low = data.length > 0 ? Math.min(...data.map((d) => d.low)) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Market Data</h1>
      <p className="text-sm text-muted-foreground mt-1 max-w-2xl">Live price charts powered by TradingView. Select any currency pair or commodity to see real-time price action. This is the same data the AI agents analyze when making trading decisions — you can see exactly what the AI sees.</p>

      <Tabs value={symbol} onValueChange={setSymbol}>
        <TabsList className="flex flex-wrap gap-1">
          {SYMBOLS.map((s) => (
            <TabsTrigger key={s.name} value={s.name} className="text-xs">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="trading-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>{SYMBOLS.find((s) => s.name === symbol)?.label || symbol} — H1</span>
            {latest && (
              <div className="flex items-center gap-4 text-sm font-mono">
                <span>Price: {latest.close.toFixed(latest.close > 100 ? 2 : 5)}</span>
                <span className={change >= 0 ? "text-success" : "text-destructive"}>
                  {change >= 0 ? "+" : ""}{change.toFixed(3)}%
                </span>
                <span className="text-muted-foreground">H: {high.toFixed(high > 100 ? 2 : 5)}</span>
                <span className="text-muted-foreground">L: {low.toFixed(low > 100 ? 2 : 5)}</span>
                <span className="text-muted-foreground">{data.length} candles</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : (
            <CandlestickChart data={data} symbol={symbol} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
