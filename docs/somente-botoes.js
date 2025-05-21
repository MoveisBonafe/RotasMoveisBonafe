/**
 * Script minimalista que altera apenas a cor dos botões para amarelo
 * sem modificar a estrutura da página
 */
(function() {
  console.log("Iniciando personalização de botões");
  
  // Executar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', function() {
    aplicarEstiloBotoes();
  });
  
  // Executar quando a página inteira estiver carregada
  window.addEventListener('load', function() {
    aplicarEstiloBotoes();
    
    // Executar novamente após um tempo para garantir que todos os elementos estejam carregados
    setTimeout(aplicarEstiloBotoes, 1000);
    setTimeout(aplicarEstiloBotoes, 3000);
  });
  
  function aplicarEstiloBotoes() {
    // Estilo inline para os botões (mais seguro)
    const botoes = document.querySelectorAll('button, .bottom-tab-button');
    
    botoes.forEach(function(botao) {
      botao.style.backgroundColor = "#FFD700";
      botao.style.borderRadius = "50px";
      botao.style.color = "#333";
      botao.style.fontWeight = "bold";
      botao.style.border = "none";
    });
    
    console.log("Estilo dos botões aplicado");
  }
})();