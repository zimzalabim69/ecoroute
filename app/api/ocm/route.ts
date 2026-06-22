import { NextRequest, NextResponse } from "next/server";

const OCM_BASE = "https://api.openchargemap.io/v3/poi";

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

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const distance = searchParams.get("distance") || "10";

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const url = new URL(OCM_BASE);
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lng);
  url.searchParams.set("distance", distance);
  url.searchParams.set("distanceunit", "KM");
  url.searchParams.set("maxresults", "200");
  url.searchParams.set("compact", "true");
  url.searchParams.set("verbose", "false");
  url.searchParams.set("includecomments", "false");
  url.searchParams.set("camelcase", "true");

  const key = process.env.OCM_API_KEY;
  const isPlaceholder = !key || key.includes("your-") || key.includes("placeholder") || key === "test";

  // DEMO MODE: return mock stations when no real API key is configured
  if (isPlaceholder) {
    const mockStations = generateMockStations(Number(lat), Number(lng), Number(distance));
    return NextResponse.json(mockStations);
  }

  url.searchParams.set("key", key);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "EcoRoute/1.0",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `OCM error: ${res.status}`, details: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateMockStations(centerLat: number, centerLng: number, distanceKm: number) {
  const stations = [];
  const count = Math.min(12, Math.max(6, Math.floor(distanceKm * 1.5)));
  const names = [
    "Tesla Supercharger", "ChargePoint Station", "EVgo Fast Charge", "Electrify America",
    "Volta Charging", "Blink Charging", "Shell Recharge", "Flo Charging",
    "SemaConnect", "Greenlots Station", "Webasto Charging", "ClipperCreek",
  ];
  const types = ["J1772", "CCS", "CHAdeMO", "Tesla"];
  const addresses = [
    "123 Main St", "456 Oak Ave", "789 Pine Rd", "321 Elm Blvd",
    "654 Maple Dr", "987 Cedar Ln", "147 Birch St", "258 Willow Ave",
  ];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = (distanceKm * 0.6 * Math.random()) / 111;
    stations.push({
      id: 1000 + i,
      addressInfo: {
        title: `${names[i % names.length]} #${i + 1}`,
        addressLine1: addresses[i % addresses.length],
        town: "Demo City",
        stateOrProvince: "DC",
        latitude: centerLat + Math.cos(angle) * radius,
        longitude: centerLng + Math.sin(angle) * radius,
      },
      connections: [
        {
          connectionType: { title: types[i % types.length] },
          powerKW: [22, 50, 150, 250][i % 4],
          statusType: { title: "Operational" },
        },
        {
          connectionType: { title: types[(i + 1) % types.length] },
          powerKW: [22, 50, 150][i % 3],
          statusType: { title: "Operational" },
        },
      ],
      mediaItems: [],
      usageCost: i % 3 === 0 ? "Free" : "$0.35/kWh",
      numberOfPoints: Math.floor(Math.random() * 8) + 2,
      userRating: { rating: 3.5 + Math.random() * 1.5 },
    });
  }
  return stations;
}
