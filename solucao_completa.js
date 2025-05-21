/**
 * Solução completa para o site de Rotas Móveis Bonafé
 * Este script corrige dois problemas principais:
 * 1. As abas inferiores aparecem todas juntas ao expandir (deveria mostrar apenas a ativa)
 * 2. As datas de aniversário estão incorretas para Piedade (20/05) e Ribeirão Preto (19/06)
 */

// Função auto-executável para isolar o código
(function() {
  // Executar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', function() {
    // Aplicar correções logo após o carregamento
    setTimeout(aplicarCorrecoes, 500);
    setTimeout(aplicarCorrecoes, 1000);
    setTimeout(aplicarCorrecoes, 2000);
    
    // Verificar mudanças periodicamente
    setInterval(aplicarCorrecoes, 5000);
    
    // Responder a cliques na página
    document.addEventListener('click', function() {
      setTimeout(aplicarCorrecoes, 300);
    });
  });
  
  // Função principal de correção
  function aplicarCorrecoes() {
    corrigirAbas();
    corrigirDatas();
  }
  
  // Correção para as abas ficarem apenas uma visível por vez
  function corrigirAbas() {
    console.log("[Correção] Verificando abas...");
    
    // 1. Injetar CSS crítico
    if (!document.getElementById('correcao-css')) {
      const style = document.createElement('style');
      style.id = 'correcao-css';
      style.textContent = `
        /* Ocultar todas as abas por padrão */
        .bottom-tab-content {
          display: none !important;
        }
        
        /* Mostrar apenas a aba ativa */
        .bottom-tab-content.active-content {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          height: calc(100vh - 60px) !important;
          overflow-y: auto !important;
          padding: 20px !important;
          box-sizing: border-box !important;
        }
      `;
      document.head.appendChild(style);
      console.log("[Correção] CSS injetado.");
    }
    
    // 2. Verificar o estado atual das abas
    const container = document.querySelector('.bottom-tabs-container');
    
    if (container && !container.classList.contains('minimized')) {
      // O container está expandido
      // Esconder todas as abas de conteúdo primeiro
      const allContents = document.querySelectorAll('.bottom-tab-content');
      allContents.forEach(function(tab) {
        tab.style.display = 'none';
        tab.classList.remove('active-content');
      });
      
      // Determinar qual botão está ativo
      const activeBtn = document.querySelector('.bottom-tab-btn.active');
      if (activeBtn) {
        const targetId = activeBtn.getAttribute('data-target');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.style.display = 'flex';
          targetContent.classList.add('active-content');
          console.log("[Correção] Aba ativa definida para: " + targetId);
        }
      } else {
        // Se nenhum botão estiver ativo, ativar o primeiro
        const firstBtn = document.querySelector('.bottom-tab-btn');
        const firstTabId = firstBtn?.getAttribute('data-target');
        if (firstBtn && firstTabId) {
          firstBtn.classList.add('active');
          const firstTab = document.getElementById(firstTabId);
          if (firstTab) {
            firstTab.style.display = 'flex';
            firstTab.classList.add('active-content');
            console.log("[Correção] Primeira aba ativada: " + firstTabId);
          }
        }
      }
    }
  }
  
  // Correção para as datas de aniversário
  function corrigirDatas() {
    console.log("[Correção] Verificando datas...");
    
    // Dados de correção para cidades específicas
    const correcoes = {
      'Piedade': {
        dataIncorreta: '19/05/2025',
        dataCorreta: '20/05/2025',
        descricao: 'Aniversário de fundação de Piedade em 20/05/1840',
        removerData: true
      },
      'Ribeirão Preto': {
        dataIncorreta: '04/06/2025', // ou qualquer outra data incorreta
        dataCorreta: '19/06/2025',
        descricao: 'Aniversário de fundação de Ribeirão Preto em 19/06/1856',
        removerData: true
      }
    };
    
    // Encontrar todos os elementos relevantes
    // 1. Eventos nas listas
    const eventItems = document.querySelectorAll('.event-item, .city-event');
    eventItems.forEach(function(item) {
      // Para cada item de evento, verificar o texto
      const text = item.textContent || item.innerText;
      
      // Verificar cada cidade na lista de correções
      Object.keys(correcoes).forEach(function(cidade) {
        if (text.includes(cidade)) {
          console.log(`[Correção] Encontrada cidade: ${cidade}`);
          
          // Buscar o elemento de data dentro do item
          const dateElement = item.querySelector('.event-date');
          const descElement = item.querySelector('.event-description');
          
          // Se tiver a configuração para remover o elemento de data, escondê-lo
          if (dateElement && correcoes[cidade].removerData) {
            // Esconder o elemento em vez de removê-lo para preservar a estrutura
            dateElement.style.display = 'none';
            console.log(`[Correção] Elemento de data ocultado para: ${cidade}`);
          }
          
          // Corrigir a descrição para incluir a data completa
          if (descElement) {
            descElement.textContent = correcoes[cidade].descricao;
            console.log(`[Correção] Descrição corrigida para: ${correcoes[cidade].descricao}`);
            
            // Aumentar o tamanho e destacar a descrição já que é a única informação visível
            descElement.style.fontSize = '1.1em';
            descElement.style.fontWeight = 'bold';
            descElement.style.color = '#e91e63';
            descElement.style.marginTop = '10px';
          }
        }
      });
    });
    
    // 2. Correções diretas de HTML (abordagem mais agressiva)
    const allElements = document.querySelectorAll('*');
    allElements.forEach(function(el) {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        // Este é um elemento que contém apenas texto
        const texto = el.textContent || el.innerText;
        
        if (texto.includes('Piedade') && texto.includes('19/05/2025')) {
          el.textContent = texto.replace('19/05/2025', '20/05/2025');
          console.log('[Correção] Texto direto corrigido para Piedade');
        }
        
        if (texto.includes('Ribeirão Preto') && !texto.includes('19/06/2025')) {
          // Se contém Ribeirão Preto mas não a data correta, procurar por um padrão de data
          const dateMatch = texto.match(/\d{2}\/\d{2}\/\d{4}/);
          if (dateMatch) {
            el.textContent = texto.replace(dateMatch[0], '19/06/2025');
            console.log('[Correção] Texto direto corrigido para Ribeirão Preto');
          }
        }
      }
    });
  }
})();