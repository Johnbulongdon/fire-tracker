import { NextResponse } from "next/server";

interface CacheEntry {
  rates: Record<string, number>;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function GET() {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache.rates);
  }

  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    const rates: Record<string, number> = data.rates ?? {};
    rates["USD"] = 1;
    cache = { rates, fetchedAt: now };
    return NextResponse.json(rates);
  } catch (err) {
    if (cache) return NextResponse.json(cache.rates); // stale is fine
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
