/**
 * Script para interceptar e prevenir erros de carregamento de scripts inexistentes
 * que foram removidos durante a atualização do sistema
 */

(function() {
  // Lista de scripts removidos ou renomeados
  const removedScripts = [
    'unified-file-upload.js',
    'fix-duplicated-upload.js',
    'fix-github-upload.js'
  ];

  // Interceptar erros de carregamento
  window.addEventListener('error', function(event) {
    // Verificar se o erro é de um script 
    if (event.target && event.target.tagName === 'SCRIPT') {
      const src = event.target.src || '';
      
      // Verificar se o script é um dos removidos
      const isRemovedScript = removedScripts.some(script => 
        src.includes(script)
      );
      
      if (isRemovedScript) {
        // Prevenir o erro de aparecer no console
        event.preventDefault();
        console.log('Script removido interceptado:', src);
        
        // Criar um script vazio para substituir
        const emptyScript = document.createElement('script');
        emptyScript.textContent = '/* Script substituído */';
        document.head.appendChild(emptyScript);
      }
    }
  }, true);

  console.log('Sistema de fallback para scripts removidos iniciado');
})();