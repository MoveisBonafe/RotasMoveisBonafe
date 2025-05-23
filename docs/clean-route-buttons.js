/**
 * Sistema para limpar informações de tempo e distância dos botões de rotas alternativas
 * Remove completamente essas informações, mantendo apenas a ordenação
 */
(function() {
  console.log("🧼 [CleanRouteButtons] Inicializando limpeza de botões de rota");
  
  window.addEventListener('load', function() {
    setTimeout(inicializar, 500);
  });
  
  function inicializar() {
    // Executar limpeza imediata
    limparBotoesRota();
    
    // Configurar observador para limpar novos botões
    configurarObservador();
    
    // Executar periodicamente, mas com menos frequência para não interferir
    setInterval(limparBotoesRota, 3000);
    
    console.log("🧼 [CleanRouteButtons] Sistema de limpeza ativo");
  }
  
  function limparBotoesRota() {
    try {
      // Buscar especificamente na seção de rotas alternativas, evitando a área de busca
      const secaoRotas = document.querySelector('[class*="route"], [class*="alternativ"]');
      
      if (secaoRotas) {
        // Buscar apenas elementos que contêm texto de rota alternativa
        const elementos = secaoRotas.querySelectorAll('*');
        
        elementos.forEach(elemento => {
          const texto = elemento.textContent || '';
          
          // IMPORTANTE: Não tocar em elementos de busca/input
          if (elemento.tagName === 'INPUT' || elemento.tagName === 'TEXTAREA' || 
              elemento.getAttribute('role') === 'textbox' ||
              elemento.classList.contains('pac-container') ||
              elemento.classList.contains('gm-') ||
              texto.includes('Buscar') || texto.includes('Digite')) {
            return; // Pular elementos de busca
          }
          
          // Se é um botão/div de rota alternativa
          if (texto.includes('Rota Otimizada') || 
              texto.includes('Proximidade à origem') || 
              texto.includes('Distante à Origem') ||
              texto.includes('Distante à origem')) {
            
            // Limpar informações de tempo e distância deste elemento
            limparInformacoesTempo(elemento);
          }
        });
      }
      
    } catch (e) {
      console.log("🧼 [CleanRouteButtons] Erro na limpeza:", e);
    }
  }
  
  function limparInformacoesTempo(elemento) {
    // Remover elementos filhos que contêm informações de tempo/distância
    const filhos = elemento.querySelectorAll('*');
    
    filhos.forEach(filho => {
      const texto = filho.textContent || '';
      
      // Se contém informações de tempo ou distância
      if (texto.match(/\d+[\.,]?\d*\s*km/) || 
          texto.match(/\d+\s*min/) || 
          texto.match(/\d+h\s*\d+min/) ||
          texto.match(/📏/) ||
          texto.match(/⏱️/)) {
        
        // Remover o elemento
        filho.remove();
        console.log("🧼 [CleanRouteButtons] Removido:", texto.trim());
      }
    });
    
    // Também limpar o texto do próprio elemento
    let textoElemento = elemento.innerHTML;
    textoElemento = textoElemento.replace(/📏[^<]*\d+[\.,]?\d*\s*km[^<]*/g, '');
    textoElemento = textoElemento.replace(/⏱️[^<]*\d+\s*min[^<]*/g, '');
    textoElemento = textoElemento.replace(/⏱️[^<]*\d+h\s*\d+min[^<]*/g, '');
    textoElemento = textoElemento.replace(/\d+[\.,]?\d*\s*km/g, '');
    textoElemento = textoElemento.replace(/\d+\s*min/g, '');
    textoElemento = textoElemento.replace(/\d+h\s*\d+min/g, '');
    
    if (textoElemento !== elemento.innerHTML) {
      elemento.innerHTML = textoElemento;
    }
  }
  
  // Função removida para não interferir com o campo de busca
  
  function configurarObservador() {
    const observer = new MutationObserver((mutations) => {
      let precisaLimpar = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const texto = node.textContent || '';
              if (texto.includes('km') || texto.includes('min') || 
                  texto.includes('Rota') || texto.includes('Proximidade')) {
                precisaLimpar = true;
              }
            }
          });
        }
      });
      
      if (precisaLimpar) {
        setTimeout(limparBotoesRota, 100);
      }
    });
    
    const sidebar = document.querySelector('.sidebar, #sidebar, body');
    if (sidebar) {
      observer.observe(sidebar, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Função global para forçar limpeza
  window.forcarLimpezaBotoes = function() {
    console.log("🧼 [CleanRouteButtons] Forçando limpeza completa");
    limparBotoesRota();
  };
  
})();