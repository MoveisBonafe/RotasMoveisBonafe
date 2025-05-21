/**
 * Dados consolidados de eventos e aniversários das cidades
 * Última atualização: Maio/2025
 */

const cityEventsComplete = [
    // ===== SÃO PAULO =====
    // Janeiro
    { city: "Uru", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "01/01/2025", endDate: "01/01/2025", description: "Aniversário de fundação de Uru em 01/01" },
    { city: "São Paulo", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Alto", startDate: "25/01/2025", endDate: "25/01/2025", description: "Aniversário de fundação de São Paulo em 25/01/1554" },

    // Maio
    { city: "Piedade", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/05/2025", endDate: "20/05/2025", description: "Aniversário de fundação de Piedade em 20/05/1842" },

    // Junho
    { city: "Ribeirão Preto", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Médio", startDate: "19/06/2025", endDate: "19/06/2025", description: "Aniversário de fundação de Ribeirão Preto em 19/06/1856" },

    // ===== MINAS GERAIS =====
    { city: "Belo Horizonte", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Alto", startDate: "12/12/2025", endDate: "12/12/2025", description: "Aniversário de fundação de Belo Horizonte em 12/12" }
];

function updateAllCityEvents() {
    if (typeof window.allCityEvents === 'undefined') {
        window.allCityEvents = cityEventsComplete;
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

    cityEventsComplete.forEach(newEvent => {
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

document.addEventListener('DOMContentLoaded', () => setTimeout(updateAllCityEvents, 1000));
if (document.readyState !== 'loading') {
    setTimeout(updateAllCityEvents, 1000);
}