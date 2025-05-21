/**
 * Correção emergencial para centralização do mapa
 * Abordagem mais direta e eficaz
 */
(function() {
  console.log("[MapaCorrecao] Iniciando correção para centralização do mapa");
  
  // Executar logo após carregamento inicial e a cada poucos segundos 
  // até garantir que o mapa esteja exibido corretamente
  const intervalos = [500, 1500, 3000, 5000, 8000];
  intervalos.forEach(tempo => {
    setTimeout(centrarMapa, tempo);
  });
  
  function centrarMapa() {
    console.log("[MapaCorrecao] Tentando centralizar o mapa");
    
    // Pegar o container principal do mapa
    const container = document.querySelector('.container');
    const sidebar = document.querySelector('.sidebar');
    const mapContainer = document.querySelector('.map-container');
    const mapDiv = document.getElementById('map');
    
    if (!container || !sidebar || !mapContainer || !mapDiv) {
      console.log("[MapaCorrecao] Elementos do mapa não encontrados, tentando novamente mais tarde");
      return;
    }
    
    // Ajustar o layout principal com CSS inline para garantir aplicação
    container.style.display = 'flex';
    container.style.height = '100vh';
    container.style.width = '100%';
    container.style.overflow = 'hidden';
    
    // Ajustar a sidebar
    sidebar.style.width = '300px';
    sidebar.style.minWidth = '300px';
    sidebar.style.height = '100vh';
    sidebar.style.overflowY = 'auto';
    sidebar.style.overflowX = 'auto';
    sidebar.style.position = 'fixed';
    sidebar.style.left = '0';
    sidebar.style.top = '0';
    sidebar.style.zIndex = '1000';
    sidebar.style.padding = '15px';
    sidebar.style.boxShadow = '2px 0 10px rgba(0,0,0,0.1)';
    sidebar.style.background = '#f8f9fa';
    
    // Ajustar o container do mapa para ocupar toda a largura disponível
    mapContainer.style.position = 'fixed';
    mapContainer.style.top = '0';
    mapContainer.style.left = '300px';
    mapContainer.style.right = '0';
    mapContainer.style.bottom = '60px'; // Espaço para as abas inferiores
    mapContainer.style.width = 'auto';
    mapContainer.style.height = 'auto';
    
    // Ajustar o div do mapa para ocupar todo o espaço
    mapDiv.style.height = '100%';
    mapDiv.style.width = '100%';
    
    // Ajustar as abas inferiores para não cobrir o mapa
    const bottomTabs = document.querySelector('.bottom-tabs');
    if (bottomTabs) {
      bottomTabs.style.position = 'fixed';
      bottomTabs.style.bottom = '0';
      bottomTabs.style.left = '300px';
      bottomTabs.style.right = '0';
      bottomTabs.style.zIndex = '1000';
      bottomTabs.style.background = 'rgba(248, 249, 250, 0.95)';
    }
    
    // Se conseguirmos acessar a API do Google Maps, ajustar configurações
    if (window.google && window.google.maps && window.map) {
      try {
        console.log("[MapaCorrecao] Reconhecido objeto Google Maps - ajustando configurações");
        
        // Salvar o centro atual
        const centro = window.map.getCenter();
        
        // Habilitar o Pegman (Street View)
        window.map.setOptions({
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });
        
        // Esconder outros controles que não precisamos
        window.map.setOptions({
          fullscreenControl: false,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
          }
        });
        
        // Trigger de redimensionamento para recalcular o layout
        google.maps.event.trigger(window.map, 'resize');
        
        // Restaurar centro
        window.map.setCenter(centro);
        
        console.log("[MapaCorrecao] Pegman (Street View) adicionado ao mapa");
      } catch (e) {
        console.log("[MapaCorrecao] Erro ao configurar o mapa:", e);
      }
    }
    
    // Solução para remover ou ocultar divs estranhos gerados pelo Google Maps
    setTimeout(function() {
      const divsEstranhos = document.querySelectorAll('div[style*="width: 256px; height: 256px"], div[style*="position: absolute"]');
      divsEstranhos.forEach(div => {
        // Se estiverem fora do container do mapa, remover completamente
        if (div.parentNode && 
            !div.closest('.map-container') && 
            !div.closest('#map') &&
            div.style.position === 'absolute') {
          console.log("[MapaCorrecao] Removendo div estranho do Google Maps fora do container");
          div.parentNode.removeChild(div);
        }
      });
      
      // Também remover divs com valores negativos de left e top
      const divsNegativos = document.querySelectorAll('div[style*="left: -"]');
      divsNegativos.forEach(div => {
        if (div.parentNode && 
            !div.closest('.map-container') && 
            !div.closest('#map')) {
          console.log("[MapaCorrecao] Removendo div com posição negativa");
          div.parentNode.removeChild(div);
        }
      });
    }, 500);
    
    // Garantir que o mapa permaneça fixo e estável
    const body = document.body;
    body.style.overflow = 'hidden';
    body.style.position = 'relative';
    body.style.width = '100%';
    body.style.height = '100vh';
    
    console.log("[MapaCorrecao] Mapa centralizado com sucesso");
  }
  
  // Observar mudanças no DOM para reajustar se necessário
  const observer = new MutationObserver(function(mutations) {
    centrarMapa();
  });
  
  // Observar o body para qualquer alteração significativa
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
})();
