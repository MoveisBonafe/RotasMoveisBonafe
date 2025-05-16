/**
 * Script para correção do sistema de abas
 * Esta solução resolve o problema de conflito entre diferentes scripts de abas
 */
(function() {
    // Rastreamento de estado
    var currentActiveTab = null;
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', initFixedTabs);
    
    // Inicialização com delay para garantir que outros scripts já foram carregados
    function initFixedTabs() {
        console.log("[FixTabs] Iniciando correção do sistema de abas");
        
        // Dar um tempo para outros scripts carregarem
        setTimeout(function() {
            setupTabSystem();
        }, 1000);
    }
    
    function setupTabSystem() {
        console.log("[FixTabs] Configurando sistema de abas corrigido");
        
        // Encontrar todos os botões de abas
        var tabButtons = document.querySelectorAll('.bottom-tab-btn');
        
        // Substituir os event listeners para cada botão
        tabButtons.forEach(function(button) {
            // Remover eventos existentes clonando o botão
            var newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Adicionar novo evento de clique
            newButton.addEventListener('click', function(e) {
                handleTabClick(e, this);
            });
        });
        
        console.log("[FixTabs] Sistema de abas configurado com sucesso");
    }
    
    function handleTabClick(e, button) {
        // Evitar propagação para outros handlers
        e.stopPropagation();
        e.preventDefault();
        
        var tabId = button.getAttribute('data-tab');
        console.log("[FixTabs] Clique na aba:", tabId);
        
        // Verificar estado atual
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        var isMinimized = bottomTabsContainer.classList.contains('minimized');
        var isActive = button.classList.contains('active');
        
        // Se já estiver ativa e não minimizada, apenas minimizar
        if (isActive && !isMinimized) {
            console.log("[FixTabs] Minimizando aba já ativa");
            minimizeTabs();
            return;
        }
        
        // Desativar todas as abas
        document.querySelectorAll('.bottom-tab-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        // Ativar esta aba
        button.classList.add('active');
        currentActiveTab = tabId;
        
        // Esconder todos os conteúdos possíveis (cobrindo todas as classes usadas)
        var contentSelectors = [
            '.bottom-tab-panel', 
            '.bottom-tab-content',
            '.fixed-tab-content',
            '[id$="-content"]'
        ];
        
        // Combinar seletores para encontrar todos os painéis
        var allPanelsSelector = contentSelectors.join(', ');
        document.querySelectorAll(allPanelsSelector).forEach(function(panel) {
            if (panel.id) {
                console.log("[FixTabs] Escondendo painel:", panel.id);
                panel.style.display = 'none';
            }
        });
        
        // Mostrar apenas o conteúdo desta aba
        var contentId = tabId + '-content';
        var contentPanel = document.getElementById(contentId);
        
        if (contentPanel) {
            console.log("[FixTabs] Mostrando painel:", contentId);
            contentPanel.style.display = 'block';
            
            // Se estiver minimizado, expandir
            if (isMinimized) {
                expandTabs();
            }
        } else {
            console.warn("[FixTabs] Painel não encontrado:", contentId);
        }
    }
    
    function expandTabs() {
        console.log("[FixTabs] Expandindo abas");
        
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        if (!bottomTabsContainer) return;
        
        // Remover classe de minimizado
        bottomTabsContainer.classList.remove('minimized');
        
        // Obter a largura da sidebar de forma dinâmica
        var sidebar = document.querySelector('.sidebar');
        var sidebarWidth = sidebar ? sidebar.offsetWidth : 380;
        
        console.log("[FixTabs] Largura da sidebar:", sidebarWidth);
        
        // Aplicar estilos de tela cheia - mantendo a sidebar visível
        Object.assign(bottomTabsContainer.style, {
            position: 'fixed',
            top: '0',
            left: sidebarWidth + 'px',
            right: '0',
            bottom: '0',
            height: '100vh',
            width: 'calc(100% - ' + sidebarWidth + 'px)',
            zIndex: '999', // Menor que a sidebar para garantir que ela fique visível
            backgroundColor: 'white',
            borderLeft: '2px solid #ffc107',
            boxShadow: '-5px 0px 15px rgba(0,0,0,0.1)'
        });
        
        // IMPORTANTE: Garantir que a sidebar permaneça visível
        if (sidebar) {
            console.log("[FixTabs] Garantindo que a sidebar fique visível");
            
            // Aplicar z-index alto para a sidebar
            sidebar.style.zIndex = '1000';
            sidebar.style.visibility = 'visible';
            sidebar.style.display = 'block';
        }
        
        // Ocultar apenas o mapa para evitar sobreposição
        var mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    }
    
    function minimizeTabs() {
        console.log("[FixTabs] Minimizando abas");
        
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        if (!bottomTabsContainer) return;
        
        // Adicionar classe de minimizado
        bottomTabsContainer.classList.add('minimized');
        
        // Restaurar estilos normais
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
        document.querySelectorAll('.bottom-tab-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        // Esconder todos os conteúdos
        var contentSelectors = [
            '.bottom-tab-panel', 
            '.bottom-tab-content',
            '.fixed-tab-content',
            '[id$="-content"]'
        ];
        
        var allPanelsSelector = contentSelectors.join(', ');
        document.querySelectorAll(allPanelsSelector).forEach(function(panel) {
            if (panel.id) {
                panel.style.display = 'none';
            }
        });
        
        // Mostrar o mapa novamente
        var mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'visible';
        }
        
        // Redimensionar o mapa se necessário
        if (window.google && window.google.maps && window.map) {
            setTimeout(function() {
                google.maps.event.trigger(window.map, 'resize');
            }, 100);
        }
    }
    
    // Verificar e corrigir o estado das abas periodicamente
    setInterval(function() {
        var activeButton = document.querySelector('.bottom-tab-btn.active');
        var bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        
        if (activeButton && !bottomTabsContainer.classList.contains('minimized')) {
            // Se uma aba está ativa e o container não está minimizado
            // Verificar se o conteúdo correspondente está visível
            var tabId = activeButton.getAttribute('data-tab');
            var contentId = tabId + '-content';
            var contentPanel = document.getElementById(contentId);
            
            if (contentPanel && contentPanel.style.display !== 'block') {
                console.log("[FixTabs] Corrigindo visibilidade do painel:", contentId);
                
                // Esconder todos os painéis
                var contentSelectors = [
                    '.bottom-tab-panel', 
                    '.bottom-tab-content',
                    '.fixed-tab-content',
                    '[id$="-content"]'
                ];
                
                var allPanelsSelector = contentSelectors.join(', ');
                document.querySelectorAll(allPanelsSelector).forEach(function(panel) {
                    if (panel.id) {
                        panel.style.display = 'none';
                    }
                });
                
                // Mostrar o painel correto
                contentPanel.style.display = 'block';
            }
        }
    }, 1000);
})();