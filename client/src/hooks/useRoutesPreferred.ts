import { useCallback } from 'react';
import { PointOfInterest, Location, RouteSegment } from '@/lib/types';

// Tipagem para o objeto de direções do Google Maps
interface GoogleMapsDirectionsResult {
  routes: GoogleMapsRoute[];
  geocoded_waypoints: any[];
  status: string;
}

interface GoogleMapsRoute {
  legs: GoogleMapsRouteLeg[];
  overview_path: any[];
  overview_polyline: { points: string };
  warnings: string[];
  waypoint_order: number[];
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

interface GoogleMapsRouteLeg {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  end_address: string;
  end_location: { lat: number; lng: number };
  start_address: string;
  start_location: { lat: number; lng: number };
  steps: GoogleMapsRouteStep[];
  via_waypoint: any[];
  // Campos específicos da Routes Preferred API (que estamos buscando)
  toll_info?: {
    estimated_price?: {
      units: string;
      currency: string;
      value: number;
      nanos: number;
    }[];
    toll_passes?: {
      name: string;
    }[];
    toll_points?: {
      location: { lat: number; lng: number };
      name?: string;
      segment_index?: number;
      payment_methods?: string[];
      payment_facilities?: string[];
      cost?: {
        currency: string;
        value: number;
      };
    }[];
  };
}

interface GoogleMapsRouteStep {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  end_location: { lat: number; lng: number };
  start_location: { lat: number; lng: number };
  html_instructions: string;
  polyline: { points: string };
  travel_mode: string;
  maneuver?: string;
  // Pedágios em cada passo (informação que estamos buscando)
  tolls?: {
    name?: string;
    location?: { lat: number; lng: number };
    cost?: { 
      currency: string;
      value: number; 
    };
  }[];
}

export function useRoutesPreferred() {
  // Função para extrair pontos de pedágio da resposta da API
  const extractTollPoints = useCallback((response: GoogleMapsDirectionsResult): PointOfInterest[] => {
    const tollPoints: PointOfInterest[] = [];
    
    try {
      console.log('Analisando resposta da API para encontrar pedágios:', response);
      
      // Método para determinar o nome da rodovia com base nas instruções do passo
      const extractRoadName = (instruction: string): string => {
        // Padrões comuns nos nomes de rodovias brasileiras
        const patterns = [
          /em\s+<b>(.*?)<\/b>/i,                      // "em <b>SP-255</b>"
          /pela\s+<b>(.*?)<\/b>/i,                    // "pela <b>Rod. Faria Lima</b>"
          /na\s+<b>(.*?)<\/b>/i,                      // "na <b>Rodovia Anhanguera</b>"
          /para\s+<b>(.*?)<\/b>/i,                    // "para <b>SP-255</b>"
          /<b>(SP-\d+|BR-\d+|Rod\.\s+[\w\s]+)<\/b>/i, // "<b>SP-255</b>" ou "<b>Rod. Castelo Branco</b>"
        ];
        
        for (const pattern of patterns) {
          const match = instruction.match(pattern);
          if (match && match[1]) {
            return match[1].replace(/<\/?b>/g, '').trim();
          }
        }
        
        return '';
      };
      
      // Processar cada rota retornada
      if (response.routes && response.routes.length > 0) {
        const mainRoute = response.routes[0];
        
        // Processar cada perna da rota principal
        mainRoute.legs.forEach((leg, legIndex) => {
          // Extrair pedágios do toll_info (Routes Preferred API)
          if (leg.toll_info && leg.toll_info.toll_points && leg.toll_info.toll_points.length > 0) {
            console.log(`Encontrados ${leg.toll_info.toll_points.length} pontos de pedágio no trecho ${legIndex + 1} via toll_info`);
            
            // Calcular o custo médio por pedágio se tivermos apenas o total
            let defaultTollCost = 0;
            if (leg.toll_info.estimated_price && leg.toll_info.estimated_price.length > 0) {
              const totalEstimatedPrice = leg.toll_info.estimated_price[0].value + 
                (leg.toll_info.estimated_price[0].nanos || 0) / 1e9;
              const tollCount = leg.toll_info.toll_points.length;
              defaultTollCost = Math.round((totalEstimatedPrice / tollCount) * 100);
            }
            
            // Encontrar nomes de rodovias nos passos desta perna
            const roadNames = new Map();
            leg.steps.forEach((step) => {
              if (step.html_instructions) {
                const roadName = extractRoadName(step.html_instructions);
                if (roadName) {
                  // Mapeamos aproximadamente a região do passo para a rodovia
                  const key = `${step.start_location.lat.toFixed(3)},${step.start_location.lng.toFixed(3)}`;
                  roadNames.set(key, roadName);
                }
              }
            });
            
            // Processar cada ponto de pedágio
            leg.toll_info.toll_points.forEach((tollPoint, tollIndex) => {
              if (tollPoint.location) {
                // Gerar um ID único para este pedágio
                const id = 1000 + (legIndex * 100) + tollIndex;
                
                // Encontrar a rodovia mais próxima para este pedágio
                let roadName = '';
                let minDistance = Number.MAX_VALUE;
                
                // Percorrer todos os passos para encontrar o mais próximo
                for (const step of leg.steps) {
                  const distance = Math.sqrt(
                    Math.pow(step.start_location.lat - tollPoint.location.lat, 2) +
                    Math.pow(step.start_location.lng - tollPoint.location.lng, 2)
                  );
                  
                  if (distance < minDistance) {
                    minDistance = distance;
                    const extractedName = extractRoadName(step.html_instructions);
                    if (extractedName) {
                      roadName = extractedName;
                    }
                  }
                }
                
                // Se não encontrou nome de rodovia, tentar inferir pela proximidade
                if (!roadName) {
                  roadNames.forEach((name, key) => {
                    const [lat, lng] = key.split(',').map(parseFloat);
                    const distance = Math.sqrt(
                      Math.pow(lat - tollPoint.location.lat, 2) +
                      Math.pow(lng - tollPoint.location.lng, 2)
                    );
                    if (distance < 0.05) { // ~5km de tolerância
                      roadName = name;
                    }
                  });
                }
                
                // Extrair custo do pedágio, se disponível
                let cost = 0;
                if (tollPoint.cost && tollPoint.cost.value) {
                  cost = Math.round(tollPoint.cost.value * 100); // converter para centavos
                } else {
                  cost = defaultTollCost;
                }
                
                // Criar um nome mais significativo para o pedágio se possível
                let tollName = tollPoint.name;
                if (!tollName) {
                  tollName = roadName ? 
                    `Pedágio ${roadName} (km ${legIndex + 1}.${tollIndex + 1})` : 
                    `Pedágio Trecho ${legIndex + 1}.${tollIndex + 1}`;
                }
                
                // Criar um objeto de ponto de pedágio com os dados disponíveis
                const poi: PointOfInterest = {
                  id,
                  name: tollName,
                  lat: tollPoint.location.lat.toString(),
                  lng: tollPoint.location.lng.toString(),
                  type: 'toll',
                  cost,
                  roadName: roadName || `Trecho ${legIndex + 1}`,
                  restrictions: leg.toll_info.toll_passes 
                    ? leg.toll_info.toll_passes.map(pass => pass.name).join(", ")
                    : ''
                };
                
                console.log(`Pedágio detectado: ${poi.name} em ${poi.roadName}, posição: ${poi.lat},${poi.lng}, custo: R$ ${(poi.cost/100).toFixed(2)}`);
                
                // Adicionar à lista de pontos de pedágio
                tollPoints.push(poi);
              }
            });
          }
          
          // Método alternativo: extrair pedágios dos passos individuais
          let stepIndexWithTolls = new Set<number>();
          
          // Primeiro, identifique quais passos têm pedágios para evitar duplicação
          leg.steps.forEach((step, stepIndex) => {
            if (step.tolls && step.tolls.length > 0) {
              stepIndexWithTolls.add(stepIndex);
            }
          });
          
          // Agora processe apenas os passos que não têm pedágios duplicados do toll_info
          if (stepIndexWithTolls.size > 0 && (!leg.toll_info || !leg.toll_info.toll_points)) {
            console.log(`Encontrados pedágios em ${stepIndexWithTolls.size} passos do trecho ${legIndex + 1}`);
            
            // Processar cada passo com pedágio
            leg.steps.forEach((step, stepIndex) => {
              if (step.tolls && step.tolls.length > 0) {
                step.tolls.forEach((toll, tollIndex) => {
                  // Determinar as coordenadas do pedágio
                  let lat, lng;
                  if (toll.location && toll.location.lat && toll.location.lng) {
                    lat = toll.location.lat.toString();
                    lng = toll.location.lng.toString();
                  } else {
                    // Fallback: usar o ponto médio do passo (menos preciso)
                    lat = ((step.start_location.lat + step.end_location.lat) / 2).toString();
                    lng = ((step.start_location.lng + step.end_location.lng) / 2).toString();
                  }
                  
                  // Obter nome da rodovia
                  const roadName = extractRoadName(step.html_instructions) || `Trecho ${legIndex + 1}`;
                  
                  // Gerar um ID único
                  const id = 5000 + (legIndex * 100) + (stepIndex * 10) + tollIndex;
                  
                  // Criar nome para o pedágio
                  const tollName = toll.name || 
                    (roadName ? `Pedágio ${roadName}` : `Pedágio ${legIndex + 1}.${stepIndex + 1}`);
                  
                  // Criar objeto de pedágio
                  const tollPoint: PointOfInterest = {
                    id,
                    name: tollName,
                    lat,
                    lng,
                    type: 'toll',
                    cost: toll.cost ? Math.round(toll.cost.value * 100) : 0,
                    roadName,
                    restrictions: ''
                  };
                  
                  // Adicionar o pedágio à lista
                  tollPoints.push(tollPoint);
                  console.log(`Pedágio detectado via steps: ${tollPoint.name}, posição: ${lat},${lng}, custo: R$ ${(tollPoint.cost/100).toFixed(2)}`);
                });
              }
            });
          }
        });
      }
      
      console.log(`Total de ${tollPoints.length} pedágios encontrados na rota`);
    } catch (error) {
      console.error('Erro ao extrair pontos de pedágio da resposta da API:', error);
    }
    
    return tollPoints;
  }, []);
  
  // Função para calcular os segmentos da rota
  const calculateRouteSegments = useCallback((
    origin: Location,
    destinations: Location[],
    response: GoogleMapsDirectionsResult
  ): RouteSegment[] => {
    const segments: RouteSegment[] = [];
    
    try {
      // Processar cada perna da rota
      response.routes[0]?.legs.forEach((leg, index) => {
        // Origem e destino deste segmento
        const segmentOrigin = index === 0 ? origin : destinations[index - 1];
        const segmentDestination = destinations[index];
        
        // Criar um objeto de segmento
        const segment: RouteSegment = {
          origin: segmentOrigin,
          destination: segmentDestination,
          distance: leg.distance.value, // em metros
          duration: leg.duration.value, // em segundos
          tollCost: 0, // Precisamos calcular com base nos toll points
          polyline: leg.steps.map(step => step.polyline.points).join('')
        };
        
        // Calcular o custo total de pedágios neste segmento
        let segmentTollCost = 0;
        leg.steps.forEach(step => {
          if (step.tolls && step.tolls.length > 0) {
            step.tolls.forEach(toll => {
              segmentTollCost += toll.cost?.value || 0;
            });
          }
        });
        segment.tollCost = segmentTollCost;
        
        // Adicionar à lista de segmentos
        segments.push(segment);
      });
    } catch (error) {
      console.error('Erro ao calcular segmentos da rota:', error);
    }
    
    return segments;
  }, []);
  
  return {
    extractTollPoints,
    calculateRouteSegments
  };
}