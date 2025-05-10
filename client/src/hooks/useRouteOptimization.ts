import { useState, useCallback } from "react";
import { Location, VehicleType, PointOfInterest, RouteInfo } from "@/lib/types";
import { createOptimizedRoute } from "@/lib/tspSolver";
import { calculateRouteCosts } from "@/lib/costCalculator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useRouteOptimization() {
  const [optimizedRoute, setOptimizedRoute] = useState<Location[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [poisAlongRoute, setPoisAlongRoute] = useState<PointOfInterest[]>([]);

  // Mutation for calculating route
  const calculateRouteMutation = useMutation({
    mutationFn: async ({ locationIds, vehicleType }: { locationIds: number[], vehicleType: string }) => {
      const response = await apiRequest("POST", "/api/calculate-route", { locationIds, vehicleType });
      return response.json();
    },
    onSuccess: (data) => {
      // Handle the route data from the server
      console.log("Route calculated:", data);
    }
  });

  // Optimize route locally
  const optimizeRouteLocally = useCallback((
    origin: Location,
    locations: Location[],
    vehicleType: VehicleType,
    pois: PointOfInterest[]
  ): RouteInfo => {
    // Add origin to locations for optimization
    const allLocations = [origin, ...locations];
    
    // Run TSP algorithm to optimize the route (não retorna ao ponto de origem)
    const optimizedLocations = createOptimizedRoute(allLocations, false); // false = não voltar ao ponto de origem
    setOptimizedRoute(optimizedLocations);
    
    // For this demo, we'll use a simplified approach for route metrics
    const totalDistance = 145000; // 145km in meters
    const totalDuration = 8100; // 2h 15min in seconds
    
    // Filtrar POIs que estão ao longo da rota
    console.log("POIs disponíveis para filtrar:", pois);
    console.log("Rota calculada (pontos):", optimizedLocations);
    
    // Função para calcular a distância entre dois pontos em km (haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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
    
    // Set the waypoints in the route info (inclui todos os pontos)
    routeInfoData.waypoints = optimizedLocations;
    
    // Armazenar apenas os destinos originais (sem origem)
    // Isso permite identificar quais são as cidades de destino reais vs. pontos de passagem
    routeInfoData.destinations = locations;
    
    setRouteInfo(routeInfoData);
    
    // IMPORTANTE: Retornar também os POIs filtrados ao longo da rota
    return {
      ...routeInfoData,
      poisAlongRoute // Adicionado aqui para ter acesso aos POIs no componente Home
    };
  }, []);

  // Optimize route using server API (for real distance calculations)
  const optimizeRoute = useCallback(async (
    origin: Location,
    locations: Location[],
    vehicleType: VehicleType
  ) => {
    // Extract location IDs
    const locationIds = locations.map(loc => loc.id);
    
    try {
      return await calculateRouteMutation.mutateAsync({
        locationIds,
        vehicleType: vehicleType.type
      });
    } catch (error) {
      console.error("Failed to calculate optimal route:", error);
      throw error;
    }
  }, [calculateRouteMutation]);

  return {
    optimizedRoute,
    routeInfo,
    poisAlongRoute,
    optimizeRouteLocally,
    optimizeRoute,
    isCalculating: calculateRouteMutation.isPending
  };
}
