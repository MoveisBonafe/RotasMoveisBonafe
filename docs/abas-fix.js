/**
 * Script exclusivo para corrigir o estilo das abas inferiores
 * Garante cantos arredondados para as abas de eventos, restrições e relatórios
 */
(function() {
  console.log("[AbasFix] Iniciando correção específica para abas inferiores");
  
  // Aplicar correções imediatamente e periodicamente
  aplicarCorrecoes();
  setInterval(aplicarCorrecoes, 1000);
  
  function aplicarCorrecoes() {
    // Seletor mais amplo para capturar qualquer botão na área inferior
    const botoesAbas = document.querySelectorAll('.bottom-tab-button, .tab-button, button[onclick*="Tab"], .bottom-tabs button, #bottom-tabs button');
    
    botoesAbas.forEach(botao => {
      console.log("[AbasFix] Aplicando estilo em botão:", botao.textContent.trim());
      
      // Forçar estilo arredondado
      botao.style.borderRadius = '25px';
      botao.style.WebkitBorderRadius = '25px';
      botao.style.MozBorderRadius = '25px';
      
      // Forçar estilo de cor
      botao.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
      botao.style.backgroundColor = '#FFA500';
      botao.style.color = '#333';
      
      // Forçar estilo de borda e sombra
      botao.style.border = 'none';
      botao.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      // Forçar espaçamento
      botao.style.margin = '5px';
      botao.style.padding = '10px 20px';
      
      // Forçar texto em negrito
      botao.style.fontWeight = 'bold';
      
      // Ajustar largura
      botao.style.minWidth = '120px';
      
      // Adicionar classe para estilização via CSS
      botao.classList.add('botao-aba-estilizado');
    });
    
    // Procurar especificamente pelos botões com o texto correto
    const textosBotoes = ['Eventos na Rota', 'Restrições de Tráfego', 'Relatório da Rota', 'Eventos', 'Restrições', 'Relatório', 'Informações'];
    
    textosBotoes.forEach(texto => {
      document.querySelectorAll('button, .button, .btn').forEach(botao => {
        if (botao.textContent.includes(texto)) {
          console.log("[AbasFix] Encontrado botão específico:", texto);
          
          // Aplicar estilos ainda mais agressivamente
          botao.style.borderRadius = '25px !important';
          botao.style.background = 'linear-gradient(45deg, #FFD700, #FFA500) !important';
          botao.style.color = '#333 !important';
          botao.style.border = 'none !important';
          botao.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2) !important';
          botao.style.margin = '5px !important';
          botao.style.padding = '10px 20px !important';
          botao.style.fontWeight = 'bold !important';
          
          // Adicionar atributo para que não seja sobrescrito
          botao.setAttribute('data-estilizado', 'true');
        }
      });
    });
    
    // Estilizar o container das abas
    const containerAbas = document.querySelector('.bottom-tabs, #bottom-tabs');
    if (containerAbas) {
      containerAbas.style.borderTopLeftRadius = '25px';
      containerAbas.style.borderTopRightRadius = '25px';
      containerAbas.style.backgroundColor = '#f8f9fa';
      containerAbas.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.1)';
      containerAbas.style.paddingTop = '10px';
      
      // Garantir que os botões dentro fiquem bem formatados
      const botoesContainer = containerAbas.querySelector('.bottom-tab-buttons, .tab-buttons');
      if (botoesContainer) {
        botoesContainer.style.display = 'flex';
        botoesContainer.style.justifyContent = 'center';
        botoesContainer.style.gap = '10px';
        botoesContainer.style.margin = '0 auto';
        botoesContainer.style.width = 'fit-content';
      }
    }
  }
  
  // Injetar CSS direto para garantir estilos
  const estilos = document.createElement('style');
  estilos.innerHTML = `
    /* Estilo forçado para botões de aba */
    .bottom-tab-button,
    .tab-button,
    button[onclick*="Tab"],
    .botao-aba-estilizado,
    button:contains("Eventos"),
    button:contains("Restrições"),
    button:contains("Relatório") {
      border-radius: 25px !important;
      background: linear-gradient(45deg, #FFD700, #FFA500) !important;
      color: #333 !important;
      border: none !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
      margin: 5px !important;
      padding: 10px 20px !important;
      font-weight: bold !important;
      min-width: 120px !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
    }
    
    /* Efeito hover */
    .bottom-tab-button:hover,
    .tab-button:hover,
    .botao-aba-estilizado:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
      background: linear-gradient(45deg, #FFA500, #FFD700) !important;
    }
    
    /* Botão ativo */
    .bottom-tab-button.active,
    .tab-button.active,
    .botao-aba-estilizado.active {
      background: linear-gradient(45deg, #FF8C00, #FFA500) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
    }
    
    /* Container das abas */
    .bottom-tabs,
    #bottom-tabs {
      border-top-left-radius: 25px !important;
      border-top-right-radius: 25px !important;
      background-color: #f8f9fa !important;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
      padding-top: 10px !important;
      overflow: hidden !important;
    }
    
    /* Container dos botões */
    .bottom-tab-buttons,
    .tab-buttons {
      display: flex !important;
      justify-content: center !important;
      gap: 10px !important;
      margin: 0 auto !important;
      width: fit-content !important;
    }
  `;
  document.head.appendChild(estilos);
  
  // Usar MutationObserver para detectar mudanças no DOM
  const observer = new MutationObserver(() => {
    aplicarCorrecoes();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
})();