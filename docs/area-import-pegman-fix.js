/**
 * Script para corrigir área de importação redundante e 
 * adicionar o Pegman (Street View) ao mapa
 */
(function() {
  console.log("[AreaImportPegmanFix] Iniciando correções para área de importação e Pegman");
  
  // Executar após um período para garantir carregamento completo
  setTimeout(aplicarCorrecoes, 1000);
  setTimeout(aplicarCorrecoes, 3000); 
  setInterval(aplicarCorrecoes, 5000); // Continuar verificando periodicamente
  
  function aplicarCorrecoes() {
    corrigirAreaImportacao();
    habilitarPegmanNoMapa();
  }
  
  /**
   * Corrige a área de importação para remover redundâncias
   */
  function corrigirAreaImportacao() {
    console.log("[AreaImportPegmanFix] Verificando área de importação");
    
    // Remover containers aninhados (redundantes)
    const containersAninhados = document.querySelectorAll('.compact-import .compact-import, .import-container .import-container');
    containersAninhados.forEach(container => {
      if (container.parentNode) {
        console.log("[AreaImportPegmanFix] Removendo container aninhado");
        
        // Mover o input para o container pai
        const inputFile = container.querySelector('input[type="file"]');
        if (inputFile && container.parentNode) {
          container.parentNode.appendChild(inputFile);
          container.parentNode.removeChild(container);
        } else {
          // Se não tiver input, apenas remover
          container.parentNode.removeChild(container);
        }
      }
    });
    
    // Estilizar containers de importação
    document.querySelectorAll('.import-container, .dropzone, .import-area').forEach(container => {
      container.style.maxHeight = '90px';
      container.style.maxWidth = '280px';
      container.style.margin = '0 auto';
      container.style.border = '1px dashed #FFA500';
      container.style.borderRadius = '10px';
      container.style.padding = '10px';
      container.style.boxSizing = 'border-box';
      container.style.backgroundColor = '#FFF8E1';
      container.style.textAlign = 'center';
    });
    
    // Estilizar inputs de arquivo
    document.querySelectorAll('input[type="file"], #import-file').forEach(input => {
      input.style.maxHeight = '25px';
      input.style.fontSize = '12px';
      input.style.width = '90%';
      input.style.margin = '0 auto';
    });
    
    // Remover textos duplicados
    document.querySelectorAll('.compact-import .compact-import, .import-container .import-container').forEach(container => {
      // Manter apenas um heading por container
      const titulos = container.querySelectorAll('h3, h4, .heading, .title');
      if (titulos.length > 1) {
        for (let i = 1; i < titulos.length; i++) {
          titulos[i].parentNode.removeChild(titulos[i]);
        }
      }
    });
  }
  
  /**
   * Habilita o Pegman (controle do Street View) no mapa
   */
  function habilitarPegmanNoMapa() {
    console.log("[AreaImportPegmanFix] Tentando habilitar Pegman (Street View)");
    
    try {
      // Abordagem 1: Usar a API do Google Maps diretamente
      if (window.google && google.maps) {
        // Tentar obter a instância do mapa
        const mapElement = document.getElementById('map');
        if (mapElement) {
          // Tentar encontrar a instância do mapa no elemento
          const mapa = window.map || null;
          
          if (mapa && typeof mapa.setOptions === 'function') {
            mapa.setOptions({
              streetViewControl: true,         // Habilitar Pegman
              fullscreenControl: false,        // Manter desabilitado
              zoomControl: false,              // Manter desabilitado
              mapTypeControl: false            // Manter desabilitado
            });
            console.log("[AreaImportPegmanFix] Sucesso: Pegman habilitado via API");
          } else {
            console.log("[AreaImportPegmanFix] Instância do mapa não encontrada, tentando alternativas");
          }
        }
      }
    } catch (e) {
      console.warn("[AreaImportPegmanFix] Erro ao habilitar Pegman via API:", e);
    }
    
    // Abordagem 2: Manipular o DOM diretamente
    try {
      // Remover todos os estilos que escondem o Pegman
      const novoEstilo = document.createElement('style');
      novoEstilo.textContent = `
        /* Garantir que o Pegman fique visível */
        .gm-svpc, div[title="Pegman"], div[title="Street View"] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Mantar todos os outros controles escondidos */
        .gm-fullscreen-control,
        .gm-style-cc,
        .gmnoprint:not(.gm-svpc) {
          display: none !important;
        }
      `;
      document.head.appendChild(novoEstilo);
      
      // Restaurar o controle do Street View se existir e estiver oculto
      const streetViewControls = document.querySelectorAll('.gm-svpc, [title="Pegman"], [title="Street View"]');
      streetViewControls.forEach(control => {
        control.style.display = 'block';
        control.style.visibility = 'visible';
        control.style.opacity = '1';
        console.log("[AreaImportPegmanFix] Controle Street View restaurado via DOM");
      });
    } catch (e) {
      console.warn("[AreaImportPegmanFix] Erro ao restaurar Pegman via DOM:", e);
    }
    
    // Abordagem 3: Tentar adicionar o controle diretamente
    try {
      if (window.google && google.maps && typeof google.maps.StreetViewControlOptions === 'function') {
        const mapDiv = document.getElementById('map');
        if (mapDiv && window.map) {
          const streetViewControlOptions = {
            position: google.maps.ControlPosition.RIGHT_TOP
          };
          window.map.setOptions({
            streetViewControl: true,
            streetViewControlOptions: streetViewControlOptions
          });
          console.log("[AreaImportPegmanFix] Controle Street View adicionado com posição personalizada");
        }
      }
    } catch (e) {
      console.warn("[AreaImportPegmanFix] Erro ao adicionar controle Street View:", e);
    }
  }
})();