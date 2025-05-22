/**
 * SOLUÇÃO ESTILO GOOGLE MAPS - VERSÃO 6.0
 * Este script implementa um estilo similar ao Google Maps,
 * mostrando as informações de tempo e distância diretamente
 * sobre o percurso e não na sidebar.
 */
(function() {
  console.log("🗺️ [SolucaoPercurso] Inicializando v6.0");
  
  // Variáveis globais
  let painelInfoAdicionado = false;
  let infoRotaAtual = {
    distancia: '---',
    tempo: '---'
  };
  
  // Configurações
  const CONFIG = {
    corPrincipal: "#ffd966", // Amarelo Móveis Bonafé
    corSecundaria: "#fff9e6",
    corTexto: "#212529",
    corBorda: "#e6c259",
    verificacaoIntervalo: 1000, // ms
    verificacaoMaxTentativas: 20
  };
  
  // Executar quando a página carrega
  window.addEventListener('load', iniciar);
  window.addEventListener('DOMContentLoaded', iniciar);
  setTimeout(iniciar, 500);
  setTimeout(iniciar, 1500);
  setTimeout(iniciar, 3000);
  setTimeout(iniciar, 5000);
  
  // Função principal
  function iniciar() {
    console.log("🗺️ [SolucaoPercurso] Executando v6.0");
    
    // 1. Adicionar CSS
    adicionarCSS();
    
    // 2. Ocultar informações das rotas alternativas
    ocultarInformacoesRotasAlternativas();
    
    // 3. Criar painel vazio no início
    criarPainelInformacoes();
    
    // 4. Preparar para mostrar informações no percurso
    monitorarBotaoVisualizar();
    
    // 5. Adicionar botão direto à UI para teste
    adicionarBotaoTeste();
  }
  
  // Adicionar CSS para estilização
  function adicionarCSS() {
    if (document.getElementById('css-solucao-percurso')) {
      return;
    }
    
    const estilo = document.createElement('style');
    estilo.id = 'css-solucao-percurso';
    estilo.textContent = `
      /* Ocultar informações de tempo e distância nas rotas alternativas */
      .route-alternative .route-distance,
      .route-alternative .route-time,
      .alternative .route-distance,
      .alternative .route-time,
      div.mb-2 .route-distance,
      div.mb-2 .route-time,
      .route-info .route-distance,
      .route-info .route-time,
      .sidebar .route-distance,
      .sidebar .route-time,
      [class*="rota-"] span:contains("km"),
      [class*="rota-"] span:contains("min"),
      [class*="rota-"] div:contains("km"),
      [class*="rota-"] div:contains("min"),
      [class*="rota "] span:contains("km"),
      [class*="rota "] span:contains("min"),
      [class*="rota "] div:contains("km"),
      [class*="rota "] div:contains("min") {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      
      /* Remover informações da sidebar - super agressivo */
      .sidebar span[id*="distance"],
      .sidebar span[id*="time"],
      .sidebar div[id*="distance"],
      .sidebar div[id*="time"],
      .sidebar span:contains("km"),
      .sidebar span:contains("min"),
      .sidebar span:contains("h "),
      .sidebar div:contains("km"),
      .sidebar div:contains("min"),
      .sidebar div:contains("h "),
      .sidebar-content span:contains("km"),
      .sidebar-content span:contains("min"),
      .sidebar-content span:contains("h "),
      .sidebar-content div:contains("km"),
      .sidebar-content div:contains("min"),
      .sidebar-content div:contains("h "),
      div[class*="rota"] span:contains("km"),
      div[class*="rota"] span:contains("min"),
      div[class*="rota"] div:contains("km"),
      div[class*="rota"] div:contains("min"),
      div[class*="route"] span:contains("km"),
      div[class*="route"] span:contains("min"),
      div[class*="route"] div:contains("km"),
      div[class*="route"] div:contains("min"),
      .rotas span:contains("km"),
      .rotas span:contains("min"),
      .rotas div:contains("km"),
      .rotas div:contains("min"),
      .rota-otimizada span:contains("km"),
      .rota-otimizada span:contains("min"),
      .rota-alternativa span:contains("km"),
      .rota-alternativa span:contains("min") {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        pointer-events: none !important;
        clip: rect(0, 0, 0, 0) !important;
        margin: -1px !important;
        padding: 0 !important;
        border: 0 !important;
      }
      
      /* Estilo para o painel de informações no mapa */
      .percurso-info-panel {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        padding: 10px 15px;
        z-index: 1000;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid ${CONFIG.corBorda};
      }
      
      .percurso-info-item {
        display: flex;
        align-items: center;
        margin-right: 20px;
      }
      
      .percurso-info-item:last-child {
        margin-right: 0;
      }
      
      .percurso-info-icon {
        margin-right: 8px;
        color: ${CONFIG.corPrincipal};
        font-weight: bold;
      }
      
      /* Estilizar o botão visualizar */
      #visualize-button, 
      button.btn-primary,
      button.btn-secondary,
      .visualizar-btn {
        background-color: ${CONFIG.corPrincipal} !important;
        border-color: ${CONFIG.corBorda} !important;
        color: ${CONFIG.corTexto} !important;
      }
      
      /* Botão de teste */
      .painel-teste-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${CONFIG.corPrincipal};
        color: ${CONFIG.corTexto};
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-weight: bold;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("🗺️ [SolucaoPercurso] CSS adicionado");
  }
  
  // Ocultar informações de tempo e distância nas rotas alternativas e sidebar
  function ocultarInformacoesRotasAlternativas() {
    console.log("🗺️ [SolucaoPercurso] Ocultando informações de rotas alternativas");
    
    // Técnica 1: Encontrar a seção de rotas alternativas
    const secaoRotasAlternativas = document.querySelector('h3:contains("Rotas Alternativas"), h4:contains("Rotas Alternativas"), div:contains("Rotas Alternativas")');
    if (secaoRotasAlternativas) {
      // Encontrar o container pai
      let container = secaoRotasAlternativas;
      for (let i = 0; i < 5; i++) {
        if (container.parentElement) {
          container = container.parentElement;
        }
      }
      
      // Ocultar spans e divs que contenham informações de tempo e distância
      container.querySelectorAll('span, div, p').forEach(el => {
        if (el.children.length === 0) {
          const texto = el.textContent.trim();
          if ((texto.includes('km') || texto.includes('min')) && texto.length < 30) {
            ocultarElemento(el);
          }
        }
      });
    }
    
    // Técnica 2: Abordagem super agressiva - ocultar qualquer elemento com informações de tempo e distância
    try {
      // Encontrar elementos nas rotas alternativas
      document.querySelectorAll('.sidebar span, .sidebar div, div.rota span, div.rota div, div[class*="rota"] span, div[class*="rota"] div, div[class*="alternativa"] span, div[class*="alternativa"] div').forEach(el => {
        if (el.closest('.percurso-info-panel')) return; // Não ocultar nosso próprio painel
        
        const texto = el.textContent.trim();
        if (texto.match(/\d+[.,]?\d*\s*km/i) || texto.match(/\d+\s*min/i) || texto.match(/\d+h\s+\d+min/i)) {
          ocultarElemento(el);
        }
      });
    } catch (error) {
      console.error("🗺️ [SolucaoPercurso] Erro ao ocultar informações:", error);
    }
    
    // Técnica 3: Ocultar todos os spans na sidebar
    document.querySelectorAll('.sidebar span, .sidebar div, .sidebar p').forEach(el => {
      if (el.children.length === 0 && !el.closest('.percurso-info-panel')) {
        const texto = el.textContent.trim();
        // Padrões mais abrangentes de distância e tempo
        if (
          texto.match(/\d+\s*km/i) || 
          texto.match(/\d+\s*min/i) || 
          texto.match(/\d+h/i) || 
          (texto.match(/^\d+[.,]?\d*$/) && texto.length < 10) || // Números isolados
          texto.match(/distância/i) ||
          texto.match(/tempo/i)
        ) {
          ocultarElemento(el);
        }
      }
    });
    
    // Técnica 4: Injetar CSS direto para lidar com conteúdo dinâmico
    injetarCSSOcultacaoDinamica();
    
    // Técnica 5: Monitorar mudanças na DOM para ocultar elementos conforme aparecem
    monitorarMudancasDOM();
    
    console.log("🗺️ [SolucaoPercurso] Informações de rotas alternativas ocultadas");
  }
  
  // Função para ocultar um elemento com todas as técnicas possíveis
  function ocultarElemento(el) {
    el.style.display = 'none';
    el.style.visibility = 'hidden';
    el.style.opacity = '0';
    el.style.height = '0';
    el.style.overflow = 'hidden';
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    el.style.clip = 'rect(0, 0, 0, 0)';
    el.style.margin = '-1px';
    el.style.padding = '0';
    el.style.border = '0';
    
    // Adicionar atributos para identificação
    el.setAttribute('data-ocultado', 'true');
    el.classList.add('tempo-distancia-ocultado');
    
    // Substituir o conteúdo com espaço em branco (caso o display: none não funcione)
    el.setAttribute('data-original-text', el.textContent);
    el.textContent = '';
  }
  
  // Monitorar mudanças na DOM para ocultar novos elementos de tempo/distância
  function monitorarMudancasDOM() {
    // Verificar se o MutationObserver já está configurado
    if (window._observadorMudancasCriado) return;
    
    try {
      // Criar um observador para mudanças na DOM
      const observador = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // Verificar novos nós adicionados
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              if (node.nodeType === 1) { // Apenas elementos HTML
                // Verificar se o elemento ou seus filhos contêm informações de tempo/distância
                if (node.textContent && (
                  node.textContent.match(/\d+\s*km/i) || 
                  node.textContent.match(/\d+\s*min/i) || 
                  node.textContent.match(/\d+h\s+\d+min/i)
                )) {
                  if (!node.closest('.percurso-info-panel')) {
                    // Se o elemento pertence à sidebar ou rotas alternativas
                    if (node.closest('.sidebar') || 
                        node.closest('[class*="rota"]') || 
                        node.closest('[class*="alternativa"]')) {
                      ocultarElemento(node);
                    }
                    
                    // Verificar filhos do elemento
                    node.querySelectorAll('span, div, p').forEach(child => {
                      if (child.children.length === 0 && !child.closest('.percurso-info-panel')) {
                        const texto = child.textContent.trim();
                        if (texto.match(/\d+\s*km/i) || texto.match(/\d+\s*min/i) || texto.match(/\d+h/i)) {
                          ocultarElemento(child);
                        }
                      }
                    });
                  }
                }
              }
            }
          }
        });
      });
      
      // Configurar o observador para monitorar todo o documento
      observador.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      // Marcar que o observador foi criado
      window._observadorMudancasCriado = true;
      
      console.log("🗺️ [SolucaoPercurso] Observador de mudanças DOM configurado");
    } catch (error) {
      console.error("🗺️ [SolucaoPercurso] Erro ao configurar observador:", error);
    }
  }
  
  // Injetar CSS adicional para ocultar elementos dinâmicos
  function injetarCSSOcultacaoDinamica() {
    const estiloJaExiste = document.getElementById('css-ocultacao-dinamica');
    if (estiloJaExiste) return;
    
    const estilo = document.createElement('style');
    estilo.id = 'css-ocultacao-dinamica';
    estilo.textContent = `
      /* Ocultar elementos dinâmicos com números específicos de distâncias e tempos comuns */
      [class*="rota"] *:not(.percurso-info-panel *):contains("256.7 km"),
      [class*="rota"] *:not(.percurso-info-panel *):contains("235.7 km"),
      [class*="rota"] *:not(.percurso-info-panel *):contains("3h 13min"),
      [class*="rota"] *:not(.percurso-info-panel *):contains("253.2 km"),
      [class*="rota"] *:not(.percurso-info-panel *):contains("257.8 km"),
      [class*="route"] *:not(.percurso-info-panel *):contains("km"),
      [class*="route"] *:not(.percurso-info-panel *):contains("min"),
      .sidebar *:not(.percurso-info-panel *):contains("km"),
      .sidebar *:not(.percurso-info-panel *):contains("min"),
      .sidebar *:not(.percurso-info-panel *):contains("h "),
      td:contains("km"), 
      td:contains("min"),
      .tempo-distancia-ocultado,
      [data-ocultado="true"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        pointer-events: none !important;
        clip: rect(0, 0, 0, 0) !important;
      }
      
      /* Estilo específico para tabelas na sidebar */
      .sidebar table td,
      [class*="rota"] table td {
        position: relative;
      }
      
      .sidebar table td:after,
      [class*="rota"] table td:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 10;
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("🗺️ [SolucaoPercurso] CSS de ocultação dinâmica adicionado");
  }
  
  // Criar o painel de informações inicial
  function criarPainelInformacoes() {
    // Verificar se o painel já existe
    if (painelInfoAdicionado || document.querySelector('.percurso-info-panel')) {
      return;
    }
    
    // Criar painel de informações vazio
    const painel = document.createElement('div');
    painel.className = 'percurso-info-panel';
    painel.id = 'percurso-info-panel';
    painel.innerHTML = `
      <div class="percurso-info-item">
        <span class="percurso-info-icon">📏</span>
        <span class="percurso-info-distancia">${infoRotaAtual.distancia}</span>
      </div>
      <div class="percurso-info-item">
        <span class="percurso-info-icon">⏱️</span>
        <span class="percurso-info-tempo">${infoRotaAtual.tempo}</span>
      </div>
    `;
    
    // Encontrar o mapa
    setTimeout(() => {
      try {
        const mapContainer = document.querySelector('#map, .map-container, .google-map, .gm-style');
        const mapa = mapContainer ? (mapContainer.parentElement || document.body) : document.body;
        
        if (mapa) {
          // Garantir que o container tenha posição relativa para posicionamento absoluto do painel
          mapa.style.position = 'relative';
          
          // Adicionar painel ao mapa
          mapa.appendChild(painel);
          painelInfoAdicionado = true;
          
          console.log("🗺️ [SolucaoPercurso] Painel de informações inicial adicionado");
        } else {
          console.log("🗺️ [SolucaoPercurso] Container do mapa não encontrado para o painel inicial");
        }
      } catch (error) {
        console.error("🗺️ [SolucaoPercurso] Erro ao criar painel inicial:", error);
      }
    }, 1000);
  }
  
  // Adicionar botão de teste
  function adicionarBotaoTeste() {
    const botaoExistente = document.querySelector('.painel-teste-btn');
    if (botaoExistente) return;
    
    const botao = document.createElement('button');
    botao.className = 'painel-teste-btn';
    botao.textContent = 'Atualizar Painel';
    botao.onclick = function() {
      console.log("🗺️ [SolucaoPercurso] Botão de teste clicado");
      extrairEAtualizarInformacoes();
    };
    
    document.body.appendChild(botao);
    console.log("🗺️ [SolucaoPercurso] Botão de teste adicionado");
  }
  
  // Monitorar o botão Visualizar para mostrar as informações no percurso
  function monitorarBotaoVisualizar() {
    try {
      // Encontrar o botão Visualizar
      const botaoVisualizar = encontrarBotaoVisualizar();
      
      if (!botaoVisualizar) {
        console.log("🗺️ [SolucaoPercurso] Botão Visualizar não encontrado");
        
        // Estratégia alternativa: monitorar cliques em toda a página
        document.body.addEventListener('click', function(event) {
          const target = event.target;
          if (target && (
            target.textContent.includes('Visualizar') || 
            (target.closest('button') && target.closest('button').textContent.includes('Visualizar'))
          )) {
            console.log("🗺️ [SolucaoPercurso] Clique em elemento similar a 'Visualizar' detectado");
            programarExtracao();
          }
        });
        
        return;
      }
      
      console.log("🗺️ [SolucaoPercurso] Botão Visualizar encontrado:", botaoVisualizar);
      
      // Adicionar evento de clique
      botaoVisualizar.addEventListener('click', function() {
        console.log("🗺️ [SolucaoPercurso] Botão Visualizar clicado");
        programarExtracao();
      });
    } catch (error) {
      console.error("🗺️ [SolucaoPercurso] Erro ao monitorar botão:", error);
    }
  }
  
  // Programa extração com várias tentativas
  function programarExtracao() {
    // Aguardar um pouco para que a rota seja visualizada
    setTimeout(extrairEAtualizarInformacoes, 1000);
    setTimeout(extrairEAtualizarInformacoes, 2000);
    setTimeout(extrairEAtualizarInformacoes, 3000);
    setTimeout(extrairEAtualizarInformacoes, 5000);
  }
  
  // Extrair e atualizar informações de tempo e distância
  function extrairEAtualizarInformacoes() {
    console.log("🗺️ [SolucaoPercurso] Iniciando extração de informações");
    
    // 1. Tentar extrair informações da rota
    const infoRota = extrairInformacoesRota();
    
    // 2. Verificar se as informações foram extraídas com sucesso
    if (infoRota.distancia === '---' && infoRota.tempo === '---') {
      console.log("🗺️ [SolucaoPercurso] Não foi possível obter informações da rota, tentando novamente...");
      setTimeout(extrairEAtualizarInformacoes, 1000);
      return;
    }
    
    console.log("🗺️ [SolucaoPercurso] Informações obtidas:", infoRota);
    
    // 3. Atualizar o objeto global
    infoRotaAtual = infoRota;
    
    // 4. Atualizar o painel de informações
    atualizarPainelInformacoes();
  }
  
  // Atualizar o painel de informações
  function atualizarPainelInformacoes() {
    console.log("🗺️ [SolucaoPercurso] Atualizando painel com dados:", infoRotaAtual);
    
    // Verificar se o painel existe
    let painel = document.querySelector('.percurso-info-panel');
    
    // Se não existir, criar um novo
    if (!painel) {
      criarPainelInformacoes();
      painel = document.querySelector('.percurso-info-panel');
      
      if (!painel) {
        console.log("🗺️ [SolucaoPercurso] Falha ao criar painel de informações");
        return;
      }
    }
    
    // Atualizar conteúdo
    try {
      const distanciaEl = painel.querySelector('.percurso-info-distancia');
      const tempoEl = painel.querySelector('.percurso-info-tempo');
      
      if (distanciaEl) distanciaEl.textContent = infoRotaAtual.distancia;
      if (tempoEl) tempoEl.textContent = infoRotaAtual.tempo;
      
      console.log("🗺️ [SolucaoPercurso] Painel atualizado com sucesso");
    } catch (e) {
      console.error("🗺️ [SolucaoPercurso] Erro ao atualizar painel:", e);
    }
  }
  
  // Encontrar o botão Visualizar
  function encontrarBotaoVisualizar() {
    let botao;
    
    // Estratégia 1: Por ID
    botao = document.getElementById('visualize-button');
    if (botao) {
      console.log("🗺️ [SolucaoPercurso] Botão Visualizar encontrado por ID");
      return botao;
    }
    
    // Estratégia 2: Qualquer botão com texto Visualizar
    const botoes = document.querySelectorAll('button');
    for (let i = 0; i < botoes.length; i++) {
      if (botoes[i].textContent.includes('Visualizar')) {
        console.log("🗺️ [SolucaoPercurso] Botão Visualizar encontrado como botão");
        return botoes[i];
      }
    }
    
    // Estratégia 3: Qualquer elemento clicável com texto Visualizar
    const elementos = document.querySelectorAll('a, div[onclick], span[onclick], div.btn, span.btn');
    for (let i = 0; i < elementos.length; i++) {
      if (elementos[i].textContent.trim().includes('Visualizar')) {
        console.log("🗺️ [SolucaoPercurso] Botão Visualizar encontrado como elemento clicável");
        return elementos[i];
      }
    }
    
    // Estratégia 4: Busca avançada por elementos que contêm Visualizar
    const todosElementos = document.querySelectorAll('*');
    for (let i = 0; i < todosElementos.length; i++) {
      if (todosElementos[i].textContent.trim() === 'Visualizar' && 
         (todosElementos[i].onclick || todosElementos[i].getAttribute('onclick') || 
          todosElementos[i].classList.contains('btn') || todosElementos[i].classList.contains('button'))) {
        console.log("🗺️ [SolucaoPercurso] Botão Visualizar encontrado por busca avançada");
        return todosElementos[i];
      }
    }
    
    console.log("🗺️ [SolucaoPercurso] Botão Visualizar não encontrado");
    return null;
  }
  
  // Extrair informações de tempo e distância da rota
  function extrairInformacoesRota() {
    console.log("🗺️ [SolucaoPercurso] Extraindo informações da rota");
    
    // Valores padrão
    let distancia = '---';
    let tempo = '---';
    
    try {
      // Técnica 1: Tentar encontrar a aba de Relatório da Rota
      const abaRelatorio = document.querySelector('#relatorio-rota-btn, button:contains("Relatório da Rota"), div:contains("Relatório da Rota")');
      
      // Se encontrou a aba, clicar nela para garantir que o conteúdo está visível
      if (abaRelatorio && typeof abaRelatorio.click === 'function') {
        console.log("🗺️ [SolucaoPercurso] Clicando na aba Relatório da Rota");
        abaRelatorio.click();
      }
      
      // Técnica 2: Buscar diretamente no conteúdo da aba de Relatório
      const relatorios = document.querySelectorAll('div:contains("Relatório da Rota"), div:contains("Resumo da Rota")');
      
      relatorios.forEach(relatorio => {
        // Navegar para cima na hierarquia para encontrar o container
        let container = relatorio;
        for (let i = 0; i < 5; i++) {
          if (!container.parentElement) break;
          container = container.parentElement;
          
          // Buscar elementos com texto específico dentro deste container
          Array.from(container.querySelectorAll('div, span, p')).forEach(el => {
            const texto = el.textContent.trim();
            
            // Buscar texto de distância
            if (texto.includes('Distância total:')) {
              console.log("🗺️ [SolucaoPercurso] Encontrado texto de distância:", texto);
              const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
              if (match && match[1]) {
                distancia = match[1];
                console.log("🗺️ [SolucaoPercurso] Extraída distância:", distancia);
              }
            }
            
            // Buscar texto de tempo
            if (texto.includes('Tempo estimado:')) {
              console.log("🗺️ [SolucaoPercurso] Encontrado texto de tempo:", texto);
              const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
              if (match && match[1]) {
                tempo = match[1];
                console.log("🗺️ [SolucaoPercurso] Extraído tempo:", tempo);
              }
            }
          });
        }
      });
      
      // Técnica 3: Buscar em qualquer lugar da página por padrões específicos
      if (distancia === '---' || tempo === '---') {
        document.querySelectorAll('div, span, p').forEach(el => {
          const texto = el.textContent.trim();
          
          if (distancia === '---' && texto.match(/^Distância total:\s*\d+[.,]?\d*\s*km$/i)) {
            const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
            if (match && match[1]) {
              distancia = match[1];
              console.log("🗺️ [SolucaoPercurso] Extraída distância (técnica 3):", distancia);
            }
          }
          
          if (tempo === '---' && texto.match(/^Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)$/i)) {
            const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
            if (match && match[1]) {
              tempo = match[1];
              console.log("🗺️ [SolucaoPercurso] Extraído tempo (técnica 3):", tempo);
            }
          }
          
          // Procurar especificamente por textos independentes de distância e tempo
          if (distancia === '---' && texto.match(/^\d+[.,]?\d*\s*km$/i)) {
            distancia = texto;
            console.log("🗺️ [SolucaoPercurso] Encontrada distância isolada:", distancia);
          }
          
          if (tempo === '---' && (texto.match(/^\d+h\s+\d+min$/i) || texto.match(/^\d+\s*min$/i))) {
            tempo = texto;
            console.log("🗺️ [SolucaoPercurso] Encontrado tempo isolado:", tempo);
          }
        });
      }
      
      // Técnica 4: Tentar encontrar no HTML completo se ainda não encontrou
      if (distancia === '---' || tempo === '---') {
        const html = document.documentElement.innerHTML;
        
        // Distância
        if (distancia === '---') {
          const matchDist = html.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
          if (matchDist && matchDist[1]) {
            distancia = matchDist[1];
            console.log("🗺️ [SolucaoPercurso] Extraída distância do HTML:", distancia);
          }
        }
        
        // Tempo
        if (tempo === '---') {
          const matchTempo = html.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
          if (matchTempo && matchTempo[1]) {
            tempo = matchTempo[1];
            console.log("🗺️ [SolucaoPercurso] Extraído tempo do HTML:", tempo);
          }
        }
      }
      
      return { distancia, tempo };
    } catch (e) {
      console.error("🗺️ [SolucaoPercurso] Erro ao extrair informações:", e);
      return { distancia: '---', tempo: '---' };
    }
  }
})();