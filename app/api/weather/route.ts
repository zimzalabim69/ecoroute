import { NextRequest, NextResponse } from "next/server";
import { WeatherAlert } from "@/types";

interface CacheEntry {
  data: WeatherAlert[];
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng are required" },
        { status: 400 }
      );
    }

    const cacheKey = `${lat},${lng}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data);
    }

    const res = await fetch(
      `https://api.weather.gov/alerts/active?point=${lat},${lng}`,
      {
        headers: {
          "User-Agent": "EcoRoute/1.0 (ecoroute@example.com)",
          Accept: "application/geo+json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Weather service unavailable" },
        { status: res.status }
      );
    }

    const data = (await res.json()) as Record<string, unknown>;
    const features = (data.features as Array<Record<string, unknown>>) ?? [];

    const alerts: WeatherAlert[] = features.map((feature) => {
      const props = (feature.properties as Record<string, unknown>) || {};
      const severity = (props.severity as string) || "Unknown";
      const areaDesc = (props.areaDesc as string) || "";

      return {
        event: (props.event as string) || "Unknown",
        severity: validateSeverity(severity),
        headline: (props.headline as string) || "",
        description: (props.description as string) || "",
        effective: (props.effective as string) || "",
        expires: (props.expires as string) || "",
        areas: areaDesc
          ? areaDesc.split(/;|,/).map((s) => s.trim()).filter(Boolean)
          : [],
      };
    });

    cache.set(cacheKey, { data: alerts, expires: now + CACHE_TTL_MS });
    return NextResponse.json(alerts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function validateSeverity(
  value: string
): "Minor" | "Moderate" | "Severe" | "Extreme" {
  const valid = ["Minor", "Moderate", "Severe", "Extreme"];
  if (valid.includes(value)) {
    return value as "Minor" | "Moderate" | "Severe" | "Extreme";
  }
  return "Minor";
}
