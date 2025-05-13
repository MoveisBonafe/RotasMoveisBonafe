/**
 * Script dedicado para corrigir as abas no GitHub Pages
 * Este script garante que apenas uma aba esteja visível por vez
 * e resolve o problema de sobreposição de conteúdo
 */

// Executar após carregar a página completamente
window.addEventListener('load', function() {
    console.log('Iniciando correção das abas para GitHub Pages...');
    
    // Mapeamento correto das abas para os IDs de conteúdo
    // Este mapeamento é crucial para resolver o problema das abas mostrando conteúdo errado
    const tabsContentMapping = {
        'bottom-events': 'bottom-events-content',
        'bottom-restrictions': 'bottom-restrictions-content',
        'bottom-report': 'bottom-report-content'
    };
    
    // Função para forçar uma única aba visível
    function forceTabsReset() {
        console.log('Forçando reset de todas as abas...');
        
        // Primeiro, esconder TODOS os conteúdos de abas
        const allContents = document.querySelectorAll('.bottom-tab-content');
        allContents.forEach(content => {
            // Remover todas as classes active
            content.classList.remove('active');
            // Ocultar explicitamente com o estilo
            content.style.display = 'none';
            // Garantir posicionamento correto
            content.style.position = 'absolute';
            content.style.zIndex = '1';
        });
        
        // Depois, mostrar APENAS o conteúdo da aba ativa
        const activeTab = document.querySelector('.bottom-tab-btn.active');
        if (activeTab) {
            // ID da aba ativa
            const tabId = activeTab.getAttribute('data-tab');
            // ID do conteúdo correspondente usando o mapeamento 
            const contentId = tabsContentMapping[tabId] || (tabId + '-content');
            // Elemento de conteúdo
            const activeContent = document.getElementById(contentId);
            
            if (activeContent) {
                // Tornar visível
                activeContent.classList.add('active');
                activeContent.style.display = 'block';
                activeContent.style.zIndex = '10';
                console.log('Ativando apenas a aba:', contentId);
            } else {
                console.error('Conteúdo não encontrado para aba:', tabId);
            }
        } else {
            // Se não houver aba ativa, ativar a primeira
            const firstTab = document.querySelector('.bottom-tab-btn');
            if (firstTab) {
                firstTab.classList.add('active');
                const firstTabId = firstTab.getAttribute('data-tab');
                const firstContent = document.getElementById(firstTabId + '-content');
                if (firstContent) {
                    firstContent.classList.add('active');
                    firstContent.style.display = 'block';
                    firstContent.style.zIndex = '10';
                    console.log('Ativando a primeira aba por padrão');
                }
            }
        }
    }
    
    // Chamar a função imediatamente para garantir estado inicial correto
    forceTabsReset();
    
    // Substituir os manipuladores de eventos existentes para os botões das abas
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(button => {
        // Remover eventos existentes (clone do elemento)
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo manipulador de evento
        newButton.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Desativar todos os botões
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Ativar este botão
            this.classList.add('active');
            
            // Expandir o container se estiver minimizado
            const tabsContainer = document.querySelector('.bottom-tabs-container');
            if (tabsContainer && tabsContainer.classList.contains('minimized')) {
                tabsContainer.classList.remove('minimized');
            }
            
            // Forçar reset das abas para garantir que apenas uma esteja visível
            forceTabsReset();
        });
    });
    
    // Adicionar manipulador para o botão de toggle (se existir)
    const toggleButton = document.querySelector('.bottom-tabs-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const container = document.querySelector('.bottom-tabs-container');
            if (container) {
                container.classList.toggle('minimized');
            }
        });
    }
    
    // Observador de mudanças para corrigir dinamicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                // Verificar se foi uma mudança em um conteúdo de aba
                if (mutation.target.classList.contains('bottom-tab-content')) {
                    console.log('Detectada mudança em conteúdo de aba, corrigindo...');
                    // Agendar correção após um pequeno atraso
                    setTimeout(forceTabsReset, 50);
                }
            }
        });
    });
    
    // Observar mudanças em todos os conteúdos de abas
    const tabContents = document.querySelectorAll('.bottom-tab-content');
    tabContents.forEach(content => {
        observer.observe(content, { attributes: true });
    });
    
    console.log('Sistema de correção das abas para GitHub Pages inicializado.');
});