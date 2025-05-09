import { IconType, PointOfInterest, Location } from "./types";

// Icon type for Google Maps markers
interface Icon {
  url: string;
  scaledSize?: {
    width: number;
    height: number;
  };
  anchor?: {
    x: number;
    y: number;
  };
}

/**
 * Returns a custom icon for different map markers
 */
export function getMarkerIcon(type: IconType): Icon {
  const baseSize = 36;
  
  switch (type) {
    case 'toll':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-toll',
        scaledSize: { width: baseSize, height: baseSize },
        anchor: { x: baseSize/2, y: baseSize/2 },
      };
    case 'weighing_station':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-weight',
        scaledSize: { width: baseSize, height: baseSize },
        anchor: { x: baseSize/2, y: baseSize/2 },
      };
    case 'origin':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-home',
        scaledSize: { width: baseSize, height: baseSize },
        anchor: { x: baseSize/2, y: baseSize/2 },
      };
    case 'destination':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-flag',
        scaledSize: { width: baseSize, height: baseSize },
        anchor: { x: baseSize/2, y: baseSize/2 },
      };
    case 'waypoint':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-map-pin',
        scaledSize: { width: baseSize, height: baseSize },
        anchor: { x: baseSize/2, y: baseSize/2 },
      };
    default:
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-map-pin',
        scaledSize: { width: baseSize, height: baseSize },
        anchor: { x: baseSize/2, y: baseSize/2 },
      };
  }
}

// Define a LatLng interface to avoid direct Google Maps references
interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Filter points of interest that are within a certain distance of the route
 * 
 * @param pois Array of points of interest
 * @param route Array of route path coordinates
 * @param maxDistanceKm Maximum distance in kilometers
 * @returns Array of points of interest along the route
 */
export function filterPointsOfInterestAlongRoute(
  pois: PointOfInterest[],
  route: any[], // Accept any array type since we can't reference Google Maps types directly
  maxDistanceKm: number = 2
): PointOfInterest[] {
  if (!pois || !route || !route.length || !window.google) {
    return [];
  }

  return pois.filter(poi => {
    const poiLatLng = {
      lat: parseFloat(poi.lat),
      lng: parseFloat(poi.lng)
    };
    
    // Find the minimum distance from the POI to any point on the route
    let minDistance = Infinity;
    
    for (const routePoint of route) {
      // If Google Maps geometry library is available, use it to calculate distance
      if (window.google && window.google.maps && window.google.maps.geometry) {
        const poiGoogleLatLng = new window.google.maps.LatLng(poiLatLng.lat, poiLatLng.lng);
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          poiGoogleLatLng,
          routePoint
        ) / 1000; // Convert to kilometers
        
        minDistance = Math.min(minDistance, distance);
        
        if (minDistance <= maxDistanceKm) {
          return true;
        }
      } else {
        // Fallback to a simple distance calculation if Google Maps geometry is not available
        const simpleDistance = calculateHaversineDistance(
          poiLatLng.lat, poiLatLng.lng, 
          routePoint.lat(), routePoint.lng()
        );
        
        minDistance = Math.min(minDistance, simpleDistance);
        
        if (minDistance <= maxDistanceKm) {
          return true;
        }
      }
    }
    
    return false;
  });
}

/**
 * Calculate distance between two points using the Haversine formula
 * This is a fallback when Google Maps geometry library is not available
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

/**
 * Formats a distance in meters to a human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)} km`;
}

/**
 * Formats a duration in seconds to a human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  }
  
  return `${hours}h ${minutes}min`;
}

/**
 * Formats an amount in cents to a human-readable currency string
 */
export function formatCurrency(cents: number): string {
  const reais = cents / 100;
  return `R$ ${reais.toFixed(2)}`;
}

/**
 * Creates a LatLng object from a Location
 */
export function locationToLatLng(location: Location): LatLng {
  return {
    lat: parseFloat(location.lat),
    lng: parseFloat(location.lng)
  };
}

/**
 * Formats a route sequence as a string
 */
export function formatRouteSequence(locations: Location[]): string {
  if (locations.length === 0) {
    return "";
  }
  
  const names = locations.map(location => location.name);
  return names.join(" → ");
}
