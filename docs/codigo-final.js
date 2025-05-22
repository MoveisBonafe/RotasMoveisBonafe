// CÓDIGO FINAL PARA COPIAR E COLAR NO ARQUIVO HTML
// Cole este bloco antes de fechar a tag </body>

// Solução final ultra simples - Móveis Bonafé
// Script independente que não causa conflitos
(function() {
  // Executar quando a página estiver pronta
  var scriptAtivo = false;
  
  function iniciar() {
    if (scriptAtivo) return;
    scriptAtivo = true;
    
    // Encontrar o mapa
    var mapa = document.getElementById('map');
    if (!mapa) return;
    
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
    
    // Função para esconder textos originais
    function esconderTextos() {
      // Percorrer todos os spans
      var spans = document.getElementsByTagName('span');
      for (var i = 0; i < spans.length; i++) {
        var span = spans[i];
        
        // Verificar se é nosso span (pular)
        if (span.id === 'dist-valor' || span.id === 'tempo-valor') {
          continue;
        }
        
        // Verificar se é padrão de tempo ou distância
        var texto = span.textContent.trim();
        if (/^\d+[.,]?\d*\s*km$/.test(texto) || 
            /^\d+h\s+\d+min$/.test(texto) || 
            /^\d+\s*min$/.test(texto)) {
          
          // Esconder
          span.textContent = '';
        }
      }
    }
    
    // Função para atualizar informações
    function atualizar() {
      // Valores padrão
      var distancia = '235 km';
      var tempo = '3h 15min';
      
      // Buscar no DOM
      var elementosDom = document.getElementsByTagName('*');
      for (var i = 0; i < elementosDom.length; i++) {
        var texto = elementosDom[i].textContent || '';
        
        // Buscar distância
        if (texto.indexOf('Distância total:') !== -1) {
          var matchDist = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
          if (matchDist && matchDist[1]) {
            distancia = matchDist[1];
          }
        }
        
        // Buscar tempo
        if (texto.indexOf('Tempo estimado:') !== -1) {
          var matchTempo = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
          if (matchTempo && matchTempo[1]) {
            tempo = matchTempo[1];
          }
        }
      }
      
      // Atualizar painel
      var distEl = document.getElementById('dist-valor');
      var tempoEl = document.getElementById('tempo-valor');
      
      if (distEl) distEl.textContent = distancia;
      if (tempoEl) tempoEl.textContent = tempo;
      
      // Esconder textos originais
      esconderTextos();
    }
    
    // Monitorar cliques
    document.addEventListener('click', function(e) {
      // Verificar se contém textos específicos
      if (e.target && e.target.textContent) {
        var texto = e.target.textContent;
        if (texto.indexOf('Visualizar') !== -1 || 
            texto.indexOf('Relatório') !== -1 || 
            texto.indexOf('Otimizar') !== -1) {
          
          // Atualizar após um tempo
          setTimeout(atualizar, 1500);
        }
      }
    });
    
    // Atualizar na inicialização
    setTimeout(atualizar, 1000);
    setTimeout(atualizar, 3000);
    
    // Verificação periódica
    setInterval(atualizar, 5000);
  }
  
  // Tentar iniciar de várias formas para garantir execução
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
  
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 1000);
  setTimeout(iniciar, 2000);
})();