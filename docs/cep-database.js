/**
 * Banco de dados CEP para o Otimizador de Rotas
 * Contém coordenadas precisas para CEPs específicos usados no aplicativo
 */

// Banco de dados CEP para geocodificação precisa
window.cepDatabase = {
  // Dois Córregos
  "17300": { city: "Dois Córregos", state: "SP", lat: -22.3673, lng: -48.3823 },
  "17302": { city: "Dois Córregos", state: "SP", lat: -22.3659, lng: -48.3811 },
  "17302-122": { city: "Dois Córregos", state: "SP", lat: -22.3618, lng: -48.3809 },
  
  // Ribeirão Preto
  "14091": { city: "Ribeirão Preto", state: "SP", lat: -21.1775, lng: -47.8103 },
  "14091-530": { city: "Ribeirão Preto", state: "SP", lat: -21.1842, lng: -47.8091 },
  
  // Vera Cruz
  "17560": { city: "Vera Cruz", state: "SP", lat: -22.2182, lng: -49.8208 },
  "17560-000": { city: "Vera Cruz", state: "SP", lat: -22.2190, lng: -49.8215 },
  
  // Pompéia
  "17580": { city: "Pompéia", state: "SP", lat: -22.1071, lng: -50.1758 },
  "17580-000": { city: "Pompéia", state: "SP", lat: -22.1080, lng: -50.1748 }
};

// Função para obter as coordenadas associadas a um CEP
function getCepCoordinates(cep) {
  // Limpar o CEP (remover hífen ou espaços)
  const cleanCep = cep.replace(/[^0-9]/g, '');
  
  // Tentar encontrar CEP exato
  if (window.cepDatabase[cep]) {
    return window.cepDatabase[cep];
  }
  
  // Tentar com CEP limpo
  if (window.cepDatabase[cleanCep]) {
    return window.cepDatabase[cleanCep];
  }
  
  // Tentar com prefixo de 5 dígitos
  const cepPrefix = cleanCep.substring(0, 5);
  if (window.cepDatabase[cepPrefix]) {
    return window.cepDatabase[cepPrefix];
  }
  
  // Tentar com prefixo de 3 dígitos
  const cepRegion = cleanCep.substring(0, 3);
  for (const key in window.cepDatabase) {
    if (key.startsWith(cepRegion)) {
      return window.cepDatabase[key];
    }
  }
  
  // Retornar coordenadas de Dois Córregos como fallback
  return window.cepDatabase["17300"];
}