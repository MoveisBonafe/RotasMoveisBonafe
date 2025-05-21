/**
 * Correção para datas de aniversário de cidades
 * Garante que a data exibida é a mesma da descrição
 */

(function() {
  // Executar quando o documento estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', corrigirDatas);
  } else {
    setTimeout(corrigirDatas, 500);
  }
  
  // Executar também quando a página estiver completamente carregada
  window.addEventListener('load', function() {
    setTimeout(corrigirDatas, 1000);
  });
  
  // Função principal para corrigir as datas
  function corrigirDatas() {
    console.log('[CorrecaoDatas] Iniciando correção das datas de cidades');
    
    // Corrigir datas específicas com valores conhecidos
    const correcoesDatas = {
      'Piedade': '20/05/2025',
      'Ribeirão Preto': '19/06/2025'
    };
    
    // 1. Corrigir com base na descrição
    corrigirComBaseNaDescricao();
    
    // 2. Aplicar correções específicas
    aplicarCorrecoesEspecificas(correcoesDatas);
    
    // Continuar verificando periodicamente
    setTimeout(corrigirComBaseNaDescricao, 2000);
    setTimeout(function() {
      aplicarCorrecoesEspecificas(correcoesDatas);
    }, 3000);
  }
  
  // Corrigir datas com base nas descrições
  function corrigirComBaseNaDescricao() {
    // Encontrar todos os elementos de evento
    const eventItems = document.querySelectorAll('.event-item, .evento-item');
    
    eventItems.forEach(function(item) {
      // Obter elementos de data e descrição
      const dateElem = item.querySelector('.event-date');
      const descElem = item.querySelector('.event-description');
      
      if (!dateElem || !descElem) return;
      
      // Extrair informações
      const dateText = dateElem.textContent;
      const descText = descElem.textContent;
      
      // Analisar o texto da descrição para extrair a data correta
      const foundationMatch = descText.match(/fundação de .+ em (\d{2}\/\d{2})(?:\/\d{4})?/i);
      
      if (foundationMatch) {
        // Extrair a data de fundação
        const foundationDate = foundationMatch[1];
        
        // Extrair a cidade da exibição atual
        const cityMatch = dateText.match(/([^|]+)\s*\|/);
        
        if (cityMatch) {
          const city = cityMatch[1].trim();
          const year = new Date().getFullYear() + 1; // próximo ano
          
          // Criar a nova data corrigida
          const correctedDate = `${city} | ${foundationDate}/${year}`;
          
          // Atualizar o texto apenas se for diferente
          if (dateText.trim() !== correctedDate) {
            console.log(`[CorrecaoDatas] Corrigindo data de "${dateText}" para "${correctedDate}"`);
            dateElem.textContent = correctedDate;
          }
        }
      }
    });
  }
  
  // Aplicar correções específicas para cidades conhecidas
  function aplicarCorrecoesEspecificas(correcoes) {
    // Encontrar todos os elementos de data de evento
    const dateElements = document.querySelectorAll('.event-date');
    
    dateElements.forEach(function(elem) {
      const text = elem.textContent;
      
      // Verificar cada cidade na lista de correções
      Object.keys(correcoes).forEach(function(cidade) {
        // Se o texto contém o nome da cidade
        if (text.includes(cidade)) {
          // Extrair a cidade da exibição atual
          const cityMatch = text.match(/([^|]+)\s*\|/);
          
          if (cityMatch) {
            const city = cityMatch[1].trim();
            const correctDate = correcoes[cidade];
            
            // Criar a nova data corrigida
            const correctedDate = `${city} | ${correctDate}`;
            
            // Atualizar o texto apenas se for diferente
            if (text.trim() !== correctedDate) {
              console.log(`[CorrecaoDatas] Correção específica: alterando "${text}" para "${correctedDate}"`);
              elem.textContent = correctedDate;
            }
          }
        }
      });
    });
  }
  
  // Observar mudanças no DOM para reagir quando novos eventos forem adicionados
  function observarMudancas() {
    // Criar um observador para reagir a novas adições de eventos
    const observer = new MutationObserver(function(mutations) {
      // Verificar se novos eventos foram adicionados
      for (let mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Procurar por novos elementos de evento
          let foundEvents = false;
          
          // Verificar cada nó adicionado
          for (let node of mutation.addedNodes) {
            if (node.nodeType === 1 && // é um elemento
               (node.classList.contains('event-item') || 
                node.classList.contains('evento-item') ||
                node.querySelector('.event-item, .evento-item'))) {
              foundEvents = true;
              break;
            }
          }
          
          // Se encontrou novos eventos, aplicar correções
          if (foundEvents) {
            setTimeout(corrigirDatas, 100);
          }
        }
      }
    });
    
    // Observar o documento inteiro para novos eventos
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Iniciar observação após correção inicial
  setTimeout(observarMudancas, 2000);
})();