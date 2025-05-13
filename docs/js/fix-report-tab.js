/**
 * Script específico para corrigir o problema da aba de Relatório
 * Este script garante que a aba de Relatório mostre o conteúdo correto
 * e não o conteúdo da aba de Restrições
 */

(function() {
    // Executar quando o documento estiver completamente carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Inicializando correção específica para a aba de Relatório...');
        
        // Função para corrigir o problema da aba de relatório
        function fixReportTab() {
            console.log('Aplicando correção para a aba de Relatório...');
            
            // Encontrar todos os botões das abas
            const allTabButtons = document.querySelectorAll('.bottom-tab-btn');
            
            // Remover todos os event listeners existentes do botão da aba de relatório
            const reportButton = document.querySelector('.bottom-tab-btn[data-tab="bottom-report"]');
            if (reportButton) {
                // Clonar o botão para remover todos os event listeners
                const newReportButton = reportButton.cloneNode(true);
                if (reportButton.parentNode) {
                    reportButton.parentNode.replaceChild(newReportButton, reportButton);
                    
                    // Adicionar um novo event listener dedicado
                    newReportButton.addEventListener('click', function(event) {
                        // Prevenir comportamento padrão
                        event.preventDefault();
                        event.stopPropagation();
                        
                        console.log('Aba de Relatório clicada - aplicando correção específica');
                        
                        // Remover classe active de todos os botões de abas
                        allTabButtons.forEach(function(btn) {
                            btn.classList.remove('active');
                        });
                        
                        // Adicionar classe active a este botão
                        newReportButton.classList.add('active');
                        
                        // Ocultar todos os conteúdos de abas
                        const allContents = document.querySelectorAll('.bottom-tab-content');
                        allContents.forEach(function(content) {
                            content.classList.remove('active');
                            content.style.display = 'none';
                        });
                        
                        // Mostrar apenas o conteúdo do relatório
                        const reportContent = document.getElementById('bottom-report-content');
                        if (reportContent) {
                            reportContent.classList.add('active');
                            reportContent.style.display = 'block';
                            reportContent.style.position = 'absolute';
                            reportContent.style.zIndex = '100';
                            
                            console.log('Conteúdo da aba de Relatório exibido com sucesso');
                        } else {
                            console.error('Conteúdo da aba de Relatório não encontrado!');
                        }
                        
                        // Expandir o container se estiver minimizado
                        const tabsContainer = document.querySelector('.bottom-tabs-container');
                        if (tabsContainer && tabsContainer.classList.contains('minimized')) {
                            tabsContainer.classList.remove('minimized');
                        }
                    });
                    
                    console.log('Event listener específico adicionado à aba de Relatório');
                }
            } else {
                console.warn('Botão da aba de Relatório não encontrado!');
            }
        }
        
        // Aplicar a correção agora e também após 1 segundo para garantir
        // que os elementos da página foram completamente carregados
        setTimeout(fixReportTab, 100);
        setTimeout(fixReportTab, 1000);
        
        // Observar alterações no DOM para re-aplicar a correção quando necessário
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    // Se houver mudanças no conteúdo da aba ou nas classes/atributos,
                    // verificar se a correção precisa ser reaplicada
                    const reportButton = document.querySelector('.bottom-tab-btn[data-tab="bottom-report"]');
                    if (reportButton && !reportButton.hasAttribute('fixed-by-script')) {
                        console.log('Detectada mudança no DOM que afeta a aba de Relatório, reaplicando correção...');
                        fixReportTab();
                    }
                }
            });
        });
        
        // Observar todo o documento para alterações que possam afetar as abas
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'data-tab']
        });
        
        console.log('Sistema de correção da aba de Relatório inicializado');
    });
    
    // Aplicar a correção quando a otimização de rota for concluída
    window.addEventListener('route-optimized', function() {
        console.log('Evento de rota otimizada detectado, aplicando correção para a aba de Relatório...');
        
        // Garantir que a aba de relatório esteja funcionando corretamente após a otimização da rota
        setTimeout(function() {
            const reportTabButton = document.querySelector('.bottom-tab-btn[data-tab="bottom-report"]');
            if (reportTabButton) {
                reportTabButton.click();
            }
        }, 500);
    });
})();