/**
 * Sistema para limpar rotas duplicadas no mapa
 * Garante que apenas uma rota seja exibida por vez
 */
(function() {
  console.log("🗺️ [ClearRoutes] Inicializando limpador de rotas duplicadas");
  
  // Executar quando a página carregar
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1000);
  
  function inicializar() {
    console.log("🗺️ [ClearRoutes] Configurando limpeza automática de rotas...");
    
    // Monitorar botões que geram rotas
    monitorarBotoesRota();
    
    // Limpar rotas duplicadas periodicamente
    setInterval(limparRotasDuplicadas, 2000);
  }
  
  function monitorarBotoesRota() {
    // Botões principais
    ['visualize-button', 'optimize-button'].forEach(buttonId => {
      const botao = document.getElementById(buttonId);
      if (botao) {
        botao.addEventListener('click', () => {
          console.log(`🗺️ [ClearRoutes] Botão ${buttonId} clicado - preparando limpeza`);
          
          // Limpar após um pequeno delay para permitir que a nova rota seja criada
          setTimeout(limparRotasDuplicadas, 1000);
          setTimeout(limparRotasDuplicadas, 2500);
        });
      }
    });
    
    // Monitorar botões de rotas alternativas
    const observarRotasAlternativas = () => {
      const botoes = document.querySelectorAll('button, .btn, input[type="button"]');
      botoes.forEach(botao => {
        if (botao.textContent && (
          botao.textContent.includes('Proximidade') || 
          botao.textContent.includes('Alternativa') ||
          botao.textContent.includes('Otimizada')
        )) {
          botao.addEventListener('click', () => {
            console.log("🗺️ [ClearRoutes] Rota alternativa selecionada - limpando duplicatas");
            
            // Limpar imediatamente e depois verificar novamente
            setTimeout(limparRotasDuplicadas, 500);
            setTimeout(limparRotasDuplicadas, 1500);
          });
        }
      });
    };
    
    setTimeout(observarRotasAlternativas, 1000);
    
    // Re-executar para capturar novos botões
    setInterval(observarRotasAlternativas, 3000);
  }
  
  function limparRotasDuplicadas() {
    try {
      // Acessar o mapa do Google Maps se disponível
      if (window.map && window.map.directionsRenderer) {
        console.log("🗺️ [ClearRoutes] Limpando rotas antigas do DirectionsRenderer");
        
        // Limpar o renderer de direções atual
        window.map.directionsRenderer.setDirections({routes: []});
      }
      
      // Método alternativo: limpar elementos visuais de rota no DOM
      limparElementosRotaDOM();
      
      // Limpar marcadores duplicados
      limparMarcadoresDuplicados();
      
    } catch (e) {
      console.log("🗺️ [ClearRoutes] Erro ao limpar rotas:", e);
    }
  }
  
  function limparElementosRotaDOM() {
    // Procurar por elementos SVG que representam rotas (linhas/polylines)
    const svg = document.querySelectorAll('svg');
    svg.forEach(svgElement => {
      const parent = svgElement.parentElement;
      if (parent && parent.style && parent.style.zIndex) {
        // Se há múltiplas rotas SVG, manter apenas a mais recente
        const outrosSvg = parent.querySelectorAll('svg');
        if (outrosSvg.length > 1) {
          // Remove todos exceto o último
          for (let i = 0; i < outrosSvg.length - 1; i++) {
            console.log("🗺️ [ClearRoutes] Removendo SVG de rota duplicado");
            outrosSvg[i].remove();
          }
        }
      }
    });
    
    // Limpar elementos canvas duplicados que podem representar rotas
    const canvas = document.querySelectorAll('canvas');
    canvas.forEach(canvasElement => {
      const parent = canvasElement.parentElement;
      if (parent && parent.getAttribute('aria-label') && 
          parent.getAttribute('aria-label').includes('Map')) {
        // Verificar se há canvas duplicados
        const outrosCanvas = parent.querySelectorAll('canvas');
        if (outrosCanvas.length > 3) { // Google Maps normalmente usa 2-3 canvas
          console.log("🗺️ [ClearRoutes] Detectados canvas extras, pode haver rotas duplicadas");
        }
      }
    });
  }
  
  function limparMarcadoresDuplicados() {
    // Procurar por marcadores (imgs ou divs) que podem estar duplicados
    const marcadores = document.querySelectorAll('img[src*="marker"], div[style*="marker"]');
    const posicoes = new Map();
    
    marcadores.forEach(marcador => {
      const style = window.getComputedStyle(marcador);
      const left = style.left;
      const top = style.top;
      const chave = `${left}-${top}`;
      
      if (posicoes.has(chave)) {
        console.log("🗺️ [ClearRoutes] Removendo marcador duplicado na posição:", chave);
        marcador.remove();
      } else {
        posicoes.set(chave, marcador);
      }
    });
  }
  
  // Função para forçar limpeza completa (pode ser chamada externamente)
  window.forcarLimpezaRotas = function() {
    console.log("🗺️ [ClearRoutes] Forçando limpeza completa de rotas");
    
    // Tentar múltiplas abordagens
    if (window.google && window.google.maps && window.map) {
      // Abordagem 1: Criar um novo DirectionsRenderer
      if (window.map.directionsRenderer) {
        window.map.directionsRenderer.setMap(null);
        window.map.directionsRenderer = new google.maps.DirectionsRenderer({
          map: window.map,
          draggable: true
        });
      }
      
      // Abordagem 2: Limpar todos os overlays
      if (window.map.overlayMapTypes) {
        window.map.overlayMapTypes.clear();
      }
    }
    
    // Limpar DOM
    limparElementosRotaDOM();
    limparMarcadoresDuplicados();
    
    console.log("🗺️ [ClearRoutes] Limpeza completa finalizada");
  };
  
})();