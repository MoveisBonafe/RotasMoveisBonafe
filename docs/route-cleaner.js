/**
 * Sistema simples para limpar rotas duplicadas no mapa
 * Evita que múltiplas rotas apareçam simultaneamente
 */
(function() {
  console.log("🧹 [RouteCleaner] Inicializando limpador de rotas");
  
  window.addEventListener('load', function() {
    setTimeout(configurarLimpeza, 1000);
  });
  
  function configurarLimpeza() {
    // Monitorar botões que geram rotas
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    if (botaoVisualizar) {
      botaoVisualizar.addEventListener('click', function() {
        console.log("🧹 [RouteCleaner] Visualizar clicado - limpando em 800ms");
        setTimeout(limparRotasDuplicadas, 800);
      });
    }
    
    if (botaoOtimizar) {
      botaoOtimizar.addEventListener('click', function() {
        console.log("🧹 [RouteCleaner] Otimizar clicado - limpando em 800ms");
        setTimeout(limparRotasDuplicadas, 800);
      });
    }
    
    // Verificar periodicamente se há rotas duplicadas
    setInterval(limparRotasDuplicadas, 3000);
  }
  
  function limparRotasDuplicadas() {
    try {
      // Detectar elementos de rota no mapa (polylines/paths)
      const polylines = document.querySelectorAll('[stroke], [fill="none"]');
      const rotasDetectadas = [];
      
      polylines.forEach(polyline => {
        const parent = polyline.closest('svg') || polyline.parentElement;
        if (parent && parent.style && parent.style.position === 'absolute') {
          rotasDetectadas.push(parent);
        }
      });
      
      // Se temos mais de uma rota visível, remover as antigas
      if (rotasDetectadas.length > 1) {
        console.log(`🧹 [RouteCleaner] Detectadas ${rotasDetectadas.length} rotas, removendo antigas`);
        
        // Manter apenas a última rota (mais recente)
        for (let i = 0; i < rotasDetectadas.length - 1; i++) {
          const rota = rotasDetectadas[i];
          rota.style.opacity = '0';
          setTimeout(() => {
            if (rota.parentElement) {
              rota.remove();
            }
          }, 500);
        }
      }
      
    } catch (e) {
      console.log("🧹 [RouteCleaner] Erro ao limpar rotas:", e);
    }
  }
  
})();