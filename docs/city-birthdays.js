/**
 * Script com aniversários das cidades para o GitHub Pages
 * Esse arquivo será carregado diretamente na página do GitHub Pages
 * Atualizado em: 21/05/2025
 */

// Aguardar que a página carregue completamente
window.addEventListener('load', function() {
    // Aguardar um curto período para garantir que mockData esteja disponível
    setTimeout(function() {
        console.log("Iniciando carregamento de aniversários das cidades...");
        
        // Garantir que mockData esteja definido
        if (typeof window.mockData === 'undefined') {
            console.log("Definindo mockData...");
            window.mockData = {};
        }
        
        // Garantir que cityEvents exista
        if (!window.mockData.cityEvents) {
            console.log("Criando array cityEvents...");
            window.mockData.cityEvents = [];
        }
        
        // Carregar eventos de aniversários diretamente do city-events-data.js
        if (window.cityBirthdaysData && Array.isArray(window.cityBirthdaysData)) {
            console.log("Dados de aniversários encontrados, adicionando...");
            window.mockData.cityEvents = window.mockData.cityEvents.concat(window.cityBirthdaysData);
            console.log(`${window.cityBirthdaysData.length} eventos de aniversários adicionados!`);
        } else {
            console.log("Dados não encontrados, adicionando eventos manualmente...");
            
            // Adicionar manualmente os principais eventos
            const mainEvents = [
                { id: 30001, cityName: "Piedade", name: "Aniversário da Cidade", startDate: "2025-05-20", endDate: "2025-05-20", isHoliday: true, description: "Aniversário de fundação de Piedade em 20/05", restrictionLevel: "low" },
                { id: 30002, cityName: "Barra do Chapéu", name: "Aniversário da Cidade", startDate: "2025-05-19", endDate: "2025-05-19", isHoliday: true, description: "Aniversário de fundação de Barra do Chapéu em 19/05", restrictionLevel: "low" },
                { id: 30003, cityName: "Ribeirão Branco", name: "Aniversário da Cidade", startDate: "2025-09-05", endDate: "2025-09-05", isHoliday: true, description: "Aniversário de fundação de Ribeirão Branco em 05/09", restrictionLevel: "low" },
                { id: 30004, cityName: "Itaporanga", name: "Aniversário da Cidade", startDate: "2025-03-06", endDate: "2025-03-06", isHoliday: true, description: "Aniversário de fundação de Itaporanga em 06/03", restrictionLevel: "low" },
                { id: 30005, cityName: "Batatais", name: "Aniversário da Cidade", startDate: "2025-03-14", endDate: "2025-03-14", isHoliday: true, description: "Aniversário de fundação de Batatais em 14/03", restrictionLevel: "low" },
                { id: 30006, cityName: "Dois Córregos", name: "Aniversário da Cidade", startDate: "2025-02-04", endDate: "2025-02-04", isHoliday: true, description: "Aniversário de fundação de Dois Córregos em 04/02/1883", restrictionLevel: "low" }
            ];
            
            window.mockData.cityEvents = window.mockData.cityEvents.concat(mainEvents);
            console.log(`${mainEvents.length} eventos de aniversários principais adicionados como fallback!`);
        }
        
        console.log("Configuração de aniversários concluída.");
    }, 500);
    
    // Adicionar função para debugging
    window.adicionarEventosCidade = function() {
        if (typeof window.mockData === 'undefined') {
            window.mockData = {};
        }
        
        if (!window.mockData.cityEvents) {
            window.mockData.cityEvents = [];
        }
        
        const eventos = [
            { id: 40001, cityName: "Piedade", name: "Aniversário da Cidade", startDate: "2025-05-20", endDate: "2025-05-20", isHoliday: true, description: "Aniversário de fundação de Piedade em 20/05", restrictionLevel: "low" }
        ];
        
        window.mockData.cityEvents = window.mockData.cityEvents.concat(eventos);
        console.log("Eventos adicionados manualmente via console!");
        return "Eventos adicionados com sucesso!";
    };
});