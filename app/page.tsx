/**
 * MAIN DASHBOARD PAGE — Trading Agent Overview
 *
 * This is the homepage of the live trading dashboard.
 * It fetches data from PocketBase (our database) and displays:
 *
 * 1. SUMMARY CARDS — Four key metrics at a glance:
 *    - Total Episodes: How many training cycles the AI has completed
 *    - Total Reward: The cumulative score (positive = doing well)
 *    - Win Rate: What percentage of trades were profitable
 *    - System Status: Is PocketBase connected and healthy?
 *
 * 2. RECENT TRADES — A table of the latest trading actions
 *
 * 3. REWARD CHART — Visual breakdown showing which strategies are performing best
 *
 * This is a Server Component (no "use client") — data is fetched at request time
 * on the server, so the page loads fast and SEO-friendly.
 *
 * Data source: PocketBase collection "training_experiences"
 * Live at: https://trading-dashboard-seven-sage.vercel.app/
 */

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { RewardChart } from "@/components/dashboard/reward-chart";
import { TrainingExperienceRecord } from "@/lib/types";

export default async function DashboardPage() {
  // Import PocketBase client — handles the connection to our database
  const { pbFetch } = await import("@/lib/pocketbase");

  let trades: TrainingExperienceRecord[] = [];  // Will hold all training experience records
  let totalTrades = 0;                          // Total number of trades in the database
  let healthy = false;                          // Whether PocketBase is online and responding

  try {
    // Fetch two things at the same time (parallel requests for speed):
    // 1. The last 200 training experience records (trades + rewards)
    // 2. A health check to confirm PocketBase is running
    const [expRes, healthRes] = await Promise.all([
      pbFetch("/api/collections/training_experiences/records?perPage=200"),
      pbFetch("/api/health", { cache: "no-store" }),
    ]);
    const expData = await expRes.json();
    trades = expData.items || [];
    totalTrades = expData.totalItems || 0;
    healthy = healthRes.ok;  // true if PocketBase responded with 200 OK
  } catch {
    // If PocketBase is down, we gracefully show zeros instead of crashing
  }

  // Calculate key performance metrics from the trade data:
  // Total Reward: Sum of all individual trade rewards (positive = profit, negative = loss)
  const totalReward = trades.reduce((sum, t) => sum + (t.reward || 0), 0);
  // Win count: How many trades had a positive reward
  const wins = trades.filter((t) => t.reward > 0).length;
  // Win Rate: Percentage of profitable trades (e.g., 60% means 6 out of 10 trades were winners)
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trading Agent Dashboard</h1>

      {/* Summary Cards — The four KPI tiles at the top of the dashboard */}
      <SummaryCards totalTrades={totalTrades} totalReward={totalReward} winRate={winRate} healthy={healthy} />

      {/* Two-column grid: Recent Trades (left) and Reward Chart (right) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Trades — Table showing the latest training episodes with strategy, reward, etc. */}
        <RecentTrades trades={trades} />
        {/* Reward Chart — Donut/bar chart showing reward distribution by strategy */}
        <RewardChart trades={trades} />
      </div>
    </div>
  );
}
