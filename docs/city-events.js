/**
 * Dados de aniversários de cidades para o Otimizador de Rotas
 * Gerado manualmente para facilitar integração com GitHub Pages
 */

// Função para carregar eventos de cidades
function loadCityEvents() {
  const cityEvents = [
    // Aniversários das principais cidades de São Paulo
    { id: 1, cityName: "Dois Córregos", name: "Aniversário da Cidade", startDate: "2025-02-04", endDate: "2025-02-04", isHoliday: true, description: "Aniversário de fundação de Dois Córregos em 04/02/1883", restrictionLevel: "low" },
    { id: 2, cityName: "Jaú", name: "Aniversário da Cidade", startDate: "2025-08-15", endDate: "2025-08-15", isHoliday: true, description: "Aniversário de fundação de Jaú em 15/08/1853", restrictionLevel: "low" },
    { id: 3, cityName: "Botucatu", name: "Aniversário da Cidade", startDate: "2025-04-14", endDate: "2025-04-14", isHoliday: true, description: "Aniversário de fundação de Botucatu em 14/04/1855", restrictionLevel: "low" },
    { id: 4, cityName: "Bauru", name: "Aniversário da Cidade", startDate: "2025-08-01", endDate: "2025-08-01", isHoliday: true, description: "Aniversário de fundação de Bauru em 01/08/1896", restrictionLevel: "low" },
    { id: 5, cityName: "Ribeirão Preto", name: "Aniversário da Cidade", startDate: "2025-06-19", endDate: "2025-06-19", isHoliday: true, description: "Aniversário de fundação de Ribeirão Preto em 19/06/1856", restrictionLevel: "low" },
    { id: 6, cityName: "São Paulo", name: "Aniversário da Cidade", startDate: "2025-01-25", endDate: "2025-01-25", isHoliday: true, description: "Aniversário de fundação de São Paulo em 25/01/1554", restrictionLevel: "high" },
    { id: 7, cityName: "Campinas", name: "Aniversário da Cidade", startDate: "2025-07-14", endDate: "2025-07-14", isHoliday: true, description: "Aniversário de fundação de Campinas em 14/07/1774", restrictionLevel: "medium" },
    { id: 8, cityName: "São Carlos", name: "Aniversário da Cidade", startDate: "2025-11-04", endDate: "2025-11-04", isHoliday: true, description: "Aniversário de fundação de São Carlos em 04/11/1857", restrictionLevel: "low" },
    { id: 100, cityName: "Piedade", name: "Aniversário da Cidade", startDate: "2025-03-19", endDate: "2025-03-19", isHoliday: true, description: "Aniversário de fundação de Piedade em 19/03/1842", restrictionLevel: "low" },
    
    // Aniversários de cidades de São Paulo - Janeiro
    { id: 101, cityName: "Uru", name: "Aniversário da Cidade", startDate: "2025-01-01", endDate: "2025-01-01", isHoliday: true, description: "Aniversário de fundação de Uru", restrictionLevel: "low" },
    { id: 102, cityName: "Morro Agudo", name: "Aniversário da Cidade", startDate: "2025-01-06", endDate: "2025-01-06", isHoliday: true, description: "Aniversário de fundação de Morro Agudo", restrictionLevel: "low" },
    { id: 124, cityName: "Santos", name: "Aniversário da Cidade", startDate: "2025-01-26", endDate: "2025-01-26", isHoliday: true, description: "Aniversário de fundação de Santos", restrictionLevel: "medium" },
    
    // Aniversários de cidades de São Paulo - Fevereiro
    { id: 127, cityName: "Itu", name: "Aniversário da Cidade", startDate: "2025-02-02", endDate: "2025-02-02", isHoliday: true, description: "Aniversário de fundação de Itu", restrictionLevel: "medium" },
    { id: 130, cityName: "Osasco", name: "Aniversário da Cidade", startDate: "2025-02-19", endDate: "2025-02-19", isHoliday: true, description: "Aniversário de fundação de Osasco", restrictionLevel: "medium" },
    
    // Aniversários de cidades de São Paulo - Março
    { id: 135, cityName: "Itaporanga", name: "Aniversário da Cidade", startDate: "2025-03-06", endDate: "2025-03-06", isHoliday: true, description: "Aniversário de fundação de Itaporanga", restrictionLevel: "low" },
    { id: 137, cityName: "Batatais", name: "Aniversário da Cidade", startDate: "2025-03-14", endDate: "2025-03-14", isHoliday: true, description: "Aniversário de fundação de Batatais", restrictionLevel: "low" },
    { id: 139, cityName: "Araras", name: "Aniversário da Cidade", startDate: "2025-03-24", endDate: "2025-03-24", isHoliday: true, description: "Aniversário de fundação de Araras", restrictionLevel: "medium" },
    
    // Aniversários de cidades de São Paulo - Maio
    { id: 147, cityName: "Barra do Chapéu", name: "Aniversário da Cidade", startDate: "2025-05-19", endDate: "2025-05-19", isHoliday: true, description: "Aniversário de fundação de Barra do Chapéu", restrictionLevel: "low" },
    
    // Aniversários de cidades de São Paulo - Setembro
    { id: 166, cityName: "Ribeirão Branco", name: "Aniversário da Cidade", startDate: "2025-09-05", endDate: "2025-09-05", isHoliday: true, description: "Aniversário de fundação de Ribeirão Branco", restrictionLevel: "low" },
    
    // Aniversários de cidades de Minas Gerais
    { id: 301, cityName: "Belo Horizonte", name: "Aniversário da Cidade", startDate: "2025-12-12", endDate: "2025-12-12", isHoliday: true, description: "Aniversário de fundação de Belo Horizonte", restrictionLevel: "high" }
  ];

  // Exportar para uso no GitHub Pages
  if (typeof window !== 'undefined') {
    console.log("Carregando aniversários de cidades: " + cityEvents.length + " eventos");
    window.additionalCityEvents = cityEvents;
    
    // Tentar adicionar ao mockData
    if (window.mockData && window.mockData.cityEvents) {
      console.log("Adicionando eventos de cidades ao mockData");
      window.mockData.cityEvents = window.mockData.cityEvents.concat(cityEvents);
    }
  }
}

// Chamar função para carregar eventos assim que o script é carregado
loadCityEvents();