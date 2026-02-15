import { NextRequest, NextResponse } from "next/server";
import { pbFetch } from "@/lib/pocketbase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const { searchParams } = request.nextUrl;
  const count = searchParams.get("count") || "500";

  try {
    const res = await pbFetch(
      `/api/collections/market_data/records?filter=${encodeURIComponent(
        `symbol="${symbol}"`
      )}&sort=-timestamp&perPage=${count}`
    );
    const data = await res.json();

    // Transform to candlestick format, sorted chronologically
    const candles = (data.items || [])
      .map((r: Record<string, unknown>) => ({
        time: Math.floor(new Date(r.timestamp as string).getTime() / 1000),
        open: Number(r.open),
        high: Number(r.high),
        low: Number(r.low),
        close: Number(r.close),
        volume: Number(r.volume || 0),
      }))
      .sort((a: { time: number }, b: { time: number }) => a.time - b.time);

    return NextResponse.json(candles);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch candles" },
      { status: 500 }
    );
  }
}
