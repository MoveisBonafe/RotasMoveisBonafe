/**
 * Cálculo Preciso de Rotas
 * 
 * Este script garante que o mesmo método de cálculo seja usado para todas as rotas,
 * tornando a comparação entre rotas normal e otimizada precisa e consistente.
 * 
 * - Captura o algoritmo usado pelo botão "Visualizar" (considerado o mais preciso)
 * - Aplica o mesmo método de cálculo para rotas otimizadas
 * - Mostra sempre valores reais e consistentes de distância e tempo
 */
(function() {
  console.log("🧮 [CalculoPreciso] Iniciando sistema de cálculo preciso");
  
  // Rastrear as localizações e a ordem atual
  let localizacoes = [];
  let rotaOriginal = [];
  let rotaOtimizada = [];
  
  // Métricas calculadas pelo método preciso
  let metricasNormal = null;
  let metricasOtimizada = null;
  
  // Interceptar API do Google Maps para capturar calculadora de rotas
  let directionsService = null;
  let directionsRenderer = null;
  
  // Inicializar quando a página estiver carregada
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 3000);
  
  function inicializar() {
    console.log("🧮 [CalculoPreciso] Configurando interceptadores");
    
    // Encontrar os botões de visualização e otimização
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    if (!botaoVisualizar || !botaoOtimizar) {
      console.log("🧮 [CalculoPreciso] Botões ainda não disponíveis");
      return;
    }
    
    // Interceptar o serviço de direções do Google Maps
    interceptarGoogleMaps();
    
    // Interceptar a lista de localizações para acompanhar pontos
    rastrearLocalizacoes();
    
    // Interceptar cliques nos botões
    interceptarBotao(botaoVisualizar, 'visualizar');
    interceptarBotao(botaoOtimizar, 'otimizar');
    
    // Observer para mudanças na exibição de informações
    observarInformacoesRota();
    
    console.log("🧮 [CalculoPreciso] Configuração concluída");
  }
  
  // Interceptar o serviço de direções do Google Maps
  function interceptarGoogleMaps() {
    // Verificar se o Google Maps está disponível
    if (!window.google || !window.google.maps) {
      console.log("🧮 [CalculoPreciso] Google Maps não disponível");
      return;
    }
    
    // Tentar encontrar ou monitorar o serviço de direções
    if (window.directionsService) {
      directionsService = window.directionsService;
      console.log("🧮 [CalculoPreciso] Serviço de direções encontrado");
    }
    
    // Interceptar a criação do serviço de direções
    const originalDirectionsService = window.google.maps.DirectionsService;
    window.google.maps.DirectionsService = function() {
      directionsService = new originalDirectionsService();
      
      // Interceptar método de rota
      const originalRoute = directionsService.route;
      directionsService.route = function(request, callback) {
        console.log("🧮 [CalculoPreciso] Interceptando cálculo de rota:", request);
        
        // Chamar a função original
        return originalRoute.call(this, request, function(result, status) {
          // Processar resultados
          if (status === 'OK') {
            processarResultadoRota(request, result);
          }
          
          // Retornar para a função original
          if (callback) callback(result, status);
        });
      };
      
      return directionsService;
    };
    
    // Interceptar o DirectionsRenderer também
    const originalDirectionsRenderer = window.google.maps.DirectionsRenderer;
    window.google.maps.DirectionsRenderer = function(opts) {
      directionsRenderer = new originalDirectionsRenderer(opts);
      
      // Interceptar método setDirections
      const originalSetDirections = directionsRenderer.setDirections;
      directionsRenderer.setDirections = function(result) {
        console.log("🧮 [CalculoPreciso] Interceptando renderização de rota");
        
        // Processar o resultado sendo renderizado
        processarResultadoRota(null, result);
        
        // Chamar o método original
        return originalSetDirections.call(this, result);
      };
      
      return directionsRenderer;
    };
    
    console.log("🧮 [CalculoPreciso] Interceptação do Google Maps configurada");
  }
  
  // Rastrear as localizações adicionadas
  function rastrearLocalizacoes() {
    // Verificar periodicamente a lista de localizações
    setInterval(function() {
      // Verificar se a variável global locations existe
      if (window.locations && Array.isArray(window.locations)) {
        localizacoes = window.locations.slice();
        console.log("🧮 [CalculoPreciso] Localizações atualizadas:", localizacoes.length);
      }
    }, 2000);
  }
  
  // Interceptar cliques nos botões
  function interceptarBotao(botao, tipo) {
    const clickOriginal = botao.onclick;
    
    botao.onclick = function(event) {
      console.log(`🧮 [CalculoPreciso] Botão ${tipo} clicado`);
      
      // Registrar o tipo de rota sendo calculada
      window.tipoRotaAtual = tipo;
      
      // Executar o comportamento original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Após um tempo, verificar se precisamos atualizar as informações
      setTimeout(function() {
        atualizarInformacoesRota(tipo);
      }, 2000);
    };
  }
  
  // Processar resultado de rota do Google Maps
  function processarResultadoRota(request, result) {
    try {
      // Verificar se o resultado é válido e tem rotas
      if (!result || !result.routes || !result.routes.length) {
        console.log("🧮 [CalculoPreciso] Resultado sem rotas");
        return;
      }
      
      // Verificar que tipo de rota está sendo calculada
      const tipoRota = window.tipoRotaAtual || 'desconhecido';
      console.log(`🧮 [CalculoPreciso] Processando resultado de rota ${tipoRota}`);
      
      // Extrair a ordem dos waypoints
      const waypointOrder = result.routes[0].waypoint_order || [];
      
      // Extrair as pernas da rota
      const legs = result.routes[0].legs || [];
      
      // Calcular distância e tempo totais
      let distanciaTotal = 0;
      let tempoTotal = 0;
      
      legs.forEach(leg => {
        distanciaTotal += leg.distance.value;
        tempoTotal += leg.duration.value;
      });
      
      // Converter para formatos legíveis
      const distanciaKm = (distanciaTotal / 1000).toFixed(2);
      const tempoMinutos = Math.floor(tempoTotal / 60);
      
      // Número de paradas
      const numParadas = request && request.waypoints ? request.waypoints.length : waypointOrder.length;
      
      // Armazenar métricas baseadas no tipo de rota
      const metricas = {
        distancia: parseFloat(distanciaKm),
        tempo: tempoMinutos,
        paradas: numParadas,
        timestamp: new Date().getTime()
      };
      
      if (tipoRota === 'visualizar') {
        // Armazenar como métricas normais
        metricasNormal = metricas;
        
        // Determinar a ordem original
        rotaOriginal = determinaOrdemPontos(legs);
        
        console.log("🧮 [CalculoPreciso] Métricas normais capturadas:", metricasNormal);
      } else if (tipoRota === 'otimizar') {
        // Armazenar como métricas otimizadas
        metricasOtimizada = metricas;
        
        // Determinar a ordem otimizada
        rotaOtimizada = determinaOrdemPontos(legs);
        
        console.log("🧮 [CalculoPreciso] Métricas otimizadas capturadas:", metricasOtimizada);
      }
      
      // Atualizar as informações exibidas
      atualizarInformacoesRota(tipoRota);
    } catch (erro) {
      console.log("🧮 [CalculoPreciso] Erro ao processar resultado:", erro);
    }
  }
  
  // Determinar a ordem dos pontos a partir das pernas da rota
  function determinaOrdemPontos(legs) {
    if (!legs || !legs.length) return [];
    
    const pontos = [];
    
    // Adicionar o primeiro ponto (origem)
    pontos.push(legs[0].start_location);
    
    // Adicionar os pontos intermediários e finais
    legs.forEach(leg => {
      pontos.push(leg.end_location);
    });
    
    return pontos;
  }
  
  // Atualizar informações de rota no DOM
  function atualizarInformacoesRota(tipo) {
    // Encontrar o elemento de informações de rota
    const infoRota = document.getElementById('route-info');
    if (!infoRota) {
      console.log("🧮 [CalculoPreciso] Elemento de informações não encontrado");
      return;
    }
    
    // Verificar qual tipo de rota usar
    if (tipo === 'otimizar' && metricasNormal && metricasOtimizada) {
      // Comparar rotas
      atualizarComparacao(infoRota, metricasNormal, metricasOtimizada);
    }
  }
  
  // Atualizar a comparação entre rotas
  function atualizarComparacao(elemento, normal, otimizada) {
    // Calcular diferenças
    const difDistancia = normal.distancia - otimizada.distancia;
    const difTempo = normal.tempo - otimizada.tempo;
    const percentDistancia = (difDistancia / normal.distancia * 100).toFixed(1);
    const percentTempo = (difTempo / normal.tempo * 100).toFixed(1);
    
    // Verificar se já existe comparação
    let comparacao = elemento.querySelector('.route-comparison');
    
    if (!comparacao) {
      // Criar elemento para a comparação
      comparacao = document.createElement('div');
      comparacao.className = 'route-comparison';
      comparacao.style.marginTop = '15px';
      comparacao.style.paddingTop = '10px';
      comparacao.style.borderTop = '1px solid #ddd';
      elemento.appendChild(comparacao);
    }
    
    // Atualizar conteúdo
    comparacao.innerHTML = `
      <p><strong>Comparação com rota não otimizada:</strong></p>
      <p>Distância: <span style="color: ${difDistancia > 0 ? '#4CAF50' : '#F44336'}">
        ${difDistancia > 0 ? 'Economia' : 'Aumento'} de ${Math.abs(difDistancia).toFixed(2)} km (${Math.abs(percentDistancia)}%)
      </span></p>
      <p>Tempo: <span style="color: ${difTempo > 0 ? '#4CAF50' : '#F44336'}">
        ${difTempo > 0 ? 'Economia' : 'Aumento'} de ${formatarTempo(Math.abs(difTempo))} (${Math.abs(percentTempo)}%)
      </span></p>
      <p style="font-style: italic; font-size: 12px; margin-top: 10px;">
        Os valores mostrados usam o mesmo método de cálculo da rota normal para garantir precisão na comparação.
      </p>
    `;
  }
  
  // Formatar tempo para exibição
  function formatarTempo(minutos) {
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    
    if (horas === 0) {
      return `${min} minutos`;
    } else if (min === 0) {
      return `${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
      return `${horas}h ${min}min`;
    }
  }
  
  // Observar mudanças nas informações de rota
  function observarInformacoesRota() {
    const infoContainer = document.getElementById('bottom-info');
    
    if (!infoContainer) {
      console.log("🧮 [CalculoPreciso] Container de informações não encontrado");
      return;
    }
    
    // Criar observer
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          // Verificar se contém "Rota Otimizada"
          const infoRota = document.getElementById('route-info');
          if (infoRota && infoRota.innerHTML.includes('Rota Otimizada')) {
            // Atualizar informações como rota otimizada
            setTimeout(() => {
              window.tipoRotaAtual = 'otimizar';
              atualizarInformacoesRota('otimizar');
            }, 500);
          }
        }
      }
    });
    
    // Iniciar observação
    observer.observe(infoContainer, { 
      childList: true, 
      subtree: true,
      characterData: true 
    });
    
    console.log("🧮 [CalculoPreciso] Observer configurado");
  }
})();