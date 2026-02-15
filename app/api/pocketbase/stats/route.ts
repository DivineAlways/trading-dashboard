import { NextResponse } from "next/server";
import { pbFetch } from "@/lib/pocketbase";

async function getCollectionCount(collection: string): Promise<number> {
  try {
    const res = await pbFetch(
      `/api/collections/${collection}/records?perPage=1`
    );
    const data = await res.json();
    return data.totalItems || 0;
  } catch {
    return 0;
  }
}

async function getSymbolCounts(): Promise<Record<string, number>> {
  const symbols = [
    "EUR_USD", "GBP_USD", "USD_JPY", "XAU_USD", "BTC_USD",
    "OIL_USD", "SPX500_USD", "US30_USD", "NAS100_USD",
  ];

  const counts: Record<string, number> = {};
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const res = await pbFetch(
          `/api/collections/market_data/records?perPage=1&filter=${encodeURIComponent(
            `symbol="${symbol}"`
          )}`
        );
        const data = await res.json();
        return { symbol, count: data.totalItems || 0 };
      } catch {
        return { symbol, count: 0 };
      }
    })
  );

  for (const r of results) {
    counts[r.symbol] = r.count;
  }
  return counts;
}

export async function GET() {
  try {
    const [marketTotal, expTotal, trainTotal, bySymbol] = await Promise.all([
      getCollectionCount("market_data"),
      getCollectionCount("experiences"),
      getCollectionCount("training_experiences"),
      getSymbolCounts(),
    ]);

    return NextResponse.json({
      market_data: { total: marketTotal, bySymbol },
      experiences: { total: expTotal },
      training_experiences: { total: trainTotal },
      healthy: true,
    });
  } catch (e) {
    return NextResponse.json(
      {
        market_data: { total: 0, bySymbol: {} },
        experiences: { total: 0 },
        training_experiences: { total: 0 },
        healthy: false,
        error: e instanceof Error ? e.message : "Stats fetch failed",
      },
      { status: 500 }
    );
  }
}
