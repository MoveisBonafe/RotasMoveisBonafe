/**
 * Solução de emergência para correção do mapa
 * Abordagem direta para GitHub Pages
 */
(function() {
  console.log("⚡ [MapaEmergencial] Iniciando correção direta do mapa");
  
  // Executar imediatamente e depois de carregar completamente a página
  window.addEventListener('load', iniciarCorrecao);
  window.addEventListener('DOMContentLoaded', iniciarCorrecao);
  setTimeout(iniciarCorrecao, 500);
  setTimeout(iniciarCorrecao, 2000);
  setTimeout(iniciarCorrecao, 4000);
  
  function iniciarCorrecao() {
    console.log("⚡ [MapaEmergencial] Aplicando correções");
    
    // Adicionar CSS crítico direto na página
    adicionarCSS();
    
    // Manipular diretamente o mapa usando API do Google
    ajustarMapa();
    
    // Definir um intervalo para garantir que as correções permaneçam
    setInterval(correcaoContinua, 1000);
  }
  
  function adicionarCSS() {
    // Verificar se o CSS já foi adicionado
    if (document.getElementById('mapa-emergencial-css')) return;
    
    // Criar elemento style
    const style = document.createElement('style');
    style.id = 'mapa-emergencial-css';
    style.textContent = `
      /* CSS crítico para o mapa e layout */
      body, html {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      .container {
        display: flex !important;
        width: 100% !important;
        height: 100vh !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      .sidebar {
        width: 300px !important;
        height: 100vh !important;
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        overflow-y: auto !important;
        z-index: 1000 !important;
        background: #f8f9fa !important;
        padding: 15px !important;
        box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
      }
      
      .map-container {
        flex: 1 !important;
        height: 100vh !important;
        position: absolute !important;
        left: 300px !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
      }
      
      #map {
        width: 100% !important;
        height: 100% !important;
      }
      
      .bottom-tabs {
        position: fixed !important;
        bottom: 0 !important;
        left: 300px !important;
        right: 0 !important;
        z-index: 1000 !important;
        background: rgba(248, 249, 250, 0.95) !important;
        padding: 10px !important;
      }
      
      /* Estilo para botões */
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
      
      /* Remover elementos indesejados do Google Maps */
      .gm-fullscreen-control, 
      .gm-style > div:nth-child(2) {
        display: none !important;
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
    console.log("⚡ [MapaEmergencial] CSS crítico adicionado");
  }
  
  function ajustarMapa() {
    console.log("⚡ [MapaEmergencial] Tentando ajustar mapa");
    
    // Primeiro, vamos verificar se temos acesso à API do Google Maps
    if (window.google && window.google.maps) {
      console.log("⚡ [MapaEmergencial] API do Google Maps detectada");
      
      // Verificar o objeto do mapa
      try {
        // Buscar qualquer instância do mapa
        const mapsOnPage = document.querySelectorAll('.gm-style');
        if (mapsOnPage.length > 0) {
          console.log(`⚡ [MapaEmergencial] Encontrados ${mapsOnPage.length} mapas na página`);
        }
        
        // Verificar diferentes formas de acessar o mapa
        if (window.map && typeof window.map.setOptions === 'function') {
          console.log("⚡ [MapaEmergencial] Configurando mapa via API (método 1)");
          configurarMapaExistente(window.map);
        } 
        else if (window.googleMap && typeof window.googleMap.setOptions === 'function') {
          console.log("⚡ [MapaEmergencial] Configurando mapa via API (método 2)");
          configurarMapaExistente(window.googleMap);
        }
        else {
          console.log("⚡ [MapaEmergencial] Não foi possível encontrar instância do mapa");
          
          // Se não conseguimos encontrar o mapa, vamos nos preparar para quando ele for criado
          prepararParaCriacaoMapa();
        }
      } catch (e) {
        console.log("⚡ [MapaEmergencial] Erro ao configurar mapa:", e);
      }
    } else {
      console.log("⚡ [MapaEmergencial] API do Google Maps não detectada");
    }
    
    // Ajustar elementos DOM
    ajustarDOM();
  }
  
  function configurarMapaExistente(mapa) {
    // Configurações para o mapa
    try {
      // Salvar centro e zoom atuais
      const centro = mapa.getCenter();
      const zoom = mapa.getZoom();
      
      // Aplicar configurações
      mapa.setOptions({
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        fullscreenControl: false,
        mapTypeControl: false
      });
      
      // Garantir que o mapa se ajuste ao tamanho atual
      google.maps.event.trigger(mapa, 'resize');
      
      // Restaurar centro e zoom
      mapa.setCenter(centro);
      if (zoom) mapa.setZoom(zoom);
      
      console.log("⚡ [MapaEmergencial] Mapa configurado com sucesso");
    } catch (e) {
      console.log("⚡ [MapaEmergencial] Erro ao configurar mapa existente:", e);
    }
  }
  
  function prepararParaCriacaoMapa() {
    // Monitorar a criação de novos objetos e propriedades que possam ser o mapa
    try {
      // Monitorar quando o window.map for definido
      if (!window.hasOwnProperty('map')) {
        Object.defineProperty(window, 'map', {
          set: function(novoMapa) {
            this._map = novoMapa;
            console.log("⚡ [MapaEmergencial] Novo mapa detectado!");
            setTimeout(function() {
              configurarMapaExistente(novoMapa);
            }, 500);
            return novoMapa;
          },
          get: function() {
            return this._map;
          }
        });
      }
    } catch (e) {
      console.log("⚡ [MapaEmergencial] Erro ao preparar para a criação do mapa:", e);
    }
  }
  
  function ajustarDOM() {
    // Verificar e ajustar diretamente elementos do DOM
    const mapContainer = document.querySelector('.map-container');
    const mapDiv = document.getElementById('map');
    
    if (mapContainer && mapDiv) {
      console.log("⚡ [MapaEmergencial] Elementos do mapa encontrados");
      
      // Ajustar o container do mapa
      mapContainer.style.position = 'absolute';
      mapContainer.style.left = '300px';
      mapContainer.style.right = '0';
      mapContainer.style.top = '0';
      mapContainer.style.bottom = '0';
      mapContainer.style.height = 'auto';
      
      // Ajustar o div do mapa
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      
      console.log("⚡ [MapaEmergencial] Layout do mapa ajustado");
    } else {
      console.log("⚡ [MapaEmergencial] Elementos do mapa não encontrados");
    }
    
    // Garantir que a sidebar esteja correta
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.width = '300px';
      sidebar.style.position = 'fixed';
      sidebar.style.left = '0';
      sidebar.style.top = '0';
      sidebar.style.bottom = '0';
      sidebar.style.overflowY = 'auto';
    }
    
    // Garantir que as abas inferiores estejam corretas
    const bottomTabs = document.querySelector('.bottom-tabs');
    if (bottomTabs) {
      bottomTabs.style.position = 'fixed';
      bottomTabs.style.bottom = '0';
      bottomTabs.style.left = '300px';
      bottomTabs.style.right = '0';
      bottomTabs.style.zIndex = '1000';
    }
    
    // Ajustar botões
    const botoes = document.querySelectorAll('button, .button, .btn, .bottom-tab-button');
    botoes.forEach(botao => {
      if (!botao.hasAttribute('data-estilizado')) {
        botao.style.borderRadius = '50px';
        botao.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
        botao.style.color = '#333';
        botao.style.fontWeight = 'bold';
        botao.style.padding = '10px 20px';
        botao.setAttribute('data-estilizado', 'true');
      }
    });
  }
  
  function correcaoContinua() {
    // Remover elementos indesejados que podem aparecer fora do mapa
    const divsEstranhos = document.querySelectorAll('div[style*="width: 256px; height: 256px"], div[style*="left: -"]');
    divsEstranhos.forEach(div => {
      if (div.parentNode && 
          !div.closest('.map-container') && 
          !div.closest('#map') &&
          div.style.position === 'absolute') {
        div.parentNode.removeChild(div);
      }
    });
    
    // Garantir que o layout permanece correto
    ajustarDOM();
    
    // Verificar se o mapa está disponível para configuração
    if ((window.map && typeof window.map.setOptions === 'function') || 
        (window.googleMap && typeof window.googleMap.setOptions === 'function')) {
      const mapInstance = window.map || window.googleMap;
      
      // Verificar se o mapa tem o controle de Street View
      if (mapInstance && !mapInstance.streetViewControlAdded) {
        try {
          configurarMapaExistente(mapInstance);
          mapInstance.streetViewControlAdded = true;
        } catch (e) {
          // Ignorar erros aqui
        }
      }
    }
  }
})();