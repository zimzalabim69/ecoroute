import { NextRequest, NextResponse } from "next/server";
import { planRoute } from "@/lib/ors";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      from?: { lat?: number; lng?: number };
      to?: { lat?: number; lng?: number };
      avoidPolygons?: Record<string, unknown>[];
    };

    const fromLat = body.from?.lat;
    const fromLng = body.from?.lng;
    const toLat = body.to?.lat;
    const toLng = body.to?.lng;

    if (
      fromLat === undefined ||
      fromLng === undefined ||
      toLat === undefined ||
      toLng === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields: from and to with lat/lng" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const result = await planRoute(
      [fromLng, fromLat],
      [toLng, toLat],
      { avoidPolygons: body.avoidPolygons },
      controller.signal
    );

    clearTimeout(timeoutId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
