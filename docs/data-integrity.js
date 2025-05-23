/**
 * Sistema de Integridade de Dados
 * 
 * Esta solução resolve problemas de dados duplicados e inconsistentes
 * para todas as cidades do sistema, mantendo apenas informações corretas.
 * Também garante que apenas eventos das cidades no percurso atual sejam exibidos.
 */

(function() {
  // Fonte de dados oficial - usada como referência para resolver conflitos
  const dadosOficiais = {
    // As datas oficialmente verificadas (formato: nome da cidade -> data correta)
    datas: {
      "Piedade": { data: "2025-05-20", dataFormatada: "20/05/2025", descricao: "Aniversário de fundação de Piedade em 20/05/1842" },
      "Ribeirão Preto": { data: "2025-06-19", dataFormatada: "19/06/2025", descricao: "Aniversário de fundação de Ribeirão Preto em 19/06/1856" },
      "São Paulo": { data: "2025-01-25", dataFormatada: "25/01/2025", descricao: "Aniversário de fundação de São Paulo em 25/01/1554" },
      "Belo Horizonte": { data: "2025-12-12", dataFormatada: "12/12/2025", descricao: "Aniversário de fundação de Belo Horizonte em 12/12" },
      "Campinas": { data: "2025-07-14", dataFormatada: "14/07/2025", descricao: "Aniversário de fundação de Campinas em 14/07/1774" },
      "Dois Córregos": { data: "2025-02-04", dataFormatada: "04/02/2025", descricao: "Aniversário de fundação de Dois Córregos em 04/02/1883" }
    }
  };

  // Função principal para garantir integridade dos dados
  function garantirIntegridadeDados() {
    console.log("[DataIntegrity] Iniciando verificação de integridade dos dados...");
    
    // Verificar todas as estruturas conhecidas que podem conter dados de cidades
    verificarDadosMockData();
    verificarDadosAllCityEvents();
    verificarDadosCityEvents();
    
    // Também corrigir elementos visuais
    corrigirElementosVisuais();
    
    // Garantir que apenas eventos de cidades no percurso atual sejam exibidos
    filtrarEventosPorPercurso();
    
    console.log("[DataIntegrity] Verificação de integridade concluída");
  }
  
  // Função para garantir que apenas eventos de cidades no percurso atual sejam exibidos
  function filtrarEventosPorPercurso() {
    console.log("[DataIntegrity] Filtrando eventos por percurso...");
    
    // Tentar encontrar o contêiner de eventos
    const eventosContainer = document.querySelector('.event-list');
    if (!eventosContainer) {
      console.log("[DataIntegrity] Container de eventos não encontrado");
      return;
    }
    
    // Encontrar todas as cidades no percurso atual
    const cidadesNoPercurso = obterCidadesNoPercurso();
    console.log("[DataIntegrity] Cidades no percurso atual: ", cidadesNoPercurso);
    
    // Encontrar todos os eventos exibidos
    const eventosExibidos = eventosContainer.querySelectorAll('.event-item');
    console.log("[DataIntegrity] Total de eventos exibidos: " + eventosExibidos.length);
    
    // Verificar cada evento
    eventosExibidos.forEach(eventoElement => {
      const textoEvento = eventoElement.textContent || '';
      let cidadeEvento = "";
      
      // Tentar extrair o nome da cidade do evento
      const elementoCidade = eventoElement.querySelector('.event-date');
      if (elementoCidade) {
        const textoCidade = elementoCidade.textContent || '';
        // Extrair a cidade (geralmente está antes do '|')
        const match = textoCidade.match(/^([^|]+)\s*\|/);
        if (match) {
          cidadeEvento = match[1].trim();
        }
      }
      
      // Se não conseguiu extrair pelo formato padrão, tenta outros elementos
      if (!cidadeEvento) {
        // Tentar extrair da descrição ou título
        const tituloElement = eventoElement.querySelector('.event-title');
        if (tituloElement) {
          const textoTitulo = tituloElement.textContent || '';
          // Procurar por padrões como "Aniversário de [Cidade]"
          const matchTitulo = textoTitulo.match(/Anivers[áa]rio\s+d[aeo]\s+(.+)/i);
          if (matchTitulo) {
            cidadeEvento = matchTitulo[1].trim();
          }
        }
      }
      
      // Normalizar o nome da cidade
      cidadeEvento = normalizarNomeCidade(cidadeEvento);
      
      // Verificar se a cidade está no percurso
      const estaNaRota = cidadesNoPercurso.some(cidade => 
        normalizarNomeCidade(cidade) === cidadeEvento
      );
      
      // Atualizar a visibilidade do evento
      if (estaNaRota) {
        eventoElement.style.display = '';
        console.log(`[DataIntegrity] Mostrando evento para ${cidadeEvento} (está no percurso)`);
      } else {
        eventoElement.style.display = 'none';
        console.log(`[DataIntegrity] Ocultando evento para ${cidadeEvento} (não está no percurso)`);
      }
    });
  }
  
  // Função para obter as cidades no percurso atual
  function obterCidadesNoPercurso() {
    const cidadesNoPercurso = [];
    
    // Verificar título do percurso para extrair origem e destino
    const percursoElement = document.querySelector('.restrictions-list div[style*="background-color: rgb(255, 193, 7)"] span');
    if (percursoElement) {
      const textoPecurso = percursoElement.textContent || '';
      const cidadesPecurso = textoPecurso.split('→').map(c => c.trim());
      cidadesNoPercurso.push(...cidadesPecurso);
    }
    
    // Verificar cidades listadas como parte do percurso
    document.querySelectorAll('.city-in-route').forEach(element => {
      const textoCidade = element.previousElementSibling?.previousElementSibling?.querySelector('span')?.textContent;
      if (textoCidade) {
        cidadesNoPercurso.push(textoCidade.trim());
      }
    });
    
    // Se não encontrou nenhuma cidade pelo método acima, tentar outra abordagem
    if (cidadesNoPercurso.length === 0) {
      // Tentar obter cidades de marcadores no mapa ou lista de locais
      const pontosElement = document.querySelector('#locationList');
      if (pontosElement) {
        const textoPontos = pontosElement.textContent || '';
        // Extrair nomes de cidades de forma genérica
        const cidadesMatches = textoPontos.match(/([A-ZÀ-Ú][a-zà-ú]+(\s+[A-ZÀ-Ú][a-zà-ú]+)*)/g);
        if (cidadesMatches) {
          cidadesNoPercurso.push(...cidadesMatches);
        }
      }
    }
    
    // Remover duplicatas
    return [...new Set(cidadesNoPercurso)];
  }
  
  // Verifica e corrige inconsistências na estrutura window.mockData
  function verificarDadosMockData() {
    if (!window.mockData || !window.mockData.cityEvents) {
      console.log("[DataIntegrity] mockData não encontrado ou vazio");
      return;
    }
    
    console.log("[DataIntegrity] Verificando mockData.cityEvents com " + window.mockData.cityEvents.length + " eventos");
    
    // Remover duplicatas e corrigir dados
    const eventosUnicos = {};
    const eventosCorrigidos = [];
    
    window.mockData.cityEvents.forEach(function(evento) {
      const cidadeNormalizada = normalizarNomeCidade(evento.cityName || evento.city);
      
      // Se esta cidade já foi processada, ignoramos (removendo duplicatas)
      if (cidadeNormalizada && eventosUnicos[cidadeNormalizada]) {
        console.log(`[DataIntegrity] Ignorando evento duplicado para ${cidadeNormalizada}`);
        return;
      }
      
      // Corrigir dados se for uma cidade com dados oficiais
      if (cidadeNormalizada && dadosOficiais.datas[cidadeNormalizada]) {
        const dadoOficial = dadosOficiais.datas[cidadeNormalizada];
        
        evento.startDate = dadoOficial.data;
        evento.endDate = dadoOficial.data;
        if (evento.date) evento.date = dadoOficial.data;
        if (evento.eventDate) evento.eventDate = dadoOficial.dataFormatada;
        if (evento.displayDate) evento.displayDate = dadoOficial.dataFormatada;
        if (evento.description) evento.description = dadoOficial.descricao;
        
        console.log(`[DataIntegrity] Corrigido evento para ${cidadeNormalizada} com data ${dadoOficial.dataFormatada}`);
      }
      
      // Marcar esta cidade como processada
      eventosUnicos[cidadeNormalizada] = true;
      eventosCorrigidos.push(evento);
    });
    
    // Substituir a lista completa com a lista corrigida
    window.mockData.cityEvents = eventosCorrigidos;
    console.log(`[DataIntegrity] mockData atualizado com ${eventosCorrigidos.length} eventos únicos`);
  }
  
  // Verifica e corrige inconsistências na estrutura window.allCityEvents
  function verificarDadosAllCityEvents() {
    if (!window.allCityEvents || !Array.isArray(window.allCityEvents)) {
      console.log("[DataIntegrity] allCityEvents não encontrado ou não é um array");
      return;
    }
    
    console.log("[DataIntegrity] Verificando allCityEvents com " + window.allCityEvents.length + " eventos");
    
    // Remover duplicatas e corrigir dados
    const eventosUnicos = {};
    const eventosCorrigidos = [];
    
    window.allCityEvents.forEach(function(evento) {
      const cidadeNormalizada = normalizarNomeCidade(evento.city || evento.cityName);
      
      // Se esta cidade já foi processada, ignoramos (removendo duplicatas)
      if (cidadeNormalizada && eventosUnicos[cidadeNormalizada]) {
        console.log(`[DataIntegrity] Ignorando evento duplicado para ${cidadeNormalizada} em allCityEvents`);
        return;
      }
      
      // Corrigir dados se for uma cidade com dados oficiais
      if (cidadeNormalizada && dadosOficiais.datas[cidadeNormalizada]) {
        const dadoOficial = dadosOficiais.datas[cidadeNormalizada];
        
        // Formatos de data podem variar dependendo da estrutura usada
        evento.startDate = dadoOficial.dataFormatada;
        evento.endDate = dadoOficial.dataFormatada;
        evento.description = dadoOficial.descricao;
        
        console.log(`[DataIntegrity] Corrigido evento em allCityEvents para ${cidadeNormalizada}`);
      }
      
      // Marcar esta cidade como processada
      eventosUnicos[cidadeNormalizada] = true;
      eventosCorrigidos.push(evento);
    });
    
    // Substituir a lista completa com a lista corrigida
    window.allCityEvents = eventosCorrigidos;
    console.log(`[DataIntegrity] allCityEvents atualizado com ${eventosCorrigidos.length} eventos únicos`);
  }
  
  // Verifica e corrige inconsistências na estrutura window.cityEvents
  function verificarDadosCityEvents() {
    if (!window.cityEvents || !Array.isArray(window.cityEvents)) {
      console.log("[DataIntegrity] cityEvents não encontrado ou não é um array");
      return;
    }
    
    console.log("[DataIntegrity] Verificando cityEvents com " + window.cityEvents.length + " eventos");
    
    // Remover duplicatas e corrigir dados
    const eventosUnicos = {};
    const eventosCorrigidos = [];
    
    window.cityEvents.forEach(function(evento) {
      const cidadeNormalizada = normalizarNomeCidade(evento.cityName || evento.city);
      
      // Se esta cidade já foi processada, ignoramos (removendo duplicatas)
      if (cidadeNormalizada && eventosUnicos[cidadeNormalizada]) {
        console.log(`[DataIntegrity] Ignorando evento duplicado para ${cidadeNormalizada} em cityEvents`);
        return;
      }
      
      // Corrigir dados se for uma cidade com dados oficiais
      if (cidadeNormalizada && dadosOficiais.datas[cidadeNormalizada]) {
        const dadoOficial = dadosOficiais.datas[cidadeNormalizada];
        
        if (evento.startDate) evento.startDate = dadoOficial.data;
        if (evento.endDate) evento.endDate = dadoOficial.data;
        if (evento.description) evento.description = dadoOficial.descricao;
        
        console.log(`[DataIntegrity] Corrigido evento em cityEvents para ${cidadeNormalizada}`);
      }
      
      // Marcar esta cidade como processada
      eventosUnicos[cidadeNormalizada] = true;
      eventosCorrigidos.push(evento);
    });
    
    // Substituir a lista completa com a lista corrigida
    window.cityEvents = eventosCorrigidos;
    console.log(`[DataIntegrity] cityEvents atualizado com ${eventosCorrigidos.length} eventos únicos`);
  }
  
  // Corrige elementos visuais no DOM (independente da fonte de dados)
  function corrigirElementosVisuais() {
    console.log("[DataIntegrity] Corrigindo elementos visuais...");
    
    // Corrigir datas exibidas na interface
    document.querySelectorAll('.event-date, .event-title, .event-description').forEach(elemento => {
      const texto = elemento.textContent || elemento.innerText;
      if (!texto) return;
      
      // Verificar se o texto contém alguma cidade que precisamos corrigir
      Object.keys(dadosOficiais.datas).forEach(cidade => {
        if (texto.includes(cidade)) {
          const dadoOficial = dadosOficiais.datas[cidade];
          const partes = texto.split('|');
          
          // Se for um elemento que contém o formato "Cidade | Data"
          if (partes.length === 2) {
            const cidadeTexto = partes[0].trim();
            elemento.textContent = `${cidadeTexto} | ${dadoOficial.dataFormatada}`;
            console.log(`[DataIntegrity] Corrigido elemento visual para ${cidade}`);
          }
          
          // Se for um elemento com descrição completa
          if (texto.includes('Aniversário de fundação')) {
            elemento.textContent = dadoOficial.descricao;
            console.log(`[DataIntegrity] Corrigida descrição visual para ${cidade}`);
          }
        }
      });
    });
  }
  
  // Função auxiliar para normalizar nomes de cidades (remover sufixos como /SP, - SP)
  function normalizarNomeCidade(cidade) {
    if (!cidade) return "";
    
    // Remover sufixos como /SP, - SP, etc.
    cidade = cidade.replace(/\s*[\/\-]\s*SP$/, "").trim();
    
    return cidade;
  }
  
  // Executa a verificação de integridade quando o documento estiver totalmente carregado
  window.addEventListener('load', function() {
    setTimeout(garantirIntegridadeDados, 500);
    setTimeout(garantirIntegridadeDados, 2000);
    
    // MutationObserver para detectar mudanças no DOM e corrigir novos elementos
    const observer = new MutationObserver(function(mutations) {
      const precisaCorrigir = mutations.some(mutation => 
        mutation.addedNodes.length > 0 || 
        (mutation.target && (
          mutation.target.classList.contains('event-date') || 
          mutation.target.classList.contains('event-description')
        ))
      );
      
      if (precisaCorrigir) {
        setTimeout(corrigirElementosVisuais, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // Também corrigir quando o usuário interage com a página
    document.addEventListener('click', function() {
      setTimeout(corrigirElementosVisuais, 200);
    });
  });
  
  // Também executar quando o script é carregado inicialmente
  if (document.readyState !== 'loading') {
    setTimeout(garantirIntegridadeDados, 300);
  }
  
  console.log("[DataIntegrity] Sistema de integridade de dados inicializado");
})();