/**
 * Solução completa para o sistema de abas - v1.0.2 (16/05/2025)
 * Esta solução substitui COMPLETAMENTE o comportamento anterior das abas
 * É baseada na versão standalone que funciona corretamente
 */
(function() {
    // Esta solução será executada após qualquer outro script de abas
    // para garantir que nosso comportamento substitua qualquer outro
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Pequeno atraso para garantir que todo o resto seja carregado
            setTimeout(initBottomTabs, 500);
        });
    } else {
        // Caso o DOM já esteja carregado
        setTimeout(initBottomTabs, 500);
    }
    
    function initBottomTabs() {
        console.log("[TabsSolution] Inicializando sistema de abas simplificado");
        
        // Configurar os painéis de abas com estrutura correta
        setupTabPanels();
        
        // Configurar os botões de abas
        setupTabButtons();
        
        console.log("[TabsSolution] Sistema de abas inicializado");
    }
    
    function setupTabPanels() {
        // Selecionar o container das abas
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (!tabsContainer) {
            console.error("[TabsSolution] Container de abas não encontrado");
            return;
        }
        
        // Forçar classe minimized por padrão
        tabsContainer.classList.add('minimized');
        
        // Garantir que todos os painéis de conteúdo estejam ocultos inicialmente
        document.querySelectorAll('[id$="-content"]').forEach(panel => {
            if (panel.id.includes('bottom-')) {
                panel.style.display = 'none';
            }
        });
    }
    
    function setupTabButtons() {
        // Desativar TODOS os scripts existentes para as abas
        // Escondendo qualquer script que manipule as abas
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.textContent && (
                script.textContent.includes('bottom-tab-btn') || 
                script.textContent.includes('toggleTabsExpansion') ||
                script.textContent.includes('initBottomTabs')
            )) {
                // Marcar scripts que manipulam abas para não executar
                script.setAttribute('data-disabled', 'true');
                console.log("[TabsSolution] Desativando script anterior de abas");
            }
        });

        // Encontrar todos os botões de abas
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        if (!tabButtons || tabButtons.length === 0) {
            console.error("[TabsSolution] Botões de abas não encontrados");
            return;
        }
        
        // Remover completamente TODOS os handlers existentes e adicionar novos
        tabButtons.forEach(button => {
            // Clonar para remover todos os eventos
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Adicionar novo listener - garantindo que funcione independente de qualquer outro script
            newButton.addEventListener('click', function(e) {
                // Capturar evento no início da propagação
                e.preventDefault();
                e.stopPropagation();
                console.log("[TabsSolution] Clique em botão de aba capturado");
                handleTabClick(this);
            }, true); // true = capturar na fase de captura (antes de qualquer outro handler)
        });
    }
    
    function handleTabClick(button) {
        // Obter ID da aba e referências importantes
        const tabId = button.getAttribute('data-tab');
        const contentId = tabId + '-content';
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        
        console.log("[TabsSolution] Clique na aba:", tabId);
        
        // Verificar estado atual
        const isMinimized = tabsContainer.classList.contains('minimized');
        const isActive = button.classList.contains('active');
        
        // Se a aba já estiver ativa e expandida, minimizar
        if (isActive && !isMinimized) {
            console.log("[TabsSolution] Minimizando aba já ativa");
            minimizeTabs();
            return;
        }
        
        // Desativar todas as abas
        document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Ativar esta aba
        button.classList.add('active');
        
        // Esconder todos os painéis de conteúdo
        document.querySelectorAll('[id$="-content"]').forEach(panel => {
            if (panel.id.includes('bottom-')) {
                panel.style.display = 'none';
            }
        });
        
        // Mostrar o painel desta aba
        const contentPanel = document.getElementById(contentId);
        if (contentPanel) {
            contentPanel.style.display = 'block';
            
            // Se estiver minimizado, expandir
            if (isMinimized) {
                expandTabs();
            }
        } else {
            console.error("[TabsSolution] Painel não encontrado:", contentId);
        }
    }
    
    function expandTabs() {
        console.log("[TabsSolution] Expandindo abas");
        
        // Obter referências
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        const sidebar = document.querySelector('.sidebar');
        
        if (!tabsContainer) return;
        
        // Calcular a largura da sidebar
        const sidebarWidth = sidebar ? sidebar.offsetWidth : 380;
        
        // Remover classe minimized
        tabsContainer.classList.remove('minimized');
        
        // Aplicar estilos para tela cheia
        Object.assign(tabsContainer.style, {
            position: 'fixed',
            top: '0',
            left: sidebarWidth + 'px',
            right: '0',
            bottom: '0',
            height: '100vh',
            width: 'calc(100% - ' + sidebarWidth + 'px)',
            zIndex: '800',
            backgroundColor: 'white',
            borderLeft: '2px solid #ffc107',
            boxShadow: '-5px 0px 15px rgba(0,0,0,0.1)'
        });
        
        // Garantir que a sidebar permaneça visível
        if (sidebar) {
            sidebar.style.zIndex = '1000';
            sidebar.style.position = 'fixed';
            sidebar.style.display = 'block';
            sidebar.style.visibility = 'visible';
        }
        
        // Ocultar o mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    }
    
    function minimizeTabs() {
        console.log("[TabsSolution] Minimizando abas");
        
        // Obter referências
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        const sidebar = document.querySelector('.sidebar');
        
        if (!tabsContainer) return;
        
        // Calcular a largura da sidebar
        const sidebarWidth = sidebar ? sidebar.offsetWidth : 380;
        
        // Adicionar classe minimized
        tabsContainer.classList.add('minimized');
        
        // Restaurar estilos originais
        Object.assign(tabsContainer.style, {
            position: 'absolute',
            top: 'auto',
            left: sidebarWidth + 'px',
            right: '0',
            bottom: '0',
            height: '60px',
            width: 'calc(100% - ' + sidebarWidth + 'px)',
            zIndex: '100',
            backgroundColor: '#f9f9f9',
            borderLeft: 'none',
            boxShadow: 'none'
        });
        
        // Desativar todas as abas
        document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Esconder todos os painéis de conteúdo
        document.querySelectorAll('[id$="-content"]').forEach(panel => {
            if (panel.id.includes('bottom-')) {
                panel.style.display = 'none';
            }
        });
        
        // Restaurar a sidebar
        if (sidebar) {
            sidebar.style.position = '';
            sidebar.style.zIndex = '';
        }
        
        // Mostrar o mapa novamente
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'visible';
            
            // Forçar redesenho do mapa
            if (window.google && window.google.maps && window.map) {
                setTimeout(function() {
                    google.maps.event.trigger(window.map, 'resize');
                }, 100);
            }
        }
    }
})();