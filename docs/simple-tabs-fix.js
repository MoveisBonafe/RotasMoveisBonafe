/**
 * Correção simples para o sistema de abas
 * (Esta solução foi extraída da versão standalone funcional)
 * v1.0.0 (16/05/2025)
 */
(function() {
    // Esperar o DOM estar completamente carregado
    window.addEventListener('load', initSimpleTabsFix);
    
    function initSimpleTabsFix() {
        console.log("[SimpleFix] Aplicando correção para as abas inferiores");
        
        // 1. Configurar os botões das abas com o comportamento correto
        setupTabButtons();
        
        // 2. Garantir que todas as abas estão inicialmente ocultas
        hideAllTabPanels();
        
        console.log("[SimpleFix] Correção aplicada com sucesso");
    }
    
    function setupTabButtons() {
        // Obter todos os botões de abas
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        
        // Remover e recriar os handlers para os botões
        tabButtons.forEach(function(button) {
            // Clonar para remover eventos existentes
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Adicionar novo handler simplificado
            newButton.addEventListener('click', function() {
                // Obter o ID da aba
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId + '-content');
                const tabsContainer = document.querySelector('.bottom-tabs-container');
                
                console.log("[SimpleFix] Clique em aba:", tabId);
                
                // Se já estiver ativa
                if (this.classList.contains('active')) {
                    // Se expandida, minimizar
                    if (!tabsContainer.classList.contains('minimized')) {
                        minimizeTabs();
                        this.classList.remove('active');
                        return;
                    }
                }
                
                // Desativar todas as abas
                tabButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Ocultar todos os painéis
                hideAllTabPanels();
                
                // Ativar esta aba
                this.classList.add('active');
                
                // Mostrar o conteúdo desta aba
                if (tabContent) {
                    tabContent.style.display = 'block';
                    
                    // Se as abas estiverem minimizadas, expandir
                    if (tabsContainer.classList.contains('minimized')) {
                        expandTabs();
                    }
                }
            });
        });
    }
    
    function hideAllTabPanels() {
        // Ocultar todos os painéis de abas
        const allPanels = document.querySelectorAll('.bottom-tab-content, [id^="bottom-"][id$="-content"]');
        allPanels.forEach(function(panel) {
            panel.style.display = 'none';
        });
    }
    
    function expandTabs() {
        const bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        const sidebar = document.querySelector('.sidebar');
        
        if (!bottomTabsContainer) return;
        
        bottomTabsContainer.classList.remove('minimized');
        
        // Calcular a largura da sidebar
        const sidebarWidth = sidebar ? sidebar.offsetWidth : 380;
        
        // Configurar o estilo do container de abas expandido
        bottomTabsContainer.style.position = 'fixed';
        bottomTabsContainer.style.top = '0';
        bottomTabsContainer.style.left = sidebarWidth + 'px';
        bottomTabsContainer.style.right = '0';
        bottomTabsContainer.style.bottom = '0';
        bottomTabsContainer.style.width = 'calc(100% - ' + sidebarWidth + 'px)';
        bottomTabsContainer.style.height = '100vh';
        bottomTabsContainer.style.zIndex = '999';
        
        // Garantir que a sidebar permaneça visível
        if (sidebar) {
            sidebar.style.zIndex = '1000';
            sidebar.style.visibility = 'visible';
            sidebar.style.display = 'block';
        }
        
        // Ocultar o mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    }
    
    function minimizeTabs() {
        const bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        
        if (!bottomTabsContainer) return;
        
        bottomTabsContainer.classList.add('minimized');
        
        // Restaurar estilo original
        bottomTabsContainer.style.position = 'absolute';
        bottomTabsContainer.style.top = 'auto';
        bottomTabsContainer.style.height = '60px';
        bottomTabsContainer.style.zIndex = '100';
        
        // Desativar os botões de abas
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        tabButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        // Ocultar todos os painéis
        hideAllTabPanels();
        
        // Mostrar o mapa novamente
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'visible';
        }
    }
})();