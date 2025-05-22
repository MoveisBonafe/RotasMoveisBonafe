/**
 * Solução Simplificada - Painel de Tempo e Distância
 * Para ser aplicada no site Móveis Bonafé
 */
(function() {
  // Aguardar carregamento do DOM
  window.addEventListener('load', iniciar);
  document.addEventListener('DOMContentLoaded', iniciar);
  
  // Variáveis de controle
  let painelCriado = false;
  
  // Função principal de inicialização
  function iniciar() {
    if (painelCriado) return;
    
    // Tentar criar painel ao lado do botão Visualizar
    const botao = encontrarBotaoVisualizar();
    if (botao) {
      criarPainelAoLado(botao);
    }
  }
  
  // Encontrar o botão Visualizar na página
  function encontrarBotaoVisualizar() {
    // Estratégia 1: Buscar botão pelo texto
    const botoes = document.querySelectorAll('button, a, div');
    for (let i = 0; i < botoes.length; i++) {
      if (botoes[i].textContent && botoes[i].textContent.trim() === 'Visualizar') {
        return botoes[i];
      }
    }
    
    // Estratégia 2: Botões amarelos na página
    const elementosAmarelos = document.querySelectorAll('[style*="background-color: rgb(255, 193, 7)"]');
    for (let i = 0; i < elementosAmarelos.length; i++) {
      if (elementosAmarelos[i].textContent && elementosAmarelos[i].textContent.includes('Visualizar')) {
        return elementosAmarelos[i];
      }
    }
    
    return null;
  }
  
  // Criar painel ao lado do botão
  function criarPainelAoLado(botao) {
    // 1. Adicionar estilos CSS
    const estilo = document.createElement('style');
    estilo.textContent = `
      /* Container que agrupa botão e painel */
      .info-container {
        display: flex;
        align-items: center;
        margin: 10px 0;
        padding: 5px;
        background-color: #f8f9fa;
        border-radius: 6px;
      }
      
      /* Painel de informações */
      .info-painel {
        margin-left: 15px;
        padding: 8px 12px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #555;
      }
      
      /* Distância e tempo */
      .info-item {
        margin-bottom: 5px;
      }
      
      /* Ícones */
      .info-icon {
        margin-right: 5px;
        color: #ffd966;
      }
    `;
    document.head.appendChild(estilo);
    
    // 2. Criar container para agrupar botão e painel
    const container = document.createElement('div');
    container.className = 'info-container';
    
    // 3. Mover botão para dentro do container
    const pai = botao.parentNode;
    pai.removeChild(botao);
    container.appendChild(botao);
    
    // 4. Criar painel de informações
    const painel = document.createElement('div');
    painel.className = 'info-painel';
    painel.innerHTML = `
      <div class="info-item">
        <span class="info-icon">📏</span>
        <span class="info-distancia">---</span>
      </div>
      <div class="info-item">
        <span class="info-icon">⏱️</span>
        <span class="info-tempo">---</span>
      </div>
    `;
    container.appendChild(painel);
    
    // 5. Adicionar container ao DOM no lugar do botão
    pai.appendChild(container);
    
    // 6. Adicionar listener de clique ao botão
    botao.addEventListener('click', function() {
      setTimeout(buscarInformacoes, 1500);
    });
    
    // 7. Monitorar mudanças na página
    setInterval(buscarInformacoes, 3000);
    
    painelCriado = true;
  }
  
  // Buscar informações de tempo e distância
  function buscarInformacoes() {
    // Valores padrão
    let distancia = '---';
    let tempo = '---';
    
    // Buscar em todo o DOM
    document.querySelectorAll('*').forEach(function(elemento) {
      const texto = elemento.textContent || '';
      
      // Buscar distância
      if (texto.includes('Distância total:')) {
        const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
        if (match && match[1]) {
          distancia = match[1];
        }
      }
      
      // Buscar tempo
      if (texto.includes('Tempo estimado:')) {
        const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
        if (match && match[1]) {
          tempo = match[1];
        }
      }
    });
    
    // Atualizar painel
    const distanciaEl = document.querySelector('.info-distancia');
    const tempoEl = document.querySelector('.info-tempo');
    
    if (distanciaEl) distanciaEl.textContent = distancia;
    if (tempoEl) tempoEl.textContent = tempo;
    
    // Esconder informações duplicadas
    document.querySelectorAll('span').forEach(function(span) {
      // Ignorar nossos próprios spans
      if (span.className === 'info-distancia' || span.className === 'info-tempo') {
        return;
      }
      
      const texto = span.textContent.trim();
      // Verificar padrões de tempo e distância
      if (texto.match(/^\d+[.,]?\d*\s*km$/) || 
          texto.match(/^\d+h\s+\d+min$/) || 
          texto.match(/^\d+\s*min$/)) {
        // Esconder texto
        span.textContent = '';
      }
    });
  }
  
  // Tentar em vários momentos
  setTimeout(iniciar, 1000);
  setTimeout(iniciar, 2000);
  setTimeout(iniciar, 3000);
})();