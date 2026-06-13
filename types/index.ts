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
