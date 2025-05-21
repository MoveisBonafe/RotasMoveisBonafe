/**
 * Integração do sistema de verificação de aniversários de cidades
 * Utiliza a API do Google Calendar para buscar dados oficiais
 */

// Inicializar após o carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando integração de busca de aniversários de cidades");
    
    setTimeout(setupCityAnniversarySystem, 1000);
});

/**
 * Configura o sistema de verificação de aniversários de cidades
 */
function setupCityAnniversarySystem() {
    if (!window.CityCalendarService) {
        console.warn("⚠️ Serviço de calendário não disponível. Verificação de aniversários não será possível.");
        return;
    }
    
    // Sobrescrever a função de adição de localização original
    enhanceCityEventsSystem();
    
    console.log("✅ Sistema de verificação de aniversários de cidades configurado com sucesso");
}

/**
 * Aprimora o sistema de eventos de cidade com verificação de aniversários
 */
function enhanceCityEventsSystem() {
    // Monitorar adição de novas cidades
    const originalPushMethod = Array.prototype.push;
    if (window.locations && Array.isArray(window.locations)) {
        window.locations.push = function() {
            // Chamar método original primeiro
            const result = originalPushMethod.apply(this, arguments);
            
            // Processar novos locais adicionados
            const newLocation = arguments[0];
            if (newLocation && typeof newLocation === 'object') {
                console.log("📍 Nova localização adicionada:", newLocation);
                
                // Extrair nome da cidade da localização
                let cityName = null;
                
                if (newLocation.address) {
                    const addressParts = newLocation.address.split(',');
                    if (addressParts.length > 0) {
                        cityName = addressParts[0].trim();
                    }
                }
                
                if (newLocation.name && !cityName) {
                    // Tentar extrair da propriedade name
                    const nameParts = newLocation.name.split(',');
                    if (nameParts.length > 0) {
                        cityName = nameParts[0].trim();
                    }
                }
                
                // Se encontrou um nome de cidade, verificar aniversário
                if (cityName) {
                    console.log(`🔍 Verificando aniversário da cidade: ${cityName}`);
                    checkCityAnniversary(cityName);
                }
            }
            
            return result;
        };
    }
    
    console.log("🔄 Sistema de eventos de cidade aprimorado com verificação automática de aniversários");
}

/**
 * Verifica o aniversário de uma cidade e adiciona aos eventos
 */
function checkCityAnniversary(cityName) {
    if (!cityName || cityName === "Localização Aproximada") return;
    
    console.log(`🔍 Verificando aniversário para: ${cityName}`);
    
    if (!window.CityCalendarService) {
        console.warn('⚠️ Serviço de calendário não disponível para verificar aniversário de', cityName);
        return;
    }
    
    // Inicializar a API do Google Calendar se necessário
    if (!window.gapi || !window.gapi.client) {
        console.log('🔄 Inicializando Google Calendar API...');
        window.CityCalendarService.initGoogleCalendarAPI('AIzaSyCnallnTQ8gT2_F600vt-yAEv2BoH0mj7U')
            .then(success => {
                if (success) {
                    fetchAndAddCityAnniversary(cityName);
                } else {
                    console.warn('❌ Falha ao inicializar Google Calendar API');
                }
            })
            .catch(error => {
                console.error('🚫 Erro ao inicializar Google Calendar API:', error);
            });
    } else {
        fetchAndAddCityAnniversary(cityName);
    }
}

/**
 * Busca e adiciona o aniversário de uma cidade aos eventos do sistema
 */
function fetchAndAddCityAnniversary(cityName) {
    // Garantir que temos acesso à lista de eventos
    if (!window.mockData || !window.mockData.cityEvents) {
        console.error('❌ Não foi possível acessar a lista de eventos do sistema');
        return;
    }
    
    // Verificar se já existe um evento de aniversário para esta cidade
    const existingEvent = window.mockData.cityEvents.find(event => 
        event.cityName === cityName && event.name === 'Aniversário da Cidade'
    );
    
    if (existingEvent) {
        console.log(`📅 Aniversário de ${cityName} já está cadastrado:`, existingEvent);
        return;
    }
    
    // Buscar o aniversário via Google Calendar
    window.CityCalendarService.fetchCityAnniversary(cityName)
        .then(anniversaryData => {
            console.log(`📅 Dados de aniversário para ${cityName}:`, anniversaryData);
            
            if (anniversaryData && anniversaryData.success) {
                // Criar o evento de aniversário no formato do sistema
                const event = window.CityCalendarService.createCityAnniversaryEvent(anniversaryData);
                
                if (event) {
                    // Adicionar o evento à lista
                    window.mockData.cityEvents.push(event);
                    console.log(`✅ Evento de aniversário adicionado para ${cityName}`);
                    console.log('📋 Lista atualizada de eventos:', window.mockData.cityEvents);
                }
            } else {
                console.warn(`⚠️ Aniversário não encontrado para ${cityName}`);
            }
        })
        .catch(error => {
            console.error(`❌ Erro ao buscar aniversário de ${cityName}:`, error);
        });
}