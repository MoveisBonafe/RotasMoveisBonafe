// Solução V2 - Código simplificado, compatível e sem conflitos
window.addEventListener('load', function() {
  // Esperar tudo carregar
  setTimeout(function() {
    // Criar painel
    var mapa = document.getElementById('map');
    if (mapa) {
      var painel = document.createElement('div');
      painel.id = 'moveis-bonafe-painel';
      painel.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
        'background:white;border:1px solid #ffd966;border-radius:4px;padding:8px 12px;' +
        'z-index:9999;display:flex;align-items:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
      
      painel.innerHTML = 
        '<div style="display:flex;align-items:center;margin-right:15px">' +
          '<span style="margin-right:5px;color:#ffd966">📏</span>' +
          '<span id="mb-dist">---</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center">' +
          '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
          '<span id="mb-tempo">---</span>' +
        '</div>';
      
      mapa.appendChild(painel);
    }
    
    // Função para buscar informações
    function buscarInfo() {
      var distancia = '235 km';
      var tempo = '3h 15min';
      
      var todos = document.querySelectorAll('*');
      for (var i = 0; i < todos.length; i++) {
        var texto = todos[i].textContent || '';
        
        if (texto.indexOf('Distância total:') !== -1) {
          var matchDist = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
          if (matchDist && matchDist[1]) distancia = matchDist[1];
        }
        
        if (texto.indexOf('Tempo estimado:') !== -1) {
          var matchTempo = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
          if (matchTempo && matchTempo[1]) tempo = matchTempo[1];
        }
      }
      
      var distEl = document.getElementById('mb-dist');
      var tempoEl = document.getElementById('mb-tempo');
      
      if (distEl) distEl.textContent = distancia;
      if (tempoEl) tempoEl.textContent = tempo;
      
      // Ocultar spans originais
      var spans = document.getElementsByTagName('span');
      for (var j = 0; j < spans.length; j++) {
        var span = spans[j];
        if (span.id === 'mb-dist' || span.id === 'mb-tempo') continue;
        
        var textoSpan = span.textContent.trim();
        if (/^\d+[.,]?\d*\s*km$/.test(textoSpan) || 
            /^\d+h\s+\d+min$/.test(textoSpan) || 
            /^\d+\s*min$/.test(textoSpan)) {
          span.textContent = '';
        }
      }
    }
    
    // Verificar periodicamente
    setInterval(buscarInfo, 2000);
    
    // Verificar após cliques
    document.addEventListener('click', function(e) {
      setTimeout(buscarInfo, 1500);
    });
    
    // Verificar logo
    buscarInfo();
  }, 1500);
});