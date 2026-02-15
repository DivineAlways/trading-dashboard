"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrainingExperienceRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const strategyColors: Record<string, string> = {
  ICC: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  Mean_Reversion: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Green_Wall: "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

export function RecentTrades({ trades }: { trades: TrainingExperienceRecord[] }) {
  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Training Episodes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Reward</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No episodes yet
                </TableCell>
              </TableRow>
            )}
            {trades.slice(0, 10).map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {trade.state?.time
                    ? new Date(trade.state.time).toLocaleString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })
                    : "\u2014"}
                </TableCell>
                <TableCell className="font-mono text-xs">{trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", strategyColors[trade.strategy])}>
                    {trade.strategy === "Mean_Reversion" ? "MR" : trade.strategy === "Green_Wall" ? "GW" : trade.strategy}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {trade.action?.type || "\u2014"}
                </TableCell>
                <TableCell className={cn("text-right font-mono text-xs", (trade.reward || 0) >= 0 ? "text-success" : "text-destructive")}>
                  {(trade.reward || 0) >= 0 ? "+" : ""}{trade.reward?.toFixed(1) ?? "\u2014"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
