// Script de injeção direta do painel
// Copia e cola este código no Console do navegador ao acessar o site
// Não há conflitos ou dependências externas

(function() {
  // 1. Criar painel no mapa
  var mapa = document.getElementById('map');
  if (!mapa) return;
  
  // Garantir posicionamento
  mapa.style.position = 'relative';
  
  // Criar painel
  var painel = document.createElement('div');
  painel.style.position = 'absolute';
  painel.style.top = '10px';
  painel.style.left = '50%';
  painel.style.transform = 'translateX(-50%)';
  painel.style.backgroundColor = 'white';
  painel.style.border = '1px solid #ffd966';
  painel.style.borderRadius = '4px';
  painel.style.padding = '8px 12px';
  painel.style.zIndex = '9999';
  painel.style.display = 'flex';
  painel.style.alignItems = 'center';
  painel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  
  // Conteúdo
  painel.innerHTML = 
    '<div style="display:flex;align-items:center;margin-right:15px">' +
      '<span style="margin-right:5px;color:#ffd966">📏</span>' +
      '<span id="dist-valor">---</span>' +
    '</div>' +
    '<div style="display:flex;align-items:center">' +
      '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
      '<span id="tempo-valor">---</span>' +
    '</div>';
  
  // Adicionar ao mapa
  mapa.appendChild(painel);
  
  // 2. Buscar e atualizar informações
  function atualizarPainel() {
    var distancia = '235 km';
    var tempo = '3h 15min';
    
    // Buscar no conteúdo
    document.querySelectorAll('*').forEach(function(el) {
      var texto = el.textContent || '';
      
      if (texto.includes('Distância total:')) {
        var match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
        if (match && match[1]) distancia = match[1];
      }
      
      if (texto.includes('Tempo estimado:')) {
        var match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
        if (match && match[1]) tempo = match[1];
      }
    });
    
    // Atualizar valores
    document.getElementById('dist-valor').textContent = distancia;
    document.getElementById('tempo-valor').textContent = tempo;
    
    // Esconder textos originais
    document.querySelectorAll('span').forEach(function(span) {
      if (span.id === 'dist-valor' || span.id === 'tempo-valor') return;
      
      var texto = span.textContent.trim();
      if (texto.match(/^\d+[.,]?\d*\s*km$/) || 
          texto.match(/^\d+h\s+\d+min$/) || 
          texto.match(/^\d+\s*min$/)) {
        span.textContent = '';
      }
    });
  }
  
  // Botão Visualizar
  document.addEventListener('click', function(e) {
    if (e.target && e.target.textContent && 
        (e.target.textContent.includes('Visualizar') || 
         e.target.textContent.includes('Relatório'))) {
      setTimeout(atualizarPainel, 1500);
    }
  });
  
  // Primeira atualização
  setTimeout(atualizarPainel, 1000);
  
  console.log('Painel de tempo/distância instalado com sucesso!');
})();