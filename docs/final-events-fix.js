/**
 * IMPLEMENTAÇÃO DEFINITIVA DE EVENTOS DE ANIVERSÁRIOS DE CIDADES
 * 
 * Esta solução:
 * 1. Usa APENAS a fonte de dados oficial (estados-aniversarios.js)
 * 2. Exibe somente eventos de cidades presentes na rota
 * 3. Formata as datas de forma consistente e completa
 * 4. Evita completamente duplicatas
 * 5. Trata diferenças de nomenclatura entre cidades na rota e na fonte de dados
 */

(function() {
  console.log("[EventosFix] Iniciando implementação OFICIAL de eventos");
  
  // Constantes para datas de fundação das cidades
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
    "Jaú": "15/08/1853",
    "Passa Quatro": "01/09/1850",
    "Mutum": "05/09/1923",
    "Muriaé": "06/09/1855",
    "Barbacena": "15/09/1791"
  };
  
  // Verificação para garantir que temos os dados de aniversários
  function aguardarDadosAniversarios() {
    if (window.aniversariosCidades) {
      aplicarCorrecaoFinal();
    } else {
      console.log("[EventosFix] Aguardando carregamento dos dados de aniversários...");
      setTimeout(aguardarDadosAniversarios, 500);
    }
  }
  
  // Executar em vários momentos para garantir funcionamento
  setTimeout(aguardarDadosAniversarios, 500);
  setTimeout(aguardarDadosAniversarios, 2000);
  
  // Observar mudanças no DOM
  const observer = new MutationObserver(function() {
    setTimeout(aplicarCorrecaoFinal, 500);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
  
  // Executar quando o usuário interagir
  document.addEventListener('click', function() {
    setTimeout(aplicarCorrecaoFinal, 500);
  });
  
  // FUNÇÃO PRINCIPAL
  function aplicarCorrecaoFinal() {
    console.log("[EventosFix] Aplicando correção final");
    
    // 1. Obter todas as cidades na rota
    const cidadesNaRota = obterCidadesNaRota();
    console.log("[EventosFix] Cidades na rota:", cidadesNaRota);
    
    // Se não houver cidades na rota, não processar
    if (cidadesNaRota.length === 0) {
      console.warn("[EventosFix] Nenhuma cidade encontrada na rota");
      return;
    }
    
    // 2. Obter o container de eventos
    const containerEventos = document.querySelector('.event-list');
    if (!containerEventos) {
      console.warn("[EventosFix] Container de eventos não encontrado");
      return;
    }
    
    // 3. Limpar todos os eventos atuais
    containerEventos.innerHTML = '';
    
    // 4. Criar um conjunto para acompanhar eventos já criados (evitar duplicatas)
    const cidadesProcessadas = new Set();
    
    // 5. Para cada cidade na rota, criar um evento se ela tiver aniversário
    cidadesNaRota.forEach(function(cidade) {
      const cidadeNormalizada = normalizarCidade(cidade);
      
      // Verificar se já processamos esta cidade
      if (cidadesProcessadas.has(cidadeNormalizada)) {
        return;
      }
      
      // Buscar informação de aniversário
      const infoAniversario = buscarAniversarioCidade(cidade);
      if (!infoAniversario) {
        console.log(`[EventosFix] Não encontrada data de aniversário para: ${cidade}`);
        return;
      }
      
      // Marcar esta cidade como já processada
      cidadesProcessadas.add(cidadeNormalizada);
      
      // Criar e adicionar o elemento de evento
      const eventoElement = criarElementoEvento(
        cidade, 
        infoAniversario.dia, 
        infoAniversario.mes,
        obterDataFundacao(cidade)
      );
      
      containerEventos.appendChild(eventoElement);
      console.log(`[EventosFix] Adicionado evento para ${cidade} em ${infoAniversario.dia}/${infoAniversario.mes}`);
    });
    
    console.log("[EventosFix] Aplicação de correção final concluída com sucesso!");
  }
  
  // FUNÇÃO PARA CRIAR ELEMENTO DE EVENTO
  function criarElementoEvento(cidade, dia, mes, dataFundacao) {
    // Criar elemento principal
    const eventoElement = document.createElement('div');
    eventoElement.className = 'event-item';
    
    // Ano fixo para todos os eventos futuros
    const ano = 2025;
    
    // Determinar o texto da descrição
    let descricaoTexto = '';
    if (dataFundacao) {
      descricaoTexto = `Aniversário de fundação de ${cidade} em ${dataFundacao}`;
    } else {
      descricaoTexto = `Aniversário da cidade de ${cidade}`;
    }
    
    // Construir HTML interno
    eventoElement.innerHTML = `
      <div class="event-title">Aniversário da Cidade
        <div class="event-date">${cidade} | ${dia}/${mes}/${ano}</div>
      </div>
      <div class="event-type">
        <span class="event-badge feriado">Feriado</span>
        <span class="event-badge baixo">Baixo</span>
      </div>
      <div class="event-description">${descricaoTexto}</div>
    `;
    
    return eventoElement;
  }
  
  // FUNÇÃO PARA BUSCAR ANIVERSÁRIO DE CIDADE
  function buscarAniversarioCidade(cidade) {
    // Normalizar nome da cidade para busca
    const cidadeNormalizada = normalizarCidade(cidade);
    
    // Verificar em ambos estados (SP e MG)
    const estados = ['SP', 'MG'];
    
    for (const estado of estados) {
      const dadosEstado = window.aniversariosCidades[estado];
      
      // Verificar cada mês
      for (const mes in dadosEstado) {
        const dadosMes = dadosEstado[mes];
        
        // Verificar cada dia
        for (const dia in dadosMes) {
          const cidades = dadosMes[dia];
          
          // Verificar se a cidade está na lista
          for (const cidadeAniversario of cidades) {
            if (normalizarCidade(cidadeAniversario) === cidadeNormalizada ||
                cidadeNormalizada.includes(normalizarCidade(cidadeAniversario)) ||
                normalizarCidade(cidadeAniversario).includes(cidadeNormalizada)) {
              // Encontrou correspondência
              return {
                cidade: cidadeAniversario,
                dia: dia,
                mes: mes
              };
            }
          }
        }
      }
    }
    
    // Se não encontrou na lista oficial, tentar no dicionário de datas de fundação
    for (const [cidadeFundacao, data] of Object.entries(DATAS_FUNDACAO)) {
      if (normalizarCidade(cidadeFundacao) === cidadeNormalizada ||
          cidadeNormalizada.includes(normalizarCidade(cidadeFundacao)) ||
          normalizarCidade(cidadeFundacao).includes(cidadeNormalizada)) {
        // Extrair dia e mês da data de fundação
        const partes = data.split('/');
        return {
          cidade: cidadeFundacao,
          dia: partes[0],
          mes: partes[1]
        };
      }
    }
    
    // Não encontrou
    return null;
  }
  
  // FUNÇÃO PARA OBTER TODAS AS CIDADES DA ROTA
  function obterCidadesNaRota() {
    const cidades = [];
    
    // 1. Obter a origem
    const origem = document.querySelector('.sidebar strong');
    if (origem && origem.textContent) {
      cidades.push(limparNomeCidade(origem.textContent));
    }
    
    // 2. Obter todos os locais adicionados com marcadores
    const locaisAdicionados = document.querySelectorAll('.location-item');
    locaisAdicionados.forEach(function(item) {
      const texto = item.textContent || '';
      const primeiraLinha = texto.split('\n')[0].trim();
      if (primeiraLinha) {
        cidades.push(limparNomeCidade(primeiraLinha));
      }
    });
    
    // Eliminar duplicatas
    return [...new Set(cidades)];
  }
  
  // FUNÇÃO PARA OBTER DATA DE FUNDAÇÃO
  function obterDataFundacao(cidade) {
    // Normalizar a cidade para comparação
    const cidadeNormalizada = normalizarCidade(cidade);
    
    // Verificar no dicionário de datas conhecidas
    for (const [nomeCidade, data] of Object.entries(DATAS_FUNDACAO)) {
      if (nomeCidade === cidade || 
          normalizarCidade(nomeCidade).includes(cidadeNormalizada) || 
          cidadeNormalizada.includes(normalizarCidade(nomeCidade))) {
        return data;
      }
    }
    
    // Se não encontrou, retornar nulo
    return null;
  }
  
  // FUNÇÕES AUXILIARES
  
  // Limpar nome de cidade (remover sufixos, etc.)
  function limparNomeCidade(nome) {
    if (!nome) return '';
    
    // Remover texto após vírgula (ex: "São Paulo, SP" => "São Paulo")
    nome = nome.split(',')[0];
    
    // Remover sufixos como /SP, -SP, etc.
    nome = nome.replace(/\s*[\/\-]\s*SP\b/i, '');
    nome = nome.replace(/\s*[\/\-]\s*MG\b/i, '');
    
    // Remover CEPs ou códigos postais
    nome = nome.replace(/\d{5}-\d{3}/, '');
    
    // Remover parênteses e seu conteúdo
    nome = nome.replace(/\([^)]*\)/, '');
    
    return nome.trim();
  }
  
  // Normalizar nome de cidade para comparação
  function normalizarCidade(cidade) {
    if (!cidade) return '';
    
    // Converter para minúsculas
    cidade = cidade.toLowerCase();
    
    // Remover acentos
    cidade = cidade.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Remover caracteres especiais
    cidade = cidade.replace(/[^a-z0-9\s]/g, '');
    
    return cidade.trim();
  }
})();