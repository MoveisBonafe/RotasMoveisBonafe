/**
 * Gerenciador único de rotas - Evita criação de múltiplos DirectionsRenderer
 * Centraliza toda criação de rotas em um único ponto de controle
 */
(function() {
  console.log("🎯 [RouteManager] Inicializando gerenciador único de rotas");
  
  let unicoDirectionsRenderer = null;
  let rotaAtiva = false;
  
  window.addEventListener('load', function() {
    setTimeout(inicializar, 500);
  });
  
  function inicializar() {
    console.log("🎯 [RouteManager] Configurando controle único de rotas");
    
    // Interceptar todas as criações de DirectionsRenderer
    interceptarDirectionsRenderer();
    
    // Monitorar botões que criam rotas
    monitorarBotoesRota();
  }
  
  function interceptarDirectionsRenderer() {
    // Salvar a função original
    const OriginalDirectionsRenderer = google.maps.DirectionsRenderer;
    
    // Substituir por nossa versão controlada
    google.maps.DirectionsRenderer = function(options) {
      console.log("🎯 [RouteManager] Interceptando criação de DirectionsRenderer");
      
      // Se já existe um renderer ativo, limpar antes
      if (unicoDirectionsRenderer) {
        console.log("🎯 [RouteManager] Limpando renderer anterior");
        try {
          unicoDirectionsRenderer.setMap(null);
          unicoDirectionsRenderer.setDirections({routes: []});
        } catch (e) {
          console.log("🎯 [RouteManager] Erro ao limpar renderer anterior:", e);
        }
      }
      
      // Criar novo renderer único
      unicoDirectionsRenderer = new OriginalDirectionsRenderer(options);
      console.log("🎯 [RouteManager] Novo renderer único criado");
      
      return unicoDirectionsRenderer;
    };
    
    // Manter propriedades originais
    google.maps.DirectionsRenderer.prototype = OriginalDirectionsRenderer.prototype;
  }
  
  function monitorarBotoesRota() {
    // Botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    if (botaoVisualizar) {
      const originalClick = botaoVisualizar.onclick;
      botaoVisualizar.onclick = function(e) {
        if (rotaAtiva) {
          console.log("🎯 [RouteManager] Rota já ativa - bloqueando");
          return false;
        }
        
        console.log("🎯 [RouteManager] Iniciando nova rota");
        rotaAtiva = true;
        limparRotaAnterior();
        
        // Executar função original após limpeza
        setTimeout(() => {
          if (originalClick) {
            originalClick.call(this, e);
          }
          
          // Liberar após 4 segundos
          setTimeout(() => {
            rotaAtiva = false;
            console.log("🎯 [RouteManager] Rota finalizada");
          }, 4000);
        }, 200);
        
        return false;
      };
    }
    
    // Botão Otimizar
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      const originalClick = botaoOtimizar.onclick;
      botaoOtimizar.onclick = function(e) {
        if (rotaAtiva) {
          console.log("🎯 [RouteManager] Rota já ativa - bloqueando otimização");
          return false;
        }
        
        console.log("🎯 [RouteManager] Iniciando otimização");
        rotaAtiva = true;
        limparRotaAnterior();
        
        setTimeout(() => {
          if (originalClick) {
            originalClick.call(this, e);
          }
          
          setTimeout(() => {
            rotaAtiva = false;
            console.log("🎯 [RouteManager] Otimização finalizada");
          }, 4000);
        }, 200);
        
        return false;
      };
    }
  }
  
  function limparRotaAnterior() {
    console.log("🎯 [RouteManager] Limpando rota anterior");
    
    try {
      // Limpar renderer único se existir
      if (unicoDirectionsRenderer) {
        unicoDirectionsRenderer.setMap(null);
        unicoDirectionsRenderer.setDirections({routes: []});
      }
      
      // Limpar variáveis globais relacionadas a rotas
      if (window.directionsRenderer) {
        window.directionsRenderer.setMap(null);
        window.directionsRenderer = null;
      }
      
      if (window.currentRouteRenderer) {
        window.currentRouteRenderer.setMap(null);
        window.currentRouteRenderer = null;
      }
      
      // Limpar polylines manuais
      if (window.allRoutePolylines) {
        window.allRoutePolylines.forEach(polyline => {
          if (polyline.setMap) polyline.setMap(null);
        });
        window.allRoutePolylines = [];
      }
      
      // Limpar elementos visuais de rotas no DOM
      const rotasSvg = document.querySelectorAll('svg path[stroke]');
      rotasSvg.forEach(path => {
        if (path.getAttribute('stroke')?.includes('#')) {
          path.remove();
        }
      });
      
      console.log("🎯 [RouteManager] Limpeza concluída");
      
    } catch (e) {
      console.log("🎯 [RouteManager] Erro na limpeza:", e);
    }
  }
  
  // Função global para limpeza manual
  window.limparRotaUnica = limparRotaAnterior;
  
})();