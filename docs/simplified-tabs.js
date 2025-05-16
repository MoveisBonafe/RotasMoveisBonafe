/**
 * SOLUÇÃO SIMPLIFICADA PARA AS ABAS - VERSÃO GITHUB PAGES
 * Este script substitui a funcionalidade das abas por uma abordagem mais simples
 * para garantir comportamento consistente
 */
document.addEventListener('DOMContentLoaded', function() {
  // Configuração inicial
  initSimplifiedTabs();
  
  // Registrar para possível reinicialização posterior (quando o DOM muda)
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      // Se houve alguma mudança significativa no DOM, reinicializa as abas
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
          // Verifica se algum elemento relevante para as abas foi afetado
          if (document.querySelector('.bottom-tabs-container')) {
            initSimplifiedTabs();
          }
        }
      });
    });
    
    // Observar mudanças em todo o corpo do documento
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

/**
 * Inicializa a funcionalidade de abas simplificada
 */
function initSimplifiedTabs() {
  const tabButtons = document.querySelectorAll('.bottom-tab-btn');
  const tabContents = document.querySelectorAll('.bottom-tab-content');
  const tabContainer = document.querySelector('.bottom-tabs-container');
  
  if (!tabButtons.length || !tabContents.length || !tabContainer) {
    console.warn('Elementos de abas não encontrados no DOM');
    return;
  }
  
  // Esconder todos os conteúdos inicialmente
  tabContents.forEach(content => {
    content.style.display = 'none';
  });
  
  // Remover classes ativas de todos os botões
  tabButtons.forEach(button => {
    button.classList.remove('active');
    
    // Adicionar evento de clique para cada botão
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const tabId = this.getAttribute('data-tab');
      const targetContent = document.getElementById(tabId + '-content');
      const isCurrentlyActive = this.classList.contains('active');
      const isExpanded = !tabContainer.classList.contains('minimized');
      
      // Lógica para expandir/minimizar
      if (isCurrentlyActive && isExpanded) {
        // Se clicar no mesmo botão que já está ativo e expandido, minimiza
        toggleTabsExpansion(false); // Minimizar
      } else if (!isExpanded) {
        // Se o painel estiver minimizado, expande e mostra esta aba
        toggleTabsExpansion(true); // Expandir
        activateTab(this, targetContent);
      } else {
        // Se clicar em uma aba diferente e já estiver expandido, apenas muda a aba
        activateTab(this, targetContent);
      }
    });
  });
  
  /**
   * Ativa uma aba específica e desativa as outras
   */
  function activateTab(buttonElement, contentElement) {
    // Remover classe ativa de todos os botões e esconder conteúdos
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    
    // Ativar este botão e mostrar seu conteúdo
    buttonElement.classList.add('active');
    
    if (contentElement) {
      contentElement.style.display = 'block';
      contentElement.classList.add('active');
    }
  }
  
  /**
   * Alterna entre os estados expandido e minimizado
   */
  function toggleTabsExpansion(expand) {
    if (expand === true) {
      // Expandir
      tabContainer.classList.remove('minimized');
      
      // Verificar se há alguma aba ativa
      const activeButton = document.querySelector('.bottom-tab-btn.active');
      if (activeButton) {
        const tabId = activeButton.getAttribute('data-tab');
        const content = document.getElementById(tabId + '-content');
        if (content) {
          content.style.display = 'block';
          content.classList.add('active');
        }
      } else if (tabButtons.length > 0) {
        // Se nenhuma aba estiver ativa, ativa a primeira por padrão
        const firstButton = tabButtons[0];
        const firstTabId = firstButton.getAttribute('data-tab');
        const firstContent = document.getElementById(firstTabId + '-content');
        
        firstButton.classList.add('active');
        if (firstContent) {
          firstContent.style.display = 'block';
          firstContent.classList.add('active');
        }
      }
    } else {
      // Minimizar
      tabContainer.classList.add('minimized');
      
      // Opcionalmente, podemos manter o conteúdo visível mas com altura reduzida
      const activeContent = document.querySelector('.bottom-tab-content.active');
      if (activeContent) {
        activeContent.style.height = '0';
      }
    }
    
    // Ajustar a altura do mapa para corresponder à nova configuração das abas
    adjustMapHeight();
  }
  
  /**
   * Ajusta a altura do container do mapa com base no estado das abas
   */
  function adjustMapHeight() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    if (tabContainer.classList.contains('minimized')) {
      // Quando minimizado, o mapa vai até quase o final da tela
      mapContainer.style.bottom = '60px';
    } else {
      // Quando expandido, o mapa fica oculto atrás das abas
      mapContainer.style.bottom = '0';
    }
  }
}