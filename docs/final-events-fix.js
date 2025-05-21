/**
 * SOLUÇÃO FINAL PARA EVENTOS DA ROTA
 * 
 * - Oculta eventos de cidades que não estão na rota 
 * - Corrige datas de fundação para formato dd/mm/yyyy
 * - Prioriza datas conhecidas e específicas
 */

(function() {
  // Dados oficiais de fundação de cidades
  const DATAS_FUNDACAO = {
    "Piedade": "20/05/1842",
    "Ribeirão Preto": "19/06/1856",
    "Dois Córregos": "04/02/1883",
    "São Paulo": "25/01/1554",
    "Campinas": "14/07/1774",
    "Santos": "26/01/1546",
    "Buri": "20/12/1921",
    "Itapeva": "20/09/1769",
    "Cristina": "14/03/1841"
  };
  
  // Forçar execução completa em vários momentos
  console.log("[EventosFix] Iniciando solução definitiva para eventos da rota");
  
  // Executar agora
  setTimeout(aplicarSolucaoEventos, 500);
  setTimeout(aplicarSolucaoEventos, 1000);
  setTimeout(aplicarSolucaoEventos, 2000);
  
  // Executar quando houver mudanças no DOM
  const observer = new MutationObserver(function() {
    setTimeout(aplicarSolucaoEventos, 300);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Executar quando o usuário interagir com a página
  document.addEventListener('click', function() {
    setTimeout(aplicarSolucaoEventos, 300);
  });
  
  // Função principal de correção
  function aplicarSolucaoEventos() {
    // Obter APENAS AS CIDADES ADICIONADAS na rota
    const cidadesAdicionadas = obterCidadesExplicitamenteAdicionadas();
    console.log("[EventosFix] Cidades REALMENTE adicionadas: " + cidadesAdicionadas.join(', '));
    
    // Se não temos cidades na rota, não prosseguir
    if (cidadesAdicionadas.length === 0) {
      return;
    }
    
    // Obter todos os eventos
    const eventos = document.querySelectorAll('.event-item');
    console.log("[EventosFix] Processando " + eventos.length + " eventos");
    
    // Processar cada evento
    eventos.forEach(function(evento) {
      // Obter a cidade deste evento
      const cidadeEvento = obterCidadeDoEvento(evento);
      
      if (!cidadeEvento) {
        console.log("[EventosFix] Não foi possível determinar a cidade do evento");
        evento.style.display = 'none';
        return;
      }
      
      // Verificar se a cidade está nas adicionadas
      const cidadeNaRota = cidadesAdicionadas.some(function(cidadeAdicionada) {
        return cidadesSaoCorrespondentes(cidadeEvento, cidadeAdicionada);
      });
      
      // Mostrar ou ocultar com base na presença na rota
      if (cidadeNaRota) {
        evento.style.display = 'block';
        console.log("[EventosFix] Exibindo evento da cidade: " + cidadeEvento);
        
        // Corrigir a data de fundação com a versão completa
        corrigirDescricaoEvento(evento, cidadeEvento);
      } else {
        evento.style.display = 'none';
        console.log("[EventosFix] Ocultando evento da cidade fora da rota: " + cidadeEvento);
      }
    });
  }
  
  // Obtém apenas as cidades REALMENTE adicionadas na interface
  function obterCidadesExplicitamenteAdicionadas() {
    const cidadesAdicionadas = [];
    
    // 1. Adicionar a cidade de origem explicitamente selecionada
    const origem = document.querySelector('.sidebar strong');
    if (origem && origem.textContent) {
      // Limpar apenas para a cidade (sem SP, etc)
      cidadesAdicionadas.push(extrairNomeCidade(origem.textContent));
    }
    
    // 2. Adicionar locais com MARCADOR VERMELHO ou AZUL
    const locaisAdicionados = document.querySelectorAll('.location-item');
    locaisAdicionados.forEach(function(item) {
      // Pegar o nome do local (a primeira linha do texto)
      const texto = item.textContent || '';
      if (texto) {
        const linhas = texto.split('\n');
        if (linhas.length > 0) {
          const nomeCidade = extrairNomeCidade(linhas[0]);
          if (nomeCidade) {
            cidadesAdicionadas.push(nomeCidade);
          }
        }
      }
    });
    
    // 3. Verificar na lista de locais adicionados (na visão sidebar)
    const listaLocais = document.querySelectorAll('#locationList li');
    listaLocais.forEach(function(item) {
      const texto = item.textContent || '';
      if (texto) {
        // Pegar apenas o nome da cidade
        cidadesAdicionadas.push(extrairNomeCidade(texto));
      }
    });
    
    // 4. Verificar nos locais específicos que estão explicitamente marcados na interface
    const cidadesEspecificas = [
      ...Array.from(document.querySelectorAll('.location-name')).map(el => el.textContent),
      ...Array.from(document.querySelectorAll('.route-point')).map(el => el.textContent)
    ];
    
    cidadesEspecificas.forEach(texto => {
      if (texto) {
        cidadesAdicionadas.push(extrairNomeCidade(texto));
      }
    });
    
    // Remover duplicatas e valores vazios
    return [...new Set(cidadesAdicionadas.filter(cidade => cidade))];
  }
  
  // Extrai o nome da cidade de um texto, removendo sufixos e caracteres indesejados
  function extrairNomeCidade(texto) {
    if (!texto) return '';
    
    // Remover "- SP", "/SP", etc.
    texto = texto.replace(/[\s-]*\/?SP\b/, '');
    
    // Remover CEP e números
    texto = texto.replace(/\d{5}-\d{3}/, '');
    
    // Remover qualquer texto entre parênteses
    texto = texto.replace(/\([^)]*\)/, '');
    
    // Remover vírgulas e o que vem depois
    if (texto.includes(',')) {
      texto = texto.split(',')[0];
    }
    
    return texto.trim();
  }
  
  // Obtém a cidade associada a um evento
  function obterCidadeDoEvento(evento) {
    // Método 1: Via elemento de data (mais comum)
    const elementoData = evento.querySelector('.event-date');
    if (elementoData) {
      const texto = elementoData.textContent || '';
      // Formato: "Cidade | Data"
      const partes = texto.split('|');
      if (partes.length > 0) {
        return partes[0].trim();
      }
    }
    
    // Método 2: Via título do evento
    const titulo = evento.querySelector('.event-title');
    if (titulo) {
      const texto = titulo.textContent || '';
      // Se o título tem o formato "Aniversário da Cidade\nCidade | Data"
      const linhas = texto.split('\n');
      if (linhas.length > 1) {
        // Segunda linha geralmente tem "Cidade | Data"
        const partes = linhas[1].split('|');
        if (partes.length > 0) {
          return partes[0].trim();
        }
      }
    }
    
    // Método 3: Buscar em qualquer div dentro do evento
    const divs = evento.querySelectorAll('div');
    for (let i = 0; i < divs.length; i++) {
      const texto = divs[i].textContent || '';
      // Buscar padrão "Cidade | Data" ou "Cidade (Data)"
      if (texto.includes('|')) {
        const partes = texto.split('|');
        if (partes.length > 0) {
          return partes[0].trim();
        }
      } else if (texto.includes('(')) {
        const partes = texto.split('(');
        if (partes.length > 0) {
          return partes[0].trim();
        }
      }
    }
    
    return '';
  }
  
  // Verifica se duas cidades são correspondentes (considerando variações no nome)
  function cidadesSaoCorrespondentes(cidade1, cidade2) {
    if (!cidade1 || !cidade2) return false;
    
    // Normalizar para comparação
    cidade1 = normalizarNomeCidade(cidade1);
    cidade2 = normalizarNomeCidade(cidade2);
    
    // Verificar se uma contém a outra
    return cidade1.includes(cidade2) || cidade2.includes(cidade1);
  }
  
  // Normaliza o nome da cidade para comparação
  function normalizarNomeCidade(cidade) {
    if (!cidade) return '';
    
    // Converter para minúsculo
    cidade = cidade.toLowerCase();
    
    // Remover acentos
    cidade = cidade.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Remover hífen, underline e caracteres especiais
    cidade = cidade.replace(/[^\w\s]/g, '');
    
    // Remover palavras como "cidade de", "municipio de", etc.
    cidade = cidade.replace(/^(cidade|municipio|distrito)(\s+de)?\s+/i, '');
    
    return cidade.trim();
  }
  
  // Corrige a descrição do evento para incluir a data de fundação completa
  function corrigirDescricaoEvento(evento, cidadeEvento) {
    const descricaoElement = evento.querySelector('.event-description');
    if (!descricaoElement) return;
    
    const textoAtual = descricaoElement.textContent || '';
    
    // Se já tem uma data completa no formato "em DD/MM/YYYY", não alterar
    if (textoAtual.match(/em \d{2}\/\d{2}\/\d{4}/)) {
      return;
    }
    
    // Identificar cidade para busca no dicionário de datas
    const cidadeNormalizada = normalizarNomeCidade(cidadeEvento);
    let dataFundacao = '';
    
    // Buscar a data de fundação no dicionário
    for (const [cidade, data] of Object.entries(DATAS_FUNDACAO)) {
      if (normalizarNomeCidade(cidade).includes(cidadeNormalizada) || 
          cidadeNormalizada.includes(normalizarNomeCidade(cidade))) {
        dataFundacao = data;
        break;
      }
    }
    
    // Se encontrou uma data de fundação
    if (dataFundacao) {
      // Se a descrição atual não tem "em" ou tem "em 2025", substituir
      if (!textoAtual.includes(' em ') || textoAtual.includes(' em 2025')) {
        // Construir nova descrição com a data completa
        const novaDescricao = textoAtual.replace(/ em \d{4}/, '').replace(/\.$/, '') + ` em ${dataFundacao}`;
        descricaoElement.textContent = novaDescricao;
        console.log(`[EventosFix] Corrigida data para: ${novaDescricao}`);
      }
    }
    
    // Caso específico para Piedade (garantir que seja sempre 20/05/1842)
    if (cidadeNormalizada.includes('piedade')) {
      const novaDescricao = "Aniversário de fundação de Piedade em 20/05/1842";
      descricaoElement.textContent = novaDescricao;
      console.log(`[EventosFix] Corrigida data específica para Piedade: ${novaDescricao}`);
    }
  }
})();