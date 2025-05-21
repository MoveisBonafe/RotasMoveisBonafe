/**
 * Correção mínima para o GitHub Pages
 * Essa abordagem é conservadora, apenas aplicando estilos essenciais
 * sem modificar a estrutura do DOM
 */
(function() {
  console.log("[CorrecaoMinima] Aplicando correções mínimas");
  
  // Aplicar correções assim que o documento carregar
  document.addEventListener('DOMContentLoaded', aplicarCorrecoes);
  window.addEventListener('load', aplicarCorrecoes);
  setTimeout(aplicarCorrecoes, 500);
  setTimeout(aplicarCorrecoes, 2000);
  
  function aplicarCorrecoes() {
    console.log("[CorrecaoMinima] Iniciando correções...");
    
    // 1. Botões com estilo amarelo
    corrigirBotoes();
    
    // 2. Cores para Móveis Bonafé
    aplicarCores();
    
    // 3. Remover controles indesejados
    removerControles();
    
    console.log("[CorrecaoMinima] Correções aplicadas");
  }
  
  // Aplicar estilo amarelo aos botões
  function corrigirBotoes() {
    const botoes = document.querySelectorAll('button, .bottom-tab-button');
    
    botoes.forEach(botao => {
      botao.style.background = "linear-gradient(45deg, #FFD700, #FFA500)";
      botao.style.color = "#333";
      botao.style.fontWeight = "bold";
      botao.style.borderRadius = "50px";
      botao.style.border = "none";
      botao.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    });
    
    console.log("[CorrecaoMinima] Botões corrigidos");
  }
  
  // Aplicar cores da Móveis Bonafé
  function aplicarCores() {
    // Adicionar estilo CSS
    const style = document.createElement('style');
    style.textContent = `
      .sidebar h2 {
        color: #FFA500 !important;
      }
      
      .gm-fullscreen-control, .gm-svpc {
        display: none !important;
      }
      
      button:hover, 
      .button:hover, 
      .btn:hover,
      .bottom-tab-button:hover {
        background: linear-gradient(45deg, #FFA500, #FFD700) !important;
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(style);
    
    console.log("[CorrecaoMinima] Cores aplicadas");
  }
  
  // Remover controles indesejados do mapa
  function removerControles() {
    setInterval(() => {
      const controles = document.querySelectorAll('.gm-fullscreen-control, .gm-svpc');
      controles.forEach(controle => {
        if (controle) {
          controle.style.display = 'none';
        }
      });
    }, 1000);
    
    console.log("[CorrecaoMinima] Controles removidos");
  }
})();