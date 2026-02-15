"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Target, Server } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalTrades: number;
  totalReward: number;
  winRate: number;
  healthy: boolean;
}

export function SummaryCards({ totalTrades, totalReward, winRate, healthy }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Trades",
      value: totalTrades.toString(),
      icon: Activity,
      description: "Closed trades",
    },
    {
      title: "Total Reward",
      value: `${totalReward >= 0 ? "+" : ""}${totalReward.toFixed(1)} pts`,
      icon: TrendingUp,
      description: "Cumulative points",
      valueClass: totalReward >= 0 ? "text-success" : "text-destructive",
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      description: "Profitable trades",
      valueClass: winRate >= 50 ? "text-success" : "text-destructive",
    },
    {
      title: "System Status",
      value: healthy ? "Online" : "Offline",
      icon: Server,
      description: "PocketBase connection",
      valueClass: healthy ? "text-success" : "text-destructive",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="trading-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", card.valueClass)}>{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
