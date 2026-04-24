import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { description } = await req.json();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 80,
        messages: [{
          role: "user",
          content: `Categorize this expense. Respond ONLY with valid JSON, no markdown:
Description: "${description}"
Categories: food, transport, housing, subscriptions, healthcare, entertainment, shopping, work, other
Format: {"category":"food","tags":[]}
Pick the most specific category.`,
        }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();
    if (text) return NextResponse.json(JSON.parse(text));
  } catch { /* fall through */ }

  return NextResponse.json({ category: "other", tags: [] });
}
