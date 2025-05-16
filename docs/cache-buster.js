/**
 * Script para gerar novos nomes de arquivos cache buster
 * Cria arquivos CSS e JS vazios com timestamps no nome para forçar a atualização do cache
 */

(function() {
  // Adicionar marca de tempo atual aos arquivos CSS e JS carregados
  function addTimestampToResources() {
    // Usar timestamp fixo para garantir consistência da versão
    const timestamp = "20250516010540";
    console.log('Adicionando timestamp fixo para cache busting:', timestamp);
    
    try {
      // Verificar se já existe um script com este timestamp
      const existingScript = document.querySelector(`script[src="cache-buster-${timestamp}.js"]`);
      if (!existingScript) {
        // Criar elemento de script com timestamp
        const cacheBusterScript = document.createElement('script');
        cacheBusterScript.src = `cache-buster-${timestamp}.js`;
        document.head.appendChild(cacheBusterScript);
        console.log(`Script cache-buster-${timestamp}.js adicionado`);
      } else {
        console.log("Script de cache buster já existe");
      }
      
      // Verificar se já existe um link CSS com este timestamp
      const existingLink = document.querySelector(`link[href="cache-buster-${timestamp}.css"]`);
      if (!existingLink) {
        // Criar link para CSS com timestamp
        const cacheBusterStyle = document.createElement('link');
        cacheBusterStyle.rel = 'stylesheet';
        cacheBusterStyle.href = `cache-buster-${timestamp}.css`;
        document.head.appendChild(cacheBusterStyle);
        console.log(`CSS cache-buster-${timestamp}.css adicionado`);
      } else {
        console.log("CSS de cache buster já existe");
      }
      
      console.log('Cache buster configurado com sucesso!');
    } catch (e) {
      console.error("Erro ao configurar cache buster:", e);
    }
  }
  
  // Executar quando o DOM estiver totalmente carregado para não bloquear carregamento da página
  window.addEventListener('load', function() {
    setTimeout(addTimestampToResources, 1000);
  });
})();