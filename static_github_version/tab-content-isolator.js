/**
 * Tab Content Isolator - Solução final para o problema de sobreposição das abas
 * 
 * Este script soluciona completamente o problema de sobreposição de conteúdo entre 
 * as diferentes abas, garantindo isolamento total entre os conteúdos.
 */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Tab Content Isolator: Inicializando...');
        
        // Mapeamento explícito entre botões de aba e seus conteúdos
        const tabMapping = {
            'bottom-events': 'bottom-events-content',
            'bottom-restrictions': 'bottom-restrictions-content',
            'bottom-report': 'bottom-report-content'
        };

        // Informações sobre as abas para diagnóstico
        const tabInfo = {
            'bottom-events': 'Eventos na Rota',
            'bottom-restrictions': 'Restrições de Tráfego',
            'bottom-report': 'Relatório da Rota'
        };
        
        // Função para forçar o isolamento do conteúdo de cada aba
        function isolateTabContent() {
            // Obter todos os conteúdos de aba e botões
            const allTabContents = document.querySelectorAll('.bottom-tab-content');
            const allTabButtons = document.querySelectorAll('.bottom-tab-btn');
            
            // Primeira etapa: esconder TODOS os conteúdos e remover todas as classes ativas
            allTabContents.forEach(function(content) {
                content.classList.remove('active');
                content.style.display = 'none';
                content.style.visibility = 'hidden'; // Garante que não há sobreposição
                content.style.opacity = '0';
                content.style.position = 'absolute';
                content.style.zIndex = '1';
            });
            
            // Segunda etapa: verificar qual aba está ativa no momento
            let activeTabId = null;
            allTabButtons.forEach(function(button) {
                if (button.classList.contains('active')) {
                    activeTabId = button.getAttribute('data-tab');
                }
            });
            
            // Terceira etapa: se uma aba estiver ativa, mostrar APENAS seu conteúdo
            if (activeTabId && tabMapping[activeTabId]) {
                const activeContentId = tabMapping[activeTabId];
                const activeContent = document.getElementById(activeContentId);
                
                if (activeContent) {
                    console.log('Ativando conteúdo:', tabInfo[activeTabId], '(ID:', activeContentId, ')');
                    
                    // Tornar visível apenas o conteúdo ativo
                    activeContent.classList.add('active');
                    activeContent.style.display = 'block';
                    activeContent.style.visibility = 'visible';
                    activeContent.style.opacity = '1';
                    activeContent.style.position = 'absolute';
                    activeContent.style.zIndex = '100';
                    
                    // Remover estilos indesejados que possam ter sido adicionados
                    activeContent.style.removeProperty('left');
                    activeContent.style.removeProperty('top');
                    activeContent.style.width = '100%';
                    activeContent.style.height = 'auto';
                } else {
                    console.error('ERRO: Conteúdo não encontrado para a aba ativa:', activeTabId, 'ID esperado:', activeContentId);
                }
            } else {
                console.warn('Nenhuma aba ativa encontrada ou mapeamento incorreto');
            }
        }
        
        // Função para sobrepor o comportamento padrão de clique nas abas
        function overrideTabBehavior() {
            const bottomTabButtons = document.querySelectorAll('.bottom-tab-btn');
            
            bottomTabButtons.forEach(function(button) {
                // Clonar o botão para remover todos os event listeners existentes
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Adicionar nosso próprio event listener
                newButton.addEventListener('click', function(event) {
                    // Evitar o comportamento padrão
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const tabId = this.getAttribute('data-tab');
                    console.log('Clique em aba interceptado:', tabInfo[tabId]);
                    
                    // Desativar todos os botões de aba
                    document.querySelectorAll('.bottom-tab-btn').forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    
                    // Ativar este botão
                    this.classList.add('active');
                    
                    // Verificar se o container está minimizado
                    const tabsContainer = document.querySelector('.bottom-tabs-container');
                    if (tabsContainer && tabsContainer.classList.contains('minimized')) {
                        tabsContainer.classList.remove('minimized');
                    }
                    
                    // Executar a função de isolamento com um pequeno atraso
                    // para garantir que todas as mudanças de DOM foram aplicadas
                    setTimeout(isolateTabContent, 10);
                }, true); // Capture phase para garantir que nosso handler é executado primeiro
                
                console.log('Comportamento sobreposto para aba:', tabInfo[button.getAttribute('data-tab')]);
            });
        }
        
        // Aplicar isolamento quando a rota for otimizada
        function handleRouteOptimization() {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.target.id === 'route-info') {
                        console.log('Detectada atualização da rota, reaplicando isolamento de abas...');
                        
                        // Re-aplicar as correções após um curto atraso
                        setTimeout(function() {
                            overrideTabBehavior();
                            isolateTabContent();
                        }, 500);
                    }
                });
            });
            
            // Observar o elemento que contém as informações da rota
            const routeInfo = document.getElementById('route-info');
            if (routeInfo) {
                observer.observe(routeInfo, { childList: true, subtree: true });
            }
            
            // Também observar eventos do botão de otimizar
            const optimizeButton = document.getElementById('optimize-route');
            if (optimizeButton) {
                optimizeButton.addEventListener('click', function() {
                    console.log('Botão de otimização clicado, preparando-se para re-aplicar isolamento...');
                    setTimeout(function() {
                        overrideTabBehavior();
                        isolateTabContent();
                    }, 2000); // Espera mais longa para dar tempo à otimização
                });
            }
        }
        
        // Função para monitorar mudanças nas abas
        function watchTabStateChanges() {
            const observer = new MutationObserver(function(mutations) {
                let needsIsolation = false;
                
                mutations.forEach(function(mutation) {
                    // Se houver mudanças nos atributos class ou style
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                        
                        // Verificar se a mudança foi em um botão de aba ou conteúdo
                        if (mutation.target.classList.contains('bottom-tab-btn') || 
                            mutation.target.classList.contains('bottom-tab-content')) {
                            needsIsolation = true;
                        }
                    }
                    
                    // Se houver mudanças na estrutura DOM
                    if (mutation.type === 'childList' && 
                        (mutation.target.classList.contains('bottom-tabs-container') || 
                         mutation.target.classList.contains('bottom-tabs-content-container'))) {
                        needsIsolation = true;
                    }
                });
                
                if (needsIsolation) {
                    console.log('Detectada mudança nas abas, reaplicando isolamento...');
                    isolateTabContent();
                }
            });
            
            // Observar o container de abas
            const tabsContainer = document.querySelector('.bottom-tabs-container');
            if (tabsContainer) {
                observer.observe(tabsContainer, { 
                    childList: true, 
                    subtree: true, 
                    attributes: true, 
                    attributeFilter: ['class', 'style'] 
                });
            }
        }
        
        // Inicialização - aplicar todas as medidas corretivas
        function init() {
            console.log('Tab Content Isolator: Aplicando correções...');
            
            // Aplicar isolamento inicial
            overrideTabBehavior();
            isolateTabContent();
            
            // Configurar monitoramento
            handleRouteOptimization();
            watchTabStateChanges();
            
            // Aplicar isolamento periodicamente para garantir a correção
            setInterval(isolateTabContent, 2000);
            
            console.log('Tab Content Isolator: Todas as correções aplicadas com sucesso!');
        }
        
        // Executar inicialização com um atraso para garantir que a página está totalmente carregada
        setTimeout(init, 500);
    });
})();