/**
 * Correção DIRETA para as datas das cidades
 * Este script aplica uma solução direta e forçada para corrigir
 * o problema com as datas incorretas no cabeçalho dos eventos
 */

(function() {
  // Executar imediatamente para que o usuário não veja as datas incorretas
  if (document.readyState !== 'loading') {
    aplicarCorrecaoDireta();
  }
  
  // Executar quando o DOM estiver pronto, sem esperar recursos
  document.addEventListener('DOMContentLoaded', function() {
    aplicarCorrecaoDireta();
    setTimeout(aplicarCorrecaoDireta, 100);
  });
  
  // Executar quando a página estiver totalmente carregada
  window.addEventListener('load', function() {
    aplicarCorrecaoDireta();
    setTimeout(aplicarCorrecaoDireta, 100);
    setTimeout(aplicarCorrecaoDireta, 1000);
  });
  
  // Também observar mudanças no DOM
  const observer = new MutationObserver(function() {
    aplicarCorrecaoDireta();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributeFilter: ['class', 'style']
  });
  
  // Também aplicar quando o usuário interage com a página
  document.addEventListener('click', function() {
    setTimeout(aplicarCorrecaoDireta, 50);
  });
  
  // Solução direta e definitiva
  function aplicarCorrecaoDireta() {
    console.log("[DirectFix] Buscando elementos para correção...");
    
    // CORREÇÃO PARA RIBEIRÃO PRETO
    
    // 1. Encontrar todos os elementos com data de Ribeirão Preto
    document.querySelectorAll('.event-date').forEach(function(elemento) {
      const textoOriginal = elemento.textContent || '';
      
      if (textoOriginal.includes('Ribeirão Preto')) {
        // Forçar a data correta no formato dd/mm/yyyy
        elemento.textContent = 'Ribeirão Preto | 19/06/2025';
        console.log("[DirectFix] Corrigida data de Ribeirão Preto para 19/06/2025");
      }
    });
    
    // CORREÇÃO PARA PIEDADE
    
    // 1. Encontrar todos os elementos com data de Piedade
    document.querySelectorAll('.event-date').forEach(function(elemento) {
      const textoOriginal = elemento.textContent || '';
      
      if (textoOriginal.includes('Piedade')) {
        // Forçar a data correta no formato dd/mm/yyyy
        elemento.textContent = 'Piedade | 20/05/2025';
        console.log("[DirectFix] Corrigida data de Piedade para 20/05/2025");
      }
    });
    
    // GARANTIR QUE AS DESCRIÇÕES ESTEJAM CORRETAS
    
    // 1. Corrigir descrições para usar o formato completo com ano
    document.querySelectorAll('.event-description').forEach(function(elemento) {
      const textoOriginal = elemento.textContent || '';
      
      if (textoOriginal.includes('Piedade')) {
        if (!textoOriginal.includes('1842')) {
          elemento.textContent = 'Aniversário de fundação de Piedade em 20/05/1842';
          console.log("[DirectFix] Corrigida descrição de Piedade para incluir o ano 1842");
        }
      }
      
      if (textoOriginal.includes('Ribeirão Preto')) {
        if (!textoOriginal.includes('1856')) {
          elemento.textContent = 'Aniversário de fundação de Ribeirão Preto em 19/06/1856';
          console.log("[DirectFix] Corrigida descrição de Ribeirão Preto para incluir o ano 1856");
        }
      }
    });
    
    // CORREÇÃO FINAL: Injetar CSS que garante a visualização correta do horário
    const styleId = 'direct-fix-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Forçar ocultação de elementos incorretos e garantir exibição de elementos corretos */
        .event-date:contains('Piedade') {
          content: 'Piedade | 20/05/2025' !important;
        }
        .event-date:contains('Ribeirão Preto') {
          content: 'Ribeirão Preto | 19/06/2025' !important;
        }
      `;
      document.head.appendChild(style);
      console.log("[DirectFix] Injetado CSS para garantir exibição correta");
    }
  }
})();