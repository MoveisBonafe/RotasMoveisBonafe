/**
 * Script especializado para upload de arquivos de CEP
 * Versão robusta para garantir o funcionamento no GitHub Pages
 */

// Configuração global para registrar se já inicializamos
let uploaderInitialized = false;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', initCepUploader);
window.addEventListener('load', initCepUploader);

// Função para verificar e corrigir duplicação nos listeners
function checkAndFixDuplicateListeners() {
  const fileInput = document.getElementById('file-upload');
  if (!fileInput) return;
  
  console.log('Verificando e corrigindo listeners duplicados no uploader...');
  
  // Remover listeners anteriores
  const oldFileInput = fileInput;
  const newFileInput = oldFileInput.cloneNode(true);
  if (oldFileInput.parentNode) {
    oldFileInput.parentNode.replaceChild(newFileInput, oldFileInput);
  }
  
  // Adicionar listener único
  newFileInput.addEventListener('change', handleFileSelection);
  
  // Verificar área de arrastar/soltar
  const dropArea = document.getElementById('drop-area');
  if (dropArea) {
    // Clone para remover listeners
    const newDropArea = dropArea.cloneNode(true);
    if (dropArea.parentNode) {
      dropArea.parentNode.replaceChild(newDropArea, dropArea);
    }
    
    // Readicionar listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      newDropArea.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });
    
    newDropArea.addEventListener('dragenter', function() {
      newDropArea.classList.add('active');
    }, false);
    
    newDropArea.addEventListener('dragleave', function() {
      newDropArea.classList.remove('active');
    }, false);
    
    newDropArea.addEventListener('drop', function(e) {
      newDropArea.classList.remove('active');
      const files = e.dataTransfer.files;
      if (files.length) {
        newFileInput.files = files;
        handleFileSelection();
      }
    }, false);
  }
}

// Função principal de inicialização
function initCepUploader() {
  // Evitar inicialização duplicada
  if (uploaderInitialized) return;
  
  console.log('Inicializando uploader de CEP...');
  
  // Remover todos os manipuladores de eventos existentes para uploads de arquivo
  removeExistingHandlers();
  
  // Tentar inicializar após um pequeno atraso para garantir
  // que todos os elementos DOM já foram criados
  setTimeout(setupUploader, 500);
  setTimeout(setupUploader, 1500); // Segunda tentativa caso a primeira falhe
  
  // Marcar como inicializado
  uploaderInitialized = true;
}

// Função para remover manipuladores existentes
function removeExistingHandlers() {
  // Encontrar e limpar qualquer input de arquivo existente
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  fileInputs.forEach(input => {
    // Criar uma cópia limpa do elemento
    if (input && input.parentNode) {
      const clone = input.cloneNode(true);
      input.parentNode.replaceChild(clone, input);
      console.log('Input de arquivo resetado:', clone.id);
    }
  });
  
  // Também prevenir execuções de outros scripts de upload conhecidos
  window.uploadFixApplied = true; // Prevenir duplicated-upload.js
  
  // Se outras variáveis globais de controle existirem, desativá-las
  if (typeof window.unifiedUploaderInitialized !== 'undefined') {
    window.unifiedUploaderInitialized = true;
  }
  
  // Lidar com outras variáveis e funções conflitantes
  if (typeof window.handleFileUpload === 'function') {
    console.log('Desativando função handleFileUpload anterior');
    window.handleFileUpload_original = window.handleFileUpload;
    window.handleFileUpload = function() {
      console.log('Redirecionando para o novo sistema de upload');
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.click();
      }
    };
  }
}

// Configurar o uploader
function setupUploader() {
  // Encontrar elementos necessários
  const fileInput = document.getElementById('file-upload');
  const uploadArea = document.getElementById('upload-area');
  
  if (!fileInput || !uploadArea) {
    console.error('Elementos de upload não encontrados');
    return;
  }
  
  console.log('Configurando uploader de CEP');
  
  // Desconectar completamente o elemento antigo e criar um novo
  const newInput = fileInput.cloneNode(false); // clone sem eventos
  
  // Substituir o elemento original pelo novo
  if (fileInput.parentNode) {
    fileInput.parentNode.replaceChild(newInput, fileInput);
    console.log('Input de arquivo substituído por um novo elemento limpo');
  }
  
  // Adicionar manipulador de evento principal - usando o novo padrão
  newInput.onchange = handleFileSelection;
  
  // Adicionar suporte para arrastar e soltar
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    if (e.dataTransfer.files.length) {
      // Usar diretamente o arquivo sem tentar definir a propriedade files
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  });
  
  // Fazer o clique em qualquer parte do container ativar o input
  uploadArea.addEventListener('click', function(e) {
    if (e.target !== newInput) {
      e.preventDefault();
      newInput.click();
    }
  });
  
  console.log('Uploader de CEP configurado com sucesso');
}

// Manipular a seleção de arquivo
function handleFileSelection() {
  if (!this.files || !this.files.length) return;
  
  const file = this.files[0];
  processFile(file);
  
  // Limpar o input após o processamento
  this.value = '';
}

// Função centralizada para processar arquivo
// Esta é a função principal que processa o arquivo de CEP
function processFile(file) {
  if (!file) {
    console.error('Arquivo inválido ou não especificado');
    return;
  }
  
  // Evitar processamento duplicado
  if (window.fileBeingProcessed === file.name) {
    console.warn('Arquivo já está sendo processado:', file.name);
    return;
  }
  
  // Marcar arquivo como em processamento
  window.fileBeingProcessed = file.name;
  
  console.log('Arquivo selecionado:', file.name);
  
  // Criar ou encontrar elemento de status
  let statusEl = document.getElementById('upload-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'upload-status';
    statusEl.style.display = 'none';
    
    // Adicionar ao container de upload
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
      uploadArea.appendChild(statusEl);
    }
  }
  
  // Mostrar status de processamento
  showStatus(statusEl, 'Processando arquivo...', 'processing');
  
  // Ler o arquivo
  const reader = new FileReader();
  
  reader.onload = function(e) {
    processCepFileContent(e.target.result, statusEl);
    // Limpar a marca de arquivo em processamento após concluir
    setTimeout(function() { 
      window.fileBeingProcessed = null;
    }, 500);
  };
  
  reader.onerror = function() {
    showStatus(statusEl, 'Erro ao ler o arquivo', 'error');
    // Limpar a marca de arquivo em processamento em caso de erro
    window.fileBeingProcessed = null;
  };
  
  reader.readAsText(file);
}

// Processar o conteúdo do arquivo
function processCepFileContent(content, statusEl) {
  if (!content) {
    showStatus(statusEl, 'Arquivo vazio', 'error');
    return;
  }
  
  try {
    // Dividir o conteúdo em linhas
    const lines = content.split(/\r?\n/);
    if (!lines.length) {
      showStatus(statusEl, 'Nenhum dado encontrado no arquivo', 'error');
      return;
    }
    
    // Array para armazenar os locais importados
    const importedLocations = [];
    
    // Processar cada linha
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Dividir a linha em CEP e nome
      const parts = line.split(',');
      if (parts.length < 2) continue;
      
      const cep = parts[0].trim();
      const name = parts.slice(1).join(',').trim();
      
      // Verificar CEP (formato simples para este exemplo)
      if (!cep.match(/^\d+$/)) continue;
      
      // Gerar ID único para o local
      const id = Date.now() + i;
      
      // Encontrar coordenadas para o CEP
      let coordinates = findCoordinatesForCep(cep);
      let cityName = coordinates.city || 'Desconhecida';
      
      // Criar objeto de localização
      const location = {
        id: id,
        name: name,
        address: `CEP: ${cep} (${cityName})`,
        latlng: `${coordinates.lat},${coordinates.lng}`,
        isOrigin: false
      };
      
      // Integração direta com as funções do aplicativo principal
      try {
        // Método 1: Usar a função global createLocationItem (mais confiável)
        if (typeof window.createLocationItem === 'function') {
          // A função createLocationItem geralmente adiciona automaticamente
          // o local ao array global locations no aplicativo principal
          console.log('Adicionando local via createLocationItem:', name);
          window.createLocationItem(name, location.address, id);
        }
        // Método 2: Adicionar diretamente ao array locations
        else if (window.locations && Array.isArray(window.locations)) {
          console.log('Adicionando local diretamente ao array locations:', name);
          window.locations.push(location);
          
          // Tentar adicionar visualmente de outra forma se createLocationItem não existir
          const locationsList = document.getElementById('locations-list');
          if (locationsList) {
            const locationItem = document.createElement('div');
            locationItem.className = 'location-item d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded';
            locationItem.setAttribute('data-id', id);
            locationItem.innerHTML = `
              <div>
                <span class="location-name">${name}</span>
                <small class="d-block text-muted">${location.address}</small>
              </div>
              <button class="btn btn-sm btn-outline-danger remove-location" onclick="removeLocation(${id})">
                <i class="bi bi-trash"></i>
              </button>
            `;
            locationsList.appendChild(locationItem);
          }
        }
      } catch (e) {
        console.error('Erro ao adicionar local:', e);
      }
      
      importedLocations.push(location);
    }
    
    // Feedback ao usuário
    if (importedLocations.length > 0) {
      showStatus(statusEl, `Importado com sucesso! ${importedLocations.length} endereços adicionados.`, 'success');
      
      // Atualizar visualização
      try {
        console.log(`Processamento concluído com sucesso: ${importedLocations.length} locais adicionados`);
        
        // Tentar várias funções de atualização, dependendo do que estiver disponível
        if (typeof window.calculateOptimizedRoute === 'function') {
          console.log('Recalculando rota via calculateOptimizedRoute()');
          window.calculateOptimizedRoute();
        } 
        else if (typeof window.reloadLocations === 'function') {
          console.log('Recarregando locais via reloadLocations()');
          window.reloadLocations();
        }
        else if (typeof window.updateMap === 'function') {
          console.log('Atualizando mapa via updateMap()');
          window.updateMap();
        }
        else {
          console.log('Tentando métodos alternativos de atualização...');
          
          // Tentar método alternativo: simular um clique no botão de otimizar rota
          const optimizeBtn = document.getElementById('optimize-route');
          if (optimizeBtn) {
            console.log('Simulando clique no botão de otimizar rota');
            optimizeBtn.click();
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar a visualização:', error);
      }
    } else {
      showStatus(statusEl, 'Nenhum endereço válido encontrado no arquivo', 'error');
    }
    
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    showStatus(statusEl, `Erro ao processar: ${error.message}`, 'error');
  }
  
  // Limpar input
  const fileInput = document.getElementById('file-upload');
  if (fileInput) fileInput.value = '';
}

// Encontrar coordenadas para CEP
function findCoordinatesForCep(cep) {
  // Banco de dados de CEPs conhecido
  const knownCeps = {
    // Interior SP
    "17300": { city: "Dois Córregos", lat: -22.3673, lng: -48.3823 },
    "17350": { city: "Jaú", lat: -22.2936, lng: -48.5592 },
    "17380": { city: "Brotas", lat: -22.2792, lng: -48.1250 },
    "17900": { city: "Dracena", lat: -21.4843, lng: -51.5352 },
    "18000": { city: "Sorocaba", lat: -23.5015, lng: -47.4526 },
    "19000": { city: "Presidente Prudente", lat: -22.1208, lng: -51.3882 },
    // Região de Ribeirão Preto
    "14000": { city: "Ribeirão Preto", lat: -21.1775, lng: -47.8103 },
    "14400": { city: "Franca", lat: -20.5390, lng: -47.4013 },
    // Região de Campinas
    "13000": { city: "Campinas", lat: -22.9071, lng: -47.0628 },
    "13300": { city: "Itu", lat: -23.2636, lng: -47.2992 },
    "13500": { city: "Rio Claro", lat: -22.4065, lng: -47.5613 },
    "13600": { city: "Araras", lat: -22.3572, lng: -47.3839 },
    // São José do Rio Preto
    "15000": { city: "São José do Rio Preto", lat: -20.8113, lng: -49.3758 },
    // Capital
    "01000": { city: "São Paulo", lat: -23.5505, lng: -46.6333 },
    "04000": { city: "São Paulo", lat: -23.6216, lng: -46.6388 },
    "05000": { city: "São Paulo", lat: -23.5329, lng: -46.7108 }
  };
  
  // Verificar prefixo do CEP (primeiros 5 dígitos)
  const prefix = cep.substring(0, 5);
  if (knownCeps[prefix]) {
    return {
      lat: knownCeps[prefix].lat + (Math.random() - 0.5) * 0.003,
      lng: knownCeps[prefix].lng + (Math.random() - 0.5) * 0.003,
      city: knownCeps[prefix].city
    };
  }
  
  // Verificar prefixo mais curto
  for (let i = 4; i >= 2; i--) {
    const shorterPrefix = cep.substring(0, i);
    if (knownCeps[shorterPrefix]) {
      return {
        lat: knownCeps[shorterPrefix].lat + (Math.random() - 0.5) * 0.004,
        lng: knownCeps[shorterPrefix].lng + (Math.random() - 0.5) * 0.004,
        city: knownCeps[shorterPrefix].city
      };
    }
  }
  
  // Fallback para Dois Córregos (origem padrão)
  return {
    lat: -22.3673 + (Math.random() - 0.5) * 0.005,
    lng: -48.3823 + (Math.random() - 0.5) * 0.005,
    city: "Dois Córregos"
  };
}

// Função auxiliar para exibir status
function showStatus(element, message, type) {
  if (!element) return;
  
  element.style.display = 'block';
  element.textContent = message;
  
  switch (type) {
    case 'success':
      element.style.backgroundColor = '#4CAF50';
      element.style.color = 'white';
      break;
    case 'error':
      element.style.backgroundColor = '#f44336';
      element.style.color = 'white';
      break;
    case 'processing':
      element.style.backgroundColor = '#2196F3';
      element.style.color = 'white';
      break;
    default:
      element.style.backgroundColor = '#ff9800';
      element.style.color = 'white';
  }
  
  // Ocultar após 5 segundos
  setTimeout(function() {
    element.style.display = 'none';
  }, 5000);
}