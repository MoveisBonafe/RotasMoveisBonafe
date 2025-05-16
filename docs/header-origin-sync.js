/**
 * Script para sincronizar a origem no cabeçalho com a origem original
 * Este script garante que todas as funções que usam o campo "origin" continuem funcionando
 */

(function() {
  // Executar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', initHeaderOriginSync);
  window.addEventListener('load', initHeaderOriginSync);

  function initHeaderOriginSync() {
    console.log('Inicializando sincronização de origem no cabeçalho...');
    
    // Verificar periodicamente os campos
    setTimeout(syncHeaderOrigin, 1000);
    setTimeout(syncHeaderOrigin, 3000);
    setInterval(syncHeaderOrigin, 10000);
    
    // Adicionar listener para eventos de mudança no campo de origem visível
    addHeaderOriginListeners();
  }
  
  function syncHeaderOrigin() {
    try {
      // Campo de origem no cabeçalho
      const headerOriginInput = document.getElementById('header-origin');
      // Campo de origem original (escondido)
      const originalOriginInput = document.getElementById('origin');
      
      if (!headerOriginInput || !originalOriginInput) {
        return; // Um dos campos não existe
      }
      
      // Sincronizar valor do campo escondido para o cabeçalho
      if (originalOriginInput.value && !headerOriginInput.value) {
        headerOriginInput.value = originalOriginInput.value;
      }
      
      // Sincronizar valor do cabeçalho para o campo escondido
      if (headerOriginInput.value && !originalOriginInput.value) {
        originalOriginInput.value = headerOriginInput.value;
      }
    } catch (error) {
      console.error('Erro ao sincronizar campos de origem:', error);
    }
  }
  
  function addHeaderOriginListeners() {
    // Campo de origem no cabeçalho
    const headerOriginInput = document.getElementById('header-origin');
    if (!headerOriginInput) return;
    
    // Adicionar evento de input para sincronizar em tempo real
    headerOriginInput.addEventListener('input', function() {
      const originalOriginInput = document.getElementById('origin');
      if (originalOriginInput) {
        originalOriginInput.value = this.value;
      }
    });
    
    // Também adicionar evento quando o campo perder o foco
    headerOriginInput.addEventListener('blur', function() {
      const originalOriginInput = document.getElementById('origin');
      if (originalOriginInput) {
        originalOriginInput.value = this.value;
      }
    });
  }
})();