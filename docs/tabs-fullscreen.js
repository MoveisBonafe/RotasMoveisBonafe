/**
 * Script para garantir que as abas inferiores se expandam em tela cheia
 */
(function() {
    // Executar após o DOM estar carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabs);
    } else {
        initTabs();
    }
    
    function initTabs() {
        // Encontrar todos os botões de aba
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        if (!tabButtons.length) {
            console.warn("Botões de abas não encontrados, tentando novamente em 1s");
            setTimeout(initTabs, 1000);
            return;
        }
        
        console.log("Inicializando sistema de abas em tela cheia");
        
        // Adicionar handlers para cada botão
        tabButtons.forEach(button => {
            // Remover qualquer handler existente para evitar duplicação
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Adicionar novo handler
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId + '-content');
                
                // Verificar se esta aba já está ativa
                const isActive = this.classList.contains('active');
                const tabsContainer = document.querySelector('.bottom-tabs-container');
                const isExpanded = !tabsContainer.classList.contains('minimized');
                
                console.log("Clique na aba:", tabId, "Ativa:", isActive, "Expandida:", isExpanded);
                
                // Se a aba está ativa e expandida, minimizar
                if (isActive && isExpanded) {
                    minimizeTabs();
                    return;
                }
                
                // Desativar todas as abas
                document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Ocultar todos os conteúdos
                document.querySelectorAll('.bottom-tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Ativar esta aba
                this.classList.add('active');
                
                // Mostrar o conteúdo
                if (tabContent) {
                    // Expandir as abas se necessário
                    if (!isExpanded) {
                        expandTabs();
                    }
                    
                    tabContent.style.display = 'block';
                    tabContent.style.height = 'calc(100vh - 60px)';
                    tabContent.style.overflowY = 'auto';
                    tabContent.style.padding = '20px';
                }
            });
        });
        
        console.log("Sistema de abas inicializado com sucesso");
    }
    
    function expandTabs() {
        console.log("Expandindo abas para tela cheia");
        
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (!tabsContainer) return;
        
        // Remover classe minimizada
        tabsContainer.classList.remove('minimized');
        
        // Aplicar estilos fullscreen
        tabsContainer.style.position = 'fixed';
        tabsContainer.style.top = '0';
        tabsContainer.style.left = '380px'; // Alinhado com a sidebar
        tabsContainer.style.right = '0';
        tabsContainer.style.bottom = '0';
        tabsContainer.style.width = 'calc(100% - 380px)';
        tabsContainer.style.height = '100%';
        tabsContainer.style.zIndex = '9999';
        tabsContainer.style.backgroundColor = 'white';
        
        // Esconder o mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    }
    
    function minimizeTabs() {
        console.log("Minimizando abas");
        
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (!tabsContainer) return;
        
        // Adicionar classe minimizada
        tabsContainer.classList.add('minimized');
        
        // Restaurar estilos originais
        tabsContainer.style.position = 'absolute';
        tabsContainer.style.top = 'auto';
        tabsContainer.style.bottom = '0';
        tabsContainer.style.left = '380px';
        tabsContainer.style.height = '60px';
        tabsContainer.style.width = 'calc(100% - 380px)';
        
        // Desativar todas as abas
        document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Ocultar todos os conteúdos
        document.querySelectorAll('.bottom-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Mostrar o mapa novamente
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'visible';
        }
    }
})();