/**
 * Implementação do algoritmo do Caixeiro Viajante (TSP)
 * para otimização de rotas de entrega usando Google Maps API
 * @author Otimizador de Rotas
 * @version 2.0.0
 */
class TSPSolver {
  constructor() {
    this.debug = false;
    this.useGoogleMapsApi = true; // Usar a API do Google Maps para calcular distâncias e tempos
  }

  /**
   * Calcula a distância entre dois pontos usando o Google Maps Distance Matrix API
   * @param {Object} loc1 - Localização origem com lat/lng
   * @param {Object} loc2 - Localização destino com lat/lng
   * @returns {Promise<Object>} - Promise com distância em km e duração em segundos
   */
  async calculateGoogleMapsDistance(loc1, loc2) {
    return new Promise((resolve, reject) => {
      if (!google || !google.maps || !google.maps.DistanceMatrixService) {
        console.error('Google Maps API não disponível');
        // Fallback para o método de cálculo Haversine com correção
        const distance = this.calculateHaversineDistance(
          parseFloat(loc1.lat), parseFloat(loc1.lng),
          parseFloat(loc2.lat), parseFloat(loc2.lng)
        );
        resolve({
          distance: distance,
          duration: distance / 80 * 3600 // Estimativa baseada em 80 km/h
        });
        return;
      }

      const service = new google.maps.DistanceMatrixService();
      const origin = new google.maps.LatLng(parseFloat(loc1.lat), parseFloat(loc1.lng));
      const destination = new google.maps.LatLng(parseFloat(loc2.lat), parseFloat(loc2.lng));

      service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const distance = response.rows[0].elements[0].distance.value / 1000; // converter de metros para km
          const duration = response.rows[0].elements[0].duration.value; // duração em segundos
          
          if (this.debug) {
            console.log(`Distância Google Maps de ${loc1.name} para ${loc2.name}: ${distance.toFixed(1)}km, ${Math.round(duration/60)}min`);
          }
          
          resolve({
            distance: distance,
            duration: duration
          });
        } else {
          console.warn('Erro ao obter distância do Google Maps:', status);
          // Fallback para o método de cálculo Haversine com correção
          const distance = this.calculateHaversineDistance(
            parseFloat(loc1.lat), parseFloat(loc1.lng),
            parseFloat(loc2.lat), parseFloat(loc2.lng)
          );
          resolve({
            distance: distance,
            duration: distance / 80 * 3600 // Estimativa baseada em 80 km/h
          });
        }
      });
    });
  }

  /**
   * Calcula a distância entre dois pontos usando a fórmula de Haversine
   * com um fator de correção para estradas (método de fallback)
   * @param {number} lat1 - Latitude do ponto 1
   * @param {number} lon1 - Longitude do ponto 1
   * @param {number} lat2 - Latitude do ponto 2
   * @param {number} lon2 - Longitude do ponto 2
   * @returns {number} - Distância em quilômetros
   */
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Distância em linha reta
    const directDistance = R * c; 
    
    // Fator de correção para estradas
    const roadFactor = 1.3;
    
    return directDistance * roadFactor;
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
   * @returns {Promise<Object>} - Promise com matriz de distâncias e durações
   */
  async buildDistanceMatrix(locations) {
    const n = locations.length;
    const distMatrix = Array(n).fill().map(() => Array(n).fill(0));
    const durationMatrix = Array(n).fill().map(() => Array(n).fill(0));

    if (this.useGoogleMapsApi && window.google && google.maps) {
      // Usando Google Maps API para cálculos mais precisos
      const promises = [];
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const loc1 = locations[i];
            const loc2 = locations[j];
            
            // Criar uma promessa para cada par de localidades
            const promise = this.calculateGoogleMapsDistance(loc1, loc2)
              .then(result => {
                distMatrix[i][j] = result.distance;
                durationMatrix[i][j] = result.duration;
              });
            
            promises.push(promise);
          }
        }
      }
      
      // Aguardar todas as requisições à API do Google Maps serem concluídas
      await Promise.all(promises);
      
      if (this.debug) {
        console.log('Matriz de distâncias Google Maps:', distMatrix);
        console.log('Matriz de durações Google Maps:', durationMatrix);
      }
      
      return { distMatrix, durationMatrix };
    } else {
      // Fallback: cálculo local com Haversine (menos preciso)
      console.warn('Usando método fallback (Haversine) para cálculo de distâncias');
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const loc1 = locations[i];
            const loc2 = locations[j];
            const distance = this.calculateHaversineDistance(
              parseFloat(loc1.lat),
              parseFloat(loc1.lng),
              parseFloat(loc2.lat),
              parseFloat(loc2.lng)
            );
            distMatrix[i][j] = distance;
            durationMatrix[i][j] = distance / 80 * 3600; // estimativa baseada em 80 km/h
          }
        }
      }
      
      return { distMatrix, durationMatrix };
    }
  }

  /**
   * Executa o algoritmo do vizinho mais próximo para encontrar uma rota
   * @param {Array} distMatrix - Matriz de distâncias
   * @param {Array} durationMatrix - Matriz de durações (tempos)
   * @param {number} startIdx - Índice do ponto de partida
   * @returns {Object} - Rota, distância total e duração total
   */
  nearestNeighborTSP(distMatrix, durationMatrix, startIdx = 0) {
    const n = distMatrix.length;
    const path = [startIdx];
    const segmentDistances = [];
    const segmentDurations = [];
    let totalDistance = 0;
    let totalDuration = 0;
    let currentIdx = startIdx;
    const visited = Array(n).fill(false);
    visited[startIdx] = true;

    // Enquanto não visitamos todos os nós
    while (path.length < n) {
      let minDist = Infinity;
      let nextIdx = -1;
      let nextDuration = 0;

      // Encontrar o vizinho não visitado mais próximo
      for (let i = 0; i < n; i++) {
        if (!visited[i] && distMatrix[currentIdx][i] < minDist) {
          minDist = distMatrix[currentIdx][i];
          nextDuration = durationMatrix[currentIdx][i];
          nextIdx = i;
        }
      }

      if (nextIdx !== -1) {
        path.push(nextIdx);
        segmentDistances.push(minDist);
        segmentDurations.push(nextDuration);
        totalDistance += minDist;
        totalDuration += nextDuration;
        visited[nextIdx] = true;
        currentIdx = nextIdx;
      }
    }

    return {
      path,
      totalDistance,
      totalDuration,
      segmentDistances,
      segmentDurations
    };
  }

  /**
   * Resolve o problema do caixeiro viajante para uma lista de localizações
   * @param {Array} locations - Lista de locais
   * @param {number} originIndex - Índice da localização de origem
   * @returns {Promise<Object>} - Promise com resultado (caminho, distância, tempo)
   */
  async solve(locations, originIndex = 0) {
    try {
      // Construir matriz de distâncias usando Google Maps API
      const { distMatrix, durationMatrix } = await this.buildDistanceMatrix(locations);
      
      // Resolver TSP com algoritmo do vizinho mais próximo
      const result = this.nearestNeighborTSP(distMatrix, durationMatrix, originIndex);
      
      if (this.debug) {
        console.log('Distance Matrix:', distMatrix);
        console.log('Duration Matrix:', durationMatrix);
        console.log('TSP Result:', result);
      }
      
      // Ordenar localizações conforme caminho encontrado
      const orderedLocations = result.path.map(idx => locations[idx]);
      
      // Calcular horas e minutos a partir da duração total em segundos
      const totalDurationHours = result.totalDuration / 3600;
      const hours = Math.floor(totalDurationHours);
      const minutes = Math.round((totalDurationHours - hours) * 60);
      
      return {
        orderedLocations,
        path: result.path,
        totalDistance: Math.round(result.totalDistance),
        segmentDistances: result.segmentDistances.map(d => Math.round(d)),
        estimatedTime: {
          hours,
          minutes,
          totalMinutes: Math.round(result.totalDuration / 60)
        }
      };
    } catch (error) {
      console.error('Erro ao resolver TSP:', error);
      
      // Fallback para o método antigo de cálculo em caso de erro
      console.warn('Usando método fallback para cálculo de rota');
      
      // Constrói matriz simplificada com Haversine
      const n = locations.length;
      const distMatrix = Array(n).fill().map(() => Array(n).fill(0));
      const durationMatrix = Array(n).fill().map(() => Array(n).fill(0));
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const loc1 = locations[i];
            const loc2 = locations[j];
            const distance = this.calculateHaversineDistance(
              parseFloat(loc1.lat),
              parseFloat(loc1.lng),
              parseFloat(loc2.lat),
              parseFloat(loc2.lng)
            );
            distMatrix[i][j] = distance;
            // Estimativa de duração: assumindo 80 km/h como velocidade média
            durationMatrix[i][j] = distance / 80 * 3600; // duração em segundos
          }
        }
      }
      
      const result = this.nearestNeighborTSP(distMatrix, durationMatrix, originIndex);
      const orderedLocations = result.path.map(idx => locations[idx]);
      
      const totalDurationHours = result.totalDuration / 3600;
      const hours = Math.floor(totalDurationHours);
      const minutes = Math.round((totalDurationHours - hours) * 60);
      
      return {
        orderedLocations,
        path: result.path,
        totalDistance: Math.round(result.totalDistance),
        segmentDistances: result.segmentDistances.map(d => Math.round(d)),
        estimatedTime: {
          hours,
          minutes,
          totalMinutes: Math.round(result.totalDuration / 60)
        }
      };
    }
  }
}

// Exportar para uso em ambiente node ou navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TSPSolver };
} else {
  // Variável global para uso no navegador
  window.TSPSolver = TSPSolver;
}