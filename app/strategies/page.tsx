"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STRATEGIES, REWARD_RULES } from "@/lib/constants";
import { usePolling } from "@/lib/hooks/use-polling";
import { PBList, TrainingExperienceRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const ICC_PHASES = [
  { name: "Indication", description: "Break of Structure (BOS) detected", color: "text-chart-1" },
  { name: "Correction", description: "Price pulls back into FVG zone", color: "text-chart-4" },
  { name: "Continuation", description: "EMA 5/21 crossover confirms entry", color: "text-success" },
];

export default function StrategiesPage() {
  const { data: expData, loading } = usePolling<PBList<TrainingExperienceRecord>>(
    "/api/pocketbase/experiences?perPage=200",
    30000
  );

  const trades = expData?.items || [];

  function strategyStats(name: string) {
    const stTrades = trades.filter((t) => t.strategy === name);
    const total = stTrades.length;
    const wins = stTrades.filter((t) => t.reward > 0).length;
    const totalReward = stTrades.reduce((s, t) => s + (t.reward || 0), 0);
    const avgReward = total > 0 ? totalReward / total : 0;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    return { total, wins, totalReward, avgReward, winRate };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Strategies</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">The AI uses three strategies, each analyzing the market differently. <strong>ICC</strong> follows institutional patterns (big bank footprints). <strong>Mean Reversion</strong> bets extreme prices will revert to average. <strong>Green Wall</strong> uses machine learning to detect momentum shifts. The scoring table below shows how the AI learns — it earns points for good trades and loses points for bad ones.</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          The AI uses three distinct trading strategies, each looking at the market from a different angle.
          <strong>ICC</strong> follows institutional patterns (big bank footprints).
          <strong>Mean Reversion</strong> bets that extreme prices will snap back to normal.
          <strong>Green Wall</strong> uses machine learning to detect momentum shifts.
          Below you can see how each strategy is performing and the reward scoring rules.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[350px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ICC Card */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ICC Strategy</span>
                <Badge variant="outline" className="bg-chart-1/20 text-chart-1 border-chart-1/30">
                  ICC
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Indication - Correction - Continuation</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phase Flow</p>
                <div className="flex items-center gap-1">
                  {ICC_PHASES.map((phase, i) => (
                    <div key={phase.name} className="flex items-center gap-1">
                      <div className={cn("text-xs font-mono px-2 py-1 rounded bg-muted", phase.color)}>
                        {phase.name}
                      </div>
                      {i < ICC_PHASES.length - 1 && (
                        <span className="text-muted-foreground text-xs">&rarr;</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Indicators</p>
                <div className="flex flex-wrap gap-1">
                  {["BOS Detection", "FVG Zone", "EMA 5/21", "Trend Filter"].map((ind) => (
                    <Badge key={ind} variant="outline" className="text-[10px]">{ind}</Badge>
                  ))}
                </div>
              </div>
              <StrategyStatsBlock stats={strategyStats("ICC")} />
            </CardContent>
          </Card>

          {/* Mean Reversion Card */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mean Reversion</span>
                <Badge variant="outline" className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                  MR
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Bollinger Band Z-Score Reversal</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key Metrics</p>
                <div className="grid grid-cols-2 gap-2">
                  <MetricBox label="Z-Score Range" value="-3 to +3" />
                  <MetricBox label="RSI Range" value="30 / 70" />
                  <MetricBox label="Bollinger" value="2.0 StdDev" />
                  <MetricBox label="Session" value="Asia" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Indicators</p>
                <div className="flex flex-wrap gap-1">
                  {["Z-Score", "RSI", "Bollinger Bands", "Stalking Mode"].map((ind) => (
                    <Badge key={ind} variant="outline" className="text-[10px]">{ind}</Badge>
                  ))}
                </div>
              </div>
              <StrategyStatsBlock stats={strategyStats("Mean_Reversion")} />
            </CardContent>
          </Card>

          {/* Green Wall Card */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Green Wall</span>
                <Badge variant="outline" className="bg-chart-3/20 text-chart-3 border-chart-3/30">
                  GW
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Lorentzian KNN + Elephant Bar</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Regime Detection</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Bullish", "Bearish", "Neutral"].map((regime) => (
                    <div
                      key={regime}
                      className={cn(
                        "text-center text-xs py-1.5 rounded border",
                        regime === "Bullish"
                          ? "border-success/30 text-success bg-success/10"
                          : regime === "Bearish"
                          ? "border-destructive/30 text-destructive bg-destructive/10"
                          : "border-muted-foreground/30 text-muted-foreground bg-muted"
                      )}
                    >
                      {regime}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Indicators</p>
                <div className="flex flex-wrap gap-1">
                  {["Lorentzian KNN", "Elephant Bar", "Pattern Match", "Regime Filter"].map((ind) => (
                    <Badge key={ind} variant="outline" className="text-[10px]">{ind}</Badge>
                  ))}
                </div>
              </div>
              <StrategyStatsBlock stats={strategyStats("Green_Wall")} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reward Rules */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Reward Scoring Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condition</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REWARD_RULES.map((rule) => (
                <TableRow key={rule.condition}>
                  <TableCell className="text-sm">{rule.condition}</TableCell>
                  <TableCell
                    className={cn(
                      "font-mono text-sm",
                      rule.points.startsWith("+") ? "text-success" : "text-destructive"
                    )}
                  >
                    {rule.points}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        rule.type === "base"
                          ? "border-primary/30 text-primary"
                          : rule.type === "bonus"
                          ? "border-success/30 text-success"
                          : "border-destructive/30 text-destructive"
                      )}
                    >
                      {rule.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Signal Feed */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Trade Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No trade signals yet</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {trades.slice(0, 20).map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-start gap-3 p-2 rounded border border-border/50 text-sm"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0 mt-0.5",
                      trade.strategy === "ICC"
                        ? "bg-chart-1/20 text-chart-1"
                        : trade.strategy === "Mean_Reversion"
                        ? "bg-chart-2/20 text-chart-2"
                        : "bg-chart-3/20 text-chart-3"
                    )}
                  >
                    {trade.strategy === "Mean_Reversion" ? "MR" : trade.strategy === "Green_Wall" ? "GW" : trade.strategy}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{trade.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {trade.state?.time
                          ? new Date(trade.state.time).toLocaleString(undefined, {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })
                          : "\u2014"}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {trade.action?.type || ""}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-xs shrink-0",
                      trade.reward >= 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {trade.reward >= 0 ? "+" : ""}{trade.reward?.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StrategyStatsBlock({ stats }: { stats: { total: number; wins: number; totalReward: number; avgReward: number; winRate: number } }) {
  return (
    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase">Trades</p>
        <p className="text-sm font-mono font-medium">{stats.total}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
        <p className={cn("text-sm font-mono font-medium", stats.winRate >= 50 ? "text-success" : "text-destructive")}>
          {stats.winRate.toFixed(1)}%
        </p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase">Total Reward</p>
        <p className={cn("text-sm font-mono font-medium", stats.totalReward >= 0 ? "text-success" : "text-destructive")}>
          {stats.totalReward >= 0 ? "+" : ""}{stats.totalReward.toFixed(1)}
        </p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase">Avg Reward</p>
        <p className={cn("text-sm font-mono font-medium", stats.avgReward >= 0 ? "text-success" : "text-destructive")}>
          {stats.avgReward >= 0 ? "+" : ""}{stats.avgReward.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-mono font-medium">{value}</p>
    </div>
  );
}
