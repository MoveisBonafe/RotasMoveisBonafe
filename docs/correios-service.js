/**
 * Serviço para consulta de CEPs e endereços usando a API dos Correios
 * 
 * Este serviço permite consultar informações de endereços a partir de CEPs
 * utilizando a API oficial dos Correios.
 */

// Cache para armazenar consultas já realizadas
const cepCache = {};

/**
 * Busca um endereço a partir de um CEP usando a API dos Correios
 * 
 * @param {string} cep - CEP a ser consultado (apenas números ou com hífen)
 * @returns {Promise<Object>} - Dados do endereço
 */
async function searchAddressByCEP(cep) {
    // Formatar o CEP (remover caracteres não numéricos)
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Verificar se é um CEP válido (8 dígitos)
    if (cleanCEP.length !== 8) {
        console.error(`CEP inválido: ${cep}. Deve conter 8 dígitos.`);
        return {
            success: false,
            error: 'CEP inválido. Deve conter 8 dígitos.',
            originalCEP: cep
        };
    }
    
    // Verificar se já temos o resultado em cache
    if (cepCache[cleanCEP]) {
        console.log(`Usando dados em cache para o CEP ${cleanCEP}`);
        return cepCache[cleanCEP];
    }
    
    try {
        console.log(`Consultando CEP ${cleanCEP} na API dos Correios...`);
        
        // Construir a URL para a consulta
        // Usando o serviço ViaCEP que é uma API pública que encapsula o serviço dos Correios
        // Os Correios não possuem uma API pública oficial, mas o ViaCEP é amplamente utilizado
        const url = `https://viacep.com.br/ws/${cleanCEP}/json/`;
        
        // Realizar a consulta
        const response = await fetch(url);
        const data = await response.json();
        
        // Verificar se houve erro na consulta
        if (data.erro) {
            const errorResult = {
                success: false,
                error: 'CEP não encontrado na base dos Correios',
                originalCEP: cep
            };
            
            // Armazenar erro em cache para evitar consultas repetidas
            cepCache[cleanCEP] = errorResult;
            return errorResult;
        }
        
        // Formatar o resultado
        const result = {
            success: true,
            cep: data.cep,
            street: data.logradouro,
            complement: data.complemento,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            ibgeCode: data.ibge,
            originalCEP: cep,
            source: 'Correios/ViaCEP'
        };
        
        // Armazenar em cache
        cepCache[cleanCEP] = result;
        
        // Verificar se esta cidade tem aniversário no Google Calendar
        if (window.CityCalendarService && result.city) {
            console.log(`🔍 Verificando aniversário de ${result.city} no Google Calendar...`);
            // Realizar a busca de aniversário de forma assíncrona, sem bloquear
            window.CityCalendarService.fetchCityAnniversary(result.city)
                .then(anniversaryData => {
                    console.log(`📅 Dados de aniversário para ${result.city}:`, anniversaryData);
                })
                .catch(error => {
                    console.error(`Erro ao buscar aniversário de ${result.city}:`, error);
                });
        }
        
        return result;
    } catch (error) {
        console.error(`Erro ao consultar CEP ${cleanCEP}:`, error);
        
        const errorResult = {
            success: false,
            error: `Erro na consulta: ${error.message || 'Falha na comunicação com a API'}`,
            originalCEP: cep
        };
        
        return errorResult;
    }
}

/**
 * Busca um CEP a partir de um endereço
 * 
 * @param {string} state - Estado (UF)
 * @param {string} city - Cidade
 * @param {string} street - Logradouro/Rua
 * @returns {Promise<Object>} - Lista de CEPs encontrados
 */
async function searchCEPByAddress(state, city, street) {
    if (!state || !city || !street) {
        console.error('Estado, cidade e logradouro são obrigatórios');
        return {
            success: false,
            error: 'Estado, cidade e logradouro são obrigatórios'
        };
    }
    
    // Verificar se o estado tem 2 caracteres (UF)
    if (state.length !== 2) {
        console.error(`UF inválida: ${state}. Deve conter 2 caracteres.`);
        return {
            success: false,
            error: 'UF inválida. Deve conter 2 caracteres.'
        };
    }
    
    try {
        console.log(`Consultando endereço: ${street}, ${city} - ${state}`);
        
        // Construir a URL para a consulta usando ViaCEP
        const url = `https://viacep.com.br/ws/${state}/${city}/${street}/json/`;
        
        // Realizar a consulta
        const response = await fetch(url);
        const data = await response.json();
        
        // Verificar se encontrou resultados
        if (!Array.isArray(data) || data.length === 0) {
            return {
                success: false,
                error: 'Endereço não encontrado na base dos Correios',
                addressParams: { state, city, street }
            };
        }
        
        // Verificar se esta cidade tem aniversário no Google Calendar
        if (window.CityCalendarService && city) {
            console.log(`🔍 Verificando aniversário de ${city} no Google Calendar via pesquisa de endereço...`);
            // Realizar a busca de aniversário de forma assíncrona, sem bloquear
            window.CityCalendarService.fetchCityAnniversary(city)
                .then(anniversaryData => {
                    console.log(`📅 Dados de aniversário para ${city}:`, anniversaryData);
                })
                .catch(error => {
                    console.error(`Erro ao buscar aniversário de ${city}:`, error);
                });
        }
        
        // Formatar o resultado
        return {
            success: true,
            results: data.map(item => ({
                cep: item.cep,
                street: item.logradouro,
                complement: item.complemento,
                neighborhood: item.bairro,
                city: item.localidade,
                state: item.uf,
                ibgeCode: item.ibge,
                source: 'Correios/ViaCEP'
            })),
            addressParams: { state, city, street }
        };
    } catch (error) {
        console.error(`Erro ao consultar endereço:`, error);
        
        return {
            success: false,
            error: `Erro na consulta: ${error.message || 'Falha na comunicação com a API'}`,
            addressParams: { state, city, street }
        };
    }
}

// Exportar as funções para uso no sistema
window.CorreiosService = {
    searchAddressByCEP,
    searchCEPByAddress
};