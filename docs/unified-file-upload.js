/**
 * Script simplificado para upload de arquivos
 * Versão minimalista para garantir compatibilidade com GitHub Pages
 */

// Detectar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando uploader minimalista');
  
  // Esperar um pouco para todos os elementos estarem disponíveis
  setTimeout(setupFileUpload, 1000);
});

// Configuração principal
function setupFileUpload() {
  const fileInput = document.getElementById('file-upload');
  const uploadArea = document.getElementById('upload-area');
  
  if (!fileInput || !uploadArea) {
    console.log('Elementos de upload não encontrados');
    return;
  }
  
  console.log('Configurando uploader...');
  
  // Limpar manipuladores de eventos anteriores
  const newFileInput = fileInput.cloneNode(true);
  if (fileInput.parentNode) {
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
  }
  
  // Criar elemento de status se não existir
  let statusElement = document.getElementById('upload-status');
  if (!statusElement && uploadArea) {
    statusElement = document.createElement('div');
    statusElement.id = 'upload-status';
    statusElement.style.display = 'none';
    uploadArea.appendChild(statusElement);
  }
  
  // Configurar evento de clique
  if (uploadArea) {
    uploadArea.addEventListener('click', function(e) {
      if (e.target !== newFileInput && newFileInput) {
        e.preventDefault();
        newFileInput.click();
      }
    });
  }
  
  // Configurar evento de alteração
  if (newFileInput) {
    newFileInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        processFile(this.files[0], statusElement);
      }
    });
  }
  
  console.log('Uploader configurado com sucesso');
}

// Processar arquivo selecionado
function processFile(file, statusElement) {
  if (!file || !statusElement) return;
  
  console.log('Processando arquivo:', file.name);
  
  // Mostrar status
  statusElement.style.display = 'block';
  statusElement.style.backgroundColor = '#ffc107';
  statusElement.style.color = '#000';
  statusElement.textContent = 'Processando arquivo...';
  
  // Ler arquivo
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      
      // Tentar usar função nativa do site se existir
      if (typeof parseCEPFile === 'function') {
        parseCEPFile(content);
        
        // Mostrar sucesso
        statusElement.style.backgroundColor = '#4CAF50';
        statusElement.style.color = 'white';
        statusElement.textContent = 'Arquivo processado com sucesso!';
      } else {
        // Fallback básico
        const lines = content.split('\n');
        let count = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && line.includes(',')) {
            count++;
          }
        }
        
        // Informar que precisamos da função nativa
        statusElement.style.backgroundColor = '#ff9800';
        statusElement.style.color = 'white';
        statusElement.textContent = `Encontrados ${count} registros, mas parseCEPFile não está disponível`;
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      statusElement.style.backgroundColor = '#f44336';
      statusElement.style.color = 'white';
      statusElement.textContent = 'Erro ao processar arquivo';
    }
    
    // Esconder mensagem após 5 segundos
    setTimeout(function() {
      statusElement.style.display = 'none';
    }, 5000);
  };
  
  reader.onerror = function() {
    statusElement.style.backgroundColor = '#f44336';
    statusElement.style.color = 'white';
    statusElement.textContent = 'Erro ao ler o arquivo';
  };
  
  reader.readAsText(file);
}
