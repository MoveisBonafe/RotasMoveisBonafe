// Painel simples para mostrar tempo e distância no mapa
(function() {
  // Variáveis para controle
  var painelCriado = false;
  var monitorInstalado = false;
  
  // Iniciar quando a página carregar
  window.addEventListener('load', iniciarPainel);
  document.addEventListener('DOMContentLoaded', iniciarPainel);
  
  // Tentar várias vezes para garantir
  setTimeout(iniciarPainel, 1000);
  setTimeout(iniciarPainel, 2000);
  setTimeout(iniciarPainel, 3000);
  
  function iniciarPainel() {
    criarPainelNoMapa();
    instalarMonitor();
    esconderTextosOriginais();
  }
  
  function criarPainelNoMapa() {
    // Evitar duplicação
    if (painelCriado) return;
    
    // Encontrar o mapa
    var mapa = document.getElementById('map');
    if (!mapa) return;
    
    // Configurar mapa para posicionamento
    mapa.style.position = 'relative';
    
    // Criar o painel
    var painel = document.createElement('div');
    painel.id = 'mb-painel';
    
    // Estilo inline (mais compatível)
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
    
    // HTML interno - mais simples
    var html = '';
    html += '<div style="display:flex;align-items:center;margin-right:15px">';
    html += '<span style="margin-right:5px;color:#ffd966">📏</span>';
    html += '<span id="mb-distancia">---</span>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center">';
    html += '<span style="margin-right:5px;color:#ffd966">⏱️</span>';
    html += '<span id="mb-tempo">---</span>';
    html += '</div>';
    
    painel.innerHTML = html;
    
    // Adicionar ao mapa
    mapa.appendChild(painel);
    painelCriado = true;
  }
  
  function instalarMonitor() {
    // Evitar duplicação
    if (monitorInstalado) return;
    
    // Monitorar cliques nos botões
    document.addEventListener('click', function(e) {
      // Se clicou em botão Visualizar
      if (e.target && e.target.textContent && 
          (e.target.textContent.indexOf('Visualizar') !== -1 ||
           e.target.textContent.indexOf('Otimizar') !== -1 ||
           e.target.textContent.indexOf('Relatório') !== -1)) {
        setTimeout(buscarInformacoes, 1500);
      }
    });
    
    // Verificação periódica
    setInterval(buscarInformacoes, 5000);
    
    // Primeira busca
    setTimeout(buscarInformacoes, 1000);
    
    monitorInstalado = true;
  }
  
  function buscarInformacoes() {
    // Valores padrão
    var distancia = '235 km';
    var tempo = '3h 15min';
    
    // Procurar em todo o DOM por textos específicos
    var elementos = document.getElementsByTagName('*');
    for (var i = 0; i < elementos.length; i++) {
      var texto = elementos[i].textContent || '';
      
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
    var distEl = document.getElementById('mb-distancia');
    var tempoEl = document.getElementById('mb-tempo');
    
    if (distEl) distEl.textContent = distancia;
    if (tempoEl) tempoEl.textContent = tempo;
    
    // Esconder os originais
    esconderTextosOriginais();
  }
  
  function esconderTextosOriginais() {
    // Adicionar estilo ao head se ainda não existe
    if (!document.getElementById('mb-estilo')) {
      var estilo = document.createElement('style');
      estilo.id = 'mb-estilo';
      estilo.innerHTML = `
        /* Esconder spans com padrões específicos */
        span:not(#mb-distancia):not(#mb-tempo) {
          position: relative;
        }
        
        /* Garantir que nossos spans estejam visíveis */
        #mb-distancia, #mb-tempo {
          display: inline !important;
          visibility: visible !important;
        }
      `;
      document.head.appendChild(estilo);
    }
    
    // Buscar todos os spans
    var spans = document.getElementsByTagName('span');
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      
      // Pular nossos próprios spans
      if (span.id === 'mb-distancia' || span.id === 'mb-tempo') continue;
      
      var textoSpan = span.textContent.trim();
      
      // Verificar padrões de tempo/distância
      if (textoSpan.match(/^\d+[.,]?\d*\s*km$/) || 
          textoSpan.match(/^\d+h\s+\d+min$/) || 
          textoSpan.match(/^\d+\s*min$/)) {
        
        // Esvaziar o texto
        span.textContent = '';
      }
    }
  }
})();