/**
 * Script para correção automática do layout da sidebar e mapa
 * Este script é executado automaticamente ao carregar a página
 */
(function() {
    // Executar assim que o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', fixLayout);
    
    // Executar novamente quando a janela for redimensionada
    window.addEventListener('resize', fixLayout);
    
    // Função principal para corrigir o layout
    function fixLayout() {
        console.log('Aplicando correção automática de layout...');
        
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
        
        console.log('Correção de layout aplicada com sucesso!');
    }
    
    // Função auxiliar para aplicar múltiplos estilos
    function applyStyles(element, styles) {
        if (!element) return;
        Object.keys(styles).forEach(property => {
            element.style[property] = styles[property];
        });
    }
    
    // Executar a cada 1 segundo para garantir que seja aplicado após qualquer mudança dinâmica
    setInterval(fixLayout, 1000);
})();