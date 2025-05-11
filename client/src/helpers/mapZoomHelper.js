/**
 * Helper para ajustar o zoom do Google Maps sem necessidade da tecla Ctrl
 * Esta função deve ser chamada após o carregamento do mapa para aplicar as configurações
 */
export function enableSmartZoom() {
  console.log("Aplicando helper de zoom para o Google Maps...");
  try {
    // Buscar todos os elementos do mapa do Google
    const gmStyleElements = document.querySelectorAll('.gm-style');
    
    if (gmStyleElements.length === 0) {
      console.log("Nenhum elemento .gm-style encontrado para aplicar helper de zoom");
      return;
    }
    
    // Para cada mapa na página
    gmStyleElements.forEach((gmStyleNode) => {
      // Verificar se já aplicamos (para evitar duplicação)
      if (gmStyleNode.getAttribute('data-zoom-helper-applied') === 'true') {
        return;
      }
      
      // Verificar se o elemento é realmente o mapa do Google
      if (gmStyleNode && gmStyleNode.addEventListener) {
        // Abordagem 1: Interceptar eventos de roda e simular Ctrl
        gmStyleNode.addEventListener('wheel', (event) => {
          // Se não estiver segurando Ctrl, simular como se estivesse
          // para permitir zoom sem Ctrl
          if (!event.ctrlKey) {
            // Criar novo evento com a tecla Ctrl "pressionada"
            const newEvent = new WheelEvent('wheel', {
              bubbles: true,
              cancelable: true,
              composed: true,
              deltaMode: event.deltaMode,
              deltaX: event.deltaX,
              deltaY: event.deltaY,
              deltaZ: event.deltaZ,
              ctrlKey: true  // Simular Ctrl pressionado
            });
            
            // Disparar o novo evento
            event.target.dispatchEvent(newEvent);
            
            // Impedir o comportamento padrão do evento original
            event.preventDefault();
            event.stopPropagation();
          }
        }, { passive: false });
        
        // Marcar como aplicado
        gmStyleNode.setAttribute('data-zoom-helper-applied', 'true');
        console.log("Helper de zoom aprimorado aplicado com sucesso a um elemento .gm-style");
      }
    });
    
    // Abordagem 2: Adicionalmente, tentar com MutationObserver para mapas carregados dinamicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Verificar se novos nós foram adicionados
        if (mutation.addedNodes.length) {
          // Verificar se algum dos nós adicionados contém um mapa
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // ELEMENT_NODE
              const mapElements = node.querySelectorAll('.gm-style');
              if (mapElements.length > 0) {
                console.log("Novo mapa detectado, aplicando helper de zoom...");
                enableSmartZoom();
              }
            }
          });
        }
      });
    });
    
    // Iniciar observação do DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
  } catch (error) {
    console.error("Erro ao aplicar helper de zoom:", error);
  }
}

/**
 * Verifica a presença do mapa periodicamente e aplica o helper de zoom
 * quando o mapa for carregado
 */
export function setupZoomHelper(maxAttempts = 10) {
  let attempts = 0;
  
  const checkAndApply = () => {
    const gmStyleElements = document.querySelectorAll('.gm-style');
    
    if (gmStyleElements.length > 0) {
      enableSmartZoom();
      return true;
    }
    
    attempts++;
    if (attempts >= maxAttempts) {
      console.log(`Número máximo de tentativas (${maxAttempts}) atingido. Desistindo.`);
      return false;
    }
    
    return false;
  };
  
  // Verificar imediatamente
  if (checkAndApply()) return;
  
  // Verificar periodicamente (a cada 500ms)
  const intervalId = setInterval(() => {
    if (checkAndApply()) {
      clearInterval(intervalId);
    }
  }, 500);
  
  // Limpar o intervalo após 10 segundos (20 tentativas)
  setTimeout(() => {
    clearInterval(intervalId);
  }, 10000);
}