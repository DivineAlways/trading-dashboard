import { NextResponse } from "next/server";

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const OANDA_KEY = process.env.OANDA_API_KEY || "";
const OANDA_ACCOUNT = process.env.OANDA_ACCOUNT_ID || "101-001-38200759-001";
const OANDA_BASE = "https://api-fxpractice.oanda.com";

async function oandaFetch(path: string) {
  const res = await fetch(`${OANDA_BASE}${path}`, {
    headers: { Authorization: `Bearer ${OANDA_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`OANDA ${path} failed: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const [accountData, openTrades, recentTx] = await Promise.all([
      oandaFetch(`/v3/accounts/${OANDA_ACCOUNT}/summary`),
      oandaFetch(`/v3/accounts/${OANDA_ACCOUNT}/trades?state=OPEN`),
      oandaFetch(`/v3/accounts/${OANDA_ACCOUNT}/transactions?pageSize=50`),
    ]);

    const account = accountData.account || {};

    // Get last 50 closed trades from transactions
    const txRes = await fetch(
      `${OANDA_BASE}/v3/accounts/${OANDA_ACCOUNT}/transactions?type=ORDER_FILL&pageSize=50`,
      { headers: { Authorization: `Bearer ${OANDA_KEY}` }, cache: "no-store" }
    );
    const txData = txRes.ok ? await txRes.json() : { transactions: [] };
    const closed = (txData.transactions || [])
      .filter((t: Record<string, string>) => t.type === "ORDER_FILL")
      .map((t: Record<string, string | number>) => ({
        id: t.id,
        instrument: t.instrument,
        units: t.units,
        price: t.price,
        pl: t.pl,
        time: t.time,
        type: "closed",
      }))
      .reverse();

    return NextResponse.json({
      account: {
        balance: account.balance,
        nav: account.NAV,
        unrealizedPL: account.unrealizedPL,
        currency: account.currency,
        openTradeCount: account.openTradeCount,
      },
      openTrades: (openTrades.trades || []).map((t: Record<string, string | number>) => ({
        id: t.id,
        instrument: t.instrument,
        units: t.currentUnits,
        price: t.price,
        unrealizedPL: t.unrealizedPL,
        openTime: t.openTime,
        type: "open",
      })),
      closedTrades: closed,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch OANDA data" },
      { status: 500 }
    );
  }
}
