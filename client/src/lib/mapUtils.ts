import { IconType, PointOfInterest, Location } from "./types";

/**
 * Returns a custom icon for different map markers
 */
export function getMarkerIcon(type: IconType): google.maps.Icon {
  const baseSize = 36;
  
  switch (type) {
    case 'toll':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-toll',
        scaledSize: new google.maps.Size(baseSize, baseSize),
        anchor: new google.maps.Point(baseSize/2, baseSize/2),
      };
    case 'weighing_station':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-weight',
        scaledSize: new google.maps.Size(baseSize, baseSize),
        anchor: new google.maps.Point(baseSize/2, baseSize/2),
      };
    case 'origin':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-home',
        scaledSize: new google.maps.Size(baseSize, baseSize),
        anchor: new google.maps.Point(baseSize/2, baseSize/2),
      };
    case 'destination':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-flag',
        scaledSize: new google.maps.Size(baseSize, baseSize),
        anchor: new google.maps.Point(baseSize/2, baseSize/2),
      };
    case 'waypoint':
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-map-pin',
        scaledSize: new google.maps.Size(baseSize, baseSize),
        anchor: new google.maps.Point(baseSize/2, baseSize/2),
      };
    default:
      return {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/fonts/tabler-icons.svg#tabler-map-pin',
        scaledSize: new google.maps.Size(baseSize, baseSize),
        anchor: new google.maps.Point(baseSize/2, baseSize/2),
      };
  }
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
  route: google.maps.LatLng[],
  maxDistanceKm: number = 2
): PointOfInterest[] {
  return pois.filter(poi => {
    const poiLatLng = new google.maps.LatLng(
      parseFloat(poi.lat),
      parseFloat(poi.lng)
    );
    
    // Find the minimum distance from the POI to any point on the route
    let minDistance = Infinity;
    
    for (const routePoint of route) {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        poiLatLng,
        routePoint
      ) / 1000; // Convert to kilometers
      
      minDistance = Math.min(minDistance, distance);
      
      if (minDistance <= maxDistanceKm) {
        return true;
      }
    }
    
    return false;
  });
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
 * Creates a Google Maps LatLng object from a Location
 */
export function locationToLatLng(location: Location): google.maps.LatLng {
  return new google.maps.LatLng(
    parseFloat(location.lat),
    parseFloat(location.lng)
  );
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
