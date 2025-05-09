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
    
    // Filter POIs along route (in a real app this would be based on actual route)
    const tollsOnRoute = pois.filter(poi => poi.type === 'toll');
    setPoisAlongRoute(tollsOnRoute);
    
    // Calculate costs based on vehicle type and route details
    const routeInfoData = calculateRouteCosts(
      { totalDistance, totalDuration },
      tollsOnRoute,
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
