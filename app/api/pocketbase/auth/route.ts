import { NextResponse } from "next/server";

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

export async function GET() {
  const start = Date.now();
  try {
    const res = await fetch(`${PB_URL}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ healthy: true, latency, data });
    }
    return NextResponse.json({ healthy: false, latency, error: `Status ${res.status}` });
  } catch (e) {
    return NextResponse.json({
      healthy: false,
      latency: Date.now() - start,
      error: e instanceof Error ? e.message : "Connection failed",
    });
  }
}
