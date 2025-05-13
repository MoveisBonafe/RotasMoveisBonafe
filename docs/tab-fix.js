/**
 * Script de correção específico para as abas inferiores
 * Este script é uma solução independente para garantir 
 * o comportamento correto das abas em todas as situações
 */

(function() {
    // Executar após o DOM estar completamente carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Iniciando correção das abas inferiores...');
        
        // Elementos das abas
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        const tabContents = document.querySelectorAll('.bottom-tab-content');
        
        // Função para alternar entre abas
        function switchTab(tabId) {
            console.log('Alternando para aba:', tabId);
            
            // Desativar todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Ativar botão e conteúdo correspondente
            const activeButton = document.querySelector(`.bottom-tab-btn[data-tab="${tabId}"]`);
            const activeContent = document.getElementById(`${tabId}-content`);
            
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            if (activeContent) {
                activeContent.classList.add('active');
                activeContent.style.display = 'block';
            }
        }
        
        // Adicionar evento de clique em cada botão
        tabButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const tabId = this.getAttribute('data-tab');
                
                // Se já estiver na mesma aba e expandido, apenas minimiza
                const isCurrentlyActive = this.classList.contains('active');
                const tabsContainer = document.querySelector('.bottom-tabs-container');
                const isExpanded = !tabsContainer.classList.contains('minimized');
                
                if (isCurrentlyActive && isExpanded) {
                    // Minimize
                    tabsContainer.classList.add('minimized');
                    return;
                }
                
                // Se estiver minimizado, expande primeiro
                if (tabsContainer.classList.contains('minimized')) {
                    tabsContainer.classList.remove('minimized');
                }
                
                // Troca para a aba selecionada
                switchTab(tabId);
            });
        });
        
        // Garantir que uma aba esteja sempre ativa
        function ensureActiveTab() {
            const hasActiveBtn = document.querySelector('.bottom-tab-btn.active');
            
            if (!hasActiveBtn && tabButtons.length > 0) {
                const firstTabId = tabButtons[0].getAttribute('data-tab');
                switchTab(firstTabId);
            }
        }
        
        // Inicializar: garante que temos uma aba ativa
        ensureActiveTab();
        
        // Aplicar estilo de rolagem independente para cada conteúdo
        tabContents.forEach(content => {
            content.style.overflow = 'auto';
            content.style.maxHeight = 'calc(60vh - 60px)';
            content.style.position = 'absolute';
            content.style.top = '0';
            content.style.left = '0';
            content.style.right = '0';
            content.style.bottom = '0';
            content.style.background = 'white';
            content.style.padding = '15px';
        });
        
        console.log('Correção das abas concluída!');
    });
})();