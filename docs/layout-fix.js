/**
 * Script para correção automática do layout da sidebar e mapa
 * Este script é executado automaticamente ao carregar a página
 * v1.0.0 - 2023-05-15
 */
(function() {
    /**
     * Verificação inicial - executado imediatamente
     */
    function init() {
        console.log('[LayoutFix] Iniciando correção de layout automática');
        
        // Executar assim que o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDOMReady);
        } else {
            // DOM já está pronto
            onDOMReady();
        }
    }
    
    /**
     * Quando o DOM estiver pronto
     */
    function onDOMReady() {
        // Aplicar correção de layout imediatamente
        fixLayout();
        
        // Executar novamente quando a janela for redimensionada
        window.addEventListener('resize', fixLayout);
        
        // Configurar loop de verificação
        scheduleChecks();
        
        console.log('[LayoutFix] Inicialização completa');
    }
    
    /**
     * Programar verificações periódicas
     */
    function scheduleChecks() {
        // Verificar a cada 1 segundo para garantir que as correções persistam
        window.layoutFixInterval = setInterval(fixLayout, 1000);
        
        // Verificar também após 100ms, 500ms, 2s e 5s para cobrir diferentes cenários de carregamento
        setTimeout(fixLayout, 100);
        setTimeout(fixLayout, 500);
        setTimeout(fixLayout, 2000);
        setTimeout(fixLayout, 5000);
    }
    
    /**
     * Função principal para corrigir o layout
     */
    function fixLayout() {
        console.log('[LayoutFix] Aplicando correções...');
        
        // Corrigir container principal
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            applyStyles(appContainer, {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                overflow: 'hidden'
            });
        }
        
        // Corrigir área de conteúdo principal
        const mainContent = document.querySelector('.main-content-area');
        if (mainContent) {
            applyStyles(mainContent, {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '60px', // Altura da barra inferior
                overflow: 'hidden'
            });
        }
        
        // Corrigir sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            applyStyles(sidebar, {
                position: 'absolute',
                top: '0',
                left: '0',
                bottom: '0',
                width: '380px',
                overflowY: 'auto',
                zIndex: '10',
                boxSizing: 'border-box'
            });
            
            // Obter a largura real da sidebar após aplicar estilos
            const sidebarWidth = sidebar.offsetWidth;
            
            // Corrigir container do mapa
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                applyStyles(mapContainer, {
                    position: 'absolute',
                    top: '0',
                    left: sidebarWidth + 'px',
                    right: '0',
                    bottom: '0',
                    overflow: 'hidden',
                    width: 'calc(100% - ' + sidebarWidth + 'px)'
                });
            }
            
            // Corrigir barra inferior
            const bottomTabs = document.querySelector('.bottom-tabs-container');
            if (bottomTabs) {
                applyStyles(bottomTabs, {
                    position: 'absolute',
                    bottom: '0',
                    left: sidebarWidth + 'px',
                    right: '0',
                    height: '60px',
                    width: 'calc(100% - ' + sidebarWidth + 'px)',
                    zIndex: '1000'
                });
            }
            
            // Forçar o redimensionamento do mapa (se existir)
            if (window.map && window.google && window.google.maps) {
                google.maps.event.trigger(window.map, 'resize');
            }
        }
        
        // Procurar e corrigir problemas específicos de sobreposição
        fixOverlappingElements();
    }
    
    /**
     * Função auxiliar para aplicar múltiplos estilos
     */
    function applyStyles(element, styles) {
        if (!element) return;
        Object.keys(styles).forEach(property => {
            element.style[property] = styles[property];
        });
    }
    
    /**
     * Corrigir problemas específicos de sobreposição
     */
    function fixOverlappingElements() {
        // Corrigir problemas com a barra lateral (se houver)
        const sidebarToggleButton = document.querySelector('.sidebar-toggle');
        if (sidebarToggleButton) {
            sidebarToggleButton.style.display = 'none';
        }
        
        // Corrigir qualquer container que possa ter sido afetado pelo layout
        const routeSummary = document.querySelector('.route-summary');
        if (routeSummary) {
            routeSummary.style.maxHeight = 'calc(100vh - 300px)';
            routeSummary.style.overflowY = 'auto';
        }
    }
    
    // Iniciar o processo de correção
    init();
})();