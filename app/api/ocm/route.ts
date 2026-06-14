import { NextRequest, NextResponse } from "next/server";

const OCM_BASE = "https://api.openchargemap.io/v3/poi";

export async function GET(req: NextRequest) {
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
  if (!key) {
    return NextResponse.json(
      { error: "OCM_API_KEY not configured. Get a free key at https://openchargemap.org/site/develop#api" },
      { status: 403 }
    );
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
