/**
 * CORREÇÃO ESPECÍFICA PARA BOTÕES DE ABAS
 * 
 * Este script:
 * 1. Se concentra exclusivamente nos botões das abas inferiores
 * 2. Aplica o estilo dos botões principais (visualizar/otimizar)
 * 3. Usa seletores mais específicos para maior garantia de funcionamento
 */

(function() {
  console.log("[TabBotoes] Iniciando correção para botões das abas");
  
  // Executar logo no início
  setTimeout(corrigirBotoes, 500);
  setTimeout(corrigirBotoes, 1500);
  setTimeout(corrigirBotoes, 3000);
  
  // Observar mudanças DOM para reagir quando as abas aparecerem
  const observer = new MutationObserver(function() {
    setTimeout(corrigirBotoes, 200);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Adicionar ouvinte para evento click no documento
  document.addEventListener('click', function() {
    setTimeout(corrigirBotoes, 200);
  });
  
  // Função principal para corrigir os botões
  function corrigirBotoes() {
    console.log("[TabBotoes] Verificando botões das abas...");
    
    // Garantir que o CSS está injetado
    injetarEstilos();
    
    // Encontrar todos os botões de abas possíveis
    const botoesAbas = document.querySelectorAll(
      '.bottom-tab-button, .tab-button, button[onclick*="openTab"], .bottom-tabs button, .tab-container button'
    );
    
    if (botoesAbas.length === 0) {
      console.log("[TabBotoes] Nenhum botão de aba encontrado.");
      return;
    }
    
    // Aplicar estilos a cada botão
    botoesAbas.forEach(function(botao) {
      // Verificar se já estilizamos este botão
      if (botao.hasAttribute('data-tab-styled')) return;
      
      // Marcar como estilizado
      botao.setAttribute('data-tab-styled', 'true');
      
      // Adicionar classe para estilização
      botao.classList.add('botao-tab-estilizado');
      
      // Verificar se este botão está ativo
      if (botao.classList.contains('active') || botao.getAttribute('aria-selected') === 'true') {
        botao.classList.add('botao-tab-ativo');
      }
      
      console.log(`[TabBotoes] Botão estilizado: ${botao.textContent.trim()}`);
    });
    
    // Adicionar tratamento para cliques nos botões para alternar classe ativa
    botoesAbas.forEach(function(botao) {
      // Verificar se já adicionamos ouvinte
      if (botao.hasAttribute('data-tab-click-handled')) return;
      
      // Marcar como tratado
      botao.setAttribute('data-tab-click-handled', 'true');
      
      // Adicionar ouvinte de clique
      botao.addEventListener('click', function() {
        // Remover classe ativa de todos os botões
        botoesAbas.forEach(b => b.classList.remove('botao-tab-ativo'));
        
        // Adicionar classe ativa a este botão
        this.classList.add('botao-tab-ativo');
      });
    });
    
    console.log("[TabBotoes] Correção aplicada aos botões das abas!");
  }
  
  // Injetar estilos específicos para botões de abas
  function injetarEstilos() {
    // Verificar se já existe o estilo
    if (document.getElementById('tab-botoes-styles')) return;
    
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.id = 'tab-botoes-styles';
    
    // Definir estilos para os botões das abas
    style.textContent = `
      /* Estilo base para botões de abas */
      .botao-tab-estilizado,
      .bottom-tab-button,
      .tab-button,
      .bottom-tabs button,
      .tab-container button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 10px 20px !important;
        margin: 5px !important;
        border-radius: 50px !important;
        border: none !important;
        font-weight: bold !important;
        font-size: 14px !important;
        color: white !important;
        background: linear-gradient(45deg, #2196F3, #03A9F4) !important;
        cursor: pointer !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      
      /* Efeito hover */
      .botao-tab-estilizado:hover,
      .bottom-tab-button:hover,
      .tab-button:hover,
      .bottom-tabs button:hover,
      .tab-container button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15) !important;
        background: linear-gradient(45deg, #03A9F4, #2196F3) !important;
      }
      
      /* Estilo para botão ativo */
      .botao-tab-estilizado.botao-tab-ativo,
      .botao-tab-estilizado.active,
      .bottom-tab-button.active,
      .tab-button.active,
      .bottom-tabs button.active,
      .tab-container button.active,
      button[aria-selected="true"] {
        background: linear-gradient(45deg, #4CAF50, #8BC34A) !important;
        color: white !important;
        transform: translateY(0) !important;
      }
      
      /* Estilo para containers das abas */
      .bottom-tabs,
      .tab-container,
      .tab-buttons,
      .tab-header {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 10px 5px !important;
        background: #f5f5f5 !important;
        border-top: 1px solid #e0e0e0 !important;
        border-bottom: 1px solid #e0e0e0 !important;
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
    
    console.log("[TabBotoes] Estilos para botões de abas injetados");
  }
})();