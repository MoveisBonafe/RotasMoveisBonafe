/**
 * Correção específica para eventos e abas no GitHub Pages
 * Este script é executado apenas no ambiente do GitHub Pages
 */

// Executar assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔧 Iniciando correção específica para GitHub Pages...");
    
    // Verificar se estamos no GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io') || 
                         document.querySelector('meta[name="github-pages"]') !== null;
    
    if (!isGitHubPages) {
        console.log("❌ Não estamos no GitHub Pages, script não necessário");
        return;
    }
    
    console.log("✅ GitHub Pages detectado, aplicando correções");
    
    // Ativar modo GitHub Pages para calendário
    window._githubPagesCalendarMode = true;
    
    // Aguardar carregamento completo
    setTimeout(applyGitHubPagesFixes, 1500);
});

/**
 * Aplica todas as correções necessárias para o GitHub Pages
 */
function applyGitHubPagesFixes() {
    // 1. Corrigir abas inferiores
    fixBottomTabs();
    
    // 2. Corrigir exibição de eventos
    fixCityEvents();
    
    // 3. Adicionar aniversários para cidades já adicionadas
    addAnniversariesForExistingCities();
}

/**
 * Corrige o funcionamento das abas inferiores
 */
function fixBottomTabs() {
    console.log("🔧 Corrigindo sistema de abas inferiores para GitHub Pages");
    
    // Obter elementos de abas
    const tabContainer = document.querySelector('.bottom-tabs-container');
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    const tabContents = document.querySelectorAll('.bottom-tab-content');
    
    if (!tabContainer || !tabButtons.length || !tabContents.length) {
        console.warn("❌ Sistema de abas não encontrado");
        return;
    }
    
    console.log(`📋 Encontrados ${tabButtons.length} botões e ${tabContents.length} conteúdos`);
    
    // Primeiro, esconder todos os conteúdos
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Mostrar apenas o conteúdo da primeira aba (eventos)
    if (tabContents[0]) {
        tabContents[0].style.display = 'block';
    }
    
    // Substituir todos os event listeners
    tabButtons.forEach(button => {
        // Clone para remover event listeners antigos
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Obter ID da aba
            const tabId = this.getAttribute('data-tab');
            
            console.log(`🔄 Aba clicada: ${tabId}`);
            
            // Remover classe ativa de todas as abas
            tabButtons.forEach(btn => {
                const newBtn = document.querySelector(`[data-tab="${btn.getAttribute('data-tab')}"]`);
                if (newBtn) newBtn.classList.remove('active');
            });
            
            // Adicionar classe ativa à aba atual
            this.classList.add('active');
            
            // Esconder todos os conteúdos
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Mostrar o conteúdo correspondente
            const contentIdMap = {
                'bottom-events': 'bottom-events-content',
                'bottom-restrictions': 'bottom-restrictions-content',
                'bottom-report': 'bottom-report-content'
            };
            
            const contentId = contentIdMap[tabId];
            if (contentId) {
                const content = document.getElementById(contentId);
                if (content) {
                    content.style.display = 'block';
                }
            }
            
            // Verificar se está minimizado e, se estiver, expandir
            if (tabContainer.classList.contains('minimized')) {
                tabContainer.classList.remove('minimized');
                
                // Atualizar ícone de toggle
                const toggleIcon = document.getElementById('toggle-icon');
                if (toggleIcon) {
                    toggleIcon.textContent = '▼ Minimizar';
                }
            }
        });
    });
    
    console.log("✅ Sistema de abas corrigido");
}

/**
 * Adiciona dados de aniversário para as cidades do banco de dados local
 */
function fixCityEvents() {
    console.log("🔧 Corrigindo eventos de cidades");
    
    // Esperar que o mockData esteja carregado
    if (!window.mockData || !window.mockData.cityEvents) {
        console.warn("❌ Dados de eventos não encontrados");
        setTimeout(fixCityEvents, 1000);
        return;
    }
    
    console.log(`📋 Adicionando eventos de teste para o GitHub Pages`);
    
    // Adicionar aniversários para cidades principais
    const mainCities = [
        "Dois Córregos",
        "Jaú",
        "Bauru",
        "Botucatu",
        "Ribeirão Preto"
    ];
    
    // Adicionar eventos de aniversário para as cidades principais
    mainCities.forEach(cityName => {
        const exists = window.mockData.cityEvents.some(e => 
            e.cityName === cityName && e.name === "Aniversário da Cidade");
        
        if (!exists) {
            console.log(`➕ Adicionando aniversário de teste para ${cityName}`);
            
            // Gerar uma data de aniversário aleatória para testes
            const now = new Date();
            const month = Math.floor(Math.random() * 12) + 1;
            const day = Math.floor(Math.random() * 28) + 1;
            const formattedDate = `${now.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            // Adicionar o evento
            window.mockData.cityEvents.push({
                id: `anniversary-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
                cityName: cityName,
                name: "Aniversário da Cidade",
                startDate: formattedDate,
                endDate: formattedDate,
                isHoliday: true,
                description: `Aniversário de fundação de ${cityName}`,
                restrictionLevel: "low",
                source: "Banco de dados local (GitHub Pages)"
            });
        }
    });
    
    // Forçar a atualização das abas
    setTimeout(() => {
        console.log("🔄 Forçando atualização das abas...");
        
        // Atualizar a lista de eventos para a origem
        if (window.showEventsForCitiesOnRoute && window.locations) {
            const cityIds = window.locations.map(loc => loc.id);
            window.showEventsForCitiesOnRoute(cityIds);
        }
        
        // Garantir que o conteúdo é exibido
        const eventContent = document.getElementById('bottom-events-content');
        if (eventContent) {
            eventContent.style.display = 'block';
        }
    }, 2000);
}

/**
 * Adiciona aniversários para cidades já adicionadas ao mapa
 */
function addAnniversariesForExistingCities() {
    // Verificar se temos localizações
    if (!window.locations || !Array.isArray(window.locations)) {
        console.warn("❌ Lista de localizações não encontrada");
        return;
    }
    
    // Verificar se temos o serviço de calendário
    if (!window.CityCalendarService) {
        console.warn("❌ Serviço de calendário não encontrado");
        return;
    }
    
    console.log(`🔍 Verificando aniversários para ${window.locations.length} localizações existentes`);
    
    // Percorrer todas as localizações
    window.locations.forEach(location => {
        // Extrair o nome da cidade
        let cityName = extractCityName(location);
        
        if (cityName) {
            console.log(`🔎 Verificando aniversário para: ${cityName}`);
            
            // Buscar aniversário
            window.CityCalendarService.fetchCityAnniversary(cityName)
                .then(result => {
                    if (result && result.success) {
                        // Criar evento
                        const event = window.CityCalendarService.createCityAnniversaryEvent(result);
                        
                        if (event && window.mockData && window.mockData.cityEvents) {
                            // Verificar se já existe
                            const exists = window.mockData.cityEvents.some(e => 
                                e.cityName === event.cityName && e.name === "Aniversário da Cidade");
                            
                            if (!exists) {
                                // Adicionar à lista
                                window.mockData.cityEvents.push(event);
                                console.log(`✅ Adicionado aniversário para ${cityName}: ${event.startDate}`);
                                
                                // Forçar atualização da lista de eventos
                                if (typeof window.showEventsForCitiesOnRoute === 'function') {
                                    const cityIds = window.locations.map(loc => loc.id);
                                    window.showEventsForCitiesOnRoute(cityIds);
                                }
                            }
                        }
                    }
                });
        }
    });
}

/**
 * Extrai o nome da cidade de uma localização
 */
function extractCityName(location) {
    if (!location) return null;
    
    // Extrair do endereço
    if (location.address) {
        const addressParts = location.address.split(',');
        if (addressParts.length > 0) {
            return addressParts[0].trim();
        }
    }
    
    // Extrair do nome
    if (location.name) {
        // Tentar extrair de padrão "CEP: xxxxx (Cidade, UF)"
        const cityMatch = location.name.match(/CEP:.*\((.*?),/);
        if (cityMatch && cityMatch[1]) {
            return cityMatch[1].trim();
        }
        
        // Tentar extrair de padrão simples
        const nameParts = location.name.split(',');
        if (nameParts.length > 0) {
            return nameParts[0].trim();
        }
    }
    
    return null;
}