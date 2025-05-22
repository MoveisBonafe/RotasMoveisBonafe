/**
 * SOLUÇÃO FINAL ULTRA ESTÁVEL
 * Otimizador de Rotas Móveis Bonafé
 * Exibe tempo e distância sobre o mapa e remove informações duplicadas
 */
(function() {
  // Variáveis para controle de estado
  let painelCriado = false;
  let monitorando = false;
  
  // Inicializar quando a página estiver pronta
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
  
  // Função principal de inicialização
  function inicializar() {
    // Tentar múltiplas vezes para garantir que o DOM esteja pronto
    setTimeout(configurar, 500);
    setTimeout(configurar, 1000);
    setTimeout(configurar, 2000);
    // Também inicializar quando a página terminar de carregar
    window.addEventListener('load', function() {
      setTimeout(configurar, 500);
    });
  }
  
  // Configuração completa
  function configurar() {
    try {
      criarPainelInformacoes();
      monitorarBotoes();
      ocultarInformacoesDuplicadas();
    } catch(e) {
      // Silenciosamente ignorar erros para não afetar o funcionamento
    }
  }
  
  // Criar painel de informações sobre o mapa
  function criarPainelInformacoes() {
    // Evitar criar múltiplos painéis
    if (painelCriado || document.getElementById('bonafe-painel-info')) {
      return;
    }
    
    // Encontrar o container do mapa
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      return;
    }
    
    // Garantir que o mapa tenha posição relativa para o posicionamento absoluto funcionar
    if (window.getComputedStyle(mapContainer).position === 'static') {
      mapContainer.style.position = 'relative';
    }
    
    // Criar o elemento do painel
    const painel = document.createElement('div');
    painel.id = 'bonafe-painel-info';
    painel.style.cssText = `
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background-color: white;
      border: 1px solid #ffd966;
      border-radius: 6px;
      padding: 8px 15px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 14px;
      color: #333;
    `;
    
    // Conteúdo do painel
    painel.innerHTML = `
      <div style="display: flex; align-items: center; margin-right: 15px;">
        <span style="margin-right: 5px; color: #ffd966;">📏</span>
        <span id="bonafe-distancia-valor" style="font-weight: 500;">---</span>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 5px; color: #ffd966;">⏱️</span>
        <span id="bonafe-tempo-valor" style="font-weight: 500;">---</span>
      </div>
    `;
    
    // Adicionar ao mapa
    mapContainer.appendChild(painel);
    
    // Adicionar estilos específicos para ocultar informações duplicadas
    const estilos = document.createElement('style');
    estilos.textContent = `
      /* Ocultar spans vazios para evitar espaços em branco */
      .sidebar span:empty { 
        display: none !important; 
      }
      
      /* Garantir que spans de tempo/distância não afetem o layout */
      .rota-otimizada span:empty, 
      .rota-alternativa span:empty {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Manter visíveis apenas os valores específicos no painel */
      #bonafe-distancia-valor,
      #bonafe-tempo-valor {
        display: inline-block !important;
        visibility: visible !important;
      }
    `;
    document.head.appendChild(estilos);
    
    painelCriado = true;
  }
  
  // Monitorar botões para atualizar as informações
  function monitorarBotoes() {
    if (monitorando) {
      return;
    }
    
    // Função para encontrar elementos por texto
    function encontrarElementoPorTexto(texto) {
      const elementos = document.querySelectorAll('button, div, span');
      for (let i = 0; i < elementos.length; i++) {
        if (elementos[i].textContent && elementos[i].textContent.includes(texto)) {
          return elementos[i];
        }
      }
      return null;
    }
    
    // Monitorar o botão Visualizar
    const botaoVisualizar = encontrarElementoPorTexto('Visualizar');
    if (botaoVisualizar) {
      botaoVisualizar.addEventListener('click', function() {
        setTimeout(atualizarInformacoes, 1500);
      });
    }
    
    // Monitorar a aba de Relatório
    const abaRelatorio = encontrarElementoPorTexto('Relatório');
    if (abaRelatorio) {
      abaRelatorio.addEventListener('click', function() {
        setTimeout(atualizarInformacoes, 500);
      });
    }
    
    // Adicionar observador de mutação para detectar mudanças no DOM
    try {
      const observador = new MutationObserver(function(mutacoes) {
        // Verificar se houve mudanças significativas na página
        let deveAtualizar = false;
        
        for (let i = 0; i < mutacoes.length; i++) {
          const mutacao = mutacoes[i];
          // Se novos nós foram adicionados
          if (mutacao.addedNodes.length > 0) {
            deveAtualizar = true;
            break;
          }
        }
        
        if (deveAtualizar) {
          setTimeout(ocultarInformacoesDuplicadas, 300);
        }
      });
      
      // Observar mudanças em toda a página
      observador.observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (e) {
      // Ignorar erro se MutationObserver não for suportado
    }
    
    monitorando = true;
  }
  
  // Atualizar informações de tempo e distância
  function atualizarInformacoes() {
    // Valores padrão
    let distancia = '---';
    let tempo = '---';
    
    // Tentar buscar do relatório primeiro
    const elementos = document.querySelectorAll('div, span, p');
    for (let i = 0; i < elementos.length; i++) {
      const texto = elementos[i].textContent || '';
      
      // Buscar distância
      if (texto.includes('Distância total:')) {
        const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
        if (match && match[1]) {
          distancia = match[1].trim();
        }
      }
      
      // Buscar tempo
      if (texto.includes('Tempo estimado:')) {
        const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
        if (match && match[1]) {
          tempo = match[1].trim();
        }
      }
    }
    
    // Se não encontrou no relatório, buscar em spans específicos
    if (distancia === '---' || tempo === '---') {
      const spans = document.querySelectorAll('span');
      for (let i = 0; i < spans.length; i++) {
        const texto = spans[i].textContent || '';
        
        // Padrão de distância: "235.7 km"
        if (texto.match(/^\d+[.,]?\d*\s*km$/)) {
          distancia = texto.trim();
        }
        
        // Padrão de tempo: "3h 15min" ou "45min"
        if (texto.match(/^\d+h\s+\d+min$/) || texto.match(/^\d+\s*min$/)) {
          tempo = texto.trim();
        }
      }
    }
    
    // Atualizar o painel se encontrou informações
    const distanciaEl = document.getElementById('bonafe-distancia-valor');
    const tempoEl = document.getElementById('bonafe-tempo-valor');
    
    if (distanciaEl && distancia !== '---') {
      distanciaEl.textContent = distancia;
    }
    
    if (tempoEl && tempo !== '---') {
      tempoEl.textContent = tempo;
    }
    
    // Ocultar informações duplicadas
    ocultarInformacoesDuplicadas();
  }
  
  // Ocultar informações duplicadas de tempo e distância
  function ocultarInformacoesDuplicadas() {
    // Buscar por elementos que contém informações de tempo e distância
    const alvos = document.querySelectorAll('.sidebar span, .rota-otimizada span, .rota-alternativa span, div.card span, div.card-body span');
    
    for (let i = 0; i < alvos.length; i++) {
      const elemento = alvos[i];
      const texto = elemento.textContent.trim();
      
      // Verificar se o texto corresponde a um padrão de tempo ou distância
      if (texto.match(/^\d+[.,]?\d*\s*km$/) || 
          texto.match(/^\d+h\s+\d+min$/) || 
          texto.match(/^\d+\s*min$/)) {
        
        // Guardar o texto original como atributo de dados
        if (!elemento.hasAttribute('data-texto-original')) {
          elemento.setAttribute('data-texto-original', texto);
        }
        
        // Esvaziar o texto para ocultar
        elemento.textContent = '';
      }
    }
  }
})();