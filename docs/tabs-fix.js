/**
 * SOLUÇÃO DEFINITIVA PARA O PROBLEMA DAS ABAS NO GITHUB PAGES
 * Este script substitui completamente o gerenciamento de abas
 * Ele é executado assim que o DOM estiver pronto
 */

(function() {
  // Executar imediatamente quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', initTabFix);
  
  function initTabFix() {
    console.log('Inicializando correção definitiva para abas - tabs-fix.js');
    
    // Primeiro, esconder todos os conteúdos das abas
    const allTabContents = document.querySelectorAll('.bottom-tab-content');
    allTabContents.forEach(content => {
      // Garantir que estão realmente escondidos
      content.style.display = 'none';
      // Remover classes que possam interferir
      content.classList.remove('active', 'visible', 'show');
      // Adicionar identificador para este script
      content.setAttribute('data-tabs-fixed', 'true');
    });
    
    // Remover todos os event listeners existentes dos botões das abas
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(button => {
      // Técnica de clonagem para remover todos os event listeners
      const clone = button.cloneNode(true);
      button.parentNode.replaceChild(clone, button);
    });
    
    // Agora adicionar novos event listeners em cada botão
    document.querySelectorAll('.bottom-tab-btn').forEach(button => {
      button.addEventListener('click', handleTabClick);
    });
    
    console.log('Sistema de abas reinicializado com sucesso');
  }
  
  // Função de manipulação de clique nas abas - Totalmente isolada
  function handleTabClick(event) {
    // Evitar comportamentos padrão
    event.preventDefault();
    event.stopPropagation();
    
    // ID da aba clicada
    const tabId = this.getAttribute('data-tab');
    console.log('Clique na aba:', tabId);
    
    // Elemento de conteúdo correspondente
    const tabContent = document.getElementById(tabId + '-content');
    
    // Container das abas
    const tabsContainer = document.querySelector('.bottom-tabs-container');
    
    // Verifica se já está ativo
    const isAlreadyActive = this.classList.contains('active');
    const isExpanded = !tabsContainer.classList.contains('minimized');
    
    // Se já está ativa e expandida, apenas minimiza
    if (isAlreadyActive && isExpanded) {
      console.log('Minimizando aba já ativa:', tabId);
      this.classList.remove('active');
      tabsContainer.classList.add('minimized');
      return;
    }
    
    // Remover classe ativa de todos os botões
    document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // IMPORTANTE: Esconder TODOS os conteúdos de aba
    document.querySelectorAll('.bottom-tab-content').forEach(content => {
      content.style.display = 'none';
    });
    
    // Ativar este botão específico
    this.classList.add('active');
    
    // Se o container estiver minimizado, expandi-lo
    if (tabsContainer.classList.contains('minimized')) {
      tabsContainer.classList.remove('minimized');
    }
    
    // Mostrar APENAS o conteúdo desta aba específica
    if (tabContent) {
      console.log('Mostrando conteúdo da aba:', tabId);
      tabContent.style.display = 'block';
    }
  }
})();