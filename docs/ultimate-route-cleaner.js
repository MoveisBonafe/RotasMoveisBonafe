/**
 * Ultimate Route Cleaner - Solução definitiva para rotas duplicadas
 * Remove agressivamente todas as duplicatas visuais no mapa
 */
(function() {
  console.log("⚡ [UltimateCleaner] Inicializando limpador definitivo");
  
  let limpezaAtiva = false;
  let ultimaRota = null;
  
  window.addEventListener('load', function() {
    setTimeout(inicializar, 500);
  });
  
  function inicializar() {
    console.log("⚡ [UltimateCleaner] Configurando limpeza agressiva");
    
    // Interceptar antes de qualquer rota ser criada
    interceptarCriacaoRotas();
    
    // Limpeza contínua agressiva
    setInterval(limpezaAgressivaCompleta, 800);
    
    // Observer para mudanças no DOM
    configurarObservadorAgressivo();
  }
  
  function interceptarCriacaoRotas() {
    // Interceptar ANTES que outros scripts ajam
    const botaoVisualizar = document.getElementById('visualize-button');
    if (botaoVisualizar) {
      // Remover todos os event listeners existentes
      const novoBotao = botaoVisualizar.cloneNode(true);
      botaoVisualizar.parentNode.replaceChild(novoBotao, botaoVisualizar);
      
      // Adicionar nosso handler primeiro
      novoBotao.addEventListener('click', function(e) {
        console.log("⚡ [UltimateCleaner] PRÉ-LIMPEZA antes da visualização");
        
        // Limpeza total antes
        limpezaTotal();
        
        // Marcar que uma nova rota será criada
        limpezaAtiva = true;
        
        // Aguardar e permitir que a função original execute
        setTimeout(() => {
          // Executar função original de visualização
          if (window.visualizeRoute) {
            window.visualizeRoute();
          }
          
          // Limpeza pós-criação
          setTimeout(limpezaPosRota, 1000);
          setTimeout(limpezaPosRota, 2000);
          setTimeout(() => { limpezaAtiva = false; }, 3000);
        }, 100);
      }, false);
    }
  }
  
  function limpezaTotal() {
    console.log("⚡ [UltimateCleaner] LIMPEZA TOTAL INICIADA");
    
    try {
      // 1. Limpar TODOS os DirectionsRenderer
      if (window.directionsRenderer) {
        window.directionsRenderer.setMap(null);
        window.directionsRenderer.setDirections({routes: []});
        window.directionsRenderer = null;
      }
      
      if (window.currentRouteRenderer) {
        window.currentRouteRenderer.setMap(null);
        window.currentRouteRenderer = null;
      }
      
      // 2. Remover TODOS os paths/polylines visualmente
      const todosOsPaths = document.querySelectorAll('path, polyline');
      todosOsPaths.forEach(path => {
        const stroke = path.getAttribute('stroke') || path.style.stroke;
        if (stroke && (stroke.includes('#1976D2') || stroke.includes('#2196F3') || stroke.includes('blue'))) {
          console.log("⚡ [UltimateCleaner] Removendo path de rota:", stroke);
          path.remove();
        }
      });
      
      // 3. Limpar SVGs com rotas
      const svgs = document.querySelectorAll('svg');
      svgs.forEach(svg => {
        const paths = svg.querySelectorAll('path[stroke]');
        if (paths.length > 0) {
          paths.forEach(path => {
            const stroke = path.getAttribute('stroke');
            if (stroke && stroke.includes('#')) {
              console.log("⚡ [UltimateCleaner] Removendo SVG de rota");
              path.remove();
            }
          });
        }
      });
      
      // 4. Limpar overlays de rota
      const overlays = document.querySelectorAll('div[style*="position: absolute"]');
      overlays.forEach(overlay => {
        if (overlay.querySelector('svg') || overlay.style.zIndex > 100) {
          const children = overlay.querySelectorAll('path[stroke], polyline[stroke]');
          if (children.length > 0) {
            console.log("⚡ [UltimateCleaner] Removendo overlay de rota");
            overlay.remove();
          }
        }
      });
      
      // 5. Reset de variáveis globais
      if (window.allRoutePolylines) {
        window.allRoutePolylines.forEach(polyline => {
          if (polyline && polyline.setMap) {
            polyline.setMap(null);
          }
        });
        window.allRoutePolylines = [];
      }
      
      console.log("⚡ [UltimateCleaner] LIMPEZA TOTAL CONCLUÍDA");
      
    } catch (e) {
      console.log("⚡ [UltimateCleaner] Erro na limpeza total:", e);
    }
  }
  
  function limpezaPosRota() {
    if (!limpezaAtiva) return;
    
    console.log("⚡ [UltimateCleaner] Limpeza pós-rota");
    
    // Detectar rotas duplicadas
    const pathsDeRota = document.querySelectorAll('path[stroke*="#"]');
    const rotasDetectadas = new Map();
    
    pathsDeRota.forEach((path, index) => {
      const stroke = path.getAttribute('stroke');
      const strokeWidth = path.getAttribute('stroke-width') || path.style.strokeWidth;
      const chave = `${stroke}-${strokeWidth}`;
      
      if (rotasDetectadas.has(chave)) {
        console.log(`⚡ [UltimateCleaner] ROTA DUPLICADA DETECTADA - removendo ${index}`);
        path.remove();
      } else {
        rotasDetectadas.set(chave, path);
      }
    });
    
    // Se ainda há múltiplas rotas, manter apenas a mais recente
    const rotasRestantes = document.querySelectorAll('path[stroke*="#1976D2"], path[stroke*="#2196F3"]');
    if (rotasRestantes.length > 1) {
      console.log(`⚡ [UltimateCleaner] ${rotasRestantes.length} rotas ainda presentes - removendo extras`);
      
      // Manter apenas a última
      for (let i = 0; i < rotasRestantes.length - 1; i++) {
        rotasRestantes[i].remove();
      }
    }
  }
  
  function limpezaAgressivaCompleta() {
    if (limpezaAtiva) return; // Não interferir durante criação de rota
    
    // Verificação rápida de duplicatas
    const rotasDuplicadas = document.querySelectorAll('path[stroke="#1976D2"], path[stroke="#2196F3"]');
    
    if (rotasDuplicadas.length > 1) {
      console.log(`⚡ [UltimateCleaner] LIMPEZA AGRESSIVA: ${rotasDuplicadas.length} rotas duplicadas`);
      
      // Remover todas exceto a primeira
      for (let i = 1; i < rotasDuplicadas.length; i++) {
        rotasDuplicadas[i].remove();
      }
    }
    
    // Verificar overlays suspeitos
    const overlaysSuspeitos = document.querySelectorAll('div[style*="z-index"][style*="position: absolute"]');
    let overlaysComRota = 0;
    
    overlaysSuspeitos.forEach(overlay => {
      if (overlay.querySelector('svg path[stroke]')) {
        overlaysComRota++;
        if (overlaysComRota > 1) {
          overlay.remove();
        }
      }
    });
  }
  
  function configurarObservadorAgressivo() {
    const mapContainer = document.querySelector('[role="application"]') || document.getElementById('map');
    
    if (mapContainer) {
      const observer = new MutationObserver((mutations) => {
        if (limpezaAtiva) return;
        
        let rotasAdicionadas = 0;
        
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const temRota = node.querySelector && node.querySelector('path[stroke*="#"]');
              if (temRota) {
                rotasAdicionadas++;
              }
            }
          });
        });
        
        if (rotasAdicionadas > 0) {
          console.log(`⚡ [UltimateCleaner] Observer detectou ${rotasAdicionadas} novas rotas`);
          setTimeout(limpezaAgressivaCompleta, 200);
        }
      });
      
      observer.observe(mapContainer, {
        childList: true,
        subtree: true
      });
      
      console.log("⚡ [UltimateCleaner] Observer agressivo configurado");
    }
  }
  
  // Função global para limpeza manual
  window.limpezaUltimateRota = limpezaTotal;
  
})();