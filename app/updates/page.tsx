"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePolling } from "@/lib/hooks/use-polling";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wifi, DollarSign, Activity, Clock } from "lucide-react";

interface OandaData {
  account: {
    balance: string;
    nav: string;
    unrealizedPL: string;
    currency: string;
    openTradeCount: number;
  };
  openTrades: {
    id: string;
    instrument: string;
    units: string;
    price: string;
    unrealizedPL: string;
    openTime: string;
    type: string;
  }[];
  closedTrades: {
    id: string;
    instrument: string;
    units: string;
    price: string;
    pl: string;
    time: string;
    type: string;
  }[];
  error?: string;
}

function fmt(val: string | number | undefined, decimals = 2) {
  if (val === undefined || val === null) return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "—";
  return n.toFixed(decimals);
}

function fmtTime(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function UpdatesPage() {
  const { data, loading, error } = usePolling<OandaData>(
    "/api/pocketbase/oanda",
    10000 // refresh every 10s
  );

  const balance = parseFloat(data?.account?.balance || "0");
  const nav = parseFloat(data?.account?.nav || "0");
  const unrealized = parseFloat(data?.account?.unrealizedPL || "0");
  const openTrades = data?.openTrades || [];
  const closedTrades = data?.closedTrades || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Live Updates</h1>
        <Badge variant="outline" className="gap-1 text-green-400 border-green-400/40 bg-green-400/10 animate-pulse">
          <Wifi size={10} />
          Live · 10s
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Real-time view of your OANDA demo account. Shows live open positions and recent closed trades placed by the AI agent.
        Refreshes every 10 seconds automatically.
      </p>

      {/* Account Summary */}
      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : data?.error ? (
        <Card className="trading-card border-destructive/50">
          <CardContent className="pt-4 text-destructive text-sm">
            OANDA connection error: {data.error}. Check that OANDA_API_KEY is set in Vercel env vars.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-xl font-bold font-mono">${parseFloat(data?.account?.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <Activity className="h-8 w-8 text-chart-4" />
              <div>
                <p className="text-xs text-muted-foreground">NAV</p>
                <p className="text-xl font-bold font-mono">${parseFloat(data?.account?.nav || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              {unrealized >= 0
                ? <TrendingUp className="h-8 w-8 text-green-400" />
                : <TrendingDown className="h-8 w-8 text-destructive" />}
              <div>
                <p className="text-xs text-muted-foreground">Unrealized P&L</p>
                <p className={cn("text-xl font-bold font-mono", unrealized >= 0 ? "text-green-400" : "text-destructive")}>
                  {unrealized >= 0 ? "+" : ""}{fmt(unrealized)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-xs text-muted-foreground">Open Trades</p>
                <p className="text-xl font-bold font-mono">{data?.account?.openTradeCount ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Open Trades */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Open Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : openTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No open positions right now</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Entry Price</TableHead>
                  <TableHead className="text-right">Unrealized P&L</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openTrades.map(t => {
                  const units = parseFloat(t.units);
                  const pnl = parseFloat(t.unrealizedPL);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono font-medium">{t.instrument}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{Math.abs(units).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(t.price, 5)}</TableCell>
                      <TableCell className={cn("text-right font-mono text-xs font-medium", pnl >= 0 ? "text-green-400" : "text-destructive")}>
                        {pnl >= 0 ? "+" : ""}{fmt(pnl)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtTime(t.openTime)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", units > 0 ? "text-green-400 border-green-400/40" : "text-destructive border-destructive/40")}>
                          {units > 0 ? "LONG" : "SHORT"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Closed Trades */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Closed Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : closedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No closed trades yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Fill Price</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closedTrades.map(t => {
                  const pl = parseFloat(t.pl || "0");
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono font-medium">{t.instrument || "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{t.units ? Math.abs(parseFloat(t.units)).toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(t.price, 5)}</TableCell>
                      <TableCell className={cn("text-right font-mono text-xs font-medium", pl >= 0 ? "text-green-400" : "text-destructive")}>
                        {pl >= 0 ? "+" : ""}{fmt(pl)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtTime(t.time)}</TableCell>
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
