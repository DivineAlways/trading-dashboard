"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolling } from "@/lib/hooks/use-polling";
import { StatsResponse } from "@/lib/types";
import { SYMBOLS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Database, Server, HardDrive } from "lucide-react";

export default function DatabasePage() {
  const { data: health, loading: healthLoading } = usePolling<{ healthy: boolean; latency: number }>(
    "/api/pocketbase/auth",
    15000
  );
  const { data: stats, loading: statsLoading } = usePolling<StatsResponse>(
    "/api/pocketbase/stats",
    30000
  );

  const loading = healthLoading || statsLoading;

  const collections = [
    {
      name: "market_data",
      label: "Market Data",
      icon: HardDrive,
      total: stats?.market_data?.total || 0,
      fields: ["symbol", "timeframe", "timestamp", "open", "high", "low", "close", "volume"],
    },
    {
      name: "training_experiences",
      label: "Training Experiences",
      icon: Database,
      total: stats?.training_experiences?.total || 0,
      fields: ["symbol", "strategy", "action", "reward", "state", "next_state", "done"],
    },
  ];

  const bySymbol = stats?.market_data?.bySymbol || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Database</h1>
      <p className="text-sm text-muted-foreground mt-1 max-w-2xl">System health monitor. Shows whether PocketBase (our database) is connected and responding, which data collections exist, and how much experience data the AI has stored. If the status shows red, the database may need to be restarted on the droplet server.</p>

      {/* PB Health */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Server className="h-4 w-4" />
            PocketBase Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    health?.healthy ? "bg-success animate-pulse" : "bg-destructive"
                  )}
                />
                <span className="text-sm font-medium">
                  {health?.healthy ? "Online" : "Offline"}
                </span>
              </div>
              {health?.latency !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Latency: <span className="font-mono">{health.latency}ms</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                URL: <span className="font-mono">134.122.12.199:8090</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Cards */}
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {collections.map((col) => (
            <Card key={col.name} className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <col.icon className="h-4 w-4 text-primary" />
                    {col.label}
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {col.total.toLocaleString()} records
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Fields:</p>
                <div className="flex flex-wrap gap-1">
                  {col.fields.map((field) => (
                    <Badge key={field} variant="outline" className="text-[10px] font-mono">
                      {field}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Coverage */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Market Data Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Live</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead className="text-right">Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SYMBOLS.map((sym) => {
                  const count = bySymbol[sym.name] || 0;
                  const maxCount = Math.max(...Object.values(bySymbol).map(Number), 1);
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

                  return (
                    <TableRow key={sym.name}>
                      <TableCell className="font-mono text-sm font-medium">{sym.label}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            sym.type === "forex"
                              ? "text-chart-1"
                              : sym.type === "commodity"
                              ? "text-chart-4"
                              : sym.type === "crypto"
                              ? "text-chart-5"
                              : "text-chart-2"
                          )}
                        >
                          {sym.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            sym.isLive ? "bg-success" : "bg-muted-foreground"
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
