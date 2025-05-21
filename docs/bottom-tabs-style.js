/**
 * Melhorias visuais para abas inferiores
 * Este script aplica o estilo visual da sidebar para as abas inferiores,
 * tornando o design mais consistente
 */

(function() {
  console.log("[StyleFix] Iniciando melhorias visuais para abas inferiores...");
  
  // Aplicar imediatamente e quando a página estiver carregada
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTabsStyle);
  } else {
    applyTabsStyle();
  }
  
  // Adicionar também quando a página estiver totalmente carregada
  window.addEventListener('load', function() {
    setTimeout(applyTabsStyle, 500);
    setTimeout(applyTabsStyle, 2000);
  });
  
  // Função principal para aplicar os estilos
  function applyTabsStyle() {
    console.log("[StyleFix] Aplicando estilos para abas inferiores...");
    
    // Injetar estilos CSS
    injectTabsCSS();
    
    // Aplicar estilos diretos ao DOM
    styleBottomTabs();
    
    // Observar mudanças para manter os estilos
    setupStyleObserver();
  }
  
  // Injetar CSS para as abas inferiores
  function injectTabsCSS() {
    const styleElement = document.createElement('style');
    styleElement.id = 'bottom-tabs-enhanced-style';
    
    // Evitar duplicação
    if (document.getElementById(styleElement.id)) {
      return;
    }
    
    styleElement.textContent = `
      /* Estilos para o container principal das abas */
      .bottom-tabs-container {
        background-color: #f8f9fa !important;
        border-top: 1px solid #e9ecef !important;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.05) !important;
      }
      
      /* Estilos para os botões da aba inferior */
      .bottom-tab-btn {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        padding: 12px 20px !important;
        border: none !important;
        background-color: transparent !important;
        color: #495057 !important;
        transition: all 0.25s ease !important;
        outline: none !important;
        border-radius: 0 !important;
        position: relative !important;
      }
      
      /* Estilo para botão ativo */
      .bottom-tab-btn.active {
        background-color: #fff8e1 !important;
        color: #ffab00 !important;
        font-weight: 600 !important;
        box-shadow: inset 0 -3px 0 #ffc107 !important;
      }
      
      /* Hover para os botões */
      .bottom-tab-btn:hover:not(.active) {
        background-color: #f1f3f5 !important;
        color: #212529 !important;
      }
      
      /* Conteúdo das abas quando expandidas */
      .bottom-tabs-container:not(.minimized) {
        border-left: 1px solid #e9ecef !important;
      }
      
      /* Estilos para o conteúdo das abas */
      .bottom-tab-content {
        padding: 15px 20px !important;
        background-color: #ffffff !important;
        border-top: 1px solid #e9ecef !important;
      }
      
      /* Cabeçalhos dentro do conteúdo */
      .bottom-tab-content h5 {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #495057 !important;
        margin-bottom: 15px !important;
        padding-bottom: 10px !important;
        border-bottom: 1px solid #e9ecef !important;
      }
      
      /* Textos dentro do conteúdo */
      .bottom-tab-content p, 
      .bottom-tab-content .text-muted {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 14px !important;
        color: #6c757d !important;
        margin-bottom: 15px !important;
      }
      
      /* Itens de evento */
      .event-item {
        background-color: #fff !important;
        border: 1px solid #e9ecef !important;
        border-radius: 8px !important;
        padding: 12px 15px !important;
        margin-bottom: 12px !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
      }
      
      .event-item:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 3px 6px rgba(0,0,0,0.08) !important;
        border-color: #ffe082 !important;
      }
      
      /* Título dos eventos */
      .event-title {
        font-size: 15px !important;
        font-weight: 600 !important;
        color: #343a40 !important;
        margin-bottom: 5px !important;
      }
      
      /* Data dos eventos */
      .event-date {
        font-size: 13px !important;
        font-weight: 500 !important;
        color: #ffa000 !important;
        margin-bottom: 8px !important;
      }
      
      /* Descrição dos eventos */
      .event-description {
        font-size: 13px !important;
        color: #6c757d !important;
        margin-bottom: 0 !important;
      }
      
      /* Container da lista de eventos */
      .event-list {
        max-height: calc(100vh - 200px) !important;
        overflow-y: auto !important;
        padding-right: 5px !important;
        scrollbar-width: thin !important;
        scrollbar-color: #adb5bd #f8f9fa !important;
      }
      
      /* Estilos para a lista de restrições */
      .restrictions-list {
        max-height: calc(100vh - 200px) !important;
        overflow-y: auto !important;
        padding-right: 5px !important;
      }
      
      /* Item de restrição */
      .restriction-item {
        background-color: #fff !important;
        border: 1px solid #e9ecef !important;
        border-radius: 8px !important;
        padding: 12px 15px !important;
        margin-bottom: 12px !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
      }
      
      .restriction-item:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 3px 6px rgba(0,0,0,0.08) !important;
        border-color: #ffe082 !important;
      }
      
      /* Tipos de restrição */
      .restriction-type {
        font-size: 12px !important;
        font-weight: 500 !important;
        padding: 3px 8px !important;
        border-radius: 12px !important;
        margin-left: 8px !important;
      }
      
      .restriction-type.total {
        background-color: #ffebee !important;
        color: #d32f2f !important;
      }
      
      .restriction-type.partial {
        background-color: #fff8e1 !important;
        color: #ff8f00 !important;
      }
      
      /* Relatório de rota */
      .route-info {
        background-color: #fff !important;
        border: 1px solid #e9ecef !important;
        border-radius: 8px !important;
        padding: 15px !important;
        margin-bottom: 15px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
      }
      
      /* Cabeçalhos no relatório */
      .route-info h6 {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        color: #343a40 !important;
        margin-bottom: 10px !important;
        padding-bottom: 8px !important;
        border-bottom: 1px solid #e9ecef !important;
      }
      
      /* Itens de lista no relatório */
      .route-info li {
        padding: 6px 0 !important;
        border-bottom: 1px dashed #e9ecef !important;
        font-size: 14px !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    console.log("[StyleFix] Estilos CSS para abas inferiores injetados");
  }
  
  // Aplicar estilos diretos via JavaScript
  function styleBottomTabs() {
    // Estilizar os botões das abas
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(button => {
      Object.assign(button.style, {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 20px',
        border: 'none',
        transition: 'all 0.25s ease'
      });
      
      // Adicionar efeito hover
      button.addEventListener('mouseover', function() {
        if (!this.classList.contains('active')) {
          this.style.backgroundColor = '#f1f3f5';
          this.style.color = '#212529';
        }
      });
      
      button.addEventListener('mouseout', function() {
        if (!this.classList.contains('active')) {
          this.style.backgroundColor = 'transparent';
          this.style.color = '#495057';
        }
      });
    });
    
    // Garantir que o botão ativo tenha o estilo correto
    const activeButton = document.querySelector('.bottom-tab-btn.active');
    if (activeButton) {
      Object.assign(activeButton.style, {
        backgroundColor: '#fff8e1',
        color: '#ffab00',
        fontWeight: '600',
        boxShadow: 'inset 0 -3px 0 #ffc107'
      });
    }
    
    // Estilizar items de eventos
    const eventItems = document.querySelectorAll('.event-item');
    eventItems.forEach(item => {
      Object.assign(item.style, {
        backgroundColor: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '12px 15px',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      });
      
      // Adicionar efeito hover
      item.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
        this.style.borderColor = '#ffe082';
      });
      
      item.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
        this.style.borderColor = '#e9ecef';
      });
    });
  }
  
  // Configurar observador para manter os estilos
  function setupStyleObserver() {
    const observer = new MutationObserver(function(mutations) {
      // Verificar se há adições relevantes ao DOM
      const importantChanges = mutations.some(mutation => {
        return mutation.addedNodes.length > 0 || 
               (mutation.target && mutation.target.classList && 
                (mutation.target.classList.contains('bottom-tab-content') || 
                 mutation.target.classList.contains('event-list')));
      });
      
      if (importantChanges) {
        setTimeout(styleBottomTabs, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    console.log("[StyleFix] Observador de estilos configurado para manter consistência visual");
  }
})();