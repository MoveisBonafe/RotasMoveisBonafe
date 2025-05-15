/**
 * Script para corrigir o tremor da sidebar ao carregar a página
 */
(function() {
    // Executar assim que possível
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFixes);
    } else {
        applyFixes();
    }
    
    function applyFixes() {
        // Impedir o tremor da sidebar definindo o estilo imediatamente
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.position = 'absolute';
            sidebar.style.top = '0';
            sidebar.style.left = '0';
            sidebar.style.bottom = '0';
            sidebar.style.width = '380px';
            sidebar.style.maxWidth = '380px';
            sidebar.style.overflowY = 'auto';
            sidebar.style.zIndex = '10';
            sidebar.style.boxSizing = 'border-box';
        }
        
        // Ajustar o container do mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.position = 'absolute';
            mapContainer.style.top = '0';
            mapContainer.style.bottom = '60px';
            mapContainer.style.left = '380px';
            mapContainer.style.right = '0';
            mapContainer.style.overflow = 'hidden';
        }
        
        // Ajustar a barra de abas
        const bottomTabs = document.querySelector('.bottom-tabs-container');
        if (bottomTabs) {
            bottomTabs.style.position = 'absolute';
            bottomTabs.style.bottom = '0';
            bottomTabs.style.left = '380px';
            bottomTabs.style.right = '0';
            bottomTabs.style.height = '60px';
        }
        
        console.log("Layout estabilizado para evitar tremor");
    }
})();