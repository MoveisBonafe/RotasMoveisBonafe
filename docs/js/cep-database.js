/**
 * Banco de dados de CEPs para uso offline
 * Este arquivo contém um mapeamento básico de CEPs para coordenadas
 */

// Função para obter coordenadas de um CEP (versão simplificada)
function getCepCoordinates(cep) {
    // Remover caracteres não numéricos
    cep = cep.replace(/\D/g, '');
    
    // Verificar se o CEP está no formato correto
    if (cep.length !== 8) {
        console.warn(`CEP inválido: ${cep}`);
        return null;
    }
    
    // Buscar no banco de dados local (se disponível)
    if (typeof cepDatabase !== 'undefined' && cepDatabase[cep]) {
        return cepDatabase[cep];
    }
    
    // Caso não encontre, retorna null
    console.warn(`CEP não encontrado no banco de dados local: ${cep}`);
    return null;
}

// Base de dados mínima para testes - apenas alguns CEPs importantes
const cepDatabase = {
    // Dois Córregos (origem)
    "17300000": { lat: -22.3673, lng: -48.3822 },
    
    // Algumas cidades próximas
    "17340000": { lat: -22.2990, lng: -48.5569 }, // Barra Bonita
    "17280000": { lat: -22.4559, lng: -48.7908 }, // Pederneiras
    "17400000": { lat: -22.5253, lng: -48.5563 }, // Jaú
    "13650000": { lat: -22.3529, lng: -47.8567 }, // Santa Cruz da Conceição
    "18682000": { lat: -23.0333, lng: -48.9167 }  // Lençóis Paulista
};
