/**
 * Atualização de eventos de cidades
 * - Piedade: 20/05/2025 (corrigido)
 * - Ribeirão Preto: 19/06/2025 (corrigido)
 */

// Array com os eventos de aniversários
const cityEvents = [
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

// Função para atualizar os eventos
function updateCityEvents() {
    // Verificar se já existe a variável global de eventos
    if (typeof window.allCityEvents === 'undefined') {
        console.warn('[CityEvents] Variável global de eventos não encontrada');
        return;
    }
    
    // Para cada evento na atualização
    cityEvents.forEach(newEvent => {
        // Procurar se o evento já existe para a cidade
        const existingEventIndex = window.allCityEvents.findIndex(e => 
            e.city === newEvent.city && e.event === newEvent.event
        );
        
        if (existingEventIndex >= 0) {
            // Atualizar o evento existente
            console.log(`[CityEvents] Atualizando evento: ${newEvent.event} em ${newEvent.city}`);
            window.allCityEvents[existingEventIndex] = newEvent;
        } else {
            // Adicionar o novo evento
            console.log(`[CityEvents] Adicionando novo evento: ${newEvent.event} em ${newEvent.city}`);
            window.allCityEvents.push(newEvent);
        }
    });
    
    console.log('[CityEvents] Atualização de eventos concluída');
}

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Dar tempo para que o script principal carregue os eventos
    setTimeout(updateCityEvents, 1000);
});

// Também executar se o documento já estiver carregado
if (document.readyState !== 'loading') {
    setTimeout(updateCityEvents, 1000);
}