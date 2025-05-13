/**
 * Script para corrigir problemas com as abas inferiores
 * Este script deve ser incluído em todos os arquivos HTML que usam o sistema de abas
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Iniciando correções para o sistema de abas...");
    
    // Função para garantir que apenas uma aba esteja visível por vez
    function fixTabsDisplay() {
        // Selecionar todas as abas
        const allTabs = document.querySelectorAll('.bottom-tab-content');
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        
        // Primeiro esconder todas as abas
        allTabs.forEach(tab => {
            tab.style.display = 'none';
            tab.style.position = 'static';
            tab.style.zIndex = 'auto';
            tab.classList.remove('active');
        });
        
        // Encontrar o botão ativo
        const activeButton = document.querySelector('.bottom-tab-btn.active');
        
        if (activeButton) {
            // Obter o id da aba que deve ser exibida
            const tabId = activeButton.getAttribute('data-tab');
            const contentId = tabId + '-content';
            
            // Mostrar apenas a aba correspondente ao botão ativo
            const activeContent = document.getElementById(contentId);
            if (activeContent) {
                activeContent.style.display = 'block';
                activeContent.classList.add('active');
                console.log("Aba ativada:", contentId);
            } else {
                console.error("Conteúdo de aba não encontrado:", contentId);
            }
        } else {
            // Se nenhum botão estiver ativo, ativar o primeiro por padrão
            if (tabButtons.length > 0) {
                tabButtons[0].classList.add('active');
                const firstTabId = tabButtons[0].getAttribute('data-tab') + '-content';
                const firstTabContent = document.getElementById(firstTabId);
                if (firstTabContent) {
                    firstTabContent.style.display = 'block';
                    firstTabContent.classList.add('active');
                    console.log("Primeira aba ativada por padrão:", firstTabId);
                }
            }
        }
    }
    
    // Aplicar correção de exibição de abas ao carregar a página
    fixTabsDisplay();
    
    // Adicionar ouvintes de eventos para os botões das abas
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover a classe active de todos os botões
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar a classe active ao botão clicado
            this.classList.add('active');
            
            // Atualizar a exibição das abas
            fixTabsDisplay();
        });
    });
    
    console.log("Sistema de correção de abas inicializado com sucesso!");
});