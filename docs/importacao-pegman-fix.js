/**
 * Script específico para ajustar o tamanho do botão de importação 
 * e adicionar o Pegman (Street View) no mapa
 */
(function() {
  console.log("[ImportacaoPegmanFix] Iniciando ajustes de importação e Pegman");
  
  // Inicializar após carregamento completo
  setTimeout(aplicarAjustes, 1500);
  setInterval(aplicarAjustes, 3000);
  
  function aplicarAjustes() {
    // 1. REDUÇÃO DO TAMANHO DA ÁREA DE IMPORTAÇÃO
    ajustarAreaImportacao();
    
    // 2. HABILITAÇÃO DO PEGMAN (STREET VIEW)
    habilitarPegman();
  }
  
  function ajustarAreaImportacao() {
    // Identificar áreas de importação por diferentes seletores
    const areasImportacao = document.querySelectorAll(
      'input[type="file"], ' +
      '#import-file, ' +
      '.dropzone, ' +
      '.import-area, ' +
      '.import-section'
    );
    
    areasImportacao.forEach(area => {
      // Verificar se é um input de arquivo
      if (area.tagName === 'INPUT' && area.type === 'file') {
        if (!area.hasAttribute('data-compactado')) {
          area.setAttribute('data-compactado', 'true');
          console.log("[ImportacaoPegmanFix] Compactando input file");
          
          // Estilizar o input diretamente
          area.style.maxHeight = '25px';
          area.style.fontSize = '11px';
          area.style.width = '250px';
          
          // Criar container compacto
          const container = document.createElement('div');
          container.className = 'compact-import';
          container.style.border = '1px dashed #FFA500';
          container.style.borderRadius = '10px';
          container.style.padding = '8px';
          container.style.backgroundColor = '#FFF8E1';
          container.style.maxWidth = '280px';
          container.style.margin = '5px auto';
          container.style.boxSizing = 'border-box';
          container.style.textAlign = 'center';
          container.style.maxHeight = '80px';
          container.style.overflow = 'hidden';
          
          // Adicionar ícone
          const icone = document.createElement('div');
          icone.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFA500"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>';
          icone.style.margin = '0 auto 5px auto';
          
          // Adicionar descrição compacta
          const descricao = document.createElement('div');
          descricao.textContent = 'Importar CEPs via arquivo';
          descricao.style.fontSize = '12px';
          descricao.style.fontWeight = 'bold';
          descricao.style.margin = '2px 0';
          
          // Adicionar formato
          const formato = document.createElement('div');
          formato.textContent = 'CEP, Nome';
          formato.style.fontSize = '11px';
          formato.style.color = '#666';
          formato.style.margin = '2px 0 5px 0';
          
          // Substituir pelo container
          const parent = area.parentNode;
          if (parent) {
            parent.insertBefore(container, area);
            container.appendChild(icone);
            container.appendChild(descricao);
            container.appendChild(formato);
            container.appendChild(area);
          }
        }
      } else {
        // Se não for input, é um container
        area.style.maxHeight = '80px';
        area.style.maxWidth = '280px';
        area.style.margin = '5px auto';
        area.style.padding = '8px';
        area.style.overflow = 'hidden';
      }
    });
  }
  
  function habilitarPegman() {
    try {
      // Verificar se o mapa existe
      if (window.map && typeof window.map.setOptions === 'function') {
        // Habilitar Street View
        window.map.setOptions({
          streetViewControl: true,  // Habilitar Pegman
          fullscreenControl: false, // Manter controle de tela cheia desabilitado
          zoomControl: false,       // Manter controle de zoom desabilitado
          mapTypeControl: false     // Manter controle de tipo de mapa desabilitado
        });
        console.log("[ImportacaoPegmanFix] Street View habilitado no mapa");
      } else {
        // Tenta encontrar a instância do mapa pela variável global
        if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
          // Procurar o elemento do mapa
          const mapElement = document.getElementById('map');
          if (mapElement) {
            // Verificar se há uma instância de mapa associada
            const mapsInstances = google.maps.Map.instances;
            if (mapsInstances && mapsInstances.length > 0) {
              // Usar a primeira instância encontrada
              mapsInstances[0].setOptions({
                streetViewControl: true,
                fullscreenControl: false,
                zoomControl: false,
                mapTypeControl: false
              });
              console.log("[ImportacaoPegmanFix] Street View habilitado via instância alternativa");
            }
          }
        }
      }
      
      // Ajustar diretamente o Street View caso exista o controle
      const streetViewControl = document.querySelector('.gm-svpc');
      if (streetViewControl) {
        console.log("[ImportacaoPegmanFix] Controle Street View encontrado");
        streetViewControl.style.display = 'block';
        streetViewControl.style.visibility = 'visible';
        streetViewControl.style.opacity = '1';
      }
    } catch (e) {
      console.warn("[ImportacaoPegmanFix] Erro ao habilitar Street View:", e);
    }
    
    // Injetar CSS para preservar controle Street View
    if (!document.getElementById('pegman-css')) {
      const pegmanCSS = document.createElement('style');
      pegmanCSS.id = 'pegman-css';
      pegmanCSS.textContent = `
        /* Preservar o controle Street View enquanto esconde outros */
        .gm-svpc {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Esconder outros controles */
        .gm-fullscreen-control,
        .gm-style-cc {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `;
      document.head.appendChild(pegmanCSS);
      console.log("[ImportacaoPegmanFix] CSS para preservar Street View adicionado");
    }
  }
})();