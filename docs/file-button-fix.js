/**
 * Solução simplificada para o problema de cliques duplicados
 */

window.addEventListener('load', function() {
  setTimeout(function() {
    // Encontrar o input de arquivo
    const fileInput = document.getElementById('file-upload');
    if (!fileInput) return;
    
    console.log('Aplicando correção ao botão de upload de arquivo');
    
    // Remover todos os event listeners e criar um novo input limpo
    const parent = fileInput.parentNode;
    if (parent) {
      // Salvar o valor original
      const originalValue = fileInput.value;
      
      // Criar um novo input limpo
      const newInput = document.createElement('input');
      newInput.type = 'file';
      newInput.id = 'file-upload';
      newInput.className = fileInput.className;
      newInput.accept = '.txt,.csv';
      
      // Substituir o original pelo novo
      parent.replaceChild(newInput, fileInput);
      
      // Adicionar um único event listener controlado
      newInput.addEventListener('change', function(e) {
        if (this.files && this.files.length) {
          const file = this.files[0];
          
          // Verificar se a função window.processFile existe
          if (typeof window.processFile === 'function') {
            window.processFile(file);
          } else if (typeof window.handleFile === 'function') {
            window.handleFile(file);
          } else {
            // Tentar encontrar alguma função de processamento
            console.error('Função de processamento de arquivo não encontrada');
            
            // Alertar usuário
            alert('Função para processar arquivo não está disponível. Tente recarregar a página.');
          }
          
          // Limpar o valor para permitir selecionar o mesmo arquivo novamente
          setTimeout(() => {
            this.value = '';
          }, 100);
        }
      });
      
      console.log('Botão de upload recriado com proteção contra duplicação');
    }
  }, 1000);
});