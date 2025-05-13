/**
 * Script para controle direto das abas
 * Esta é uma implementação simplificada que evita problemas de sobreposição
 */

// Função para controlar as abas
function showTab(tabName) {
    console.log('Mostrando aba:', tabName);
    
    // Primeiro, esconder todos os conteúdos das abas
    var allContents = document.querySelectorAll('.bottom-tab-content');
    allContents.forEach(function(content) {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Depois, mostrar apenas o conteúdo da aba selecionada
    var selectedContent = document.getElementById(tabName + '-content');
    if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');
        console.log('Ativado conteúdo:', tabName + '-content');
    } else {
        console.error('Conteúdo não encontrado para aba:', tabName);
    }
    
    // Atualizar classes ativas nos botões
    var allButtons = document.querySelectorAll('.bottom-tab-btn');
    allButtons.forEach(function(button) {
        button.classList.remove('active');
        
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        }
    });
    
    // Expandir o container se estiver minimizado
    var tabsContainer = document.querySelector('.bottom-tabs-container');
    if (tabsContainer && tabsContainer.classList.contains('minimized')) {
        tabsContainer.classList.remove('minimized');
    }
}

// Configurar os eventos e inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de abas direto...');

    // Primeiro, garantir que a aba de eventos esteja ativa na inicialização
    setTimeout(function() {
        showTab('bottom-events');
    }, 100);
    
    // Configurar os botões das abas
    var tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(function(button) {
        const tabId = button.getAttribute('data-tab');
        
        // Adicionar evento de clique direto
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showTab(tabId);
        });
    });
    
    // Modificar o comportamento do botão de otimizar
    var optimizeButton = document.getElementById('optimize-route');
    if (optimizeButton) {
        // Salvar o handler original
        var originalHandler = optimizeButton.onclick;
        
        // Adicionar nosso próprio handler
        optimizeButton.addEventListener('click', function() {
            console.log('Botão de otimização clicado, agendando navegação para aba de relatório...');
            
            // Agendar a navegação para a aba de relatório após a otimização
            setTimeout(function() {
                showTab('bottom-report');
            }, 2000);
        });
    }
});

// Evento para notificar sobre a otimização da rota
window.addEventListener('route-optimized', function() {
    console.log('Evento de rota otimizada recebido, navegando para aba de relatório...');
    showTab('bottom-report');
});