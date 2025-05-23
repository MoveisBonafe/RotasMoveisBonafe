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
export function nearestNeighborTSP(locations: Location[], startIndex: number = 0, returnToOrigin: boolean = false): number[] {
  const numLocations = locations.length;
  
  // Verificar casos especiais
  if (numLocations <= 1) {
    return [startIndex];
  }
  
  // Criar a matriz de distâncias
  const distanceMatrix = createDistanceMatrix(locations);
  
  // Log para depuração
  console.log(`Matriz de distâncias criada (${numLocations}x${numLocations})`);
  
  // Initialize the route with the start index
  const route: number[] = [startIndex];
  const visited = new Set<number>([startIndex]);
  
  // Log para depuração
  console.log(`Iniciando em ${locations[startIndex].name} (índice ${startIndex})`);
  
  // Find the nearest unvisited location until all locations are visited
  while (route.length < numLocations) {
    const currentLocation = route[route.length - 1];
    let nearestLocation = -1;
    let minDistance = Infinity;
    
    // Log para depuração
    console.log(`Buscando o local mais próximo de ${locations[currentLocation].name}...`);
    
    for (let i = 0; i < numLocations; i++) {
      if (!visited.has(i)) {
        const distance = distanceMatrix[currentLocation][i];
        console.log(`Distância para ${locations[i].name}: ${distance.toFixed(2)}m`);
        
        if (distance < minDistance) {
          nearestLocation = i;
          minDistance = distance;
        }
      }
    }
    
    if (nearestLocation === -1) {
      console.error("Não foi possível encontrar o próximo local - isso não deveria acontecer!");
      break;
    }
    
    // Log para depuração
    console.log(`Próximo local: ${locations[nearestLocation].name} (distância: ${minDistance.toFixed(2)}m)`);
    
    route.push(nearestLocation);
    visited.add(nearestLocation);
  }
  
  // Opcionalmente, retorna ao ponto de origem
  if (returnToOrigin) {
    route.push(startIndex);
    console.log(`Rota completa retornando à origem ${locations[startIndex].name}`);
  } else {
    console.log(`Rota completa sem retornar à origem`);
  }
  
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
 * 
 * @param locations Array of locations
 * @param startIndex Index of the starting location (origin)
 * @param returnToOrigin Whether to return to the origin point (default: false)
 * @returns Optimized route indices
 */
export function solveTSP(locations: Location[], startIndex: number = 0, returnToOrigin: boolean = false): number[] {
  if (locations.length <= 2) {
    return locations.length === 1 ? [0] : returnToOrigin ? [0, 1, 0] : [0, 1];
  }
  
  console.log(`Executando algoritmo TSP com ${locations.length} localizações, origem no índice ${startIndex}`);
  
  // Get an initial route using the nearest neighbor algorithm
  const initialRoute = nearestNeighborTSP(locations, startIndex, returnToOrigin);
  
  console.log("Rota inicial:", initialRoute.map(idx => locations[idx].name).join(' -> '));
  
  // Improve the route using the two-opt algorithm
  const optimizedRoute = twoOptTSP(locations, initialRoute);
  
  console.log("Rota após Two-Opt:", optimizedRoute.map(idx => locations[idx].name).join(' -> '));
  
  // Garantir que a rota sempre comece com a origem (startIndex)
  if (optimizedRoute[0] !== startIndex) {
    console.warn("A rota otimizada não começa com a origem! Ajustando...");
    
    // Encontre a posição da origem na rota otimizada
    const originPosition = optimizedRoute.indexOf(startIndex);
    
    if (originPosition !== -1) {
      // Reordenar a rota para começar com a origem
      const reorderedRoute = [
        ...optimizedRoute.slice(originPosition),
        ...optimizedRoute.slice(0, originPosition)
      ];
      
      console.log("Rota reordenada:", reorderedRoute.map(idx => locations[idx].name).join(' -> '));
      return reorderedRoute;
    }
  }
  
  return optimizedRoute;
}

/**
 * Create an optimized route from a list of locations
 * 
 * @param locations Array of locations
 * @param returnToOrigin Whether to return to the origin point (default: false)
 * @returns Optimized route as an array of locations
 */
export function createOptimizedRoute(locations: Location[], returnToOrigin: boolean = false): Location[] {
  if (!locations || locations.length === 0) {
    console.error("Nenhuma localização fornecida para otimização de rota");
    return [];
  }
  
  // Verificamos se temos localizações suficientes para otimizar
  if (locations.length <= 2) {
    console.log("Apenas origem e um destino, não há necessidade de otimização");
    return locations;
  }
  
  // Log para depuração
  console.log(`Otimizando rota com ${locations.length} pontos:`, 
    locations.map(loc => ({ name: loc.name, isOrigin: loc.isOrigin })));
  
  // Find the origin index (should be 0, but let's be safe)
  const originIndex = locations.findIndex(loc => loc.isOrigin);
  
  if (originIndex === -1) {
    console.error("Nenhuma localização marcada como origem");
    return locations;
  }
  
  console.log(`Origem encontrada no índice ${originIndex}: ${locations[originIndex].name}`);
  
  // Solve the TSP
  const optimalIndices = solveTSP(locations, originIndex, returnToOrigin);
  
  // Log para depuração
  console.log("Índices otimizados:", optimalIndices);
  
  // Map indices back to locations
  const optimizedRoute = optimalIndices.map(index => locations[index]);
  
  // Adiciona informação ao log
  console.log("Rota otimizada:", optimizedRoute.map(loc => loc.name).join(" -> "));
  
  return optimizedRoute;
}
