/**
 * Correção direta para problemas no GitHub Pages
 * Este script aplica uma solução simples e robusta para os problemas com abas e eventos
 */

// Executar assim que a página carregar completamente
window.addEventListener('load', function() {
    console.log("🔧 Aplicando correção direta para GitHub Pages");
    setTimeout(applyDirectFix, 2000);
});

/**
 * Aplica a correção direta para os problemas
 */
function applyDirectFix() {
    // 1. Corrigir o problema das abas (forçando a exibição de apenas uma por vez)
    fixTabs();
    
    // 2. Adicionar eventos para cidades (direto e simples)
    addEvents();
}

/**
 * Corrige o problema das abas inferiores
 */
function fixTabs() {
    console.log("🔧 Iniciando correção direta para abas inferiores");
    
    // Encontrar os elementos principais
    const tabs = document.querySelectorAll('.bottom-tab-btn');
    const contents = [
        document.getElementById('bottom-events-content'),
        document.getElementById('bottom-restrictions-content'),
        document.getElementById('bottom-report-content')
    ];
    
    // Verificar se encontramos os elementos
    if (!tabs.length || !contents.every(c => c)) {
        console.warn("❌ Elementos de abas não encontrados!");
        return;
    }
    
    // Primeiro esconder todos os conteúdos
    contents.forEach(content => {
        if (content) {
            content.style.display = 'none';
        }
    });
    
    // Mostrar apenas o primeiro conteúdo (eventos)
    if (contents[0]) {
        contents[0].style.display = 'flex';
    }
    
    // Adicionar eventos click diretos
    tabs.forEach(tab => {
        // Primeiro remover eventos existentes (clone e substitui)
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        // Agora adicionar novos eventos
        newTab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Ativar esta aba e desativar as outras
            tabs.forEach(t => {
                const newT = document.querySelector(`[data-tab="${t.getAttribute('data-tab')}"]`);
                if (newT) newT.classList.remove('active');
            });
            this.classList.add('active');
            
            // Esconder todos os conteúdos
            contents.forEach(content => {
                if (content) content.style.display = 'none';
            });
            
            // Mostrar apenas o conteúdo correspondente
            if (tabId === 'bottom-events' && contents[0]) {
                contents[0].style.display = 'flex';
            } else if (tabId === 'bottom-restrictions' && contents[1]) {
                contents[1].style.display = 'flex';
            } else if (tabId === 'bottom-report' && contents[2]) {
                contents[2].style.display = 'flex';
            }
            
            console.log(`✅ Aba ativada: ${tabId}`);
        });
    });
    
    console.log("✅ Correção para abas aplicada com sucesso");
}

/**
 * Adiciona eventos diretamente para a cidade de origem e outras principais
 */
function addEvents() {
    console.log("🔧 Iniciando adição direta de eventos");
    
    // Verificar se temos o objeto de dados
    if (!window.mockData || !window.mockData.cityEvents) {
        console.warn("❌ Dados de eventos não encontrados!");
        return;
    }
    
    // Adicionar evento de aniversário para Dois Córregos (origem)
    addAnniversaryEvent("Dois Córregos", "2025-04-19");
    
    // Adicionar eventos para outras cidades principais
    addAnniversaryEvent("Jaú", "2025-08-15");
    addAnniversaryEvent("Bauru", "2025-08-01");
    addAnniversaryEvent("Botucatu", "2025-04-14");
    addAnniversaryEvent("Ribeirão Preto", "2025-06-19");
    
    // Forçar atualização da lista de eventos
    setTimeout(() => {
        if (window.showEventsForCitiesOnRoute && window.locations) {
            const cityIds = window.locations.map(loc => loc.id);
            window.showEventsForCitiesOnRoute(cityIds);
            console.log("🔄 Lista de eventos atualizada forçadamente");
        }
    }, 1000);
    
    console.log("✅ Eventos adicionados com sucesso");
    
    // Encontrar o elemento de conteúdo de eventos e garantir que está visível
    const eventsContent = document.getElementById('bottom-events-content');
    if (eventsContent) {
        eventsContent.style.display = 'flex';
    }
}

/**
 * Adiciona um evento de aniversário para uma cidade
 */
function addAnniversaryEvent(cityName, date) {
    // Verificar se já existe um aniversário para esta cidade
    const exists = window.mockData.cityEvents.some(e => 
        e.cityName === cityName && e.name === "Aniversário da Cidade");
    
    if (!exists) {
        // Adicionar novo evento
        window.mockData.cityEvents.push({
            id: `anniversary-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
            cityName: cityName,
            name: "Aniversário da Cidade",
            startDate: date,
            endDate: date,
            isHoliday: true,
            description: `Aniversário de fundação de ${cityName}`,
            restrictionLevel: "low",
            source: "Banco de dados local (GitHub Pages)"
        });
        
        console.log(`✅ Adicionado aniversário para ${cityName}: ${date}`);
    }
}