"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { usePolling } from "@/lib/hooks/use-polling";
import { PBList, TrainingExperienceRecord, StatsResponse } from "@/lib/types";
import { STRATEGIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GraduationCap, Zap, BarChart3, Globe } from "lucide-react";

export default function TrainingPage() {
  const { data: trainData, loading: trainLoading } = usePolling<PBList<TrainingExperienceRecord>>(
    "/api/pocketbase/training?perPage=200",
    30000
  );
  const { data: stats, loading: statsLoading } = usePolling<StatsResponse>(
    "/api/pocketbase/stats",
    60000
  );

  const experiences = trainData?.items || [];
  const totalExperiences = stats?.training_experiences?.total || trainData?.totalItems || 0;
  const totalReward = experiences.reduce((s, t) => s + (t.reward || 0), 0);

  // Count by strategy
  const byStrategy: Record<string, { count: number; reward: number }> = {};
  for (const exp of experiences) {
    if (!byStrategy[exp.strategy]) byStrategy[exp.strategy] = { count: 0, reward: 0 };
    byStrategy[exp.strategy].count++;
    byStrategy[exp.strategy].reward += exp.reward || 0;
  }

  // Unique markets
  const uniqueMarkets = new Set(experiences.map((e) => e.symbol)).size;

  // Reward curve data - cumulative reward per strategy over time
  const reversed = experiences.slice().reverse();
  const cumReward: Record<string, number> = {};
  const curveData = reversed.map((exp, i) => {
    cumReward[exp.strategy] = (cumReward[exp.strategy] || 0) + (exp.reward || 0);
    return {
      index: i + 1,
      ...Object.fromEntries(
        STRATEGIES.map((s) => [s.name, cumReward[s.name] || 0])
      ),
    };
  });

  // Strategy comparison bar chart
  const comparisonData = STRATEGIES.map((s) => ({
    name: s.label,
    avgReward: byStrategy[s.name]
      ? byStrategy[s.name].reward / byStrategy[s.name].count
      : 0,
    count: byStrategy[s.name]?.count || 0,
  }));

  const loading = trainLoading || statsLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">AI Training</h1>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[90px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Experiences</p>
                <p className="text-xl font-bold font-mono">{totalExperiences.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <Zap className="h-8 w-8 text-chart-4" />
              <div>
                <p className="text-xs text-muted-foreground">Total Reward (sample)</p>
                <p className={cn("text-xl font-bold font-mono", totalReward >= 0 ? "text-success" : "text-destructive")}>
                  {totalReward >= 0 ? "+" : ""}{totalReward.toFixed(1)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-xs text-muted-foreground">By Strategy</p>
                <div className="flex gap-2">
                  {STRATEGIES.map((s) => (
                    <span key={s.name} className="text-xs font-mono">
                      {s.label.slice(0, 3)}: {byStrategy[s.name]?.count || 0}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <Globe className="h-8 w-8 text-chart-3" />
              <div>
                <p className="text-xs text-muted-foreground">Markets Trained</p>
                <p className="text-xl font-bold font-mono">{uniqueMarkets}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reward Curve */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cumulative Reward by Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            {curveData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No training data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={curveData}>
                  <XAxis dataKey="index" tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                  <Tooltip
                    contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend />
                  {STRATEGIES.map((s) => (
                    <Line
                      key={s.name}
                      type="monotone"
                      dataKey={s.name}
                      stroke={s.color}
                      dot={false}
                      strokeWidth={2}
                      name={s.label}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Strategy Comparison */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Reward per Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(0, 0%, 40%)" />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [Number(value).toFixed(3), "Avg Reward"]}
                />
                <Bar
                  dataKey="avgReward"
                  fill="hsl(263, 70%, 50%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Episode Table */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Training Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          {trainLoading ? (
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
                  <TableHead className="text-right">Reward</TableHead>
                  <TableHead>Done</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiences.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No training episodes yet
                    </TableCell>
                  </TableRow>
                )}
                {experiences.slice(0, 50).map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(exp.created).toLocaleString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{exp.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          exp.strategy === "ICC"
                            ? "bg-chart-1/20 text-chart-1"
                            : exp.strategy === "Mean_Reversion"
                            ? "bg-chart-2/20 text-chart-2"
                            : "bg-chart-3/20 text-chart-3"
                        )}
                      >
                        {exp.strategy === "Mean_Reversion" ? "MR" : exp.strategy === "Green_Wall" ? "GW" : exp.strategy}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {typeof exp.action === "object" && exp.action
                        ? (exp.action as Record<string, string>).type || "\u2014"
                        : "\u2014"}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono text-xs", (exp.reward || 0) >= 0 ? "text-success" : "text-destructive")}>
                      {(exp.reward || 0) >= 0 ? "+" : ""}{exp.reward?.toFixed(2) ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", exp.done ? "text-success" : "text-muted-foreground")}>
                        {exp.done ? "Yes" : "No"}
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
