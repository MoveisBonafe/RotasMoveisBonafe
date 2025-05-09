import { Location, VehicleType, PointOfInterest, RouteInfo } from "./types";

// Average fuel price in reais
const AVERAGE_FUEL_PRICE = 5.0;

/**
 * Calculate toll cost based on vehicle type and route
 */
export function calculateTollCost(
  tolls: PointOfInterest[],
  vehicleType: VehicleType
): number {
  // Sum all toll costs and apply vehicle multiplier
  const totalBaseCost = tolls.reduce((sum, toll) => {
    return sum + (toll.cost || 0);
  }, 0);
  
  // Apply the vehicle type multiplier (percentage)
  return Math.round(totalBaseCost * (vehicleType.tollMultiplier / 100));
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
  tolls: PointOfInterest[],
  vehicleType: VehicleType
): RouteInfo {
  const tollCost = calculateTollCost(tolls, vehicleType);
  const fuelCost = calculateFuelCost(route.totalDistance, vehicleType);
  
  return {
    waypoints: [],      // This should be filled by the caller
    destinations: [],   // This should be filled by the caller
    totalDistance: route.totalDistance,
    totalDuration: route.totalDuration,
    tollCost,
    fuelCost
  };
}
