/**
 * Correção crítica para problemas de layout no GitHub Pages
 * Este script aplica estilos com máxima prioridade e sobrescreve qualquer outro CSS
 */

(function() {
  // Aplicar imediatamente para evitar atrasos visuais
  console.log("[CriticalFix] Iniciando correção de estilo para botões das abas...");
  
  // Verificar e corrigir repetidamente
  applyFix();
  setTimeout(applyFix, 500);
  setTimeout(applyFix, 1500);
  setTimeout(applyFix, 3000);
  
  // Intervalo para garantir que o estilo sempre será aplicado mesmo se outros scripts tentarem sobrescrever
  setInterval(applyFix, 5000);
  
  // Adicionar eventos para garantir aplicação após interações do usuário
  document.addEventListener('click', function() {
    setTimeout(applyFix, 100);
  });
  
  function applyFix() {
    // 1. Aplicar estilos inline diretamente no HTML (não pode ser sobrescrito por CSS externo)
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    tabButtons.forEach(button => {
      // Estilos básicos para garantir aparência consistente
      button.setAttribute('style', `
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 14px !important;
        font-weight: ${button.classList.contains('active') ? '600' : '500'} !important;
        padding: 15px 20px !important;
        border: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        transition: all 0.25s ease !important;
        cursor: pointer !important;
        background-color: ${button.classList.contains('active') ? '#fff8e1' : 'transparent'} !important;
        color: ${button.classList.contains('active') ? '#ffab00' : '#495057'} !important;
        box-shadow: ${button.classList.contains('active') ? 'inset 0 -3px 0 #ffc107' : 'none'} !important;
      `);
      
      // Adicionar evento de clique para atualizar estilos ao mudar de aba
      if (!button.getAttribute('data-style-fixed')) {
        button.addEventListener('click', function() {
          // Atualizar estilo de todos os botões ao clicar
          tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('style', `
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              padding: 15px 20px !important;
              border: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
              transition: all 0.25s ease !important;
              cursor: pointer !important;
              background-color: transparent !important;
              color: #495057 !important;
              box-shadow: none !important;
            `);
          });
          
          // Atualizar estilo e classe do botão atual
          this.classList.add('active');
          this.setAttribute('style', `
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            padding: 15px 20px !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            transition: all 0.25s ease !important;
            cursor: pointer !important;
            background-color: #fff8e1 !important;
            color: #ffab00 !important;
            box-shadow: inset 0 -3px 0 #ffc107 !important;
          `);
          
          // Atualizar conteúdo das abas - encontrar todos os conteúdos e mostrar apenas o ativo
          const tabId = this.getAttribute('data-tab-id');
          const allContents = document.querySelectorAll('.bottom-tab-content');
          allContents.forEach(content => {
            content.classList.remove('active-content');
            content.style.display = 'none';
          });
          
          const activeContent = document.getElementById(tabId);
          if (activeContent) {
            activeContent.classList.add('active-content');
            activeContent.style.display = 'block';
          }
        });
        
        // Marcar como corrigido para evitar adicionar o mesmo evento múltiplas vezes
        button.setAttribute('data-style-fixed', 'true');
      }
    });
    
    // 2. Injetar CSS crítico com alta prioridade
    const styleId = 'critical-fix-style';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.innerHTML = `
        /* Reset e estilo para as abas na parte inferior */
        .bottom-tabs-container {
          background-color: #f8f9fa !important;
          border-top: 1px solid #e9ecef !important;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.05) !important;
          z-index: 1000 !important;
        }
        
        /* Navegação das abas - forçar estilo horizontal */
        .tabs-nav {
          display: flex !important;
          flex-direction: row !important;
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #e9ecef !important;
        }
        
        /* Esconder conteúdos de abas inativas */
        .bottom-tab-content:not(.active-content) {
          display: none !important;
        }
        
        /* Mostrar apenas o conteúdo ativo */
        .bottom-tab-content.active-content {
          display: block !important;
          padding: 15px 20px !important;
        }
        
        /* Estilo para botões das abas */
        .bottom-tab-btn {
          flex: 1 !important;
          text-align: center !important;
          line-height: normal !important;
          display: inline-block !important;
          float: none !important;
          min-width: 80px !important;
        }
        
        /* Ajustar estilos para que combinem com a sidebar */
        .event-item, .restriction-item {
          background-color: #fff !important;
          border: 1px solid #e9ecef !important;
          border-radius: 8px !important;
          padding: 12px 15px !important;
          margin-bottom: 12px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important;
        }
      `;
      // Inserir no início do head para ter prioridade máxima
      document.head.insertBefore(styleElement, document.head.firstChild);
    }
    
    // 3. Verificar se os botões "Eventos na Rota", etc. estão com estilo consistente
    const tabControlButtons = document.querySelectorAll('.bottom-tabs-nav button');
    tabControlButtons.forEach(button => {
      button.setAttribute('style', `
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 14px !important;
        font-weight: ${button.classList.contains('active') ? '600' : '500'} !important;
        padding: 10px 15px !important;
        border: 1px solid #ffe082 !important;
        border-radius: 4px !important;
        margin: 5px !important;
        transition: all 0.25s ease !important;
        cursor: pointer !important;
        background-color: #fff8e1 !important;
        color: #ffab00 !important;
      `);
    });
    
    console.log("[CriticalFix] Correção de estilo aplicada");
  }
})();