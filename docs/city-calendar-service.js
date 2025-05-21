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
 * Database local para aniversários de cidades
 * Usado como fallback quando o Google Calendar não está disponível (como no GitHub Pages)
 */
const localCityAnniversaryDatabase = {
    // São Paulo - Capital e região
    "São Paulo": { date: "2025-01-25", description: "Aniversário da cidade de São Paulo" },
    "Guarulhos": { date: "2025-12-08", description: "Aniversário da cidade de Guarulhos" },
    "Campinas": { date: "2025-07-14", description: "Aniversário da cidade de Campinas" },
    
    // Região de Dois Córregos e Interior de SP
    "Dois Córregos": { date: "2025-04-19", description: "Aniversário da cidade de Dois Córregos" },
    "Jaú": { date: "2025-08-15", description: "Aniversário da cidade de Jaú" },
    "Brotas": { date: "2025-05-03", description: "Aniversário da cidade de Brotas" },
    "Bauru": { date: "2025-08-01", description: "Aniversário da cidade de Bauru" },
    "Botucatu": { date: "2025-04-14", description: "Aniversário da cidade de Botucatu" },
    
    // Outras regiões importantes
    "Ribeirão Preto": { date: "2025-06-19", description: "Aniversário da cidade de Ribeirão Preto" },
    "São José do Rio Preto": { date: "2025-03-19", description: "Aniversário da cidade de São José do Rio Preto" },
    "Presidente Prudente": { date: "2025-09-14", description: "Aniversário da cidade de Presidente Prudente" },
    "Sorocaba": { date: "2025-08-15", description: "Aniversário da cidade de Sorocaba" },
    "Santos": { date: "2025-01-26", description: "Aniversário da cidade de Santos" },
    
    // Cidades mais recentes no roteiro
    "Taquarivaí": { date: "2025-12-28", description: "Aniversário da cidade de Taquarivaí" },
    "Ribeirão Branco": { date: "2025-03-19", description: "Aniversário da cidade de Ribeirão Branco" },
    "Buri": { date: "2025-10-19", description: "Aniversário da cidade de Buri" }
};

/**
 * Configura a autenticação com a API do Google Calendar
 * Essa função deve ser chamada uma vez durante a inicialização da aplicação
 * NOTA: Para GitHub Pages, usamos um método alternativo com fallback para dados estáticos
 * 
 * @param {string} apiKey - Chave de API do Google (opcional se usar client auth)
 * @returns {Promise<boolean>} - Retorna true se a inicialização for bem-sucedida
 */
async function initGoogleCalendarAPI(apiKey) {
    console.log("Inicializando serviço de verificação de aniversários de cidades");
    
    // Para GitHub Pages, detectamos o ambiente e usamos um método adaptado
    const isGitHubPages = window.location.hostname.includes('github.io') || 
                         window.location.hostname === 'moveisbonafe.github.io' ||
                         document.querySelector('meta[name="github-pages"]') !== null;
    
    if (isGitHubPages) {
        console.log("Ambiente GitHub Pages detectado - usando método alternativo para calendário");
        
        // Em GitHub Pages, usamos uma abordagem simplificada com fallback
        window._githubPagesCalendarMode = true;
        
        // Simular sucesso para não interromper o fluxo da aplicação
        return Promise.resolve(true);
    }
    
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
                    console.log("Usando método alternativo para calendário devido ao erro");
                    window._githubPagesCalendarMode = true;
                    resolve(true); // Retorna true mesmo com erro para não interromper o fluxo
                }
            });
        });
    } catch (error) {
        console.error("Erro ao carregar SDK do Google:", error);
        console.log("Usando método alternativo para calendário devido ao erro");
        window._githubPagesCalendarMode = true;
        return true; // Retorna true mesmo com erro para não interromper o fluxo
    }
}

/**
 * Busca aniversário no banco de dados local
 * @param {string} cityName - Nome da cidade normalizado
 * @returns {Object} - Dados do aniversário
 */
function fetchFromLocalDatabase(cityName) {
    // Buscar diretamente pelo nome da cidade
    if (localCityAnniversaryDatabase[cityName]) {
        const cityData = localCityAnniversaryDatabase[cityName];
        const result = {
            success: true,
            cityName: cityName,
            date: cityData.date,
            description: cityData.description,
            source: 'Banco de dados local',
            year: parseInt(cityData.date.split('-')[0])
        };
        
        // Armazenar em cache
        cityAnniversaryCache[cityName] = result;
        console.log(`Aniversário de ${cityName} encontrado no banco local:`, result);
        
        return result;
    }
    
    // Tentar busca parcial (para nomes compostos)
    for (const [dbCityName, cityData] of Object.entries(localCityAnniversaryDatabase)) {
        if (cityName.includes(dbCityName) || dbCityName.includes(cityName)) {
            const result = {
                success: true,
                cityName: cityName,
                date: cityData.date,
                description: cityData.description,
                source: 'Banco de dados local (correspondência parcial)',
                year: parseInt(cityData.date.split('-')[0])
            };
            
            // Armazenar em cache
            cityAnniversaryCache[cityName] = result;
            console.log(`Aniversário de ${cityName} encontrado no banco local (correspondência parcial com ${dbCityName}):`, result);
            
            return result;
        }
    }
    
    // Se não encontrou nada
    const fallbackResult = {
        success: false,
        cityName: cityName,
        error: "Aniversário não encontrado no banco de dados",
        source: 'Sem dados',
        message: `Consulte o site oficial da prefeitura de ${cityName} para obter a data de aniversário.`
    };
    
    // Armazenar o resultado negativo em cache também
    cityAnniversaryCache[cityName] = fallbackResult;
    console.log(`Aniversário de ${cityName} não encontrado no banco local`);
    
    return fallbackResult;
}

/**
 * Busca a data de aniversário de uma cidade no Google Calendar
 * Com fallback para um banco local para GitHub Pages
 * 
 * @param {string} cityName - Nome da cidade
 * @param {string} calendarId - ID do calendário que contém os aniversários (opcional)
 * @returns {Promise<Object>} - Objeto com os detalhes do aniversário
 */
async function fetchCityAnniversary(cityName, calendarId = 'primary') {
    if (!cityName) {
        console.error("Nome da cidade não fornecido para busca de aniversário");
        return {
            success: false,
            error: "Nome da cidade não fornecido",
            source: 'Erro'
        };
    }
    
    // Normalizar nome da cidade (remover "SP", "-SP", etc.)
    const normalizedCityName = cityName.replace(/\s*[-,]\s*[A-Z]{2}$/g, '')
                                      .replace(/\s+\([^)]+\)/g, '')
                                      .trim();
    
    console.log(`Buscando aniversário para: ${normalizedCityName} (original: ${cityName})`);
    
    // Verificar se já temos essa informação em cache
    if (cityAnniversaryCache[normalizedCityName]) {
        console.log(`Usando dados em cache para ${normalizedCityName}`);
        return cityAnniversaryCache[normalizedCityName];
    }
    
    // Para GitHub Pages ou quando há erro na API, usar banco local
    if (window._githubPagesCalendarMode) {
        console.log(`Usando banco local para aniversário de ${normalizedCityName} (modo GitHub Pages)`);
        return fetchFromLocalDatabase(normalizedCityName);
    }
    
    try {
        console.log(`Buscando aniversário de ${normalizedCityName} no Google Calendar...`);
        
        // Formatando a consulta para encontrar eventos relacionados ao aniversário da cidade
        const query = `Aniversário ${normalizedCityName}`;
        
        // Definir o período de busca (próximo ano)
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        
        // Verificar se temos acesso à API do Google
        if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
            console.warn("API do Google Calendar não disponível, usando banco local");
            return fetchFromLocalDatabase(normalizedCityName);
        }
        
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
                cityName: normalizedCityName,
                date: event.start.date || event.start.dateTime,
                description: event.description || `Aniversário de ${normalizedCityName}`,
                source: 'Google Calendar',
                year: new Date(event.start.date || event.start.dateTime).getFullYear()
            };
            
            // Armazenar em cache
            cityAnniversaryCache[normalizedCityName] = result;
            
            return result;
        } else {
            // Tentar o banco local como fallback
            console.log(`Evento não encontrado no Google Calendar, tentando banco local para ${normalizedCityName}`);
            return fetchFromLocalDatabase(normalizedCityName);
        }
    } catch (error) {
        console.error(`Erro ao buscar aniversário de ${normalizedCityName}:`, error);
        
        // Tentar o banco local como fallback
        console.log(`Devido ao erro, tentando banco local para ${normalizedCityName}`);
        return fetchFromLocalDatabase(normalizedCityName);
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