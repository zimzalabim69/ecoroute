import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_IP = 10;
const WINDOW_MS = 60_000;

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX_PER_IP) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    entry.count++;
  } else {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const key = process.env.CRIMEOMETER_API_KEY;
  if (!key) {
    // Graceful fallback with mock data
    return NextResponse.json({
      score: 50,
      label: "Caution",
      warning: "CRIMEOMETER_API_KEY not set. Using fallback data.",
    });
  }

  try {
    const url = new URL("https://api.crimeometer.com/v1/crime-score");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lng);
    url.searchParams.set("distance", "1mi");

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { score: 50, label: "Caution" },
        { status: 200 }
      );
    }

    const raw = (await res.json()) as Record<string, unknown>;
    const score = Number(raw.crime_score ?? raw.score ?? 50);
    const label: "Safe" | "Caution" | "Avoid" =
      score >= 75 ? "Avoid" : score >= 40 ? "Caution" : "Safe";

    return NextResponse.json({ score, label });
  } catch {
    return NextResponse.json({ score: 50, label: "Caution" });
  }
}
