/**
 * Script específico para garantir que todos os botões da aba inferior
 * fiquem com bordas arredondadas e com a cor amarela da Móveis Bonafé
 */
(function() {
  console.log("[EstilizacaoBotoes] Iniciando estilização específica para botões");
  
  // Adicionar CSS para arredondar as abas inferiores e botões
  const estiloCSS = document.createElement('style');
  estiloCSS.textContent = `
    /* Arredondar os botões da aba inferior */
    .bottom-tab-button,
    button[onclick*="openTab"],
    .bottom-tabs button,
    #bottom-tabs button,
    .tab-button {
      border-radius: 50px !important;
      -webkit-border-radius: 50px !important;
      -moz-border-radius: 50px !important;
      margin: 5px !important;
      padding: 10px 20px !important;
      background: linear-gradient(45deg, #FFD700, #FFA500) !important;
      color: #333 !important;
      font-weight: bold !important;
      border: none !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
      overflow: hidden !important;
    }
    
    /* Arredondar a própria aba inferior */
    .bottom-tabs {
      border-top-left-radius: 25px !important;
      border-top-right-radius: 25px !important;
      overflow: hidden !important;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
      margin-top: -25px !important;
      padding-top: 25px !important;
    }
    
    /* Destacar botão ativo */
    .bottom-tab-button.active,
    .bottom-tabs button.active,
    #bottom-tabs button.active,
    .tab-button.active {
      background: linear-gradient(45deg, #FF8C00, #FFA500) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
    }
    
    /* Aplicar hover effect */
    .bottom-tab-button:hover,
    .bottom-tabs button:hover,
    #bottom-tabs button:hover,
    .tab-button:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
      background: linear-gradient(45deg, #FFA500, #FFD700) !important;
    }
  `;
  document.head.appendChild(estiloCSS);
  
  // Executar imediatamente e periodicamente
  aplicarEstilos();
  setInterval(aplicarEstilos, 1000);
  
  function aplicarEstilos() {
    // Garantir que botões específicos da aba inferior fiquem arredondados
    const botoes = document.querySelectorAll(
      '.bottom-tab-button, ' +
      'button[onclick*="openTab"], ' + 
      '.bottom-tabs button, ' +
      '#bottom-tabs button, ' +
      '.tab-button'
    );
    
    botoes.forEach(botao => {
      // Aplicar estilo arredondado
      botao.style.borderRadius = '50px';
      botao.style.WebkitBorderRadius = '50px';
      botao.style.MozBorderRadius = '50px';
      
      // Garantir espaçamento adequado
      botao.style.margin = '5px';
      botao.style.padding = '10px 20px';
      
      // Aplicar cor amarela da marca
      botao.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
      botao.style.color = '#333';
      botao.style.fontWeight = 'bold';
      botao.style.border = 'none';
      botao.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      if (botao.classList.contains('active')) {
        botao.style.background = 'linear-gradient(45deg, #FF8C00, #FFA500)';
      }
    });
    
    // Arredondar as próprias abas inferiores
    const abasInferiores = document.querySelectorAll('.bottom-tabs, #bottom-tabs');
    abasInferiores.forEach(aba => {
      aba.style.borderTopLeftRadius = '25px';
      aba.style.borderTopRightRadius = '25px';
      aba.style.WebkitBorderTopLeftRadius = '25px';
      aba.style.WebkitBorderTopRightRadius = '25px';
      aba.style.MozBorderRadiusTopleft = '25px';
      aba.style.MozBorderRadiusTopright = '25px';
      aba.style.overflow = 'hidden';
      aba.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.1)';
      aba.style.marginTop = '-25px';
      aba.style.paddingTop = '25px';
      aba.style.backgroundColor = '#f8f9fa';
    });
    
    // Procurar e estilizar também outros possíveis contêineres de abas
    document.querySelectorAll('.tab-container, .tabs-container, .tabs-wrapper').forEach(container => {
      container.style.borderTopLeftRadius = '25px';
      container.style.borderTopRightRadius = '25px';
      container.style.overflow = 'hidden';
      container.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.1)';
    });
    
    // Reduzir área de importação 
    const importArea = document.querySelectorAll('input[type="file"], #import-file');
    importArea.forEach(input => {
      if (input.parentNode) {
        // Estilizar o próprio input
        input.style.maxHeight = '120px';
        input.style.overflow = 'hidden';
        input.style.marginBottom = '10px';
        
        // Verificar se o input já foi estilizado
        if (!input.hasAttribute('data-estilizado')) {
          input.setAttribute('data-estilizado', 'true');
          
          // Criar container visualmente atraente
          const container = document.createElement('div');
          container.style.border = '1px dashed #FFA500';
          container.style.borderRadius = '10px';
          container.style.padding = '10px';
          container.style.backgroundColor = '#FFF8E1';
          container.style.maxHeight = '120px';
          container.style.marginBottom = '10px';
          
          // Mover o input para o container
          const parent = input.parentNode;
          parent.insertBefore(container, input);
          container.appendChild(input);
          
          console.log("[EstilizacaoBotoes] Input de importação estilizado");
        }
      }
    });
  }
})();