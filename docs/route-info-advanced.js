/**
 * Sistema avançado de detecção de informações de rota
 * Nova abordagem que monitora mudanças no DOM e usa múltiplas estratégias
 */
(function() {
  console.log("🚀 [RouteInfoAdvanced] Inicializando sistema avançado de detecção de rota");
  
  let observerDOM = null;
  let ultimaAtualizacao = 0;
  
  // Inicializar quando a página carregar
  window.addEventListener('load', inicializar);
  document.addEventListener('DOMContentLoaded', inicializar);
  setTimeout(inicializar, 1000);
  
  function inicializar() {
    console.log("🚀 [RouteInfoAdvanced] Inicializando...");
    
    criarMostradorAvancado();
    configurarMonitoramento();
    iniciarObservadorDOM();
    
    // Primeira busca imediata
    setTimeout(buscarInformacoesRota, 500);
  }
  
  function criarMostradorAvancado() {
    // Remover mostrador anterior se existir
    const mostradorAntigo = document.getElementById('route-info-display');
    if (mostradorAntigo) {
      mostradorAntigo.remove();
    }
    
    const mostrador = document.createElement('div');
    mostrador.id = 'route-info-display';
    mostrador.innerHTML = `
      <div class="route-info-header">
        <span>📊 Resumo da Rota</span>
        <span class="status-indicator" id="search-status">🔍</span>
      </div>
      <div class="route-info-content">
        <div class="route-info-item">
          <span class="route-info-icon">📏</span>
          <span class="route-info-label">Distância:</span>
          <span class="route-info-value" id="route-distance">--</span>
        </div>
        <div class="route-info-item">
          <span class="route-info-icon">⏱️</span>
          <span class="route-info-label">Tempo:</span>
          <span class="route-info-value" id="route-time">--</span>
        </div>
      </div>
    `;
    
    // Estilos aprimorados
    const estilos = document.createElement('style');
    estilos.textContent = `
      #route-info-display {
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 12px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        min-width: 220px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        border: 2px solid #FFD700;
        transition: all 0.3s ease;
      }
      
      .route-info-header {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #333;
        font-weight: bold;
        padding: 8px 12px;
        margin: -12px -12px 12px -12px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .status-indicator {
        font-size: 12px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .route-info-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .route-info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }
      
      .route-info-icon {
        font-size: 16px;
        width: 20px;
      }
      
      .route-info-label {
        font-weight: 600;
        color: #555;
        flex: 1;
      }
      
      .route-info-value {
        font-weight: bold;
        color: #2c5282;
        background: #f7fafc;
        padding: 2px 8px;
        border-radius: 4px;
        min-width: 60px;
        text-align: center;
      }
      
      .route-info-value.found {
        background: #c6f6d5;
        color: #22543d;
      }
      
      .route-info-value.searching {
        background: #fef5e7;
        color: #c53030;
      }
    `;
    
    document.head.appendChild(estilos);
    
    // Adicionar ao DOM
    const mapContainer = document.querySelector('.map-container') || document.body;
    mapContainer.appendChild(mostrador);
    
    console.log("🚀 [RouteInfoAdvanced] Mostrador avançado criado");
  }
  
  function configurarMonitoramento() {
    // Monitorar botões de visualizar e otimizar
    ['visualize-button', 'optimize-button'].forEach(buttonId => {
      const botao = document.getElementById(buttonId);
      if (botao) {
        botao.addEventListener('click', () => {
          console.log(`🚀 [RouteInfoAdvanced] Botão ${buttonId} clicado`);
          atualizarStatusBusca('🔄');
          
          // Buscar mais rapidamente
          setTimeout(() => buscarInformacoesRota(), 200);
          setTimeout(() => buscarInformacoesRota(), 800);
          setTimeout(() => buscarInformacoesRota(), 1500);
          setTimeout(() => buscarInformacoesRota(), 2500);
        });
      }
    });
    
    // Monitorar mudanças nas abas - especialmente aba de relatórios
    const observarAbas = () => {
      const abas = document.querySelectorAll('[data-tab], .tab-button, .bottom-tab-button');
      abas.forEach(aba => {
        aba.addEventListener('click', () => {
          console.log("🚀 [RouteInfoAdvanced] Aba clicada:", aba.textContent);
          
          // Se for a aba de relatórios, buscar mais rápido
          if (aba.textContent && aba.textContent.toLowerCase().includes('relatório')) {
            setTimeout(() => buscarInformacoesRota(), 100);
            setTimeout(() => buscarInformacoesRota(), 500);
          } else {
            setTimeout(() => buscarInformacoesRota(), 300);
          }
        });
      });
    };
    
    // Monitorar mudanças nos botões de rotas alternativas
    const observarRotasAlternativas = () => {
      const botoes = document.querySelectorAll('button, .btn, input[type="button"]');
      botoes.forEach(botao => {
        if (botao.textContent && (
          botao.textContent.includes('Proximidade') || 
          botao.textContent.includes('Alternativa') ||
          botao.textContent.includes('Otimizada')
        )) {
          botao.addEventListener('click', () => {
            console.log("🚀 [RouteInfoAdvanced] Rota alternativa selecionada:", botao.textContent);
            atualizarStatusBusca('🔄');
            
            // Limpar valores antigos e buscar novos
            atualizarDisplay(null, null);
            setTimeout(() => buscarInformacoesRota(), 300);
            setTimeout(() => buscarInformacoesRota(), 1000);
          });
        }
      });
    };
    
    setTimeout(observarAbas, 1000);
    setTimeout(observarRotasAlternativas, 1500);
    
    // Re-executar periodicamente para capturar novos botões
    setInterval(() => {
      observarAbas();
      observarRotasAlternativas();
    }, 5000);
  }
  
  function iniciarObservadorDOM() {
    // Observar mudanças no DOM para detectar quando novos conteúdos são carregados
    observerDOM = new MutationObserver((mutations) => {
      let deveAtualizar = false;
      
      mutations.forEach((mutation) => {
        // Verificar se houve mudanças em elementos que podem conter informações da rota
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const texto = node.textContent || '';
              
              // Verificar se o novo conteúdo contém palavras-chave relacionadas à rota
              if (texto.includes('Distância') || 
                  texto.includes('Tempo') || 
                  texto.includes('km') || 
                  texto.includes('min') ||
                  texto.includes('Resumo') ||
                  texto.includes('Rota')) {
                deveAtualizar = true;
              }
            }
          });
        }
        
        // Verificar mudanças de texto
        if (mutation.type === 'characterData') {
          const texto = mutation.target.textContent || '';
          if (texto.includes('Distância') || texto.includes('Tempo')) {
            deveAtualizar = true;
          }
        }
      });
      
      if (deveAtualizar && Date.now() - ultimaAtualizacao > 1000) {
        console.log("🚀 [RouteInfoAdvanced] Mudança no DOM detectada, atualizando...");
        ultimaAtualizacao = Date.now();
        setTimeout(() => buscarInformacoesRota(), 100);
      }
    });
    
    // Observar mudanças em todo o documento
    observerDOM.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log("🚀 [RouteInfoAdvanced] Observador DOM iniciado");
  }
  
  function buscarInformacoesRota() {
    console.log("🚀 [RouteInfoAdvanced] Iniciando busca avançada por informações de rota...");
    atualizarStatusBusca('🔍');
    
    let distancia = null;
    let tempo = null;
    
    // Primeiro verificar se estamos na rota "Proximidade à origem" que pode ter tempo fixo
    const rotaProximidade = verificarRotaProximidade();
    if (rotaProximidade) {
      console.log("🚀 [RouteInfoAdvanced] Detectada rota 'Proximidade à origem', buscando dados específicos...");
    }
    
    // Estratégias de busca em ordem de prioridade
    const estrategias = [
      buscarEmResumoRota,
      buscarEmRelatorioRota,
      buscarEmRotasAlternativas,
      buscarEmTabelasEListas,
      buscarComExpressoesRegulares,
      buscarEmElementosVisuais,
      buscarPorAtributos,
      buscarEmJSON
    ];
    
    for (const estrategia of estrategias) {
      try {
        const resultado = estrategia();
        if (resultado.distancia && !distancia) {
          distancia = resultado.distancia;
          console.log(`🚀 [RouteInfoAdvanced] Distância encontrada via ${estrategia.name}:`, distancia);
        }
        if (resultado.tempo && !tempo) {
          tempo = resultado.tempo;
          console.log(`🚀 [RouteInfoAdvanced] Tempo encontrado via ${estrategia.name}:`, tempo);
        }
        
        // Se encontramos ambos, parar
        if (distancia && tempo) break;
      } catch (e) {
        console.log(`🚀 [RouteInfoAdvanced] Erro na estratégia ${estrategia.name}:`, e);
      }
    }
    
    // Atualizar o display
    atualizarDisplay(distancia, tempo);
  }
  
  function verificarRotaProximidade() {
    // Verificar se a rota "Proximidade à origem" está selecionada
    const elementos = document.querySelectorAll('*');
    for (const elemento of elementos) {
      const texto = elemento.textContent;
      if (texto && texto.includes('Proximidade à origem')) {
        const parent = elemento.closest('div, section, article');
        if (parent && (parent.classList.contains('active') || 
            window.getComputedStyle(parent).backgroundColor !== 'transparent')) {
          return true;
        }
      }
    }
    return false;
  }
  
  function buscarEmRotasAlternativas() {
    // Buscar especificamente nas seções de rotas alternativas
    const seletores = [
      '.route-alternative',
      '.rota-alternativa', 
      '.alternative-route',
      '.proximidade-origem',
      '[data-route="alternative"]',
      '[data-route="proximidade"]'
    ];
    
    for (const seletor of seletores) {
      const elementos = document.querySelectorAll(seletor);
      for (const elemento of elementos) {
        // Verificar se este elemento está ativo/selecionado
        if (elemento.classList.contains('active') || 
            elemento.classList.contains('selected') ||
            window.getComputedStyle(elemento).backgroundColor !== 'transparent') {
          
          const texto = elemento.textContent;
          const resultado = extrairValoresDoTexto(texto);
          if (resultado.distancia || resultado.tempo) {
            return resultado;
          }
        }
      }
    }
    
    // Buscar pela rota atualmente visível na sidebar
    const sidebar = document.querySelector('.sidebar, #sidebar');
    if (sidebar) {
      const rotasVisiveis = sidebar.querySelectorAll('div, section');
      for (const rota of rotasVisiveis) {
        const estilo = window.getComputedStyle(rota);
        if (estilo.display !== 'none' && estilo.visibility !== 'hidden') {
          const texto = rota.textContent;
          if (texto.includes('km') || texto.includes('min')) {
            const resultado = extrairValoresDoTexto(texto);
            if (resultado.distancia || resultado.tempo) {
              return resultado;
            }
          }
        }
      }
    }
    
    return { distancia: null, tempo: null };
  }
  
  function buscarEmResumoRota() {
    const seletores = [
      'h3:contains("Resumo da Rota")',
      '.resumo-rota',
      '#resumo-rota',
      '[data-section="resumo"]',
      '.route-summary'
    ];
    
    for (const seletor of seletores) {
      let elementos;
      if (seletor.includes(':contains')) {
        // Buscar por texto
        elementos = Array.from(document.querySelectorAll('h3, h2, h4')).filter(el => 
          el.textContent.includes('Resumo da Rota') || el.textContent.includes('Resumo'));
      } else {
        elementos = document.querySelectorAll(seletor);
      }
      
      for (const elemento of elementos) {
        const container = elemento.closest('div, section, article') || elemento.parentElement;
        if (container) {
          const texto = container.textContent;
          const resultado = extrairValoresDoTexto(texto);
          if (resultado.distancia || resultado.tempo) {
            return resultado;
          }
        }
      }
    }
    
    return { distancia: null, tempo: null };
  }
  
  function buscarEmRelatorioRota() {
    const seletores = [
      '#bottom-info',
      '.relatorio-rota',
      '#relatorio-rota',
      '.route-report',
      '[data-tab-content="relatorio"]'
    ];
    
    for (const seletor of seletores) {
      const elemento = document.querySelector(seletor);
      if (elemento) {
        const texto = elemento.textContent;
        const resultado = extrairValoresDoTexto(texto);
        if (resultado.distancia || resultado.tempo) {
          return resultado;
        }
      }
    }
    
    return { distancia: null, tempo: null };
  }
  
  function buscarEmTabelasEListas() {
    // Buscar em tabelas
    const tabelas = document.querySelectorAll('table');
    for (const tabela of tabelas) {
      const texto = tabela.textContent;
      const resultado = extrairValoresDoTexto(texto);
      if (resultado.distancia || resultado.tempo) {
        return resultado;
      }
    }
    
    // Buscar em listas
    const listas = document.querySelectorAll('ul, ol, dl');
    for (const lista of listas) {
      const texto = lista.textContent;
      const resultado = extrairValoresDoTexto(texto);
      if (resultado.distancia || resultado.tempo) {
        return resultado;
      }
    }
    
    return { distancia: null, tempo: null };
  }
  
  function buscarComExpressoesRegulares() {
    const textoCompleto = document.body.innerText;
    return extrairValoresDoTexto(textoCompleto);
  }
  
  function buscarEmElementosVisuais() {
    // Buscar em elementos que podem conter valores específicos
    const elementos = document.querySelectorAll('span, div, p, td, th');
    
    for (const elemento of elementos) {
      const texto = elemento.textContent.trim();
      
      // Verificar se o elemento contém apenas um valor numérico seguido de km ou min
      if (/^\d+[\.,]?\d*\s*km$/.test(texto)) {
        return { distancia: texto, tempo: null };
      }
      
      if (/^\d+\s*min$/.test(texto) || /^\d+h\s*\d+min$/.test(texto)) {
        return { distancia: null, tempo: texto };
      }
    }
    
    return { distancia: null, tempo: null };
  }
  
  function buscarPorAtributos() {
    // Buscar elementos com atributos que podem indicar valores de rota
    const seletores = [
      '[data-distance]',
      '[data-time]',
      '[data-duration]',
      '[data-route-info]',
      '.distance',
      '.time',
      '.duration'
    ];
    
    for (const seletor of seletores) {
      const elementos = document.querySelectorAll(seletor);
      for (const elemento of elementos) {
        const distancia = elemento.getAttribute('data-distance') || 
                         (elemento.className.includes('distance') ? elemento.textContent : null);
        const tempo = elemento.getAttribute('data-time') || 
                     elemento.getAttribute('data-duration') ||
                     (elemento.className.includes('time') || elemento.className.includes('duration') ? elemento.textContent : null);
        
        if (distancia || tempo) {
          return { distancia, tempo };
        }
      }
    }
    
    return { distancia: null, tempo: null };
  }
  
  function buscarEmJSON() {
    // Buscar por dados JSON que podem estar no DOM
    const scripts = document.querySelectorAll('script[type="application/json"], script:not([src])');
    
    for (const script of scripts) {
      try {
        const conteudo = script.textContent;
        if (conteudo && (conteudo.includes('distance') || conteudo.includes('duration'))) {
          const data = JSON.parse(conteudo);
          
          // Buscar recursivamente no objeto JSON
          const resultado = buscarValoresEmObjeto(data);
          if (resultado.distancia || resultado.tempo) {
            return resultado;
          }
        }
      } catch (e) {
        // Não é JSON válido, continuar
      }
    }
    
    return { distancia: null, tempo: null };
  }
  
  function buscarValoresEmObjeto(obj) {
    let distancia = null;
    let tempo = null;
    
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          if (key.toLowerCase().includes('distance') && value.includes('km')) {
            distancia = value;
          }
          if ((key.toLowerCase().includes('time') || key.toLowerCase().includes('duration')) && 
              (value.includes('min') || value.includes('hour'))) {
            tempo = value;
          }
        } else if (typeof value === 'object') {
          const resultado = buscarValoresEmObjeto(value);
          if (resultado.distancia && !distancia) distancia = resultado.distancia;
          if (resultado.tempo && !tempo) tempo = resultado.tempo;
        }
      }
    }
    
    return { distancia, tempo };
  }
  
  function extrairValoresDoTexto(texto) {
    let distancia = null;
    let tempo = null;
    
    // Padrões para distância
    const padroesDistancia = [
      /Distância\s*total:?\s*([\d,.]+)\s*km/i,
      /Distância:?\s*([\d,.]+)\s*km/i,
      /Total:?\s*([\d,.]+)\s*km/i,
      /([\d,.]+)\s*km(?!\w)/i  // Qualquer número seguido de km (com word boundary)
    ];
    
    for (const padrao of padroesDistancia) {
      const match = texto.match(padrao);
      if (match && match[1]) {
        distancia = match[1] + ' km';
        break;
      }
    }
    
    // Padrões para tempo
    const padroesTempo = [
      /Tempo\s*estimado:?\s*(\d+)h\s*(\d+)min/i,
      /Tempo:?\s*(\d+)h\s*(\d+)min/i,
      /Duração:?\s*(\d+)h\s*(\d+)min/i,
      /Tempo\s*estimado:?\s*(\d+)\s*min/i,
      /Tempo:?\s*(\d+)\s*min/i,
      /Duração:?\s*(\d+)\s*min/i,
      /(\d+)h\s*(\d+)min(?!\w)/i,  // Formato direto com word boundary
      /(\d+)\s*min(?!\w)/i         // Apenas minutos com word boundary
    ];
    
    for (const padrao of padroesTempo) {
      const match = texto.match(padrao);
      if (match) {
        if (match[2]) {
          tempo = match[1] + 'h ' + match[2] + 'min';
        } else {
          tempo = match[1] + 'min';
        }
        break;
      }
    }
    
    return { distancia, tempo };
  }
  
  function atualizarDisplay(distancia, tempo) {
    const distanciaEl = document.getElementById('route-distance');
    const tempoEl = document.getElementById('route-time');
    
    // Usar valores padrão se não encontramos nada
    const distanciaFinal = distancia || '0 km';
    const tempoFinal = tempo || '0min';
    
    if (distanciaEl) {
      distanciaEl.textContent = distanciaFinal;
      distanciaEl.className = 'route-info-value ' + (distancia ? 'found' : 'searching');
    }
    
    if (tempoEl) {
      tempoEl.textContent = tempoFinal;
      tempoEl.className = 'route-info-value ' + (tempo ? 'found' : 'searching');
    }
    
    // Atualizar status
    if (distancia && tempo) {
      atualizarStatusBusca('✅');
    } else if (distancia || tempo) {
      atualizarStatusBusca('⚠️');
    } else {
      atualizarStatusBusca('❌');
    }
    
    console.log(`🚀 [RouteInfoAdvanced] Display atualizado - Distância: ${distanciaFinal}, Tempo: ${tempoFinal}`);
  }
  
  function atualizarStatusBusca(status) {
    const statusEl = document.getElementById('search-status');
    if (statusEl) {
      statusEl.textContent = status;
    }
  }
  
  // Busca periódica a cada 5 segundos
  setInterval(() => {
    if (Date.now() - ultimaAtualizacao > 5000) {
      buscarInformacoesRota();
    }
  }, 5000);
  
})();