/**
 * Estilos para abas inferiores no GitHub Pages
 * Este script é projetado especificamente para funcionar no ambiente GitHub Pages
 */

(function() {
  console.log("[GithubStyle] Iniciando aplicação de estilos para GitHub Pages...");
  
  // Aplicar imediatamente para evitar atrasos visuais
  applyTabStyles();
  
  // Também aplicar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(applyTabStyles, 500);
  });
  
  // E quando a página estiver totalmente carregada
  window.addEventListener('load', function() {
    setTimeout(applyTabStyles, 500);
    setTimeout(applyTabStyles, 2000);
  });
  
  // Função principal que aplica todos os estilos
  function applyTabStyles() {
    console.log("[GithubStyle] Aplicando estilos para GitHub Pages...");
    
    // Adicionar um delay para garantir que o DOM esteja pronto
    setTimeout(function() {
      // 1. Adicionar CSS com alta prioridade
      addStylesWithPriority();
      
      // 2. Aplicar estilos diretamente
      styleTabsDirectly();
      
      // 3. Configurar observer para manter estilos após interações dinâmicas
      setupStyleObserver();
      
      console.log("[GithubStyle] Todos os estilos aplicados com sucesso");
    }, 200);
  }
  
  // Adiciona os estilos CSS com alta prioridade para sobrescrever quaisquer outros
  function addStylesWithPriority() {
    const styleId = 'github-tabs-priority-styles';
    
    // Evitar duplicação
    if (document.getElementById(styleId)) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = `
      /* Estilos para as abas na parte inferior */
      .bottom-tabs-container {
        background-color: #f8f9fa !important;
        border-top: 1px solid #e9ecef !important;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.05) !important;
        display: flex !important;
        flex-direction: column !important;
        z-index: 1000 !important;
      }
      
      /* Botões de navegação das abas */
      .tabs-nav {
        display: flex !important;
        background-color: #f8f9fa !important;
        border-bottom: 1px solid #e9ecef !important;
      }
      
      /* Estilo para botões individuais das abas */
      .bottom-tab-btn {
        flex: 1 !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        padding: 15px 20px !important;
        border: none !important;
        background-color: transparent !important;
        color: #495057 !important;
        transition: all 0.25s ease !important;
        border-radius: 0 !important;
        margin: 0 !important;
        cursor: pointer !important;
        text-transform: none !important;
      }
      
      /* Botão ativo com destaque */
      .bottom-tab-btn.active {
        background-color: #fff8e1 !important;
        color: #ffab00 !important;
        font-weight: 600 !important;
        box-shadow: inset 0 -3px 0 #ffc107 !important;
      }
      
      /* Hover para botões não-ativos */
      .bottom-tab-btn:not(.active):hover {
        background-color: #f1f3f5 !important;
        color: #212529 !important;
      }
      
      /* Conteúdo das abas quando expandido */
      .bottom-tab-content {
        padding: 15px 20px !important;
        background-color: #ffffff !important;
        display: none !important;
      }
      
      /* Mostrar apenas o conteúdo ativo */
      .bottom-tab-content.active-content {
        display: block !important;
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
      
      /* Eventos e restrições no mesmo estilo da sidebar */
      .event-item, .restriction-item {
        background-color: #fff !important;
        border: 1px solid #e9ecef !important;
        border-radius: 8px !important;
        padding: 12px 15px !important;
        margin-bottom: 12px !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
      }
      
      .event-item:hover, .restriction-item:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 3px 6px rgba(0,0,0,0.08) !important;
        border-color: #ffe082 !important;
      }
      
      /* Componentes específicos de eventos */
      .event-title {
        font-size: 15px !important;
        font-weight: 600 !important;
        color: #343a40 !important;
        margin-bottom: 5px !important;
      }
      
      .event-date {
        font-size: 13px !important;
        font-weight: 500 !important;
        color: #ffa000 !important;
        margin-bottom: 8px !important;
      }
      
      .event-description {
        font-size: 13px !important;
        color: #6c757d !important;
        margin-bottom: 0 !important;
      }
      
      /* Componentes específicos de restrições */
      .restriction-city {
        font-size: 15px !important;
        font-weight: 600 !important;
        color: #1976D2 !important;
        margin-bottom: 5px !important;
        display: flex !important;
        align-items: center !important;
        flex-wrap: wrap !important;
      }
      
      .restriction-type {
        font-size: 12px !important;
        font-weight: 500 !important;
        padding: 3px 8px !important;
        border-radius: 12px !important;
        margin-left: 8px !important;
        display: inline-block !important;
      }
      
      .restriction-type.total {
        background-color: #ffebee !important;
        color: #d32f2f !important;
      }
      
      .restriction-type.partial {
        background-color: #fff8e1 !important;
        color: #ff8f00 !important;
      }
      
      /* Tamanho das listas */
      .event-list, .restrictions-list, .restrictions-container {
        max-height: calc(100vh - 200px) !important;
        overflow-y: auto !important;
        padding-right: 5px !important;
        scrollbar-width: thin !important;
      }
      
      /* Estilos para o relatório de rota */
      .route-info {
        background-color: #fff !important;
        border: 1px solid #e9ecef !important;
        border-radius: 8px !important;
        padding: 15px !important;
        margin-bottom: 15px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
      }
      
      /* Estilo de texto no relatório */
      .route-info h6 {
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
    
    // Usar prependChild para ter prioridade máxima
    const head = document.head || document.getElementsByTagName('head')[0];
    head.insertBefore(styleElement, head.firstChild);
    console.log("[GithubStyle] Estilos CSS prioritários adicionados");
  }
  
  // Modificação direta de elementos específicos via JavaScript
  function styleTabsDirectly() {
    // Aplicar estilos ao container das abas
    const tabsContainer = document.querySelector('.bottom-tabs-container');
    if (tabsContainer) {
      Object.assign(tabsContainer.style, {
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: '1000'
      });
    }
    
    // Estilizar cada botão individualmente
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(button => {
      if (!button) return;
      
      Object.assign(button.style, {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: '14px',
        fontWeight: button.classList.contains('active') ? '600' : '500',
        backgroundColor: button.classList.contains('active') ? '#fff8e1' : 'transparent',
        color: button.classList.contains('active') ? '#ffab00' : '#495057',
        boxShadow: button.classList.contains('active') ? 'inset 0 -3px 0 #ffc107' : 'none',
        padding: '15px 20px',
        border: 'none',
        borderRadius: '0',
        margin: '0',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        textTransform: 'none'
      });
      
      // Adicionar manualmente eventos de hover
      button.onmouseover = function() {
        if (!this.classList.contains('active')) {
          this.style.backgroundColor = '#f1f3f5';
          this.style.color = '#212529';
        }
      };
      
      button.onmouseout = function() {
        if (!this.classList.contains('active')) {
          this.style.backgroundColor = 'transparent';
          this.style.color = '#495057';
        }
      };
      
      // Adicionar evento para mudar a aparência ao clicar
      button.addEventListener('click', function() {
        // Remover estilo ativo de todos os botões
        tabButtons.forEach(btn => {
          if (btn === this) return;
          btn.style.backgroundColor = 'transparent';
          btn.style.color = '#495057';
          btn.style.fontWeight = '500';
          btn.style.boxShadow = 'none';
        });
        
        // Aplicar estilo ativo a este botão
        this.style.backgroundColor = '#fff8e1';
        this.style.color = '#ffab00';
        this.style.fontWeight = '600';
        this.style.boxShadow = 'inset 0 -3px 0 #ffc107';
      });
    });
    
    // Estilizar itens de eventos
    document.querySelectorAll('.event-item').forEach(item => {
      if (!item) return;
      
      Object.assign(item.style, {
        backgroundColor: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '12px 15px',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      });
      
      // Efeito hover
      item.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
        this.style.borderColor = '#ffe082';
      };
      
      item.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
        this.style.borderColor = '#e9ecef';
      };
    });
    
    // Estilizar itens de restrições
    document.querySelectorAll('.restriction-item').forEach(item => {
      if (!item) return;
      
      Object.assign(item.style, {
        backgroundColor: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '12px 15px',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      });
      
      // Efeito hover
      item.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
        this.style.borderColor = '#ffe082';
      };
      
      item.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
        this.style.borderColor = '#e9ecef';
      };
    });
    
    console.log("[GithubStyle] Estilos diretos aplicados aos elementos");
  }
  
  // Configurar observer para manter estilos em mudanças dinâmicas
  function setupStyleObserver() {
    // Verificar se o MutationObserver está disponível
    if (!window.MutationObserver) {
      console.log("[GithubStyle] MutationObserver não disponível, usando setInterval como fallback");
      // Usar setInterval como fallback
      setInterval(styleTabsDirectly, 2000);
      return;
    }
    
    const observer = new MutationObserver(function(mutations) {
      let needsUpdate = false;
      
      mutations.forEach(mutation => {
        // Verificar se houve adições/remoções relevantes
        if (mutation.addedNodes.length > 0 || 
            (mutation.target && (
              mutation.target.classList.contains('bottom-tabs-container') ||
              mutation.target.classList.contains('event-item') ||
              mutation.target.classList.contains('restriction-item') ||
              mutation.target.classList.contains('bottom-tab-content')
            ))) {
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        setTimeout(styleTabsDirectly, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    console.log("[GithubStyle] Observer configurado para manter estilos consistentes");
  }
})();