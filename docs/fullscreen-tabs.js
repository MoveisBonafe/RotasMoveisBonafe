/**
 * Script para implementar abas em modo tela cheia
 * Este script substitui o comportamento padrão das abas inferiores
 * para permitir a exibição em tela cheia quando clicadas
 * 
 * VERSÃO 2.0 CORRIGIDA PARA GITHUB PAGES - SOLUÇÃO RADICAL
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicializando script de abas fullscreen.js - VERSÃO CORRIGIDA");
  
  // Primeiro esconder TODOS os conteúdos
  const allTabContents = document.querySelectorAll('.bottom-tab-content');
  allTabContents.forEach(content => {
    content.style.display = 'none';
  });
  
  // Substituir handlers de clique para cada botão de aba
  const tabButtons = document.querySelectorAll('.bottom-tab-btn');
  
  tabButtons.forEach(button => {
    // Remover qualquer event listener anterior
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Adicionar novo handler limpo
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const tabId = this.getAttribute('data-tab');
      const tabContent = document.getElementById(tabId + '-content');
      const tabsContainer = document.querySelector('.bottom-tabs-container');
      
      console.log(`Clique na aba: ${tabId}`);
      
      // Remover classe ativa de todos os botões
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Esconder TODOS os conteúdos - abordagem direta
      allTabContents.forEach(content => {
        content.style.display = 'none';
      });
      
      // Ativar este botão
      this.classList.add('active');
      
      // Mostrar APENAS o conteúdo desta aba
      if (tabContent) {
        console.log(`Mostrando conteúdo da aba: ${tabId}`);
        tabContent.style.display = 'block';
        
        // Expandir o container se necessário
        if (tabsContainer.classList.contains('minimized')) {
          tabsContainer.classList.remove('minimized');
        }
      }
    });
  });
  
  console.log("Sistema de abas completamente reinicializado");
});
(function() {
    // Aguardar o DOM estar pronto
    var ready = function(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };
    
    // Função principal de inicialização
    var init = function() {
        console.log("[FullscreenTabs] Inicializando sistema de abas em tela cheia");
        
        // Encontrar os botões das abas inferiores
        var tabButtons = document.querySelectorAll('.bottom-tab-btn');
        if (!tabButtons || tabButtons.length === 0) {
            // Se não encontrar os botões, tentar novamente após um tempo
            console.warn("[FullscreenTabs] Botões de abas não encontrados, tentando novamente em 500ms");
            setTimeout(init, 500);
            return;
        }
        
        // Configurar cada botão de aba
        tabButtons.forEach(function(button) {
            // Remover eventuais handlers antigos clonando o botão
            var clone = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(clone, button);
            }
            
            // Adicionar o novo handler de clique
            clone.addEventListener('click', handleTabClick);
        });
        
        console.log("[FullscreenTabs] Inicialização concluída com sucesso");
    };
    
    // Handler para o clique em botões de aba
    var handleTabClick = function(e) {
        // Evitar comportamento padrão
        e.preventDefault();
        e.stopPropagation();
        
        // Obter ID da aba e container
        var tabId = this.getAttribute('data-tab');
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        var tabContent = document.getElementById(tabId + '-content');
        
        console.log("[FullscreenTabs] Clique na aba: " + tabId);
        
        // Verificar se a aba já está ativa
        var isActive = this.classList.contains('active');
        var isExpanded = !bottomTabsContainer.classList.contains('minimized');
        
        // Se a aba já estiver ativa e expandida, minimizar
        if (isActive && isExpanded) {
            console.log("[FullscreenTabs] Minimizando aba ativa: " + tabId);
            minimizeTabs();
            return;
        }
        
        // Desativar todas as abas anteriores
        var allTabButtons = document.querySelectorAll('.bottom-tab-btn');
        allTabButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        // Esconder todos os conteúdos
        var allContents = document.querySelectorAll('.bottom-tab-content');
        allContents.forEach(function(content) {
            content.style.display = 'none';
        });
        
        // Ativar esta aba
        this.classList.add('active');
        
        // Se as abas estiverem minimizadas, expandir o container
        if (!isExpanded) {
            expandTabs();
        }
        
        // Mostrar o conteúdo correspondente
        if (tabContent) {
            tabContent.style.display = 'block';
            tabContent.style.height = 'calc(100vh - 60px)';
            tabContent.style.overflowY = 'auto';
            tabContent.style.padding = '20px';
        }
    };
    
    // Expande as abas para tela cheia
    var expandTabs = function() {
        console.log("[FullscreenTabs] Expandindo abas para tela cheia");
        
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        if (!bottomTabsContainer) return;
        
        // Remover classe minimizada
        bottomTabsContainer.classList.remove('minimized');
        
        // Aplicar estilos de tela cheia
        Object.assign(bottomTabsContainer.style, {
            position: 'fixed',
            top: '0',
            left: '380px',
            right: '0',
            bottom: '0',
            width: 'calc(100% - 380px)',
            height: '100vh',
            zIndex: '9999',
            backgroundColor: 'white',
            borderLeft: '2px solid #ffc107',
            boxShadow: '-5px 0px 15px rgba(0,0,0,0.1)'
        });
        
        // Ajustar para telas menores
        if (window.innerWidth <= 768) {
            bottomTabsContainer.style.left = '320px';
            bottomTabsContainer.style.width = 'calc(100% - 320px)';
        }
        
        // Ocultar o mapa
        var mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    };
    
    // Minimiza as abas para o estado normal
    var minimizeTabs = function() {
        console.log("[FullscreenTabs] Minimizando abas");
        
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        if (!bottomTabsContainer) return;
        
        // Adicionar classe minimizada
        bottomTabsContainer.classList.add('minimized');
        
        // Restaurar estilos originais
        Object.assign(bottomTabsContainer.style, {
            position: 'absolute',
            top: 'auto',
            left: '380px',
            right: '0',
            bottom: '0',
            height: '60px',
            width: 'calc(100% - 380px)',
            zIndex: '100',
            backgroundColor: '#f9f9f9',
            borderLeft: 'none',
            boxShadow: 'none'
        });
        
        // Ajustar para telas menores
        if (window.innerWidth <= 768) {
            bottomTabsContainer.style.left = '320px';
            bottomTabsContainer.style.width = 'calc(100% - 320px)';
        }
        
        // Desativar todas as abas
        var allTabButtons = document.querySelectorAll('.bottom-tab-btn');
        allTabButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        // Esconder todos os conteúdos
        var allContents = document.querySelectorAll('.bottom-tab-content');
        allContents.forEach(function(content) {
            content.style.display = 'none';
        });
        
        // Mostrar o mapa novamente
        var mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'visible';
        }
        
        // Forçar o redesenho do mapa
        if (window.google && window.google.maps && window.map) {
            setTimeout(function() {
                google.maps.event.trigger(window.map, 'resize');
            }, 100);
        }
    };
    
    // Inicializar quando o DOM estiver pronto
    ready(function() {
        // Dar um pequeno atraso para garantir que outros scripts já rodaram
        setTimeout(init, 100);
    });
    
    // Reinicializar quando a janela for redimensionada
    window.addEventListener('resize', function() {
        // Ajustar layout para novas dimensões
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        if (!bottomTabsContainer) return;
        
        if (bottomTabsContainer.classList.contains('minimized')) {
            // Ajustar layout minimizado
            var sidebarWidth = window.innerWidth <= 768 ? '320px' : '380px';
            bottomTabsContainer.style.left = sidebarWidth;
            bottomTabsContainer.style.width = 'calc(100% - ' + sidebarWidth + ')';
        } else {
            // Ajustar layout expandido
            var sidebarWidth = window.innerWidth <= 768 ? '320px' : '380px';
            bottomTabsContainer.style.left = sidebarWidth;
            bottomTabsContainer.style.width = 'calc(100% - ' + sidebarWidth + ')';
        }
    });
})();