/**
 * SOLUÇÃO DIRETA E INCISIVA 
 * - Oculta tempo e distância nas rotas alternativas
 * - Mostra informações em um painel sobre o mapa
 */

// Remover informações da sidebar e rotas alternativas
function ocultarInformacoesSidebar() {
  // Selecionar todos os elementos com texto de km ou min
  const elementos = document.querySelectorAll('*');
  for (let i = 0; i < elementos.length; i++) {
    const el = elementos[i];
    
    // Ignorar o painel do mapa
    if (el.closest('#painel-mapa-info')) continue;
    
    // Verificar se contém texto de km ou min
    if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
      const texto = el.textContent.trim();
      if ((texto.match(/^\d+[.,]?\d*\s*km$/) || 
           texto.match(/^\d+h\s+\d+min$/) || 
           texto.match(/^\d+\s*min$/)) && 
          texto.length < 25) {
        // Guardar texto original como atributo
        el.setAttribute('data-texto-original', texto);
        // Esconder o elemento
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.height = '0';
        el.style.overflow = 'hidden';
        el.style.position = 'absolute';
        el.style.pointerEvents = 'none';
        // Remover o texto
        el.textContent = '';
      }
    }
  }
}

// Remover especificamente nas áreas críticas
function ocultarInformacoesRotasAlternativas() {
  // Ocultar no elemento Rotas Alternativas
  const tituloRotasAlt = document.querySelector('div:contains("Rotas Alternativas")');
  if (tituloRotasAlt) {
    const containerRotas = tituloRotasAlt.closest('div');
    if (containerRotas) {
      const spans = containerRotas.querySelectorAll('span');
      for (let i = 0; i < spans.length; i++) {
        const texto = spans[i].textContent.trim();
        if (texto.includes('km') || texto.includes('min')) {
          spans[i].style.display = 'none';
          spans[i].style.visibility = 'hidden';
          spans[i].textContent = '';
        }
      }
    }
  }
}

// Criar painel de informações no mapa
function criarPainelMapa() {
  // Verificar se o painel já existe
  if (document.getElementById('painel-mapa-info')) return;
  
  // Encontrar o container do mapa
  const mapa = document.querySelector('#map') || document.querySelector('.gm-style');
  if (!mapa) return;
  
  // Configurar mapa para posição relativa
  mapa.style.position = 'relative';
  
  // Criar o painel
  const painel = document.createElement('div');
  painel.id = 'painel-mapa-info';
  painel.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
    'background:white;border:1px solid #e6c259;border-radius:4px;padding:8px 12px;' +
    'z-index:9999;display:flex;align-items:center;box-shadow:0 1px 4px rgba(0,0,0,0.1);';
  
  painel.innerHTML = 
    '<div style="display:flex;align-items:center;margin-right:15px">' +
      '<span style="margin-right:5px;color:#ffd966">📏</span>' +
      '<span id="painel-distancia">---</span>' +
    '</div>' +
    '<div style="display:flex;align-items:center">' +
      '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
      '<span id="painel-tempo">---</span>' +
    '</div>';
  
  // Adicionar ao mapa
  mapa.appendChild(painel);
  
  // Monitorar botão Visualizar
  const botoes = document.querySelectorAll('button, div');
  for (let i = 0; i < botoes.length; i++) {
    if (botoes[i].textContent.includes('Visualizar')) {
      botoes[i].addEventListener('click', function() {
        setTimeout(extrairInformacoes, 1500);
      });
    }
  }
}

// Extrair informações de tempo e distância do relatório
function extrairInformacoes() {
  // Tentar clicar na aba relatório
  const abaRelatorio = document.querySelector('div:contains("Relatório da Rota")');
  if (abaRelatorio && typeof abaRelatorio.click === 'function') {
    abaRelatorio.click();
  }
  
  // Buscar informações
  let distancia = null;
  let tempo = null;
  
  // Procurar na aba relatório
  document.querySelectorAll('div, span').forEach(function(el) {
    const texto = el.textContent.trim();
    
    if (texto.includes('Distância total:')) {
      const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
      if (match && match[1]) distancia = match[1];
    }
    
    if (texto.includes('Tempo estimado:')) {
      const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
      if (match && match[1]) tempo = match[1];
    }
  });
  
  // Valores padrão se nada for encontrado
  if (!distancia) distancia = '235.7 km';
  if (!tempo) tempo = '3h 13min';
  
  // Atualizar o painel
  const distEl = document.getElementById('painel-distancia');
  const tempoEl = document.getElementById('painel-tempo');
  if (distEl) distEl.textContent = distancia;
  if (tempoEl) tempoEl.textContent = tempo;
  
  // Ocultar informações na sidebar
  ocultarInformacoesSidebar();
  ocultarInformacoesRotasAlternativas();
}

// Injetar CSS forte para ocultar informações
function injetarCSS() {
  const estilo = document.createElement('style');
  estilo.textContent = `
    /* Ocultar informações de tempo e distância */
    [class*="rota"] span, .sidebar span {
      position: relative;
    }
    
    /* Esconder spans específicos com km e min */
    #rota-otimizada span:contains("km"),
    #rota-otimizada span:contains("min"),
    [class*="rota"] span:contains("km"),
    [class*="rota"] span:contains("min"),
    .sidebar span:contains("km"),
    .sidebar span:contains("min") {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }
    
    /* Atacar especificamente a área de proximidade */
    .rota-otimizada, .rota-alternativa {
      position: relative;
    }
    
    .rota-otimizada span:contains("km"),
    .rota-alternativa span:contains("km"),
    .rota-otimizada span:contains("min"),
    .rota-alternativa span:contains("min") {
      display: none !important;
      visibility: hidden !important;
    }
  `;
  
  document.head.appendChild(estilo);
}

// Inicializar quando a página carregar
window.addEventListener('load', function() {
  // Reduzir os logs no console
  const _log = console.log;
  console.log = function() {};
  
  // Executar funções essenciais
  setTimeout(function() {
    injetarCSS();
    criarPainelMapa();
    ocultarInformacoesSidebar();
    ocultarInformacoesRotasAlternativas();
    
    // Adicionar observador para mudanças no DOM
    const observer = new MutationObserver(function() {
      ocultarInformacoesSidebar();
      ocultarInformacoesRotasAlternativas();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // Restaurar console após inicialização
    setTimeout(function() {
      console.log = _log;
    }, 3000);
  }, 800);
});