/**
 * Implementação do algoritmo do Caixeiro Viajante (TSP)
 * para otimização de rotas de entrega
 * @author Otimizador de Rotas
 * @version 1.0.0
 */
class TSPSolver {
  constructor() {
    this.debug = false;
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
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distância em km
    return distance;
  }

  /**
   * Converte graus para radianos
   */
  deg2rad(deg) {
    return deg * (Math.PI / 180);
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
        if (i !== j) {
          const loc1 = locations[i];
          const loc2 = locations[j];
          distMatrix[i][j] = this.calculateDistance(
            parseFloat(loc1.lat),
            parseFloat(loc1.lng),
            parseFloat(loc2.lat),
            parseFloat(loc2.lng)
          );
        }
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
    const path = [startIdx];
    const segmentDistances = [];
    let totalDistance = 0;
    let currentIdx = startIdx;
    const visited = Array(n).fill(false);
    visited[startIdx] = true;

    // Enquanto não visitamos todos os nós
    while (path.length < n) {
      let minDist = Infinity;
      let nextIdx = -1;

      // Encontrar o vizinho não visitado mais próximo
      for (let i = 0; i < n; i++) {
        if (!visited[i] && distMatrix[currentIdx][i] < minDist) {
          minDist = distMatrix[currentIdx][i];
          nextIdx = i;
        }
      }

      if (nextIdx !== -1) {
        path.push(nextIdx);
        segmentDistances.push(minDist);
        totalDistance += minDist;
        visited[nextIdx] = true;
        currentIdx = nextIdx;
      }
    }

    return {
      path,
      totalDistance,
      segmentDistances
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
    
    // Resolver TSP com algoritmo do vizinho mais próximo
    const result = this.nearestNeighborTSP(distMatrix, originIndex);
    
    if (this.debug) {
      console.log('Distance Matrix:', distMatrix);
      console.log('TSP Result:', result);
    }
    
    // Ordenar localizações conforme caminho encontrado
    const orderedLocations = result.path.map(idx => locations[idx]);
    
    // Estimar o tempo com base em uma velocidade média de 60 km/h
    const estimatedTimeHours = result.totalDistance / 60;
    const hours = Math.floor(estimatedTimeHours);
    const minutes = Math.round((estimatedTimeHours - hours) * 60);
    
    return {
      orderedLocations,
      path: result.path,
      totalDistance: Math.round(result.totalDistance),
      segmentDistances: result.segmentDistances.map(d => Math.round(d)),
      estimatedTime: {
        hours,
        minutes,
        totalMinutes: Math.round(estimatedTimeHours * 60)
      }
    };
  }
}

// Exportar para uso em ambiente node ou navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TSPSolver };
} else {
  // Variável global para uso no navegador
  window.TSPSolver = TSPSolver;
}