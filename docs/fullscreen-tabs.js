/**
 * VERSÃO DESATIVADA - Substituída por abas-solucao.js
 * 
 * Este arquivo foi desativado para evitar conflitos 
 * com a implementação mais recente do sistema de abas
 */

// Namespace do componente (mantido para compatibilidade)
var FullscreenTabs = {
  // Função de inicialização substituída
  init: function() {
    console.log('[FullscreenTabs] Desativado - usando nova implementação de abas');
    return false;
  },
  
  // Outras funções substituídas por versões vazias
  expandTabs: function() {
    return false;
  },
  
  collapseTabs: function() {
    return false;
  },
  
  toggleExpansion: function() {
    return false;
  },
  
  showTab: function() {
    return false;
  }
};

// Não faz nada quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('[FullscreenTabs] Script desativado em favor da nova implementação');
  return false;
});