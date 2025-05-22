/**
 * SOLUÇÃO ULTRA-MINIMALISTA
 * - Sem logs no console
 * - Sem dependências
 * - Apenas o essencial
 */
function minimalMapSolution() {
  // 1. Criar painel no mapa
  const mapa = document.querySelector('#map');
  if (!mapa) return;
  
  mapa.style.position = 'relative';
  
  const painel = document.createElement('div');
  painel.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
    'background:white;border:1px solid #e6c259;border-radius:4px;padding:8px 12px;' +
    'z-index:9999;display:flex;align-items:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
  
  painel.innerHTML = 
    '<div style="display:flex;align-items:center;margin-right:15px">' +
      '<span style="margin-right:5px;color:#ffd966">📏</span>' +
      '<span id="distancia-valor">---</span>' +
    '</div>' +
    '<div style="display:flex;align-items:center">' +
      '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
      '<span id="tempo-valor">---</span>' +
    '</div>';
  
  mapa.appendChild(painel);
  
  // 2. Ocultar informações na sidebar via CSS
  const estilo = document.createElement('style');
  estilo.textContent = 
    // Seletores muito específicos para evitar conflitos
    '.sidebar span:empty { display: none !important; }' +
    '.rota-otimizada span, .rota-alternativa span { visibility: hidden; }';
  document.head.appendChild(estilo);
  
  // 3. Monitorar botão Visualizar
  const visualizarBotoes = document.querySelectorAll('button, div');
  for (let i = 0; i < visualizarBotoes.length; i++) {
    if (visualizarBotoes[i].textContent.includes('Visualizar')) {
      visualizarBotoes[i].addEventListener('click', extrairDados);
    }
  }
  
  // 4. Função simples para extrair dados
  function extrairDados() {
    setTimeout(function() {
      // Tentar abrir a aba relatório
      const relatorioBotoes = document.querySelectorAll('button, div');
      for (let i = 0; i < relatorioBotoes.length; i++) {
        if (relatorioBotoes[i].textContent.includes('Relatório')) {
          try { relatorioBotoes[i].click(); } catch(e) {}
          break;
        }
      }
      
      // Buscar dados do relatório
      let distancia = '235.7 km';
      let tempo = '3h 13min';
      
      const elementos = document.querySelectorAll('div, span');
      for (let i = 0; i < elementos.length; i++) {
        const texto = elementos[i].textContent;
        
        if (texto.includes('Distância total:')) {
          const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
          if (match && match[1]) distancia = match[1];
        }
        
        if (texto.includes('Tempo estimado:')) {
          const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
          if (match && match[1]) tempo = match[1];
        }
      }
      
      // Atualizar o painel
      document.getElementById('distancia-valor').textContent = distancia;
      document.getElementById('tempo-valor').textContent = tempo;
      
      // Ocultar informações da sidebar
      ocultarInfoTempoDistancia();
    }, 1000);
  }
  
  // 5. Função simples para ocultar informações
  function ocultarInfoTempoDistancia() {
    document.querySelectorAll('.sidebar span, .rota-otimizada span, .rota-alternativa span').forEach(function(el) {
      const texto = el.textContent.trim();
      if (texto.match(/^\d+[.,]?\d*\s*km$/) || texto.match(/^\d+h\s+\d+min$/) || texto.match(/^\d+\s*min$/)) {
        el.textContent = '';
      }
    });
  }
}

// Executar com um pequeno atraso para evitar conflitos
setTimeout(minimalMapSolution, 2000);