/**
 * Script para ajustar o layout do mapa para preencher toda a área disponível
 * e posicionar o Pegman em cima do ícone de pontos de interesse
 */
(function() {
  console.log("[MapaFullscreenPegmanFix] Iniciando ajustes no mapa e posicionamento do Pegman");
  
  // Aplicar ajustes após carregamento completo
  setTimeout(aplicarAjustes, 1500);
  setTimeout(aplicarAjustes, 3000);
  setInterval(verificarEManterAjustes, 5000);
  
  /**
   * Função principal para aplicar todos os ajustes
   */
  function aplicarAjustes() {
    // 1. Ajustar layout do mapa para tela cheia
    ajustarMapaTelaCheia();
    
    // 2. Posicionar Pegman sobre ícone de POI (Pontos de Interesse)
    posicionarPegmanSobrePOI();
  }
  
  /**
   * Ajusta o layout do mapa para preencher toda a área disponível
   * mantendo a interface centralizada
   */
  function ajustarMapaTelaCheia() {
    console.log("[MapaFullscreenPegmanFix] Ajustando mapa com interface centralizada");
    
    // 1. Ajustar o container do mapa
    const mapaContainer = document.querySelector('.map-container, #map-container');
    if (mapaContainer) {
      // Definir estilos para o container preencher toda a área disponível
      // mas mantendo a interface centralizada como antes
      mapaContainer.style.position = 'relative';
      mapaContainer.style.margin = '0 auto';
      mapaContainer.style.marginLeft = '300px'; // Manter espaço para sidebar
      mapaContainer.style.height = 'calc(100vh - 40px)'; // Deixar um pequeno espaço
      mapaContainer.style.width = 'calc(100% - 320px)'; // Um pouco menor para não estourar
      mapaContainer.style.maxWidth = '1200px'; // Limitar largura máxima
      mapaContainer.style.zIndex = '1';
      mapaContainer.style.overflow = 'hidden';
      mapaContainer.style.borderRadius = '10px'; // Arredondar bordas do mapa
      mapaContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      
      console.log("[MapaFullscreenPegmanFix] Container do mapa ajustado centralizadamente");
    }
    
    // 2. Ajustar o elemento do mapa diretamente
    const mapa = document.getElementById('map');
    if (mapa) {
      mapa.style.height = '100%';
      mapa.style.width = '100%';
      mapa.style.position = 'relative';
      mapa.style.margin = '0';
      mapa.style.padding = '0';
      mapa.style.borderRadius = '10px'; // Arredondar bordas para combinar com o container
      
      console.log("[MapaFullscreenPegmanFix] Elemento do mapa ajustado de forma centralizada");
    }
    
    // 3. Ajustar a posição das abas inferiores
    const abasInferiores = document.querySelector('.bottom-tabs, #bottom-tabs');
    if (abasInferiores) {
      // Ajustar para manter centralizado como o mapa
      abasInferiores.style.position = 'relative';
      abasInferiores.style.marginLeft = '300px'; // Alinhar com a sidebar
      abasInferiores.style.width = 'calc(100% - 320px)'; // Mesma largura do mapa
      abasInferiores.style.maxWidth = '1200px'; // Limitar largura máxima
      abasInferiores.style.zIndex = '100';
      abasInferiores.style.borderTopLeftRadius = '25px';
      abasInferiores.style.borderTopRightRadius = '25px';
      abasInferiores.style.margin = '0 auto'; // Centralizar
      abasInferiores.style.boxShadow = '0 -4px 10px rgba(0,0,0,0.1)';
      
      console.log("[MapaFullscreenPegmanFix] Abas inferiores reposicionadas de forma centralizada");
    }
    
    // 4. Ajustar a barra lateral
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.position = 'fixed';
      sidebar.style.top = '0';
      sidebar.style.left = '0';
      sidebar.style.bottom = '0';
      sidebar.style.width = '300px';
      sidebar.style.height = '100vh';
      sidebar.style.overflowY = 'auto';
      sidebar.style.zIndex = '200';
      sidebar.style.boxShadow = '2px 0 10px rgba(0, 0, 0, 0.1)';
      
      console.log("[MapaFullscreenPegmanFix] Sidebar fixada");
    }
    
    // 5. Forçar redimensionamento do mapa
    if (window.google && google.maps && window.map) {
      google.maps.event.trigger(window.map, 'resize');
      console.log("[MapaFullscreenPegmanFix] Mapa redimensionado");
    }
    
    // 6. Adicionar estilos CSS para garantir layout em tela cheia
    injetarEstilosTelaCheia();
  }
  
  /**
   * Posiciona o Pegman sobre o ícone de Pontos de Interesse
   */
  function posicionarPegmanSobrePOI() {
    console.log("[MapaFullscreenPegmanFix] Posicionando Pegman sobre ícone de POI");
    
    try {
      // 1. Primeiro localizar o Pegman
      const pegman = document.querySelector('.gm-svpc');
      if (!pegman) {
        console.log("[MapaFullscreenPegmanFix] Pegman não encontrado, tentando alternativas");
        return;
      }
      
      // 2. Localizar o controle de POI (Pontos de Interesse)
      const poiControle = localizarControlePOI();
      if (!poiControle) {
        console.log("[MapaFullscreenPegmanFix] Controle POI não encontrado, usando posicionamento alternativo");
        
        // Se não encontrou, posicionar no canto inferior direito
        posicionarPegmanManualmente(pegman);
        return;
      }
      
      // 3. Obter a posição do controle POI
      const poiRect = poiControle.getBoundingClientRect();
      
      // 4. Mover o Pegman para ficar sobre o controle POI
      const pegmanParent = pegman.parentElement;
      if (pegmanParent) {
        // Ajustar a posição do container do Pegman
        pegmanParent.style.position = 'absolute';
        pegmanParent.style.bottom = `${window.innerHeight - poiRect.top + 10}px`;
        pegmanParent.style.right = `${window.innerWidth - poiRect.right + 5}px`;
        pegmanParent.style.zIndex = '1000';
        
        console.log("[MapaFullscreenPegmanFix] Pegman reposicionado sobre POI");
      } else {
        // Se não conseguiu posicionar, criar um novo container
        posicionarPegmanManualmente(pegman);
      }
      
      // 5. Estilizar o Pegman para combinar com o tema
      pegman.style.backgroundColor = '#FFF8E1';
      pegman.style.border = '2px solid #FFA500';
      pegman.style.borderRadius = '50%';
      pegman.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    } catch (e) {
      console.warn("[MapaFullscreenPegmanFix] Erro ao posicionar Pegman:", e);
      
      // Em caso de erro, tentar posicionamento alternativo
      const pegman = document.querySelector('.gm-svpc');
      if (pegman) {
        posicionarPegmanManualmente(pegman);
      }
    }
  }
  
  /**
   * Localiza o controle de Pontos de Interesse no mapa
   */
  function localizarControlePOI() {
    // Estratégias para encontrar o controle POI
    
    // 1. Procurar por atributos específicos
    let controle = document.querySelector('button[title*="pontos de interesse"], button[title*="Points of Interest"], button[aria-label*="pontos de interesse"], button[aria-label*="Points of Interest"]');
    
    // 2. Se não encontrou, procurar pelos ícones típicos de POI
    if (!controle) {
      controle = document.querySelector('.poi-icon, [class*="poi"], div[role="button"] img[src*="poi"]');
    }
    
    // 3. Se ainda não encontrou, procurar por controles do tipo "botão de camada"
    if (!controle) {
      const camadaBotoes = document.querySelectorAll('.gm-style-mtc button, [class*="layer"] button');
      camadaBotoes.forEach(botao => {
        // Verificar se este pode ser o botão de POI
        if (botao.textContent && (
            botao.textContent.includes('Mapa') || 
            botao.textContent.includes('Map') || 
            botao.textContent.includes('Satellite') || 
            botao.textContent.includes('Satélite')
        )) {
          controle = botao;
        }
      });
    }
    
    return controle;
  }
  
  /**
   * Posiciona o Pegman manualmente em posição estratégica
   */
  function posicionarPegmanManualmente(pegman) {
    // Criar container para o Pegman
    const container = document.createElement('div');
    container.className = 'pegman-container';
    container.style.position = 'absolute';
    container.style.bottom = '120px'; // Posicionar acima das abas
    container.style.right = '10px';
    container.style.zIndex = '1000';
    container.style.backgroundColor = '#FFF8E1';
    container.style.border = '2px solid #FFA500';
    container.style.borderRadius = '50%';
    container.style.padding = '2px';
    container.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    
    // Se temos o elemento Pegman
    if (pegman && pegman.parentNode) {
      // Remover do local atual
      pegman.parentNode.removeChild(pegman);
      
      // Adicionar ao novo container
      container.appendChild(pegman);
      
      // Adicionar o container ao mapa
      const mapaElement = document.getElementById('map');
      if (mapaElement) {
        mapaElement.appendChild(container);
        console.log("[MapaFullscreenPegmanFix] Pegman posicionado manualmente no mapa");
      } else {
        // Adicionar ao body como alternativa
        document.body.appendChild(container);
        console.log("[MapaFullscreenPegmanFix] Pegman posicionado manualmente no body");
      }
    }
  }
  
  /**
   * Injeta estilos CSS para garantir que o mapa ocupe toda a área disponível
   */
  function injetarEstilosTelaCheia() {
    // Verificar se já injetamos os estilos
    if (!document.getElementById('mapa-fullscreen-css')) {
      const estilos = document.createElement('style');
      estilos.id = 'mapa-fullscreen-css';
      estilos.textContent = `
        /* Estilos para layout centralizado */
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        /* Container principal */
        .container {
          display: flex;
          min-height: 100vh;
          position: relative;
        }
        
        /* Sidebar */
        .sidebar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 300px !important;
          height: 100vh !important;
          overflow-y: auto !important;
          z-index: 200 !important;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Container do mapa */
        .map-container, #map-container {
          position: relative !important;
          margin-left: 300px !important;
          margin-right: auto !important;
          width: calc(100% - 320px) !important;
          max-width: 1200px !important;
          height: calc(100vh - 40px) !important;
          z-index: 1 !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Elemento do mapa */
        #map {
          height: 100% !important;
          width: 100% !important;
          position: relative !important;
          margin: 0 !important;
          border-radius: 10px !important;
        }
        
        /* Abas inferiores */
        .bottom-tabs, #bottom-tabs {
          position: relative !important;
          margin-left: 300px !important;
          margin-right: auto !important;
          width: calc(100% - 320px) !important;
          max-width: 1200px !important;
          z-index: 100 !important;
          border-top-left-radius: 25px !important;
          border-top-right-radius: 25px !important;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Pegman personalizado */
        .pegman-container, .gm-svpc {
          position: absolute !important;
          top: 20px !important;
          right: 20px !important;
          z-index: 1000 !important;
          background-color: #FFF8E1 !important;
          border: 2px solid #FFA500 !important;
          border-radius: 50% !important;
          padding: 3px !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          display: block !important;
          visibility: visible !important;
        }
        
        .pegman-container:hover, .gm-svpc:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
        }
        
        /* Ajustes para botões arredondados */
        .bottom-tab-button {
          border-radius: 50px !important;
          margin: 5px !important;
          padding: 10px 20px !important;
          background: linear-gradient(45deg, #FFD700, #FFA500) !important;
        }
        
        /* Fazer controles do Google Maps aparecerem */
        .gmnoprint, .gm-style-cc, .gm-svpc, .gm-control-active {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(estilos);
      
      console.log("[MapaFullscreenPegmanFix] Estilos para mapa em tela cheia injetados");
    }
  }
  
  /**
   * Verifica e mantém os ajustes periodicamente
   */
  function verificarEManterAjustes() {
    // Verificar se o mapa ainda está em tela cheia
    const mapaContainer = document.querySelector('.map-container, #map-container');
    if (mapaContainer && mapaContainer.style.position !== 'absolute') {
      console.log("[MapaFullscreenPegmanFix] Detectada mudança no layout, reaplicando ajustes");
      aplicarAjustes();
    }
    
    // Verificar se o Pegman está visível e corretamente posicionado
    const pegman = document.querySelector('.gm-svpc');
    if (pegman) {
      // Se o Pegman não estiver em um container personalizado, reposicionar
      const temContainerPersonalizado = pegman.closest('.pegman-container');
      if (!temContainerPersonalizado) {
        console.log("[MapaFullscreenPegmanFix] Pegman sem container personalizado, reposicionando");
        posicionarPegmanSobrePOI();
      }
    } else {
      console.log("[MapaFullscreenPegmanFix] Pegman não encontrado, tentando restaurar");
      // Tentar habilitar o controle novamente
      if (window.google && google.maps && window.map) {
        window.map.setOptions({
          streetViewControl: true
        });
      }
    }
  }
})();