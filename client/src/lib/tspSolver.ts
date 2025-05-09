import { Location } from "./types";

/**
 * Calculate the Euclidean distance between two locations
 */
function calculateDistance(loc1: Location, loc2: Location): number {
  const lat1 = parseFloat(loc1.lat);
  const lng1 = parseFloat(loc1.lng);
  const lat2 = parseFloat(loc2.lat);
  const lng2 = parseFloat(loc2.lng);
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Create a distance matrix for all locations
 */
function createDistanceMatrix(locations: Location[]): number[][] {
  const matrix: number[][] = [];
  
  for (let i = 0; i < locations.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = calculateDistance(locations[i], locations[j]);
      }
    }
  }
  
  return matrix;
}

/**
 * Nearest Neighbor TSP Algorithm
 * This is a simple greedy algorithm to solve TSP.
 * It's not optimal but provides a good approximation.
 * 
 * @param locations Array of locations
 * @param startIndex Index of the starting location (origin)
 * @returns Array of indices representing the optimized route
 */
export function nearestNeighborTSP(locations: Location[], startIndex: number = 0): number[] {
  const numLocations = locations.length;
  const distanceMatrix = createDistanceMatrix(locations);
  
  // Initialize the route with the start index
  const route: number[] = [startIndex];
  const visited = new Set<number>([startIndex]);
  
  // Find the nearest unvisited location until all locations are visited
  while (route.length < numLocations) {
    const currentLocation = route[route.length - 1];
    let nearestLocation = -1;
    let minDistance = Infinity;
    
    for (let i = 0; i < numLocations; i++) {
      if (!visited.has(i) && distanceMatrix[currentLocation][i] < minDistance) {
        nearestLocation = i;
        minDistance = distanceMatrix[currentLocation][i];
      }
    }
    
    route.push(nearestLocation);
    visited.add(nearestLocation);
  }
  
  // Return to the starting location to complete the circuit
  route.push(startIndex);
  
  return route;
}

/**
 * Two-opt TSP Improvement Algorithm
 * This algorithm improves upon an initial tour by repeatedly swapping edges.
 * 
 * @param locations Array of locations
 * @param initialRoute Initial route to improve
 * @returns Improved route
 */
export function twoOptTSP(locations: Location[], initialRoute: number[]): number[] {
  const distanceMatrix = createDistanceMatrix(locations);
  let route = [...initialRoute];
  let improved = true;
  
  while (improved) {
    improved = false;
    let bestDistance = calculateRouteTotalDistance(route, distanceMatrix);
    
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length - 1; j++) {
        // Create a new route by swapping the edges (i-1,i) and (j,j+1)
        const newRoute = [...route];
        reverseSubroute(newRoute, i, j);
        
        const newDistance = calculateRouteTotalDistance(newRoute, distanceMatrix);
        if (newDistance < bestDistance) {
          route = newRoute;
          bestDistance = newDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }
  
  return route;
}

/**
 * Reverse a portion of the route for the two-opt swap
 */
function reverseSubroute(route: number[], i: number, j: number): void {
  while (i < j) {
    const temp = route[i];
    route[i] = route[j];
    route[j] = temp;
    i++;
    j--;
  }
}

/**
 * Calculate the total distance of a route
 */
function calculateRouteTotalDistance(route: number[], distanceMatrix: number[][]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += distanceMatrix[route[i]][route[i + 1]];
  }
  return totalDistance;
}

/**
 * Solve the TSP using a combination of nearest neighbor and two-opt algorithms
 */
export function solveTSP(locations: Location[], startIndex: number = 0): number[] {
  if (locations.length <= 2) {
    return locations.length === 1 ? [0] : [0, 1, 0];
  }
  
  // Get an initial route using the nearest neighbor algorithm
  const initialRoute = nearestNeighborTSP(locations, startIndex);
  
  // Improve the route using the two-opt algorithm
  return twoOptTSP(locations, initialRoute);
}

/**
 * Create an optimized route from a list of locations
 * 
 * @param locations Array of locations
 * @returns Optimized route as an array of locations
 */
export function createOptimizedRoute(locations: Location[]): Location[] {
  // Find the origin index (should be 0, but let's be safe)
  const originIndex = locations.findIndex(loc => loc.isOrigin);
  const startIndex = originIndex >= 0 ? originIndex : 0;
  
  // Solve the TSP
  const optimalIndices = solveTSP(locations, startIndex);
  
  // Map indices back to locations
  return optimalIndices.map(index => locations[index]);
}
