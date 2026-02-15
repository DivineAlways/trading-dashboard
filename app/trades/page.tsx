"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { usePolling } from "@/lib/hooks/use-polling";
import { PBList, TrainingExperienceRecord } from "@/lib/types";
import { STRATEGIES, SYMBOLS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function TradesPage() {
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [symbolFilter, setSymbolFilter] = useState("all");

  const strategyParam = strategyFilter !== "all" ? `&strategy=${strategyFilter}` : "";
  const symbolObj = SYMBOLS.find((s) => s.name === symbolFilter);
  const symbolParam = symbolObj ? `&symbol=${symbolObj.trainingName}` : "";

  const { data, loading } = usePolling<PBList<TrainingExperienceRecord>>(
    `/api/pocketbase/experiences?perPage=200${strategyParam}${symbolParam}`,
    30000
  );

  const trades = data?.items || [];

  // Cumulative reward chart data
  const rewardData = trades
    .slice()
    .reverse()
    .reduce<{ index: number; reward: number }[]>((acc, trade, i) => {
      const last = acc.length > 0 ? acc[acc.length - 1].reward : 0;
      acc.push({
        index: i + 1,
        reward: last + (trade.reward || 0),
      });
      return acc;
    }, []);

  const totalReward = trades.reduce((s, t) => s + (t.reward || 0), 0);
  const positiveCount = trades.filter((t) => (t.reward || 0) > 0).length;
  const winRate = trades.length > 0 ? (positiveCount / trades.length) * 100 : 0;

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
            <p className="text-xs text-muted-foreground">Total Episodes</p>
            <p className="text-xl font-bold font-mono">{data?.totalItems?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card className="trading-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Win Rate (reward &gt; 0)</p>
            <p className={cn("text-xl font-bold font-mono", winRate >= 50 ? "text-success" : "text-destructive")}>
              {winRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="trading-card">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Reward (sample)</p>
            <p className={cn("text-xl font-bold font-mono", totalReward >= 0 ? "text-success" : "text-destructive")}>
              {totalReward >= 0 ? "+" : ""}{totalReward.toFixed(1)} pts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Reward Chart */}
      {rewardData.length > 1 && (
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cumulative Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={rewardData}>
                <defs>
                  <linearGradient id="rewardGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="index" tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [Number(value).toFixed(2), "Reward"]}
                />
                <Area
                  type="monotone"
                  dataKey="reward"
                  stroke="hsl(263, 70%, 50%)"
                  fill="url(#rewardGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Episodes Table */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Episode History</CardTitle>
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
                  <TableHead>Time</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Exit</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                  <TableHead>Done</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No episodes found
                    </TableCell>
                  </TableRow>
                )}
                {trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {trade.state?.time
                        ? new Date(trade.state.time).toLocaleDateString(undefined, {
                            month: "short", day: "numeric",
                          })
                        : "\u2014"}
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
                    <TableCell className="text-xs font-mono">
                      {trade.action?.type || "\u2014"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {trade.state?.close?.toFixed(trade.state.close > 100 ? 2 : 5) ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {trade.next_state?.close?.toFixed(trade.next_state.close > 100 ? 2 : 5) ?? "\u2014"}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono text-xs", (trade.reward || 0) >= 0 ? "text-success" : "text-destructive")}>
                      {(trade.reward || 0) >= 0 ? "+" : ""}{trade.reward?.toFixed(1) ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", trade.done ? "text-success" : "text-muted-foreground")}>
                        {trade.done ? "Yes" : "No"}
                      </Badge>
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
