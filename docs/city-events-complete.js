
/**
 * Atualização completa dos eventos de aniversários de cidades
 * Este script contém dados atualizados de aniversários de municípios
 * de São Paulo e Minas Gerais
 */

// Array com todos os eventos de aniversários
const cityBirthdayEvents = [
    // ===== SÃO PAULO =====
    // Janeiro
    { city: "Uru", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "01/01/2025", endDate: "01/01/2025", description: "Aniversário de fundação de Uru em 01/01" },
    { city: "Morro Agudo", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "06/01/2025", endDate: "06/01/2025", description: "Aniversário de fundação de Morro Agudo em 06/01" },
    { city: "Dirce Reis", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "06/01/2025", endDate: "06/01/2025", description: "Aniversário de fundação de Dirce Reis em 06/01" },
    // ... more cities here
];

// Função para atualizar os eventos
function updateAllCityEvents() {
    if (typeof window.allCityEvents === 'undefined') {
        window.allCityEvents = cityBirthdayEvents;
        console.log('[CityEvents] Criada nova base de eventos com ' + cityBirthdayEvents.length + ' eventos');
        return;
    }
    
    const uniqueEvents = [];
    const seen = new Set();
    
    window.allCityEvents.forEach(event => {
        const key = `${event.city}|${event.event}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueEvents.push(event);
        }
    });
    
    window.allCityEvents = uniqueEvents;
    
    cityBirthdayEvents.forEach(newEvent => {
        const existingEventIndex = window.allCityEvents.findIndex(e => 
            e.city === newEvent.city && e.event === newEvent.event
        );
        
        if (existingEventIndex >= 0) {
            window.allCityEvents[existingEventIndex] = newEvent;
        } else {
            window.allCityEvents.push(newEvent);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateAllCityEvents, 1000);
});

if (document.readyState !== 'loading') {
    setTimeout(updateAllCityEvents, 1000);
}
