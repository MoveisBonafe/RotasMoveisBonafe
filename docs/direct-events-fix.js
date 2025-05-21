/**
 * SOLUÇÃO DEFINITIVA PARA EVENTOS
 * 
 * Abordagem direta e simples:
 * 1. Captura apenas os elementos REAIS no percurso (da barra lateral)
 * 2. Esconde TODOS os eventos por padrão
 * 3. Mostra apenas eventos das cidades adicionadas
 * 4. Corrige as datas de fundação
 * 5. Remove eventos duplicados
 */

(function() {
  // INICIAR IMEDIATAMENTE
  console.log("[EventosFix] Iniciando correção DEFINITIVA para eventos");
  
  // Datas de fundação oficiais
  const DATAS_FUNDACAO = {
    "Piedade": "20/05/1842",
    "Ribeirão Preto": "19/06/1856",
    "Dois Córregos": "04/02/1883",
    "São Paulo": "25/01/1554",
    "Campinas": "14/07/1774",
    "Santos": "26/01/1546",
    "Buri": "20/12/1921",
    "Itapeva": "20/09/1769",
    "Cristina": "14/03/1841",
    "Bauru": "01/08/1896",
    "Jaú": "15/08/1853"
  };
  
  // Executar em vários momentos para garantir execução
  setTimeout(corrigirEventos, 500);
  setTimeout(corrigirEventos, 1500);
  setTimeout(corrigirEventos, 3000);
  
  // Também quando o DOM muda
  const observer = new MutationObserver(function() {
    setTimeout(corrigirEventos, 500);
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Também quando o usuário clica
  document.addEventListener('click', function() {
    setTimeout(corrigirEventos, 500);
  });
  
  // FUNÇÃO PRINCIPAL
  function corrigirEventos() {
    // 1. Capturar APENAS os locais realmente adicionados
    const locaisAdicionados = obterLocaisAdicionados();
    console.log("[EventosFix] Locais REALMENTE adicionados: " + locaisAdicionados.join(", "));
    
    // Se não tiver locais, não prosseguir
    if (locaisAdicionados.length === 0) {
      console.warn("[EventosFix] Nenhum local adicionado à rota, não há como filtrar eventos");
      return;
    }
    
    // 2. Esconder TODOS os eventos inicialmente
    const eventosContainer = document.querySelector('.event-list');
    if (!eventosContainer) {
      console.warn("[EventosFix] Container de eventos não encontrado");
      return;
    }
    
    const eventos = eventosContainer.querySelectorAll('.event-item');
    console.log("[EventosFix] Total de eventos encontrados: " + eventos.length);
    
    // Manter controle de cidades já exibidas para evitar duplicatas
    const cidadesJaExibidas = new Set();
    
    // 3. Verificar cada evento individualmente
    eventos.forEach(function(evento) {
      // Extrair cidade do evento
      const cidadeEvento = obterCidadeDoEvento(evento);
      if (!cidadeEvento) {
        evento.style.display = 'none';
        return;
      }
      
      // Normalizar para comparação
      const cidadeNormalizada = cidadeEvento.toLowerCase().trim();
      
      // Verificar se esta cidade está nos locais adicionados
      let cidadeEstaNoPercurso = false;
      for (const localAdicionado of locaisAdicionados) {
        const localNormalizado = localAdicionado.toLowerCase().trim();
        if (localNormalizado.includes(cidadeNormalizada) || 
            cidadeNormalizada.includes(localNormalizado)) {
          cidadeEstaNoPercurso = true;
          break;
        }
      }
      
      // Se a cidade NÃO está no percurso, esconder
      if (!cidadeEstaNoPercurso) {
        evento.style.display = 'none';
        return;
      }
      
      // Se está no percurso, verificar duplicação
      if (cidadesJaExibidas.has(cidadeNormalizada)) {
        // Esta cidade já foi exibida, esconder este evento duplicado
        evento.style.display = 'none';
        return;
      }
      
      // Marcar como já exibida e mostrar
      cidadesJaExibidas.add(cidadeNormalizada);
      evento.style.display = '';
      
      // Corrigir a data de fundação
      const descricaoElement = evento.querySelector('.event-description');
      if (descricaoElement) {
        const textoDescricao = descricaoElement.textContent || '';
        
        // Para cada cidade conhecida, verificar e corrigir
        for (const [cidade, dataFundacao] of Object.entries(DATAS_FUNDACAO)) {
          if (cidadeNormalizada.includes(cidade.toLowerCase()) ||
              normalizarCidade(cidade).includes(cidadeNormalizada)) {
            // Verificar se já tem a data completa
            if (!textoDescricao.match(/em \d{2}\/\d{2}\/\d{4}/)) {
              // Corrigir para a data completa
              const novaDescricao = `Aniversário de fundação de ${cidade} em ${dataFundacao}`;
              descricaoElement.textContent = novaDescricao;
              console.log(`[EventosFix] Corrigida data para: ${novaDescricao}`);
            }
            break;
          }
        }
      }
    });
    
    console.log("[EventosFix] Correção de eventos concluída com sucesso!");
  }
  
  // FUNÇÕES AUXILIARES
  
  // Obter apenas os locais adicionados explicitamente
  function obterLocaisAdicionados() {
    const locais = [];
    
    // 1. Obter a origem (da barra lateral)
    const origem = document.querySelector('.sidebar strong');
    if (origem && origem.textContent) {
      locais.push(limparNomeCidade(origem.textContent));
    }
    
    // 2. Obter locais da lista com marcadores
    const itensLocalizacao = document.querySelectorAll('.location-item');
    itensLocalizacao.forEach(function(item) {
      const texto = item.textContent || '';
      const primeiraLinha = texto.split('\n')[0].trim();
      if (primeiraLinha) {
        locais.push(limparNomeCidade(primeiraLinha));
      }
    });
    
    // Remover duplicatas
    return [...new Set(locais)];
  }
  
  // Obter cidade de um evento
  function obterCidadeDoEvento(evento) {
    // Tentar do elemento de data
    const elementoData = evento.querySelector('.event-date');
    if (elementoData) {
      const texto = elementoData.textContent || '';
      const partes = texto.split('|');
      if (partes.length > 0) {
        return partes[0].trim();
      }
    }
    
    return '';
  }
  
  // Limpar nome de cidade (remover vírgulas, sufixos, etc.)
  function limparNomeCidade(nome) {
    if (!nome) return '';
    
    // Remover tudo depois de vírgula
    const partes = nome.split(',');
    nome = partes[0];
    
    // Remover sufixos como /SP, -SP
    nome = nome.replace(/\s*[\/\-]\s*SP\b/i, '');
    
    // Remover CEPs ou códigos postais
    nome = nome.replace(/\d{5}-\d{3}/, '');
    
    // Remover parênteses e seu conteúdo
    nome = nome.replace(/\([^)]*\)/, '');
    
    return nome.trim();
  }
  
  // Normalizar nome de cidade para comparação
  function normalizarCidade(cidade) {
    if (!cidade) return '';
    
    // Para minúsculas
    cidade = cidade.toLowerCase();
    
    // Remover acentos
    cidade = cidade.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Remover caracteres especiais
    cidade = cidade.replace(/[^\w\s]/g, '');
    
    return cidade.trim();
  }
})();