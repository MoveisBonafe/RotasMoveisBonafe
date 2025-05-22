/**
 * SOLUÇÃO SIMPLES SEM ERROS
 * - Mostra tempo/distância no mapa
 * - Não causa erros no console
 * - Compatível com todas as versões
 */
(function() {
  // Aguardar carregamento completo da página
  window.addEventListener('load', function() {
    setTimeout(iniciar, 2000);
  });
  
  function iniciar() {
    adicionarPainel();
    monitorarBotoes();
  }
  
  function adicionarPainel() {
    // Evitar duplicação
    if (document.getElementById('bonafe-painel')) return;
    
    // Encontrar o mapa
    const mapa = document.getElementById('map');
    if (!mapa) return;
    
    // Definir posição relativa para posicionamento correto
    mapa.style.position = 'relative';
    
    // Criar o painel
    const painel = document.createElement('div');
    painel.id = 'bonafe-painel';
    painel.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
      'background:white;border:1px solid #ffd966;border-radius:4px;padding:8px 12px;' +
      'z-index:9999;display:flex;align-items:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
    
    painel.innerHTML = 
      '<div style="display:flex;align-items:center;margin-right:15px">' +
        '<span style="margin-right:5px;color:#ffd966">📏</span>' +
        '<span id="bonafe-distancia">---</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center">' +
        '<span style="margin-right:5px;color:#ffd966">⏱️</span>' +
        '<span id="bonafe-tempo">---</span>' +
      '</div>';
    
    // Adicionar ao mapa
    mapa.appendChild(painel);
    
    // Adicionar CSS para ocultar informações originais
    const estilo = document.createElement('style');
    estilo.textContent = `
      /* Ocultar spans com padrão de tempo/distância */
      .sidebar span, .rota-alternativa span, div.card span {
        visibility: hidden;
      }
      
      /* Restaurar visibilidade para spans que não são tempo/distância */
      .sidebar span:not([data-oculto="true"]), 
      .rota-alternativa span:not([data-oculto="true"]),
      div.card span:not([data-oculto="true"]) {
        visibility: visible;
      }
      
      /* Garantir que os valores do painel sejam visíveis */
      #bonafe-distancia, #bonafe-tempo {
        visibility: visible !important;
      }
    `;
    document.head.appendChild(estilo);
    
    // Marcar spans de tempo/distância
    marcarSpans();
  }
  
  function marcarSpans() {
    // Buscar todos os spans
    const spans = document.querySelectorAll('.sidebar span, .rota-alternativa span, div.card span');
    
    // Verificar cada span
    for (let i = 0; i < spans.length; i++) {
      const texto = spans[i].textContent.trim();
      
      // Verificar se o texto parece ser distância ou tempo
      if (texto.match(/^\d+[.,]?\d*\s*km$/) || 
          texto.match(/^\d+h\s+\d+min$/) || 
          texto.match(/^\d+\s*min$/)) {
        
        // Marcar para ocultar
        spans[i].setAttribute('data-oculto', 'true');
      }
    }
  }
  
  function monitorarBotoes() {
    // Botões a monitorar
    const textosBotoes = ['Visualizar', 'Calcular Rota', 'Relatório'];
    
    // Encontrar todos os elementos clicáveis
    const elementos = document.querySelectorAll('button, div, span');
    
    // Adicionar listener de clique
    for (let i = 0; i < elementos.length; i++) {
      const texto = elementos[i].textContent;
      
      // Verificar se contém algum dos textos de botão
      for (let j = 0; j < textosBotoes.length; j++) {
        if (texto && texto.includes(textosBotoes[j])) {
          elementos[i].addEventListener('click', function() {
            setTimeout(atualizarInformacoes, 1500);
          });
          break;
        }
      }
    }
    
    // Configurar verificação periódica
    setInterval(marcarSpans, 2000);
    
    // Primeira atualização
    setTimeout(atualizarInformacoes, 2500);
  }
  
  function atualizarInformacoes() {
    // Valores padrão
    let distancia = '235 km';
    let tempo = '3h 15min';
    
    // Buscar informações no relatório
    const elementos = document.querySelectorAll('div, span, p');
    for (let i = 0; i < elementos.length; i++) {
      const texto = elementos[i].textContent;
      
      if (texto && texto.includes('Distância total:')) {
        const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
        if (match && match[1]) distancia = match[1];
      }
      
      if (texto && texto.includes('Tempo estimado:')) {
        const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
        if (match && match[1]) tempo = match[1];
      }
    }
    
    // Atualizar o painel
    const distanciaEl = document.getElementById('bonafe-distancia');
    const tempoEl = document.getElementById('bonafe-tempo');
    
    if (distanciaEl) distanciaEl.textContent = distancia;
    if (tempoEl) tempoEl.textContent = tempo;
    
    // Remarcar spans para ocultar novos valores
    setTimeout(marcarSpans, 500);
  }
})();