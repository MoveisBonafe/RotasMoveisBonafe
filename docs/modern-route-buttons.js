/**
 * Sistema para modernizar o layout dos botões de rotas alternativas
 * Layout compacto e moderno focado apenas na ordenação dos pontos
 */
(function() {
  console.log("✨ [ModernRouteButtons] Inicializando layout moderno para rotas");
  
  window.addEventListener('load', function() {
    setTimeout(aplicarLayoutModerno, 1500);
  });
  
  function aplicarLayoutModerno() {
    // Aplicar CSS moderno APENAS para a sidebar
    const estilosModernos = `
      /* Estilos modernos APENAS para botões de rotas alternativas na SIDEBAR */
      .sidebar .route-option, 
      .sidebar [class*="route"], 
      .sidebar [class*="alternativ"], 
      .sidebar [class*="proximidade"], 
      .sidebar [class*="otimizada"],
      .sidebar [class*="distante"],
      .sidebar button:contains("Proximidade"),
      .sidebar button:contains("Otimizada"),
      .sidebar button:contains("Alternativa"),
      .sidebar button:contains("Distante") {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
        border: 2px solid #FFD700 !important;
        border-radius: 12px !important;
        padding: 12px 16px !important;
        margin: 8px 0 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
        position: relative !important;
      }
      
      .sidebar .route-option:hover,
      .sidebar [class*="route"]:hover,
      .sidebar [class*="alternativ"]:hover,
      .sidebar [class*="proximidade"]:hover,
      .sidebar [class*="otimizada"]:hover,
      .sidebar [class*="distante"]:hover,
      .sidebar button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3) !important;
        border-color: #FFA500 !important;
      }
      
      .sidebar .route-option.active,
      .sidebar [class*="route"].active,
      .sidebar .route-option.selected,
      .sidebar [class*="route"].selected,
      .sidebar button.active,
      .sidebar button.selected {
        background: linear-gradient(135deg, #FFD700, #FFA500) !important;
        color: #333 !important;
        font-weight: bold !important;
      }
      
      /* Ocultar informações de tempo e distância APENAS na sidebar */
      .sidebar .route-option .time-info,
      .sidebar .route-option .distance-info,
      .sidebar [class*="route"] .time-info,
      .sidebar [class*="route"] .distance-info {
        display: none !important;
      }
      
      /* Manter marcador do mapa inalterado */
      .map-container, 
      .gm-style, 
      .gm-style div,
      .gm-style img,
      .gmnoprint {
        /* Preservar estilos originais do mapa */
      }
      
      /* Estilo para títulos de rota APENAS na sidebar */
      .sidebar .route-title {
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #495057 !important;
        margin-bottom: 4px !important;
      }
      
      /* Estilo para lista de pontos APENAS na sidebar */
      .sidebar .route-points {
        font-size: 12px !important;
        color: #6c757d !important;
        line-height: 1.4 !important;
      }
      
      /* Ícones para diferentes tipos de rota APENAS na sidebar */
      .sidebar .route-option::before,
      .sidebar [class*="proximidade"]::before {
        content: "📍" !important;
        margin-right: 8px !important;
        font-size: 16px !important;
      }
      
      .sidebar [class*="otimizada"]::before {
        content: "🎯" !important;
        margin-right: 8px !important;
        font-size: 16px !important;
      }
      
      .sidebar [class*="distante"]::before {
        content: "🛣️" !important;
        margin-right: 8px !important;
        font-size: 16px !important;
      }
      
      .sidebar [class*="alternativ"]::before {
        content: "🔄" !important;
        margin-right: 8px !important;
        font-size: 16px !important;
      }
      
      /* Compactação geral */
      .route-container {
        max-height: 400px !important;
        overflow-y: auto !important;
        padding: 8px !important;
      }
      
      /* Ocultar textos específicos que contém tempo/distância */
      *:contains("km"):not(.route-title):not(.route-points),
      *:contains("min"):not(.route-title):not(.route-points),
      *:contains("h "):not(.route-title):not(.route-points) {
        font-size: 0 !important;
        line-height: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    
    // Adicionar CSS ao documento
    let styleElement = document.getElementById('modern-route-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'modern-route-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = estilosModernos;
    
    // Reestruturar botões existentes
    reestruturarBotoesRota();
    
    console.log("✨ [ModernRouteButtons] Layout moderno aplicado");
  }
  
  function reestruturarBotoesRota() {
    // Procurar por elementos que contenham informações de rota
    const candidatos = document.querySelectorAll('button, .btn, div[role="button"], .route-option');
    
    candidatos.forEach(elemento => {
      const texto = elemento.textContent || '';
      
      // Verificar se é um botão de rota alternativa
      if (texto.includes('Proximidade') || 
          texto.includes('Alternativa') || 
          texto.includes('Otimizada') ||
          texto.includes('Distante') ||
          texto.includes('Rota ')) {
        
        // Adicionar classes modernas
        elemento.classList.add('route-option-modern');
        
        // Extrair apenas o nome da rota e ordenação
        let nomeRota = '';
        if (texto.includes('Proximidade')) nomeRota = 'Proximidade à origem';
        else if (texto.includes('Otimizada')) nomeRota = 'Rota Otimizada';
        else if (texto.includes('Distante')) nomeRota = 'Distante à Origem';
        else if (texto.includes('Alternativa')) nomeRota = 'Rota Alternativa';
        
        // Tentar extrair a ordenação dos pontos
        const ordenacao = extrairOrdenacaoPontos(texto);
        
        // Reestruturar o conteúdo
        if (nomeRota) {
          elemento.innerHTML = `
            <div class="route-title">${nomeRota}</div>
            <div class="route-points">${ordenacao}</div>
          `;
        }
        
        console.log("✨ [ModernRouteButtons] Reestruturado botão:", nomeRota);
      }
    });
  }
  
  function extrairOrdenacaoPontos(texto) {
    // Lista de cidades conhecidas para extrair a ordenação
    const cidadesConhecidas = [
      'Piedade', 'Dois Córregos', 'Ribeirão Preto', 'São Paulo', 
      'Campinas', 'Bauru', 'São Carlos', 'Jaú', 'Botucatu'
    ];
    
    let ordenacao = [];
    
    cidadesConhecidas.forEach(cidade => {
      if (texto.includes(cidade)) {
        ordenacao.push(cidade);
      }
    });
    
    if (ordenacao.length > 0) {
      return ordenacao.join(' → ');
    }
    
    // Fallback: extrair números se houver (como "1", "2", "3")
    const numeros = texto.match(/\d+/g);
    if (numeros && numeros.length > 0) {
      return `${numeros.length} pontos na rota`;
    }
    
    return 'Ordenação otimizada';
  }
  
  // Observar mudanças no DOM para aplicar estilos a novos elementos
  const observer = new MutationObserver((mutations) => {
    let novosElementos = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const texto = node.textContent || '';
            if (texto.includes('Rota') || texto.includes('Proximidade') || 
                texto.includes('Otimizada') || texto.includes('Alternativa')) {
              novosElementos = true;
            }
          }
        });
      }
    });
    
    if (novosElementos) {
      setTimeout(reestruturarBotoesRota, 500);
    }
  });
  
  // Observar mudanças na sidebar
  const sidebar = document.querySelector('.sidebar, #sidebar, body');
  if (sidebar) {
    observer.observe(sidebar, {
      childList: true,
      subtree: true
    });
  }
  
  // Re-aplicar estilos periodicamente
  setInterval(() => {
    const elementos = document.querySelectorAll('.route-option-modern');
    if (elementos.length === 0) {
      reestruturarBotoesRota();
    }
  }, 3000);
  
})();