import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { RewardChart } from "@/components/dashboard/reward-chart";
import { TrainingExperienceRecord } from "@/lib/types";

export default async function DashboardPage() {
  const { pbFetch } = await import("@/lib/pocketbase");

  let trades: TrainingExperienceRecord[] = [];
  let totalTrades = 0;
  let healthy = false;

  try {
    const [expRes, healthRes] = await Promise.all([
      pbFetch("/api/collections/training_experiences/records?perPage=200"),
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
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trading Agent Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Welcome to the command center. This page shows the overall health of the autonomous trading system.
          The AI runs three strategies — <strong>ICC</strong> (Institutional), <strong>Mean Reversion</strong> (Statistical),
          and <strong>Green Wall</strong> (Momentum) — and learns from every trade it makes.
          The cards below show how many training episodes have run, the cumulative reward score, and the win rate.
        </p>
      </div>
      <SummaryCards totalTrades={totalTrades} totalReward={totalReward} winRate={winRate} healthy={healthy} />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentTrades trades={trades} />
        <RewardChart trades={trades} />
      </div>
    </div>
  );
}
