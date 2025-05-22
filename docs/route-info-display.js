/**
 * Mostrador de informações de rota no mapa
 * Exibe tempo e distância diretamente no mapa em uma caixa flutuante
 */
(function() {
  console.log("📊 [RouteInfo] Inicializando mostrador de informações de rota");
  
  // Executar depois que a página for carregada
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1000); // Backup para garantir que o DOM esteja pronto
  
  function inicializar() {
    console.log("📊 [RouteInfo] Inicializando mostrador...");
    
    // Criar o mostrador de informações
    criarMostrador();
    
    // Monitorar clique no botão Visualizar
    monitorarBotaoVisualizar();
    
    // Atualizar o mostrador periodicamente (caso o usuário atualize a rota por outros meios)
    setInterval(atualizarInformacoes, 3000);
  }
  
  // Criar o mostrador de informações no mapa
  function criarMostrador() {
    // Verificar se o mostrador já existe
    if (document.getElementById('route-info-display')) {
      return;
    }
    
    // Criar o elemento do mostrador
    const mostrador = document.createElement('div');
    mostrador.id = 'route-info-display';
    mostrador.innerHTML = `
      <div class="route-info-header">Resumo da Rota</div>
      <div class="route-info-content">
        <div class="route-info-item">
          <span class="route-info-icon">📏</span>
          <span class="route-info-label">Distância:</span>
          <span class="route-info-value" id="route-info-distance">--</span>
        </div>
        <div class="route-info-item">
          <span class="route-info-icon">⏱️</span>
          <span class="route-info-label">Tempo:</span>
          <span class="route-info-value" id="route-info-time">--</span>
        </div>
      </div>
    `;
    
    // Estilizar o mostrador
    mostrador.style.position = 'fixed';
    mostrador.style.top = '10px';
    mostrador.style.right = '10px';
    mostrador.style.backgroundColor = 'white';
    mostrador.style.padding = '10px';
    mostrador.style.borderRadius = '8px';
    mostrador.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    mostrador.style.zIndex = '999';
    mostrador.style.minWidth = '200px';
    mostrador.style.fontFamily = 'Arial, sans-serif';
    mostrador.style.fontSize = '14px';
    
    // Estilizar o cabeçalho
    const estiloCSS = document.createElement('style');
    estiloCSS.textContent = `
      .route-info-header {
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: #333;
        font-weight: bold;
        padding: 5px 10px;
        margin: -10px -10px 10px -10px;
        border-radius: 8px 8px 0 0;
        text-align: center;
      }
      
      .route-info-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .route-info-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .route-info-icon {
        font-size: 16px;
      }
      
      .route-info-label {
        font-weight: bold;
        color: #555;
      }
      
      .route-info-value {
        margin-left: auto;
        color: #333;
        font-weight: bold;
      }
    `;
    
    // Adicionar o CSS ao head
    document.head.appendChild(estiloCSS);
    
    // Adicionar o mostrador ao mapa
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.appendChild(mostrador);
      console.log("📊 [RouteInfo] Mostrador criado com sucesso");
    } else {
      console.log("📊 [RouteInfo] Container do mapa não encontrado");
      // Tentar adicionar ao body como fallback
      document.body.appendChild(mostrador);
    }
  }
  
  // Monitorar clique no botão Visualizar
  function monitorarBotaoVisualizar() {
    // Botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    if (botaoVisualizar) {
      botaoVisualizar.addEventListener('click', function() {
        console.log("📊 [RouteInfo] Botão Visualizar clicado, aguardando atualização de rota...");
        // Aguardar um momento para que o sistema calcule a rota
        setTimeout(atualizarInformacoes, 1000);
        setTimeout(atualizarInformacoes, 2000);
        setTimeout(atualizarInformacoes, 3000);
      });
      console.log("📊 [RouteInfo] Monitoramento do botão Visualizar configurado");
    } else {
      console.log("📊 [RouteInfo] Botão Visualizar não encontrado");
    }
    
    // Botão Otimizar também atualiza a rota
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      botaoOtimizar.addEventListener('click', function() {
        console.log("📊 [RouteInfo] Botão Otimizar clicado, aguardando atualização de rota...");
        // Aguardar um momento para que o sistema calcule a rota
        setTimeout(atualizarInformacoes, 1000);
        setTimeout(atualizarInformacoes, 2000);
        setTimeout(atualizarInformacoes, 3000);
      });
      console.log("📊 [RouteInfo] Monitoramento do botão Otimizar configurado");
    }
  }
  
  // Atualizar as informações do mostrador
  function atualizarInformacoes() {
    console.log("📊 [RouteInfo] Buscando informações atualizadas da rota...");
    
    // Extrair informações do relatório de rota
    const distanciaElement = document.querySelector('.bottom-tab-content#bottom-info p:contains("Distância total")');
    const tempoElement = document.querySelector('.bottom-tab-content#bottom-info p:contains("Tempo estimado")');
    
    let distancia = "--";
    let tempo = "--";
    
    // Fallback com querySelector padrão e filtro de texto
    if (!distanciaElement || !tempoElement) {
      const paragrafos = document.querySelectorAll('.bottom-tab-content#bottom-info p');
      paragrafos.forEach(p => {
        const texto = p.textContent || '';
        if (texto.includes('Distância total')) {
          const match = texto.match(/Distância total:\s*([\d.,]+)\s*km/);
          if (match && match[1]) {
            distancia = match[1] + ' km';
          }
        } else if (texto.includes('Tempo estimado')) {
          const match = texto.match(/Tempo estimado:\s*(\d+)h\s*(\d+)min/);
          if (match && match[1] && match[2]) {
            tempo = match[1] + 'h ' + match[2] + 'min';
          }
        }
      });
    } else {
      // Extração se o jQuery-like selector funcionar
      distancia = distanciaElement.textContent.replace('Distância total:', '').trim();
      tempo = tempoElement.textContent.replace('Tempo estimado:', '').trim();
    }
    
    // Verificar também os elementos do resumo da rota
    // Buscar todos os elementos e filtrar pelo texto
    const todosElementos = document.querySelectorAll('#bottom-info p');
    
    if (distancia === "--") {
      todosElementos.forEach(elem => {
        const texto = elem.textContent || '';
        if (texto.includes('Distância total')) {
          const match = texto.match(/Distância total:?\s*([\d.,]+)\s*km/i);
          if (match && match[1]) {
            distancia = match[1] + ' km';
          }
        }
      });
    }
    
    if (tempo === "--") {
      todosElementos.forEach(elem => {
        const texto = elem.textContent || '';
        if (texto.includes('Tempo estimado')) {
          const match = texto.match(/Tempo estimado:?\s*(\d+)h\s*(\d+)min/i);
          if (match && match[1] && match[2]) {
            tempo = match[1] + 'h ' + match[2] + 'min';
          } else {
            // Tentar o formato alternativo
            const matchMinutos = texto.match(/Tempo estimado:?\s*(\d+)min/i);
            if (matchMinutos && matchMinutos[1]) {
              tempo = matchMinutos[1] + 'min';
            }
          }
        }
      });
    }
    
    // Verificar também o elemento específico do resumo
    const resumoDistanciaSimples = document.querySelector('#bottom-info .route-info');
    if (resumoDistanciaSimples && distancia === "--") {
      const texto = resumoDistanciaSimples.textContent || '';
      const matchDist = texto.match(/Distância total:\s*([\d.,]+)\s*km/);
      if (matchDist && matchDist[1]) {
        distancia = matchDist[1] + ' km';
      }
      
      const matchTempo = texto.match(/Tempo estimado:\s*(\d+)h\s*(\d+)min/);
      if (matchTempo && matchTempo[1] && matchTempo[2]) {
        tempo = matchTempo[1] + 'h ' + matchTempo[2] + 'min';
      }
    }
    
    // Buscar também no elemento route-info
    const routeInfoElement = document.getElementById('route-info');
    if (routeInfoElement && (distancia === "--" || tempo === "--")) {
      const texto = routeInfoElement.textContent || '';
      
      // Distância
      if (distancia === "--") {
        const matchDist = texto.match(/Distância total:\s*([\d.,]+)\s*km/);
        if (matchDist && matchDist[1]) {
          distancia = matchDist[1] + ' km';
        } else {
          // Buscar no formato específico da imagem exemplo
          const matchDistAlt = texto.match(/Distância total: ([\d.,]+) km/);
          if (matchDistAlt && matchDistAlt[1]) {
            distancia = matchDistAlt[1] + ' km';
          }
        }
      }
      
      // Tempo
      if (tempo === "--") {
        const matchTempo = texto.match(/Tempo estimado:\s*(\d+)h\s*(\d+)min/);
        if (matchTempo && matchTempo[1] && matchTempo[2]) {
          tempo = matchTempo[1] + 'h ' + matchTempo[2] + 'min';
        } else {
          // Buscar no formato específico da imagem exemplo (apenas minutos)
          const matchTempoMinutos = texto.match(/Tempo estimado: (\d+)min/);
          if (matchTempoMinutos && matchTempoMinutos[1]) {
            tempo = matchTempoMinutos[1] + 'min';
          }
        }
      }
    }
    
    // Buscar no formato específico mostrado na imagem exemplo
    if (distancia === "--" || tempo === "--") {
      // Procurar elementos específicos
      const distanciaTotal = document.querySelector('*:contains("Distância total:")');
      const tempoEstimado = document.querySelector('*:contains("Tempo estimado:")');
      
      if (distanciaTotal && distancia === "--") {
        const textoDistancia = distanciaTotal.textContent;
        const matchDistancia = textoDistancia.match(/Distância total: ([\d.,]+) km/);
        if (matchDistancia && matchDistancia[1]) {
          distancia = matchDistancia[1] + ' km';
        }
      }
      
      if (tempoEstimado && tempo === "--") {
        const textoTempo = tempoEstimado.textContent;
        const matchTempo = textoTempo.match(/Tempo estimado: (\d+)min/);
        if (matchTempo && matchTempo[1]) {
          tempo = matchTempo[1] + 'min';
        }
      }
    }
    
    // Atualizar o mostrador com as informações encontradas
    const distanciaDisplay = document.getElementById('route-info-distance');
    const tempoDisplay = document.getElementById('route-info-time');
    
    if (distanciaDisplay) {
      distanciaDisplay.textContent = distancia;
    }
    
    if (tempoDisplay) {
      tempoDisplay.textContent = tempo;
    }
    
    console.log(`📊 [RouteInfo] Informações atualizadas - Distância: ${distancia}, Tempo: ${tempo}`);
  }
})();