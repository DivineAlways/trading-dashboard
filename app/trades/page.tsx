"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { usePolling } from "@/lib/hooks/use-polling";
import { PBList, ExperienceRecord } from "@/lib/types";
import { STRATEGIES, SYMBOLS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function TradesPage() {
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [selectedTrade, setSelectedTrade] = useState<ExperienceRecord | null>(null);

  const strategyParam = strategyFilter !== "all" ? `&strategy=${strategyFilter}` : "";
  const symbolParam = symbolFilter !== "all" ? `&symbol=${symbolFilter}` : "";

  const { data, loading } = usePolling<PBList<ExperienceRecord>>(
    `/api/pocketbase/experiences?perPage=200${strategyParam}${symbolParam}`,
    30000
  );

  const trades = data?.items || [];

  // Cumulative PnL chart data
  const pnlData = trades
    .slice()
    .reverse()
    .reduce<{ date: string; pnl: number }[]>((acc, trade) => {
      const last = acc.length > 0 ? acc[acc.length - 1].pnl : 0;
      acc.push({
        date: new Date(trade.created).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        pnl: last + (trade.pnl || 0),
      });
      return acc;
    }, []);

  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const totalReward = trades.reduce((s, t) => s + (t.reward || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Trades</h1>
        <div className="flex gap-2">
          <Select value={strategyFilter} onValueChange={setStrategyFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              {STRATEGIES.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={symbolFilter} onValueChange={setSymbolFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Symbols</SelectItem>
              {SYMBOLS.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="trading-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Trades</p>
            <p className="text-xl font-bold font-mono">{data?.totalItems || 0}</p>
          </CardContent>
        </Card>
        <Card className="trading-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Cumulative PnL</p>
            <p className={cn("text-xl font-bold font-mono", totalPnl >= 0 ? "text-success" : "text-destructive")}>
              {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="trading-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Reward</p>
            <p className={cn("text-xl font-bold font-mono", totalReward >= 0 ? "text-success" : "text-destructive")}>
              {totalReward >= 0 ? "+" : ""}{totalReward.toFixed(1)} pts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PnL Chart */}
      {pnlData.length > 1 && (
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cumulative PnL</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [Number(value).toFixed(2), "PnL"]}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="hsl(263, 70%, 50%)"
                  fill="url(#pnlGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Trades Table */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Exit</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No trades found
                    </TableCell>
                  </TableRow>
                )}
                {trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(trade.created).toLocaleDateString(undefined, {
                        month: "short", day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          trade.strategy === "ICC"
                            ? "bg-chart-1/20 text-chart-1"
                            : trade.strategy === "Mean_Reversion"
                            ? "bg-chart-2/20 text-chart-2"
                            : "bg-chart-3/20 text-chart-3"
                        )}
                      >
                        {trade.strategy === "Mean_Reversion" ? "MR" : trade.strategy === "Green_Wall" ? "GW" : trade.strategy}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {trade.entry_price?.toFixed(trade.entry_price > 100 ? 2 : 5) ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {trade.exit_price?.toFixed(trade.exit_price > 100 ? 2 : 5) ?? "\u2014"}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono text-xs", (trade.pnl || 0) >= 0 ? "text-success" : "text-destructive")}>
                      {(trade.pnl || 0) >= 0 ? "+" : ""}{trade.pnl?.toFixed(2) ?? "\u2014"}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono text-xs", (trade.reward || 0) >= 0 ? "text-success" : "text-destructive")}>
                      {(trade.reward || 0) >= 0 ? "+" : ""}{trade.reward?.toFixed(1) ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {trade.duration_hours ? `${trade.duration_hours.toFixed(1)}h` : "\u2014"}
                    </TableCell>
                    <TableCell>
                      {trade.narrative && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <button
                              onClick={() => setSelectedTrade(trade)}
                              className="text-xs text-primary hover:underline"
                            >
                              Details
                            </button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[500px]">
                            <SheetHeader>
                              <SheetTitle>
                                {trade.symbol} - {trade.strategy}
                              </SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Entry Price</p>
                                  <p className="font-mono">{trade.entry_price?.toFixed(5) ?? "\u2014"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Exit Price</p>
                                  <p className="font-mono">{trade.exit_price?.toFixed(5) ?? "\u2014"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">PnL</p>
                                  <p className={cn("font-mono", (trade.pnl || 0) >= 0 ? "text-success" : "text-destructive")}>
                                    {(trade.pnl || 0) >= 0 ? "+" : ""}{trade.pnl?.toFixed(4)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Reward</p>
                                  <p className={cn("font-mono", (trade.reward || 0) >= 0 ? "text-success" : "text-destructive")}>
                                    {(trade.reward || 0) >= 0 ? "+" : ""}{trade.reward?.toFixed(1)} pts
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Duration</p>
                                  <p className="font-mono">{trade.duration_hours?.toFixed(2)}h</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Date</p>
                                  <p className="text-sm">{new Date(trade.created).toLocaleString()}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Narrative</p>
                                <p className="text-sm leading-relaxed bg-muted/50 rounded p-3">{trade.narrative}</p>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
