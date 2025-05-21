/**
 * Script para implementar abas em modo tela cheia
 * Este script substitui o comportamento padrão das abas inferiores
 * para permitir a exibição em tela cheia quando clicadas
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando sistema de abas aprimorado");
    setTimeout(initFullscreenTabs, 500);
});

/**
 * Inicializa o sistema de abas em tela cheia
 */
function initFullscreenTabs() {
    // Encontrar os botões de abas inferiores e seus conteúdos
    const tabButtons = document.querySelectorAll('.bottom-tab-button');
    const tabContents = document.querySelectorAll('.bottom-tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.warn("Elementos de abas não encontrados. O sistema de abas não será inicializado.");
        return;
    }
    
    console.log(`Sistema de abas: ${tabButtons.length} botões e ${tabContents.length} painéis de conteúdo encontrados`);
    
    // Esconder todos os conteúdos inicialmente, exceto o ativo
    const activeTabId = getActiveTabId(tabButtons);
    tabContents.forEach(content => {
        if (content.id !== activeTabId + '-content') {
            content.style.display = 'none';
            content.classList.remove('active');
        } else {
            content.style.display = 'flex';
            content.classList.add('active');
        }
    });
    
    // Adicionar listener para cada botão de aba
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = button.id.replace('-button', '');
            activateTab(tabId, tabButtons, tabContents);
        });
    });
    
    // Adicionar listeners para o botão de expandir/colapsar
    setupToggleButton();
    
    console.log("Sistema de abas inicializado com sucesso");
}

/**
 * Obtém o ID da aba ativa atualmente
 */
function getActiveTabId(tabButtons) {
    // Procurar botão com classe "active"
    const activeButton = Array.from(tabButtons).find(button => button.classList.contains('active'));
    
    if (activeButton) {
        return activeButton.id.replace('-button', '');
    }
    
    // Se não encontrar, usar o primeiro botão
    return tabButtons[0].id.replace('-button', '');
}

/**
 * Ativa uma aba específica
 */
function activateTab(tabId, tabButtons, tabContents) {
    console.log(`Ativando aba: ${tabId}`);
    
    // Remover classe active de todos os botões
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Adicionar classe active ao botão selecionado
    const selectedButton = document.getElementById(`${tabId}-button`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Esconder todos os conteúdos
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Mostrar apenas o conteúdo da aba selecionada
    const selectedContent = document.getElementById(`${tabId}-content`);
    if (selectedContent) {
        selectedContent.style.display = 'flex';
        selectedContent.classList.add('active');
        
        // Aplicar animação de entrada
        selectedContent.style.animation = 'none';
        setTimeout(() => {
            selectedContent.style.animation = 'fadeInUp 0.3s ease forwards';
        }, 10);
    }
}

/**
 * Configurar o botão de expandir/colapsar
 */
function setupToggleButton() {
    const toggleButton = document.getElementById('toggle-tabs-btn');
    if (!toggleButton) {
        console.warn("Botão de toggle não encontrado");
        return;
    }
    
    toggleButton.addEventListener('click', function() {
        const bottomTabsContainer = document.querySelector('.bottom-tabs-container');
        if (!bottomTabsContainer) return;
        
        const isMinimized = bottomTabsContainer.classList.contains('minimized');
        
        if (isMinimized) {
            // Expandir
            bottomTabsContainer.classList.remove('minimized');
            toggleButton.querySelector('span').textContent = '▼ Minimizar';
        } else {
            // Minimizar
            bottomTabsContainer.classList.add('minimized');
            toggleButton.querySelector('span').textContent = '▲ Expandir';
        }
    });
}

/**
 * Exportar função para uso externo
 */
window.FullscreenTabs = {
    init: initFullscreenTabs,
    activateTabById: function(tabId) {
        const tabButtons = document.querySelectorAll('.bottom-tab-button');
        const tabContents = document.querySelectorAll('.bottom-tab-content');
        activateTab(tabId, tabButtons, tabContents);
    }
};