import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { renderOGImage } from "@/lib/og-chart";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const savings      = clamp(parseInt(searchParams.get("savings")   ?? "4000",  10), 0,      20_000);
  const expenses     = clamp(parseInt(searchParams.get("expenses")  ?? "3000",  10), 500,    20_000);
  const startPortfolio = clamp(parseInt(searchParams.get("portfolio") ?? "50000", 10), 0, 10_000_000);

  return new ImageResponse(
    renderOGImage({ savings, expenses, startPortfolio }),
    {
      ...SIZE,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
