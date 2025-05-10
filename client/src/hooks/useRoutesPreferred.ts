import { useCallback } from 'react';
import { PointOfInterest, Location, RouteSegment } from '@/lib/types';

// Tipagem específica para a API Routes Preferred
interface RoutesPreferredResponse {
  routes: Array<{
    legs: Array<{
      steps: Array<{
        polyline: {
          points: string;
        };
        travel_mode: string;
        duration: {
          text: string;
          value: number;
        };
        distance: {
          text: string;
          value: number;
        };
        // Campo da Routes Preferred API para pedágios
        tolls?: Array<{
          name?: string;
          cost?: {
            currency: string;
            value: number;
          };
        }>;
      }>;
      duration: {
        text: string;
        value: number;
      };
      distance: {
        text: string;
        value: number;
      };
    }>;
    // Campos específicos da Routes Preferred API
    fare?: {
      currency: string;
      value: number;
      text: string;
    };
    overview_polyline: {
      points: string;
    };
  }>;
}

export function useRoutesPreferred() {
  // Função para extrair pontos de pedágio da resposta da API
  const extractTollPoints = useCallback((response: RoutesPreferredResponse): PointOfInterest[] => {
    const tollPoints: PointOfInterest[] = [];
    
    try {
      // Processar cada rota retornada
      response.routes.forEach((route, routeIndex) => {
        // Processar cada perna da rota
        route.legs.forEach((leg, legIndex) => {
          // Processar cada passo da perna
          leg.steps.forEach((step, stepIndex) => {
            // Verificar se há informações de pedágio neste passo
            if (step.tolls && step.tolls.length > 0) {
              // Processar cada pedágio encontrado
              step.tolls.forEach((toll, tollIndex) => {
                // Gerar um ID único para este pedágio
                const id = `toll-${routeIndex}-${legIndex}-${stepIndex}-${tollIndex}`;
                
                // Criar um objeto de ponto de pedágio
                const tollPoint: PointOfInterest = {
                  id: parseInt(id.replace(/\\D/g, '')) || (Math.floor(Math.random() * 10000) + 1000),
                  name: toll.name || `Pedágio ${legIndex + 1}-${stepIndex + 1}`,
                  lat: '0', // Precisamos calcular isso
                  lng: '0', // Precisamos calcular isso
                  type: 'toll',
                  cost: toll.cost?.value || 0,
                  roadName: `Trecho ${legIndex + 1}`,
                  restrictions: ''
                };
                
                // Adicionar à lista de pontos de pedágio
                tollPoints.push(tollPoint);
              });
            }
          });
        });
      });
    } catch (error) {
      console.error('Erro ao extrair pontos de pedágio da resposta da API:', error);
    }
    
    return tollPoints;
  }, []);
  
  // Função para calcular os segmentos da rota
  const calculateRouteSegments = useCallback((
    origin: Location,
    destinations: Location[],
    response: RoutesPreferredResponse
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