/**
 * Script para ajustes específicos no mapa:
 * - Adicionar o Pegman (Street View)
 * - Remover controles indesejados
 */
(function() {
  console.log("🚶‍♂️ [PegmanFix] Inicializando ajustes para adicionar Pegman");
  
  // Executar após o carregamento da página e da API do Google Maps
  window.addEventListener('load', iniciarAjustes);
  setTimeout(iniciarAjustes, 1000);
  setTimeout(iniciarAjustes, 3000);
  setInterval(verificarMapa, 5000); // Verificar periodicamente
  
  function iniciarAjustes() {
    console.log("🚶‍♂️ [PegmanFix] Tentando ajustar o mapa");
    
    // Verificar se a API do Google Maps está disponível
    if (!window.google || !window.google.maps) {
      console.log("🚶‍♂️ [PegmanFix] API do Google Maps ainda não disponível");
      return;
    }
    
    // Tentar encontrar o objeto do mapa
    let mapaInstance = null;
    
    // Verificar várias possíveis localizações do objeto mapa
    if (window.map && typeof window.map.setOptions === 'function') {
      mapaInstance = window.map;
    } else if (window.googleMap && typeof window.googleMap.setOptions === 'function') {
      mapaInstance = window.googleMap;
    } else {
      // Tentar encontrar elementos do mapa no DOM
      const mapElements = document.querySelectorAll('.gm-style');
      if (mapElements.length > 0) {
        console.log("🚶‍♂️ [PegmanFix] Encontrados elementos do mapa, mas não o objeto do mapa");
      }
      
      console.log("🚶‍♂️ [PegmanFix] Objeto do mapa não encontrado");
      return;
    }
    
    try {
      // Guardar centro atual do mapa
      const centro = mapaInstance.getCenter();
      
      // Configurar controles do mapa
      mapaInstance.setOptions({
        streetViewControl: true,                    // Ativar o Pegman
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        zoomControl: false,                         // Desativar controles de zoom
        mapTypeControl: false,                      // Desativar seletor de tipo de mapa
        fullscreenControl: false                    // Desativar botão de tela cheia
      });
      
      // Forçar atualização do layout
      google.maps.event.trigger(mapaInstance, 'resize');
      
      // Restaurar centro
      mapaInstance.setCenter(centro);
      
      console.log("🚶‍♂️ [PegmanFix] Pegman adicionado com sucesso!");
    } catch (erro) {
      console.log("🚶‍♂️ [PegmanFix] Erro ao configurar mapa:", erro);
    }
  }
  
  function verificarMapa() {
    // Verificar periodicamente se o mapa está disponível
    if (window.google && window.google.maps) {
      if (window.map && typeof window.map.setOptions === 'function') {
        iniciarAjustes();
      }
    }
    
    // Verificar botões para aplicar estilos
    const botoes = document.querySelectorAll('button, .button, .btn, .bottom-tab-button');
    botoes.forEach(function(botao) {
      botao.style.backgroundColor = "#FFD700";
      botao.style.borderRadius = "50px";
      botao.style.color = "#333";
      botao.style.fontWeight = "bold";
      botao.style.border = "none";
    });
    
    // Garantir que o botão Otimizar tenha a cor amarela
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      botaoOtimizar.style.backgroundColor = "#FFD700";
    }
    
    // Fundo branco para as abas inferiores
    const tabsContainer = document.querySelector('.bottom-tabs');
    if (tabsContainer) {
      tabsContainer.style.backgroundColor = "#FFFFFF";
    }
    
    // Abas de conteúdo
    const tabContents = document.querySelectorAll('.bottom-tab-content');
    tabContents.forEach(function(content) {
      content.style.backgroundColor = "#FFFFFF";
    });
  }
})();