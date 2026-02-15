import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { RewardChart } from "@/components/dashboard/reward-chart";
import { PBList, ExperienceRecord, StatsResponse } from "@/lib/types";

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  // Fetch data server-side — but since these call our own API routes which need the server running,
  // use pbFetch directly for server components
  const { pbFetch } = await import("@/lib/pocketbase");

  let trades: ExperienceRecord[] = [];
  let totalTrades = 0;
  let healthy = false;

  try {
    const [expRes, healthRes] = await Promise.all([
      pbFetch("/api/collections/experiences/records?sort=-created&perPage=200"),
      pbFetch("/api/health", { cache: "no-store" }),
    ]);
    const expData = await expRes.json();
    trades = expData.items || [];
    totalTrades = expData.totalItems || 0;
    healthy = healthRes.ok;
  } catch {
    // PB unavailable
  }

  const totalReward = trades.reduce((sum, t) => sum + (t.reward || 0), 0);
  const wins = trades.filter((t) => t.reward > 0).length;
  const winRate = totalTrades > 0 ? (wins / trades.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trading Agent Dashboard</h1>
      <SummaryCards totalTrades={totalTrades} totalReward={totalReward} winRate={winRate} healthy={healthy} />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentTrades trades={trades} />
        <RewardChart trades={trades} />
      </div>
    </div>
  );
}
