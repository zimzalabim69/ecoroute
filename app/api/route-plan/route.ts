import { NextRequest, NextResponse } from "next/server";
import { planRoute } from "@/lib/ors";
import { handleApiError, validateRequired } from "@/lib/api-utils";

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

    const missing = validateRequired({ from: body.from, to: body.to });
    if (missing) {
      return NextResponse.json(
        { error: "Missing required fields: from and to with numeric lat/lng" },
        { status: 400 }
      );
    }

    if (
      typeof fromLat !== "number" ||
      typeof fromLng !== "number" ||
      typeof toLat !== "number" ||
      typeof toLng !== "number"
    ) {
      return NextResponse.json(
        { error: "All lat/lng values must be numbers" },
        { status: 400 }
      );
    }

    if (
      body.avoidPolygons !== undefined &&
      (!Array.isArray(body.avoidPolygons) ||
        !body.avoidPolygons.every(
          (p) => p && typeof p === "object" && Array.isArray(p.coordinates)
        ))
    ) {
      return NextResponse.json(
        { error: "avoidPolygons must be an array of GeoJSON Polygon objects" },
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
    return handleApiError(err);
  }
}
