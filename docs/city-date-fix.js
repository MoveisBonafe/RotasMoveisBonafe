/**
 * Correção para datas das cidades
 * Este script mantém apenas a informação com a data correta
 */

(function() {
  // Executar quando a página estiver carregada
  window.addEventListener('load', function() {
    setTimeout(corrigirDatasExibidas, 1000);
    setTimeout(corrigirDatasExibidas, 3000);
  });
  
  // Executar quando houver alterações no DOM
  const observer = new MutationObserver(function(mutations) {
    setTimeout(corrigirDatasExibidas, 200);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // Também executar quando o usuário interage com a página
  document.addEventListener('click', function() {
    setTimeout(corrigirDatasExibidas, 200);
  });
  
  // Função principal para corrigir as datas exibidas
  function corrigirDatasExibidas() {
    // Primeiro, vamos encontrar todos os pares de elementos (data superior e descrição inferior)
    const eventItems = document.querySelectorAll('.event-item');
    
    eventItems.forEach(function(item) {
      const dataElement = item.querySelector('.event-date');
      const descElement = item.querySelector('.event-description');
      
      if (!dataElement || !descElement) return;
      
      const textoData = dataElement.textContent || '';
      const textoDesc = descElement.textContent || '';
      
      // Verificar se é uma cidade que precisamos corrigir
      if (textoData.includes('Ribeirão Preto')) {
        // Extrair a data correta da descrição
        const match = textoDesc.match(/em (\d{2}\/\d{2}\/\d{4})/);
        if (match) {
          // Data completa encontrada na descrição (formato dd/mm/yyyy)
          const dataCorreta = match[1];
          
          // Atualizar o formato da data no elemento superior
          const cidadeNome = textoData.split('|')[0].trim();
          dataElement.textContent = `${cidadeNome} | ${dataCorreta}`;
          console.log(`[DateFix] Corrigida data para ${cidadeNome}: ${dataCorreta}`);
        } else {
          // Verificar formato alternativo (dd/mm sem ano)
          const matchSimples = textoDesc.match(/em (\d{2}\/\d{2})/);
          if (matchSimples) {
            // Data em formato simples - adicionar ano
            const dataBase = matchSimples[1];
            const dataCorreta = `${dataBase}/2025`;
            
            // Atualizar o formato da data no elemento superior
            const cidadeNome = textoData.split('|')[0].trim();
            dataElement.textContent = `${cidadeNome} | ${dataCorreta}`;
            console.log(`[DateFix] Corrigida data para ${cidadeNome}: ${dataCorreta}`);
          }
        }
      }
      
      // Aplicar para Piedade também
      if (textoData.includes('Piedade')) {
        // Temos certeza que a data correta de Piedade é 20/05/2025
        const cidadeNome = textoData.split('|')[0].trim();
        const dataCorreta = "20/05/2025";
        
        // Verificar se a data está incorreta (não é 20/05/2025)
        if (!textoData.includes(dataCorreta)) {
          dataElement.textContent = `${cidadeNome} | ${dataCorreta}`;
          console.log(`[DateFix] Corrigida data para ${cidadeNome}: ${dataCorreta}`);
        }
        
        // Assegurar que a descrição tenha o ano completo (1842)
        if (!textoDesc.includes("1842")) {
          descElement.textContent = "Aniversário de fundação de Piedade em 20/05/1842";
          console.log(`[DateFix] Adicionado ano à descrição de Piedade: 1842`);
        }
      }
    });
  }
})();