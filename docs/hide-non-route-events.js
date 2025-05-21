/**
 * Solução Direta para Eventos
 * 
 * - Oculta eventos de cidades que não estão no percurso
 * - Corrige as descrições sem data
 * - Corrige a data de Piedade para 20/05
 */

// Auto-executável
(function() {
  console.log("[Correção] Aplicando solução para exibição de eventos");

  // Executar em intervalos para garantir
  setTimeout(corrigirEventos, 500);
  setTimeout(corrigirEventos, 1500);
  setTimeout(corrigirEventos, 3000);
  
  // Observar mudanças no DOM
  const observer = new MutationObserver(function() {
    setTimeout(corrigirEventos, 300);
  });
  
  observer.observe(document.body, {
    childList: true, 
    subtree: true
  });
  
  // Quando o usuário clica em algo
  document.addEventListener('click', function() {
    setTimeout(corrigirEventos, 300);
  });
  
  // Função principal de correção
  function corrigirEventos() {
    // Obter cidades efetivamente no percurso
    const cidadesPercurso = [];
    
    // Adicionar origem
    const origem = document.querySelector('.sidebar strong');
    if (origem) {
      cidadesPercurso.push(origem.textContent.split(',')[0].trim());
    }
    
    // Adicionar locais com marcador vermelho ou azul
    document.querySelectorAll('.location-item').forEach(function(item) {
      const nomeLocalElement = item.querySelector('div'); // O primeiro div costuma ter o nome
      if (nomeLocalElement) {
        const nomeLocal = nomeLocalElement.textContent.trim();
        if (nomeLocal) {
          cidadesPercurso.push(nomeLocal);
        }
      }
    });
    
    // Adicionar os locais da lista
    document.querySelectorAll('#locationList li').forEach(function(item) {
      cidadesPercurso.push(item.textContent.trim());
    });
    
    // Mostrar o que encontramos
    console.log("[Correção] Cidades no percurso: " + cidadesPercurso.join(', '));
    
    // Se não temos cidades suficientes, não fazer nada
    if (cidadesPercurso.length < 1) {
      console.log("[Correção] Insuficientes cidades para filtrar");
      return;
    }
    
    // Processar cada evento
    const eventos = document.querySelectorAll('.event-item');
    console.log("[Correção] Processando " + eventos.length + " eventos");
    
    eventos.forEach(function(evento) {
      // Extrair nome da cidade deste evento
      let cidadeEvento = "";
      
      const dataElement = evento.querySelector('.event-date');
      if (dataElement) {
        const texto = dataElement.textContent;
        if (texto && texto.includes('|')) {
          // Formato: "Cidade | Data"
          cidadeEvento = texto.split('|')[0].trim();
        }
      }
      
      // Verificar se esta cidade está no percurso
      const cidadeNoPercurso = estaNaLista(cidadeEvento, cidadesPercurso);
      
      // Mostrar ou ocultar o evento conforme necessário
      if (cidadeNoPercurso) {
        evento.style.display = 'block';
        console.log("[Correção] Mostrando evento para " + cidadeEvento);
      } else {
        evento.style.display = 'none';
        console.log("[Correção] Ocultando evento para " + cidadeEvento);
      }
      
      // Corrigir descrições sem data
      const descricaoElement = evento.querySelector('.event-description');
      if (descricaoElement) {
        const texto = descricaoElement.textContent;
        if (texto && texto.includes('Aniversário de fundação') && !texto.includes(' em ')) {
          
          // Adicionar a data conforme a cidade
          if (texto.includes('Piedade')) {
            descricaoElement.textContent = texto + " em 20/05/1842";
          } else if (texto.includes('Ribeirão Preto')) {
            descricaoElement.textContent = texto + " em 19/06/1856";
          } else if (texto.includes('Dois Córregos')) {
            descricaoElement.textContent = texto + " em 04/02/1883";
          } else {
            descricaoElement.textContent = texto + " em 2025";
          }
          
          console.log("[Correção] Adicionada data à descrição: " + descricaoElement.textContent);
        }
        
        // Corrigir especificamente Piedade se tiver data errada
        if (texto && texto.includes('Piedade') && 
            (texto.includes('19/05') || texto.includes('18/03'))) {
          descricaoElement.textContent = "Aniversário de fundação de Piedade em 20/05/1842";
          console.log("[Correção] Corrigida data de Piedade: " + descricaoElement.textContent);
        }
      }
    });
  }
  
  // Verifica se um texto está numa lista (comparação insensível a maiúsculas/minúsculas)
  function estaNaLista(texto, lista) {
    if (!texto) return false;
    
    texto = texto.toLowerCase();
    
    for (let i = 0; i < lista.length; i++) {
      const itemLista = lista[i].toLowerCase();
      
      // Verificar se um contém o outro (para casos como "São Paulo" e "São Paulo, SP")
      if (texto.includes(itemLista) || itemLista.includes(texto)) {
        return true;
      }
    }
    
    return false;
  }
})();