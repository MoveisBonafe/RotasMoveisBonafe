/**
 * Correção direta para problema de dados em cidades
 * Este script modifica os dados diretamente na fonte
 */

(function() {
  console.log("[DirectFix] Iniciando correção direta para problema de dados em cidades...");
  
  // Função principal que será executada em múltiplos momentos
  function aplicarCorrecaoDireta() {
    console.log("[DirectFix] Tentando aplicar correção...");
    
    // Correção para dados no modelo de dados principal
    if (window.mockData && window.mockData.cityEvents) {
      console.log("[DirectFix] Encontrada estrutura mockData.cityEvents com " + window.mockData.cityEvents.length + " eventos");
      corrigirDadosArray(window.mockData.cityEvents);
    }
    
    // Correção para dados na estrutura allCityEvents
    if (window.allCityEvents) {
      console.log("[DirectFix] Encontrada estrutura allCityEvents com " + window.allCityEvents.length + " eventos");
      corrigirDadosArray(window.allCityEvents);
    }
    
    // Correção para dados no DOM (elementos visuais)
    corrigirElementosVisuais();
  }
  
  // Função para corrigir dados em arrays
  function corrigirDadosArray(arrayDados) {
    if (!Array.isArray(arrayDados)) return;
    
    // 1. Remover duplicatas de Piedade (manter apenas a primeira ocorrência)
    const cidadesVistas = new Set();
    const indicesParaRemover = [];
    
    arrayDados.forEach((evento, indice) => {
      // Normalizar o nome da cidade
      const cidade = normalizarNomeCidade(evento.city || evento.cityName);
      
      // Se for Piedade e já vimos antes, marcar para remoção
      if (cidade === "Piedade" && cidadesVistas.has("Piedade")) {
        indicesParaRemover.push(indice);
      }
      
      // Se for uma das cidades que queremos corrigir
      if (cidade === "Piedade" || cidade === "Ribeirão Preto") {
        cidadesVistas.add(cidade);
      }
    });
    
    // Remover do final para o início para não afetar índices
    for (let i = indicesParaRemover.length - 1; i >= 0; i--) {
      arrayDados.splice(indicesParaRemover[i], 1);
      console.log("[DirectFix] Removida duplicata de Piedade");
    }
    
    // 2. Corrigir dados das cidades que permaneceram
    arrayDados.forEach(evento => {
      const cidade = normalizarNomeCidade(evento.city || evento.cityName);
      
      if (cidade === "Piedade") {
        // Corrigir Piedade para 20/05/2025
        const dataCorretaISO = "2025-05-20"; // Formato ISO
        const dataCorretaBR = "20/05/2025";  // Formato BR
        
        // Atualizar todos os campos de data possíveis
        if (evento.startDate) evento.startDate = dataCorretaISO;
        if (evento.endDate) evento.endDate = dataCorretaISO;
        if (evento.date) evento.date = dataCorretaISO;
        if (evento.eventDate) evento.eventDate = dataCorretaBR;
        if (evento.displayDate) evento.displayDate = dataCorretaBR;
        
        // Atualizar descrição
        if (evento.description) {
          evento.description = "Aniversário de fundação de Piedade em 20/05/1842";
        }
        
        console.log("[DirectFix] Dados de Piedade corrigidos para 20/05/2025");
      }
      
      if (cidade === "Ribeirão Preto") {
        // Corrigir Ribeirão Preto para 19/06/2025
        const dataCorretaISO = "2025-06-19"; // Formato ISO
        const dataCorretaBR = "19/06/2025";  // Formato BR
        
        // Atualizar todos os campos de data possíveis
        if (evento.startDate) evento.startDate = dataCorretaISO;
        if (evento.endDate) evento.endDate = dataCorretaISO;
        if (evento.date) evento.date = dataCorretaISO;
        if (evento.eventDate) evento.eventDate = dataCorretaBR;
        if (evento.displayDate) evento.displayDate = dataCorretaBR;
        
        // Atualizar descrição
        if (evento.description) {
          evento.description = "Aniversário de fundação de Ribeirão Preto em 19/06/1856";
        }
        
        console.log("[DirectFix] Dados de Ribeirão Preto corrigidos para 19/06/2025");
      }
    });
  }
  
  // Função para corrigir elementos visuais no DOM
  function corrigirElementosVisuais() {
    // Corrigir elementos que mostram datas de cidades no DOM
    document.querySelectorAll('.event-date, .event-title, .event-description').forEach(elemento => {
      let textoOriginal = elemento.textContent || elemento.innerText;
      
      // Corrigir Piedade
      if (textoOriginal.includes("Piedade") && (textoOriginal.includes("19/05") || textoOriginal.includes("18/03"))) {
        // Substituir a data incorreta pela correta
        let textoCorrigido = textoOriginal.replace(/\d{2}\/\d{2}\/\d{4}/, "20/05/2025");
        textoCorrigido = textoCorrigido.replace(/em \d{2}\/\d{2}/, "em 20/05");
        
        elemento.textContent = textoCorrigido;
        console.log("[DirectFix] Texto corrigido no DOM: " + textoCorrigido);
      }
      
      // Corrigir Ribeirão Preto
      if (textoOriginal.includes("Ribeirão Preto") && !textoOriginal.includes("19/06")) {
        // Substituir a data incorreta pela correta
        let textoCorrigido = textoOriginal.replace(/\d{2}\/\d{2}\/\d{4}/, "19/06/2025");
        textoCorrigido = textoCorrigido.replace(/em \d{2}\/\d{2}/, "em 19/06");
        
        elemento.textContent = textoCorrigido;
        console.log("[DirectFix] Texto corrigido no DOM: " + textoCorrigido);
      }
    });
  }
  
  // Função auxiliar para normalizar nomes de cidades
  function normalizarNomeCidade(cidade) {
    if (!cidade) return "";
    
    // Remover sufixos como /SP, - SP, etc.
    cidade = cidade.replace(/\s*[\/\-]\s*SP$/, "").trim();
    
    return cidade;
  }
  
  // Aplicar correções em múltiplos momentos para garantir que funcione
  // independente de quando os dados são carregados
  
  // Executar imediatamente se o documento já estiver carregado
  if (document.readyState !== 'loading') {
    setTimeout(aplicarCorrecaoDireta, 500);
    setTimeout(aplicarCorrecaoDireta, 1500);
    setTimeout(aplicarCorrecaoDireta, 3000);
  }
  
  // Executar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(aplicarCorrecaoDireta, 500);
    setTimeout(aplicarCorrecaoDireta, 1500);
    setTimeout(aplicarCorrecaoDireta, 3000);
  });
  
  // Executar quando a página estiver totalmente carregada
  window.addEventListener('load', function() {
    setTimeout(aplicarCorrecaoDireta, 500);
    setTimeout(aplicarCorrecaoDireta, 1500);
    setTimeout(aplicarCorrecaoDireta, 3000);
    
    // Observar mudanças no DOM para corrigir elementos que possam ser adicionados dinamicamente
    const observer = new MutationObserver(function(mutations) {
      // Só aplicar correções se houver adições ao DOM
      const temAdicoes = mutations.some(mutation => mutation.addedNodes.length > 0);
      if (temAdicoes) {
        setTimeout(corrigirElementosVisuais, 100);
      }
    });
    
    // Observar todo o corpo do documento para mudanças
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  
  // Também executar quando o usuário interage com o mapa
  document.addEventListener('click', function() {
    setTimeout(corrigirElementosVisuais, 200);
  });
  
  console.log("[DirectFix] Script de correção instalado com sucesso!");
})();