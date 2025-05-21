/**
 * CORREÇÃO UNIFICADA PARA EVENTOS DE CIDADES
 * 
 * Estratégia:
 * 1. Substitui COMPLETAMENTE todas as fontes de dados de eventos
 * 2. Cria uma nova fonte de dados limpa e corrigida
 * 3. Substitui todos os eventos exibidos na interface
 * 4. Garante que apenas eventos das cidades na rota sejam mostrados
 */

(function() {
  console.log("[EventosFix] Iniciando correção unificada");
  
  // CONSTANTES
  
  // Dados oficiais de fundação
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
    "Taquaritinga": "16/08/1868"
  };
  
  // EXECUTAR EM VÁRIOS MOMENTOS
  setTimeout(aplicarCorrecaoTotal, 500);
  setTimeout(aplicarCorrecaoTotal, 2000);
  setTimeout(aplicarCorrecaoTotal, 4000);
  
  // Também quando o DOM mudar
  const observer = new MutationObserver(function() {
    setTimeout(aplicarCorrecaoTotal, 500);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Também quando houver cliques 
  document.addEventListener('click', function() {
    setTimeout(aplicarCorrecaoTotal, 500);
  });
  
  // FUNÇÃO PRINCIPAL
  function aplicarCorrecaoTotal() {
    console.log("[EventosFix] Começando aplicação da correção total");
    
    // 1. Obter todos os locais adicionados à rota
    const cidadesNaRota = obterCidadesNaRota();
    console.log("[EventosFix] Cidades na rota: " + cidadesNaRota.join(", "));
    
    // Não prosseguir se não houver cidades
    if (cidadesNaRota.length === 0) {
      console.warn("[EventosFix] Nenhuma cidade identificada na rota");
      return;
    }
    
    // 2. Limpar completamente a exibição de eventos
    const containerEventos = document.querySelector('.event-list');
    if (!containerEventos) {
      console.warn("[EventosFix] Container de eventos não encontrado");
      return;
    }
    
    // Remover todos os eventos existentes
    containerEventos.innerHTML = '';
    
    // 3. Criar e adicionar apenas os eventos das cidades na rota
    cidadesNaRota.forEach(function(cidade) {
      // Verificar se temos dados para esta cidade
      const dataFundacao = obterDataFundacao(cidade);
      if (!dataFundacao) {
        console.log(`[EventosFix] Sem data de fundação para ${cidade}, pulando`);
        return;
      }
      
      // Criar o elemento HTML para o evento
      const eventoElement = criarElementoEvento(cidade, dataFundacao);
      
      // Adicionar ao container
      containerEventos.appendChild(eventoElement);
      console.log(`[EventosFix] Adicionado evento para ${cidade} com data ${dataFundacao}`);
    });
    
    console.log("[EventosFix] Correção total concluída com sucesso!");
  }
  
  // FUNÇÃO PARA OBTER TODAS AS CIDADES NA ROTA
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
  
  // FUNÇÃO PARA CRIAR O ELEMENTO HTML DO EVENTO
  function criarElementoEvento(cidade, dataFundacao) {
    // Criar o elemento principal do evento
    const eventoElement = document.createElement('div');
    eventoElement.className = 'event-item';
    
    // Data atual apenas para o ano (2025 é fixo para aniversários futuros)
    const dataAtual = new Date();
    const ano = 2025;
    
    // Extrair dia e mês da data de fundação
    const partesData = dataFundacao.split('/');
    const dia = partesData[0];
    const mes = partesData[1];
    
    // Criar a estrutura HTML do evento
    eventoElement.innerHTML = `
      <div class="event-title">Aniversário da Cidade
        <div class="event-date">${cidade} | ${dia}/${mes}/${ano}</div>
      </div>
      <div class="event-type">
        <span class="event-badge feriado">Feriado</span>
        <span class="event-badge baixo">Baixo</span>
      </div>
      <div class="event-description">Aniversário de fundação de ${cidade} em ${dataFundacao}</div>
    `;
    
    return eventoElement;
  }
  
  // FUNÇÃO PARA OBTER A DATA DE FUNDAÇÃO DE UMA CIDADE
  function obterDataFundacao(cidade) {
    // Normalizar a cidade para comparação
    const cidadeNormalizada = normalizarCidade(cidade);
    
    // Buscar nas datas conhecidas
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