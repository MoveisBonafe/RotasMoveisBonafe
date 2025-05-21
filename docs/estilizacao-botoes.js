/**
 * Script específico para garantir que todos os botões da aba inferior
 * fiquem com bordas arredondadas e com a cor amarela da Móveis Bonafé
 */
(function() {
  console.log("[EstilizacaoBotoes] Iniciando estilização específica para botões");
  
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