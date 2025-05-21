
/**
 * Correção completa para o site GitHub Pages
 * Este script corrige o problema das abas e atualiza os eventos de cidades
 */

(function() {
    console.log('[AutoFix] Iniciando correções automáticas...');
    
    // Aplicar correções quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFixes);
    } else {
        applyFixes();
    }
    
    function applyFixes() {
        fixBottomTabs();
        injectEmergencyCSS();
        setupTabBehavior();
    }
    
    function fixBottomTabs() {
        const allContents = document.querySelectorAll('.bottom-tab-content');
        allContents.forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active-content');
        });
        
        const activeButton = document.querySelector('.bottom-tab-btn.active');
        if (activeButton) {
            const tabId = activeButton.getAttribute('data-tab');
            const activeContent = document.getElementById(tabId + '-content');
            if (activeContent) {
                activeContent.style.display = 'block';
                activeContent.classList.add('active-content');
            }
        }
    }
    
    function injectEmergencyCSS() {
        const css = `
            .bottom-tab-content {
                display: none !important;
                visibility: hidden !important;
            }
            
            .bottom-tab-content.active-content {
                display: block !important;
                visibility: visible !important;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    function setupTabBehavior() {
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', handleTabClick);
        });
    }
    
    function handleTabClick(e) {
        const button = e.currentTarget;
        const tabId = button.getAttribute('data-tab');
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        const isActive = button.classList.contains('active');
        const isExpanded = !tabsContainer.classList.contains('minimized');
        
        if (isActive && isExpanded) {
            minimizeTabs();
            return;
        }
        
        document.querySelectorAll('.bottom-tab-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        
        document.querySelectorAll('.bottom-tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active-content');
        });
        
        const content = document.getElementById(tabId + '-content');
        if (content) {
            content.style.display = 'block';
            content.classList.add('active-content');
        }
        
        if (tabsContainer.classList.contains('minimized')) {
            expandTabs();
        }
    }
    
    function minimizeTabs() {
        const container = document.querySelector('.bottom-tabs-container');
        if (!container) return;
        
        container.classList.add('minimized');
        container.style.height = '60px';
        
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'visible';
        }
    }
    
    function expandTabs() {
        const container = document.querySelector('.bottom-tabs-container');
        if (!container) return;
        
        container.classList.remove('minimized');
        container.style.height = '100vh';
        
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    }
})();
