/**
 * Integração do algoritmo TSP e otimização de rotas para o GitHub Pages
 */

// Função para reordenar destinos conforme algoritmo TSP
window.calculateOptimizedRoute = function() {
  if (window.locations && window.locations.length <= 1) {
    alert('Adicione pelo menos um destino além da origem para calcular uma rota.');
    return;
  }

  // Desabilitar botão durante o cálculo
  const optimizeBtn = document.getElementById('optimize-btn');
  if (optimizeBtn) {
    optimizeBtn.disabled = true;
    optimizeBtn.innerHTML = 'Calculando...';
  }

  try {
    // Verificar se TSPSolver está carregado
    if (typeof TSPSolver === 'undefined') {
      alert('Erro: Algoritmo de otimização não encontrado.');
      if (optimizeBtn) {
        optimizeBtn.disabled = false;
        optimizeBtn.innerHTML = 'Otimizar Rota';
      }
      return;
    }

    // Criar instância do TSP solver
    const tspSolver = new TSPSolver();

    // Converter dados de localização para o formato esperado pelo solver
    const tspLocations = window.locations.map(loc => {
      const [lat, lng] = loc.latlng.split(',');
      return {
        id: loc.id,
        name: loc.name,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        isOrigin: loc.isOrigin
      };
    });

    // Encontrar índice da origem
    const originIndex = tspLocations.findIndex(loc => loc.isOrigin);
    
    // Executar algoritmo TSP
    const tspResult = tspSolver.solve(tspLocations, originIndex);
    
    // Armazenar resultado para uso posterior
    window.locationOrder = tspResult.orderedLocations;
    
    // Construir URL do mapa com ordenação otimizada
    const origin = window.locations.find(l => l.isOrigin);
    if (!origin) {
      alert('Erro: Origem não encontrada');
      return;
    }
    
    const waypoints = tspResult.orderedLocations
      .filter(l => !l.isOrigin)
      .map(l => `${l.lat},${l.lng}`)
      .join('|');
    
    // Atualizar iframe do mapa
    const mapIframe = document.getElementById('map-iframe');
    if (mapIframe && waypoints) {
      mapIframe.src = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyCnallnTQ8gT2_F600vt-yAEv2BoH0mj7U&origin=${origin.latlng}&destination=${origin.latlng}&waypoints=${waypoints}&mode=driving&avoid=ferries`;
    }
    
    // Atualizar informações da rota
    updateRouteInfo(tspResult);
    
    // Mostrar painéis de informação
    const routeTabs = document.getElementById('route-tabs');
    if (routeTabs) {
      routeTabs.style.display = 'block';
      
      // Rolar até as abas
      setTimeout(() => {
        routeTabs.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
    
    console.log("Rota otimizada com sucesso usando TSPSolver");
  } catch (error) {
    console.error('Erro ao calcular rota:', error);
    alert('Erro ao calcular a rota. Tente novamente. ' + error.message);
  } finally {
    // Reativar botão
    if (optimizeBtn) {
      optimizeBtn.disabled = false;
      optimizeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        Otimizar Rota
      `;
    }
  }
};

// Função para atualizar informações da rota
function updateRouteInfo(tspResult) {
  // Atualizar resumo
  const totalDistanceElem = document.getElementById('total-distance');
  if (totalDistanceElem) {
    totalDistanceElem.textContent = `${tspResult.totalDistance} km`;
  }
  
  // Formatar o tempo estimado (horas e minutos)
  const timeInMinutes = tspResult.estimatedTime.totalMinutes;
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = timeInMinutes % 60;
  
  let timeText = '';
  if (hours > 0) {
    timeText += `${hours}h `;
  }
  if (minutes > 0 || hours === 0) {
    timeText += `${minutes}min`;
  }
  
  const totalTimeElem = document.getElementById('total-time');
  if (totalTimeElem) {
    totalTimeElem.textContent = timeText;
  }
  
  const totalDestinationsElem = document.getElementById('total-destinations');
  if (totalDestinationsElem) {
    totalDestinationsElem.textContent = tspResult.orderedLocations.length - 1;
  }
  
  const avgSpeedElem = document.getElementById('avg-speed');
  if (avgSpeedElem) {
    avgSpeedElem.textContent = '60 km/h';
  }
  
  // Atualizar sequência de rota
  updateRouteSequence(tspResult);
  
  // Atualizar pontos de atenção
  if (window.updateAttentionPoints) {
    window.updateAttentionPoints(tspResult);
  }
  
  // Atualizar eventos das cidades
  if (window.updateCityEvents) {
    window.updateCityEvents(tspResult);
  }
  
  // Atualizar restrições de caminhões
  if (window.updateTruckRestrictions) {
    window.updateTruckRestrictions(tspResult);
  }
}

// Função para atualizar a sequência da rota
function updateRouteSequence(tspResult) {
  const sequenceList = document.getElementById('sequence-list');
  if (!sequenceList) return;
  
  // Limpar lista atual
  sequenceList.innerHTML = '';
  
  // Obter localizações ordenadas e distâncias
  const { orderedLocations, segmentDistances } = tspResult;
  
  // Adicionar cada local na sequência
  orderedLocations.forEach((location, index) => {
    const li = document.createElement('li');
    
    if (location.isOrigin) {
      // Primeiro item (origem)
      li.textContent = `${location.name} (Origem)`;
    } else {
      // Destinos
      const distance = segmentDistances[index - 1] || 0;
      li.textContent = `${location.name} - ${distance} km`;
    }
    
    // Adicionar animação para melhor visualização
    li.style.animation = `fadeInUp 0.3s ease ${index * 0.1}s forwards`;
    li.style.opacity = '0';
    
    sequenceList.appendChild(li);
  });
  
  console.log("Sequência de rota atualizada com " + orderedLocations.length + " locais");
}