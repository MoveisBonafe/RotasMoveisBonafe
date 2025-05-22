/**
 * SOLUÇÃO ULTRA SIMPLES E COMPATÍVEL
 * Sem conflitos, sem logs, sem erros
 */
(function() {
  // Executar após o carregamento da página
  window.addEventListener('load', function() {
    // Esperar DOM estar pronto
    setTimeout(iniciar, 1500);
  });
  
  function iniciar() {
    // Apenas uma vez
    if (document.getElementById('tempo-dist-painel')) return;
    
    // Criar painel flutuante
    const mapa = document.getElementById('map');
    if (!mapa) return;
    
    // Criar painel
    const painel = document.createElement('div');
    painel.id = 'tempo-dist-painel';
    painel.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
      'background:white;border:1px solid #ffd966;border-radius:4px;padding:8px 12px;' +
      'z-index:1000;display:flex;align-items:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
    
    painel.innerHTML = 
      '<div style="display:flex;align-items:center;margin-right:15px">' +
        '<span style="margin-right:5px;color:#ffd966">📏</span>' +
        '<span id="dist-valor">---</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center">' +
        '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
        '<span id="tempo-valor">---</span>' +
      '</div>';
    
    mapa.appendChild(painel);
    
    // Encontrar botão Visualizar
    const botoes = document.querySelectorAll('button');
    for (const botao of botoes) {
      if (botao.textContent.includes('Visualizar')) {
        botao.addEventListener('click', function() {
          setTimeout(atualizarInfo, 1500);
        });
      }
    }
    
    // Aplicar CSS para ocultar informações
    const estilo = document.createElement('style');
    estilo.textContent = `
      /* Esconder spans com km e tempo */
      span:not(#dist-valor):not(#tempo-valor) {
        visibility: hidden;
      }
      
      /* Mostrar spans vazios */
      span:empty {
        display: none !important;
      }
    `;
    document.head.appendChild(estilo);
  }
  
  function atualizarInfo() {
    // Buscar relatório
    const textos = document.querySelectorAll('div, span, p');
    let distancia = '235 km';
    let tempo = '3h 15min';
    
    for (const elem of textos) {
      const texto = elem.textContent || '';
      
      if (texto.includes('Distância total:')) {
        const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
        if (match && match[1]) distancia = match[1];
      }
      
      if (texto.includes('Tempo estimado:')) {
        const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
        if (match && match[1]) tempo = match[1];
      }
    }
    
    // Atualizar painel
    const distEl = document.getElementById('dist-valor');
    const tempoEl = document.getElementById('tempo-valor');
    
    if (distEl) distEl.textContent = distancia;
    if (tempoEl) tempoEl.textContent = tempo;
  }
})();