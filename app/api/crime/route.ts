import { NextRequest, NextResponse } from "next/server";
import { computeCrimeRisk } from "@/lib/crime-heuristic";

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_IP = 30;
const WINDOW_MS = 60_000;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
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

  if (
    !isNaN(Number(lat)) && !isNaN(Number(lng)) &&
    Number(lat) >= -90 && Number(lat) <= 90 &&
    Number(lng) >= -180 && Number(lng) <= 180
  ) {
    // valid
  } else {
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
  }

  const score = computeCrimeRisk(Number(lat), Number(lng));
  return NextResponse.json(score);
}
