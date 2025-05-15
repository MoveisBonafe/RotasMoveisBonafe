/**
 * Script simplificado para corrigir problemas com upload de arquivos no GitHub Pages
 */
 
// Detecção única de elemento de upload - evita duplicações
let uploadFixApplied = false;

// Executar quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  console.log('Verificando elementos de upload...');
  
  // Verificar elementos após um pequeno atraso para garantir que a página esteja totalmente carregada
  setTimeout(verificarUploads, 1000);
  
  // Verificar novamente depois de um tempo maior para garantir
  setTimeout(verificarUploads, 3000);
});

// Função principal de verificação
function verificarUploads() {
  // Evitar aplicar múltiplas vezes
  if (uploadFixApplied) {
    console.log('Correção de upload já aplicada anteriormente');
    return;
  }
  
  console.log('Verificando elementos de upload no DOM...');
  
  try {
    // Verificar se o container de upload existe
    const uploadContainer = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-upload');
    
    if (!uploadContainer || !fileInput) {
      console.log('Container de upload não encontrado. Criando...');
      criarElementoUpload();
    } else {
      console.log('Container de upload encontrado. Verificando duplicados...');
      removerDuplicados();
    }
    
    // Marcar como aplicado
    uploadFixApplied = true;
    console.log('Correção de upload aplicada com sucesso');
  } catch (error) {
    console.error('Erro ao verificar uploads:', error);
  }
}

// Remover elementos duplicados
function removerDuplicados() {
  // Verificar containers duplicados
  const containers = document.querySelectorAll('.file-upload-container');
  if (containers.length > 1) {
    console.log(`Encontrados ${containers.length} containers. Removendo duplicados...`);
    
    // Manter apenas o primeiro
    for (let i = 1; i < containers.length; i++) {
      if (containers[i] && containers[i].parentNode) {
        containers[i].parentNode.removeChild(containers[i]);
      }
    }
  }
  
  // Verificar inputs de arquivo duplicados
  const fileInputs = document.querySelectorAll('input[type="file"]');
  if (fileInputs.length > 1) {
    console.log(`Encontrados ${fileInputs.length} inputs de arquivo. Removendo duplicados...`);
    
    const ids = {};
    fileInputs.forEach((input, index) => {
      if (index > 0 && input.id === 'file-upload' && input.parentNode) {
        input.parentNode.removeChild(input);
      }
    });
  }
}

// Criar elemento de upload se não existir
function criarElementoUpload() {
  // Encontrar local para inserir o upload
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    console.error('Sidebar não encontrada');
    return;
  }
  
  // Procurar um lugar adequado para inserir
  const formContainer = sidebar.querySelector('.location-form');
  
  // Criar o container de upload
  const uploadContainer = document.createElement('div');
  uploadContainer.className = 'file-upload-container';
  uploadContainer.id = 'upload-area';
  uploadContainer.style.marginTop = '20px';
  uploadContainer.style.marginBottom = '20px';
  
  // Adicionar conteúdo do upload
  uploadContainer.innerHTML = `
    <div class="upload-icon">📂</div>
    <h3>Importar CEPs via arquivo</h3>
    <div class="file-format-example">Formato: CEP,Nome</div>
    <div class="upload-animation">
      <span class="upload-text">Arraste arquivo ou clique aqui</span>
      <span class="upload-pulse"></span>
    </div>
    <input type="file" id="file-upload" accept=".txt,.csv">
    <div id="upload-status" style="display: none;"></div>
  `;
  
  // Inserir no local adequado
  if (formContainer && formContainer.parentNode) {
    formContainer.parentNode.insertBefore(uploadContainer, formContainer.nextSibling);
  } else {
    // Se não encontrou um ponto específico, adicionar ao final da sidebar
    sidebar.appendChild(uploadContainer);
  }
  
  console.log('Elemento de upload criado com sucesso');
}
