/**
 * SOLUÇÃO DIRETA PARA GITHUB PAGES
 * 
 * Este script contém:
 * 1. Correção para datas de aniversário das cidades (Ribeirão Preto = 19/06)
 * 2. Estilização dos botões (mesmo estilo para botões de aba inferior)
 * 3. Filtro avançado para eventos (apenas cidades na rota)
 * 
 * Abordagem simplificada e otimizada para evitar problemas no GitHub Pages
 */

(function() {
  console.log("[DirectFix] Inicializando correção direta para GitHub Pages");
  
  // CONSTANTES E DADOS OFICIAIS
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
  
  // CORREÇÕES OFICIAIS ESPECÍFICAS
  const CORRECOES_DATAS = {
    "Ribeirão Preto": { dia: "19", mes: "06" }
  };
  
  // EXECUÇÃO PRINCIPAL
  setTimeout(inicializarCorrecoes, 500);
  setTimeout(inicializarCorrecoes, 1500);
  setTimeout(inicializarCorrecoes, 3000);
  
  // OBSERVER PARA MUDANÇAS NO DOM
  const observer = new MutationObserver(function() {
    setTimeout(inicializarCorrecoes, 300);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // FUNÇÃO PRINCIPAL
  function inicializarCorrecoes() {
    console.log("[DirectFix] Aplicando correções globais");
    
    // 1. Injetar estilos para botões
    injetarEstilosBotoes();
    
    // 2. Corrigir botões para estilo unificado
    estilizarBotoes();
    
    // 3. Corrigir exibição de eventos
    corrigirEventos();
    
    // 4. Remover botões desnecessários
    removerBotoesIndesejados();
  }
  
  // Remove botões desnecessários do mapa
  function removerBotoesIndesejados() {
    console.log("[DirectFix] Removendo botões desnecessários");
    
    // Função para verificar e remover elementos periodicamente
    function verificarERemover() {
      // Remover botão de tela cheia do mapa
      const fullscreenControls = document.querySelectorAll('.gm-fullscreen-control');
      fullscreenControls.forEach(control => {
        if (control && control.parentNode) {
          control.parentNode.removeChild(control);
        }
      });
      
      // Remover botão de desfazer último no mapa
      const undoButtons = document.querySelectorAll('button[title*="Desfazer"]');
      undoButtons.forEach(button => {
        if (button && button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
      
      // Remover botões com texto "Desfazer" no texto
      document.querySelectorAll('button').forEach(button => {
        if (button.textContent.includes('Desfazer') && button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
    }
    
    // Executar imediatamente
    verificarERemover();
    
    // Executar periodicamente para garantir que novos botões também sejam removidos
    setInterval(verificarERemover, 1000);
  }
  
  // CORREÇÃO DE EVENTOS
  function corrigirEventos() {
    console.log("[DirectFix] Corrigindo eventos");
    
    // Obter cidades na rota
    const cidadesRota = obterCidadesRota();
    console.log("[DirectFix] Cidades na rota:", cidadesRota);
    
    if (cidadesRota.length === 0) {
      console.warn("[DirectFix] Nenhuma cidade encontrada na rota");
      return;
    }
    
    // Container de eventos
    const container = document.querySelector('.event-list');
    if (!container) {
      console.warn("[DirectFix] Container de eventos não encontrado");
      return;
    }
    
    // Listar todos os eventos
    const eventosElements = container.querySelectorAll('.event-item');
    console.log("[DirectFix] Eventos encontrados:", eventosElements.length);
    
    // Conjuntos para acompanhar
    const cidadesJaExibidas = new Set();
    
    // Para cada evento
    eventosElements.forEach(evento => {
      // Extrair cidade do evento
      const cidadeEvento = obterCidadeEvento(evento);
      if (!cidadeEvento) {
        evento.style.display = 'none';
        return;
      }
      
      // Normalizar para comparação
      const cidadeNormalizada = normalizarNome(cidadeEvento);
      
      // Verificar se a cidade está na rota
      let cidadeNaRota = false;
      for (const cidade of cidadesRota) {
        const rotaNormalizada = normalizarNome(cidade);
        
        if (rotaNormalizada.includes(cidadeNormalizada) || 
            cidadeNormalizada.includes(rotaNormalizada)) {
          cidadeNaRota = true;
          break;
        }
      }
      
      // Se não está na rota ou já mostramos, ocultar
      if (!cidadeNaRota || cidadesJaExibidas.has(cidadeNormalizada)) {
        evento.style.display = 'none';
        return;
      }
      
      // Marcar cidade como exibida para evitar duplicatas
      cidadesJaExibidas.add(cidadeNormalizada);
      
      // Mostrar este evento
      evento.style.display = '';
      
      // Corrigir data de aniversário se necessário
      corrigirDataEvento(evento, cidadeEvento);
    });
    
    console.log("[DirectFix] Correção de eventos finalizada");
  }
  
  // ESTILIZAÇÃO DE BOTÕES
  function estilizarBotoes() {
    // Encontrar todos os botões
    const botoesPrincipais = document.querySelectorAll('button, .button, .btn, [class*="visualizar"], [class*="otimizar"]');
    const botoesAbas = document.querySelectorAll('.bottom-tab-button, .tab-button, button[onclick*="openTab"]');
    
    // Estilizar botões principais
    botoesPrincipais.forEach(botao => {
      // Ignorar botões de abas
      if (botao.classList.contains('bottom-tab-button') || 
          botao.classList.contains('tab-button')) {
        return;
      }
      
      // Verificar se já processamos
      if (botao.hasAttribute('data-styled')) return;
      
      // Marcar como processado
      botao.setAttribute('data-styled', 'true');
      
      // Adicionar classe para CSS
      botao.classList.add('botao-gh-padronizado');
      
      // Verificar tipo específico para classes adicionais
      const textoLower = botao.textContent.toLowerCase();
      if (textoLower.includes('visualizar')) {
        botao.classList.add('botao-gh-visualizar');
      } else if (textoLower.includes('otimizar')) {
        botao.classList.add('botao-gh-otimizar');
      }
    });
    
    // Estilizar botões de abas
    botoesAbas.forEach(botao => {
      // Verificar se já processamos
      if (botao.hasAttribute('data-tab-styled')) return;
      
      // Marcar como processado
      botao.setAttribute('data-tab-styled', 'true');
      
      // Adicionar classe para CSS
      botao.classList.add('botao-gh-tab');
      
      // Verificar se está ativo
      if (botao.classList.contains('active')) {
        botao.classList.add('botao-gh-tab-ativo');
      }
      
      // Adicionar evento de clique
      botao.addEventListener('click', function() {
        // Remover classe ativa de todos
        botoesAbas.forEach(b => b.classList.remove('botao-gh-tab-ativo'));
        
        // Adicionar a este
        this.classList.add('botao-gh-tab-ativo');
      });
    });
  }
  
  // FUNÇÕES AUXILIARES
  
  // Obter cidades na rota
  function obterCidadesRota() {
    const cidades = [];
    
    // Obter origem
    const origem = document.querySelector('.sidebar strong');
    if (origem && origem.textContent) {
      cidades.push(limparNomeCidade(origem.textContent));
    }
    
    // Obter outros locais
    const locais = document.querySelectorAll('.location-item');
    locais.forEach(local => {
      const texto = local.textContent || '';
      const nome = texto.split('\n')[0].trim();
      if (nome) {
        cidades.push(limparNomeCidade(nome));
      }
    });
    
    // Remover duplicatas
    return [...new Set(cidades)];
  }
  
  // Obter cidade de um evento
  function obterCidadeEvento(evento) {
    const dataElement = evento.querySelector('.event-date');
    if (dataElement) {
      const texto = dataElement.textContent || '';
      const partes = texto.split('|');
      if (partes.length > 0) {
        return partes[0].trim();
      }
    }
    return '';
  }
  
  // Corrigir data de evento
  function corrigirDataEvento(evento, nomeCidade) {
    // Verificar se temos correção para esta cidade
    let dataCorrigida = null;
    
    // Normalizar para comparação
    const cidadeNormalizada = normalizarNome(nomeCidade);
    
    // Verificar em correções específicas
    for (const [cidade, info] of Object.entries(CORRECOES_DATAS)) {
      if (normalizarNome(cidade).includes(cidadeNormalizada) || 
          cidadeNormalizada.includes(normalizarNome(cidade))) {
        dataCorrigida = info;
        break;
      }
    }
    
    // Se não encontrou nas correções, verificar na data de fundação
    if (!dataCorrigida) {
      for (const [cidade, data] of Object.entries(DATAS_FUNDACAO)) {
        if (normalizarNome(cidade).includes(cidadeNormalizada) || 
            cidadeNormalizada.includes(normalizarNome(cidade))) {
          const partes = data.split('/');
          dataCorrigida = { dia: partes[0], mes: partes[1] };
          break;
        }
      }
    }
    
    // Se encontrou data para corrigir
    if (dataCorrigida) {
      // Ajustar data no elemento
      const dataElement = evento.querySelector('.event-date');
      if (dataElement) {
        const textoOriginal = dataElement.textContent || '';
        const partes = textoOriginal.split('|');
        if (partes.length > 1) {
          const cidade = partes[0].trim();
          dataElement.textContent = `${cidade} | ${dataCorrigida.dia}/${dataCorrigida.mes}/2025`;
        }
      }
      
      // Ajustar descrição do evento
      const descElement = evento.querySelector('.event-description');
      if (descElement) {
        const textoDesc = descElement.textContent || '';
        if (textoDesc.includes('Aniversário de fundação')) {
          // Encontrar data completa
          let dataCompleta = null;
          for (const [cidade, data] of Object.entries(DATAS_FUNDACAO)) {
            if (normalizarNome(cidade).includes(cidadeNormalizada) || 
                cidadeNormalizada.includes(normalizarNome(cidade))) {
              dataCompleta = data;
              break;
            }
          }
          
          if (dataCompleta) {
            descElement.textContent = `Aniversário de fundação de ${nomeCidade} em ${dataCompleta}`;
          }
        }
      }
    }
  }
  
  // Limpar nome de cidade
  function limparNomeCidade(nome) {
    if (!nome) return '';
    
    // Remover texto após vírgula
    nome = nome.split(',')[0];
    
    // Remover sufixos de estado
    nome = nome.replace(/\s*[\/\-]\s*SP\b/i, '');
    nome = nome.replace(/\s*[\/\-]\s*MG\b/i, '');
    
    // Remover códigos postais
    nome = nome.replace(/\d{5}-\d{3}/, '');
    
    // Remover parênteses e conteúdo
    nome = nome.replace(/\([^)]*\)/, '');
    
    return nome.trim();
  }
  
  // Normalizar nome para comparação
  function normalizarNome(nome) {
    if (!nome) return '';
    
    // Para minúsculas
    nome = nome.toLowerCase();
    
    // Remover acentos
    nome = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Remover caracteres especiais
    nome = nome.replace(/[^a-z0-9\s]/g, '');
    
    return nome.trim();
  }
  
  // Injetar estilos CSS
  function injetarEstilosBotoes() {
    // Verificar se já injetamos
    if (document.getElementById('gh-direct-styles')) return;
    
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.id = 'gh-direct-styles';
    
    // Conteúdo CSS
    style.textContent = `
      /* Estilo base para botões padronizados */
      .botao-gh-padronizado {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 10px 20px !important;
        border-radius: 50px !important;
        border: none !important;
        font-weight: bold !important;
        font-size: 16px !important;
        color: white !important;
        cursor: pointer !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease !important;
        text-align: center !important;
        width: 100% !important;
        margin: 8px 0 !important;
        text-decoration: none !important;
        background: linear-gradient(45deg, #FF9500, #FF5722) !important;
      }
      
      /* Efeito hover */
      .botao-gh-padronizado:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
        background: linear-gradient(45deg, #FF5722, #FF9500) !important;
      }
      
      /* Todos os botões na cor amarela Móveis Bonafé */
      .botao-gh-padronizado,
      .botao-gh-visualizar,
      .botao-gh-otimizar,
      .botao-gh-tab,
      .bottom-tab-button,
      .tab-button {
        background: linear-gradient(45deg, #FFD700, #FFA500) !important;
      }
      
      .botao-gh-padronizado:hover,
      .botao-gh-visualizar:hover,
      .botao-gh-otimizar:hover,
      .botao-gh-tab:hover,
      .bottom-tab-button:hover,
      .tab-button:hover {
        background: linear-gradient(45deg, #FFA500, #FFD700) !important;
      }
      
      /* Botão ativo em tom mais forte */
      .botao-gh-tab-ativo,
      .bottom-tab-button.active,
      .tab-button.active {
        background: linear-gradient(45deg, #FF8C00, #FFA500) !important;
      }
      
      /* Botões de abas */
      .botao-gh-tab,
      .bottom-tab-button,
      .tab-button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 10px 20px !important;
        border-radius: 50px !important;
        border: none !important;
        font-weight: bold !important;
        font-size: 14px !important;
        color: white !important;
        background: linear-gradient(45deg, #2196F3, #03A9F4) !important;
        cursor: pointer !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease !important;
        margin: 5px !important;
      }
      
      /* Efeito hover */
      .botao-gh-tab:hover,
      .bottom-tab-button:hover,
      .tab-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15) !important;
      }
      
      /* Botão ativo */
      .botao-gh-tab-ativo,
      .bottom-tab-button.active,
      .tab-button.active {
        background: linear-gradient(45deg, #4CAF50, #8BC34A) !important;
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
    console.log("[DirectFix] Estilos injetados com sucesso");
  }
})();