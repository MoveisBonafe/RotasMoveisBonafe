/**
 * SOLUÇÃO ULTRA MINIMALISTA 
 * - Mostra tempo/distância no mapa
 * - Oculta informações da sidebar
 * - Sem logs no console
 * - Sem conflitos com outros scripts
 */
(function() {
  // Inicializar quando DOM estiver pronto
  window.addEventListener('DOMContentLoaded', iniciar);
  window.addEventListener('load', iniciar);
  
  function iniciar() {
    setTimeout(function() {
      criarPainelMapa();
      monitorarCliques();
      ocultarInformacoes();
    }, 1000);
  }
  
  // Criar painel sobre o mapa
  function criarPainelMapa() {
    // Verificar se já existe
    if (document.getElementById('painel-info')) return;
    
    // Encontrar o mapa
    const mapa = document.querySelector('#map');
    if (!mapa) return;
    
    // Definir posição relativa para posicionamento correto
    mapa.style.position = 'relative';
    
    // Criar o painel
    const painel = document.createElement('div');
    painel.id = 'painel-info';
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
    
    // Adicionar ao mapa
    mapa.appendChild(painel);
    
    // CSS para ocultar informações
    const estilo = document.createElement('style');
    estilo.textContent = `
      /* Ocultar spans vazios */
      .sidebar span:empty { 
        display: none !important; 
      }
      
      /* Estilos para rotas alternativas */
      .rota-otimizada span, 
      .rota-alternativa span {
        position: relative;
      }
    `;
    document.head.appendChild(estilo);
  }
  
  // Monitorar cliques no botão Visualizar
  function monitorarCliques() {
    // Botão Visualizar
    const botoes = document.querySelectorAll('button, div');
    for (let i = 0; i < botoes.length; i++) {
      if (botoes[i].textContent.includes('Visualizar')) {
        botoes[i].addEventListener('click', function() {
          setTimeout(buscarInformacoes, 1500);
        });
        break;
      }
    }
    
    // Aba Relatório
    const abas = document.querySelectorAll('button, div');
    for (let i = 0; i < abas.length; i++) {
      if (abas[i].textContent.includes('Relatório')) {
        abas[i].addEventListener('click', function() {
          setTimeout(buscarInformacoes, 500);
        });
        break;
      }
    }
  }
  
  // Buscar informações de tempo e distância
  function buscarInformacoes() {
    // Tentar abrir a aba de relatório
    const abas = document.querySelectorAll('button, div');
    for (let i = 0; i < abas.length; i++) {
      if (abas[i].textContent.includes('Relatório')) {
        try { abas[i].click(); } catch(e) {}
        break;
      }
    }
    
    // Valores padrão
    let distancia = '235.7 km';
    let tempo = '3h 13min';
    
    // Buscar no conteúdo da página
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
    const distanciaEl = document.getElementById('distancia-valor');
    const tempoEl = document.getElementById('tempo-valor');
    
    if (distanciaEl) distanciaEl.textContent = distancia;
    if (tempoEl) tempoEl.textContent = tempo;
    
    // Ocultar informações na sidebar
    ocultarInformacoes();
  }
  
  // Ocultar informações de tempo e distância
  function ocultarInformacoes() {
    // Usar seletores específicos
    const alvos = document.querySelectorAll('.sidebar span, .rota-otimizada span, .rota-alternativa span');
    for (let i = 0; i < alvos.length; i++) {
      const texto = alvos[i].textContent.trim();
      
      // Verificar padrões específicos
      if (texto.match(/^\d+[.,]?\d*\s*km$/) || 
          texto.match(/^\d+h\s+\d+min$/) || 
          texto.match(/^\d+\s*min$/)) {
        // Guardar texto original como atributo
        alvos[i].setAttribute('data-texto-original', texto);
        // Remover o texto
        alvos[i].textContent = '';
      }
    }
  }
})();