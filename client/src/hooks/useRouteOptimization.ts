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
    
    // Filtrar POIs que estão até 20km de distância de qualquer ponto da rota
    // Aumentamos para 20km para garantir que capturamos os POIs relevantes
    const MAX_DISTANCE_KM = 20;
    console.log(`Filtrando POIs a até ${MAX_DISTANCE_KM}km da rota`);
    
    const poisOnRoute = pois.filter(poi => {
      const poiLat = parseFloat(poi.lat);
      const poiLng = parseFloat(poi.lng);
      
      console.log(`Avaliando POI: ${poi.name} (${poi.type}) em [${poiLat}, ${poiLng}]`);
      
      // Verificar cada ponto da rota
      let minDistance = Number.MAX_VALUE;
      let closestPoint = null;
      
      for (const location of optimizedLocations) {
        const locationLat = parseFloat(location.lat);
        const locationLng = parseFloat(location.lng);
        
        // Calcular distância entre POI e ponto da rota
        const distance = calculateDistance(poiLat, poiLng, locationLat, locationLng);
        
        // Manter registro da menor distância para este POI
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = location.name;
        }
      }
      
      // Se POI estiver a menos de MAX_DISTANCE_KM de algum ponto da rota, incluir
      const shouldInclude = minDistance <= MAX_DISTANCE_KM;
      
      console.log(`POI ${poi.name}: ${shouldInclude ? 'INCLUÍDO' : 'EXCLUÍDO'} - Distância mínima: ${minDistance.toFixed(2)}km (local mais próximo: ${closestPoint})`);
      
      return shouldInclude;
    });
    
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
    return routeInfoData;
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
