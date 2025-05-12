/**
 * Implementação do algoritmo do Caixeiro Viajante (TSP)
 * para otimização de rotas de entrega
 * @author Otimizador de Rotas
 * @version 1.0.0
 */
class TSPSolver {
  constructor() {
    this.bestDistance = Infinity;
    this.bestPath = [];
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
    // Converter graus para radianos
    const radLat1 = this.deg2rad(lat1);
    const radLon1 = this.deg2rad(lon1);
    const radLat2 = this.deg2rad(lat2);
    const radLon2 = this.deg2rad(lon2);
    
    // Fórmula de Haversine
    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(radLat1) * Math.cos(radLat2) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // Raio da Terra em km
    const R = 6371;
    
    // Distância em km
    return R * c;
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
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const [lat1, lng1] = locations[i].latlng.split(',').map(parseFloat);
          const [lat2, lng2] = locations[j].latlng.split(',').map(parseFloat);
          
          matrix[i][j] = this.calculateDistance(lat1, lng1, lat2, lng2);
        }
      }
    }
    
    return matrix;
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
    const path = [];
    const distances = [];
    let totalDistance = 0;
    
    let currentCity = startIdx;
    path.push(currentCity);
    visited[currentCity] = true;
    
    // Visitar todas as cidades (apenas uma vez)
    for (let i = 0; i < n - 1; i++) {
      let nextCity = -1;
      let minDistance = Infinity;
      
      // Encontrar o próximo destino mais próximo
      for (let j = 0; j < n; j++) {
        if (!visited[j] && distMatrix[currentCity][j] < minDistance) {
          nextCity = j;
          minDistance = distMatrix[currentCity][j];
        }
      }
      
      if (nextCity !== -1) {
        visited[nextCity] = true;
        path.push(nextCity);
        distances.push(minDistance);
        totalDistance += minDistance;
        currentCity = nextCity;
      }
    }
    
    return {
      path,
      distances,
      totalDistance
    };
  }
  
  /**
   * Resolve o problema do caixeiro viajante para uma lista de localizações
   * @param {Array} locations - Lista de locais
   * @param {number} originIndex - Índice da localização de origem
   * @returns {Object} - Resultado com caminho otimizado, distância total e tempo estimado
   */
  solve(locations, originIndex = 0) {
    // Construir matriz de distâncias
    const distMatrix = this.buildDistanceMatrix(locations);
    
    // Executar o algoritmo do vizinho mais próximo
    const result = this.nearestNeighborTSP(distMatrix, originIndex);
    
    // Organizar localizações na ordem do caminho
    const orderedLocations = result.path.map(idx => locations[idx]);
    
    // Arredondar distâncias
    const roundedDistances = result.distances.map(d => Math.round(d));
    
    return {
      orderedLocations,
      totalDistance: Math.round(result.totalDistance),
      segmentDistances: roundedDistances
    };
  }
}

// Exportar a classe para uso global
window.TSPSolver = new TSPSolver();