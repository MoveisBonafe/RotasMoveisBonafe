/**
 * Correção específica para a cidade de Piedade - Móveis Bonafé
 * Este script:
 * 1. Corrige a data de aniversário de Piedade para 20/05
 * 2. Remove entradas duplicadas de Piedade
 * 3. Atualiza a descrição com a data correta (20/05/1842)
 */

(function() {
  // Executar quando o DOM estiver totalmente carregado
  document.addEventListener("DOMContentLoaded", corrigirPiedade);
  // Também executar quando a página já estiver carregada
  if (document.readyState === "complete") {
    corrigirPiedade();
  }
  
  function corrigirPiedade() {
    console.log("[CorrecaoPiedade] Iniciando correção para a cidade de Piedade...");
    
    // Dados corretos para Piedade
    const dadosCorretos = {
      dataExibicao: "20/05/2025",
      dataHistorica: "20/05/1842",
      descricao: "Aniversário de fundação de Piedade em 20/05/1842"
    };
    
    // Encontrar todos os eventos relacionados a Piedade
    const eventosPiedade = [];
    
    // Estratégia 1: Procurar nos elementos de evento
    document.querySelectorAll('.event-item, .city-event, .evento-item').forEach(function(item) {
      const conteudo = item.textContent || item.innerText;
      if (conteudo.includes("Piedade")) {
        eventosPiedade.push(item);
      }
    });
    
    console.log(`[CorrecaoPiedade] Encontrados ${eventosPiedade.length} eventos relacionados a Piedade`);
    
    // Manter apenas o primeiro evento e remover os demais (duplicados)
    if (eventosPiedade.length > 1) {
      // Manter o primeiro e corrigir seus dados
      const principal = eventosPiedade[0];
      
      // Corrigir o principal
      const dataElement = principal.querySelector('.event-date, [class*="date"]');
      const descElement = principal.querySelector('.event-description, [class*="description"]');
      
      if (dataElement) {
        // Extrair o formato atual e manter "Piedade | DATA"
        let textoAtual = dataElement.textContent || dataElement.innerText;
        const partes = textoAtual.split('|');
        if (partes.length > 0) {
          const nomeCidade = partes[0].trim();
          dataElement.textContent = `${nomeCidade} | ${dadosCorretos.dataExibicao}`;
          console.log(`[CorrecaoPiedade] Data corrigida para: ${nomeCidade} | ${dadosCorretos.dataExibicao}`);
        } else {
          dataElement.textContent = `Piedade | ${dadosCorretos.dataExibicao}`;
        }
      }
      
      if (descElement) {
        descElement.textContent = dadosCorretos.descricao;
        console.log(`[CorrecaoPiedade] Descrição corrigida para: ${dadosCorretos.descricao}`);
      }
      
      // Remover os demais (duplicados)
      for (let i = 1; i < eventosPiedade.length; i++) {
        try {
          eventosPiedade[i].style.display = 'none';
          console.log(`[CorrecaoPiedade] Ocultado evento duplicado #${i}`);
        } catch (e) {
          console.error(`[CorrecaoPiedade] Erro ao ocultar evento duplicado:`, e);
        }
      }
    } else if (eventosPiedade.length === 1) {
      // Apenas um evento encontrado, corrigir seus dados
      const evento = eventosPiedade[0];
      const dataElement = evento.querySelector('.event-date, [class*="date"]');
      const descElement = evento.querySelector('.event-description, [class*="description"]');
      
      if (dataElement) {
        // Manter formato "Piedade | DATA"
        dataElement.textContent = `Piedade | ${dadosCorretos.dataExibicao}`;
        console.log(`[CorrecaoPiedade] Data corrigida para: Piedade | ${dadosCorretos.dataExibicao}`);
      }
      
      if (descElement) {
        descElement.textContent = dadosCorretos.descricao;
        console.log(`[CorrecaoPiedade] Descrição corrigida para: ${dadosCorretos.descricao}`);
      }
    } else {
      console.log("[CorrecaoPiedade] Nenhum evento de Piedade encontrado para corrigir");
    }
    
    // Estratégia 2: Procurar diretamente por textos que precisam ser corrigidos
    document.querySelectorAll('*').forEach(function(element) {
      if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
        const texto = element.textContent;
        
        // Corrigir datas no formato "Piedade | DATA"
        if (texto.includes("Piedade") && texto.includes("|") && 
            (texto.includes("18/03/2025") || texto.includes("19/05/2025"))) {
          const partes = texto.split('|');
          if (partes.length > 0) {
            const nomeCidade = partes[0].trim();
            element.textContent = `${nomeCidade} | ${dadosCorretos.dataExibicao}`;
            console.log(`[CorrecaoPiedade] Texto corrigido: ${texto} -> ${element.textContent}`);
          }
        }
        
        // Corrigir descrições incorretas
        if (texto.includes("Piedade") && texto.includes("fundação") && 
            (texto.includes("19/03/1842") || texto.includes("19/05"))) {
          element.textContent = dadosCorretos.descricao;
          console.log(`[CorrecaoPiedade] Descrição corrigida: ${texto} -> ${dadosCorretos.descricao}`);
        }
      }
    });
  }
  
  // Executar também após alguns segundos e quando houver interação com a página
  setTimeout(corrigirPiedade, 1000);
  setTimeout(corrigirPiedade, 3000);
  
  // Executar quando o usuário interage com a página
  document.addEventListener('click', function() {
    setTimeout(corrigirPiedade, 300);
  });
})();