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
      
      // Processar cada rota retornada
      response.routes.forEach((route, routeIndex) => {
        // Processar cada perna da rota
        route.legs.forEach((leg, legIndex) => {
          // Verificar se há informações específicas de pedágio nesta perna (Routes Preferred)
          if (leg.toll_info && leg.toll_info.toll_points && leg.toll_info.toll_points.length > 0) {
            console.log(`Encontrados ${leg.toll_info.toll_points.length} pontos de pedágio no trecho ${legIndex + 1} via toll_info`);
            
            // Processar cada ponto de pedágio
            leg.toll_info.toll_points.forEach((tollPoint, tollIndex) => {
              if (tollPoint.location) {
                // Gerar um ID único para este pedágio
                const id = 1000 + (routeIndex * 100) + (legIndex * 10) + tollIndex;
                
                // Extrair o nome da rodovia dos dados de passo
                let roadName = '';
                let stepWithToll = null;
                
                // Encontrar em qual passo o pedágio está localizado
                for (const step of leg.steps) {
                  // Verificar se o pedágio está dentro da área deste passo
                  const stepBounds = {
                    minLat: Math.min(step.start_location.lat, step.end_location.lat),
                    maxLat: Math.max(step.start_location.lat, step.end_location.lat),
                    minLng: Math.min(step.start_location.lng, step.end_location.lng),
                    maxLng: Math.max(step.start_location.lng, step.end_location.lng),
                  };
                  
                  // Margem de tolerância para a localização
                  const tolerance = 0.05;
                  
                  if (
                    tollPoint.location.lat >= stepBounds.minLat - tolerance &&
                    tollPoint.location.lat <= stepBounds.maxLat + tolerance &&
                    tollPoint.location.lng >= stepBounds.minLng - tolerance &&
                    tollPoint.location.lng <= stepBounds.maxLng + tolerance
                  ) {
                    stepWithToll = step;
                    // Extrair nome da rodovia das instruções HTML
                    const match = step.html_instructions.match(/em\s+<b>(.*?)<\/b>/i);
                    if (match) {
                      roadName = match[1];
                    }
                    break;
                  }
                }
                
                // Extrair custo do pedágio, se disponível
                let cost = 0;
                if (tollPoint.cost && tollPoint.cost.value) {
                  cost = Math.round(tollPoint.cost.value * 100); // converter para centavos
                } else if (leg.toll_info.estimated_price && leg.toll_info.estimated_price.length > 0) {
                  // Se não temos o custo específico deste pedágio, dividir o custo total pelo número de pedágios
                  const totalEstimatedPrice = leg.toll_info.estimated_price[0].value + 
                    (leg.toll_info.estimated_price[0].nanos || 0) / 1e9;
                  const tollCount = leg.toll_info.toll_points.length;
                  cost = Math.round((totalEstimatedPrice / tollCount) * 100);
                }
                
                // Criar um objeto de ponto de pedágio com os dados disponíveis
                const poi: PointOfInterest = {
                  id,
                  name: tollPoint.name || `Pedágio ${legIndex + 1}.${tollIndex + 1}`,
                  lat: tollPoint.location.lat.toString(),
                  lng: tollPoint.location.lng.toString(),
                  type: 'toll',
                  cost,
                  roadName: roadName || `Trecho ${legIndex + 1}`,
                  restrictions: leg.toll_info.toll_passes 
                    ? leg.toll_info.toll_passes.map(pass => pass.name).join(", ")
                    : ''
                };
                
                console.log(`Pedágio detectado: ${poi.name} em ${poi.roadName}, custo: R$ ${(poi.cost/100).toFixed(2)}`);
                
                // Adicionar à lista de pontos de pedágio
                tollPoints.push(poi);
              }
            });
          }
          
          // Processar cada passo da perna para buscar informações de pedágio
          leg.steps.forEach((step, stepIndex) => {
            // Verificar se há informações de pedágio neste passo
            if (step.tolls && step.tolls.length > 0) {
              console.log(`Encontrados ${step.tolls.length} pedágios no passo ${stepIndex + 1} do trecho ${legIndex + 1}`);
              
              // Processar cada pedágio encontrado
              step.tolls.forEach((toll, tollIndex) => {
                // Se já temos localização, ótimo
                const hasLocation = toll.location && toll.location.lat && toll.location.lng;
                let lat = '0', lng = '0';
                
                if (hasLocation) {
                  lat = toll.location.lat.toString();
                  lng = toll.location.lng.toString();
                } else {
                  // Se não temos localização específica, usar um ponto ao longo do passo
                  // Aqui precisaríamos decodificar o polyline e escolher um ponto
                  // Por simplicidade, vamos usar o ponto médio entre início e fim do passo
                  lat = ((step.start_location.lat + step.end_location.lat) / 2).toString();
                  lng = ((step.start_location.lng + step.end_location.lng) / 2).toString();
                }
                
                // Gerar um ID único para este pedágio
                const id = 5000 + (routeIndex * 100) + (legIndex * 10) + (stepIndex * 10) + tollIndex;
                
                // Criar um objeto de ponto de pedágio
                const tollPoint: PointOfInterest = {
                  id,
                  name: toll.name || `Pedágio ${legIndex + 1}.${stepIndex + 1}`,
                  lat,
                  lng,
                  type: 'toll',
                  cost: toll.cost ? Math.round(toll.cost.value * 100) : 0, // converter para centavos
                  roadName: `Trecho ${legIndex + 1}`,
                  restrictions: ''
                };
                
                // Adicionar à lista de pontos de pedágio
                tollPoints.push(tollPoint);
                console.log(`Pedágio detectado via steps: ${tollPoint.name}, custo: R$ ${(tollPoint.cost/100).toFixed(2)}`);
              });
            }
          });
        });
      });
      
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