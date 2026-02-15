# 📊 Trading Dashboard — Plain-English Guide

> This is the live dashboard for the Institutional ICC Trading Agent system.
> **Live at:** https://trading-dashboard-seven-sage.vercel.app/

---

## What Is This Dashboard?

This is a **visual command center** for monitoring an automated AI trading system.
Instead of reading raw logs or code, you can see everything at a glance:
- How the AI is performing (win rate, total reward)
- What trades it has made (recent history)
- Which strategies are working best (reward chart)
- Whether the system is healthy (database connection status)

---

## Pages

| Page | What It Shows |
|------|-------------|
| **Dashboard** (`/`) | Overview with KPI cards, recent trades, and reward chart |
| **Strategies** (`/strategies`) | Scoring system — how the AI earns/loses points |
| **Trades** (`/trades`) | Full trade history log |
| **Training** (`/training`) | AI learning progress over time |
| **Market** (`/market`) | Live TradingView price charts |
| **Database** (`/database`) | PocketBase health and data coverage |

---

## How It Works

1. **Data Source:** PocketBase (a lightweight database) stores all training experiences
2. **Frontend:** Next.js (React) fetches data server-side for fast loading
3. **Deployment:** Automatically deployed on Vercel from this GitHub repo
4. **Styling:** Tailwind CSS with shadcn/ui components

---

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard page — fetches data and renders the overview |
| `app/layout.tsx` | Shared layout with navigation sidebar |
| `components/dashboard/` | Dashboard-specific UI components (cards, charts, tables) |
| `components/layout/` | Navigation and layout components |
| `lib/pocketbase.ts` | PocketBase connection helper |
| `lib/types.ts` | TypeScript type definitions for trade records |
| `lib/constants.ts` | Shared constants (scoring rules, strategy names) |

---

## The Scoring System

The AI earns and loses points based on its trading decisions:
- **+10 points** for a profitable trade
- **-10 points** for a losing trade
- **+5 bonus** for correctly using the ICC strategy
- **-2 penalty** for holding a trade too long (4+ hours)
- **-20 penalty** for trading during high-impact news events

This point system teaches the AI what "good trading" looks like.
