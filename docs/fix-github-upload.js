/**
 * Script para corrigir problemas específicos da versão GitHub Pages
 * Versão minimalista e otimizada para evitar conflitos
 */

// Executar quando documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('Iniciando correções GitHub Pages...');

  // Ajustar dimensões do mapa e da sidebar após um delay
  setTimeout(function() {
    const sidebar = document.querySelector('.sidebar');
    const mapContainer = document.querySelector('.map-container');
    
    if (sidebar && mapContainer) {
      sidebar.style.width = '400px';
      sidebar.style.height = 'calc(100vh - 200px)';
      sidebar.style.minHeight = '600px';
      sidebar.style.overflowY = 'auto';
      
      mapContainer.style.flex = '1';
      mapContainer.style.height = 'calc(100vh - 200px)';
      mapContainer.style.minHeight = '600px';
      
      console.log('✅ Layout ajustado');
    }
  }, 500);
  
  // Configurar handler do upload de arquivo
  setupFileUpload();
});

// Mapa de coordenadas para CEPs (prefixos)
const cepDatabase = {
  "17300": { city: "Dois Córregos", lat: -22.3673, lng: -48.3823 },
  "17350": { city: "Jaú", lat: -22.2936, lng: -48.5592 },
  "17380": { city: "Brotas", lat: -22.2792, lng: -48.1250 },
  "14000": { city: "Ribeirão Preto", lat: -21.1775, lng: -47.8103 },
  "13000": { city: "Campinas", lat: -22.9071, lng: -47.0628 },
  "01000": { city: "São Paulo", lat: -23.5505, lng: -46.6333 }
};

// Configurar upload de arquivo
function setupFileUpload() {
  const fileInput = document.getElementById('file-upload');
  if (!fileInput) {
    console.log('❌ Elemento de upload não encontrado');
    return;
  }
  
  // Adicionar evento de mudança
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      processFile(e.target.result);
    };
    
    reader.readAsText(file);
  });
  
  console.log('✅ Upload de arquivo configurado');
}

// Processar arquivo de CEPs
function processFile(fileContent) {
  console.log('Processando arquivo...');
  
  // Acessar o elemento de status
  const statusEl = document.getElementById('upload-status');
  
  // Dividir o conteúdo em linhas
  const lines = fileContent.split(/\r?\n/);
  if (!lines.length) {
    updateStatus('Arquivo vazio ou inválido', 'error');
    return;
  }
  
  // Array para armazenar localizações importadas
  const imported = [];
  
  // Processar cada linha
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Dividir a linha em CEP e nome
    const parts = line.split(',');
    if (parts.length < 2) continue;
    
    const cep = parts[0].trim();
    const name = parts.slice(1).join(',').trim();
    
    // Verificar CEP
    if (!cep.match(/^\d+$/)) continue;
    
    // Obter coordenadas
    const coords = getCoordsForCep(cep);
    
    // Criar objeto de localização
    const loc = {
      id: Date.now() + i,
      name: name,
      address: `CEP: ${cep} (${coords.city})`,
      latlng: `${coords.lat},${coords.lng}`,
      isOrigin: false
    };
    
    // Adicionar à lista de locais se a variável global existir
    if (window.locations) {
      window.locations.push(loc);
    }
    
    // Adicionar elemento visual
    if (typeof window.createLocationItem === 'function') {
      window.createLocationItem(name, loc.address, loc.id);
    }
    
    imported.push(loc);
  }
  
  // Feedback ao usuário
  if (imported.length > 0) {
    updateStatus(`Importado com sucesso! ${imported.length} endereços adicionados.`, 'success');
    
    // Recalcular rota
    if (typeof window.calculateOptimizedRoute === 'function') {
      window.calculateOptimizedRoute();
    } else if (typeof window.reloadLocations === 'function') {
      window.reloadLocations();
    }
  } else {
    updateStatus('Nenhum endereço válido encontrado', 'error');
  }
  
  // Limpar input
  const fileInput = document.getElementById('file-upload');
  if (fileInput) fileInput.value = '';
}

// Obter coordenadas para CEP
function getCoordsForCep(cep) {
  // Verificar se temos o CEP no banco de dados
  const prefix = cep.substring(0, 5);
  if (cepDatabase[prefix]) {
    return {
      lat: cepDatabase[prefix].lat + (Math.random() - 0.5) * 0.003,
      lng: cepDatabase[prefix].lng + (Math.random() - 0.5) * 0.003,
      city: cepDatabase[prefix].city
    };
  }
  
  // Fallback para Dois Córregos (origem padrão)
  return {
    lat: -22.3673 + (Math.random() - 0.5) * 0.003,
    lng: -48.3823 + (Math.random() - 0.5) * 0.003,
    city: "Dois Córregos"
  };
}

// Atualizar o elemento de status
function updateStatus(message, type) {
  const statusEl = document.getElementById('upload-status');
  
  if (statusEl) {
    // Mostrar mensagem no elemento de status
    statusEl.style.display = 'block';
    
    if (type === 'success') {
      statusEl.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
      statusEl.style.backgroundColor = '#f44336';
    } else {
      statusEl.style.backgroundColor = '#ff9800';
    }
    
    statusEl.style.color = 'white';
    statusEl.textContent = message;
    
    // Ocultar após alguns segundos
    setTimeout(function() {
      statusEl.style.display = 'none';
    }, 5000);
  } else {
    // Fallback para alert se o elemento não existir
    alert(message);
  }
}