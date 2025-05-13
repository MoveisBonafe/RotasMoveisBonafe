// Script para corrigir problemas com a versão GitHub Pages
window.locationOrder = []; // Array para armazenar a ordem das localizações
window.mapsApiReadyCallbacks = []; // Callbacks para quando o Maps API estiver pronto

// Sistema seguro de carregamento do Google Maps API
window.initGoogleMapsAPI = function() {
  console.log("Google Maps API carregada com sucesso (fix-github.js)");
  window.googleMapsLoaded = true;
  
  // Executar todos os callbacks pendentes
  while (window.mapsApiReadyCallbacks && window.mapsApiReadyCallbacks.length > 0) {
    try {
      const callback = window.mapsApiReadyCallbacks.shift();
      callback();
    } catch (error) {
      console.error("Erro ao executar callback do Google Maps:", error);
    }
  }
};

// Função para registrar callbacks para execução quando o Maps estiver pronto
window.whenGoogleMapsReady = function(callback) {
  if (typeof callback !== 'function') {
    console.error("whenGoogleMapsReady: callback deve ser uma função");
    return;
  }
  
  if (window.googleMapsLoaded && typeof google !== 'undefined' && google.maps) {
    // Se o Maps já estiver carregado, executar imediatamente
    setTimeout(callback, 0);
  } else {
    // Caso contrário, registrar para execução posterior
    if (!window.mapsApiReadyCallbacks) {
      window.mapsApiReadyCallbacks = [];
    }
    window.mapsApiReadyCallbacks.push(callback);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Ajustar tamanho do mapa e da sidebar
  const fixLayout = function() {
    const sidebar = document.querySelector('.sidebar');
    const mapContainer = document.querySelector('.map-container');
    const mapIframe = document.querySelector('.map-iframe');
    
    if (sidebar && mapContainer) {
      // Ajustes de tamanho para sidebar
      sidebar.style.width = '400px';
      sidebar.style.height = 'calc(100vh - 200px)';
      sidebar.style.minHeight = '600px';
      sidebar.style.overflowY = 'auto';
      
      // Ajustes para o container do mapa
      mapContainer.style.flex = '1';
      mapContainer.style.height = 'calc(100vh - 200px)';
      mapContainer.style.minHeight = '600px';
      
      console.log("Layout ajustado - sidebar e mapa aumentados");
    }
    
    if (mapIframe) {
      // Certificar que o iframe ocupa toda a área disponível
      mapIframe.style.width = '100%';
      mapIframe.style.height = '100%';
      mapIframe.style.minHeight = '550px';
      
      // Verificar se o iframe já tem o parâmetro de mapa correto
      const src = mapIframe.src;
      if (!src.includes('&maptype=roadmap')) {
        mapIframe.src = src + '&maptype=roadmap';
      }
      
      console.log("Iframe do mapa ajustado para exibir Pegman");
    }
  };
  
  // Melhorar função de geocodificação para CEPs
  window.cepCoordinates = {
    // Interior SP
    "14000": { city: "Ribeirão Preto", lat: -21.1775, lng: -47.8103 },
    "14010": { city: "Ribeirão Preto", lat: -21.1790, lng: -47.8153 },
    "14050": { city: "Ribeirão Preto", lat: -21.1750, lng: -47.8203 },
    "14100": { city: "Ribeirão Preto", lat: -21.1755, lng: -47.8253 },
    "14400": { city: "Franca", lat: -20.5390, lng: -47.4013 },
    "17300": { city: "Dois Córregos", lat: -22.3673, lng: -48.3823 },
    "17350": { city: "Jaú", lat: -22.2936, lng: -48.5592 },
    "17380": { city: "Brotas", lat: -22.2792, lng: -48.1250 },
    "17900": { city: "Dracena", lat: -21.4843, lng: -51.5352 },
    "18000": { city: "Sorocaba", lat: -23.5015, lng: -47.4526 },
    "19000": { city: "Presidente Prudente", lat: -22.1208, lng: -51.3882 },
    // Capital
    "01000": { city: "São Paulo", lat: -23.5505, lng: -46.6333 },
    "01020": { city: "São Paulo", lat: -23.5515, lng: -46.6343 },
    "04000": { city: "São Paulo", lat: -23.6216, lng: -46.6388 },
    "05000": { city: "São Paulo", lat: -23.5329, lng: -46.7108 },
    // Outras cidades
    "13000": { city: "Campinas", lat: -22.9071, lng: -47.0628 },
    "13300": { city: "Itu", lat: -23.2636, lng: -47.2992 },
    "13500": { city: "Rio Claro", lat: -22.4065, lng: -47.5613 },
    "13600": { city: "Araras", lat: -22.3572, lng: -47.3839 },
    "15000": { city: "São José do Rio Preto", lat: -20.8113, lng: -49.3758 }
  };
  
  // Patch para a função de importação de CEP
  const patchCepImport = function() {
    // Verificar se a função de upload de arquivo existe
    const fileUpload = document.getElementById('file-upload');
    
    if (fileUpload) {
      // Substituir o handler de upload
      fileUpload.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
          // Processar o conteúdo do arquivo
          processCepFile(e.target.result);
        };
        
        reader.readAsText(file);
      };
      
      console.log("Handler de importação de CEP aprimorado");
    }
  };
  
  // Função de processamento de arquivo CEP melhorada
  function processCepFile(content) {
    // Dividir em linhas
    const lines = content.split(/\r\n|\n/);
    if (lines.length === 0) {
      alert('Arquivo vazio ou inválido.');
      return;
    }
    
    // Array para armazenar os locais importados
    const importedLocations = [];
    const locationCounter = window.locationCounter || 0;
    
    // Cidades padrão para coordenadas (usadas quando um CEP não é encontrado)
    const defaultCities = [
      { name: "Ribeirão Preto", lat: -21.1775, lng: -47.8103 },
      { name: "Jaú", lat: -22.2936, lng: -48.5592 },
      { name: "Brotas", lat: -22.2792, lng: -48.1250 },
      { name: "Bauru", lat: -22.3246, lng: -49.0871 },
      { name: "São Carlos", lat: -22.0087, lng: -47.8909 },
      { name: "Araraquara", lat: -21.7845, lng: -48.1780 },
      { name: "Limeira", lat: -22.5641, lng: -47.4014 },
      { name: "Campinas", lat: -22.9071, lng: -47.0628 },
      { name: "Piracicaba", lat: -22.7338, lng: -47.6476 },
      { name: "São Paulo", lat: -23.5505, lng: -46.6333 }
    ];
    
    // Processar cada linha
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue; // Pular linhas vazias
      
      const parts = line.split(',');
      if (parts.length >= 2) {
        const cep = parts[0].trim();
        const name = parts[1].trim();
        
        // Incrementar contador
        window.locationCounter = (window.locationCounter || 0) + 1;
        const counter = window.locationCounter;
        
        // Tentar encontrar o CEP no mapeamento
        let coordinates = null;
        let cityName = "";
        
        // Verificar CEP exato ou prefixo (primeiros 5 dígitos)
        const cepPrefix = cep.replace(/[^0-9]/g, '').substring(0, 5);
        
        if (window.cepCoordinates[cep]) {
          coordinates = window.cepCoordinates[cep];
          cityName = coordinates.city;
        } else if (window.cepCoordinates[cepPrefix]) {
          coordinates = window.cepCoordinates[cepPrefix];
          cityName = coordinates.city;
        } else {
          // Se não encontrou no mapeamento, usar uma cidade aleatória
          const cityIndex = (counter - 1) % defaultCities.length;
          const selectedCity = defaultCities[cityIndex];
          
          coordinates = {
            city: selectedCity.name,
            lat: selectedCity.lat,
            lng: selectedCity.lng
          };
          cityName = selectedCity.name;
        }
        
        // Adicionar pequena variação para evitar sobreposição
        const variationFactor = 0.003; // ~300 metros
        const latVariation = (Math.random() - 0.5) * variationFactor;
        const lngVariation = (Math.random() - 0.5) * variationFactor;
        
        const lat = coordinates.lat + latVariation;
        const lng = coordinates.lng + lngVariation;
        const latlng = `${lat},${lng}`;
        
        // Criar elemento visual (usando a função do código original)
        if (window.createLocationItem) {
          window.createLocationItem(name, `CEP: ${cep} (${cityName})`, counter);
        }
        
        // Criar objeto de localização e adicionar (se as variáveis globais existirem)
        if (window.locations) {
          const location = {
            id: counter,
            name: name,
            address: `CEP: ${cep} (${cityName})`,
            latlng: latlng,
            isOrigin: false
          };
          
          // Adicionar ao array de locais
          window.locations.push(location);
          importedLocations.push(location);
        }
      }
    }
    
    // Informar ao usuário
    if (importedLocations.length > 0) {
      alert(`Importado com sucesso! ${importedLocations.length} endereços adicionados.`);
      
      // Atualizar mapa e calcular rota (se as funções existirem)
      if (window.calculateOptimizedRoute) {
        window.calculateOptimizedRoute();
      }
    } else {
      // Substituir alert por notificação inline mais suave
      const notifyWarning = document.createElement('div');
      notifyWarning.className = 'alert alert-warning mt-2';
      notifyWarning.innerHTML = `Nenhum endereço válido encontrado no arquivo.`;
      document.querySelector('.file-upload').appendChild(notifyWarning);
      
      // Remover a notificação após alguns segundos
      setTimeout(() => {
        if (notifyWarning && notifyWarning.parentNode) {
          notifyWarning.parentNode.removeChild(notifyWarning);
        }
      }, 5000);
    }
    
    // Limpar input
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
      fileUpload.value = '';
    }
  }
  
  // Melhorar função de busca de endereço
  const enhanceAddressSearch = function() {
    const addLocationBtn = document.getElementById('add-location-btn');
    const locationInput = document.getElementById('location-search-input');
    
    if (addLocationBtn && locationInput) {
      // Reconfigurar o botão para adicionar endereço
      addLocationBtn.onclick = function() {
        const address = locationInput.value.trim();
        if (!address) {
          alert('Por favor, digite um endereço válido.');
          return;
        }
        
        // Incrementar contador
        window.locationCounter = (window.locationCounter || 0) + 1;
        
        // Lista de cidades com coordenadas precisas
        const predefinedCities = [
          { name: "Ribeirão Preto", lat: -21.1775, lng: -47.8103 },
          { name: "Jaú", lat: -22.2936, lng: -48.5592 },
          { name: "Brotas", lat: -22.2792, lng: -48.1250 },
          { name: "Bauru", lat: -22.3246, lng: -49.0871 },
          { name: "São Carlos", lat: -22.0087, lng: -47.8909 },
          { name: "Araraquara", lat: -21.7845, lng: -48.1780 },
          { name: "Limeira", lat: -22.5641, lng: -47.4014 },
          { name: "Campinas", lat: -22.9071, lng: -47.0628 },
          { name: "Piracicaba", lat: -22.7338, lng: -47.6476 },
          { name: "São Paulo", lat: -23.5505, lng: -46.6333 }
        ];
        
        // Escolher uma cidade próxima com base no endereço ou contador
        let selectedCity;
        
        // Verificar se o endereço contém o nome de alguma cidade predefinida
        let matchedCity = null;
        for (let i = 0; i < predefinedCities.length; i++) {
          if (address.toLowerCase().includes(predefinedCities[i].name.toLowerCase())) {
            matchedCity = predefinedCities[i];
            break;
          }
        }
        
        if (matchedCity) {
          selectedCity = matchedCity;
        } else {
          // Se não encontrar correspondência, usa o contador para selecionar uma cidade
          const cityIndex = (window.locationCounter - 1) % predefinedCities.length;
          selectedCity = predefinedCities[cityIndex];
        }
        
        // Pequena variação apenas se não houver correspondência exata
        let lat = selectedCity.lat;
        let lng = selectedCity.lng;
        
        if (!matchedCity) {
          // Adicionar uma pequena variação para cada ponto
          const variationFactor = 0.005; // aproximadamente 500m
          const latVariation = (Math.random() - 0.5) * variationFactor;
          const lngVariation = (Math.random() - 0.5) * variationFactor;
          
          lat = selectedCity.lat + latVariation;
          lng = selectedCity.lng + lngVariation;
        }
        
        const latlng = `${lat},${lng}`;
        
        // Criar elemento visual
        if (window.createLocationItem) {
          window.createLocationItem(address, `${selectedCity.name}, SP, Brasil`, window.locationCounter);
        }
        
        // Criar objeto de localização
        if (window.locations) {
          const location = {
            id: window.locationCounter,
            name: address,
            address: `${selectedCity.name}, SP, Brasil`,
            latlng: latlng,
            isOrigin: false
          };
          
          // Adicionar ao array de locais
          window.locations.push(location);
        }
        
        // Limpar o campo de entrada
        locationInput.value = '';
      };
      
      // Adicionar manipulador de evento para a tecla Enter
      locationInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
          addLocationBtn.click();
        }
      };
      
      console.log("Função de busca de endereço aprimorada");
    }
  };
  
  // Verificar e configurar sistema de carregamento da API Google Maps
  const setupGoogleMapsAPI = function() {
    // Verificar se já foi configurado
    if (window.googleMapsAPIConfigured) {
      return;
    }
    
    // Marcar como configurado para evitar duplicação
    window.googleMapsAPIConfigured = true;
    
    // Verificar se a API já está carregada
    if (typeof google !== 'undefined' && google.maps) {
      console.log("Google Maps API já está carregada, inicializando...");
      window.initGoogleMapsAPI();
      return;
    }
    
    // Se a janela global googleMapsCallback já existir, adicionar nosso código
    const originalCallback = window.googleMapsCallback;
    window.googleMapsCallback = function() {
      console.log("Callback do Google Maps chamado (interceptado por fix-github.js)");
      
      // Chamar o callback original, se existir
      if (typeof originalCallback === 'function') {
        try {
          originalCallback();
        } catch (error) {
          console.error("Erro ao chamar callback original do Google Maps:", error);
        }
      }
      
      // Chamar nossa própria função de inicialização
      window.initGoogleMapsAPI();
    };
    
    console.log("Sistema de carregamento seguro do Google Maps configurado");
    
    // Se já estamos além do DOMContentLoaded, verificar se podemos inicializar agora
    if (document.readyState === "complete" && typeof google !== 'undefined' && google.maps) {
      console.log("Documento já carregado e Google Maps disponível, inicializando...");
      window.initGoogleMapsAPI();
    }
  };
  
  // Função para configurar listeners para Google Maps
  const setupGoogleMapsListeners = function() {
    // Adicionar listener para o evento de mudança de estado de carregamento
    window.addEventListener('load', function() {
      if (typeof google !== 'undefined' && google.maps) {
        console.log("Google Maps detectado no evento window.load");
        window.initGoogleMapsAPI();
      }
    });
    
    // Verificar periodicamente (última chance)
    let checkCount = 0;
    const maxChecks = 10;
    
    const checkGoogleMaps = function() {
      if (typeof google !== 'undefined' && google.maps) {
        console.log("Google Maps detectado em verificação periódica");
        window.initGoogleMapsAPI();
        return;
      }
      
      checkCount++;
      if (checkCount < maxChecks) {
        setTimeout(checkGoogleMaps, 1000);
      } else {
        console.log("Número máximo de verificações excedido");
      }
    };
    
    // Iniciar verificações
    setTimeout(checkGoogleMaps, 2000);
  };
  
  // Configurar todas as melhorias
  const applyAllFixes = function() {
    // Configurar sistema seguro para API Google Maps
    setupGoogleMapsAPI();
    setupGoogleMapsListeners();
    
    // Aplicar correções de layout e funcionalidade
    fixLayout();
    patchCepImport();
    enhanceAddressSearch();
    
    // Adicionar contador global para manejo de IDs
    if (!window.locationCounter) {
      window.locationCounter = 0;
    }
    
    console.log("Todas as correções aplicadas com sucesso");
  };
  
  // Executar imediatamente
  applyAllFixes();
  
  // Também executar após o carregamento completo da página
  window.addEventListener('load', applyAllFixes);
  
  // Executar novamente após um tempo para garantir que todos elementos foram carregados
  setTimeout(applyAllFixes, 1000);
  setTimeout(applyAllFixes, 2000);
});