/**
 * Script para corrigir o problema de cliques duplicados na seleção de arquivo
 */

(function() {
  // Executar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', initClickFix);
  
  // Ou executar imediatamente se o documento já estiver carregado
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initClickFix, 1000);
  }
  
  function initClickFix() {
    console.log('Inicializando correção de cliques duplicados...');
    
    // Encontrar todos os botões que podem abrir o seletor de arquivo
    const uploadButtons = document.querySelectorAll('.upload-button, .btn-upload, [data-upload="true"]');
    uploadButtons.forEach(button => {
      // Remover todos os event listeners existentes
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }
      
      // Adicionar um único listener controlado
      newButton.addEventListener('click', handleUploadButtonClick);
    });
    
    // Impedir que o upload-area dispare cliques duplicados
    const uploadArea = document.getElementById('upload-area') || document.getElementById('drop-area');
    if (uploadArea) {
      const newArea = uploadArea.cloneNode(true);
      if (uploadArea.parentNode) {
        uploadArea.parentNode.replaceChild(newArea, uploadArea);
      }
      
      // Adicionar um único listener ao upload area
      newArea.addEventListener('click', function(e) {
        // Verificar se o clique foi diretamente no container e não em um botão
        if (e.target === this) {
          const fileInput = document.getElementById('file-upload');
          if (fileInput) {
            e.preventDefault();
            e.stopPropagation();
            // Definir uma flag para evitar cliques duplicados
            if (!window.isProcessingClick) {
              window.isProcessingClick = true;
              fileInput.click();
              setTimeout(() => {
                window.isProcessingClick = false;
              }, 500);
            }
          }
        }
      });
    }
    
    console.log('Correção de cliques duplicados aplicada');
  }
  
  // Handler único e controlado para botões de upload
  function handleUploadButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Encontrar o input de arquivo associado
    const fileInput = document.getElementById('file-upload');
    if (!fileInput) return;
    
    // Usar uma flag para evitar múltiplos cliques em sequência
    if (!window.isProcessingClick) {
      window.isProcessingClick = true;
      console.log('Clicando no input de arquivo (controlado)');
      fileInput.click();
      setTimeout(() => {
        window.isProcessingClick = false;
      }, 500);
    }
  }
})();