/**
 * Script com aniversários das cidades para o GitHub Pages
 * Esse arquivo será carregado diretamente na página do GitHub Pages
 * e seus dados serão mesclados com os eventos existentes
 */

// Executar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("Carregando aniversários das cidades para o GitHub Pages...");
    
    // Função para adicionar aniversários das cidades
    function addCityBirthdays() {
        // Verificar se mockData existe
        if (!window.mockData) {
            console.error("mockData não encontrado! Criando objeto...");
            window.mockData = {
                cityEvents: []
            };
        }
        
        // Verificar se cityEvents existe
        if (!window.mockData.cityEvents) {
            console.log("cityEvents não encontrado! Criando array...");
            window.mockData.cityEvents = [];
        }
        
        // Aniversários de todas as cidades de São Paulo e Minas Gerais
        const cityBirthdays = [
            // Piedade é a mais importante, garantir que está presente
            { id: 10001, cityName: "Piedade", name: "Aniversário da Cidade", startDate: "2025-05-20", endDate: "2025-05-20", isHoliday: true, description: "Aniversário de fundação de Piedade em 20/05", restrictionLevel: "low" },
            
            // São Paulo - Janeiro
            { id: 10002, cityName: "Uru", name: "Aniversário da Cidade", startDate: "2025-01-01", endDate: "2025-01-01", isHoliday: true, description: "Aniversário de fundação de Uru", restrictionLevel: "low" },
            { id: 10003, cityName: "Morro Agudo", name: "Aniversário da Cidade", startDate: "2025-01-06", endDate: "2025-01-06", isHoliday: true, description: "Aniversário de fundação de Morro Agudo", restrictionLevel: "low" },
            { id: 10004, cityName: "Dirce Reis", name: "Aniversário da Cidade", startDate: "2025-01-06", endDate: "2025-01-06", isHoliday: true, description: "Aniversário de fundação de Dirce Reis", restrictionLevel: "low" },
            { id: 10005, cityName: "São Paulo", name: "Aniversário da Cidade", startDate: "2025-01-25", endDate: "2025-01-25", isHoliday: true, description: "Aniversário de fundação de São Paulo em 25/01/1554", restrictionLevel: "high" },
            { id: 10006, cityName: "Santos", name: "Aniversário da Cidade", startDate: "2025-01-26", endDate: "2025-01-26", isHoliday: true, description: "Aniversário de fundação de Santos", restrictionLevel: "medium" },
            
            // São Paulo - Fevereiro
            { id: 10007, cityName: "Dois Córregos", name: "Aniversário da Cidade", startDate: "2025-02-04", endDate: "2025-02-04", isHoliday: true, description: "Aniversário de fundação de Dois Córregos em 04/02/1883", restrictionLevel: "low" },
            { id: 10008, cityName: "Itu", name: "Aniversário da Cidade", startDate: "2025-02-02", endDate: "2025-02-02", isHoliday: true, description: "Aniversário de fundação de Itu", restrictionLevel: "medium" },
            { id: 10009, cityName: "Osasco", name: "Aniversário da Cidade", startDate: "2025-02-19", endDate: "2025-02-19", isHoliday: true, description: "Aniversário de fundação de Osasco", restrictionLevel: "medium" },
            
            // São Paulo - Março
            { id: 10010, cityName: "Batatais", name: "Aniversário da Cidade", startDate: "2025-03-14", endDate: "2025-03-14", isHoliday: true, description: "Aniversário de fundação de Batatais", restrictionLevel: "low" },
            { id: 10011, cityName: "Itaporanga", name: "Aniversário da Cidade", startDate: "2025-03-06", endDate: "2025-03-06", isHoliday: true, description: "Aniversário de fundação de Itaporanga", restrictionLevel: "low" },
            { id: 10012, cityName: "Araras", name: "Aniversário da Cidade", startDate: "2025-03-24", endDate: "2025-03-24", isHoliday: true, description: "Aniversário de fundação de Araras", restrictionLevel: "medium" },
            
            // São Paulo - Abril
            { id: 10013, cityName: "Botucatu", name: "Aniversário da Cidade", startDate: "2025-04-14", endDate: "2025-04-14", isHoliday: true, description: "Aniversário de fundação de Botucatu em 14/04/1855", restrictionLevel: "low" },
            
            // São Paulo - Maio
            { id: 10014, cityName: "Barra do Chapéu", name: "Aniversário da Cidade", startDate: "2025-05-19", endDate: "2025-05-19", isHoliday: true, description: "Aniversário de fundação de Barra do Chapéu", restrictionLevel: "low" },
            { id: 10015, cityName: "Brotas", name: "Aniversário da Cidade", startDate: "2025-05-03", endDate: "2025-05-03", isHoliday: true, description: "Aniversário de fundação de Brotas", restrictionLevel: "low" },
            
            // São Paulo - Junho
            { id: 10016, cityName: "Ribeirão Preto", name: "Aniversário da Cidade", startDate: "2025-06-19", endDate: "2025-06-19", isHoliday: true, description: "Aniversário de fundação de Ribeirão Preto em 19/06/1856", restrictionLevel: "low" },
            { id: 10017, cityName: "Rio Claro", name: "Aniversário da Cidade", startDate: "2025-06-24", endDate: "2025-06-24", isHoliday: true, description: "Aniversário de fundação de Rio Claro", restrictionLevel: "medium" },
            
            // São Paulo - Julho
            { id: 10018, cityName: "Campinas", name: "Aniversário da Cidade", startDate: "2025-07-14", endDate: "2025-07-14", isHoliday: true, description: "Aniversário de fundação de Campinas em 14/07/1774", restrictionLevel: "medium" },
            
            // São Paulo - Agosto
            { id: 10019, cityName: "Bauru", name: "Aniversário da Cidade", startDate: "2025-08-01", endDate: "2025-08-01", isHoliday: true, description: "Aniversário de fundação de Bauru em 01/08/1896", restrictionLevel: "low" },
            { id: 10020, cityName: "Jaú", name: "Aniversário da Cidade", startDate: "2025-08-15", endDate: "2025-08-15", isHoliday: true, description: "Aniversário de fundação de Jaú em 15/08/1853", restrictionLevel: "low" },
            
            // São Paulo - Setembro
            { id: 10021, cityName: "Ribeirão Branco", name: "Aniversário da Cidade", startDate: "2025-09-05", endDate: "2025-09-05", isHoliday: true, description: "Aniversário de fundação de Ribeirão Branco", restrictionLevel: "low" },
            
            // São Paulo - Novembro
            { id: 10022, cityName: "São Carlos", name: "Aniversário da Cidade", startDate: "2025-11-04", endDate: "2025-11-04", isHoliday: true, description: "Aniversário de fundação de São Carlos em 04/11/1857", restrictionLevel: "low" },
            
            // Minas Gerais
            { id: 10023, cityName: "Belo Horizonte", name: "Aniversário da Cidade", startDate: "2025-12-12", endDate: "2025-12-12", isHoliday: true, description: "Aniversário de fundação de Belo Horizonte", restrictionLevel: "high" }
        ];
        
        // Adicionar os aniversários ao mockData.cityEvents
        window.mockData.cityEvents = window.mockData.cityEvents.concat(cityBirthdays);
        
        console.log("Aniversários de cidades adicionados com sucesso:", cityBirthdays.length);
        console.log("Total de eventos agora:", window.mockData.cityEvents.length);
    }
    
    // Tentar várias vezes, pode ser que a página ainda não tenha carregado completamente
    let attempts = 0;
    const maxAttempts = 5;
    
    function tryAddBirthdays() {
        attempts++;
        
        if (window.mockData) {
            addCityBirthdays();
        } else if (attempts < maxAttempts) {
            console.log(`Tentativa ${attempts}/${maxAttempts} - mockData ainda não disponível. Tentando novamente em 1s...`);
            setTimeout(tryAddBirthdays, 1000);
        } else {
            console.error("Falha ao adicionar aniversários: mockData não disponível após várias tentativas");
        }
    }
    
    // Iniciar as tentativas
    tryAddBirthdays();
});