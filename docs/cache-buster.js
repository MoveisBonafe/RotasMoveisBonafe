/**
 * Script para gerar novos nomes de arquivos cache buster
 * Cria arquivos CSS e JS vazios com timestamps no nome para forçar a atualização do cache
 */

(function() {
  // Adicionar marca de tempo atual aos arquivos CSS e JS carregados
  function addTimestampToResources() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
    console.log('Adicionando timestamp para cache busting:', timestamp);
    
    // Criar elemento de script com timestamp
    const cacheBusterScript = document.createElement('script');
    cacheBusterScript.src = `cache-buster-${timestamp}.js`;
    document.head.appendChild(cacheBusterScript);
    
    // Criar link para CSS com timestamp
    const cacheBusterStyle = document.createElement('link');
    cacheBusterStyle.rel = 'stylesheet';
    cacheBusterStyle.href = `cache-buster-${timestamp}.css`;
    document.head.appendChild(cacheBusterStyle);
    
    console.log('Cache buster adicionado com sucesso!');
  }
  
  // Executar quando o DOM estiver totalmente carregado para não bloquear carregamento da página
  window.addEventListener('load', function() {
    setTimeout(addTimestampToResources, 1000);
  });
})();