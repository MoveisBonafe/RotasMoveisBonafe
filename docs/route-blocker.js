/**
 * Bloqueador de rotas duplicadas - Solução definitiva
 * Intercepta e bloqueia criação de rotas simultâneas
 */
(function() {
  console.log("🛡️ [RouteBlocker] Iniciando bloqueador de rotas duplicadas");
  
  let rotaEmAndamento = false;
  let timeoutLimpeza = null;
  
  // Interceptar todas as funções que criam rotas
  window.addEventListener('load', function() {
    setTimeout(inicializar, 1000);
  });
  
  function inicializar() {
    // Interceptar botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    if (botaoVisualizar) {
      const originalClick = botaoVisualizar.onclick;
      const textoOriginal = botaoVisualizar.textContent;
      
      botaoVisualizar.onclick = function(e) {
        e.preventDefault();
        
        if (rotaEmAndamento) {
          console.log("🛡️ [RouteBlocker] Processo em andamento - bloqueando clique");
          return false;
        }
        
        console.log("🛡️ [RouteBlocker] Iniciando processo completo - travando botão");
        rotaEmAndamento = true;
        
        // Desabilitar botão visualmente
        this.disabled = true;
        this.style.opacity = '0.5';
        this.style.cursor = 'not-allowed';
        this.textContent = 'Processando...';
        
        // Limpar completamente o mapa
        limparCompletamente();
        
        // Aguardar limpeza e executar função original
        setTimeout(() => {
          if (originalClick) {
            originalClick.call(this, e);
          }
          
          // Monitorar finalização do processo
          monitorarFinalizacao(this, textoOriginal);
        }, 500);
        
        return false;
      };
    }
    
    // Interceptar cliques em rotas alternativas
    monitorarRotasAlternativas();
    
    console.log("🛡️ [RouteBlocker] Bloqueador inicializado");
  }
  
  function monitorarRotasAlternativas() {
    const observer = new MutationObserver(() => {
      const cards = document.querySelectorAll('.route-option-card');
      cards.forEach(card => {
        if (!card.hasAttribute('data-blocker-attached')) {
          card.setAttribute('data-blocker-attached', 'true');
          
          card.addEventListener('click', function() {
            console.log("🛡️ [RouteBlocker] Rota alternativa clicada - limpando imediatamente");
            
            // Cancelar qualquer limpeza anterior
            if (timeoutLimpeza) {
              clearTimeout(timeoutLimpeza);
            }
            
            // Limpar tudo imediatamente
            limparCompletamente();
            
            // Agendar limpeza adicional
            timeoutLimpeza = setTimeout(limparCompletamente, 300);
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  function limparCompletamente() {
    console.log("🛡️ [RouteBlocker] Executando limpeza completa");
    
    try {
      // 1. Parar todas as animações
      if (window.animationInProgress) {
        window.animationInProgress = false;
      }
      
      // 2. Limpar DirectionsRenderer
      if (window.map && window.map.directionsRenderer) {
        window.map.directionsRenderer.setDirections({routes: []});
        window.map.directionsRenderer.setMap(null);
      }
      
      if (window.directionsRenderer) {
        window.directionsRenderer.setDirections({routes: []});
        window.directionsRenderer.setMap(null);
      }
      
      // 3. Remover todas as polylines
      if (window.map && window.map.polylines) {
        window.map.polylines.forEach(polyline => {
          if (polyline && polyline.setMap) {
            polyline.setMap(null);
          }
        });
        window.map.polylines = [];
      }
      
      if (window.polylines) {
        window.polylines.forEach(polyline => {
          if (polyline && polyline.setMap) {
            polyline.setMap(null);
          }
        });
        window.polylines = [];
      }
      
      // 4. Limpar polyline principal
      if (window.mainPolyline) {
        window.mainPolyline.setMap(null);
        window.mainPolyline = null;
      }
      
      // 5. Remover elementos visuais do DOM
      const svgs = document.querySelectorAll('svg');
      svgs.forEach(svg => {
        const paths = svg.querySelectorAll('path[stroke]');
        paths.forEach(path => {
          const stroke = path.getAttribute('stroke');
          if (stroke && stroke !== 'none' && stroke !== '#000000' && stroke !== '#ffffff') {
            path.style.opacity = '0';
            setTimeout(() => path.remove(), 100);
          }
        });
      });
      
      // 6. Forçar atualização do mapa
      if (window.map) {
        const center = window.map.getCenter();
        const zoom = window.map.getZoom();
        setTimeout(() => {
          window.map.setCenter(center);
          window.map.setZoom(zoom);
        }, 100);
      }
      
      console.log("🛡️ [RouteBlocker] Limpeza completa finalizada");
      
    } catch (e) {
      console.log("🛡️ [RouteBlocker] Erro na limpeza:", e);
    }
  }
  
  function monitorarFinalizacao(botao, textoOriginal) {
    console.log("🛡️ [RouteBlocker] Monitorando finalização do processo");
    
    let tentativas = 0;
    const maxTentativas = 30; // 15 segundos máximo
    
    const verificar = setInterval(() => {
      tentativas++;
      
      // Verificar se a rota foi criada (procurar por elementos visuais no mapa)
      const rotaCriada = document.querySelectorAll('svg path[stroke]').length > 0 ||
                        window.map?.directionsRenderer?.getDirections?.()?.routes?.length > 0;
      
      // Verificar se a animação terminou
      const animacaoTerminada = !window.animationInProgress;
      
      if (rotaCriada && animacaoTerminada) {
        console.log("🛡️ [RouteBlocker] Processo finalizado - reabilitando botão");
        reabilitarBotao(botao, textoOriginal);
        clearInterval(verificar);
        rotaEmAndamento = false;
      } else if (tentativas >= maxTentativas) {
        console.log("🛡️ [RouteBlocker] Timeout - forçando reabilitação do botão");
        reabilitarBotao(botao, textoOriginal);
        clearInterval(verificar);
        rotaEmAndamento = false;
      }
    }, 500);
  }
  
  function reabilitarBotao(botao, textoOriginal) {
    botao.disabled = false;
    botao.style.opacity = '1';
    botao.style.cursor = 'pointer';
    botao.textContent = textoOriginal;
    console.log("🛡️ [RouteBlocker] Botão reabilitado");
  }
  
  // Função global para limpeza manual
  window.limparRotasDuplicadas = limparCompletamente;
  
})();