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
    
    // Executar periodicamente
    setInterval(limparBotoesRota, 1000);
    
    console.log("🧼 [CleanRouteButtons] Sistema de limpeza ativo");
  }
  
  function limparBotoesRota() {
    try {
      // Buscar especificamente pelos botões de rotas alternativas
      const seletores = [
        '*[class*="route"]',
        '*[class*="alternativ"]', 
        'div:contains("Rota Otimizada")',
        'div:contains("Proximidade")',
        'div:contains("Distante")'
      ];
      
      // Usar uma abordagem mais direta - buscar na sidebar
      const sidebar = document.querySelector('.sidebar, #sidebar');
      if (sidebar) {
        // Buscar todos os elementos que contêm texto de rota
        const elementos = sidebar.querySelectorAll('*');
        
        elementos.forEach(elemento => {
          const texto = elemento.textContent || '';
          
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
      
      // Método mais agressivo: usar expressões regulares no HTML
      limparHTMLCompleto();
      
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
  
  function limparHTMLCompleto() {
    const sidebar = document.querySelector('.sidebar, #sidebar');
    if (sidebar) {
      let html = sidebar.innerHTML;
      let htmlOriginal = html;
      
      // Padrões mais específicos para remover informações de tempo/distância
      const padroes = [
        /📏\s*\d+[\.,]?\d*\s*km/g,
        /⏱️\s*\d+\s*min/g,
        /⏱️\s*\d+h\s*\d+min/g,
        /<[^>]*>\s*\d+[\.,]?\d*\s*km\s*<\/[^>]*>/g,
        /<[^>]*>\s*\d+\s*min\s*<\/[^>]*>/g,
        /<[^>]*>\s*\d+h\s*\d+min\s*<\/[^>]*>/g,
        /<span[^>]*>\s*\d+[\.,]?\d*\s*km\s*<\/span>/g,
        /<span[^>]*>\s*\d+\s*min\s*<\/span>/g,
        /<div[^>]*>\s*\d+[\.,]?\d*\s*km\s*<\/div>/g,
        /<div[^>]*>\s*\d+\s*min\s*<\/div>/g
      ];
      
      padroes.forEach(padrao => {
        html = html.replace(padrao, '');
      });
      
      // Limpar elementos vazios que sobraram
      html = html.replace(/<span[^>]*>\s*<\/span>/g, '');
      html = html.replace(/<div[^>]*>\s*<\/div>/g, '');
      
      if (html !== htmlOriginal) {
        sidebar.innerHTML = html;
        console.log("🧼 [CleanRouteButtons] HTML da sidebar limpo via regex");
      }
    }
  }
  
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