/**
 * Este script corrige especificamente o problema da aba Relatório
 * mostrando o conteúdo errado (de restrições)
 */

(function() {
    // Executar quando o documento estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Inicializando correção específica para a aba Relatório...');
        
        // Verificar e corrigir periodicamente
        function checkAndFixReportTab() {
            // Seletor para botão da aba de relatório e seu conteúdo
            const reportButton = document.querySelector('.bottom-tab-btn[data-tab="bottom-report"]');
            const reportContent = document.getElementById('bottom-report-content');
            
            if (reportButton && reportContent) {
                // Adicionar um manipulador de evento específico
                reportButton.onclick = function(event) {
                    event.preventDefault();
                    
                    console.log('Botão da aba Relatório clicado - ativando.');
                    
                    // Remover classe active de todos os botões
                    document.querySelectorAll('.bottom-tab-btn').forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    
                    // Adicionar classe active a este botão
                    reportButton.classList.add('active');
                    
                    // Esconder todos os conteúdos
                    document.querySelectorAll('.bottom-tab-content').forEach(function(content) {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    });
                    
                    // Mostrar apenas o conteúdo do relatório
                    reportContent.classList.add('active');
                    reportContent.style.display = 'block';
                    reportContent.style.position = 'absolute';
                    reportContent.style.zIndex = '100';
                    
                    // Expandir o container se estiver minimizado
                    const tabsContainer = document.querySelector('.bottom-tabs-container');
                    if (tabsContainer && tabsContainer.classList.contains('minimized')) {
                        tabsContainer.classList.remove('minimized');
                    }
                    
                    console.log('Aba de Relatório ativada com sucesso');
                    
                    return false; // Impedir comportamento padrão
                };
                
                console.log('Manipulador especial adicionado ao botão da aba Relatório');
            } else {
                console.warn('Elementos da aba Relatório não encontrados, tentando novamente mais tarde...');
            }
        }
        
        // Executar a verificação várias vezes para garantir que os elementos sejam encontrados
        setTimeout(checkAndFixReportTab, 100);
        setTimeout(checkAndFixReportTab, 500);
        setTimeout(checkAndFixReportTab, 1000);
        setTimeout(checkAndFixReportTab, 2000);
        
        console.log('Inicialização da correção específica para a aba Relatório concluída');
    });
})();