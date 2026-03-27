import { ImageResponse } from "next/og";
import { renderOGImage } from "@/lib/og-chart";

export const runtime     = "edge";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    renderOGImage({ savings: 4000, expenses: 3000, startPortfolio: 50_000 }),
    { ...size },
  );
}
