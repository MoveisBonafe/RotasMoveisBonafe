/**
 * Sistema para ocultar tempo e distância dos botões de rotas alternativas
 * Mantém apenas a ordenação dos pontos até que o usuário clique em "Visualizar"
 */
(function() {
  console.log("🙈 [HideRouteInfo] Inicializando ocultação de informações de rota");
  
  window.addEventListener('load', function() {
    setTimeout(inicializar, 1000);
  });
  
  function inicializar() {
    // Ocultar informações iniciais
    ocultarInformacoesRotas();
    
    // Configurar observadores
    configurarObservadores();
    
    // Executar periodicamente para garantir que ficam ocultas
    setInterval(ocultarInformacoesRotas, 2000);
    
    console.log("🙈 [HideRouteInfo] Sistema de ocultação configurado");
  }
  
  function ocultarInformacoesRotas() {
    try {
      // Buscar seções de rotas alternativas
      const secoes = [
        document.querySelector('[class*="route"]'),
        document.querySelector('[class*="alternativ"]'),
        document.querySelector('[class*="proximidade"]'),
        document.querySelector('[class*="otimizada"]'),
        document.querySelector('[class*="distante"]')
      ].filter(Boolean);
      
      // Se não encontrou seções específicas, buscar em toda a sidebar
      if (secoes.length === 0) {
        const sidebar = document.querySelector('.sidebar, #sidebar');
        if (sidebar) {
          secoes.push(sidebar);
        }
      }
      
      secoes.forEach(secao => {
        // Procurar por texto que contém informações de rota
        const walker = document.createTreeWalker(
          secao,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const nodosTexto = [];
        let node;
        while (node = walker.nextNode()) {
          nodosTexto.push(node);
        }
        
        nodosTexto.forEach(textoNode => {
          const texto = textoNode.textContent;
          const elemento = textoNode.parentElement;
          
          // Verificar se é informação de tempo/distância em botões de rota
          if (elemento && (texto.includes('km') || texto.includes('min') || texto.includes('h '))) {
            const botaoPai = elemento.closest('button, .btn, .route-option, div[role="button"]');
            
            if (botaoPai) {
              const textoBotao = botaoPai.textContent;
              
              // Se é um botão de rota alternativa
              if (textoBotao.includes('Proximidade') || 
                  textoBotao.includes('Alternativa') || 
                  textoBotao.includes('Otimizada') ||
                  textoBotao.includes('Distante') ||
                  textoBotao.includes('Rota ')) {
                
                // Verificar se o texto é especificamente tempo ou distância
                if (texto.match(/\d+[\.,]?\d*\s*km/) || 
                    texto.match(/\d+\s*min/) || 
                    texto.match(/\d+h\s*\d+min/)) {
                  
                  // Ocultar o elemento
                  elemento.style.visibility = 'hidden';
                  elemento.style.height = '0px';
                  elemento.style.overflow = 'hidden';
                  
                  console.log("🙈 [HideRouteInfo] Ocultado:", texto.trim());
                }
              }
            }
          }
        });
      });
      
    } catch (e) {
      console.log("🙈 [HideRouteInfo] Erro ao ocultar informações:", e);
    }
  }
  
  function configurarObservadores() {
    // Observar mudanças no DOM para ocultar novas informações
    const observer = new MutationObserver((mutations) => {
      let deveOcultar = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const texto = node.textContent || '';
              if (texto.includes('km') || texto.includes('min')) {
                deveOcultar = true;
              }
            }
          });
        }
      });
      
      if (deveOcultar) {
        setTimeout(ocultarInformacoesRotas, 100);
      }
    });
    
    // Observar mudanças na sidebar
    const sidebar = document.querySelector('.sidebar, #sidebar, body');
    if (sidebar) {
      observer.observe(sidebar, {
        childList: true,
        subtree: true
      });
    }
    
    // Monitorar cliques em rotas alternativas para re-ocultar
    document.addEventListener('click', (event) => {
      const elemento = event.target;
      const texto = elemento.textContent || '';
      
      if (texto.includes('Proximidade') || texto.includes('Alternativa') || 
          texto.includes('Otimizada') || texto.includes('Distante')) {
        console.log("🙈 [HideRouteInfo] Rota alternativa clicada - re-ocultando informações");
        setTimeout(ocultarInformacoesRotas, 500);
        setTimeout(ocultarInformacoesRotas, 1500);
      }
    });
  }
  
  // Função global para mostrar informações novamente (caso necessário)
  window.mostrarInformacoesRotas = function() {
    const elementosOcultos = document.querySelectorAll('[style*="visibility: hidden"]');
    elementosOcultos.forEach(el => {
      if (el.textContent.includes('km') || el.textContent.includes('min')) {
        el.style.visibility = 'visible';
        el.style.height = 'auto';
        el.style.overflow = 'visible';
      }
    });
    console.log("🙈 [HideRouteInfo] Informações de rota restauradas");
  };
  
})();