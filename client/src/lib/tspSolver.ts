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
 * Generate multiple alternative routes using different strategies
 * 
 * @param locations Array of locations
 * @param returnToOrigin Whether to return to the origin point (default: false)
 * @returns Array of alternative routes with their metrics
 */
export function generateAlternativeRoutes(locations: Location[], returnToOrigin: boolean = false): Array<{
  route: Location[];
  strategy: string;
  totalDistance: number;
  estimatedTime: number;
}> {
  if (!locations || locations.length === 0) {
    console.error("Nenhuma localização fornecida para otimização de rota");
    return [];
  }
  
  if (locations.length <= 2) {
    console.log("Apenas origem e um destino, não há necessidade de múltiplas rotas");
    const route = locations;
    return [{
      route,
      strategy: "Rota Direta",
      totalDistance: calculateRouteDistance(route),
      estimatedTime: estimateRouteTime(route)
    }];
  }
  
  const originIndex = locations.findIndex(loc => loc.isOrigin);
  if (originIndex === -1) {
    console.error("Nenhuma localização marcada como origem");
    return [];
  }
  
  const alternatives: Array<{
    route: Location[];
    strategy: string;
    totalDistance: number;
    estimatedTime: number;
  }> = [];
  
  // Estratégia 1: Nearest Neighbor (Mais Eficiente)
  const nearestRoute = nearestNeighborTSP(locations, originIndex, returnToOrigin);
  const nearestLocations = nearestRoute.map(index => locations[index]);
  const nearestDistance = calculateRouteDistance(nearestLocations);
  const nearestTime = estimateRouteTime(nearestLocations);
  alternatives.push({
    route: nearestLocations,
    strategy: "Rota Mais Eficiente",
    totalDistance: nearestDistance,
    estimatedTime: nearestTime
  });
  
  // Estratégia 2: Farthest First (Maiores distâncias primeiro)
  const farthestRoute = farthestFirstTSP(locations, originIndex, returnToOrigin);
  const farthestLocations = farthestRoute.map(index => locations[index]);
  const farthestDistance = calculateRouteDistance(farthestLocations);
  const farthestTime = estimateRouteTime(farthestLocations);
  alternatives.push({
    route: farthestLocations,
    strategy: "Rota por Distância",
    totalDistance: farthestDistance,
    estimatedTime: farthestTime
  });
  
  // Estratégia 3: Geographical (Norte-Sul-Leste-Oeste)
  const geoRoute = geographicalTSP(locations, originIndex, returnToOrigin);
  const geoLocations = geoRoute.map(index => locations[index]);
  const geoDistance = calculateRouteDistance(geoLocations);
  const geoTime = estimateRouteTime(geoLocations);
  alternatives.push({
    route: geoLocations,
    strategy: "Rota Geográfica",
    totalDistance: geoDistance,
    estimatedTime: geoTime
  });

  // Estratégia 4: Reverse Order (ordem inversa dos destinos)
  if (locations.length > 2) {
    const reverseRoute = reverseOrderTSP(locations, originIndex, returnToOrigin);
    const reverseLocations = reverseRoute.map(index => locations[index]);
    const reverseDistance = calculateRouteDistance(reverseLocations);
    const reverseTime = estimateRouteTime(reverseLocations);
    alternatives.push({
      route: reverseLocations,
      strategy: "Rota Inversa",
      totalDistance: reverseDistance,
      estimatedTime: reverseTime
    });
  }
  
  // Log detalhado para debug
  console.log("=== CÁLCULO DE ROTAS ALTERNATIVAS ===");
  console.log(`Rota 1 (Eficiente): ${(nearestDistance/1000).toFixed(2)}km, ${nearestTime.toFixed(0)}min`);
  console.log(`Rota 2 (Distância): ${(farthestDistance/1000).toFixed(2)}km, ${farthestTime.toFixed(0)}min`);
  console.log(`Rota 3 (Geográfica): ${(geoDistance/1000).toFixed(2)}km, ${geoTime.toFixed(0)}min`);
  if (alternatives.length > 3) {
    console.log(`Rota 4 (Inversa): ${(alternatives[3].totalDistance/1000).toFixed(2)}km, ${alternatives[3].estimatedTime.toFixed(0)}min`);
  }
  
  // Remover apenas rotas realmente idênticas (mesma sequência E mesma distância)
  const uniqueAlternatives = alternatives.filter((alt, index, self) => {
    const routeKey = `${alt.route.map(loc => loc.id).join('-')}-${alt.totalDistance.toFixed(0)}`;
    return self.findIndex(other => {
      const otherKey = `${other.route.map(loc => loc.id).join('-')}-${other.totalDistance.toFixed(0)}`;
      return otherKey === routeKey;
    }) === index;
  });
  
  // Ordenar por distância total (mais eficiente primeiro)
  uniqueAlternatives.sort((a, b) => a.totalDistance - b.totalDistance);
  
  console.log(`Geradas ${uniqueAlternatives.length} rotas alternativas únicas`);
  uniqueAlternatives.forEach((alt, i) => {
    console.log(`Rota ${i + 1} (${alt.strategy}): ${alt.totalDistance.toFixed(2)}m, ${alt.estimatedTime.toFixed(0)}min`);
  });
  
  return uniqueAlternatives;
}

/**
 * Farthest First TSP Algorithm - prioritiza destinos mais distantes primeiro
 * Estratégia: sempre escolhe o próximo destino mais distante do ponto atual
 */
function farthestFirstTSP(locations: Location[], startIndex: number, returnToOrigin: boolean): number[] {
  const numLocations = locations.length;
  if (numLocations <= 1) return [startIndex];
  
  const distanceMatrix = createDistanceMatrix(locations);
  const route: number[] = [startIndex];
  const visited = new Set<number>([startIndex]);
  
  console.log(`[FarthestFirst] Iniciando com ${locations[startIndex].name}`);
  
  while (route.length < numLocations) {
    const currentLocation = route[route.length - 1];
    let farthestLocation = -1;
    let maxDistance = -1;
    
    for (let i = 0; i < numLocations; i++) {
      if (!visited.has(i)) {
        const distance = distanceMatrix[currentLocation][i];
        if (distance > maxDistance) {
          farthestLocation = i;
          maxDistance = distance;
        }
      }
    }
    
    if (farthestLocation !== -1) {
      console.log(`[FarthestFirst] De ${locations[currentLocation].name} para ${locations[farthestLocation].name} (${(maxDistance/1000).toFixed(2)}km)`);
      route.push(farthestLocation);
      visited.add(farthestLocation);
    }
  }
  
  if (returnToOrigin) route.push(startIndex);
  
  console.log(`[FarthestFirst] Sequência final:`, route.map(i => locations[i].name));
  return route;
}

/**
 * Geographical TSP Algorithm - organiza por posição geográfica (norte-sul, leste-oeste)
 * Estratégia: visita locais seguindo um padrão geográfico em zigue-zague
 */
function geographicalTSP(locations: Location[], startIndex: number, returnToOrigin: boolean): number[] {
  const numLocations = locations.length;
  if (numLocations <= 1) return [startIndex];
  
  const route: number[] = [startIndex];
  const unvisited = locations
    .map((loc, index) => ({ ...loc, index, lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }))
    .filter((_, index) => index !== startIndex);
  
  console.log(`[Geographical] Iniciando com ${locations[startIndex].name}`);
  
  // Ordenar por latitude (norte para sul) primeiro
  unvisited.sort((a, b) => {
    const latDiff = b.lat - a.lat; // Norte primeiro (maior latitude)
    if (Math.abs(latDiff) > 0.01) return latDiff;
    return a.lng - b.lng; // Oeste primeiro se latitudes similares (menor longitude)
  });
  
  console.log(`[Geographical] Ordem geográfica:`, unvisited.map(loc => `${loc.name} (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)})`));
  
  // Adicionar à rota na ordem geográfica
  unvisited.forEach(loc => {
    console.log(`[Geographical] Adicionando ${loc.name}`);
    route.push(loc.index);
  });
  
  if (returnToOrigin) route.push(startIndex);
  
  console.log(`[Geographical] Sequência final:`, route.map(i => locations[i].name));
  return route;
}

/**
 * Reverse Order TSP Algorithm - inverte a ordem dos destinos
 * Estratégia: visita os destinos na ordem inversa à adição
 */
function reverseOrderTSP(locations: Location[], startIndex: number, returnToOrigin: boolean): number[] {
  const numLocations = locations.length;
  if (numLocations <= 1) return [startIndex];
  
  const route: number[] = [startIndex];
  
  // Pegar todos os índices exceto a origem e inverter a ordem
  const destinationIndices = [];
  for (let i = 0; i < numLocations; i++) {
    if (i !== startIndex) {
      destinationIndices.push(i);
    }
  }
  
  // Inverter a ordem dos destinos
  destinationIndices.reverse();
  
  console.log(`[ReverseOrder] Iniciando com ${locations[startIndex].name}`);
  console.log(`[ReverseOrder] Ordem inversa dos destinos:`, destinationIndices.map(i => locations[i].name));
  
  // Adicionar à rota na ordem invertida
  destinationIndices.forEach(index => {
    route.push(index);
  });
  
  if (returnToOrigin) route.push(startIndex);
  
  console.log(`[ReverseOrder] Sequência final:`, route.map(i => locations[i].name));
  return route;
}

/**
 * Calculate total distance of a route
 */
function calculateRouteDistance(route: Location[]): number {
  if (route.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
}

/**
 * Estimate route time in minutes
 */
function estimateRouteTime(route: Location[]): number {
  const distance = calculateRouteDistance(route);
  const avgSpeedKmh = 60; // 60 km/h média
  const distanceKm = distance / 1000;
  return (distanceKm / avgSpeedKmh) * 60; // Converter para minutos
}

/**
 * Create an optimized route from a list of locations (mantém compatibilidade)
 * 
 * @param locations Array of locations
 * @param returnToOrigin Whether to return to the origin point (default: false)
 * @returns Optimized route as an array of locations
 */
export function createOptimizedRoute(locations: Location[], returnToOrigin: boolean = false): Location[] {
  const alternatives = generateAlternativeRoutes(locations, returnToOrigin);
  
  if (alternatives.length === 0) {
    console.error("Não foi possível gerar rotas alternativas");
    return locations;
  }
  
  // Retorna a rota mais eficiente (primeira na lista ordenada)
  console.log(`Rota otimizada selecionada: ${alternatives[0].strategy}`);
  return alternatives[0].route;
}
