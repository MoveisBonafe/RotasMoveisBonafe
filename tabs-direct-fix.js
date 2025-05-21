/**
 * CORREÇÃO DE EMERGÊNCIA PARA AS ABAS
 * Este script força apenas uma aba visível por vez usando
 * técnicas mais avançadas de manipulação DOM
 */
(function() {
    // Executar imediatamente após o carregamento
    window.addEventListener('load', function() {
        console.log('[DIRECT-FIX] Carregando correção de emergência para abas');
        setTimeout(applyEmergencyFix, 200);
        
        // Repetir a verificação várias vezes após o carregamento
        setTimeout(applyEmergencyFix, 500);
        setTimeout(applyEmergencyFix, 1000);
        setTimeout(applyEmergencyFix, 2000);
        
        // Verificar periodicamente
        setInterval(applyEmergencyFix, 2500);
    });
    
    function applyEmergencyFix() {
        console.log('[DIRECT-FIX] Aplicando correção nas abas');
        
        // 1. FORÇAR CSS CRÍTICO
        injectCriticalCSS();
        
        // 2. MANIPULAR AS ABAS DIRETAMENTE
        const tabContents = document.querySelectorAll('.bottom-tab-content');
        
        // Verificar se há mais de um conteúdo visível
        let visibleCount = 0;
        let lastVisibleContent = null;
        
        tabContents.forEach(content => {
            // Verificar se está visível (tanto pelo estilo inline quanto pelo CSS computado)
            const display = window.getComputedStyle(content).display;
            if (display !== 'none') {
                visibleCount++;
                lastVisibleContent = content;
                console.log('[DIRECT-FIX] Conteúdo visível encontrado:', content.id);
            }
        });
        
        console.log('[DIRECT-FIX] Total de conteúdos visíveis:', visibleCount);
        
        // Se houver mais de um conteúdo visível, esconder todos exceto o último
        if (visibleCount > 1) {
            console.warn('[DIRECT-FIX] Múltiplos conteúdos visíveis detectados! Corrigindo...');
            
            // Esconder todos os conteúdos
            tabContents.forEach(content => {
                content.style.cssText = 'display: none !important; opacity: 0 !important;';
                content.classList.remove('active-content');
                // Remover todas as classes que possam interferir
                content.className = 'bottom-tab-content';
            });
            
            // Se encontramos algum conteúdo visível, mostrar apenas o último
            if (lastVisibleContent) {
                console.log('[DIRECT-FIX] Mantendo apenas o último conteúdo visível:', lastVisibleContent.id);
                lastVisibleContent.style.cssText = 'display: block !important; opacity: 1 !important;';
                lastVisibleContent.classList.add('active-content');
                
                // Identificar e ativar o botão correspondente
                const tabId = lastVisibleContent.id.replace('-content', '');
                const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
                if (tabButton) {
                    // Remover classe ativa de todos os botões
                    document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    // Adicionar classe ativa ao botão correto
                    tabButton.classList.add('active');
                }
            } else {
                // Se não conseguimos identificar nenhum conteúdo, esconder todos
                console.warn('[DIRECT-FIX] Nenhum conteúdo identificado como principal. Escondendo todos.');
            }
        }
        
        // 3. SUBSTITUIR HANDLERS DE EVENTOS DOS BOTÕES
        replaceButtonHandlers();
    }
    
    function injectCriticalCSS() {
        // Verificar se o estilo já foi injetado
        if (document.getElementById('emergency-tabs-css')) {
            return;
        }
        
        const css = `
            /* CSS DE EMERGÊNCIA PARA CORREÇÃO DAS ABAS */
            .bottom-tab-content {
                display: none !important;
                position: absolute !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            
            .bottom-tab-content.active-content {
                display: block !important;
                position: relative !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            /* Garantir que apenas o conteúdo correto seja visível */
            .bottom-tabs-container:not(.minimized) {
                display: flex !important;
                flex-direction: column !important;
            }
            
            .bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content {
                flex: 1 !important;
                width: 100% !important;
                height: calc(100vh - 60px) !important;
                overflow-y: auto !important;
                padding: 15px !important;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'emergency-tabs-css';
        style.textContent = css;
        document.head.appendChild(style);
        console.log('[DIRECT-FIX] CSS crítico injetado');
    }
    
    function replaceButtonHandlers() {
        // Obter todos os botões de aba
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        
        tabButtons.forEach(button => {
            // Verificar se já aplicamos nosso handler
            if (button.dataset.fixApplied) {
                return;
            }
            
            // Marcar o botão como processado
            button.dataset.fixApplied = 'true';
            
            // Clonar o botão para remover todos os eventos
            const clone = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(clone, button);
            }
            
            // Adicionar novo handler de evento
            clone.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[DIRECT-FIX] Clique em botão de aba interceptado:', this.getAttribute('data-tab'));
                
                // Desativar todos os botões
                document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Ativar este botão
                this.classList.add('active');
                
                // Obter o ID da aba
                const tabId = this.getAttribute('data-tab');
                const targetContent = document.getElementById(tabId + '-content');
                
                // Esconder todos os conteúdos
                document.querySelectorAll('.bottom-tab-content').forEach(content => {
                    content.style.cssText = 'display: none !important; opacity: 0 !important;';
                    content.classList.remove('active-content');
                });
                
                // Mostrar apenas o conteúdo alvo
                if (targetContent) {
                    targetContent.style.cssText = 'display: block !important; opacity: 1 !important;';
                    targetContent.classList.add('active-content');
                    console.log('[DIRECT-FIX] Conteúdo ativado:', tabId + '-content');
                }
                
                // Expandir as abas se estiverem minimizadas
                const tabsContainer = document.querySelector('.bottom-tabs-container');
                if (tabsContainer && tabsContainer.classList.contains('minimized')) {
                    expandTabs();
                }
            });
        });
        
        console.log('[DIRECT-FIX] Handlers de botões substituídos');
    }
    
    function expandTabs() {
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (!tabsContainer) return;
        
        // Remover classe para minimizado
        tabsContainer.classList.remove('minimized');
        
        // Aplicar estilos de tela cheia
        Object.assign(tabsContainer.style, {
            position: 'fixed',
            top: '0',
            left: '380px',
            right: '0',
            bottom: '0',
            width: 'calc(100% - 380px)',
            height: '100vh',
            zIndex: '9999',
            backgroundColor: 'white',
            borderLeft: '3px solid #ffc107',
            boxShadow: '0 0 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
        });
        
        // Ajustar para telas menores
        if (window.innerWidth <= 768) {
            tabsContainer.style.left = '320px';
            tabsContainer.style.width = 'calc(100% - 320px)';
        }
        
        // Ocultar o mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    }
    
    // Injetar o script imediatamente
    console.log('[DIRECT-FIX] Script de correção de emergência carregado');
})();