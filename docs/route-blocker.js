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
      botaoVisualizar.onclick = function(e) {
        e.preventDefault();
        
        if (rotaEmAndamento) {
          console.log("🛡️ [RouteBlocker] Rota já em andamento - bloqueando duplicata");
          return false;
        }
        
        console.log("🛡️ [RouteBlocker] Iniciando nova rota - bloqueando outras");
        rotaEmAndamento = true;
        
        // Limpar tudo antes
        limparCompletamente();
        
        // Executar função original após limpeza
        setTimeout(() => {
          if (originalClick) {
            originalClick.call(this, e);
          }
          
          // Liberar após 3 segundos
          setTimeout(() => {
            rotaEmAndamento = false;
            console.log("🛡️ [RouteBlocker] Rota finalizada - liberando para nova");
          }, 3000);
        }, 200);
        
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
  
  // Função global para limpeza manual
  window.limparRotasDuplicadas = limparCompletamente;
  
})();