/**
 * Script para corrigir as dimensões do mapa que está expandido além da área permitida
 * Isso garante que todos os elementos fiquem visíveis e que o mapa tenha o tamanho correto
 */
(function() {
  console.log("[CorrecaoDimensoesMapa] Iniciando correção de dimensões do mapa");
  
  // Executar imediatamente e depois de um curto período para garantir aplicação
  ajustarDimensoes();
  setTimeout(ajustarDimensoes, 1000);
  setTimeout(ajustarDimensoes, 3000);
  setInterval(verificarAjustes, 5000);
  
  /**
   * Ajusta as dimensões do mapa para se adequar à área disponível
   */
  function ajustarDimensoes() {
    console.log("[CorrecaoDimensoesMapa] Ajustando dimensões do mapa");
    
    // 1. Ajustar container principal
    const container = document.querySelector('.container');
    if (container) {
      container.style.overflow = 'hidden';
      container.style.height = '100vh';
      container.style.width = '100vw';
      container.style.position = 'relative';
      container.style.margin = '0';
      container.style.padding = '0';
    }
    
    // 2. Ajustar sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.position = 'absolute';
      sidebar.style.top = '0';
      sidebar.style.left = '0';
      sidebar.style.width = '300px';
      sidebar.style.height = '100vh';
      sidebar.style.overflowY = 'auto';
      sidebar.style.zIndex = '10';
      sidebar.style.margin = '0';
      sidebar.style.padding = '15px';
      sidebar.style.boxSizing = 'border-box';
    }
    
    // 3. Ajustar container do mapa
    const mapaContainer = document.querySelector('.map-container, #map-container');
    if (mapaContainer) {
      mapaContainer.style.position = 'absolute';
      mapaContainer.style.top = '0';
      mapaContainer.style.left = '300px';
      mapaContainer.style.width = 'calc(100% - 300px)';
      mapaContainer.style.height = '100vh';
      mapaContainer.style.margin = '0';
      mapaContainer.style.padding = '0';
      mapaContainer.style.overflow = 'hidden';
    }
    
    // 4. Ajustar o elemento do mapa
    const mapa = document.getElementById('map');
    if (mapa) {
      mapa.style.width = '100%';
      mapa.style.height = '100%';
      mapa.style.margin = '0';
      mapa.style.padding = '0';
    }
    
    // 5. Ajustar as abas inferiores
    const abasInferiores = document.querySelector('.bottom-tabs, #bottom-tabs');
    if (abasInferiores) {
      abasInferiores.style.position = 'absolute';
      abasInferiores.style.bottom = '0';
      abasInferiores.style.left = '300px';
      abasInferiores.style.width = 'calc(100% - 300px)';
      abasInferiores.style.zIndex = '100';
      abasInferiores.style.borderTopLeftRadius = '25px';
      abasInferiores.style.borderTopRightRadius = '25px';
      abasInferiores.style.overflow = 'hidden';
      abasInferiores.style.backgroundColor = '#f8f9fa';
      abasInferiores.style.boxShadow = '0 -2px 5px rgba(0,0,0,0.1)';
    }
    
    // 6. Forçar redimensionamento do mapa se a API estiver disponível
    if (window.google && google.maps && window.map) {
      try {
        google.maps.event.trigger(window.map, 'resize');
        console.log("[CorrecaoDimensoesMapa] Mapa redimensionado via API");
      } catch (e) {
        console.warn("[CorrecaoDimensoesMapa] Erro ao acionar resize:", e);
      }
    }
    
    // 7. Adicionar estilos CSS gerais para garantir dimensões corretas
    adicionarEstilosCSS();
    
    // 8. Corrigir posicionamento de controles do mapa
    corrigirControlesMapa();
  }
  
  /**
   * Adiciona estilos CSS para garantir as dimensões corretas
   */
  function adicionarEstilosCSS() {
    // Verificar se já adicionamos os estilos
    if (document.getElementById('correcao-dimensoes-css')) {
      return;
    }
    
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.id = 'correcao-dimensoes-css';
    style.textContent = `
      /* Estilos base para garantir dimensões corretas */
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      
      /* Estrutura principal */
      .container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;
        margin: 0;
        padding: 0;
      }
      
      /* Sidebar */
      .sidebar {
        position: absolute;
        top: 0;
        left: 0;
        width: 300px;
        height: 100vh;
        overflow-y: auto;
        z-index: 10;
        box-sizing: border-box;
        padding: 15px;
        margin: 0;
      }
      
      /* Container do mapa */
      .map-container, #map-container {
        position: absolute;
        top: 0;
        left: 300px;
        width: calc(100% - 300px);
        height: 100vh;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      
      /* Elemento do mapa */
      #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      
      /* Abas inferiores */
      .bottom-tabs, #bottom-tabs {
        position: absolute;
        bottom: 0;
        left: 300px;
        width: calc(100% - 300px);
        z-index: 100;
        border-top-left-radius: 25px;
        border-top-right-radius: 25px;
        overflow: hidden;
        background-color: #f8f9fa;
        box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
      }
      
      /* Controles e ícones do mapa */
      .gmnoprint, .gm-style-cc, .gm-control-active, .gm-svpc {
        transform: scale(1);
        opacity: 1;
        visibility: visible;
      }
      
      /* Posicionamento específico dos controles */
      .gm-svpc {
        position: fixed;
        top: 30px;
        right: 30px;
        z-index: 999;
      }
      
      /* Garantir que os controles apareçam */
      [class*="gm-"] {
        display: block !important;
        visibility: visible !important;
      }
      
      /* Containers personalizados para ícones */
      .pegman-container-fixo {
        position: absolute;
        top: 30px;
        right: 30px;
        z-index: 999;
        background-color: #FFF8E1;
        border: 2px solid #FFA500;
        border-radius: 50%;
        padding: 5px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      
      /* Painel de controles personalizados */
      .controles-personalizados {
        position: absolute;
        top: 30px;
        left: 30px;
        z-index: 999;
        background-color: #FFF8E1;
        border: 2px solid #FFA500;
        border-radius: 10px;
        padding: 5px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
    `;
    document.head.appendChild(style);
    
    console.log("[CorrecaoDimensoesMapa] Estilos CSS adicionados");
  }
  
  /**
   * Corrige o posicionamento dos controles do mapa
   */
  function corrigirControlesMapa() {
    console.log("[CorrecaoDimensoesMapa] Corrigindo posicionamento dos controles");
    
    // 1. Botão do Pegman (Street View)
    const pegman = document.querySelector('.gm-svpc');
    if (pegman) {
      // Verificar se já está em um container personalizado
      const containerPegman = pegman.closest('.pegman-container-fixo');
      if (!containerPegman) {
        // Criar container para o Pegman
        const container = document.createElement('div');
        container.className = 'pegman-container-fixo';
        
        // Remover do local atual
        if (pegman.parentNode) {
          try {
            pegman.parentNode.removeChild(pegman);
          } catch (e) {
            console.warn("[CorrecaoDimensoesMapa] Não foi possível remover Pegman:", e);
          }
        }
        
        // Adicionar ao novo container
        container.appendChild(pegman);
        
        // Adicionar ao mapa
        const mapaElement = document.getElementById('map');
        if (mapaElement) {
          mapaElement.appendChild(container);
        }
      }
    }
    
    // 2. Outros controles
    document.querySelectorAll('.gmnoprint').forEach(controle => {
      // Verificar se não é o Pegman
      if (!controle.innerHTML.includes('pegman') && !controle.querySelector('.gm-svpc')) {
        controle.style.display = 'block';
        controle.style.visibility = 'visible';
        controle.style.opacity = '1';
        
        // Se estiver fora da visualização, mover para posição visível
        const rect = controle.getBoundingClientRect();
        if (rect.top < 0 || rect.left < 0 || 
            rect.bottom > window.innerHeight || rect.right > window.innerWidth) {
          
          controle.style.position = 'absolute';
          controle.style.top = '90px';
          controle.style.left = '30px';
          controle.style.zIndex = '999';
        }
      }
    });
    
    // 3. Controles de zoom
    const zoomControles = document.querySelectorAll('[class*="zoom"], .gm-control-active');
    zoomControles.forEach(controle => {
      controle.style.display = 'block';
      controle.style.visibility = 'visible';
      controle.style.opacity = '1';
    });
  }
  
  /**
   * Verifica periodicamente se os ajustes ainda estão aplicados
   */
  function verificarAjustes() {
    // Verificar dimensões do container do mapa
    const mapaContainer = document.querySelector('.map-container, #map-container');
    if (mapaContainer) {
      const estilo = window.getComputedStyle(mapaContainer);
      if (estilo.width !== `calc(100% - 300px)` || estilo.left !== '300px') {
        console.log("[CorrecaoDimensoesMapa] Detectada alteração nas dimensões, reaplicando ajustes");
        ajustarDimensoes();
      }
    }
    
    // Verificar posição dos controles
    const pegman = document.querySelector('.gm-svpc');
    if (pegman && !pegman.closest('.pegman-container-fixo')) {
      console.log("[CorrecaoDimensoesMapa] Pegman fora do container, reposicionando");
      corrigirControlesMapa();
    }
  }
})();