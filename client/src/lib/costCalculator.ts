import { Location, VehicleType, PointOfInterest, RouteInfo } from "./types";

// Average fuel price in reais
const AVERAGE_FUEL_PRICE = 5.0;

/**
 * Calculate toll cost based on vehicle type and route
 * 
 * O custo do pedágio varia conforme o tipo de veículo:
 * - car: 100% do valor base (1.0x)
 * - motorcycle: 50% do valor base (0.5x)
 * - truck1: 200% do valor base (2.0x) - caminhão com 1 eixo
 * - truck2: 300% do valor base (3.0x) - caminhão com 2 eixos
 */
export function calculateTollCost(
  tolls: PointOfInterest[],
  vehicleType: VehicleType
): number {
  // Adiciona cada pedágio com custo específico por tipo de veículo
  let totalCost = 0;
  
  // Percorre todos os pedágios na rota
  tolls.forEach(toll => {
    if (toll.cost) {
      // O custo base do pedágio (armazenado no banco) é para carros
      const baseCost = toll.cost;
      
      // Aplica o multiplicador específico para o tipo de veículo
      // tollMultiplier é armazenado como porcentagem (100 = 1x, 200 = 2x, etc.)
      const vehicleMultiplier = vehicleType.tollMultiplier / 100;
      
      // Adiciona o custo ajustado para este pedágio ao total
      totalCost += Math.round(baseCost * vehicleMultiplier);
      
      console.log(`Pedágio ${toll.name}: R$${(baseCost/100).toFixed(2)} x ${vehicleMultiplier} = R$${(baseCost * vehicleMultiplier/100).toFixed(2)} (${vehicleType.name})`);
    }
  });
  
  return totalCost;
}

/**
 * Calculate fuel cost based on distance and vehicle type
 */
export function calculateFuelCost(
  distanceInMeters: number,
  vehicleType: VehicleType
): number {
  // Convert distance to kilometers
  const distanceInKm = distanceInMeters / 1000;
  
  // Calculate fuel consumption in liters
  // fuelEfficiency is stored as km/liter * 10 for precision
  const fuelConsumptionLiters = distanceInKm / (vehicleType.fuelEfficiency / 10);
  
  // Calculate cost in cents
  const costInCents = Math.round(fuelConsumptionLiters * AVERAGE_FUEL_PRICE * 100);
  
  return costInCents;
}

/**
 * Calculate the estimated fuel consumption in liters
 */
export function calculateFuelConsumption(
  distanceInMeters: number,
  vehicleType: VehicleType
): number {
  const distanceInKm = distanceInMeters / 1000;
  return distanceInKm / (vehicleType.fuelEfficiency / 10);
}

/**
 * Get the fuel efficiency in km/l
 */
export function getFuelEfficiency(vehicleType: VehicleType): number {
  return vehicleType.fuelEfficiency / 10;
}

/**
 * Calculate total route costs
 */
export function calculateRouteCosts(
  route: {
    totalDistance: number;
    totalDuration: number;
  },
  pois: PointOfInterest[],
  vehicleType: VehicleType
): RouteInfo {
  // Filtrar apenas os pedágios para o cálculo de custo
  const tolls = pois.filter(poi => poi.type === 'toll');
  const tollCost = calculateTollCost(tolls, vehicleType);
  const fuelCost = calculateFuelCost(route.totalDistance, vehicleType);
  
  const fuelConsumption = calculateFuelConsumption(route.totalDistance, vehicleType);
  const totalCost = tollCost + fuelCost;
  
  return {
    waypoints: [],      // This should be filled by the caller
    destinations: [],   // This should be filled by the caller
    totalDistance: route.totalDistance,
    totalDuration: route.totalDuration,
    tollCost,
    fuelCost,
    totalCost,
    fuelConsumption
  };
}
