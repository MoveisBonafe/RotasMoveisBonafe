/**
 * Controlador de abas simples e robusto
 * Esta é uma abordagem direta que evita problemas de sobreposição
 */

// Função simplificada para controlar as abas
function showTab(tabContentId) {
    console.log('Mostrando aba:', tabContentId);
    
    // Esconder todos os conteúdos de abas
    var allTabContents = document.querySelectorAll('.bottom-tab-content');
    allTabContents.forEach(function(content) {
        content.style.display = 'none';
        content.classList.remove('active');
        content.style.visibility = 'hidden';
        content.style.opacity = '0';
    });
    
    // Mostrar o conteúdo da aba selecionada
    var selectedContent = document.getElementById(tabContentId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');
        selectedContent.style.visibility = 'visible';
        selectedContent.style.opacity = '1';
        selectedContent.style.zIndex = '100';
        console.log('Ativada aba:', tabContentId);
    } else {
        console.error('Conteúdo não encontrado para aba:', tabContentId);
    }
    
    // Atualizar classes ativas nos botões
    var allTabButtons = document.querySelectorAll('.bottom-tab-btn');
    allTabButtons.forEach(function(button) {
        button.classList.remove('active');
        
        // Adicionar classe active ao botão correspondente
        if (button.getAttribute('data-tab') === tabContentId.replace('-content', '')) {
            button.classList.add('active');
        }
    });
    
    // Expandir o container se estiver minimizado
    var tabsContainer = document.querySelector('.bottom-tabs-container');
    if (tabsContainer && tabsContainer.classList.contains('minimized')) {
        tabsContainer.classList.remove('minimized');
    }
}

// Adicionar cliques personalizados a todos os botões de aba
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando controlador de abas...');
    
    // Substituir o comportamento dos botões de aba
    var tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(function(button) {
        const tabId = button.getAttribute('data-tab');
        const contentId = tabId + '-content';
        
        // Remover manipuladores existentes clonando o botão
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
            
            // Adicionar o novo manipulador
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                showTab(contentId);
            });
            
            console.log('Manipulador adicionado para aba:', tabId);
        }
    });
    
    // Correção para o botão "Otimizar Rota"
    var optimizeButton = document.getElementById('optimize-route');
    if (optimizeButton) {
        // Adicionar manipulador para o clique em "Otimizar Rota"
        optimizeButton.addEventListener('click', function() {
            // Agendar a navegação para a aba de relatório após a otimização
            setTimeout(function() {
                console.log('Otimização concluída, navegando para aba de relatório...');
                showTab('bottom-report-content');
            }, 2000);
        });
        
        console.log('Manipulador adicionado para o botão Otimizar Rota');
    }
    
    // Garantir que a exibição inicial esteja correta
    setTimeout(function() {
        // Verificar qual aba está ativa inicialmente
        var activeButton = document.querySelector('.bottom-tab-btn.active');
        if (activeButton) {
            var tabId = activeButton.getAttribute('data-tab');
            showTab(tabId + '-content');
        } else {
            // Se nenhuma aba estiver ativa, ativar a primeira
            var firstButton = document.querySelector('.bottom-tab-btn');
            if (firstButton) {
                var tabId = firstButton.getAttribute('data-tab');
                showTab(tabId + '-content');
            }
        }
    }, 100);
});

// Definir evento personalizado para notificar sobre otimização de rota
window.addEventListener('route-optimized', function() {
    console.log('Evento de rota otimizada recebido, navegando para aba de relatório...');
    showTab('bottom-report-content');
});