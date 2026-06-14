import { NextRequest, NextResponse } from "next/server";
import type { SafeRouteResult, RoutePlanResult } from "@/types";
import { computeCrimeRisk } from "@/lib/crime-heuristic";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return { allowed: true };
}

function isNightMode(): boolean {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

function samplePointsAlongRoute(
  geometry: [number, number][],
  count: number
): [number, number][] {
  if (geometry.length <= count) return geometry;
  const points: [number, number][] = [];
  const step = geometry.length / count;
  for (let i = 0; i < count; i++) {
    const idx = Math.min(Math.floor(i * step), geometry.length - 1);
    points.push(geometry[idx]);
  }
  return points;
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const limit = checkRateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter ?? 60) },
      }
    );
  }

  try {
    const body = await req.json();
    const from = body.from as { lat: number; lng: number };
    const to = body.to as { lat: number; lng: number };

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to required" },
        { status: 400 }
      );
    }

    // 1. Get route plan
    const routeRes = await fetch(
      `${req.nextUrl.origin}/api/route-plan`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      }
    );
    if (!routeRes.ok) {
      return NextResponse.json(
        { error: "Route planning failed" },
        { status: 502 }
      );
    }
    const routePlan = (await routeRes.json()) as RoutePlanResult;

    // 2. Sample points and compute crime scores locally (zero API calls)
    const samples = samplePointsAlongRoute(routePlan.geometry, 10);
    const crimeScores = samples.map(([lng, lat]) => computeCrimeRisk(lat, lng));

    const avgScore =
      crimeScores.reduce((sum, s) => sum + s.score, 0) / crimeScores.length;
    const safetyScore = Math.max(0, Math.min(100, 100 - avgScore));
    const hasAvoid = crimeScores.some((s) => s.label === "Avoid");
    const nightMode = isNightMode();

    const warnings: string[] = [];
    if (hasAvoid) {
      warnings.push("Route passes through high-risk areas. Consider re-routing.");
    }
    if (nightMode && safetyScore < 60) {
      warnings.push(
        "Night mode active: this route has lower safety scores. Stay alert or choose a safer route."
      );
    }

    const result: SafeRouteResult = {
      route: routePlan,
      safetyScore,
      warnings,
      nightModeActive: nightMode,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
