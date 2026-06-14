import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Favorite } from "@/types";

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const favorites: Favorite[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    stationId: row.station_id,
    stationName: row.station_name,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
  }));

  return NextResponse.json(favorites);
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { stationId, stationName, lat, lng } = body;

  if (
    typeof stationId !== "number" ||
    typeof stationName !== "string" ||
    typeof lat !== "number" ||
    typeof lng !== "number"
  ) {
    return NextResponse.json(
      { error: "Invalid input. Required: stationId, stationName, lat, lng" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: user.id,
      station_id: stationId,
      station_name: stationName,
      lat,
      lng,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const favorite: Favorite = {
    id: data.id,
    userId: data.user_id,
    stationId: data.station_id,
    stationName: data.station_name,
    lat: data.lat,
    lng: data.lng,
    createdAt: data.created_at,
  };

  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(req: NextRequest) {
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { stationId } = body;

  if (typeof stationId !== "number") {
    return NextResponse.json(
      { error: "Invalid input. Required: stationId as number" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("station_id", stationId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
