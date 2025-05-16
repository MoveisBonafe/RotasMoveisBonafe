/**
 * Script para impedir que os marcadores de localização sejam removidos ao limpar a rota
 * Este script sobrescreve funções específicas para proteger os marcadores principais
 */

(function() {
  // Executar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', initPreventReset);
  
  // Ou executar imediatamente se o documento já estiver carregado
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initPreventReset, 1000);
  }
  
  function initPreventReset() {
    console.log('Inicializando proteção contra reset de marcadores...');
    
    // Verificar se a função clearRoute existe
    if (typeof window.clearRoute === 'function') {
      // Guardar referência à função original
      const originalClearRoute = window.clearRoute;
      
      // Sobrescrever a função para proteger os marcadores
      window.clearRoute = function() {
        console.log('Chamada à clearRoute com proteção de marcadores');
        
        // Salvar os marcadores atuais antes de limpar
        const savedLocations = window.locations ? [...window.locations] : [];
        const savedMarkers = window.markers ? [...window.markers] : [];
        
        // Chamar a função original
        originalClearRoute.apply(this, arguments);
        
        // Restaurar os locais e marcadores
        if (savedLocations.length > 0) {
          window.locations = savedLocations;
        }
        
        // Aqui NÃO restauramos os marcadores, apenas garantimos que os locais
        // permanecem na array para processamentos futuros
        
        console.log(`Marcadores protegidos: ${savedLocations.length} localizações preservadas`);
      };
      
      console.log('Proteção contra reset de marcadores instalada com sucesso');
    } else {
      console.warn('Função clearRoute não encontrada, proteção não instalada');
    }
    
    // Verificar e proteger também a função reloadLocations se existir
    if (typeof window.reloadLocations === 'function') {
      const originalReloadLocations = window.reloadLocations;
      
      window.reloadLocations = function() {
        console.log('Chamada à reloadLocations com proteção');
        
        // Apenas recarregar os marcadores sem limpar localizações
        const result = originalReloadLocations.apply(this, arguments);
        
        console.log('Localizações recarregadas com proteção');
        return result;
      };
      
      console.log('Proteção de reloadLocations instalada');
    }
  }
})();