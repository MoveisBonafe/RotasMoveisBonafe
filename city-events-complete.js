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
    { city: "Teodoro Sampaio", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "07/01/2025", endDate: "07/01/2025", description: "Aniversário de fundação de Teodoro Sampaio em 07/01" },
    { city: "Iaras", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "09/01/2025", endDate: "09/01/2025", description: "Aniversário de fundação de Iaras em 09/01" },
    { city: "Motuca", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "09/01/2025", endDate: "09/01/2025", description: "Aniversário de fundação de Motuca em 09/01" },
    { city: "Borebi", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "09/01/2025", endDate: "09/01/2025", description: "Aniversário de fundação de Borebi em 09/01" },
    { city: "Embaúba", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "09/01/2025", endDate: "09/01/2025", description: "Aniversário de fundação de Embaúba em 09/01" },
    { city: "Iporanga", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "12/01/2025", endDate: "12/01/2025", description: "Aniversário de fundação de Iporanga em 12/01" },
    { city: "Miguelópolis", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "14/01/2025", endDate: "14/01/2025", description: "Aniversário de fundação de Miguelópolis em 14/01" },
    { city: "Quatá", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "16/01/2025", endDate: "16/01/2025", description: "Aniversário de fundação de Quatá em 16/01" },
    { city: "Praia Grande", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "19/01/2025", endDate: "19/01/2025", description: "Aniversário de fundação de Praia Grande em 19/01" },
    { city: "Braúna", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/01/2025", endDate: "20/01/2025", description: "Aniversário de fundação de Braúna em 20/01" },
    { city: "Cardoso", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/01/2025", endDate: "20/01/2025", description: "Aniversário de fundação de Cardoso em 20/01" },
    { city: "Itaju", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/01/2025", endDate: "20/01/2025", description: "Aniversário de fundação de Itaju em 20/01" },
    { city: "Parisi", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/01/2025", endDate: "20/01/2025", description: "Aniversário de fundação de Parisi em 20/01" },
    { city: "Piraju", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/01/2025", endDate: "20/01/2025", description: "Aniversário de fundação de Piraju em 20/01" },
    { city: "Sabino", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/01/2025", endDate: "20/01/2025", description: "Aniversário de fundação de Sabino em 20/01" },
    { city: "Santa Cruz do Rio Pardo", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/01/2025", endDate: "20/01/2025", description: "Aniversário de fundação de Santa Cruz do Rio Pardo em 20/01" },
    { city: "São Vicente", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "22/01/2025", endDate: "22/01/2025", description: "Aniversário de fundação de São Vicente em 22/01" },
    { city: "São Paulo", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Alto", startDate: "25/01/2025", endDate: "25/01/2025", description: "Aniversário de fundação de São Paulo em 25/01/1554" },
    { city: "Buri", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "25/01/2025", endDate: "25/01/2025", description: "Aniversário de fundação de Buri em 25/01" },
    { city: "Estrela D'Oeste", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "25/01/2025", endDate: "25/01/2025", description: "Aniversário de fundação de Estrela D'Oeste em 25/01" },
    { city: "Vera Cruz", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "25/01/2025", endDate: "25/01/2025", description: "Aniversário de fundação de Vera Cruz em 25/01" },
    { city: "Santos", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Médio", startDate: "26/01/2025", endDate: "26/01/2025", description: "Aniversário de fundação de Santos em 26/01/1546" },
    { city: "Santo Antônio do Pinhal", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "26/01/2025", endDate: "26/01/2025", description: "Aniversário de fundação de Santo Antônio do Pinhal em 26/01" },
    { city: "Barbosa", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "30/01/2025", endDate: "30/01/2025", description: "Aniversário de fundação de Barbosa em 30/01" },
    
    // Fevereiro
    { city: "Itu", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "02/02/2025", endDate: "02/02/2025", description: "Aniversário de fundação de Itu em 02/02" },
    { city: "Dois Córregos", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "04/02/2025", endDate: "04/02/2025", description: "Aniversário de fundação de Dois Córregos em 04/02" },
    { city: "Osasco", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Médio", startDate: "19/02/2025", endDate: "19/02/2025", description: "Aniversário de fundação de Osasco em 19/02" },
    
    // Março
    { city: "Olímpia", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "02/03/2025", endDate: "02/03/2025", description: "Aniversário de fundação de Olímpia em 02/03" },
    { city: "Altinópolis", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "09/03/2025", endDate: "09/03/2025", description: "Aniversário de fundação de Altinópolis em 09/03" },
    { city: "Batatais", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "14/03/2025", endDate: "14/03/2025", description: "Aniversário de fundação de Batatais em 14/03" },
    { city: "Piedade", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/05/2025", endDate: "20/05/2025", description: "Aniversário de fundação de Piedade em 20/05" },
    
    // Maio
    { city: "Piedade", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "20/05/2025", endDate: "20/05/2025", description: "Aniversário de fundação de Piedade em 20/05" },
    
    // Junho
    { city: "Ribeirão Preto", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Médio", startDate: "19/06/2025", endDate: "19/06/2025", description: "Aniversário de fundação de Ribeirão Preto em 19/06/1856" },
    { city: "Pitangui", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "09/06/2025", endDate: "09/06/2025", description: "Aniversário de fundação de Pitangui em 09/06" },
    
    // Agosto
    { city: "Bauru", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Médio", startDate: "01/08/2025", endDate: "01/08/2025", description: "Aniversário de fundação de Bauru em 01/08" },
    { city: "Jaú", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "15/08/2025", endDate: "15/08/2025", description: "Aniversário de fundação de Jaú em 15/08" },
    
    // Dezembro
    { city: "Barrinha", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Baixo", startDate: "30/12/2025", endDate: "30/12/2025", description: "Aniversário de fundação de Barrinha em 30/12" },
    
    // ===== MINAS GERAIS =====
    { city: "Belo Horizonte", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Alto", startDate: "12/12/2025", endDate: "12/12/2025", description: "Aniversário de fundação de Belo Horizonte em 12/12" },
    { city: "Divinópolis", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Médio", startDate: "10/01/2025", endDate: "10/01/2025", description: "Aniversário de fundação de Divinópolis em 10/01" },
    { city: "Juiz de Fora", event: "Aniversário da Cidade", eventType: "Feriado", importance: "Médio", startDate: "31/05/2025", endDate: "31/05/2025", description: "Aniversário de fundação de Juiz de Fora em 31/05" }
];

// Função para atualizar os eventos
function updateAllCityEvents() {
    // Verificar se a variável global de eventos existe
    if (typeof window.allCityEvents === 'undefined') {
        console.warn('[CityEvents] Variável global de eventos não encontrada');
        
        // Criar a variável global se não existir
        window.allCityEvents = cityBirthdayEvents;
        console.log('[CityEvents] Criada nova base de eventos com ' + cityBirthdayEvents.length + ' eventos');
        return;
    }
    
    // Limpar eventos duplicados (mesmo evento na mesma cidade)
    const uniqueEvents = [];
    const seen = new Set();
    
    window.allCityEvents.forEach(event => {
        const key = `${event.city}|${event.event}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueEvents.push(event);
        }
    });
    
    // Atualizar a base global de eventos
    window.allCityEvents = uniqueEvents;
    
    // Adicionar/atualizar os eventos de aniversário
    cityBirthdayEvents.forEach(newEvent => {
        // Procurar se o evento já existe para a cidade
        const existingEventIndex = window.allCityEvents.findIndex(e => 
            e.city === newEvent.city && e.event === newEvent.event
        );
        
        if (existingEventIndex >= 0) {
            // Atualizar o evento existente
            console.log(`[CityEvents] Atualizando evento: ${newEvent.event} em ${newEvent.city} para data ${newEvent.startDate}`);
            window.allCityEvents[existingEventIndex] = newEvent;
        } else {
            // Adicionar o novo evento
            console.log(`[CityEvents] Adicionando novo evento: ${newEvent.event} em ${newEvent.city}`);
            window.allCityEvents.push(newEvent);
        }
    });
    
    console.log('[CityEvents] Atualização de eventos concluída, eventos disponíveis:', window.allCityEvents.length);
}

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Dar tempo para que o script principal carregue os eventos
    setTimeout(updateAllCityEvents, 1000);
});

// Também executar se o documento já estiver carregado
if (document.readyState !== 'loading') {
    setTimeout(updateAllCityEvents, 1000);
}