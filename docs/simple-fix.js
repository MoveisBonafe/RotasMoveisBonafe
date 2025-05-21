/**
 * Solução simples e direta para o estilo dos botões
 * Esta abordagem altera somente o necessário para que os botões
 * tenham a aparência correta no GitHub Pages
 */

// Executar quando a página estiver pronta
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(aplicarEstilos, 1000);
});

// Também executar quando a página estiver totalmente carregada
window.addEventListener('load', function() {
  aplicarEstilos();
  setTimeout(aplicarEstilos, 2000);
});

// Função principal
function aplicarEstilos() {
  // Selecionar os botões das abas inferiores
  var botoes = document.querySelectorAll('.bottom-tab-btn');
  if (botoes.length === 0) {
    console.log("Botões das abas ainda não disponíveis");
    return;
  }
  
  console.log("Aplicando estilo para " + botoes.length + " botões");
  
  // Aplicar estilos aos botões
  botoes.forEach(function(botao) {
    // Estilo base para todos os botões
    botao.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    botao.style.fontSize = "14px";
    botao.style.padding = "12px 20px";
    botao.style.border = "none";
    botao.style.borderRadius = "4px 4px 0 0";
    botao.style.margin = "0 2px";
    botao.style.cursor = "pointer";
    
    // Estilo específico para botão ativo ou inativo
    if (botao.classList.contains('active')) {
      botao.style.backgroundColor = "#ffc107";
      botao.style.color = "#000000";
      botao.style.fontWeight = "600";
    } else {
      botao.style.backgroundColor = "#f8f9fa";
      botao.style.color = "#495057";
      botao.style.fontWeight = "500";
    }
  });
  
  // Estilizar botões principais (Visualizar/Otimizar)
  var botoesAcao = document.querySelectorAll('.bottom-action-btn');
  botoesAcao.forEach(function(botao) {
    botao.style.backgroundColor = "#ffc107";
    botao.style.color = "#000000";
    botao.style.fontWeight = "600";
    botao.style.padding = "10px 20px";
    botao.style.borderRadius = "20px";
    botao.style.border = "none";
    botao.style.margin = "5px";
    botao.style.cursor = "pointer";
  });
}