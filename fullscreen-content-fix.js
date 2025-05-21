/**
 * Correção para fazer os conteúdos ocuparem todo o espaço disponível
 * Este script ajusta os estilos para garantir que o conteúdo das abas
 * preencha completamente a área disponível quando expandido
 */

(function() {
    // Executar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[FullscreenFix] Inicializando correção de conteúdo em tela cheia');
        
        // Aplicar imediatamente
        applyFullscreenFix();
        
        // Aplicar novamente após um tempo para garantir
        setTimeout(applyFullscreenFix, 500);
        setTimeout(applyFullscreenFix, 1000);
        
        // Verificar periodicamente
        setInterval(applyFullscreenFix, 2000);
    });
    
    // Função principal para aplicar os ajustes
    function applyFullscreenFix() {
        // 1. Primeiro, injetar o CSS para garantir o preenchimento completo
        injectFullscreenCSS();
        
        // 2. Ajustar os elementos existentes
        adjustTabContents();
        
        // 3. Adicionar observador para mudanças
        setupMutationObserver();
    }
    
    // Injetar CSS necessário
    function injectFullscreenCSS() {
        // Verificar se o estilo já foi injetado
        if (document.getElementById('fullscreen-content-fix-css')) {
            return;
        }
        
        const css = `
        /* CSS para garantir que o conteúdo ocupe todo o espaço disponível */
        .bottom-tabs-container:not(.minimized) {
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
        }
        
        .bottom-tabs-nav {
            flex-shrink: 0 !important;
            width: 100% !important;
        }
        
        .bottom-tabs-container:not(.minimized) .bottom-tab-content {
            display: none !important;
        }
        
        .bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content {
            display: flex !important;
            flex-direction: column !important;
            height: calc(100vh - 60px) !important;
            width: 100% !important;
            overflow-y: auto !important;
            padding: 15px !important;
            flex: 1 !important;
        }
        
        /* Corrigir problemas com conteúdos específicos */
        #eventos-tab-content, 
        #restrições-tab-content, 
        #info-tab-content {
            height: 100% !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
        }
        
        /* Garantir que elementos internos possam se expandir */
        .bottom-tab-content.active-content > * {
            width: 100% !important;
        }
        
        /* Certificar que o conteúdo é totalmente preenchido */
        .bottom-tab-content.active-content:after {
            content: "";
            display: block;
            min-height: 50vh;
        }
        
        /* Melhoria visual dos elementos dentro das abas */
        .bottom-tab-content .card, 
        .bottom-tab-content .list-group-item {
            margin-bottom: 10px !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05) !important;
            border: 1px solid rgba(0,0,0,0.1) !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        
        .bottom-tab-content .card:hover, 
        .bottom-tab-content .list-group-item:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
        }
        
        /* Melhorar espaçamento vertical */
        .bottom-tab-content h1, 
        .bottom-tab-content h2, 
        .bottom-tab-content h3, 
        .bottom-tab-content h4,
        .bottom-tab-content h5 {
            margin-top: 1rem !important;
            margin-bottom: 1rem !important;
        }
        
        /* Expandir horizontalmente os elementos principais */
        .bottom-tab-content .container-fluid,
        .bottom-tab-content .row,
        .bottom-tab-content .col,
        .bottom-tab-content div[class^="col-"] {
            width: 100% !important;
        }
        `;
        
        const style = document.createElement('style');
        style.id = 'fullscreen-content-fix-css';
        style.textContent = css;
        document.head.appendChild(style);
        
        console.log('[FullscreenFix] CSS de tela cheia injetado');
    }
    
    // Ajustar o conteúdo das abas
    function adjustTabContents() {
        // Encontrar o conteúdo ativo
        const activeContent = document.querySelector('.bottom-tab-content.active-content');
        if (!activeContent) {
            return;
        }
        
        // Verificar se o container está expandido
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (!tabsContainer || tabsContainer.classList.contains('minimized')) {
            return;
        }
        
        // Ajustar o conteúdo ativo
        activeContent.style.height = 'calc(100vh - 60px)';
        activeContent.style.width = '100%';
        activeContent.style.overflowY = 'auto';
        activeContent.style.display = 'flex';
        activeContent.style.flexDirection = 'column';
        
        // Forçar o tamanho de todos os elementos filhos
        const children = activeContent.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].tagName !== 'STYLE' && children[i].tagName !== 'SCRIPT') {
                children[i].style.width = '100%';
            }
        }
        
        // Ajustar elementos específicos
        const eventList = activeContent.querySelector('.event-list');
        if (eventList) {
            eventList.style.width = '100%';
            eventList.style.minHeight = '200px';
        }
        
        const restrictionsList = activeContent.querySelector('.restrictions-list');
        if (restrictionsList) {
            restrictionsList.style.width = '100%';
            restrictionsList.style.minHeight = '200px';
        }
        
        const reportContainer = activeContent.querySelector('.route-report');
        if (reportContainer) {
            reportContainer.style.width = '100%';
            reportContainer.style.minHeight = '300px';
        }
        
        console.log('[FullscreenFix] Conteúdo ativo ajustado para preencher o espaço disponível');
    }
    
    // Observar mudanças no DOM para reaplicar os ajustes quando necessário
    function setupMutationObserver() {
        // Verificar se já foi configurado
        if (window.fullscreenFixObserver) {
            return;
        }
        
        // Criar o observador
        const observer = new MutationObserver(function(mutations) {
            let shouldAdjust = false;
            
            mutations.forEach(function(mutation) {
                // Verificar mudanças relevantes
                if (mutation.target.classList && 
                    (mutation.target.classList.contains('bottom-tabs-container') || 
                     mutation.target.classList.contains('bottom-tab-content'))) {
                    shouldAdjust = true;
                }
                
                // Verificar mudanças de exibição
                if (mutation.attributeName === 'style' && 
                    (mutation.target.classList.contains('bottom-tab-content') ||
                     mutation.target.classList.contains('bottom-tabs-container'))) {
                    shouldAdjust = true;
                }
            });
            
            if (shouldAdjust) {
                adjustTabContents();
            }
        });
        
        // Configurar observador
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Guardar referência
        window.fullscreenFixObserver = observer;
        
        console.log('[FullscreenFix] Observador de mudanças configurado');
    }
    
    // Executar se o documento já estiver carregado
    if (document.readyState !== 'loading') {
        applyFullscreenFix();
    }
})();