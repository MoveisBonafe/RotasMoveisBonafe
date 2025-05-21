/**
 * Script com aniversários das cidades para o GitHub Pages
 * Esse arquivo será carregado diretamente na página do GitHub Pages
 * e seus dados serão mesclados com os eventos existentes
 * Atualizado em: 21/05/2025
 */

// Esperar que o script principal tenha executado e mockData esteja disponível
window.addEventListener('load', function() {
    console.log("Carregando aniversários das cidades para o GitHub Pages...");
    
    // Garantir que o mockData esteja definido
    if (typeof window.mockData === 'undefined') {
        console.log("Inicializando mockData globalmente...");
        window.mockData = window.mockData || {};
    }
    
    // Garantir que cityEvents esteja sempre disponível
    if (!window.mockData.cityEvents) {
        console.log("Inicializando cityEvents...");
        window.mockData.cityEvents = [];
    }
    
    // Função para adicionar aniversários das cidades
    function addCityBirthdays() {
        console.log("Executando função de adicionar aniversários...");
        
        // Aniversários prioritários de cidades de São Paulo e Minas Gerais
        const cityBirthdays = [
            // Cidades prioritárias - datas corretas verificadas
            { id: 10001, cityName: "Piedade", name: "Aniversário da Cidade", startDate: "2025-05-20", endDate: "2025-05-20", isHoliday: true, description: "Aniversário de fundação de Piedade em 20/05", restrictionLevel: "low" },
            // Versão alternativa para garantir match - algumas implementações usam variações dos nomes de cidades
            { id: 20001, cityName: "Piedade/SP", name: "Aniversário da Cidade", startDate: "2025-05-20", endDate: "2025-05-20", isHoliday: true, description: "Aniversário de fundação de Piedade em 20/05", restrictionLevel: "low" },
            { id: 20002, cityName: "Piedade - SP", name: "Aniversário da Cidade", startDate: "2025-05-20", endDate: "2025-05-20", isHoliday: true, description: "Aniversário de fundação de Piedade em 20/05", restrictionLevel: "low" },
            { id: 10002, cityName: "Barra do Chapéu", name: "Aniversário da Cidade", startDate: "2025-05-19", endDate: "2025-05-19", isHoliday: true, description: "Aniversário de fundação de Barra do Chapéu em 19/05", restrictionLevel: "low" },
            { id: 10003, cityName: "Ribeirão Branco", name: "Aniversário da Cidade", startDate: "2025-09-05", endDate: "2025-09-05", isHoliday: true, description: "Aniversário de fundação de Ribeirão Branco em 05/09", restrictionLevel: "low" },
            { id: 10004, cityName: "Itaporanga", name: "Aniversário da Cidade", startDate: "2025-03-06", endDate: "2025-03-06", isHoliday: true, description: "Aniversário de fundação de Itaporanga em 06/03", restrictionLevel: "low" },
            { id: 10005, cityName: "Batatais", name: "Aniversário da Cidade", startDate: "2025-03-14", endDate: "2025-03-14", isHoliday: true, description: "Aniversário de fundação de Batatais em 14/03", restrictionLevel: "low" },
            { id: 10006, cityName: "Dois Córregos", name: "Aniversário da Cidade", startDate: "2025-02-04", endDate: "2025-02-04", isHoliday: true, description: "Aniversário de fundação de Dois Córregos em 04/02/1883", restrictionLevel: "low" },
            
            // São Paulo - Janeiro
            { id: 10007, cityName: "Uru", name: "Aniversário da Cidade", startDate: "2025-01-01", endDate: "2025-01-01", isHoliday: true, description: "Aniversário de fundação de Uru em 01/01", restrictionLevel: "low" },
            { id: 10008, cityName: "Morro Agudo", name: "Aniversário da Cidade", startDate: "2025-01-06", endDate: "2025-01-06", isHoliday: true, description: "Aniversário de fundação de Morro Agudo em 06/01", restrictionLevel: "low" },
            { id: 10009, cityName: "Dirce Reis", name: "Aniversário da Cidade", startDate: "2025-01-06", endDate: "2025-01-06", isHoliday: true, description: "Aniversário de fundação de Dirce Reis em 06/01", restrictionLevel: "low" },
            { id: 10010, cityName: "São Paulo", name: "Aniversário da Cidade", startDate: "2025-01-25", endDate: "2025-01-25", isHoliday: true, description: "Aniversário de fundação de São Paulo em 25/01/1554", restrictionLevel: "high" },
            { id: 10011, cityName: "Santos", name: "Aniversário da Cidade", startDate: "2025-01-26", endDate: "2025-01-26", isHoliday: true, description: "Aniversário de fundação de Santos em 26/01", restrictionLevel: "medium" },
            
            // São Paulo - Fevereiro
            { id: 10012, cityName: "Itu", name: "Aniversário da Cidade", startDate: "2025-02-02", endDate: "2025-02-02", isHoliday: true, description: "Aniversário de fundação de Itu em 02/02", restrictionLevel: "medium" },
            { id: 10013, cityName: "Osasco", name: "Aniversário da Cidade", startDate: "2025-02-19", endDate: "2025-02-19", isHoliday: true, description: "Aniversário de fundação de Osasco em 19/02", restrictionLevel: "medium" },
            
            // São Paulo - Março
            { id: 10014, cityName: "Araras", name: "Aniversário da Cidade", startDate: "2025-03-24", endDate: "2025-03-24", isHoliday: true, description: "Aniversário de fundação de Araras em 24/03", restrictionLevel: "medium" },
            
            // São Paulo - Abril
            { id: 10015, cityName: "Botucatu", name: "Aniversário da Cidade", startDate: "2025-04-14", endDate: "2025-04-14", isHoliday: true, description: "Aniversário de fundação de Botucatu em 14/04/1855", restrictionLevel: "low" },
            
            // São Paulo - Maio
            { id: 10016, cityName: "Brotas", name: "Aniversário da Cidade", startDate: "2025-05-03", endDate: "2025-05-03", isHoliday: true, description: "Aniversário de fundação de Brotas em 03/05", restrictionLevel: "low" },
            
            // São Paulo - Junho
            { id: 10017, cityName: "Ribeirão Preto", name: "Aniversário da Cidade", startDate: "2025-06-19", endDate: "2025-06-19", isHoliday: true, description: "Aniversário de fundação de Ribeirão Preto em 19/06/1856", restrictionLevel: "medium" },
            { id: 10018, cityName: "Rio Claro", name: "Aniversário da Cidade", startDate: "2025-06-24", endDate: "2025-06-24", isHoliday: true, description: "Aniversário de fundação de Rio Claro em 24/06", restrictionLevel: "medium" },
            
            // São Paulo - Julho
            { id: 10019, cityName: "Campinas", name: "Aniversário da Cidade", startDate: "2025-07-14", endDate: "2025-07-14", isHoliday: true, description: "Aniversário de fundação de Campinas em 14/07/1774", restrictionLevel: "medium" },
            
            // São Paulo - Agosto
            { id: 10020, cityName: "Bauru", name: "Aniversário da Cidade", startDate: "2025-08-01", endDate: "2025-08-01", isHoliday: true, description: "Aniversário de fundação de Bauru em 01/08/1896", restrictionLevel: "low" },
            { id: 10021, cityName: "Jaú", name: "Aniversário da Cidade", startDate: "2025-08-15", endDate: "2025-08-15", isHoliday: true, description: "Aniversário de fundação de Jaú em 15/08/1853", restrictionLevel: "low" },
            
            // São Paulo - Novembro
            { id: 10022, cityName: "São Carlos", name: "Aniversário da Cidade", startDate: "2025-11-04", endDate: "2025-11-04", isHoliday: true, description: "Aniversário de fundação de São Carlos em 04/11/1857", restrictionLevel: "low" },
            
            // Minas Gerais
            { id: 10023, cityName: "Belo Horizonte", name: "Aniversário da Cidade", startDate: "2025-12-12", endDate: "2025-12-12", isHoliday: true, description: "Aniversário de fundação de Belo Horizonte em 12/12", restrictionLevel: "high" },
            { id: 10024, cityName: "Pitangui", name: "Aniversário da Cidade", startDate: "2025-06-09", endDate: "2025-06-09", isHoliday: true, description: "Aniversário de fundação de Pitangui em 09/06", restrictionLevel: "low" }
        ];
        
        // Adicionar os aniversários ao mockData.cityEvents
        window.mockData.cityEvents = window.mockData.cityEvents.concat(cityBirthdays);
        
        console.log("Aniversários de cidades adicionados com sucesso:", cityBirthdays.length);
        console.log("Total de eventos agora:", window.mockData.cityEvents.length);
    }
    
    // Adicionar os aniversários diretamente
    addCityBirthdays();
    
    // Verificar se foram adicionados
    console.log("Status após adicionar eventos:");
    console.log("mockData disponível:", typeof window.mockData !== 'undefined');
    console.log("cityEvents disponível:", window.mockData && Array.isArray(window.mockData.cityEvents));
    console.log("Número de eventos:", window.mockData && window.mockData.cityEvents ? window.mockData.cityEvents.length : 0);
    
    // Adicionar método global para forçar a adição quando a página estiver totalmente carregada
    window.addCityBirthdaysManually = function() {
        console.log("Executando adição manual de aniversários...");
        
        // Garantir que mockData exista
        if (typeof window.mockData === 'undefined') {
            window.mockData = {};
        }
        
        // Garantir que cityEvents exista
        if (!window.mockData.cityEvents) {
            window.mockData.cityEvents = [];
        }
        
        // Chamar a função principal
        addCityBirthdays();
        
        return "Aniversários adicionados manualmente com sucesso!";
    };
    
    // Se após 3 segundos não tivermos eventos, tentar novamente
    setTimeout(function() {
        if (!window.mockData || !window.mockData.cityEvents || window.mockData.cityEvents.length < 20) {
            console.log("Tentando adicionar eventos novamente após 3 segundos...");
            window.addCityBirthdaysManually();
        }
    }, 3000);
});