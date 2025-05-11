/**
 * Implementação do algoritmo do Caixeiro Viajante (TSP)
 * para otimização de rotas de entrega
 * @author Otimizador de Rotas
 * @version 1.0.0
 */
class TSPSolver {
  constructor() {
    // Configurações
    this.earthRadius = 6371; // raio da Terra em km
  }

  /**
   * Calcula a distância entre dois pontos usando a fórmula de Haversine
   * @param {number} lat1 - Latitude do ponto 1
   * @param {number} lon1 - Longitude do ponto 1
   * @param {number} lat2 - Latitude do ponto 2
   * @param {number} lon2 - Longitude do ponto 2
   * @returns {number} - Distância em quilômetros
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = this.earthRadius * c; // distância em km
    
    // Arredondar para inteiro
    return Math.round(distance);
  }

  /**
   * Converte graus para radianos
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Constrói a matriz de distâncias entre todos os pontos
   * @param {Array} locations - Array de locais com coordenadas lat/lng
   * @returns {Array} - Matriz de distâncias
   */
  buildDistanceMatrix(locations) {
    const n = locations.length;
    const distMatrix = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          distMatrix[i][j] = 0;
          continue;
        }
        
        // Extrair lat e lng dos locais
        const [lat1, lng1] = locations[i].latlng.split(',').map(parseFloat);
        const [lat2, lng2] = locations[j].latlng.split(',').map(parseFloat);
        
        // Calcular distância
        distMatrix[i][j] = this.calculateDistance(lat1, lng1, lat2, lng2);
      }
    }
    
    return distMatrix;
  }

  /**
   * Executa o algoritmo do vizinho mais próximo para encontrar uma rota
   * @param {Array} distMatrix - Matriz de distâncias
   * @param {number} startIdx - Índice do ponto de partida
   * @returns {Object} - Rota e distância total
   */
  nearestNeighborTSP(distMatrix, startIdx = 0) {
    const n = distMatrix.length;
    const visited = Array(n).fill(false);
    const route = [];
    const distances = [];
    let currentIdx = startIdx;
    let totalDistance = 0;
    
    // Marcar o ponto de origem como visitado e adicionar à rota
    visited[startIdx] = true;
    route.push(startIdx);
    
    // Visitar todos os outros pontos
    for (let i = 1; i < n; i++) {
      let minDist = Infinity;
      let nextIdx = -1;
      
      // Encontrar o vizinho mais próximo não visitado
      for (let j = 0; j < n; j++) {
        if (!visited[j] && distMatrix[currentIdx][j] < minDist) {
          minDist = distMatrix[currentIdx][j];
          nextIdx = j;
        }
      }
      
      // Se encontrou um próximo ponto
      if (nextIdx !== -1) {
        visited[nextIdx] = true;
        route.push(nextIdx);
        distances.push(minDist);
        totalDistance += minDist;
        currentIdx = nextIdx;
      }
    }
    
    // Adicionar distância de volta ao ponto de origem
    if (route.length > 1) {
      const lastIdx = route[route.length - 1];
      const returnDistance = distMatrix[lastIdx][startIdx];
      distances.push(returnDistance);
      totalDistance += returnDistance;
    }
    
    return { route, distances, totalDistance };
  }

  /**
   * Resolve o problema do caixeiro viajante para uma lista de localizações
   * @param {Array} locations - Lista de locais
   * @param {number} originIndex - Índice da localização de origem
   * @returns {Object} - Resultado com caminho otimizado, distância total e tempo estimado
   */
  solve(locations, originIndex = 0) {
    // Validar entrada
    if (!locations || locations.length <= 1) {
      throw new Error('É necessário pelo menos dois locais para calcular uma rota.');
    }
    
    if (originIndex < 0 || originIndex >= locations.length) {
      throw new Error('Índice de origem inválido.');
    }
    
    // Construir matriz de distâncias
    const distMatrix = this.buildDistanceMatrix(locations);
    
    // Resolver o TSP
    const { route, distances, totalDistance } = this.nearestNeighborTSP(distMatrix, originIndex);
    
    // Ordenar as localizações de acordo com a rota
    const orderedLocations = route.map(idx => locations[idx]);
    
    // Calcular tempo estimado (considerando velocidade média de 60 km/h)
    const hours = Math.floor(totalDistance / 60);
    const minutes = Math.round((totalDistance / 60 % 1) * 60);
    const estimatedTime = `${hours}h ${minutes}min`;
    
    return {
      orderedLocations,
      segmentDistances: distances,
      totalDistance,
      estimatedTime
    };
  }
}

// Criar instância global
window.TSPSolver = new TSPSolver();