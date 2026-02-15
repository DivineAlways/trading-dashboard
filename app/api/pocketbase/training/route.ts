import { NextRequest, NextResponse } from "next/server";
import { pbFetch } from "@/lib/pocketbase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const strategy = searchParams.get("strategy") || "";
  const symbol = searchParams.get("symbol") || "";
  const perPage = searchParams.get("perPage") || "50";
  const page = searchParams.get("page") || "1";

  const filters: string[] = [];
  if (strategy) filters.push(`strategy="${strategy}"`);
  if (symbol) filters.push(`symbol="${symbol}"`);

  const filterStr = filters.length > 0 ? `&filter=${encodeURIComponent(filters.join("&&"))}` : "";

  try {
    const res = await pbFetch(
      `/api/collections/training_experiences/records?perPage=${perPage}&page=${page}page=${page}sort=-created${filterStr}`
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch training data" },
      { status: 500 }
    );
  }
}
