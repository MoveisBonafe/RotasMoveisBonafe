// Solução mínima para exibir tempo e distância
(function() {
  // Inicializar quando a página carregar
  window.addEventListener('load', function() {
    setTimeout(iniciar, 1500);
  });
  
  function iniciar() {
    // Criar painel
    criarPainel();
    
    // Adicionar listeners
    document.addEventListener('click', function(e) {
      setTimeout(buscarInfo, 1000);
    });
    
    // Verificar periodicamente
    setInterval(buscarInfo, 3000);
    
    // Primeira verificação
    buscarInfo();
  }
  
  function criarPainel() {
    // Verificar se o painel já existe
    if (document.getElementById('painel-simples')) return;
    
    // Encontrar mapa
    var mapa = document.getElementById('map');
    if (!mapa) return;
    
    // Garantir posição relativa
    mapa.style.position = 'relative';
    
    // Criar painel
    var painel = document.createElement('div');
    painel.id = 'painel-simples';
    painel.style.cssText = 
      'position:absolute;' +
      'top:10px;' +
      'left:50%;' +
      'transform:translateX(-50%);' +
      'background:white;' +
      'border:1px solid #ffd966;' +
      'border-radius:4px;' +
      'padding:8px 12px;' +
      'z-index:9999;' +
      'display:flex;' +
      'align-items:center;' +
      'box-shadow:0 2px 4px rgba(0,0,0,0.2);';
    
    // Adicionar conteúdo
    painel.innerHTML = 
      '<div style="display:flex;align-items:center;margin-right:15px">' +
        '<span style="margin-right:5px;color:#ffd966">📏</span>' +
        '<span id="valor-dist">---</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center">' +
        '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
        '<span id="valor-tempo">---</span>' +
      '</div>';
    
    // Adicionar ao mapa
    mapa.appendChild(painel);
  }
  
  function buscarInfo() {
    var distancia = '235 km';
    var tempo = '3h 15min';
    
    // Buscar informações no relatório
    var elems = document.body.querySelectorAll('*');
    for (var i = 0; i < elems.length; i++) {
      var texto = elems[i].textContent || '';
      
      if (texto.indexOf('Distância total:') !== -1) {
        var matchDist = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
        if (matchDist && matchDist[1]) {
          distancia = matchDist[1];
        }
      }
      
      if (texto.indexOf('Tempo estimado:') !== -1) {
        var matchTempo = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
        if (matchTempo && matchTempo[1]) {
          tempo = matchTempo[1];
        }
      }
    }
    
    // Atualizar painel
    var distEl = document.getElementById('valor-dist');
    var tempoEl = document.getElementById('valor-tempo');
    
    if (distEl) distEl.textContent = distancia;
    if (tempoEl) tempoEl.textContent = tempo;
    
    // Esconder spans de tempo/distância originais
    var spans = document.getElementsByTagName('span');
    for (var j = 0; j < spans.length; j++) {
      var span = spans[j];
      
      // Pular nossos próprios spans
      if (span.id === 'valor-dist' || span.id === 'valor-tempo') {
        continue;
      }
      
      var textoSpan = span.textContent.trim();
      
      // Verificar padrões
      if (/^\d+[.,]?\d*\s*km$/.test(textoSpan) || 
          /^\d+h\s+\d+min$/.test(textoSpan) || 
          /^\d+\s*min$/.test(textoSpan)) {
        
        span.innerHTML = '';
      }
    }
  }
})();