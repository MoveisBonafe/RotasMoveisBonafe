/**
 * Serviço para consulta de aniversários de cidades brasileiras via Google Calendar
 * 
 * Este serviço utiliza a API do Google Calendar para buscar datas oficiais
 * de aniversários das cidades brasileiras, garantindo informações atualizadas
 * e de fontes confiáveis.
 */

// Armazenamento em cache das datas já consultadas
const cityAnniversaryCache = {};

/**
 * Configura a autenticação com a API do Google Calendar
 * Essa função deve ser chamada uma vez durante a inicialização da aplicação
 * 
 * @param {string} apiKey - Chave de API do Google (opcional se usar client auth)
 * @returns {Promise<boolean>} - Retorna true se a inicialização for bem-sucedida
 */
async function initGoogleCalendarAPI(apiKey) {
    try {
        // Verificar se o SDK do Google já está carregado
        if (!window.gapi) {
            console.log("Carregando Google API Client...");
            // Carregar o SDK do Google
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.onload = resolve;
                document.body.appendChild(script);
            });
        }

        // Inicializar cliente da API
        return new Promise((resolve) => {
            window.gapi.load('client', async () => {
                try {
                    // Inicializar o cliente com a chave da API fornecida
                    await window.gapi.client.init({
                        apiKey: apiKey,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    });
                    console.log("Google Calendar API inicializada com sucesso");
                    resolve(true);
                } catch (error) {
                    console.error("Erro ao inicializar Google Calendar API:", error);
                    resolve(false);
                }
            });
        });
    } catch (error) {
        console.error("Erro ao carregar SDK do Google:", error);
        return false;
    }
}

/**
 * Busca a data de aniversário de uma cidade no Google Calendar
 * 
 * @param {string} cityName - Nome da cidade
 * @param {string} calendarId - ID do calendário que contém os aniversários (opcional)
 * @returns {Promise<Object>} - Objeto com os detalhes do aniversário
 */
async function fetchCityAnniversary(cityName, calendarId = 'primary') {
    // Verificar se já temos essa informação em cache
    if (cityAnniversaryCache[cityName]) {
        console.log(`Usando dados em cache para ${cityName}`);
        return cityAnniversaryCache[cityName];
    }
    
    try {
        console.log(`Buscando aniversário de ${cityName} no Google Calendar...`);
        
        // Formatando a consulta para encontrar eventos relacionados ao aniversário da cidade
        const query = `Aniversário ${cityName}`;
        
        // Definir o período de busca (próximo ano)
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        
        // Executar a consulta na API do Google Calendar
        const response = await window.gapi.client.calendar.events.list({
            'calendarId': calendarId,
            'timeMin': today.toISOString(),
            'timeMax': nextYear.toISOString(),
            'q': query,
            'singleEvents': true,
            'orderBy': 'startTime'
        });

        // Processar os resultados
        if (response.result.items && response.result.items.length > 0) {
            // Encontramos um evento de aniversário
            const event = response.result.items[0];
            
            // Extrair dados relevantes
            const result = {
                success: true,
                cityName: cityName,
                date: event.start.date || event.start.dateTime,
                description: event.description || `Aniversário de ${cityName}`,
                source: 'Google Calendar',
                year: new Date(event.start.date || event.start.dateTime).getFullYear()
            };
            
            // Armazenar em cache
            cityAnniversaryCache[cityName] = result;
            
            return result;
        } else {
            // Evento não encontrado
            const fallbackResult = {
                success: false,
                cityName: cityName,
                error: "Aniversário não encontrado no Google Calendar",
                source: 'Sem dados',
                message: `Consulte o site oficial da prefeitura de ${cityName} para obter a data de aniversário.`
            };
            
            // Armazenar o resultado negativo em cache também
            cityAnniversaryCache[cityName] = fallbackResult;
            
            return fallbackResult;
        }
    } catch (error) {
        console.error(`Erro ao buscar aniversário de ${cityName}:`, error);
        
        // Retornar erro
        return {
            success: false,
            cityName: cityName,
            error: error.message || "Erro na consulta à API do Google Calendar",
            source: 'Erro',
            message: `Não foi possível consultar o aniversário de ${cityName}. Consulte fontes oficiais.`
        };
    }
}

/**
 * Cria um evento de aniversário no formato usado pelo sistema
 * 
 * @param {Object} anniversaryData - Dados do aniversário retornados pela API
 * @returns {Object} - Evento formatado para uso no sistema
 */
function createCityAnniversaryEvent(anniversaryData) {
    // Verificar se temos dados válidos
    if (!anniversaryData || !anniversaryData.success || !anniversaryData.date) {
        console.warn(`Dados de aniversário insuficientes para ${anniversaryData?.cityName || 'cidade desconhecida'}`);
        return null;
    }
    
    // Extrair a data do aniversário
    const anniversaryDate = new Date(anniversaryData.date);
    
    // Criar o evento para o ano atual ou próximo
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear;
    
    // Formatar as datas no formato YYYY-MM-DD
    const month = anniversaryDate.getMonth() + 1;
    const day = anniversaryDate.getDate();
    const formattedDate = `${targetYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Criar o objeto de evento no formato esperado pelo sistema
    return {
        id: `anniversary-${anniversaryData.cityName.replace(/\s+/g, '-').toLowerCase()}`,
        cityName: anniversaryData.cityName,
        name: `Aniversário da Cidade`,
        startDate: formattedDate,
        endDate: formattedDate,
        isHoliday: true,
        description: anniversaryData.description || `Aniversário de fundação de ${anniversaryData.cityName}`,
        restrictionLevel: "low",
        source: anniversaryData.source
    };
}

// Exportar as funções para uso no sistema
window.CityCalendarService = {
    initGoogleCalendarAPI,
    fetchCityAnniversary,
    createCityAnniversaryEvent
};