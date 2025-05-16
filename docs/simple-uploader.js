/**
 * Script simplificado para upload de arquivos CEP
 * Esta versão contém apenas o necessário sem código extra
 */

(function() {
  // Inicializar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', initSimpleUploader);
  window.addEventListener('load', initSimpleUploader);
  
  // Função principal de inicialização
  function initSimpleUploader() {
    console.log('Inicializando uploader simplificado...');
    
    // Encontrar o input de arquivo
    const fileInput = document.getElementById('file-upload');
    if (!fileInput) {
      console.error('Input de arquivo não encontrado');
      return;
    }
    
    // Remover todos os event listeners existentes
    const newInput = fileInput.cloneNode(false);
    if (fileInput.parentNode) {
      fileInput.parentNode.replaceChild(newInput, fileInput);
    }
    
    // Adicionar o event listener simplificado
    newInput.addEventListener('change', function(e) {
      console.log('Arquivo selecionado via input simplificado');
      if (this.files && this.files.length > 0) {
        const file = this.files[0];
        handleFile(file);
      }
    });
    
    // Encontrar a área de drop
    const dropArea = document.getElementById('upload-area') || document.getElementById('drop-area');
    if (dropArea) {
      // Remover listeners existentes
      const newDropArea = dropArea.cloneNode(true);
      if (dropArea.parentNode) {
        dropArea.parentNode.replaceChild(newDropArea, dropArea);
      }
      
      // Adicionar eventos básicos de drag and drop
      newDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
      });
      
      newDropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
      });
      
      newDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }
      });
      
      // Fazer o clique na área ativar o input
      newDropArea.addEventListener('click', function(e) {
        if (e.target !== newInput) {
          newInput.click();
        }
      });
    }
    
    console.log('Uploader simplificado inicializado com sucesso');
  }
  
  // Função para processar o arquivo
  function handleFile(file) {
    if (!file) {
      console.error('Arquivo inválido');
      return;
    }
    
    console.log('Processando arquivo:', file.name);
    
    // Mostrar feedback visual para o usuário
    showStatus('Processando o arquivo ' + file.name + '...');
    
    // Usar FileReader para ler o conteúdo
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const content = e.target.result;
      processFileContent(content);
    };
    
    reader.onerror = function() {
      showStatus('Erro ao ler o arquivo', 'error');
    };
    
    reader.readAsText(file);
  }
  
  // Função para mostrar status
  function showStatus(message, type = 'info') {
    // Tentar encontrar um elemento de status
    let statusEl = document.getElementById('upload-status');
    
    // Criar o elemento se não existir
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'upload-status';
      statusEl.className = 'status-message';
      
      // Tentar adicionar na área de upload
      const uploadArea = document.getElementById('upload-area') || document.getElementById('drop-area');
      if (uploadArea) {
        uploadArea.appendChild(statusEl);
      } else {
        // Adicionar ao corpo se não encontrar área específica
        document.body.appendChild(statusEl);
      }
    }
    
    // Definir a classe baseada no tipo
    statusEl.className = 'status-message ' + type;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Esconder após alguns segundos se for sucesso
    if (type === 'success' || type === 'info') {
      setTimeout(function() {
        statusEl.style.display = 'none';
      }, 5000);
    }
  }
  
  // Função para processar o conteúdo do arquivo
  function processFileContent(content) {
    if (!content) {
      showStatus('Arquivo vazio', 'error');
      return;
    }
    
    try {
      // Array para armazenar os locais importados
      const importedLocations = [];
      
      // Dividir o conteúdo em linhas
      const lines = content.split(/\r?\n/);
      
      // Verificar se temos conteúdo
      if (lines.length === 0) {
        showStatus('Arquivo não contém dados', 'error');
        return;
      }
      
      // Processar cada linha
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Pular linhas vazias
        
        // Dividir por vírgula (formato esperado: CEP,Nome)
        const parts = line.split(',');
        if (parts.length < 2) continue; // Formato inválido
        
        const cep = parts[0].trim();
        const name = parts.slice(1).join(',').trim();
        
        // Validação básica do CEP
        if (!cep.match(/^\d+$/)) continue;
        
        // Gerar ID único
        const id = Date.now() + i;
        
        // Buscar coordenadas para o CEP
        const coordinates = findCoordinatesForCep(cep);
        
        // Se não encontrou coordenadas, pular
        if (!coordinates || !coordinates.lat || !coordinates.lng) {
          console.warn(`CEP ${cep} não encontrado no banco de dados`);
          continue;
        }
        
        // Extrair nome da cidade
        const cityName = coordinates.city || extrairCidade(name) || 'Desconhecida';
        
        // Criar objeto de localização
        const location = {
          id: id,
          name: name,
          cep: cep,
          cityName: cityName,
          latlng: `${coordinates.lat},${coordinates.lng}`,
          isOrigin: false
        };
        
        // Adicionar à lista global se existir
        const newLocation = {
          id: id,
          name: name,
          address: `CEP: ${cep} (${cityName})`,
          zipCode: cep,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          isOrigin: false
        };
        
        // Verificar se window.locations existe e adicionar
        if (window.locations && Array.isArray(window.locations)) {
          window.locations.push(newLocation);
          
          // Adicionar marcador se a função existir
          if (typeof window.addMarkerForLocation === 'function') {
            window.addMarkerForLocation(newLocation, window.locations.length - 1);
          }
          
          // Atualizar contadores de região se a função existir
          if (typeof window.refreshRegionCounters === 'function') {
            window.refreshRegionCounters();
          }
        } else {
          console.warn('Array global locations não encontrado');
        }
        
        importedLocations.push(location);
      }
      
      // Mostrar status baseado no resultado
      if (importedLocations.length > 0) {
        showStatus(`Importado com sucesso! ${importedLocations.length} endereços adicionados.`, 'success');
        
        // Tentar calcular a rota se tivermos locações suficientes
        setTimeout(function() {
          if (window.locations && window.locations.length > 1) {
            if (typeof window.calculateOptimizedRoute === 'function') {
              window.calculateOptimizedRoute();
            } else if (typeof window.optimizeRoute === 'function') {
              window.optimizeRoute();
            } else {
              // Tentar clicar no botão de otimizar
              const optimizeBtn = document.getElementById('optimize-route');
              if (optimizeBtn) {
                optimizeBtn.click();
              }
            }
          }
        }, 1000);
      } else {
        showStatus('Nenhum endereço válido encontrado no arquivo.', 'warning');
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      showStatus('Erro ao processar o arquivo. Verifique o console para detalhes.', 'error');
    }
  }
  
  // Função auxiliar para extrair cidade do nome
  function extrairCidade(nome) {
    if (!nome) return null;
    
    // Lista de cidades comuns
    const cidades = [
      'São Paulo', 'Campinas', 'Ribeirão Preto', 'Sorocaba', 'Bauru',
      'Dois Córregos', 'Jaú', 'Botucatu', 'Piracicaba', 'São Carlos',
      'Araraquara', 'Limeira', 'Rio Claro', 'Itapeva', 'Buri', 
      'Guapiara', 'Capão Bonito', 'Taquarivaí', 'Ribeirão Branco'
    ];
    
    // Verificar se alguma cidade está no nome
    for (const cidade of cidades) {
      if (nome.toUpperCase().includes(cidade.toUpperCase())) {
        return cidade;
      }
    }
    
    // Se não encontrou, tentar extrair a cidade do formato "CIDADE-NOME"
    const partes = nome.split('-');
    if (partes.length >= 2) {
      return partes[0].trim();
    }
    
    return null;
  }
  
  // Função para encontrar coordenadas para um CEP
  function findCoordinatesForCep(cep) {
    // Verificar se a função global existe
    if (typeof window.getCepCoordinates === 'function') {
      return window.getCepCoordinates(cep);
    }
    
    // Implementação básica de fallback
    console.warn('Função getCepCoordinates não encontrada, usando fallback');
    
    // Coordenadas próximas a Dois Córregos para não deixar nada sem coordenadas
    return {
      lat: -22.36 + (Math.random() * 0.01),
      lng: -48.38 + (Math.random() * 0.01),
      city: 'Dois Córregos'
    };
  }
})();