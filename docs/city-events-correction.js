/**
 * Correção para os dados de aniversário das cidades
 * Este arquivo deve ser incluído após os dados originais
 */

// Correções a serem aplicadas quando a página carregar
window.addEventListener('load', function() {
  setTimeout(corrigirDadosCidades, 1000);
});

// Função principal para corrigir os dados
function corrigirDadosCidades() {
  console.log("[Correção] Iniciando correção dos dados de cidades...");
  
  // Verificar se o mockData existe
  if (!window.mockData || !window.mockData.cityEvents) {
    console.warn("[Correção] mockData não disponível, tentando novamente em 1s...");
    setTimeout(corrigirDadosCidades, 1000);
    return;
  }
  
  // Correção para Piedade: remover duplicações e corrigir data
  let eventosPiedade = [];
  
  // 1. Encontrar todos os eventos de Piedade
  window.mockData.cityEvents.forEach(function(evento, index) {
    if (evento.cityName === "Piedade" || 
        evento.cityName === "Piedade/SP" || 
        evento.cityName === "Piedade - SP") {
      eventosPiedade.push({ evento, index });
    }
  });
  
  console.log(`[Correção] Encontrados ${eventosPiedade.length} eventos para Piedade`);
  
  // 2. Se houver mais de um evento, manter apenas o primeiro e atualizar seus dados
  if (eventosPiedade.length > 0) {
    // Dados corretos para Piedade
    const dataCorreta = "2025-05-20"; // Formato ISO para o banco de dados
    const descricaoCorreta = "Aniversário de fundação de Piedade em 20/05/1842";
    
    // Atualizar o primeiro evento com os dados corretos
    const primeiroEvento = eventosPiedade[0].evento;
    primeiroEvento.startDate = dataCorreta;
    primeiroEvento.endDate = dataCorreta;
    primeiroEvento.description = descricaoCorreta;
    
    console.log("[Correção] Dados do evento de Piedade atualizados");
    
    // 3. Remover os eventos duplicados (em ordem reversa para não afetar os índices)
    const indicesParaRemover = eventosPiedade.slice(1).map(item => item.index).sort((a, b) => b - a);
    
    indicesParaRemover.forEach(function(indice) {
      window.mockData.cityEvents.splice(indice, 1);
      console.log(`[Correção] Removido evento duplicado de Piedade no índice ${indice}`);
    });
  }
  
  // Correção para Ribeirão Preto
  let eventosRibeiraoPreto = [];
  
  // 1. Encontrar todos os eventos de Ribeirão Preto
  window.mockData.cityEvents.forEach(function(evento, index) {
    if (evento.cityName === "Ribeirão Preto") {
      eventosRibeiraoPreto.push({ evento, index });
    }
  });
  
  // 2. Corrigir dados se encontrar
  if (eventosRibeiraoPreto.length > 0) {
    // Dados corretos
    const dataCorreta = "2025-06-19"; // Formato ISO
    const descricaoCorreta = "Aniversário de fundação de Ribeirão Preto em 19/06/1856";
    
    // Atualizar o primeiro evento
    const primeiroEvento = eventosRibeiraoPreto[0].evento;
    primeiroEvento.startDate = dataCorreta;
    primeiroEvento.endDate = dataCorreta;
    primeiroEvento.description = descricaoCorreta;
    
    console.log("[Correção] Dados do evento de Ribeirão Preto atualizados");
    
    // Remover duplicados se houver
    if (eventosRibeiraoPreto.length > 1) {
      const indicesParaRemover = eventosRibeiraoPreto.slice(1).map(item => item.index).sort((a, b) => b - a);
      
      indicesParaRemover.forEach(function(indice) {
        window.mockData.cityEvents.splice(indice, 1);
        console.log(`[Correção] Removido evento duplicado de Ribeirão Preto no índice ${indice}`);
      });
    }
  }
  
  console.log("[Correção] Correção dos dados concluída com sucesso!");
}