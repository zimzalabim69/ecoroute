import { NextRequest, NextResponse } from "next/server";
import { WeatherAlert } from "@/types";
import { handleApiError, validateRequired } from "@/lib/api-utils";
import { TTLCache } from "@/lib/cache";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const cache = new TTLCache<WeatherAlert[]>(CACHE_TTL_MS);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const missing = validateRequired({ lat, lng });
    if (missing) {
      return NextResponse.json(
        { error: `${missing} is required` },
        { status: 400 }
      );
    }

    const cacheKey = `${lat},${lng}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
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

    cache.set(cacheKey, alerts);
    return NextResponse.json(alerts);
  } catch (err: unknown) {
    return handleApiError(err);
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
