/**
 * Correção específica para o problema de Piedade
 * Este script corrige a data de Piedade e garante que os eventos
 * só apareçam quando a cidade estiver no percurso
 */

(function() {
  // Executar quando a página estiver carregada
  window.addEventListener('load', function() {
    setTimeout(aplicarCorrecaoPiedade, 1000);
    setTimeout(aplicarCorrecaoPiedade, 3000);
    
    // Também aplicar quando o usuário interage com a página
    document.addEventListener('click', function() {
      setTimeout(aplicarCorrecaoPiedade, 200);
    });
    
    // Observar mudanças no DOM
    const observer = new MutationObserver(function(mutations) {
      const precisaCorrigir = mutations.some(mutation => 
        mutation.addedNodes.length > 0 || 
        (mutation.target && mutation.target.classList && 
         (mutation.target.classList.contains('event-list') || 
          mutation.target.classList.contains('bottom-tab-content')))
      );
      
      if (precisaCorrigir) {
        setTimeout(aplicarCorrecaoPiedade, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  });
  
  function aplicarCorrecaoPiedade() {
    console.log("[PiedadeFix] Verificando eventos da cidade de Piedade...");
    
    // Corrigir data de Piedade em todos os elementos visuais
    document.querySelectorAll('.event-date, .event-title, .event-description').forEach(elemento => {
      const texto = elemento.textContent || '';
      
      // Verificar se é um elemento relacionado a Piedade
      if (texto.includes('Piedade')) {
        // Corrigir data se estiver incorreta
        if (texto.includes('19/05') || texto.includes('18/03')) {
          // Se for um elemento com o formato "Piedade | DATA"
          if (texto.includes('|')) {
            const partes = texto.split('|');
            elemento.textContent = `${partes[0].trim()} | 20/05/2025`;
            console.log("[PiedadeFix] Corrigida data de Piedade para 20/05/2025");
          } 
          // Se for um elemento com descrição completa
          else if (texto.includes('Aniversário de fundação')) {
            elemento.textContent = texto.replace(/em \d{2}\/\d{2}(\/\d{4})?/, "em 20/05/1842");
            console.log("[PiedadeFix] Corrigida descrição de Piedade");
          }
        }
      }
    });
    
    // Verificar se Piedade está no percurso atual
    const piedadeNoPercurso = verificarPiedadeNoPercurso();
    console.log("[PiedadeFix] Piedade está no percurso? " + piedadeNoPercurso);
    
    // Ocultar ou mostrar eventos de Piedade conforme necessário
    document.querySelectorAll('.event-item').forEach(eventoElement => {
      const textoEvento = eventoElement.textContent || '';
      
      // Verificar se é um evento de Piedade
      if (textoEvento.includes('Piedade')) {
        if (piedadeNoPercurso) {
          eventoElement.style.display = '';
          console.log("[PiedadeFix] Mostrando evento de Piedade (cidade no percurso)");
        } else {
          eventoElement.style.display = 'none';
          console.log("[PiedadeFix] Ocultando evento de Piedade (cidade fora do percurso)");
        }
      }
    });
  }
  
  function verificarPiedadeNoPercurso() {
    // Verificar se Piedade está listada no percurso atual
    
    // Método 1: Verificar no título do percurso (origem → destino)
    const percursoElement = document.querySelector('.restrictions-list div[style*="background-color: rgb(255, 193, 7)"] span');
    if (percursoElement) {
      const textoPecurso = percursoElement.textContent || '';
      if (textoPecurso.includes('Piedade')) {
        return true;
      }
    }
    
    // Método 2: Verificar nas cidades listadas com marcação "Esta cidade está no seu percurso"
    const cidadesNoPercurso = document.querySelectorAll('.city-in-route');
    for (let i = 0; i < cidadesNoPercurso.length; i++) {
      const elemento = cidadesNoPercurso[i];
      const elementoCidade = elemento.previousElementSibling?.previousElementSibling?.querySelector('span');
      if (elementoCidade && elementoCidade.textContent && elementoCidade.textContent.includes('Piedade')) {
        return true;
      }
    }
    
    // Método 3: Verificar na lista de locais adicionados
    const listaLocais = document.querySelector('#locationList');
    if (listaLocais && listaLocais.textContent && listaLocais.textContent.includes('Piedade')) {
      return true;
    }
    
    return false;
  }
})();