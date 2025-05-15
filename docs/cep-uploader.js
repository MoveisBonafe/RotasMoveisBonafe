/**
 * Script especializado para upload de arquivos de CEP
 * Versão robusta para garantir o funcionamento no GitHub Pages
 */

// Configuração global para registrar se já inicializamos
let uploaderInitialized = false;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', initCepUploader);
window.addEventListener('load', initCepUploader);

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
function processFile(file) {
  if (!file) return;
  
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
  };
  
  reader.onerror = function() {
    showStatus(statusEl, 'Erro ao ler o arquivo', 'error');
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
      
      // Adicionar à lista global se existir
      if (window.locations) {
        window.locations.push(location);
      }
      
      // Adicionar elemento visual
      if (typeof window.createLocationItem === 'function') {
        window.createLocationItem(name, location.address, id);
      }
      
      importedLocations.push(location);
    }
    
    // Feedback ao usuário
    if (importedLocations.length > 0) {
      showStatus(statusEl, `Importado com sucesso! ${importedLocations.length} endereços adicionados.`, 'success');
      
      // Atualizar visualização
      if (typeof window.calculateOptimizedRoute === 'function') {
        window.calculateOptimizedRoute();
      } else if (typeof window.reloadLocations === 'function') {
        window.reloadLocations();
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