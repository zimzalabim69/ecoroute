import { RoutePlanResult, RouteStep } from "@/types";

const ORS_BASE = "https://api.openrouteservice.org/v2/directions/driving-car";

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lng / 1e5, lat / 1e5]);
  }

  return points;
}

export async function planRoute(
  from: [number, number],
  to: [number, number],
  routeOptions?: { avoidPolygons?: Record<string, unknown>[] },
  signal?: AbortSignal
): Promise<RoutePlanResult> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    throw new Error("ORS_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    coordinates: [from, to],
    instructions: true,
    units: "m",
  };

  if (routeOptions?.avoidPolygons && routeOptions.avoidPolygons.length > 0) {
    const polygons = routeOptions.avoidPolygons;
    if (polygons.length === 1) {
      body.options = { avoid_polygons: polygons[0] };
    } else {
      body.options = {
        avoid_polygons: {
          type: "MultiPolygon",
          coordinates: polygons.map((p) => p.coordinates),
        },
      };
    }
  }

  const res = await fetch(ORS_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ORS request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const routes = data.routes as Array<Record<string, unknown>> | undefined;
  const route = routes?.[0];
  if (!route) {
    throw new Error("ORS response missing routes");
  }

  const summary = (route.summary as Record<string, unknown>) || {};
  const geometry = route.geometry;

  let coords: [number, number][] = [];
  if (typeof geometry === "string") {
    coords = decodePolyline(geometry);
  } else if (
    geometry &&
    typeof geometry === "object" &&
    !Array.isArray(geometry) &&
    Array.isArray((geometry as Record<string, unknown>).coordinates)
  ) {
    coords = (geometry as Record<string, unknown>).coordinates as [number, number][];
  }

  const instructions: RouteStep[] = [];
  const segments = route.segments as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(segments)) {
    for (const segment of segments) {
      const steps = segment.steps as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(steps)) {
        for (const step of steps) {
          instructions.push({
            instruction: (step.instruction as string) || "",
            distanceM: (step.distance as number) || 0,
            durationSec: (step.duration as number) || 0,
            maneuver: step.type !== undefined ? String(step.type) : undefined,
          });
        }
      }
    }
  }

  return {
    distanceM: (summary.distance as number) || 0,
    durationSec: (summary.duration as number) || 0,
    geometry: coords,
    instructions,
    chargingStops: [],
  };
}
