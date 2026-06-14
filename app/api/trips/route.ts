import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TripHistory } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("trip_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trips: TripHistory[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    originName: row.origin_name,
    originLat: row.origin_lat,
    originLng: row.origin_lng,
    destinationName: row.destination_name,
    destinationLat: row.destination_lat,
    destinationLng: row.destination_lng,
    distanceKm: row.distance_km,
    carbonSavedKg: row.carbon_saved_kg,
    safetyScore: row.safety_score ?? 0,
    createdAt: row.created_at,
  }));

  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    originName,
    originLat,
    originLng,
    destinationName,
    destinationLat,
    destinationLng,
    distanceKm,
    carbonSavedKg,
    safetyScore,
  } = body;

  if (
    typeof originName !== "string" ||
    typeof originLat !== "number" ||
    typeof originLng !== "number" ||
    typeof destinationName !== "string" ||
    typeof destinationLat !== "number" ||
    typeof destinationLng !== "number" ||
    typeof distanceKm !== "number" ||
    typeof carbonSavedKg !== "number"
  ) {
    return NextResponse.json(
      { error: "Invalid input. Missing required trip fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("trip_history")
    .insert({
      user_id: user.id,
      origin_name: originName,
      origin_lat: originLat,
      origin_lng: originLng,
      destination_name: destinationName,
      destination_lat: destinationLat,
      destination_lng: destinationLng,
      distance_km: distanceKm,
      carbon_saved_kg: carbonSavedKg,
      safety_score: typeof safetyScore === "number" ? safetyScore : 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trip: TripHistory = {
    id: data.id,
    userId: data.user_id,
    originName: data.origin_name,
    originLat: data.origin_lat,
    originLng: data.origin_lng,
    destinationName: data.destination_name,
    destinationLat: data.destination_lat,
    destinationLng: data.destination_lng,
    distanceKm: data.distance_km,
    carbonSavedKg: data.carbon_saved_kg,
    safetyScore: data.safety_score ?? 0,
    createdAt: data.created_at,
  };

  return NextResponse.json(trip, { status: 201 });
}
