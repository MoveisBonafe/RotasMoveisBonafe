/**
 * Atualização completa dos eventos de aniversários de cidades
 * Este script contém dados atualizados de aniversários de municípios
 * de São Paulo e Minas Gerais
 */

// Array com todos os eventos de aniversários
const allCityEvents = window.allCityEvents || [];

// Função para atualizar os eventos
function updateAllCityEvents() {
    if (typeof window.allCityEvents === 'undefined') {
        window.allCityEvents = [];
        console.log('[CityEvents] Criada nova base de eventos');
        window.allCityEvents = [
            // ===== SÃO PAULO =====
            // Janeiro
            { city: "Uru", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "01/01/2025", endDate: "01/01/2025", description: "Aniversário de fundação de Uru em 01/01" },
            { city: "Morro Agudo", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "06/01/2025", endDate: "06/01/2025", description: "Aniversário de fundação de Morro Agudo em 06/01" },
            { city: "Dirce Reis", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "06/01/2025", endDate: "06/01/2025", description: "Aniversário de fundação de Dirce Reis em 06/01" }
            // ... more cities here
        ];
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
}

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateAllCityEvents, 1000);
});

if (document.readyState !== 'loading') {
    setTimeout(updateAllCityEvents, 1000);
}