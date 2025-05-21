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
    console.log("Substituindo o sistema de abas original...");
    
    // Substituir completamente o sistema de abas original
    setupTabs();
    
    // Configurar o sistema de expansão/colapso
    setupToggleButton();
    
    console.log("Sistema de abas em tela cheia inicializado");
}

/**
 * Configura o novo sistema de abas
 */
function setupTabs() {
    // Encontrar os containers de abas
    const bottomTabsContainer = document.querySelector('.bottom-tabs-container');
    if (!bottomTabsContainer) {
        console.warn("Container de abas inferiores não encontrado");
        return;
    }
    
    // Encontrar os botões de abas e conteúdos (usando os seletores corretos)
    const tabButtons = bottomTabsContainer.querySelectorAll('.bottom-tab-button');
    const tabContents = bottomTabsContainer.querySelectorAll('.bottom-tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.warn(`Elementos de abas não encontrados: ${tabButtons.length} botões, ${tabContents.length} conteúdos`);
        return;
    }
    
    console.log(`Sistema encontrou ${tabButtons.length} botões e ${tabContents.length} conteúdos de abas`);
    
    // Esconder todos os conteúdos inicialmente
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Mostrar o conteúdo da primeira aba por padrão
    if (tabContents[0]) {
        tabContents[0].style.display = 'block';
        tabContents[0].classList.add('active');
    }
    
    if (tabButtons[0]) {
        tabButtons[0].classList.add('active');
    }
    
    // Adicionar event listeners para os botões das abas
    tabButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // Prevenir comportamento padrão (importante para GitHub Pages)
            event.preventDefault();
            
            // Identificar qual aba foi clicada
            const buttonId = this.id;
            const targetId = buttonId.replace('-button', '-content');
            
            console.log(`Botão de aba clicado: ${buttonId}, conteúdo alvo: ${targetId}`);
            
            // Desativar todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });
            
            // Ativar o botão e conteúdo clicados
            this.classList.add('active');
            
            // Encontrar e ativar o conteúdo correspondente
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.style.display = 'flex'; // Usando flex para compatibilidade com o layout existente
                targetContent.classList.add('active');
                
                // Adicionar animação
                targetContent.style.animation = 'none';
                setTimeout(() => {
                    targetContent.style.animation = 'fadeInUp 0.3s ease-out';
                }, 10);
                
                console.log(`Ativado conteúdo: ${targetId}`);
            } else {
                console.warn(`Conteúdo de destino não encontrado: ${targetId}`);
            }
        });
    });
    
    console.log("Listeners para abas configurados com sucesso");
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