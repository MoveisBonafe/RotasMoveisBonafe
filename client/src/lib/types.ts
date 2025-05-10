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
  cost?: number | null; // in cents, null para balanças
  restrictions?: string;
  roadName?: string;
  city?: string; // cidade onde está localizado o pedágio
  address?: string; // endereço completo quando disponível
  googlePlaceId?: string; // ID do lugar no Google Places API
  ailogSource?: boolean; // Se veio da API AILOG
  googlePlacesSource?: boolean; // Se veio do Google Places API
  knownHighwaySource?: boolean; // Se veio da lista de pedágios conhecidos
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
  waypoints: Location[];     // Todos os pontos da rota, incluindo origem, destinos e pontos de passagem
  destinations: Location[];  // Apenas os destinos selecionados pelo usuário
  totalDistance: number;     // in meters
  totalDuration: number;     // in seconds
  tollCost: number;          // in cents
  fuelCost: number;          // in cents
  totalCost: number;         // in cents (tollCost + fuelCost)
  fuelConsumption: number;   // in liters
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId: string;
}

export type TabType = 'summary' | 'report';

export type IconType = 'toll' | 'weighing_station' | 'origin' | 'destination' | 'waypoint';

export interface ParsedCepFile {
  locations: Array<{
    cep: string;
    name: string;
    lat?: string;
    lng?: string;
    address?: string;
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

export interface RouteSegment {
  origin: Location;
  destination: Location;
  distance: number; // em metros
  duration: number; // em segundos
  tollCost: number; // em centavos
  polyline: string; // string de codificação polyline
}
