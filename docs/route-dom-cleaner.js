/**
 * Limpador visual direto de rotas duplicadas
 * Remove elementos visuais de rotas diretamente do DOM
 */
(function() {
  console.log("🧽 [RouteDOMCleaner] Inicializando limpador visual de rotas");
  
  let ultimaLimpeza = 0;
  let observerAtivo = false;
  
  window.addEventListener('load', function() {
    setTimeout(inicializar, 800);
  });
  
  function inicializar() {
    console.log("🧽 [RouteDOMCleaner] Configurando limpeza visual automática");
    
    // Interceptar botão Visualizar
    interceptarBotaoVisualizar();
    
    // Observar mudanças no mapa
    configurarObservadorMapa();
    
    // Limpeza periódica agressiva
    setInterval(limpezaAgressiva, 1500);
  }
  
  function interceptarBotaoVisualizar() {
    const botao = document.getElementById('visualize-button');
    if (botao) {
      const originalClick = botao.onclick;
      
      botao.onclick = function(e) {
        console.log("🧽 [RouteDOMCleaner] Visualizar clicado - limpeza imediata");
        
        // Limpeza imediata antes
        limpezaCompleta();
        
        // Executar função original
        if (originalClick) {
          setTimeout(() => {
            originalClick.call(this, e);
            
            // Limpezas escalonadas após execução
            setTimeout(limpezaCompleta, 1000);
            setTimeout(limpezaCompleta, 2000);
            setTimeout(limpezaCompleta, 3000);
          }, 100);
        }
        
        return false;
      };
    }
  }
  
  function configurarObservadorMapa() {
    if (observerAtivo) return;
    
    try {
      const mapaContainer = document.querySelector('[role="application"]') || 
                           document.querySelector('.map-container') ||
                           document.getElementById('map');
      
      if (mapaContainer) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
              // Verificar se foram adicionados elementos de rota
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                  const temRota = node.querySelector && (
                    node.querySelector('path[stroke]') ||
                    node.querySelector('svg path') ||
                    node.style?.stroke
                  );
                  
                  if (temRota) {
                    console.log("🧽 [RouteDOMCleaner] Detectada nova rota - verificando duplicatas");
                    setTimeout(limpezaCompleta, 200);
                  }
                }
              });
            }
          });
        });
        
        observer.observe(mapaContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'stroke', 'fill']
        });
        
        observerAtivo = true;
        console.log("🧽 [RouteDOMCleaner] Observer de mapa configurado");
      }
    } catch (e) {
      console.log("🧽 [RouteDOMCleaner] Erro ao configurar observer:", e);
    }
  }
  
  function limpezaCompleta() {
    const agora = Date.now();
    if (agora - ultimaLimpeza < 300) return; // Evitar limpezas muito frequentes
    ultimaLimpeza = agora;
    
    console.log("🧽 [RouteDOMCleaner] Executando limpeza visual completa");
    
    try {
      // 1. Remover paths SVG de rotas duplicadas
      const pathsRota = document.querySelectorAll('path[stroke*="#"], svg path[stroke]');
      const rotasEncontradas = [];
      
      pathsRota.forEach((path, index) => {
        const stroke = path.getAttribute('stroke') || path.style.stroke;
        const strokeWidth = path.getAttribute('stroke-width') || path.style.strokeWidth;
        
        if (stroke && stroke.includes('#')) {
          const chaveRota = `${stroke}-${strokeWidth}`;
          
          if (rotasEncontradas.includes(chaveRota)) {
            console.log(`🧽 [RouteDOMCleaner] Removendo rota duplicada ${index}: ${stroke}`);
            path.remove();
          } else {
            rotasEncontradas.push(chaveRota);
          }
        }
      });
      
      // 2. Limpar divs de sobreposição de rota
      const overlays = document.querySelectorAll('div[style*="position: absolute"]');
      let overlaysRota = 0;
      
      overlays.forEach((overlay) => {
        const style = overlay.style.cssText;
        if (style.includes('z-index') && 
            (style.includes('pointer-events') || overlay.querySelector('svg'))) {
          overlaysRota++;
          if (overlaysRota > 1) {
            console.log("🧽 [RouteDOMCleaner] Removendo overlay de rota duplicado");
            overlay.remove();
          }
        }
      });
      
      // 3. Verificar elementos com cores específicas de rota
      const elementosAzuis = document.querySelectorAll('[style*="#1976D2"], [style*="#2196F3"], [stroke="#1976D2"], [stroke="#2196F3"]');
      if (elementosAzuis.length > 2) {
        console.log(`🧽 [RouteDOMCleaner] Detectados ${elementosAzuis.length} elementos azuis - removendo extras`);
        
        for (let i = 2; i < elementosAzuis.length; i++) {
          elementosAzuis[i].remove();
        }
      }
      
      // 4. Limpar canvas duplicados suspeitos
      const canvas = document.querySelectorAll('canvas');
      if (canvas.length > 4) { // Google Maps normalmente usa 2-3 canvas
        console.log(`🧽 [RouteDOMCleaner] Muitos canvas detectados (${canvas.length}) - possíveis rotas duplicadas`);
      }
      
    } catch (e) {
      console.log("🧽 [RouteDOMCleaner] Erro na limpeza:", e);
    }
  }
  
  function limpezaAgressiva() {
    // Limpeza mais agressiva a cada 1.5s
    const pathsDuplicados = document.querySelectorAll('path[stroke="#1976D2"], path[stroke="#2196F3"]');
    
    if (pathsDuplicados.length > 1) {
      console.log(`🧽 [RouteDOMCleaner] LIMPEZA AGRESSIVA: ${pathsDuplicados.length} rotas detectadas`);
      
      // Manter apenas a primeira rota, remover as outras
      for (let i = 1; i < pathsDuplicados.length; i++) {
        pathsDuplicados[i].remove();
      }
    }
  }
  
  // Função global para limpeza manual
  window.limparRotasVisuais = limpezaCompleta;
  
})();