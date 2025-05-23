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
      console.log("🙈 [HideRouteInfo] Iniciando remoção de informações de tempo/distância");
      
      // Método mais direto: buscar todos os elementos que contêm km, min, h
      const todosElementos = document.querySelectorAll('*');
      
      todosElementos.forEach(elemento => {
        const texto = elemento.textContent || '';
        
        // Verificar se contém informações de tempo/distância
        if (texto.match(/\d+[\.,]?\d*\s*km/) || 
            texto.match(/\d+\s*min/) || 
            texto.match(/\d+h\s*\d+min/)) {
          
          // Verificar se está dentro de uma seção de rotas alternativas
          const container = elemento.closest('div, section, article');
          if (container) {
            const containerTexto = container.textContent || '';
            
            // Se o container menciona rotas alternativas
            if (containerTexto.includes('Rota Otimizada') || 
                containerTexto.includes('Proximidade') || 
                containerTexto.includes('Distante') ||
                containerTexto.includes('Rotas Alternativas')) {
              
              // Remover completamente o elemento
              elemento.remove();
              console.log("🙈 [HideRouteInfo] Removido elemento:", texto.trim());
            }
          }
        }
      });
      
      // Método alternativo: modificar o HTML diretamente
      const sidebar = document.querySelector('.sidebar, #sidebar');
      if (sidebar) {
        let htmlSidebar = sidebar.innerHTML;
        
        // Remover todas as ocorrências de tempo e distância dos botões
        htmlSidebar = htmlSidebar.replace(/📏\s*\d+[\.,]?\d*\s*km/g, '');
        htmlSidebar = htmlSidebar.replace(/⏱️\s*\d+\s*min/g, '');
        htmlSidebar = htmlSidebar.replace(/⏱️\s*\d+h\s*\d+min/g, '');
        htmlSidebar = htmlSidebar.replace(/<[^>]*>\s*\d+[\.,]?\d*\s*km\s*<\/[^>]*>/g, '');
        htmlSidebar = htmlSidebar.replace(/<[^>]*>\s*\d+\s*min\s*<\/[^>]*>/g, '');
        htmlSidebar = htmlSidebar.replace(/<[^>]*>\s*\d+h\s*\d+min\s*<\/[^>]*>/g, '');
        
        if (htmlSidebar !== sidebar.innerHTML) {
          sidebar.innerHTML = htmlSidebar;
          console.log("🙈 [HideRouteInfo] HTML da sidebar limpo");
        }
      }
      
    } catch (e) {
      console.log("🙈 [HideRouteInfo] Erro ao remover informações:", e);
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