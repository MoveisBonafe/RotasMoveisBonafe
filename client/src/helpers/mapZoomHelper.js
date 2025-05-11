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
        // Aplicar o comportamento de zoom sem Ctrl
        gmStyleNode.addEventListener('wheel', (event) => {
          // Evitar o comportamento padrão que exige Ctrl
          if (!event.ctrlKey) {
            event.stopPropagation();
          }
        }, { passive: false });
        
        // Marcar como aplicado
        gmStyleNode.setAttribute('data-zoom-helper-applied', 'true');
        console.log("Helper de zoom aplicado com sucesso a um elemento .gm-style");
      }
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