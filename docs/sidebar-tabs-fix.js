/**
 * Correção para o sistema de abas nas guias inferiores
 * Este script força a separação correta dos conteúdos das abas inferiores
 */

document.addEventListener('DOMContentLoaded', function() {
    // Dar tempo para que outros scripts carreguem
    setTimeout(fixBottomTabs, 1000);
});

/**
 * Força a correção do sistema de abas inferiores
 */
function fixBottomTabs() {
    console.log("🛠️ Aplicando correção para sistema de abas inferiores");
    
    // Obter os elementos de abas
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    const tabContents = document.querySelectorAll('.bottom-tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.warn("❌ Sistema de abas não encontrado");
        return;
    }
    
    console.log(`📋 Encontrados ${tabButtons.length} botões e ${tabContents.length} painéis de conteúdo`);
    
    // Inicialmente esconder todos os conteúdos
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Mostrar apenas o conteúdo da primeira aba
    if (tabContents[0]) {
        tabContents[0].style.display = 'flex'; // Usar flex para compatibilidade
    }
    
    // Adicionar novo listener para cada botão
    tabButtons.forEach(button => {
        // Remover event listeners antigos
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener
        newButton.addEventListener('click', function(event) {
            // Impedir o comportamento padrão
            event.preventDefault();
            event.stopPropagation();
            
            // Obter o ID da aba
            const tabId = this.getAttribute('data-tab');
            console.log(`🔄 Alternando para aba: ${tabId}`);
            
            // Esconder todos os conteúdos
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Remover classe ativa de todos os botões
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar classe ativa ao botão clicado
            this.classList.add('active');
            
            // Mostrar o conteúdo correspondente
            const contentMap = {
                'bottom-events': 'bottom-events-content',
                'bottom-restrictions': 'bottom-restrictions-content',
                'bottom-report': 'bottom-report-content'
            };
            
            const contentId = contentMap[tabId];
            if (contentId) {
                const content = document.getElementById(contentId);
                if (content) {
                    content.style.display = 'flex';
                    
                    // Efeito de animação
                    content.style.animation = 'none';
                    setTimeout(() => {
                        content.style.animation = 'fadeInUp 0.3s ease-out';
                    }, 10);
                    
                    console.log(`✅ Conteúdo ativado: ${contentId}`);
                }
            }
            
            // Verificar se o painel está minimizado e, se estiver, expandi-lo
            const container = document.querySelector('.bottom-tabs-container');
            if (container && container.classList.contains('minimized')) {
                container.classList.remove('minimized');
                const toggleIcon = document.getElementById('toggle-icon');
                if (toggleIcon) {
                    toggleIcon.textContent = '▼ Minimizar';
                }
            }
            
            return false;
        });
    });
    
    console.log("✅ Correção do sistema de abas aplicada com sucesso");
    
    // Agora vamos garantir que os eventos das cidades estejam sendo exibidos
    fixCityEvents();
}

/**
 * Garante que os eventos das cidades sejam exibidos corretamente
 */
function fixCityEvents() {
    console.log("🔍 Verificando eventos de cidades");
    
    // Verificar se há eventos para mostrar
    if (window.mockData && Array.isArray(window.mockData.cityEvents)) {
        console.log(`📅 Encontrados ${window.mockData.cityEvents.length} eventos no sistema`);
        
        // Verificar se estamos no GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io') || 
                              window.location.hostname === 'moveisbonafe.github.io';
        
        if (isGitHubPages) {
            console.log("🌐 Ambiente GitHub Pages detectado - aplicando correções específicas");
            window._githubPagesCalendarMode = true;
            
            // Para GitHub Pages, precisamos garantir que os aniversários sejam verificados
            setTimeout(() => {
                if (window.locations && Array.isArray(window.locations)) {
                    window.locations.forEach(location => {
                        let cityName = extractCityName(location);
                        if (cityName) {
                            console.log(`🔎 Verificando aniversário para cidade já adicionada: ${cityName}`);
                            window.CityCalendarService.fetchCityAnniversary(cityName)
                                .then(result => {
                                    if (result && result.success) {
                                        const event = window.CityCalendarService.createCityAnniversaryEvent(result);
                                        if (event) {
                                            // Verificar se o evento já existe
                                            const exists = window.mockData.cityEvents.some(e => 
                                                e.cityName === event.cityName && e.name === "Aniversário da Cidade");
                                            
                                            if (!exists) {
                                                window.mockData.cityEvents.push(event);
                                                console.log(`✅ Adicionado aniversário para ${cityName}`);
                                                
                                                // Forçar atualização da lista de eventos
                                                const cityIds = window.locations.map(loc => loc.id);
                                                if (typeof window.showEventsForCitiesOnRoute === 'function') {
                                                    window.showEventsForCitiesOnRoute(cityIds);
                                                }
                                            }
                                        }
                                    }
                                });
                        }
                    });
                }
            }, 2000);
        }
    } else {
        console.warn("❌ Dados de eventos não encontrados");
    }
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