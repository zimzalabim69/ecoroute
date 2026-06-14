import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Favorite } from "@/types";

export async function GET() {
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { favoriteId } = body;

  if (typeof favoriteId !== "string") {
    return NextResponse.json(
      { error: "Invalid input. Required: favoriteId" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
