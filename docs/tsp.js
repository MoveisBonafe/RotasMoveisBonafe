/**
 * Implementação do algoritmo do Caixeiro Viajante (TSP) para otimização de rotas
 * Esta é uma versão simplificada que usa o algoritmo do vizinho mais próximo
 */

// Classe principal do TSP
class TSPSolver {
  constructor() {
    this.infinity = Number.MAX_SAFE_INTEGER;
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
    return Math.round(distance); // Arredonda para inteiros
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

    // Calcular distâncias entre todos os pontos
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          distMatrix[i][j] = 0; // Distância para o mesmo ponto é 0
        } else {
          const loc1 = locations[i];
          const loc2 = locations[j];
          
          // Extrair lat e lng dos objetos de localização
          const lat1 = parseFloat(loc1.latlng.split(',')[0]);
          const lng1 = parseFloat(loc1.latlng.split(',')[1]);
          const lat2 = parseFloat(loc2.latlng.split(',')[0]);
          const lng2 = parseFloat(loc2.latlng.split(',')[1]);
          
          distMatrix[i][j] = this.calculateDistance(lat1, lng1, lat2, lng2);
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
    const visited = Array(n).fill(false);
    const path = [];
    let totalDistance = 0;
    
    // Começar pela origem
    let currentIdx = startIdx;
    path.push(currentIdx);
    visited[currentIdx] = true;
    
    // Encontrar os próximos n-1 pontos
    for (let count = 1; count < n; count++) {
      let nextIdx = -1;
      let minDistance = this.infinity;
      
      // Encontrar o vizinho mais próximo não visitado
      for (let i = 0; i < n; i++) {
        if (!visited[i] && distMatrix[currentIdx][i] < minDistance) {
          minDistance = distMatrix[currentIdx][i];
          nextIdx = i;
        }
      }
      
      // Se encontrou um próximo ponto
      if (nextIdx !== -1) {
        path.push(nextIdx);
        visited[nextIdx] = true;
        totalDistance += minDistance;
        currentIdx = nextIdx;
      }
    }
    
    // Adicionar a distância de volta para a origem
    totalDistance += distMatrix[currentIdx][startIdx];
    
    // Calcular tempos aproximados (60 km/h em média)
    const hours = Math.floor(totalDistance / 60);
    const minutes = Math.round((totalDistance / 60 % 1) * 60);
    const timeStr = `${hours}h ${minutes}min`;
    
    return {
      path: path,
      totalDistance: totalDistance,
      estimatedTime: timeStr
    };
  }

  /**
   * Resolve o problema do caixeiro viajante para uma lista de localizações
   * @param {Array} locations - Lista de locais
   * @param {number} originIndex - Índice da localização de origem
   * @returns {Object} - Resultado com caminho otimizado, distância total e tempo estimado
   */
  solve(locations, originIndex = 0) {
    if (locations.length <= 1) {
      return {
        path: [0],
        totalDistance: 0,
        estimatedTime: "0h 0min",
        orderedLocations: [...locations]
      };
    }
    
    // Construir matriz de distâncias
    const distMatrix = this.buildDistanceMatrix(locations);
    
    // Encontrar o caminho mais curto usando o vizinho mais próximo
    const result = this.nearestNeighborTSP(distMatrix, originIndex);
    
    // Reordenar as localizações conforme o caminho encontrado
    const orderedLocations = result.path.map(idx => locations[idx]);
    
    // Adicionar informações adicionais
    const segmentDistances = [];
    for (let i = 0; i < result.path.length - 1; i++) {
      const fromIdx = result.path[i];
      const toIdx = result.path[i + 1];
      segmentDistances.push(distMatrix[fromIdx][toIdx]);
    }
    
    // Adicionar o segmento de volta à origem
    const lastIdx = result.path[result.path.length - 1];
    segmentDistances.push(distMatrix[lastIdx][originIndex]);
    
    return {
      ...result,
      orderedLocations,
      segmentDistances
    };
  }
}

// Exportar o solucionador
window.TSPSolver = new TSPSolver();