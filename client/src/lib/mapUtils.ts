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
 * Busca pedágios ao longo da rota utilizando a API Places do Google Maps
 * Esta abordagem é mais confiável para identificar pedágios no Brasil
 * @param map Instância do mapa Google Maps
 * @param route Rota calculada pelo DirectionsService
 * @returns Promise com array de PointOfInterest representando pedágios
 */
export async function findTollsUsingGooglePlaces(map: any, route: any): Promise<PointOfInterest[]> {
  if (!map || !route || !route.routes || route.routes.length === 0 || !window.google) {
    console.log("Google Places: Dados insuficientes para buscar pedágios");
    return [];
  }

  return new Promise((resolve) => {
    // Array para armazenar os pedágios encontrados
    const tolls: PointOfInterest[] = [];
    let tollId = 20000; // ID base para pedágios Places
    
    try {
      console.log("Iniciando busca de pedágios com Google Places API");
      
      // Obter o polyline da rota
      const polyline = route.routes[0].overview_polyline.points;
      const path = decodePolyline(polyline);
      
      // Criar um serviço Places
      const placesService = new window.google.maps.places.PlacesService(map);
      
      // Determinar pontos de busca ao longo da rota (a cada 50km aproximadamente)
      const searchPoints: {lat: number, lng: number}[] = [];
      const SEARCH_INTERVAL_KM = 50; // Buscar a cada 50km
      
      // Adicionar ponto inicial
      if (path.length > 0) {
        searchPoints.push(path[0]);
      }
      
      // Adicionar pontos intermediários a cada SEARCH_INTERVAL_KM
      let distanceSum = 0;
      for (let i = 1; i < path.length; i++) {
        const prevPoint = path[i-1];
        const currentPoint = path[i];
        
        const segmentDistance = calculateHaversineDistance(
          prevPoint.lat, prevPoint.lng, 
          currentPoint.lat, currentPoint.lng
        );
        
        distanceSum += segmentDistance;
        
        if (distanceSum >= SEARCH_INTERVAL_KM) {
          searchPoints.push(currentPoint);
          distanceSum = 0;
        }
      }
      
      // Adicionar ponto final se não foi adicionado pela lógica anterior
      if (path.length > 1 && searchPoints[searchPoints.length - 1] !== path[path.length - 1]) {
        searchPoints.push(path[path.length - 1]);
      }
      
      console.log(`Google Places: Buscando pedágios em ${searchPoints.length} pontos ao longo da rota`);
      
      // Contador para controlar quando todos os pedidos foram concluídos
      let completedRequests = 0;
      let foundTolls = false;
      
      // Processar cada ponto de busca
      searchPoints.forEach((point, index) => {
        // Criar request para buscar pontos de interesse do tipo 'toll_booth'
        const request = {
          location: new window.google.maps.LatLng(point.lat, point.lng),
          radius: 20000, // 20km de raio
          type: 'toll_booth' // Tipo específico para pedágios
        };
        
        // Executar a busca com um pequeno atraso para não sobrecarregar a API
        setTimeout(() => {
          placesService.nearbySearch(request, (results: any, status: any) => {
            completedRequests++;
            
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length) {
              console.log(`Google Places: Encontrados ${results.length} pedágios próximos ao ponto ${index + 1}`);
              foundTolls = true;
              
              // Processar cada resultado
              results.forEach((place: any) => {
                // Verificar se este pedágio já foi adicionado (evitar duplicatas)
                const isDuplicate = tolls.some(toll => 
                  calculateHaversineDistance(
                    parseFloat(toll.lat), parseFloat(toll.lng),
                    place.geometry.location.lat(), place.geometry.location.lng()
                  ) < 1 // Se estiver a menos de 1km, considerar duplicata
                );
                
                if (!isDuplicate) {
                  // Criar objeto de ponto de interesse
                  const tollName = place.name || `Pedágio ${index + 1}`;
                  
                  const poi: PointOfInterest = {
                    id: tollId++,
                    name: tollName,
                    lat: place.geometry.location.lat().toString(),
                    lng: place.geometry.location.lng().toString(),
                    type: 'toll',
                    googlePlaceId: place.place_id,
                    roadName: place.vicinity || '',
                    ailogSource: false,
                    googlePlacesSource: true
                  };
                  
                  console.log(`Google Places: Adicionado pedágio "${tollName}" em ${poi.lat},${poi.lng}`);
                  tolls.push(poi);
                  
                  // Opcionalmente, buscar detalhes adicionais
                  placesService.getDetails({
                    placeId: place.place_id,
                    fields: ['name', 'formatted_address', 'formatted_phone_number', 'rating']
                  }, (placeDetails: any, detailStatus: any) => {
                    if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                      // Atualizar informações com os detalhes obtidos
                      const tollIndex = tolls.findIndex(t => t.googlePlaceId === place.place_id);
                      if (tollIndex >= 0) {
                        if (placeDetails.formatted_address) {
                          tolls[tollIndex].address = placeDetails.formatted_address;
                        }
                        if (placeDetails.name && placeDetails.name !== tolls[tollIndex].name) {
                          tolls[tollIndex].name = placeDetails.name;
                        }
                      }
                    }
                  });
                }
              });
            }
            
            // Se todos os pedidos foram concluídos, resolver a Promise
            if (completedRequests === searchPoints.length) {
              console.log(`Google Places: Busca completa, encontrados ${tolls.length} pedágios únicos`);
              
              if (!foundTolls) {
                console.log("Google Places: Nenhum pedágio encontrado pela API. Verificando rodovias conhecidas.");
                // Se não encontrou pedágios, usa o fallback de rodovias conhecidas
                const knownTolls = findTollsFromKnownHighways(route);
                resolve([...tolls, ...knownTolls]);
              } else {
                resolve(tolls);
              }
            }
          });
        }, index * 300); // Atraso escalonado para não sobrecarregar a API
      });
    } catch (error) {
      console.error("Erro ao buscar pedágios com Google Places:", error);
      resolve([]);
    }
  });
}

/**
 * Identifica pedágios com base em rodovias conhecidas mencionadas nas direções
 * Método de fallback quando os outros métodos não encontram pedágios
 */
export function findTollsFromKnownHighways(directionsResult: any): PointOfInterest[] {
  if (!directionsResult || !directionsResult.routes || directionsResult.routes.length === 0) {
    return [];
  }
  
  console.log("Buscando pedágios em rodovias conhecidas");
  const tollPoints: PointOfInterest[] = [];
  let tollId = 30000; // ID base para pedágios de rodovias conhecidas
  
  try {
    const route = directionsResult.routes[0];
    const legs = route.legs || [];
    
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
                const normalizedRod = rod.replace(/\s+/g, '-').toUpperCase();
                if (!rodovias.includes(normalizedRod)) {
                  rodovias.push(normalizedRod);
                  console.log(`Rodovia detectada: ${normalizedRod}`);
                }
              });
            }
          }
        });
      }
    });
    
    // Mapa de pedágios conhecidos por rodovia - Dados mais completos
    const pedagiosPorRodovia: {[key: string]: {nome: string, lat: string, lng: string, custo?: number}[]} = {
      'SP-255': [
        {nome: 'Pedágio SP-255 (Jaú)', lat: '-22.1856', lng: '-48.6087', custo: 1150},
        {nome: 'Pedágio SP-255 (Barra Bonita)', lat: '-22.5123', lng: '-48.5566', custo: 950},
        {nome: 'Pedágio SP-255 (Boa Esperança do Sul)', lat: '-21.9927', lng: '-48.3926', custo: 1050},
        {nome: 'Pedágio SP-255 (Araraquara)', lat: '-21.7925', lng: '-48.2067', custo: 970},
        {nome: 'Pedágio SP-255 (Guatapará)', lat: '-21.4955', lng: '-48.0355', custo: 1050},
        {nome: 'Pedágio SP-255 (Ribeirão Preto)', lat: '-21.2112', lng: '-47.7875', custo: 950}
      ],
      'SP-225': [
        {nome: 'Pedágio SP-225 (Brotas)', lat: '-22.2982', lng: '-48.1157', custo: 1100},
        {nome: 'Pedágio SP-225 (Dois Córregos)', lat: '-22.3673', lng: '-48.2823', custo: 980},
        {nome: 'Pedágio SP-225 (Jaú)', lat: '-22.3006', lng: '-48.5584', custo: 1050},
        {nome: 'Pedágio SP-225 (Itirapina)', lat: '-22.2505', lng: '-47.8456', custo: 990}
      ],
      'SP-310': [
        {nome: 'Pedágio SP-310 (Itirapina)', lat: '-22.2449', lng: '-47.8278', custo: 1100},
        {nome: 'Pedágio SP-310 (São Carlos)', lat: '-22.0105', lng: '-47.9107', custo: 1050},
        {nome: 'Pedágio SP-310 (Araraquara)', lat: '-21.7950', lng: '-48.1758', custo: 1150},
        {nome: 'Pedágio SP-310 (Matão)', lat: '-21.6215', lng: '-48.3663', custo: 1050},
        {nome: 'Pedágio SP-310 (Catanduva)', lat: '-21.1389', lng: '-48.9689', custo: 1050}
      ],
      'SP-330': [
        {nome: 'Pedágio SP-330 (Ribeirão Preto)', lat: '-21.2089', lng: '-47.8651', custo: 1100},
        {nome: 'Pedágio SP-330 (Sertãozinho)', lat: '-21.0979', lng: '-47.9959', custo: 950},
        {nome: 'Pedágio SP-330 (Bebedouro)', lat: '-20.9492', lng: '-48.4846', custo: 1050},
        {nome: 'Pedágio SP-330 (Colômbia)', lat: '-20.1775', lng: '-48.7064', custo: 1100}
      ]
    };
    
    // Para cada rodovia detectada, adicionar pedágios conhecidos
    rodovias.forEach(rodovia => {
      const pedagios = pedagiosPorRodovia[rodovia];
      if (pedagios) {
        console.log(`Encontrados ${pedagios.length} pedágios conhecidos na rodovia ${rodovia}`);
        
        pedagios.forEach(pedagio => {
          // Criar objeto de ponto de interesse
          const poi: PointOfInterest = {
            id: tollId++,
            name: pedagio.nome,
            lat: pedagio.lat,
            lng: pedagio.lng,
            type: 'toll',
            cost: pedagio.custo || 0,
            roadName: rodovia,
            knownHighwaySource: true
          };
          
          // Verificar se este pedágio não está muito longe da rota
          // Isso evita adicionar pedágios de trechos da rodovia que não fazem parte da rota
          const withinRoute = isPointNearRoute(poi, directionsResult);
          
          if (withinRoute) {
            console.log(`Adicionado pedágio conhecido: ${pedagio.nome}`);
            tollPoints.push(poi);
          } else {
            console.log(`Pedágio ${pedagio.nome} está fora da rota atual`);
          }
        });
      }
    });
    
  } catch (error) {
    console.error("Erro ao buscar pedágios em rodovias conhecidas:", error);
  }
  
  return tollPoints;
}

/**
 * Busca balanças de pesagem ao longo da rota utilizando a API Places do Google Maps
 * Esta abordagem é similar à busca de pedágios, mas utiliza palavras-chave específicas
 * @param map Instância do mapa Google Maps
 * @param route Rota calculada pelo DirectionsService
 * @returns Promise com array de PointOfInterest representando balanças
 */
export async function findWeighingStationsWithGooglePlaces(map: any, route: any): Promise<PointOfInterest[]> {
  if (!map || !route || !route.routes || route.routes.length === 0 || !window.google) {
    console.log("Google Places: Dados insuficientes para buscar balanças");
    return [];
  }

  return new Promise((resolve) => {
    // Array para armazenar as balanças encontradas
    const stations: PointOfInterest[] = [];
    let stationId = 40000; // ID base para balanças via Places
    
    try {
      console.log("Iniciando busca de balanças com Google Places API");
      
      // Obter o polyline da rota
      const polyline = route.routes[0].overview_polyline.points;
      const path = decodePolyline(polyline);
      
      // Criar um serviço Places
      const placesService = new window.google.maps.places.PlacesService(map);
      
      // Determinar pontos de busca ao longo da rota (a cada 75km aproximadamente)
      const searchPoints: {lat: number, lng: number}[] = [];
      const SEARCH_INTERVAL_KM = 75; // Balanças são mais espaçadas que pedágios
      
      // Adicionar ponto inicial
      if (path.length > 0) {
        searchPoints.push(path[0]);
      }
      
      // Adicionar pontos intermediários a cada SEARCH_INTERVAL_KM
      let distanceSum = 0;
      for (let i = 1; i < path.length; i++) {
        const prevPoint = path[i-1];
        const currentPoint = path[i];
        
        const segmentDistance = calculateHaversineDistance(
          prevPoint.lat, prevPoint.lng, 
          currentPoint.lat, currentPoint.lng
        );
        
        distanceSum += segmentDistance;
        
        if (distanceSum >= SEARCH_INTERVAL_KM) {
          searchPoints.push(currentPoint);
          distanceSum = 0;
        }
      }
      
      // Adicionar ponto final se não foi adicionado pela lógica anterior
      if (path.length > 1 && searchPoints[searchPoints.length - 1] !== path[path.length - 1]) {
        searchPoints.push(path[path.length - 1]);
      }
      
      console.log(`Google Places: Buscando balanças em ${searchPoints.length} pontos ao longo da rota`);
      
      // Contador para controlar quando todos os pedidos foram concluídos
      let completedRequests = 0;
      let foundStations = false;
      
      // Keywords para encontrar balanças no Brasil
      const weighingStationKeywords = [
        'balança',
        'posto de pesagem',
        'pesagem de caminhões',
        'posto de fiscalização',
        'balança rodoviária',
        'fiscalização de peso'
      ];
      
      // Processar cada ponto de busca
      searchPoints.forEach((point, index) => {
        // Para cada ponto, fazer múltiplas buscas com diferentes palavras-chave
        let keywordSearchesCompleted = 0;
        let stationsFoundAtThisPoint: PointOfInterest[] = [];
        
        weighingStationKeywords.forEach(keyword => {
          // Criar request para buscar por palavra-chave
          const request = {
            location: new window.google.maps.LatLng(point.lat, point.lng),
            radius: 30000, // 30km de raio
            keyword: keyword
          };
          
          // Executar a busca com um pequeno atraso
          setTimeout(() => {
            placesService.nearbySearch(request, (results: any, status: any) => {
              keywordSearchesCompleted++;
              
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length) {
                console.log(`Google Places: Encontradas ${results.length} possíveis balanças com a palavra "${keyword}" próximas ao ponto ${index + 1}`);
                foundStations = true;
                
                // Processar cada resultado
                results.forEach((place: any) => {
                  // Verificar se este local parece ser realmente uma balança
                  const nameHints = ['balanc', 'pesag', 'fiscaliz', 'posto'];
                  const isLikelyStation = 
                    nameHints.some(hint => 
                      place.name?.toLowerCase().includes(hint) || 
                      place.vicinity?.toLowerCase().includes(hint)
                    );
                  
                  if (isLikelyStation) {
                    // Verificar se já foi adicionado
                    const isDuplicate = stationsFoundAtThisPoint.some(station => 
                      calculateHaversineDistance(
                        parseFloat(station.lat), parseFloat(station.lng),
                        place.geometry.location.lat(), place.geometry.location.lng()
                      ) < 1 // Se estiver a menos de 1km, considerar duplicata
                    );
                    
                    if (!isDuplicate) {
                      // Extrair informações do local
                      const stationName = place.name || `Balança ${index + 1}`;
                      
                      const poi: PointOfInterest = {
                        id: stationId++,
                        name: stationName,
                        lat: place.geometry.location.lat().toString(),
                        lng: place.geometry.location.lng().toString(),
                        type: 'weighing_station',
                        googlePlaceId: place.place_id,
                        roadName: place.vicinity || '',
                        googlePlacesSource: true
                      };
                      
                      console.log(`Google Places: Adicionada balança "${stationName}" em ${poi.lat},${poi.lng}`);
                      stationsFoundAtThisPoint.push(poi);
                    }
                  }
                });
              }
              
              // Se terminamos todas as buscas por palavra-chave neste ponto
              if (keywordSearchesCompleted === weighingStationKeywords.length) {
                // Adicionar as balanças encontradas à lista principal
                stationsFoundAtThisPoint.forEach(station => {
                  // Verificar se já não foi adicionada em outro ponto
                  const isDuplicate = stations.some(existingStation => 
                    calculateHaversineDistance(
                      parseFloat(station.lat), parseFloat(station.lng),
                      parseFloat(existingStation.lat), parseFloat(existingStation.lng)
                    ) < 1 // Se estiver a menos de 1km, considerar duplicata
                  );
                  
                  if (!isDuplicate) {
                    stations.push(station);
                  }
                });
                
                // Incrementar o contador de pontos completos
                completedRequests++;
                
                // Se todos os pontos foram processados, resolver a Promise
                if (completedRequests === searchPoints.length) {
                  console.log(`Google Places: Busca completa, encontradas ${stations.length} balanças únicas`);
                  
                  if (!foundStations) {
                    console.log("Google Places: Nenhuma balança encontrada pela API. Usando dados conhecidos.");
                    // Se não encontrou balanças, usar o fallback
                    const knownStations = findKnownWeighingStations(route);
                    resolve([...stations, ...knownStations]);
                  } else {
                    resolve(stations);
                  }
                }
              }
            });
          }, index * 200 + weighingStationKeywords.indexOf(keyword) * 50); // Atraso escalonado
        });
      });
    } catch (error) {
      console.error("Erro ao buscar balanças com Google Places:", error);
      resolve([]);
    }
  });
}

/**
 * Identifica balanças conhecidas com base na rota atual
 * Método de fallback quando a busca com Places API não encontra resultados
 */
export function findKnownWeighingStations(directionsResult: any): PointOfInterest[] {
  if (!directionsResult || !directionsResult.routes || directionsResult.routes.length === 0) {
    return [];
  }
  
  console.log("Buscando balanças em locais conhecidos");
  const stations: PointOfInterest[] = [];
  let stationId = 50000; // ID base para balanças conhecidas
  
  try {
    // Extrair cidades e rodovias da rota
    const route = directionsResult.routes[0];
    const legs = route.legs || [];
    
    // Conjuntos para armazenar cidades e rodovias únicas
    const citiesInRoute = new Set<string>();
    const highwaysInRoute = new Set<string>();
    
    // Extrair cidades dos endereços
    legs.forEach((leg: any) => {
      if (leg.start_address) {
        const cityMatch = leg.start_address.match(/([A-Za-zÀ-ú\s]+)(?:\s*-\s*[A-Z]{2})/);
        if (cityMatch && cityMatch[1]) {
          citiesInRoute.add(cityMatch[1].trim());
        }
      }
      if (leg.end_address) {
        const cityMatch = leg.end_address.match(/([A-Za-zÀ-ú\s]+)(?:\s*-\s*[A-Z]{2})/);
        if (cityMatch && cityMatch[1]) {
          citiesInRoute.add(cityMatch[1].trim());
        }
      }
      
      // Extrair rodovias das instruções
      if (leg.steps) {
        leg.steps.forEach((step: any) => {
          if (step.html_instructions) {
            // Extrair menções a rodovias (SP-XXX, BR-XXX, etc)
            const instText = step.html_instructions.replace(/<[^>]*>/g, '');
            const rodoviaMatches = instText.match(/(SP|BR|MG|PR|RS|SC|GO|MT|MS|BA|PE|RJ|ES)[-\s](\d{3})/g);
            if (rodoviaMatches) {
              rodoviaMatches.forEach((rod: any) => {
                const normalizedRod = rod.replace(/\s+/g, '-').toUpperCase();
                highwaysInRoute.add(normalizedRod);
              });
            }
          }
        });
      }
    });
    
    console.log(`Cidades na rota: ${Array.from(citiesInRoute).join(', ')}`);
    console.log(`Rodovias na rota: ${Array.from(highwaysInRoute).join(', ')}`);
    
    // Tentar buscar do endpoint primeiro (método preferido)
    try {
      const citiesArray = Array.from(citiesInRoute) as string[];
      const highwaysArray = Array.from(highwaysInRoute) as string[];
      
      // Usar a nova função para obter as balanças
      const externalStations = fetchWeighingStationsAsync(citiesArray, highwaysArray);
      if (externalStations && externalStations.length > 0) {
        console.log(`Obtidas ${externalStations.length} balanças da API`);
        stations.push(...externalStations);
        return stations;
      }
    } catch (apiError) {
      console.error("Erro ao buscar balanças da API externa:", apiError);
      // Continuar com o método de fallback
    }
    
    // Se o endpoint falhar, cair para o método de fallback com dados locais
    // Importar dados do arquivo weighingStationData aqui, dinamicamente
    // Isso é apenas um fallback, não deve ser o caminho principal
    
    // Exemplo de como seria com dados locais codificados
    const balancasPorRodovia: {[key: string]: {nome: string, lat: string, lng: string, km?: number}[]} = {
      'SP-255': [
        {nome: 'Balança Luís Antônio (km 150)', lat: '-21.5510', lng: '-47.7770', km: 150}
      ]
    };
    
    const balancasPorCidade: {[key: string]: {nome: string, lat: string, lng: string, rodovia?: string}[]} = {
      'Luís Antônio': [
        {nome: 'Balança Luís Antônio', lat: '-21.5510', lng: '-47.7770', rodovia: 'SP-255'}
      ]
    };
    
    // Adicionar balanças por rodovia
    highwaysInRoute.forEach((rodovia: any) => {
      const balancas = balancasPorRodovia[rodovia];
      if (balancas) {
        console.log(`Analisando ${balancas.length} balanças na rodovia ${rodovia}`);
        
        balancas.forEach(balanca => {
          // Criar objeto de ponto de interesse
          const poi: PointOfInterest = {
            id: stationId++,
            name: balanca.nome,
            lat: balanca.lat,
            lng: balanca.lng,
            type: 'weighing_station',
            roadName: rodovia,
            knownHighwaySource: true
          };
          
          // Verificar se está próxima da rota
          const withinRoute = isPointNearRoute(poi, directionsResult, 20); // 20km de tolerância
          
          if (withinRoute) {
            console.log(`Adicionada balança conhecida: ${balanca.nome}`);
            stations.push(poi);
          } else {
            console.log(`Balança ${balanca.nome} está fora da rota atual`);
          }
        });
      }
    });
    
  } catch (error) {
    console.error("Erro ao buscar balanças conhecidas:", error);
  }
  
  return stations;
}

/**
 * Obtém balanças de pesagem da API externa e das fontes locais
 * Função que pode ser usada sem modificar o componente MapView
 * 
 * @param directionsResult O resultado do Google Directions API
 * @returns Promise<PointOfInterest[]> Promessa com as balanças encontradas
 */
export async function getEnhancedWeighingStations(directionsResult: any): Promise<PointOfInterest[]> {
  if (!directionsResult || !directionsResult.routes || directionsResult.routes.length === 0) {
    return [];
  }
  
  try {
    // Extrair cidades e rodovias da rota
    const route = directionsResult.routes[0];
    const legs = route.legs || [];
    
    // Conjuntos para armazenar cidades e rodovias únicas
    const citiesInRoute = new Set<string>();
    const highwaysInRoute = new Set<string>();
    
    // Extrair cidades dos endereços
    legs.forEach((leg: any) => {
      if (leg.start_address) {
        const cityMatch = leg.start_address.match(/([A-Za-zÀ-ú\s]+)(?:\s*-\s*[A-Z]{2})/);
        if (cityMatch && cityMatch[1]) {
          citiesInRoute.add(cityMatch[1].trim());
        }
      }
      if (leg.end_address) {
        const cityMatch = leg.end_address.match(/([A-Za-zÀ-ú\s]+)(?:\s*-\s*[A-Z]{2})/);
        if (cityMatch && cityMatch[1]) {
          citiesInRoute.add(cityMatch[1].trim());
        }
      }
      
      // Extrair rodovias das instruções
      if (leg.steps) {
        leg.steps.forEach((step: any) => {
          if (step.html_instructions) {
            // Extrair menções a rodovias (SP-XXX, BR-XXX, etc)
            const instText = step.html_instructions.replace(/<[^>]*>/g, '');
            const rodoviaMatches = instText.match(/(SP|BR|MG|PR|RS|SC|GO|MT|MS|BA|PE|RJ|ES)[-\s](\d{3})/g);
            if (rodoviaMatches) {
              rodoviaMatches.forEach((m: any) => {
                const normalizedRod = m.replace(/\s+/g, '-').toUpperCase();
                highwaysInRoute.add(normalizedRod);
              });
            }
          }
        });
      }
    });
    
    // Converter para arrays de strings
    const cities = Array.from(citiesInRoute as Set<string>);
    const highways = Array.from(highwaysInRoute as Set<string>);
    
    console.log("Cidades detectadas:", cities);
    console.log("Rodovias detectadas:", highways);
    
    // Buscar balanças da API
    const apiStations = await fetchWeighingStationsFromAPI(cities, highways);
    
    // Buscar balanças com Google Places API (fallback, se tiver acesso à API)
    let placesStations: PointOfInterest[] = [];
    if (window.google && window.google.maps) {
      const map = document.getElementById('map'); // Elemento do mapa
      if (map) {
        try {
          // Aqui, você pode implementar chamada ao método do Google Places API
          // (removemos esta parte por enquanto para não modificar o MapView)
        } catch (placesError) {
          console.error("Erro ao buscar com Places API:", placesError);
        }
      }
    }
    
    // Buscar balanças de fontes locais (fallback)
    const localStations = await fetchLocalWeighingStations(cities, highways, directionsResult);
    
    // Combinar e remover duplicatas
    const allStations = [...apiStations, ...placesStations, ...localStations];
    const uniqueStations = removeDuplicateStations(allStations);
    
    console.log(`Total de balanças encontradas: ${uniqueStations.length}`);
    return uniqueStations;
    
  } catch (error) {
    console.error("Erro ao buscar balanças aprimoradas:", error);
    return [];
  }
}

/**
 * Busca balanças do servidor através do novo endpoint
 * @param cities Lista de cidades na rota
 * @param highways Lista de rodovias na rota
 * @returns Promise com array de Balanças
 */
export async function fetchWeighingStationsFromAPI(cities: string[], highways: string[]): Promise<PointOfInterest[]> {
  try {
    console.log("Buscando balanças da API...");
    
    // Construir URL com parâmetros
    const params = new URLSearchParams();
    if (cities.length > 0) {
      params.set('cities', cities.join(','));
    }
    if (highways.length > 0) {
      params.set('highways', highways.join(','));
    }
    
    // Fazer a requisição
    const response = await fetch(`/api/weighing-stations?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    const stations = await response.json();
    console.log(`API retornou ${stations.length} balanças`);
    return stations;
  } catch (error) {
    console.error("Erro ao buscar balanças da API:", error);
    return [];
  }
}

/**
 * Versão síncrona para obter balanças (para compatibilidade)
 */
export function fetchWeighingStationsAsync(cities: string[], highways: string[]): PointOfInterest[] {
  console.log("Versão síncrona de busca de balanças");
  // Como é síncrono, retornamos um array vazio e esperamos a versão assíncrona
  return [];
}

/**
 * Busca balanças de fontes locais (arquivo weighingStationData)
 */
export async function fetchLocalWeighingStations(cities: string[], highways: string[], directionsResult: any): Promise<PointOfInterest[]> {
  try {
    console.log("Buscando balanças de fontes locais...");
    
    // Aqui, podemos importar dinâmicamente as funções do arquivo weighingStationData
    // Porém, como não queremos modificar a estrutura, vamos usar os dados básicos
    
    // Verificar quais balanças conhecidas estão próximas da rota
    const knownStations = findKnownWeighingStations(directionsResult);
    console.log(`Encontradas ${knownStations.length} balanças conhecidas próximas à rota`);
    
    return knownStations;
  } catch (error) {
    console.error("Erro ao buscar balanças locais:", error);
    return [];
  }
}

/**
 * Remove estações duplicadas com base na proximidade geográfica
 */
export function removeDuplicateStations(stations: PointOfInterest[]): PointOfInterest[] {
  const uniqueStations: PointOfInterest[] = [];
  
  stations.forEach(station => {
    // Verificar se já existe uma estação similar na lista de únicas
    const isDuplicate = uniqueStations.some(existingStation => {
      try {
        // Calcular distância entre as estações
        const distance = calculateHaversineDistance(
          parseFloat(station.lat), parseFloat(station.lng),
          parseFloat(existingStation.lat), parseFloat(existingStation.lng)
        );
        // Se a distância for menor que 5km, considerar duplicata
        return distance < 5;
      } catch (e) {
        // Se não conseguir calcular distância, verificar pelo nome
        return station.name === existingStation.name;
      }
    });
    
    // Se não for duplicata, adicionar à lista de únicas
    if (!isDuplicate) {
      uniqueStations.push(station);
    }
  });
  
  return uniqueStations;
}

/**
 * Verifica se um ponto está próximo à rota
 * @param point Ponto a ser verificado (pedágio, etc)
 * @param directionsResult Resultado do directions service
 * @param maxDistanceKm Distância máxima em km
 * @returns true se o ponto estiver próximo à rota
 */
function isPointNearRoute(point: PointOfInterest, directionsResult: any, maxDistanceKm: number = 10): boolean {
  if (!directionsResult?.routes?.[0]?.overview_path) {
    return false;
  }
  
  try {
    const path = directionsResult.routes[0].overview_path;
    const pointLatLng = { lat: parseFloat(point.lat), lng: parseFloat(point.lng) };
    
    // Verificar distância para cada ponto da rota
    for (const pathPoint of path) {
      const distance = calculateHaversineDistance(
        pointLatLng.lat, pointLatLng.lng,
        pathPoint.lat(), pathPoint.lng()
      );
      
      if (distance <= maxDistanceKm) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao verificar proximidade do ponto com a rota:", error);
    return false;
  }
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
                const normalizedRod = rod.replace(/\s+/g, '-').toUpperCase();
                if (!rodovias.includes(normalizedRod)) {
                  rodovias.push(normalizedRod);
                  console.log(`Rodovia detectada: ${normalizedRod}`);
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
      
      // Mapa de pedágios conhecidos por rodovia - Dados mais completos
      const pedagiosPorRodovia: {[key: string]: {nome: string, lat: string, lng: string, custo?: number}[]} = {
        'SP-255': [
          {nome: 'Pedágio SP-255 (Jaú)', lat: '-22.1856', lng: '-48.6087', custo: 1150},
          {nome: 'Pedágio SP-255 (Barra Bonita)', lat: '-22.5123', lng: '-48.5566', custo: 950},
          {nome: 'Pedágio SP-255 (Boa Esperança do Sul)', lat: '-21.9927', lng: '-48.3926', custo: 1050},
          {nome: 'Pedágio SP-255 (Araraquara)', lat: '-21.7925', lng: '-48.2067', custo: 970},
          {nome: 'Pedágio SP-255 (Guatapará)', lat: '-21.4955', lng: '-48.0355', custo: 1050},
          {nome: 'Pedágio SP-255 (Ribeirão Preto)', lat: '-21.2112', lng: '-47.7875', custo: 950}
        ],
        'SP-225': [
          {nome: 'Pedágio SP-225 (Brotas)', lat: '-22.2982', lng: '-48.1157', custo: 1100},
          {nome: 'Pedágio SP-225 (Dois Córregos)', lat: '-22.3673', lng: '-48.2823', custo: 980},
          {nome: 'Pedágio SP-225 (Jaú)', lat: '-22.3006', lng: '-48.5584', custo: 1050},
          {nome: 'Pedágio SP-225 (Itirapina)', lat: '-22.2505', lng: '-47.8456', custo: 990}
        ],
        'SP-310': [
          {nome: 'Pedágio SP-310 (Itirapina)', lat: '-22.2449', lng: '-47.8278', custo: 1100},
          {nome: 'Pedágio SP-310 (São Carlos)', lat: '-22.0105', lng: '-47.9107', custo: 1050},
          {nome: 'Pedágio SP-310 (Araraquara)', lat: '-21.7950', lng: '-48.1758', custo: 1150},
          {nome: 'Pedágio SP-310 (Matão)', lat: '-21.6215', lng: '-48.3663', custo: 1050},
          {nome: 'Pedágio SP-310 (Catanduva)', lat: '-21.1389', lng: '-48.9689', custo: 1050}
        ],
        'SP-330': [
          {nome: 'Pedágio SP-330 (Ribeirão Preto)', lat: '-21.2089', lng: '-47.8651', custo: 1100},
          {nome: 'Pedágio SP-330 (Sertãozinho)', lat: '-21.0979', lng: '-47.9959', custo: 950},
          {nome: 'Pedágio SP-330 (Bebedouro)', lat: '-20.9492', lng: '-48.4846', custo: 1050},
          {nome: 'Pedágio SP-330 (Colômbia)', lat: '-20.1775', lng: '-48.7064', custo: 1100}
        ],
        'SP-333': [
          {nome: 'Pedágio SP-333 (Jaú)', lat: '-22.3211', lng: '-48.5584', custo: 950},
          {nome: 'Pedágio SP-333 (Borborema)', lat: '-21.6214', lng: '-49.0741', custo: 900},
          {nome: 'Pedágio SP-333 (Marília)', lat: '-22.1953', lng: '-49.9331', custo: 950}
        ],
        'SP-304': [
          {nome: 'Pedágio SP-304 (Jaú/Bariri)', lat: '-22.1472', lng: '-48.6795', custo: 900},
          {nome: 'Pedágio SP-304 (Torrinha)', lat: '-22.4238', lng: '-48.1701', custo: 850},
          {nome: 'Pedágio SP-304 (Piracicaba)', lat: '-22.7233', lng: '-47.6493', custo: 950}
        ],
        'SP-300': [
          {nome: 'Pedágio SP-300 (Botucatu)', lat: '-22.8847', lng: '-48.4436', custo: 980},
          {nome: 'Pedágio SP-300 (Bauru)', lat: '-22.3156', lng: '-49.0414', custo: 1050},
          {nome: 'Pedágio SP-300 (Lins)', lat: '-21.6706', lng: '-49.7553', custo: 950}
        ],
        'SP-270': [
          {nome: 'Pedágio SP-270 (Ourinhos)', lat: '-22.9711', lng: '-49.8686', custo: 880},
          {nome: 'Pedágio SP-270 (Piraju)', lat: '-23.1981', lng: '-49.3914', custo: 900}
        ],
        'SP-280': [
          {nome: 'Pedágio SP-280 (Sorocaba)', lat: '-23.5017', lng: '-47.4584', custo: 1150},
          {nome: 'Pedágio SP-280 (Itu)', lat: '-23.2645', lng: '-47.2995', custo: 1050}
        ],
        'SP-348': [
          {nome: 'Pedágio SP-348 (Campinas)', lat: '-22.9481', lng: '-47.1417', custo: 1150}, 
          {nome: 'Pedágio SP-348 (Limeira)', lat: '-22.5839', lng: '-47.3794', custo: 1100}
        ]
      };
      
      // Balanças por rodovia (pontos de pesagem)
      const balancasPorRodovia: {[key: string]: {nome: string, lat: string, lng: string, restricoes?: string}[]} = {
        'SP-255': [
          {nome: 'Balança SP-255 (km 122)', lat: '-22.2153', lng: '-48.1887', restricoes: 'Veículos acima de 1 eixo'},
          {nome: 'Balança SP-255 (km 86)', lat: '-21.8901', lng: '-48.2305', restricoes: 'Veículos acima de 1 eixo'},
          {nome: 'Balança Luís Antônio (km 150)', lat: '-21.5502', lng: '-47.7770', restricoes: 'Veículos acima de 1 eixo'}
        ],
        'SP-310': [
          {nome: 'Balança SP-310 (km 173)', lat: '-21.9845', lng: '-47.8897', restricoes: 'Veículos acima de 1 eixo'},
          {nome: 'Balança SP-310 (km 235)', lat: '-21.6432', lng: '-48.3089', restricoes: 'Veículos acima de 2 eixos'}
        ],
        'SP-330': [
          {nome: 'Balança SP-330 (km 316)', lat: '-21.1267', lng: '-47.9123', restricoes: 'Todos veículos de carga'},
          {nome: 'Balança SP-330 (km 357)', lat: '-20.7812', lng: '-48.2256', restricoes: 'Veículos acima de 2 eixos'}
        ],
        'SP-304': [
          {nome: 'Balança SP-304 (km 285)', lat: '-22.6218', lng: '-47.7756', restricoes: 'Veículos acima de 1 eixo'}
        ],
        'SP-225': [
          {nome: 'Balança SP-225 (km 177)', lat: '-22.2734', lng: '-48.3917', restricoes: 'Veículos acima de 1 eixo'}
        ]
      };
      
      // Adicionar pedágios importantes por cidade (independente da rodovia)
      const pedagogiosPorCidade: {[key: string]: {nome: string, lat: string, lng: string, custo?: number}[]} = {
        'Dois Córregos': [
          {nome: 'Pedágio Dois Córregos/Brotas', lat: '-22.3191', lng: '-48.1605', custo: 930}
        ],
        'Ribeirão Preto': [
          {nome: 'Pedágio Ribeirão Preto/Pradópolis', lat: '-21.2556', lng: '-48.0039', custo: 970},
          {nome: 'Pedágio Ribeirão Preto/Dumont', lat: '-21.1593', lng: '-47.7725', custo: 950}
        ],
        'Boa Esperança do Sul': [
          {nome: 'Pedágio Boa Esperança do Sul', lat: '-21.9901', lng: '-48.3923', custo: 1050}
        ],
        'Jaú': [
          {nome: 'Pedágio Jaú/Bocaina', lat: '-22.1434', lng: '-48.4863', custo: 980},
          {nome: 'Pedágio Jaú/Itapuí', lat: '-22.2343', lng: '-48.7234', custo: 950}
        ],
        'Araraquara': [
          {nome: 'Pedágio Araraquara/Américo Brasiliense', lat: '-21.6822', lng: '-48.1038', custo: 1000},
          {nome: 'Pedágio Araraquara/Gavião Peixoto', lat: '-21.8359', lng: '-48.4912', custo: 950}
        ],
        'São Carlos': [
          {nome: 'Pedágio São Carlos/Ibaté', lat: '-22.0012', lng: '-47.9876', custo: 980}
        ],
        'Bauru': [
          {nome: 'Pedágio Bauru/Agudos', lat: '-22.4689', lng: '-49.1134', custo: 1050}
        ]
      };
      
      // Balanças por cidade
      const balancasPorCidade: {[key: string]: {nome: string, lat: string, lng: string, restricoes?: string}[]} = {
        'Ribeirão Preto': [
          {nome: 'Balança Ribeirão Preto (Entrada Norte)', lat: '-21.1076', lng: '-47.7763', restricoes: 'Veículos acima de 1 eixo'},
          {nome: 'Balança Ribeirão Preto (Anel Viário)', lat: '-21.2365', lng: '-47.8213', restricoes: 'Todos veículos de carga'}
        ],
        'Dois Córregos': [
          {nome: 'Balança Dois Córregos/Mineiros do Tietê', lat: '-22.3867', lng: '-48.4423', restricoes: 'Veículos acima de 2 eixos'}
        ],
        'Jaú': [
          {nome: 'Balança Jaú (Entrada Leste)', lat: '-22.2978', lng: '-48.5012', restricoes: 'Veículos acima de 1 eixo'}
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
      
      // Verificar se a rota passa por Luís Antônio para adicionar a balança
      if (cidadesNaRota.includes('Luís Antônio') || cidadesNaRota.includes('Luis Antonio') || 
          (cidadesNaRota.includes('Dois Córregos') && cidadesNaRota.includes('Ribeirão Preto'))) {
        console.log('Rota passa por região que pode conter a balança de Luís Antônio');
        const poi: PointOfInterest = {
          id: tollId++,
          name: 'Balança Luís Antônio',
          type: 'weighing_station',
          lat: '-21.5502',
          lng: '-47.7770',
          cost: null,
          roadName: 'SP-255',
          restrictions: 'Veículos acima de 1 eixo'
        };
        
        tollPoints.push(poi);
        console.log('Adicionando balança de Luís Antônio manualmente');
      }
      
      // ID base para as balanças
      let balancaId = 20000;

      // Adicionar pedágios e balanças de cidades na rota
      cidadesNaRota.forEach(cidade => {
        // Adicionar pedágios por cidade
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
              cost: pedagio.custo || 980, // Valor padrão de 9,80 se não especificado
              roadName: `Próximo a ${cidade}`,
              restrictions: 'Pedágio por cidade'
            };
            
            tollPoints.push(poi);
            tollsAdded = true;
          });
        }
        
        // Adicionar balanças por cidade
        const balancas = balancasPorCidade[cidade];
        if (balancas) {
          balancas.forEach(balanca => {
            console.log(`Adicionando balança por cidade ${cidade}: ${balanca.nome}`);
            
            const poi: PointOfInterest = {
              id: balancaId++,
              name: balanca.nome,
              lat: balanca.lat,
              lng: balanca.lng,
              type: 'weighing_station',
              cost: null, // balanças não têm custo
              roadName: `Próximo a ${cidade}`,
              restrictions: balanca.restricoes || 'Veículos de carga'
            };
            
            tollPoints.push(poi);
          });
        }
      });
      
      // Adicionar pedágios para as rodovias detectadas
      rodovias.forEach(rodovia => {
        // Adicionar pedágios por rodovia
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
              cost: pedagio.custo || 980, // Usar custo definido ou padrão de 9,80
              roadName: rodovia,
              restrictions: 'Pedágio pré-definido'
            };
            
            tollPoints.push(poi);
            tollsAdded = true;
          });
        }
        
        // Adicionar balanças por rodovia
        const balancas = balancasPorRodovia[rodovia];
        if (balancas) {
          balancas.forEach(balanca => {
            console.log(`Método 3: Adicionando balança pré-conhecida: ${balanca.nome}`);
            
            const poi: PointOfInterest = {
              id: balancaId++,
              name: balanca.nome,
              lat: balanca.lat,
              lng: balanca.lng,
              type: 'weighing_station',
              cost: null, // balanças não têm custo
              roadName: rodovia,
              restrictions: balanca.restricoes || 'Veículos de carga'
            };
            
            tollPoints.push(poi);
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
