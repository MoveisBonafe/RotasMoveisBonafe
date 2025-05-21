/**
 * Script para ajustar todas as cores dos botões para o amarelo da Móveis Bonafé
 * Aplica as cores automaticamente a todos os botões do sistema
 */
(function() {
  console.log("[AjusteCores] Aplicando cores amarelas em todos os botões");
  
  // Aplicar imediatamente
  aplicarCoresAmarelas();
  // Aplicar novamente após um curto período para garantir que todos os elementos foram carregados
  setTimeout(aplicarCoresAmarelas, 1000);
  setTimeout(aplicarCoresAmarelas, 3000);
  
  // Criar observer para monitorar alterações no DOM
  const observador = new MutationObserver(function(mutacoes) {
    aplicarCoresAmarelas();
  });
  
  // Iniciar observação
  observador.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  function aplicarCoresAmarelas() {
    // Injetar estilos CSS
    if (!document.getElementById('estilos-amarelos')) {
      const estilos = document.createElement('style');
      estilos.id = 'estilos-amarelos';
      estilos.textContent = `
        /* Cores para todos os botões */
        button,
        .button,
        .btn,
        input[type="button"],
        input[type="submit"],
        .bottom-tab-button,
        .tab-button,
        [class*="visualizar"],
        [class*="otimizar"] {
          background: linear-gradient(45deg, #FFD700, #FFA500) !important;
          color: #333 !important;
          font-weight: bold !important;
          border: none !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.3s ease !important;
        }
        
        /* Efeito hover */
        button:hover,
        .button:hover,
        .btn:hover,
        input[type="button"]:hover,
        input[type="submit"]:hover,
        .bottom-tab-button:hover,
        .tab-button:hover,
        [class*="visualizar"]:hover,
        [class*="otimizar"]:hover {
          background: linear-gradient(45deg, #FFA500, #FFD700) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Botões ativos */
        button.active,
        .button.active,
        .btn.active,
        .bottom-tab-button.active,
        .tab-button.active {
          background: linear-gradient(45deg, #FF8C00, #FFA500) !important;
        }
        
        /* Título Móveis Bonafé */
        .sidebar h2 {
          color: #FFA500 !important;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1) !important;
        }
      `;
      document.head.appendChild(estilos);
      console.log("[AjusteCores] Estilos amarelos injetados");
    }
    
    // Aplicar classes diretamente aos elementos
    const botoes = document.querySelectorAll('button, .button, .btn, input[type="button"], input[type="submit"], .bottom-tab-button, .tab-button');
    botoes.forEach(botao => {
      // Verificar se já processamos
      if (!botao.hasAttribute('data-cor-amarela')) {
        botao.setAttribute('data-cor-amarela', 'true');
        console.log("[AjusteCores] Aplicando estilo em botão:", botao.textContent.trim());
      }
    });
  }
})();