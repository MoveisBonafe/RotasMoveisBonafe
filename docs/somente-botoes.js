/**
 * Script para ajustes específicos no site GitHub Pages:
 * - Mudança de cor dos botões para amarelo (incluindo botão Otimizar)
 * - Remoção do botão de zoom do mapa
 * - Fundo branco para a aba inferior de relatório
 */
(function() {
  console.log("Iniciando ajustes específicos");
  
  // Executar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', function() {
    aplicarAjustes();
  });
  
  // Executar quando a página inteira estiver carregada
  window.addEventListener('load', function() {
    aplicarAjustes();
    
    // Executar novamente após um tempo para garantir que todos os elementos estejam carregados
    setTimeout(aplicarAjustes, 1000);
    setTimeout(aplicarAjustes, 3000);
    setInterval(aplicarAjustes, 5000); // Continuar verificando periodicamente
  });
  
  function aplicarAjustes() {
    // 1. Estilo amarelo para todos os botões
    const botoes = document.querySelectorAll('button, .bottom-tab-button');
    
    botoes.forEach(function(botao) {
      botao.style.backgroundColor = "#FFD700";
      botao.style.borderRadius = "50px";
      botao.style.color = "#333";
      botao.style.fontWeight = "bold";
      botao.style.border = "none";
    });
    
    // 2. Garantir que o botão Otimizar também tenha a cor amarela
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      botaoOtimizar.style.backgroundColor = "#FFD700";
      botaoOtimizar.style.background = "linear-gradient(45deg, #FFD700, #FFA500)";
      botaoOtimizar.style.borderRadius = "50px";
      botaoOtimizar.style.color = "#333";
      botaoOtimizar.style.fontWeight = "bold";
      botaoOtimizar.style.border = "none";
    }
    
    // 3. Remover botão de zoom do mapa
    const zoomControls = document.querySelectorAll('.gm-control-active, .gm-bundled-control, .gm-bundled-control-on-bottom, .gmnoprint');
    zoomControls.forEach(function(control) {
      if (control && control.parentNode) {
        control.style.display = 'none';
      }
    });
    
    // 4. Fundo branco para a aba inferior de relatório
    const bottomTabs = document.querySelector('.bottom-tabs');
    if (bottomTabs) {
      bottomTabs.style.backgroundColor = "#FFFFFF";
    }
    
    const bottomTabContents = document.querySelectorAll('.bottom-tab-content');
    bottomTabContents.forEach(function(content) {
      content.style.backgroundColor = "#FFFFFF";
    });
    
    // Específico para a aba de informações (relatório)
    const infoTab = document.getElementById('bottom-info');
    if (infoTab) {
      infoTab.style.backgroundColor = "#FFFFFF";
    }
    
    console.log("Ajustes aplicados");
  }
})();