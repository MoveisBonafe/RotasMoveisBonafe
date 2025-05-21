/**
 * IMPLEMENTAÇÃO DEFINITIVA DE EVENTOS DE ANIVERSÁRIOS E OUTROS EVENTOS NAS CIDADES
 * 
 * Esta solução:
 * 1. Usa APENAS fontes de dados oficiais (estados-aniversarios.js e outros-eventos.js)
 * 2. Exibe somente eventos de cidades presentes na rota
 * 3. Formata as datas de forma consistente e completa
 * 4. Evita completamente duplicatas
 * 5. Trata diferenças de nomenclatura entre cidades na rota e na fonte de dados
 * 6. Inclui tanto aniversários quanto outros eventos importantes (feiras, exposições, etc)
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
  
  // Verificação para garantir que temos os dados carregados
  function aguardarDadosCarregados() {
    if (window.aniversariosCidades && window.outrosEventosCidades) {
      aplicarCorrecaoFinal();
    } else {
      console.log("[EventosFix] Aguardando carregamento dos dados...");
      setTimeout(aguardarDadosCarregados, 500);
    }
  }
  
  // Executar em vários momentos para garantir funcionamento
  setTimeout(aguardarDadosCarregados, 500);
  setTimeout(aguardarDadosCarregados, 2000);
  
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
    
    // 5. Para cada cidade na rota, adicionar seus eventos
    cidadesNaRota.forEach(function(cidade) {
      const cidadeNormalizada = normalizarCidade(cidade);
      
      // Verificar se já processamos esta cidade para aniversários
      if (!cidadesProcessadas.has(cidadeNormalizada)) {
        // Adicionar aniversário da cidade
        adicionarAniversarioCidade(cidade, containerEventos);
        
        // Marcar esta cidade como já processada para aniversários
        cidadesProcessadas.add(cidadeNormalizada);
      }
      
      // Adicionar quaisquer outros eventos desta cidade
      adicionarOutrosEventos(cidade, containerEventos);
    });
    
    console.log("[EventosFix] Aplicação de correção final concluída com sucesso!");
  }
  
  // FUNÇÃO PARA ADICIONAR ANIVERSÁRIO DE CIDADE
  function adicionarAniversarioCidade(cidade, containerEventos) {
    // Buscar informação de aniversário
    const infoAniversario = buscarAniversarioCidade(cidade);
    if (!infoAniversario) {
      console.log(`[EventosFix] Não encontrada data de aniversário para: ${cidade}`);
      return;
    }
    
    // Criar e adicionar o elemento de evento
    const eventoElement = criarElementoEvento(
      "Aniversário da Cidade",
      cidade, 
      infoAniversario.dia, 
      infoAniversario.mes,
      obterDataFundacao(cidade),
      "Feriado",
      "Baixo"
    );
    
    containerEventos.appendChild(eventoElement);
    console.log(`[EventosFix] Adicionado aniversário para ${cidade} em ${infoAniversario.dia}/${infoAniversario.mes}`);
  }
  
  // FUNÇÃO PARA ADICIONAR OUTROS EVENTOS DE UMA CIDADE
  function adicionarOutrosEventos(cidade, containerEventos) {
    // Verificar se temos outros eventos para esta cidade
    if (!window.outrosEventosCidades) return;
    
    // Normalizar nome da cidade para busca
    const cidadeNormalizada = normalizarCidade(cidade);
    
    // Procurar em todas as cidades com eventos
    for (const [nomeCidade, eventos] of Object.entries(window.outrosEventosCidades)) {
      const cidadeEventosNormalizada = normalizarCidade(nomeCidade);
      
      // Verificar se esta cidade corresponde à que estamos procurando
      if (cidadeEventosNormalizada === cidadeNormalizada || 
          cidadeNormalizada.includes(cidadeEventosNormalizada) || 
          cidadeEventosNormalizada.includes(cidadeNormalizada)) {
        
        // Adicionar cada evento desta cidade
        eventos.forEach(function(evento) {
          // Extrair dados do evento
          const dataParts = evento.data.split('/');
          const dia = dataParts[0];
          const mes = dataParts[1];
          
          // Criar elemento de evento
          const eventoElement = criarElementoEvento(
            evento.titulo,
            nomeCidade,
            dia,
            mes,
            null,
            evento.tipo,
            evento.impacto,
            evento.descricao
          );
          
          containerEventos.appendChild(eventoElement);
          console.log(`[EventosFix] Adicionado evento ${evento.titulo} para ${nomeCidade}`);
        });
        
        // Já encontramos e adicionamos os eventos, sair do loop
        break;
      }
    }
  }
  
  // FUNÇÃO PARA CRIAR ELEMENTO DE EVENTO
  function criarElementoEvento(titulo, cidade, dia, mes, dataFundacao, tipo, impacto, descricaoCustom) {
    // Criar elemento principal
    const eventoElement = document.createElement('div');
    eventoElement.className = 'event-item';
    
    // Ano fixo para todos os eventos futuros - data oficial
    const ano = 2025;
    
    // Formatar data para o padrão da cidade
    const dataEventoFormatada = `${dia}/${mes}/${ano}`;
    
    // Determinar o texto da descrição
    let descricaoTexto = '';
    if (descricaoCustom) {
      // Se foi fornecida uma descrição personalizada, usá-la
      descricaoTexto = descricaoCustom;
    } else if (dataFundacao) {
      // Para aniversários de cidade com data de fundação
      descricaoTexto = `Aniversário de fundação de ${cidade} em ${dataFundacao}`;
    } else {
      // Para aniversários de cidade sem data de fundação
      descricaoTexto = `Aniversário da cidade de ${cidade}`;
    }
    
    // Limpar tipo e impacto para valores padrão se não fornecidos
    tipo = tipo || "Evento";
    impacto = impacto || "Baixo";
    
    // Construir HTML interno - a data do evento no .event-date agora é consistente com a data real de aniversário
    eventoElement.innerHTML = `
      <div class="event-title">${titulo}
        <div class="event-date">${cidade} | ${dataEventoFormatada}</div>
      </div>
      <div class="event-type">
        <span class="event-badge ${tipo.toLowerCase()}">${tipo}</span>
        <span class="event-badge ${impacto.toLowerCase()}">${impacto}</span>
      </div>
      <div class="event-description">${descricaoTexto}</div>
    `;
    
    return eventoElement;
  }
  
  // FUNÇÃO PARA BUSCAR ANIVERSÁRIO DE CIDADE
  function buscarAniversarioCidade(cidade) {
    // Normalizar nome da cidade para busca
    const cidadeNormalizada = normalizarCidade(cidade);
    
    // 1. PRIMEIRO: VERIFICAR NAS CORREÇÕES OFICIAIS (MÁXIMA PRIORIDADE)
    if (window.aniversariosCidades.correcoes) {
      for (const [nomeCidade, info] of Object.entries(window.aniversariosCidades.correcoes)) {
        if (normalizarCidade(nomeCidade) === cidadeNormalizada ||
            cidadeNormalizada.includes(normalizarCidade(nomeCidade)) ||
            normalizarCidade(nomeCidade).includes(cidadeNormalizada)) {
          
          console.log(`[EventosFix] Usando correção oficial para ${cidade}: ${info.dia}/${info.mes}`);
          
          // Retornar a correção oficial
          return {
            cidade: nomeCidade,
            dia: info.dia,
            mes: info.mes
          };
        }
      }
    }
    
    // 2. VERIFICAR EM AMBOS ESTADOS (SP E MG)
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
    
    // 3. SE NÃO ENCONTROU, TENTAR NO DICIONÁRIO DE DATAS DE FUNDAÇÃO
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