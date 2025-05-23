/**
 * Interceptador de informações de rota e limpador de mapa
 * Captura dados diretamente das mensagens do sistema e limpa rotas duplicadas
 */
(function() {
  console.log("🎯 [RouteInterceptor] Inicializando interceptador de rotas");
  
  let ultimaDistancia = '--';
  let ultimoTempo = '--';
  let mostrador = null;
  
  // Interceptar console.log para capturar informações
  const originalLog = console.log;
  console.log = function(...args) {
    originalLog.apply(console, args);
    
    const mensagem = args.join(' ');
    
    // Capturar distância calculada
    if (mensagem.includes('Distância total calculada') || mensagem.includes('Distância calculada')) {
      const match = mensagem.match(/(\d+\.?\d*)\s*km/);
      if (match) {
        ultimaDistancia = match[1] + ' km';
        console.log("🎯 [RouteInterceptor] Nova distância capturada:", ultimaDistancia);
        atualizarMostrador();
      }
    }
    
    // Capturar tempo estimado
    if (mensagem.includes('Tempo estimado')) {
      const matchHours = mensagem.match(/(\d+)h\s*(\d+)min/);
      const matchMins = mensagem.match(/(\d+)\s*min/);
      
      if (matchHours) {
        ultimoTempo = matchHours[1] + 'h ' + matchHours[2] + 'min';
        console.log("🎯 [RouteInterceptor] Novo tempo capturado:", ultimoTempo);
        atualizarMostrador();
      } else if (matchMins) {
        ultimoTempo = matchMins[1] + 'min';
        console.log("🎯 [RouteInterceptor] Novo tempo capturado:", ultimoTempo);
        atualizarMostrador();
      }
    }
    
    // Detectar quando pontos são removidos para zerar o mostrador
    if (mensagem.includes('removido') || mensagem.includes('excluído') || 
        mensagem.includes('deleted') || mensagem.includes('Ponto removido') ||
        mensagem.includes('Local removido') || mensagem.includes('Limpando')) {
      console.log("🎯 [RouteInterceptor] Detecção de remoção - zerando mostrador");
      ultimaDistancia = '0 km';
      ultimoTempo = '0min';
      atualizarMostrador();
    }
  };
  
  // Inicializar quando a página carregar
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1000);
  
  function inicializar() {
    criarMostrador();
    configurarLimpezaAutomatica();
    
    console.log("🎯 [RouteInterceptor] Sistema inicializado com sucesso");
  }
  
  function criarMostrador() {
    // Remover mostrador anterior
    const antigo = document.getElementById('route-info-display');
    if (antigo) {
      antigo.remove();
    }
    
    mostrador = document.createElement('div');
    mostrador.id = 'route-info-display';
    mostrador.innerHTML = `
      <div class="route-info-header">📊 Resumo da Rota</div>
      <div class="route-info-content">
        <div class="route-info-item">
          <span class="route-info-icon">📏</span>
          <span class="route-info-label">Distância:</span>
          <span class="route-info-value" id="route-distance">${ultimaDistancia}</span>
        </div>
        <div class="route-info-item">
          <span class="route-info-icon">⏱️</span>
          <span class="route-info-label">Tempo:</span>
          <span class="route-info-value" id="route-time">${ultimoTempo}</span>
        </div>
      </div>
    `;
    
    // Aplicar estilos
    const estilos = `
      #route-info-display {
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 12px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        min-width: 220px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        border: 2px solid #FFD700;
      }
      
      .route-info-header {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #333;
        font-weight: bold;
        padding: 8px 12px;
        margin: -12px -12px 12px -12px;
        border-radius: 8px 8px 0 0;
        text-align: center;
      }
      
      .route-info-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .route-info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }
      
      .route-info-icon {
        font-size: 16px;
        width: 20px;
      }
      
      .route-info-label {
        font-weight: 600;
        color: #555;
        flex: 1;
      }
      
      .route-info-value {
        font-weight: bold;
        color: #2c5282;
        background: #f7fafc;
        padding: 2px 8px;
        border-radius: 4px;
        min-width: 60px;
        text-align: center;
      }
    `;
    
    // Adicionar CSS
    let styleElement = document.getElementById('route-info-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'route-info-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = estilos;
    
    // Adicionar ao DOM
    const mapContainer = document.querySelector('.map-container') || document.body;
    mapContainer.appendChild(mostrador);
    
    console.log("🎯 [RouteInterceptor] Mostrador criado");
  }
  
  function atualizarMostrador() {
    if (!mostrador) return;
    
    const distanciaEl = document.getElementById('route-distance');
    const tempoEl = document.getElementById('route-time');
    
    if (distanciaEl) {
      distanciaEl.textContent = ultimaDistancia;
    }
    
    if (tempoEl) {
      tempoEl.textContent = ultimoTempo;
    }
    
    console.log(`🎯 [RouteInterceptor] Mostrador atualizado - ${ultimaDistancia}, ${ultimoTempo}`);
  }
  
  function configurarLimpezaAutomatica() {
    // Monitorar botões que geram rotas
    const monitorarBotao = (id, nome) => {
      const botao = document.getElementById(id);
      if (botao) {
        botao.addEventListener('click', () => {
          console.log(`🎯 [RouteInterceptor] ${nome} clicado - preparando limpeza`);
          
          // Limpar valores antigos
          ultimaDistancia = '--';
          ultimoTempo = '--';
          atualizarMostrador();
          
          // Limpar mapa
          setTimeout(limparMapaCompletamente, 200);
          setTimeout(limparMapaCompletamente, 1000);
        });
      }
    };
    
    monitorarBotao('visualize-button', 'Visualizar');
    monitorarBotao('optimize-button', 'Otimizar');
    
    // Monitorar mudanças na lista de pontos para detectar remoções
    const observarListaPontos = () => {
      const lista = document.querySelector('#locations-list, .locations-list, .pontos-lista');
      if (lista) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
              console.log("🎯 [RouteInterceptor] Ponto removido da lista - zerando mostrador");
              ultimaDistancia = '0 km';
              ultimoTempo = '0min';
              atualizarMostrador();
            }
          });
        });
        
        observer.observe(lista, { childList: true, subtree: true });
        console.log("🎯 [RouteInterceptor] Observer da lista de pontos configurado");
      }
    };
    
    setTimeout(observarListaPontos, 2000);
    
    // Monitorar botões de rotas alternativas
    const observarRotasAlternativas = () => {
      const botoes = document.querySelectorAll('button, .btn');
      botoes.forEach(botao => {
        const texto = botao.textContent || '';
        if (texto.includes('Proximidade') || texto.includes('Alternativa') || texto.includes('Otimizada')) {
          botao.addEventListener('click', () => {
            console.log("🎯 [RouteInterceptor] Rota alternativa clicada - limpando");
            
            // Resetar valores
            ultimaDistancia = '--';
            ultimoTempo = '--';
            atualizarMostrador();
            
            // Limpar mapa
            setTimeout(limparMapaCompletamente, 300);
          });
        }
      });
    };
    
    setTimeout(observarRotasAlternativas, 1500);
    setInterval(observarRotasAlternativas, 3000);
  }
  
  function limparMapaCompletamente() {
    try {
      console.log("🎯 [RouteInterceptor] Iniciando limpeza completa do mapa");
      
      // Método 1: Limpar via DirectionsRenderer se disponível
      if (window.map && window.map.directionsRenderer) {
        window.map.directionsRenderer.setDirections({routes: []});
        console.log("🎯 [RouteInterceptor] DirectionsRenderer limpo");
      }
      
      // Método 2: Remover elementos SVG de rota
      const svgs = document.querySelectorAll('svg');
      svgs.forEach(svg => {
        const paths = svg.querySelectorAll('path[stroke]');
        if (paths.length > 0) {
          paths.forEach(path => {
            if (path.getAttribute('stroke') && path.getAttribute('stroke') !== 'none') {
              path.remove();
            }
          });
        }
      });
      
      // Método 3: Limpar polylines duplicadas
      if (window.map && window.map.polylines) {
        window.map.polylines.forEach(polyline => {
          polyline.setMap(null);
        });
        window.map.polylines = [];
      }
      
      console.log("🎯 [RouteInterceptor] Limpeza completa do mapa finalizada");
      
    } catch (e) {
      console.log("🎯 [RouteInterceptor] Erro na limpeza:", e);
    }
  }
  
  // Função global para forçar limpeza
  window.forcarLimpezaCompleta = limparMapaCompletamente;
  
})();