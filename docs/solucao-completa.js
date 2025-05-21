/**
 * Solução completa para Móveis Bonafé GitHub Pages
 * - Correção das datas de aniversário das cidades
 * - Remoção de botões indesejados
 * - Mudança das cores dos botões para amarelo
 */
(function() {
  console.log("[SolucaoCompleta] Iniciando solução completa para GitHub Pages");
  
  // Executar logo após carregamento inicial
  setTimeout(inicializarCorrecoes, 500);
  // E novamente após alguns segundos para garantir que tudo está carregado
  setTimeout(inicializarCorrecoes, 2000);
  // Mais uma vez após um intervalo maior para garantir que o Google Maps tenha carregado completamente
  setTimeout(inicializarCorrecoes, 5000);
  
  // CONSTANTES
  const DATAS_ANIVERSARIO = {
    "Piedade": "20/05/1842",
    "Ribeirão Preto": "19/06/1856",
    "Dois Córregos": "04/02/1883",
    "São Paulo": "25/01/1554",
    "Campinas": "14/07/1774",
    "Santos": "26/01/1546",
    "Passa Quatro": "01/09/1850",
    "Mutum": "05/09/1923",
    "Muriaé": "06/09/1855"
  };
  
  // FUNÇÃO PRINCIPAL
  function inicializarCorrecoes() {
    console.log("[SolucaoCompleta] Aplicando correções...");
    
    // 1. Mudar cores para amarelo
    adicionarEstilosAmarelos();
    aplicarCoresAmarelas();
    
    // 2. Ajustar estrutura do mapa para centralizar
    ajustarEstruturaMapa();
    
    // 3. Remover botões indesejados
    removerBotoesIndesejados();
    
    // 4. Corrigir datas das cidades
    corrigirDatasAniversario();
    
    // 5. Filtrar eventos para mostrar apenas cidades na rota
    filtrarEventosPorCidadesRota();
  }
  
  // AJUSTAR ESTRUTURA DO MAPA
  function ajustarEstruturaMapa() {
    console.log("[SolucaoCompleta] Ajustando estrutura do mapa para centralizar");
    
    // Verificar se o mapa existe
    const mapContainer = document.querySelector('.map-container');
    const mapDiv = document.getElementById('map');
    
    if (!mapContainer || !mapDiv) {
      console.log("[SolucaoCompleta] Não foi possível encontrar o container do mapa");
      return;
    }
    
    // Aplicar estilos diretamente no mapa para garantir centralização
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapDiv.style.borderRadius = '10px';
    
    // Ajustar o container do mapa
    mapContainer.style.position = 'fixed';
    mapContainer.style.top = '10px';
    mapContainer.style.left = '310px';
    mapContainer.style.right = '10px'; 
    mapContainer.style.bottom = '70px';
    mapContainer.style.padding = '0';
    mapContainer.style.margin = '0';
    mapContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.overflow = 'hidden';
    
    // Verificar se precisamos recarregar o mapa
    if (window.google && window.google.maps) {
      try {
        // Tentar forçar o mapa a se ajustar
        const center = window.map ? window.map.getCenter() : null;
        if (center) {
          // Trigger resize para o mapa se ajustar
          google.maps.event.trigger(window.map, 'resize');
          // Restaurar o centro
          window.map.setCenter(center);
        }
      } catch (e) {
        console.log("[SolucaoCompleta] Não foi possível reajustar o mapa:", e);
      }
    }
    
    console.log("[SolucaoCompleta] Mapa centralizado com sucesso");
  }
  
  // ADICIONAR ESTILOS AMARELOS
  function adicionarEstilosAmarelos() {
    if (document.getElementById('estilos-amarelos-bonafe')) return;
    
    const estilo = document.createElement('style');
    estilo.id = 'estilos-amarelos-bonafe';
    estilo.textContent = `
      /* Melhorar layout do mapa para ocupar corretamente toda a tela */
      html, body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      
      .container {
        display: flex !important;
        height: 100vh !important;
        width: 100% !important;
        overflow: hidden !important;
      }
      
      .sidebar {
        width: 300px !important;
        min-width: 300px !important;
        height: 100vh !important;
        overflow-y: auto !important;
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        z-index: 1000 !important;
        padding: 15px !important;
        box-shadow: 2px 0 10px rgba(0,0,0,0.1) !important;
      }
      
      .map-container {
        flex: 1 !important;
        height: calc(100vh - 60px) !important;
        position: fixed !important;
        left: 300px !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 60px !important;
        overflow: hidden !important;
        padding: 10px !important;
      }
      
      /* Estilo interno para o mapa */
      .map-inner {
        width: 100% !important;
        height: 100% !important;
        border-radius: 10px !important;
        box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
        overflow: hidden !important;
      }
      
      #map {
        height: 100% !important;
        width: 100% !important;
        border-radius: 10px !important;
      }
      
      /* Ajuste para bottom tabs não cobrir o mapa e ficar melhor posicionado */
      .bottom-tabs {
        position: fixed !important;
        bottom: 0 !important;
        left: 300px !important;
        right: 0 !important;
        background: rgba(248, 249, 250, 0.95) !important;
        z-index: 500 !important;
        padding: 10px 15px !important;
        border-top: 1px solid rgba(0,0,0,0.1) !important;
        max-height: 50vh !important;
        overflow-y: auto !important;
      }
      
      /* Quando as abas estão minimizadas */
      .bottom-tabs:not(.expanded) {
        max-height: none !important;
        height: auto !important;
      }
      
      /* Adicionar padding ao conteúdo para não ficar escondido pelas abas */
      .map-container {
        padding-bottom: 60px !important;
      }
      
      /* Botões em amarelo */
      button, 
      .button, 
      .btn, 
      input[type="button"], 
      input[type="submit"],
      .bottom-tab-button {
        background: linear-gradient(45deg, #FFD700, #FFA500) !important;
        color: #333 !important;
        font-weight: bold !important;
        border-radius: 50px !important;
        border: none !important;
        padding: 10px 20px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
      }
      
      /* Efeito hover */
      button:hover, 
      .button:hover, 
      .btn:hover,
      input[type="button"]:hover, 
      input[type="submit"]:hover,
      .bottom-tab-button:hover {
        background: linear-gradient(45deg, #FFA500, #FFD700) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
      }
      
      /* Botão ativo */
      button.active, 
      .button.active, 
      .btn.active,
      .bottom-tab-button.active {
        background: linear-gradient(45deg, #FF8C00, #FFA500) !important;
      }
      
      /* Esconder botão fullscreen e outros controles indesejados */
      .gm-fullscreen-control,
      .gm-svpc,
      .gmnoprint,
      .gm-style-cc,
      .gm-style > div:not(#map) > div:nth-child(2) {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
      
      /* Garantir que os botões na aba inferior sejam arredondados */
      .bottom-tab-button {
        border-radius: 50px !important;
        margin: 5px !important;
        padding: 10px 20px !important;
      }
      
      /* Destacar título */
      .sidebar h2 {
        color: #FFA500 !important;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1) !important;
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("[SolucaoCompleta] Estilos amarelos aplicados");
  }
  
  // APLICAR CORES AMARELAS
  function aplicarCoresAmarelas() {
    // Buscar botões e aplicar classe
    const botoes = document.querySelectorAll('button, .button, .btn, input[type="button"], input[type="submit"]');
    botoes.forEach(botao => {
      if (!botao.hasAttribute('data-amarelo')) {
        botao.setAttribute('data-amarelo', 'true');
      }
    });
  }
  
  // REMOVER BOTÕES INDESEJADOS
  function removerBotoesIndesejados() {
    // Esconder controles do Google Maps
    const mapDiv = document.getElementById('map');
    if (mapDiv) {
      // Tentar obter qualquer instância de mapa disponível
      try {
        // Verificar várias formas de acessar o mapa
        const mapInstance = window.map || 
                            window.googleMap || 
                            (window.google && window.google.maps && window.google.maps.Map) || 
                            null;
                            
        if (mapInstance) {
          // Se encontrarmos qualquer referência ao mapa, tentar configurar
          try {
            mapInstance.setOptions({
              fullscreenControl: false,
              streetViewControl: false,
              zoomControl: false,
              mapTypeControl: false
            });
            console.log("[SolucaoCompleta] Configurações do mapa ajustadas via API");
          } catch (configError) {
            console.log("[SolucaoCompleta] Não foi possível configurar o mapa:", configError);
          }
        }
      } catch (e) {
        console.log("[SolucaoCompleta] Não foi possível acessar o mapa:", e);
      }
      
      // Função para verificar e remover controles do mapa periodicamente
      function verificarERemoverControles() {
        // Esconder via DOM todos os controles
        const controles = document.querySelectorAll('.gm-fullscreen-control, button[title*="Desfazer"], .gmnoprint, .gm-control-active, .gm-style-cc');
        controles.forEach(controle => {
          if (controle && controle.parentNode) {
            controle.style.display = 'none';
            console.log("[SolucaoCompleta] Controle ocultado via DOM");
          }
        });
        
        // Encontrar div de controles do mapa e remover completamente
        const divControles = document.querySelectorAll('div[jsaction], div[aria-label*="Controls"]');
        divControles.forEach(div => {
          if (div.className && div.className.includes('gmnoprint') && div.parentNode) {
            div.parentNode.removeChild(div);
            console.log("[SolucaoCompleta] Div de controles removido");
          }
        });
      }
      
      // Executar imediatamente e também periodicamente
      verificarERemoverControles();
      setInterval(verificarERemoverControles, 1000);
    }
    
    // Garantir que os botões da aba inferior estejam arredondados
    const botoesAba = document.querySelectorAll('.bottom-tab-button');
    botoesAba.forEach(botao => {
      botao.style.borderRadius = '50px';
      botao.style.margin = '5px';
      botao.style.padding = '10px 20px';
    });
  }
  
  // CORRIGIR DATAS DE ANIVERSÁRIO
  function corrigirDatasAniversario() {
    // Buscar itens de evento com aniversários de cidades
    const eventosElements = document.querySelectorAll('.event-item');
    
    eventosElements.forEach(evento => {
      const dataElement = evento.querySelector('.event-date');
      if (!dataElement) return;
      
      const textoData = dataElement.textContent || '';
      if (textoData.includes('Aniversário da Cidade')) {
        // Extrair nome da cidade
        const cidadeMatch = textoData.match(/^([^|]+)/);
        if (cidadeMatch && cidadeMatch[1]) {
          const nomeCidade = cidadeMatch[1].trim();
          
          // Verificar se temos data para esta cidade
          for (const [cidade, dataFundacao] of Object.entries(DATAS_ANIVERSARIO)) {
            if (normalizarTexto(cidade) === normalizarTexto(nomeCidade)) {
              // Extrair dia e mês da data de fundação
              const partes = dataFundacao.split('/');
              if (partes.length >= 2) {
                const dia = partes[0];
                const mes = partes[1];
                
                // Atualizar o texto da data
                dataElement.textContent = `${nomeCidade} | ${dia}/${mes}/2025`;
                
                // Atualizar descrição
                const descElement = evento.querySelector('.event-description');
                if (descElement) {
                  descElement.textContent = `Aniversário de fundação de ${nomeCidade} em ${dataFundacao}`;
                }
                
                console.log(`[SolucaoCompleta] Data corrigida para ${nomeCidade}: ${dia}/${mes}/2025`);
              }
              break;
            }
          }
        }
      }
    });
  }
  
  // FILTRAR EVENTOS POR CIDADES NA ROTA
  function filtrarEventosPorCidadesRota() {
    // Buscar cidades na rota
    const cidadesNaRota = obterCidadesRota();
    console.log("[SolucaoCompleta] Cidades na rota:", cidadesNaRota);
    
    if (cidadesNaRota.length === 0) {
      console.log("[SolucaoCompleta] Nenhuma cidade na rota encontrada");
      return;
    }
    
    // Obter todos os eventos
    const eventosElements = document.querySelectorAll('.event-item');
    console.log("[SolucaoCompleta] Total de eventos encontrados:", eventosElements.length);
    
    // Para cada evento, verificar se a cidade está na rota
    eventosElements.forEach(evento => {
      const dataElement = evento.querySelector('.event-date');
      if (!dataElement) return;
      
      const textoData = dataElement.textContent || '';
      const cidadeMatch = textoData.match(/^([^|]+)/);
      
      if (cidadeMatch && cidadeMatch[1]) {
        const nomeCidade = cidadeMatch[1].trim();
        const cidadeNormalizada = normalizarTexto(nomeCidade);
        
        // Verificar se a cidade está na rota
        const cidadeEncontrada = cidadesNaRota.some(cidade => 
          normalizarTexto(cidade) === cidadeNormalizada);
        
        // Mostrar ou ocultar evento
        if (cidadeEncontrada) {
          evento.style.display = '';
          console.log(`[SolucaoCompleta] Evento em ${nomeCidade} ACEITO - está na rota`);
        } else {
          evento.style.display = 'none';
          console.log(`[SolucaoCompleta] Evento em ${nomeCidade} REJEITADO - não está na rota`);
        }
      }
    });
  }
  
  // FUNÇÕES AUXILIARES
  
  // Normalizar texto para comparação
  function normalizarTexto(texto) {
    if (!texto) return '';
    
    return texto.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^\w\s]/g, '') // Remover caracteres especiais
      .trim();
  }
  
  // Obter cidades na rota atual
  function obterCidadesRota() {
    const cidades = [];
    
    // Origem (primeira localização forte)
    const origemElement = document.querySelector('.sidebar strong');
    if (origemElement) {
      const textoOrigem = origemElement.textContent || '';
      const cidadeOrigem = textoOrigem.split(',')[0].trim();
      if (cidadeOrigem) {
        cidades.push(cidadeOrigem);
      }
    }
    
    // Destinos
    const localizacoes = document.querySelectorAll('.location-item');
    localizacoes.forEach(loc => {
      const textoLoc = loc.textContent || '';
      const partes = textoLoc.split('\n')[0].trim();
      const cidadeLoc = partes.split(',')[0].trim();
      if (cidadeLoc && !cidades.includes(cidadeLoc)) {
        cidades.push(cidadeLoc);
      }
    });
    
    return cidades;
  }
})();