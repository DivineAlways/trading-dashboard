import { NextRequest, NextResponse } from "next/server";
import { pbFetch } from "@/lib/pocketbase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get("symbol") || "";
  const perPage = searchParams.get("perPage") || "50";
  const page = searchParams.get("page") || "1";

  const filters: string[] = [];
  if (symbol) filters.push(`symbol="${symbol}"`);

  const filterStr = filters.length > 0 ? `&filter=${encodeURIComponent(filters.join("&&"))}` : "";

  try {
    const res = await pbFetch(
      `/api/collections/market_data/records?sort=-timestamp&perPage=${perPage}&page=${page}${filterStr}`
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
