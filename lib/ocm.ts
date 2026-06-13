import { EVStation } from "@/types";

const OCM_BASE = "https://api.openchargemap.io/v3/poi";

export async function fetchStations(
  lat: number,
  lng: number,
  distanceKm: number = 10
): Promise<EVStation[]> {
  const url = new URL(OCM_BASE);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("distance", distanceKm.toString());
  url.searchParams.set("distanceunit", "KM");
  url.searchParams.set("maxresults", "200");
  url.searchParams.set("compact", "true");
  url.searchParams.set("verbose", "false");
  url.searchParams.set("includecomments", "false");
  url.searchParams.set("camelcase", "true");
  const key = process.env.NEXT_PUBLIC_OCM_API_KEY;
  if (key) url.searchParams.set("key", key);

  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`OCM fetch failed: ${res.status}`);

  const data = await res.json();
  return data.map(parseStation).filter(Boolean) as EVStation[];
}

function parseStation(raw: Record<string, unknown>): EVStation | null {
  const addr = raw.addressInfo as Record<string, unknown> | undefined;
  if (!addr) return null;

  const connections = (raw.connections ?? []) as Record<string, unknown>[];
  const connectors = connections.map((c) => ({
    type: ((c.connectionType as Record<string, unknown>)?.title as string) || "Unknown",
    powerKW: (c.powerKW as number) || 0,
    status: ((c.statusType as Record<string, unknown>)?.title as string) || "Unknown",
  }));

  const mediaItems = (raw.mediaItems ?? []) as Record<string, unknown>[];
  const photos = mediaItems.map((m) => m.itemThumbnailUrl as string).filter(Boolean);

  return {
    id: raw.id as number,
    name: (addr.title as string) || "Unnamed Station",
    address: `${(addr.addressLine1 as string) || ""}, ${(addr.town as string) || ""}, ${(addr.stateOrProvince as string) || ""}`.replace(
      /^,\s*|,\s*$/g,
      ""
    ),
    lat: addr.latitude as number,
    lng: addr.longitude as number,
    connectors,
    isFree: ((raw.usageCost as string) || "").toLowerCase().includes("free"),
    photos,
    checkinCount: (raw.numberOfPoints as number) || 0,
    averageRating: (raw.userRating as Record<string, unknown>)?.rating as number | undefined,
  };
}
