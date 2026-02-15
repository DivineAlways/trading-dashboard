"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ExperienceRecord } from "@/lib/types";

const COLORS: Record<string, string> = {
  ICC: "hsl(263, 70%, 50%)",
  Mean_Reversion: "hsl(29, 70%, 50%)",
  Green_Wall: "hsl(145, 60%, 40%)",
};

export function RewardChart({ trades }: { trades: ExperienceRecord[] }) {
  const byStrategy: Record<string, number> = {};
  for (const t of trades) {
    byStrategy[t.strategy] = (byStrategy[t.strategy] || 0) + (t.reward || 0);
  }

  const data = Object.entries(byStrategy).map(([name, value]) => ({
    name: name === "Mean_Reversion" ? "Mean Rev" : name === "Green_Wall" ? "Green Wall" : name,
    value: Math.abs(value),
    rawValue: value,
    key: name,
  }));

  if (data.length === 0) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Reward by Strategy</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          No data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Reward by Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
              {data.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key] || "#888"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
              formatter={(_, name, props) => [`${props.payload.rawValue >= 0 ? "+" : ""}${props.payload.rawValue.toFixed(1)} pts`, name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
