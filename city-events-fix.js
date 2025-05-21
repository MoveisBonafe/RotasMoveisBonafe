/**
 * Correção para datas de aniversário das cidades - Móveis Bonafé
 * Este arquivo corrige as datas incorretas e remove duplicações
 * Foco principal: Piedade (20/05) e Ribeirão Preto (19/06)
 */

// Executar quando a página estiver totalmente carregada
window.addEventListener('load', function() {
  console.log("[Correção] Iniciando correção de datas de cidades...");
  
  // Aguardar um momento para que os dados sejam carregados
  setTimeout(corrigirDatas, 500);
  setTimeout(corrigirDatas, 1500);
  setTimeout(corrigirDatas, 3000);
  
  // Adicionar correção para interações do usuário
  document.addEventListener('click', function() {
    setTimeout(corrigirDatas, 300);
  });
});

// Função principal de correção
function corrigirDatas() {
  console.log("[Correção] Verificando e corrigindo datas...");
  
  // Dados corretos para as cidades
  const dadosCorretos = {
    'Piedade': {
      data: '20/05/2025',
      descricao: 'Aniversário de fundação de Piedade em 20/05/1842'
    },
    'Ribeirão Preto': {
      data: '19/06/2025',
      descricao: 'Aniversário de fundação de Ribeirão Preto em 19/06/1856'
    }
  };
  
  // Corrigir dados em eventos
  const eventosItems = document.querySelectorAll('.event-item, .city-event, .evento-item');
  const cidadesProcessadas = new Set(); // Controlar cidades já processadas para evitar duplicações
  
  eventosItems.forEach(function(item) {
    // Verificar se é um evento relacionado às cidades que queremos corrigir
    const conteudo = item.textContent || item.innerText;
    let cidadeEncontrada = null;
    
    // Determinar qual cidade está neste item
    Object.keys(dadosCorretos).forEach(function(cidade) {
      if (conteudo.includes(cidade)) {
        cidadeEncontrada = cidade;
      }
    });
    
    if (!cidadeEncontrada) return; // Não é uma cidade que precisamos corrigir
    
    // Se já processamos esta cidade e não é o primeiro item, ocultar (remover duplicação)
    if (cidadesProcessadas.has(cidadeEncontrada)) {
      item.style.display = 'none';
      console.log(`[Correção] Removida duplicação de ${cidadeEncontrada}`);
      return;
    }
    
    // Marcar cidade como processada
    cidadesProcessadas.add(cidadeEncontrada);
    
    // Corrigir a data e descrição
    const dataElement = item.querySelector('.event-date, [class*="date"]');
    const descElement = item.querySelector('.event-description, [class*="description"]');
    
    if (dataElement) {
      const textoAtual = dataElement.textContent || dataElement.innerText;
      const partes = textoAtual.split('|');
      
      if (partes.length > 0) {
        const nomeCidade = partes[0].trim();
        dataElement.textContent = `${nomeCidade} | ${dadosCorretos[cidadeEncontrada].data}`;
        console.log(`[Correção] Data corrigida: ${cidadeEncontrada} - ${dadosCorretos[cidadeEncontrada].data}`);
      }
    }
    
    if (descElement) {
      descElement.textContent = dadosCorretos[cidadeEncontrada].descricao;
      console.log(`[Correção] Descrição corrigida: ${cidadeEncontrada}`);
    }
  });
  
  // Verificar se existe dados no modelo global (abordagem preventiva)
  if (window.mockData && window.mockData.cityEvents && Array.isArray(window.mockData.cityEvents)) {
    console.log("[Correção] Verificando modelo de dados global...");
    
    // Criar um mapa para rastrear eventos por cidade
    const eventosPorCidade = {};
    
    // Primeira passagem: corrigir os dados
    window.mockData.cityEvents.forEach(function(evento) {
      const cidade = evento.cityName;
      
      // Se é uma cidade que precisamos corrigir
      if (dadosCorretos[cidade]) {
        // Extrair data do formato ISO (2025-05-20) para dia/mês (20/05)
        const dataCorretaISO = dadosCorretos[cidade].data.split('/').reverse().join('-');
        const matches = dataCorretaISO.match(/(\d{4})-(\d{2})-(\d{2})/);
        
        if (matches) {
          const [_, ano, mes, dia] = matches;
          evento.startDate = `${ano}-${mes}-${dia}`;
          evento.endDate = `${ano}-${mes}-${dia}`;
          evento.description = dadosCorretos[cidade].descricao;
          
          // Rastrear este evento
          if (!eventosPorCidade[cidade]) {
            eventosPorCidade[cidade] = [];
          }
          eventosPorCidade[cidade].push(evento);
        }
      }
    });
    
    // Segunda passagem: remover duplicados, mantendo apenas o primeiro
    Object.keys(eventosPorCidade).forEach(function(cidade) {
      const eventos = eventosPorCidade[cidade];
      
      if (eventos.length > 1) {
        console.log(`[Correção] Encontrados ${eventos.length} eventos para ${cidade}, mantendo apenas o primeiro`);
        
        // Manter apenas o primeiro evento, marcar os outros para remoção
        for (let i = 1; i < eventos.length; i++) {
          eventos[i]._remover = true;
        }
      }
    });
    
    // Filtrar eventos marcados para remoção
    window.mockData.cityEvents = window.mockData.cityEvents.filter(function(evento) {
      return !evento._remover;
    });
  }
  
  console.log("[Correção] Correção de datas concluída!");
}