import { useState, useCallback } from "react";
import { Location, VehicleType, PointOfInterest, RouteInfo } from "@/lib/types";
import { createOptimizedRoute } from "@/lib/tspSolver";
import { calculateRouteCosts } from "@/lib/costCalculator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Hook para otimização de rotas e cálculo de custos
 */
export function useRouteOptimization() {
  const [optimizedRoute, setOptimizedRoute] = useState<Location[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [poisAlongRoute, setPoisAlongRoute] = useState<PointOfInterest[]>([]);

  // Mutation para calcular rota via servidor (não implementado completamente)
  const calculateRouteMutation = useMutation({
    mutationFn: async ({ locationIds, vehicleType }: { locationIds: number[], vehicleType: string }) => {
      const response = await apiRequest("POST", "/api/calculate-route", { locationIds, vehicleType });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Route calculated:", data);
    }
  });

  /**
   * Função para calcular a distância entre dois pontos em km usando a fórmula de Haversine
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  /**
   * Otimização local de rota usando algoritmo TSP
   */
  const optimizeRouteLocally = useCallback((
    origin: Location,
    locations: Location[],
    vehicleType: VehicleType,
    pois: PointOfInterest[],
    realMetrics?: {totalDistance: number, totalDuration: number}
  ): RouteInfo => {
    // Caso base: verificar se origem e locais estão disponíveis
    if (!origin || locations.length === 0) {
      console.log("Origem ou destinos não fornecidos");
      return {
        totalDistance: 0,
        totalDuration: 0,
        tollCost: 0,
        fuelCost: 0,
        fuelConsumption: 0,
        totalCost: 0
      };
    }

    // Adicionar origem aos locais para otimização
    const allLocations = [origin, ...locations];
    
    // Se for apenas a origem e um destino, não há necessidade de otimização
    const optimizedLocations = locations.length <= 1 
      ? allLocations 
      : createOptimizedRoute(allLocations, false); // false = não voltar ao ponto de origem
    
    if (locations.length <= 1) {
      console.log("Apenas origem e um destino, não há necessidade de otimização");
    }
    
    setOptimizedRoute(optimizedLocations);
    
    // Calcular distância e duração da rota
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Usar métricas reais se disponíveis, ou estimar com base nas coordenadas
    if (realMetrics && realMetrics.totalDistance > 0 && realMetrics.totalDuration > 0) {
      // Se temos métricas reais da API do Google Maps, usamos elas
      console.log(`Usando métricas REAIS da rota: ${realMetrics.totalDistance/1000}km, ${Math.round(realMetrics.totalDuration/60)} min`);
      totalDistance = realMetrics.totalDistance;
      totalDuration = realMetrics.totalDuration;
    } else {
      // Se não temos métricas reais, fazemos uma estimativa grosseira baseada nas coordenadas
      let estimatedDistance = 0;
      
      for (let i = 0; i < optimizedLocations.length - 1; i++) {
        const point1 = optimizedLocations[i];
        const point2 = optimizedLocations[i + 1];
        
        const dist = calculateDistance(
          parseFloat(point1.lat), 
          parseFloat(point1.lng), 
          parseFloat(point2.lat), 
          parseFloat(point2.lng)
        );
        
        // Converter para metros e adicionar à distância total
        estimatedDistance += (dist * 1000);
      }
      
      // Adicionar um fator de correção para estradas (as rotas reais são geralmente 20-30% mais longas que a linha reta)
      const correctionFactor = 1.3;
      totalDistance = Math.round(estimatedDistance * correctionFactor);
      
      // Estimar duração baseada em uma velocidade média de 60 km/h
      // Velocidade em m/s = 60km/h ÷ 3.6 = 16.67 m/s
      totalDuration = Math.round(totalDistance / 16.67);
      
      console.log(`Usando métricas ESTIMADAS da rota: ${totalDistance/1000}km, ${Math.round(totalDuration/60)} min`);
    }
      
    console.log(`Usando métricas da rota: ${totalDistance/1000}km, ${totalDuration/60} min`);
    
    // Filtrar POIs que estão ao longo da rota
    console.log("POIs disponíveis para filtrar:", pois);
    console.log("Rota calculada (pontos):", optimizedLocations);
    
    // IMPORTANTE: Verificar se os destinos incluem Ribeirão Preto
    const includesRibeiraoPreto = optimizedLocations.some(location => 
      (location.name && location.name.toLowerCase().includes("ribeirão")) || 
      (location.name && location.name.toLowerCase().includes("ribeirao")) ||
      (location.address && location.address.toLowerCase().includes("ribeirão")) ||
      (location.address && location.address.toLowerCase().includes("ribeirao")) ||
      (location.name && location.name.toLowerCase() === "pedro") // O CEP de Ribeirão Preto foi importado como "Pedro"
    );
    
    const includesDoisCorregos = optimizedLocations.some(location => 
      (location.name && location.name.toLowerCase().includes("dois córregos")) || 
      (location.name && location.name.toLowerCase().includes("dois corregos")) ||
      (location.address && location.address.toLowerCase().includes("dois córregos")) ||
      (location.address && location.address.toLowerCase().includes("dois corregos"))
    );
    
    console.log("Rota inclui Dois Córregos?", includesDoisCorregos ? "SIM" : "NÃO");
    console.log("Rota inclui Ribeirão Preto?", includesRibeiraoPreto ? "SIM" : "NÃO");
    
    let poisOnRoute = [];
    
    // Se a rota for de Dois Córregos para Ribeirão Preto ou vice-versa,
    // incluir todos os POIs que estão na rodovia SP-225 e SP-255
    if (includesDoisCorregos && includesRibeiraoPreto) {
      console.log("ROTA ESPECIAL DETECTADA: Dois Córregos -> Ribeirão Preto");
      console.log("Incluindo todos os pedágios e balanças relevantes para esta rota");
      
      poisOnRoute = pois.filter(poi => {
        // Incluir todos os pedágios e balanças na SP-225 e SP-255
        const isOnSP225 = poi.roadName && poi.roadName.includes("SP-225");
        const isOnSP255 = poi.roadName && poi.roadName.includes("SP-255");
        
        const shouldInclude = isOnSP225 || isOnSP255;
        console.log(`POI ${poi.name}: ${shouldInclude ? 'INCLUÍDO (rodovia relevante)' : 'EXCLUÍDO (rodovia não relevante)'}`);
        
        return shouldInclude;
      });
    } else {
      // Para outras rotas, manter a filtragem por distância
      const MAX_DISTANCE_KM = 30; // Aumentado de 20 para 30km
      console.log(`Rota padrão: Filtrando POIs a até ${MAX_DISTANCE_KM}km da rota`);
      
      poisOnRoute = pois.filter(poi => {
        const poiLat = parseFloat(poi.lat);
        const poiLng = parseFloat(poi.lng);
        
        let minDistance = Number.MAX_VALUE;
        let closestPoint = null;
        
        for (const location of optimizedLocations) {
          const locationLat = parseFloat(location.lat);
          const locationLng = parseFloat(location.lng);
          
          const distance = calculateDistance(poiLat, poiLng, locationLat, locationLng);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = location.name;
          }
        }
        
        const shouldInclude = minDistance <= MAX_DISTANCE_KM;
        console.log(`POI ${poi.name}: ${shouldInclude ? 'INCLUÍDO' : 'EXCLUÍDO'} - Distância: ${minDistance.toFixed(2)}km`);
        
        return shouldInclude;
      });
    }
    
    console.log(`Total de POIs filtrados para a rota: ${poisOnRoute.length} de ${pois.length}`);
    
    // Atualizar o estado com os pontos filtrados
    setPoisAlongRoute(poisOnRoute);
    
    // Calculate costs based on vehicle type and route details
    const routeInfoData = calculateRouteCosts(
      { totalDistance, totalDuration },
      poisOnRoute,
      vehicleType
    );
    
    // Set the waypoints in the route info
    console.log("POIs processados para a rota:", poisOnRoute);
    
    // Adicionar informações completas ao objeto de retorno
    const routeInfoComplete = {
      ...routeInfoData,
      waypoints: optimizedLocations, // Adicionamos o array completo de localizações
      poisAlongRoute: poisOnRoute,
      destinations: optimizedLocations.slice(1) // Remove a origem
    };
    
    // Necessário para que o componente RouteInfoPanel tenha acesso aos POIs
    setRouteInfo(routeInfoComplete);
    
    return routeInfoComplete;
  }, []);

  /**
   * Função para calcular rota através de uma mutation para o servidor
   */
  const calculateRoute = useCallback(async (
    origin: Location,
    destinations: Location[],
    vehicleType: VehicleType
  ) => {
    try {
      const locationIds = [origin.id, ...destinations.map(d => d.id)];
      await calculateRouteMutation.mutateAsync({
        locationIds,
        vehicleType: vehicleType.type
      });
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    }
  }, [calculateRouteMutation]);

  return {
    optimizeRouteLocally,
    calculateRoute,
    routeInfo,
    optimizedRoute,
    poisAlongRoute,
    isCalculating: calculateRouteMutation.isPending
  };
}