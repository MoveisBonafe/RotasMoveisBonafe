export interface Location {
  id: number;
  name: string;
  address: string;
  cep?: string;
  lat: string;
  lng: string;
  isOrigin: boolean;
}

export interface VehicleType {
  id: number;
  name: string;
  type: 'car' | 'motorcycle' | 'truck1' | 'truck2';
  fuelEfficiency: number; // km/liter * 10
  tollMultiplier: number; // percentage multiplier
}

export interface PointOfInterest {
  id: number;
  name: string;
  type: 'toll' | 'weighing_station';
  lat: string;
  lng: string;
  cost?: number; // in cents
  restrictions?: string;
  roadName?: string;
}

export interface CityEvent {
  id: number;
  cityName: string;
  eventName: string;
  eventType: 'holiday' | 'festival' | 'anniversary';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
}

export interface TruckRestriction {
  id: number;
  cityName: string;
  restriction: string;
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  applicableVehicles: string;
  description?: string;
}

export interface RouteWaypoint {
  location: Location;
  stopover: boolean;
}

export interface RouteInfo {
  waypoints: Location[];
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  tollCost: number; // in cents
  fuelCost: number; // in cents
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId: string;
}

export type TabType = 'summary' | 'events' | 'restrictions';

export type IconType = 'toll' | 'weighing_station' | 'origin' | 'destination' | 'waypoint';

export interface ParsedCepFile {
  locations: Array<{
    cep: string;
    name: string;
  }>;
}

export interface GeocodingResult {
  name: string;
  address: string;
  cep?: string;
  lat: string;
  lng: string;
  placeId?: string;
}
