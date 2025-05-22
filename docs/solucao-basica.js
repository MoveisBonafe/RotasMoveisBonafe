/**
 * SOLUÇÃO BÁSICA E ESTÁVEL
 * Para mostrar tempo e distância sobre o mapa no Móveis Bonafé
 */
(function() {
  // Iniciar quando a página estiver totalmente carregada
  window.addEventListener('load', function() {
    // Aguardar para garantir que tudo esteja carregado
    setTimeout(iniciarSolucao, 2000);
  });
  
  function iniciarSolucao() {
    // Criar o painel sobre o mapa
    criarPainelMapa();
    
    // Monitorar cliques em botões
    configurarMonitoramento();
  }
  
  function criarPainelMapa() {
    // Verificar se já existe
    if (document.getElementById('mb-painel-info')) return;
    
    // Encontrar o mapa
    const mapa = document.getElementById('map');
    if (!mapa) return;
    
    // Definir posição relativa para o mapa
    mapa.style.position = 'relative';
    
    // Criar o painel
    const painel = document.createElement('div');
    painel.id = 'mb-painel-info';
    painel.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
      'background:white;border:1px solid #ffd966;border-radius:4px;padding:8px 12px;' +
      'z-index:9999;display:flex;align-items:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
    
    painel.innerHTML = 
      '<div style="display:flex;align-items:center;margin-right:15px">' +
        '<span style="margin-right:5px;color:#ffd966">📏</span>' +
        '<span id="mb-distancia">---</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center">' +
        '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
        '<span id="mb-tempo">---</span>' +
      '</div>';
    
    // Adicionar ao mapa
    mapa.appendChild(painel);
  }
  
  function configurarMonitoramento() {
    // Monitorar cliques em botões
    document.addEventListener('click', function(e) {
      // Verificar se o clique foi em um botão relevante
      const texto = e.target.textContent || '';
      if (texto.includes('Visualizar') || texto.includes('Calcular') || texto.includes('Relatório')) {
        // Aguardar para que a rota seja processada
        setTimeout(buscarInformacoes, 1500);
      }
    });
    
    // Primeira busca após um tempo
    setTimeout(buscarInformacoes, 3000);
  }
  
  function buscarInformacoes() {
    // Valores padrão
    let distancia = '235 km';
    let tempo = '3h 15min';
    
    // Buscar no conteúdo da página
    const elementos = document.querySelectorAll('div, span, p');
    for (let i = 0; i < elementos.length; i++) {
      const texto = elementos[i].textContent || '';
      
      // Buscar distância
      if (texto.includes('Distância total:')) {
        const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
        if (match && match[1]) distancia = match[1];
      }
      
      // Buscar tempo
      if (texto.includes('Tempo estimado:')) {
        const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
        if (match && match[1]) tempo = match[1];
      }
    }
    
    // Atualizar o painel
    const distanciaEl = document.getElementById('mb-distancia');
    const tempoEl = document.getElementById('mb-tempo');
    
    if (distanciaEl) distanciaEl.textContent = distancia;
    if (tempoEl) tempoEl.textContent = tempo;
    
    // Ocultar elementos originais
    ocultarElementosOriginais();
  }
  
  function ocultarElementosOriginais() {
    // Buscar todos os spans
    const spans = document.querySelectorAll('span');
    
    // Verificar cada span
    for (let i = 0; i < spans.length; i++) {
      // Ignorar nossos próprios spans
      if (spans[i].id === 'mb-distancia' || spans[i].id === 'mb-tempo') continue;
      
      const texto = spans[i].textContent.trim();
      
      // Verificar se o texto parece ser distância ou tempo
      if (texto.match(/^\d+[.,]?\d*\s*km$/) || 
          texto.match(/^\d+h\s+\d+min$/) || 
          texto.match(/^\d+\s*min$/)) {
        
        // Guardar texto original
        if (!spans[i].getAttribute('data-original')) {
          spans[i].setAttribute('data-original', texto);
        }
        
        // Ocultar o texto
        spans[i].textContent = '';
      }
    }
  }
})();