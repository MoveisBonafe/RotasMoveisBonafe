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
 * Handles undefined/null values gracefully
 */
export function formatCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    cents = 0;
  }
  
  // Usar o Intl.NumberFormat para formatação correta em BRL
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100);
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

/**
 * Decodifica um polyline do Google Maps em uma série de coordenadas
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): { lat: number, lng: number }[] {
  const points: { lat: number, lng: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5
    });
  }

  return points;
}

/**
 * Extrai informações de pedágio diretamente da resposta da API do Google Maps
 * IMPORTANTE: Usa EXCLUSIVAMENTE as coordenadas fornecidas pela API, sem qualquer alteração
 */
export function extractTollsFromRoute(directionsResult: any): PointOfInterest[] {
  if (!directionsResult || !directionsResult.routes || directionsResult.routes.length === 0) {
    return [];
  }

  const route = directionsResult.routes[0];
  const legs = route.legs || [];
  const tollPoints: PointOfInterest[] = [];
  
  // ID base para os pedágios
  let tollId = 10000;
  
  // IMPORTANTE: Usar apenas a propriedade toll_info.toll_points da API
  console.log("Extraindo pedágios EXCLUSIVAMENTE da API Routes Preferred");
  console.log("Sem manipulação de coordenadas");
  
  // Processar cada trecho (leg) da rota
  legs.forEach((leg: any, legIndex: number) => {
    // Verificar se há informações de pedágio neste trecho
    if (leg.toll_info && leg.toll_info.toll_points && leg.toll_info.toll_points.length > 0) {
      console.log(`Encontrados ${leg.toll_info.toll_points.length} pedágios no trecho ${legIndex + 1}`);
      
      // Processar cada ponto de pedágio informado pela API
      leg.toll_info.toll_points.forEach((tollPoint: any, tollIndex: number) => {
        if (tollPoint.location) {
          // Obter o nome do pedágio, ou criar um nome padrão
          const tollName = tollPoint.name || `Pedágio ${legIndex + 1}.${tollIndex + 1}`;
          
          // IMPORTANTE: Usar as coordenadas EXATAS da API
          const lat = tollPoint.location.lat.toString();
          const lng = tollPoint.location.lng.toString();
          
          // LOG detalhado para debug
          console.log(`Pedágio original da API: ${tollName}`);
          console.log(`Coordenadas EXATAS: ${lat}, ${lng}`);
          
          // Obter custo do pedágio
          let cost = 0;
          if (tollPoint.cost && tollPoint.cost.value) {
            cost = Math.round(tollPoint.cost.value * 100); // converter para centavos
          }
          
          // Criar um objeto para este pedágio usando APENAS os dados da API
          const poi: PointOfInterest = {
            id: tollId++,
            name: tollName,
            lat: lat, // EXATAMENTE como fornecido pela API
            lng: lng, // EXATAMENTE como fornecido pela API
            type: 'toll',
            cost: cost,
            roadName: `Rodovia ${legIndex + 1}`,
            restrictions: leg.toll_info.toll_passes 
              ? leg.toll_info.toll_passes.map((pass: any) => pass.name).join(", ")
              : ''
          };
          
          // Adicionar à lista de pontos de pedágio
          tollPoints.push(poi);
          console.log(`Pedágio adicionado: ${poi.name} em ${poi.lat},${poi.lng}`);
        } else {
          console.log(`Pedágio sem localização no trecho ${legIndex + 1}, índice ${tollIndex}`);
        }
      });
    } else {
      console.log(`Nenhuma informação de pedágio no trecho ${legIndex + 1}`);
    }
  });
  
  // Log final resumido
  console.log(`Extraídos ${tollPoints.length} pedágios EXCLUSIVAMENTE da API Google Maps`);
  tollPoints.forEach((toll, idx) => {
    console.log(`${idx + 1}. ${toll.name}: ${toll.lat},${toll.lng}`);
  });
  
  return tollPoints;
}
