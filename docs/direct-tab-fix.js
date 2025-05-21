/**
 * Correção direta para botões de aba no GitHub Pages
 * Este script define o estilo diretamente no elemento
 */

(function() {
  // Executar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(applyStyles, 200);
    setTimeout(applyStyles, 1000);
    setTimeout(applyStyles, 2000);
  });
  
  // Também executar quando a página está completamente carregada
  window.addEventListener('load', function() {
    applyStyles();
    setTimeout(applyStyles, 500);
  });
  
  // Executar imediatamente caso a página já esteja carregada
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyStyles();
  }
  
  function applyStyles() {
    console.log("[DirectFix] Aplicando estilos para botões e abas...");
    
    // 1. Estilo para os botões de aba
    const tabButtons = document.querySelectorAll('.bottom-tab-btn');
    if (tabButtons.length === 0) {
      console.log("[DirectFix] Botões de aba não encontrados, tentando novamente mais tarde...");
      return;
    }
    
    tabButtons.forEach(function(button) {
      button.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      button.style.fontSize = "14px";
      button.style.fontWeight = button.classList.contains('active') ? "600" : "500";
      button.style.padding = "12px 20px";
      button.style.border = "none";
      button.style.backgroundColor = button.classList.contains('active') ? "#fff8e1" : "transparent";
      button.style.color = button.classList.contains('active') ? "#ffab00" : "#495057";
      button.style.boxShadow = button.classList.contains('active') ? "inset 0 -3px 0 #ffc107" : "none";
      button.style.borderRadius = "0";
      button.style.margin = "0 3px";
      button.style.cursor = "pointer";
      button.style.transition = "all 0.25s ease";
      
      // Adicionar eventos apenas uma vez
      if (!button.getAttribute('data-styled')) {
        button.addEventListener('mouseover', function() {
          if (!this.classList.contains('active')) {
            this.style.backgroundColor = "#f1f3f5";
            this.style.color = "#212529";
          }
        });
        
        button.addEventListener('mouseout', function() {
          if (!this.classList.contains('active')) {
            this.style.backgroundColor = "transparent";
            this.style.color = "#495057";
          }
        });
        
        button.addEventListener('click', function() {
          // Atualizar aparência dos botões quando clicados
          tabButtons.forEach(function(btn) {
            btn.classList.remove('active');
            btn.style.backgroundColor = "transparent";
            btn.style.color = "#495057";
            btn.style.fontWeight = "500";
            btn.style.boxShadow = "none";
          });
          
          this.classList.add('active');
          this.style.backgroundColor = "#fff8e1";
          this.style.color = "#ffab00";
          this.style.fontWeight = "600";
          this.style.boxShadow = "inset 0 -3px 0 #ffc107";
          
          // Mostrar o conteúdo correspondente
          const tabId = this.getAttribute('data-tab-id');
          const contents = document.querySelectorAll('.bottom-tab-content');
          
          contents.forEach(function(content) {
            content.classList.remove('active-content');
            content.style.display = 'none';
          });
          
          const activeContent = document.getElementById(tabId);
          if (activeContent) {
            activeContent.classList.add('active-content');
            activeContent.style.display = 'block';
          }
        });
        
        button.setAttribute('data-styled', 'true');
      }
    });
    
    // 2. Garantir que apenas o conteúdo atual seja exibido
    const contents = document.querySelectorAll('.bottom-tab-content');
    contents.forEach(function(content) {
      if (content.classList.contains('active-content')) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
    
    // 3. Estilizar os botões principais
    const viewButton = document.querySelector('#visualizar') || document.querySelector('button:contains("Visualizar")');
    const optimizeButton = document.querySelector('#otimizar') || document.querySelector('button:contains("Otimizar")');
    
    const styleMainButton = function(button) {
      if (!button) return;
      
      button.style.backgroundColor = "#ffc107";
      button.style.color = "#000";
      button.style.fontWeight = "600";
      button.style.border = "none";
      button.style.borderRadius = "24px";
      button.style.padding = "12px 24px";
      button.style.margin = "5px";
      button.style.cursor = "pointer";
      button.style.transition = "all 0.3s ease";
      
      // Adicionar hover apenas uma vez
      if (!button.getAttribute('data-styled')) {
        button.addEventListener('mouseover', function() {
          this.style.backgroundColor = "#ffb300";
          this.style.transform = "translateY(-2px)";
          this.style.boxShadow = "0 4px 8px rgba(255, 171, 0, 0.3)";
        });
        
        button.addEventListener('mouseout', function() {
          this.style.backgroundColor = "#ffc107";
          this.style.transform = "translateY(0)";
          this.style.boxShadow = "none";
        });
        
        button.setAttribute('data-styled', 'true');
      }
    };
    
    styleMainButton(viewButton);
    styleMainButton(optimizeButton);
    
    console.log("[DirectFix] Estilos aplicados com sucesso");
  }
})();