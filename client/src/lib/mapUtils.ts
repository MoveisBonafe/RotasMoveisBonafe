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
 * Extrai o nome da cidade de um endereço completo brasileiro
 */
function extractCityName(address: string): string | null {
  // Padrão para endereços brasileiros - a cidade geralmente vem antes do estado (UF)
  const cityPattern = /([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/;
  const match = address.match(cityPattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Tenta um padrão alternativo para endereços sem o formato padrão
  const altPattern = /(?:em|para|de|por)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/;
  const altMatch = address.match(altPattern);
  
  if (altMatch && altMatch[1]) {
    return altMatch[1].trim();
  }
  
  return null;
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
 * Extrai informações de pedágio diretamente da resposta da API do Google Maps e do polyline da rota
 * Esta abordagem utiliza um método alternativo quando o toll_info não está disponível
 */
export function extractTollsFromRoute(directionsResult: any): PointOfInterest[] {
  if (!directionsResult || !directionsResult.routes || directionsResult.routes.length === 0) {
    return [];
  }

  const route = directionsResult.routes[0];
  const legs = route.legs || [];
  const tollPoints: PointOfInterest[] = [];
  let tollsAdded = false;
  
  // ID base para os pedágios
  let tollId = 10000;
  
  console.log("Extraindo informações de pedágio usando todos os métodos disponíveis");
  
  // MÉTODO 1: Verificar se a resposta da API contém pedágios explícitos
  legs.forEach((leg: any, legIndex: number) => {
    // Verificar se há informações de pedágio neste trecho
    if (leg.toll_info && leg.toll_info.toll_points && leg.toll_info.toll_points.length > 0) {
      console.log(`Método 1: Encontrados ${leg.toll_info.toll_points.length} pedágios no trecho ${legIndex + 1}`);
      tollsAdded = true;
      
      // Processar cada ponto de pedágio informado pela API
      leg.toll_info.toll_points.forEach((tollPoint: any, tollIndex: number) => {
        if (tollPoint.location) {
          // Adicionar pedágio à lista
          const tollName = tollPoint.name || `Pedágio ${legIndex + 1}.${tollIndex + 1}`;
          const lat = tollPoint.location.lat.toString();
          const lng = tollPoint.location.lng.toString();
          
          console.log(`Pedágio da API: ${tollName} em ${lat},${lng}`);
          
          // Obter custo do pedágio
          let cost = 0;
          if (tollPoint.cost && tollPoint.cost.value) {
            cost = Math.round(tollPoint.cost.value * 100); // converter para centavos
          }
          
          // Criar objeto de ponto de interesse
          const poi: PointOfInterest = {
            id: tollId++,
            name: tollName,
            lat: lat,
            lng: lng,
            type: 'toll',
            cost: cost,
            roadName: `Rodovia ${legIndex + 1}`,
            restrictions: leg.toll_info.toll_passes 
              ? leg.toll_info.toll_passes.map((pass: any) => pass.name).join(", ")
              : ''
          };
          
          tollPoints.push(poi);
        }
      });
    }
  });
  
  // MÉTODO 2: Se não encontramos pedágios pelo método 1, tentar extrair das steps
  if (!tollsAdded) {
    console.log("Método 1 não encontrou pedágios, tentando método 2 (steps)");
    
    // Percorrer os trechos e passos para identificar menções a pedágios
    legs.forEach((leg: any, legIndex: number) => {
      if (leg.steps && leg.steps.length > 0) {
        leg.steps.forEach((step: any, stepIndex: number) => {
          // Verificar se este passo menciona pedágio
          if (step.html_instructions && 
             (step.html_instructions.includes("pedágio") || 
              step.html_instructions.includes("toll") ||
              step.html_instructions.includes("praça de pedágio"))) {
            
            console.log(`Método 2: Passo ${stepIndex} contém menção a pedágio: ${step.html_instructions}`);
            
            // Calcular uma posição aproximada no meio do passo
            if (step.start_location && step.end_location) {
              const lat = ((step.start_location.lat + step.end_location.lat) / 2).toString();
              const lng = ((step.start_location.lng + step.end_location.lng) / 2).toString();
              
              // Criar um nome baseado nas instruções
              const instructions = step.html_instructions.replace(/<[^>]*>/g, '');
              const tollName = `Pedágio ${instructions.substring(0, 30)}...`;
              
              console.log(`Pedágio do step: ${tollName} em ${lat},${lng}`);
              
              // Criar objeto de ponto de interesse
              const poi: PointOfInterest = {
                id: tollId++,
                name: tollName,
                lat: lat,
                lng: lng,
                type: 'toll',
                cost: 0, // Não sabemos o custo
                roadName: `Trecho ${legIndex + 1}`,
                restrictions: ''
              };
              
              tollPoints.push(poi);
              tollsAdded = true;
            }
          }
        });
      }
    });
  }
  
  // MÉTODO 3: Se ainda não encontramos pedágios, usar pontos predefinidos com base na rodovia
  if (!tollsAdded) {
    console.log("Método 3: Procurando por rodovias conhecidas para identificar pedágios");
    
    // Identificar rodovias mencionadas
    const rodovias: string[] = [];
    legs.forEach(leg => {
      if (leg.steps) {
        leg.steps.forEach((step: any) => {
          if (step.html_instructions) {
            // Extrair menções a rodovias (SP-XXX, BR-XXX, etc)
            const instText = step.html_instructions.replace(/<[^>]*>/g, '');
            const rodoviaMatches = instText.match(/(SP|BR|MG|PR|RS|SC|GO|MT|MS|BA|PE|RJ|ES)[-\s](\d{3})/g);
            if (rodoviaMatches) {
              rodoviaMatches.forEach(rod => {
                if (!rodovias.includes(rod)) {
                  rodovias.push(rod);
                  console.log(`Rodovia detectada: ${rod}`);
                }
              });
            }
          }
        });
      }
    });
    
    // Se temos rodovias, adicionar pedágios pré-conhecidos
    if (rodovias.length > 0) {
      console.log(`Método 3: Rodovias detectadas: ${rodovias.join(', ')}`);
      
      // Mapa de pedágios conhecidos por rodovia
      const pedagiosPorRodovia: {[key: string]: {nome: string, lat: string, lng: string}[]} = {
        'SP-255': [
          {nome: 'Pedágio SP-255 (Jaú)', lat: '-22.1856', lng: '-48.6087'},
          {nome: 'Pedágio SP-255 (Barra Bonita)', lat: '-22.5123', lng: '-48.5566'},
          {nome: 'Pedágio SP-255 (Boa Esperança do Sul)', lat: '-21.9927', lng: '-48.3926'}
        ],
        'SP-225': [
          {nome: 'Pedágio SP-225 (Brotas)', lat: '-22.2794', lng: '-48.1257'},
          {nome: 'Pedágio SP-225 (Dois Córregos)', lat: '-22.3673', lng: '-48.2823'},
          {nome: 'Pedágio SP-225 (Jaú)', lat: '-22.3006', lng: '-48.5584'}
        ],
        'SP-310': [
          {nome: 'Pedágio SP-310 (Itirapina)', lat: '-22.2449', lng: '-47.8278'},
          {nome: 'Pedágio SP-310 (São Carlos)', lat: '-22.0105', lng: '-47.9107'},
          {nome: 'Pedágio SP-310 (Araraquara)', lat: '-21.7950', lng: '-48.1758'}
        ],
        'SP-330': [
          {nome: 'Pedágio SP-330 (Ribeirão Preto)', lat: '-21.2089', lng: '-47.8651'},
          {nome: 'Pedágio SP-330 (Sertãozinho)', lat: '-21.0979', lng: '-47.9959'}
        ],
        'SP-333': [
          {nome: 'Pedágio SP-333 (Jaú)', lat: '-22.3211', lng: '-48.5584'},
          {nome: 'Pedágio SP-333 (Borborema)', lat: '-21.6214', lng: '-49.0741'}
        ],
        'SP-304': [
          {nome: 'Pedágio SP-304 (Jaú/Bariri)', lat: '-22.1472', lng: '-48.6795'},
          {nome: 'Pedágio SP-304 (Torrinha)', lat: '-22.4238', lng: '-48.1701'}
        ]
      };
      
      // Adicionar pedágios importantes por cidade (independente da rodovia)
      const pedagogiosPorCidade: {[key: string]: {nome: string, lat: string, lng: string}[]} = {
        'Dois Córregos': [
          {nome: 'Pedágio Dois Córregos/Brotas', lat: '-22.3191', lng: '-48.1605'}
        ],
        'Ribeirão Preto': [
          {nome: 'Pedágio Ribeirão Preto/Pradópolis', lat: '-21.2556', lng: '-48.0039'}
        ],
        'Boa Esperança do Sul': [
          {nome: 'Pedágio Boa Esperança do Sul', lat: '-21.9901', lng: '-48.3923'}
        ],
        'Jaú': [
          {nome: 'Pedágio Jaú/Bocaina', lat: '-22.1434', lng: '-48.4863'}
        ],
        'Araraquara': [
          {nome: 'Pedágio Araraquara/Américo Brasiliense', lat: '-21.6822', lng: '-48.1038'}
        ]
      };
      
      // Adicionar pedágios por cidades na rota
      let cidadesNaRota = legs.flatMap(leg => 
        leg.steps?.flatMap(step => {
          const text = step.html_instructions?.replace(/<[^>]*>/g, '') || '';
          // Pegar nomes de cidades brasileiras mencionadas
          const matches = text.match(/(?:passar por|entrar em|chegar em|chegar a|pegar|sair de)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/g);
          if (matches) {
            return matches.map(m => m.replace(/(?:passar por|entrar em|chegar em|chegar a|pegar|sair de)\s+/, ''));
          }
          return [];
        }) || []
      );
      
      // Adicionar cidades de início e fim da rota
      if (legs.length > 0) {
        const firstLeg = legs[0];
        const lastLeg = legs[legs.length - 1];
        
        if (firstLeg.start_address) {
          const startCity = extractCityName(firstLeg.start_address);
          if (startCity) cidadesNaRota.push(startCity);
        }
        
        if (lastLeg.end_address) {
          const endCity = extractCityName(lastLeg.end_address);
          if (endCity) cidadesNaRota.push(endCity);
        }
      }
      
      // Remover duplicatas de cidades
      cidadesNaRota = [...new Set(cidadesNaRota)];
      
      console.log("Cidades na rota:", cidadesNaRota);
      
      // Adicionar pedágios de cidades na rota
      cidadesNaRota.forEach(cidade => {
        const pedagogios = pedagogiosPorCidade[cidade];
        if (pedagogios) {
          pedagogios.forEach(pedagio => {
            console.log(`Adicionando pedágio por cidade ${cidade}: ${pedagio.nome}`);
            
            const poi: PointOfInterest = {
              id: tollId++,
              name: pedagio.nome,
              lat: pedagio.lat,
              lng: pedagio.lng,
              type: 'toll',
              cost: 0,
              roadName: `Próximo a ${cidade}`,
              restrictions: 'Pedágio por cidade'
            };
            
            tollPoints.push(poi);
            tollsAdded = true;
          });
        }
      });
      
      // Adicionar pedágios para as rodovias detectadas
      rodovias.forEach(rodovia => {
        const pedagios = pedagiosPorRodovia[rodovia];
        if (pedagios) {
          pedagios.forEach(pedagio => {
            console.log(`Método 3: Adicionando pedágio pré-conhecido: ${pedagio.nome}`);
            
            const poi: PointOfInterest = {
              id: tollId++,
              name: pedagio.nome,
              lat: pedagio.lat,
              lng: pedagio.lng,
              type: 'toll',
              cost: 0, // Custo desconhecido
              roadName: rodovia,
              restrictions: 'Pedágio pré-definido'
            };
            
            tollPoints.push(poi);
            tollsAdded = true;
          });
        }
      });
    }
  }
  
  // MÉTODO 4: Se ainda não encontramos pedágios, procurar por sinais específicos nos polylines
  if (!tollsAdded && route.overview_polyline && route.overview_polyline.points) {
    console.log("Método 4: Analisando polyline da rota para encontrar pontos de pedágio");
    
    // Exemplo de interpretação do polyline
    const points = decodePolyline(route.overview_polyline.points);
    
    if (points.length > 0) {
      // Identificar pedágios em pontos específicos da rota (a cada 20-30km)
      const routeLength = route.legs.reduce((total: number, leg: any) => 
        total + (leg.distance ? leg.distance.value : 0), 0);
      
      if (routeLength > 100000) { // Se a rota for maior que 100km
        // Calcular quantos pedágios esperamos encontrar (aproximadamente a cada 25km em rodovias pedagiadas)
        const expectedTolls = Math.floor(routeLength / 50000); // 1 pedágio a cada 50km em média
        console.log(`Método 4: Rota de ${routeLength/1000}km, esperando aproximadamente ${expectedTolls} pedágios`);
        
        if (expectedTolls > 0 && points.length > 20) {
          // Distribuir pedágios aproximadamente uniformemente ao longo da rota
          const interval = Math.floor(points.length / (expectedTolls + 1));
          
          for (let i = 1; i <= expectedTolls; i++) {
            const pointIndex = i * interval;
            if (pointIndex < points.length) {
              const point = points[pointIndex];
              
              const tollName = `Possível Pedágio ${i}`;
              console.log(`Método 4: Possível pedágio em ${point.lat},${point.lng}`);
              
              const poi: PointOfInterest = {
                id: tollId++,
                name: tollName,
                lat: point.lat.toString(),
                lng: point.lng.toString(),
                type: 'toll',
                cost: 0, // Não sabemos o custo
                roadName: 'Desconhecida',
                restrictions: 'Pedágio inferido'
              };
              
              tollPoints.push(poi);
              tollsAdded = true;
            }
          }
        }
      }
    }
  }
  
  // Resultado final
  if (tollPoints.length > 0) {
    console.log(`Total de ${tollPoints.length} pedágios encontrados por todos os métodos`);
    tollPoints.forEach((toll, idx) => {
      console.log(`${idx + 1}. ${toll.name}: ${toll.lat},${toll.lng}`);
    });
  } else {
    console.log("Nenhum pedágio encontrado por qualquer método");
  }
  
  return tollPoints;
}
