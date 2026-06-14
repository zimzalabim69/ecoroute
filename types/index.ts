export interface EVStation {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  connectors: Connector[];
  isFree?: boolean;
  photos?: string[];
  checkinCount?: number;
  averageRating?: number;
}

export interface Connector {
  type: string;
  powerKW: number;
  status?: string;
}

export interface Checkin {
  id: string;
  stationId: number;
  userId: string;
  status: string;
  rating: number;
  photoUrl?: string;
  note?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  distanceKm: number;
  carbonSavedKg: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  createdAt: string;
}

// --- Route Planning Types ---

export interface RoutePlanResult {
  distanceM: number;
  durationSec: number;
  geometry: [number, number][]; // lng,lat pairs
  instructions: RouteStep[];
  chargingStops: EVStation[];
}

export interface RouteStep {
  instruction: string;
  distanceM: number;
  durationSec: number;
  maneuver?: string;
}

// --- Weather Types ---

export interface WeatherAlert {
  event: string;
  severity: "Minor" | "Moderate" | "Severe" | "Extreme";
  headline: string;
  description: string;
  effective: string;
  expires: string;
  areas: string[];
}

// --- Safety Types ---

export interface CrimeHeatmapPoint {
  lat: number;
  lng: number;
  riskScore: number; // 0-100
  label: "Safe" | "Caution" | "Avoid";
}

export interface SafeRouteResult {
  route: RoutePlanResult;
  safetyScore: number; // 0-100
  warnings: string[];
  nightModeActive: boolean;
}

// --- Favorites & History Types ---

export interface Favorite {
  id: string;
  userId: string;
  stationId: number;
  stationName: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface TripHistory {
  id: string;
  userId: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  distanceKm: number;
  carbonSavedKg: number;
  safetyScore: number;
  createdAt: string;
}
