/**
 * Pergaminho - Solução completa para o mapa e exibição de eventos
 * Este script ajusta o layout do mapa no GitHub Pages e adiciona o Pegman (Street View)
 */
(function() {
  console.log("🗺️ [Pergaminho] Iniciando ajustes no mapa");

  // Executar quando a página for carregada
  window.addEventListener('load', inicializarAjustes);
  window.addEventListener('DOMContentLoaded', inicializarAjustes);
  setTimeout(inicializarAjustes, 500);
  setTimeout(inicializarAjustes, 2500);

  // Função principal de inicialização
  function inicializarAjustes() {
    console.log("🗺️ [Pergaminho] Aplicando ajustes...");

    // 1. Adicionar estilos CSS para layout do mapa
    adicionarEstilos();

    // 2. Ajustar elementos DOM do mapa
    ajustarLayoutMapa();

    // 3. Configurar o mapa do Google Maps
    configurarMapa();

    // 4. Ajustar botões para estilo amarelo
    estilizarBotoes();
    
    // 5. Remover elementos indesejados periodicamente
    setInterval(function() {
      removerElementosIndesejados();
      ajustarLayoutMapa();
    }, 1000);
  }

  // Adicionar estilos globais CSS
  function adicionarEstilos() {
    if (document.getElementById('pergaminho-estilos')) return;

    const estilo = document.createElement('style');
    estilo.id = 'pergaminho-estilos';
    estilo.textContent = `
      /* Correções para o layout principal */
      html, body {
        overflow: hidden;
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }

      /* Layout do container principal */
      .container {
        display: flex;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        position: relative;
      }

      /* Sidebar fixa */
      .sidebar {
        width: 300px;
        min-width: 300px;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 1000;
        background: #f8f9fa;
        box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        overflow-y: auto;
        padding: 15px;
      }

      /* Container do mapa com largura total */
      .map-container {
        position: fixed;
        left: 300px;
        right: 0;
        top: 0;
        bottom: 60px;
        height: auto;
        width: auto;
      }

      /* Div do mapa ocupa todo o espaço */
      #map {
        height: 100% !important;
        width: 100% !important;
      }

      /* Abas na parte inferior */
      .bottom-tabs {
        position: fixed;
        left: 300px;
        right: 0;
        bottom: 0;
        background: rgba(248, 249, 250, 0.9);
        padding: 10px;
        z-index: 999;
        box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
      }

      /* Estilo unificado dos botões em amarelo */
      button, .button, .btn, input[type="button"], input[type="submit"],
      .bottom-tab-button, .tab-button {
        background: linear-gradient(45deg, #FFD700, #FFA500) !important;
        color: #333 !important;
        font-weight: bold !important;
        border-radius: 50px !important;
        border: none !important;
        padding: 10px 20px !important;
        margin: 5px !important;
        cursor: pointer !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
        transition: all 0.3s ease !important;
      }

      /* Botões no hover */
      button:hover, .button:hover, .btn:hover, 
      input[type="button"]:hover, input[type="submit"]:hover,
      .bottom-tab-button:hover, .tab-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
        background: linear-gradient(45deg, #FFA500, #FFD700) !important;
      }

      /* Botões ativos com cor mais forte */
      button.active, .button.active, .btn.active,
      .bottom-tab-button.active, .tab-button.active {
        background: linear-gradient(45deg, #FF8C00, #FFA500) !important;
      }
      
      /* Esconder controles desnecessários do mapa */
      .gm-fullscreen-control, 
      .gm-svpc {
        display: none !important;
      }
      
      /* Ocultar elementos fora do mapa */
      body > div:not(.container):not(.map-container) {
        display: none !important;
      }
    `;

    document.head.appendChild(estilo);
    console.log("🗺️ [Pergaminho] Estilos CSS adicionados");
  }

  // Ajustar layout do mapa
  function ajustarLayoutMapa() {
    const mapContainer = document.querySelector('.map-container');
    const mapDiv = document.getElementById('map');
    
    if (!mapContainer || !mapDiv) {
      console.log("🗺️ [Pergaminho] Elementos do mapa não encontrados");
      return;
    }

    // Ajustar o container do mapa
    Object.assign(mapContainer.style, {
      position: 'fixed',
      left: '300px',
      right: '0',
      top: '0',
      bottom: '60px',
      width: 'auto',
      height: 'auto'
    });

    // Ajustar o div do mapa
    Object.assign(mapDiv.style, {
      width: '100%',
      height: '100%'
    });

    // Ajustar sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      Object.assign(sidebar.style, {
        width: '300px',
        height: '100vh',
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: '1000',
        overflowY: 'auto'
      });
    }

    // Ajustar abas inferiores
    const bottomTabs = document.querySelector('.bottom-tabs');
    if (bottomTabs) {
      Object.assign(bottomTabs.style, {
        position: 'fixed',
        left: '300px',
        right: '0',
        bottom: '0',
        zIndex: '999'
      });
    }

    console.log("🗺️ [Pergaminho] Layout do mapa ajustado");
  }

  // Configurar o objeto do mapa
  function configurarMapa() {
    // Verificar se temos acesso à API do Google Maps
    if (!window.google || !window.google.maps) {
      console.log("🗺️ [Pergaminho] API do Google Maps não disponível");
      return;
    }

    // Verificar a instância do mapa
    let mapaInstance = null;

    // Tentar acessar o mapa de várias formas
    if (window.map && typeof window.map.setOptions === 'function') {
      mapaInstance = window.map;
    } else if (window.googleMap && typeof window.googleMap.setOptions === 'function') {
      mapaInstance = window.googleMap;
    } else {
      console.log("🗺️ [Pergaminho] Não foi possível acessar o objeto do mapa");
      return;
    }

    try {
      // Salvar o centro e zoom atuais
      const centro = mapaInstance.getCenter();
      const zoom = mapaInstance.getZoom();

      // Configurar controles do mapa
      mapaInstance.setOptions({
        // Adicionar o Pegman (Street View)
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        
        // Manter controles de zoom, mas remover outros
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        fullscreenControl: false,
        mapTypeControl: false
      });

      // Forçar atualização do mapa
      google.maps.event.trigger(mapaInstance, 'resize');

      // Restaurar centro e zoom
      mapaInstance.setCenter(centro);
      if (zoom) mapaInstance.setZoom(zoom);

      console.log("🗺️ [Pergaminho] Mapa configurado com sucesso");
    } catch (error) {
      console.log("🗺️ [Pergaminho] Erro ao configurar mapa:", error);
    }
  }

  // Estilizar todos os botões
  function estilizarBotoes() {
    const botoes = document.querySelectorAll('button, .button, .btn, .bottom-tab-button, .tab-button');
    
    botoes.forEach(botao => {
      if (!botao.hasAttribute('data-pergaminho-styled')) {
        Object.assign(botao.style, {
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          color: '#333',
          fontWeight: 'bold',
          borderRadius: '50px',
          border: 'none',
          padding: '10px 20px',
          margin: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        });
        
        botao.setAttribute('data-pergaminho-styled', 'true');
      }
    });
    
    console.log("🗺️ [Pergaminho] Botões estilizados");
  }

  // Remover elementos indesejados
  function removerElementosIndesejados() {
    // Remover divs que parecem ser do Google Maps mas estão fora do container
    const divsEstranhos = document.querySelectorAll('div[style*="width: 256px; height: 256px"], div[style*="position: absolute"][style*="left: -"]');
    
    divsEstranhos.forEach(div => {
      if (div.parentNode && 
          !div.closest('.map-container') && 
          !div.closest('#map')) {
        div.parentNode.removeChild(div);
      }
    });
    
    // Remover elementos de controle desnecessários
    const controlesIndesejados = document.querySelectorAll('.gm-fullscreen-control, .gm-style-cc');
    
    controlesIndesejados.forEach(controle => {
      if (controle.parentNode) {
        controle.style.display = 'none';
      }
    });
  }
})();