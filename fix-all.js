/**
 * Correção completa para o site GitHub Pages
 * Este script corrige o problema das abas e atualiza os eventos de cidades
 */

// Configuração: quais correções aplicar
const config = {
    fixTabs: true,          // Corrigir problema das abas mostrando todas juntas
    updateCityEvents: true  // Atualizar eventos de cidades
};

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('[AutoFix] Iniciando correções automáticas...');
    
    // Tentar aplicar as correções imediatamente
    applyAllFixes();
    
    // Tentar novamente após um tempo para garantir
    setTimeout(applyAllFixes, 1000);
    setTimeout(applyAllFixes, 2000);
});

// Aplicar todas as correções configuradas
function applyAllFixes() {
    if (config.fixTabs) {
        console.log('[AutoFix] Aplicando correção para as abas...');
        fixBottomTabs();
    }
    
    if (config.updateCityEvents) {
        console.log('[AutoFix] Atualizando eventos de cidades...');
        updateCityEvents();
    }
}

// =======================================================
// CORREÇÃO DO PROBLEMA DAS ABAS MOSTRANDO TODAS JUNTAS
// =======================================================
function fixBottomTabs() {
    // Injetar CSS de emergência
    injectEmergencyCSS();
    
    // Corrigir o comportamento das abas
    fixTabsBehavior();
    
    // Adicionar verificação periódica
    setInterval(checkTabsVisibility, 1000);
}

// Injetar CSS de emergência para garantir que apenas uma aba seja mostrada
function injectEmergencyCSS() {
    // Verificar se o estilo já foi injetado
    if (document.getElementById('emergency-tab-fix')) {
        return;
    }
    
    const css = `
    /* CSS EMERGENCIAL - CORRIGE ABAS MOSTRANDO TODAS JUNTAS */
    .bottom-tab-content {
      display: none !important;
      visibility: hidden !important;
    }
    
    .bottom-tab-content.active-content {
      display: block !important;
      visibility: visible !important;
    }
    
    .bottom-tabs-container:not(.minimized) {
      display: flex !important;
      flex-direction: column !important;
    }
    
    .bottom-tabs-nav {
      flex-shrink: 0 !important;
    }
    
    .bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content {
      flex: 1 !important;
      height: calc(100vh - 60px) !important;
      width: 100% !important;
      overflow-y: auto !important;
    }
    `;
    
    const style = document.createElement('style');
    style.id = 'emergency-tab-fix';
    style.textContent = css;
    document.head.appendChild(style);
    
    console.log('[AutoFix] CSS de emergência injetado');
}

// Corrigir o comportamento das abas
function fixTabsBehavior() {
    // Esconder todas as abas primeiro
    const allContents = document.querySelectorAll('.bottom-tab-content');
    allContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active-content');
    });
    
    // Mostrar apenas a aba do botão ativo
    const activeButton = document.querySelector('.bottom-tab-btn.active');
    if (activeButton) {
        const tabId = activeButton.getAttribute('data-tab');
        const activeContent = document.getElementById(tabId + '-content');
        if (activeContent) {
            activeContent.style.display = 'block';
            activeContent.classList.add('active-content');
        }
    }
    
    // Reconfigurando os eventos de clique dos botões
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(btn => {
        // Pular se já processado
        if (btn.dataset.fixProcessed === 'true') return;
        
        // Marcar como processado
        btn.dataset.fixProcessed = 'true';
        
        // Clonar para remover eventos existentes
        const clone = btn.cloneNode(true);
        if (btn.parentNode) btn.parentNode.replaceChild(clone, btn);
        
        // Adicionar evento de clique
        clone.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Obter container e verificar estado
            const tabsContainer = document.querySelector('.bottom-tabs-container');
            const isActive = this.classList.contains('active');
            const isExpanded = !tabsContainer.classList.contains('minimized');
            
            // Se ativa e expandida, minimizar
            if (isActive && isExpanded) {
                minimizeTabs();
                return;
            }
            
            // Desativar todas as abas
            document.querySelectorAll('.bottom-tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Ativar esta aba
            this.classList.add('active');
            
            // Esconder todos os conteúdos
            document.querySelectorAll('.bottom-tab-content').forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active-content');
            });
            
            // Mostrar conteúdo desta aba
            const tabId = this.getAttribute('data-tab');
            const content = document.getElementById(tabId + '-content');
            if (content) {
                content.style.display = 'block';
                content.classList.add('active-content');
                
                // Aplicar estilos específicos quando expandido
                if (!isExpanded) {
                    setTimeout(() => {
                        content.style.height = 'calc(100vh - 60px)';
                        content.style.overflowY = 'auto';
                    }, 10);
                }
            }
            
            // Expandir se minimizado
            if (tabsContainer.classList.contains('minimized')) {
                expandTabs();
            }
        });
    });
}

// Verificar se há mais de uma aba visível e corrigir
function checkTabsVisibility() {
    const visibleTabs = Array.from(document.querySelectorAll('.bottom-tab-content')).filter(content => {
        const computedStyle = window.getComputedStyle(content);
        return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
    });
    
    if (visibleTabs.length > 1) {
        console.warn(`[AutoFix] Detectadas ${visibleTabs.length} abas visíveis! Corrigindo...`);
        fixTabsBehavior();
    }
}

// Função para minimizar as abas
function minimizeTabs() {
    const container = document.querySelector('.bottom-tabs-container');
    if (!container) return;
    
    console.log('[AutoFix] Minimizando abas');
    
    // Adicionar classe minimizada
    container.classList.add('minimized');
    
    // Aplicar estilos minimizados
    Object.assign(container.style, {
        position: 'absolute',
        top: 'auto',
        left: '380px',
        right: '0',
        bottom: '0',
        height: '60px',
        width: 'calc(100% - 380px)',
        zIndex: '100',
        backgroundColor: '#f9f9f9',
        borderLeft: 'none',
        boxShadow: 'none'
    });
    
    // Ajustar para telas menores
    if (window.innerWidth <= 768) {
        container.style.left = '320px';
        container.style.width = 'calc(100% - 320px)';
    }
    
    // Mostrar o mapa novamente
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.style.visibility = 'visible';
    }
    
    // Esconder todas as abas
    document.querySelectorAll('.bottom-tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active-content');
    });
    
    // Desativar todos os botões
    document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Função para expandir as abas
function expandTabs() {
    const container = document.querySelector('.bottom-tabs-container');
    if (!container) return;
    
    console.log('[AutoFix] Expandindo abas');
    
    // Remover classe minimizada
    container.classList.remove('minimized');
    
    // Aplicar estilos expandidos
    Object.assign(container.style, {
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
        container.style.left = '320px';
        container.style.width = 'calc(100% - 320px)';
    }
    
    // Ocultar o mapa
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.style.visibility = 'hidden';
    }
}

// =======================================================
// ATUALIZAÇÃO DE EVENTOS DE CIDADES
// =======================================================
function updateCityEvents() {
    // Eventos atualizados
    const updatedEvents = [
        // Atualizações para Piedade
        {
            city: "Piedade",
            event: "Aniversário da Cidade",
            eventType: "Feriado",
            importance: "Baixo",
            startDate: "20/05/2025",
            endDate: "20/05/2025",
            description: "Aniversário de fundação de Piedade em 20/05"
        },
        
        // Atualizações para Ribeirão Preto
        {
            city: "Ribeirão Preto",
            event: "Aniversário da Cidade",
            eventType: "Feriado",
            importance: "Baixo",
            startDate: "19/06/2025",
            endDate: "19/06/2025",
            description: "Aniversário de fundação de Ribeirão Preto em 19/06/1856"
        }
    ];

    // Verificar se a variável global de eventos existe
    if (typeof window.allCityEvents === 'undefined') {
        console.warn('[AutoFix] Variável global de eventos não encontrada, tentando novamente em 1s');
        setTimeout(updateCityEvents, 1000);
        return;
    }
    
    // Para cada evento na atualização
    updatedEvents.forEach(newEvent => {
        // Procurar se o evento já existe para a cidade
        const existingEventIndex = window.allCityEvents.findIndex(e => 
            e.city === newEvent.city && e.event === newEvent.event
        );
        
        if (existingEventIndex >= 0) {
            // Atualizar o evento existente
            console.log(`[AutoFix] Atualizando evento: ${newEvent.event} em ${newEvent.city} para data ${newEvent.startDate}`);
            window.allCityEvents[existingEventIndex] = newEvent;
        } else {
            // Adicionar o novo evento
            console.log(`[AutoFix] Adicionando novo evento: ${newEvent.event} em ${newEvent.city}`);
            window.allCityEvents.push(newEvent);
        }
    });
    
    console.log('[AutoFix] Atualização de eventos concluída, eventos disponíveis:', window.allCityEvents.length);
}

// Exportar funções para o escopo global
window.autoFix = {
    applyAll: applyAllFixes,
    fixTabs: fixBottomTabs,
    updateEvents: updateCityEvents
};

console.log('[AutoFix] Script de correção automática carregado');

// Executar imediatamente se o documento já estiver carregado
if (document.readyState !== 'loading') {
    console.log('[AutoFix] Documento já carregado, aplicando correções...');
    setTimeout(applyAllFixes, 100);
}