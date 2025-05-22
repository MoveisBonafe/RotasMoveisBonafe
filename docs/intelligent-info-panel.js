/**
 * Painel Inteligente de Informações
 * 
 * Este componente:
 * 1. Mostra detalhes inteligentes sobre a rota selecionada
 * 2. Fornece análises de consumo, tempo e custo da viagem
 * 3. Apresenta recomendações para otimização
 */
(function() {
  console.log("🧠 [InfoPanel] Inicializando painel inteligente");
  
  // Constantes e configurações
  const CONFIG = {
    // Velocidade média (km/h)
    velocidadeMedia: 90,
    
    // Consumo médio de combustível (km/L)
    consumoMedio: 10,
    
    // Preço médio do combustível (R$/L)
    precoCombustivel: 5.5,
    
    // Custo de manutenção (R$/km)
    custoManutencao: 0.5,
    
    // Tempo de parada em cada ponto (min)
    tempoParada: 15
  };
  
  // Estado do sistema
  let rotaAtual = null;
  let painelInfo = null;
  
  // Inicializar quando a página carregar
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 1500);
  setTimeout(iniciar, 3000);
  
  function iniciar() {
    console.log("🧠 [InfoPanel] Configurando painel");
    
    // Criar o painel de informações
    criarPainelInfo();
    
    // Configurar observadores para mudanças na rota
    observarMudancasRota();
    
    console.log("🧠 [InfoPanel] Painel configurado");
  }
  
  // Criar o painel de informações
  function criarPainelInfo() {
    // Verificar se já existe
    if (document.getElementById('intelligent-info-panel')) return;
    
    // Criar container para o painel
    painelInfo = document.createElement('div');
    painelInfo.id = 'intelligent-info-panel';
    painelInfo.className = 'intelligent-panel';
    painelInfo.style.display = 'none'; // Inicialmente oculto
    
    // Estrutura do painel
    painelInfo.innerHTML = `
      <div class="panel-header">
        <h3>Análise Inteligente de Rota</h3>
        <button class="close-button">&times;</button>
      </div>
      <div class="panel-content">
        <div class="route-summary">
          <div class="summary-item">
            <div class="icon"><i class="fas fa-road"></i></div>
            <div class="info">
              <div class="label">Distância</div>
              <div class="value" id="info-distancia">--</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="icon"><i class="fas fa-clock"></i></div>
            <div class="info">
              <div class="label">Tempo estimado</div>
              <div class="value" id="info-tempo">--</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="icon"><i class="fas fa-gas-pump"></i></div>
            <div class="info">
              <div class="label">Combustível</div>
              <div class="value" id="info-combustivel">--</div>
            </div>
          </div>
        </div>
        
        <div class="route-details">
          <h4>Detalhes da Viagem</h4>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Velocidade média</div>
              <div class="detail-value">${CONFIG.velocidadeMedia} km/h</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Tempo de deslocamento</div>
              <div class="detail-value" id="detail-tempo-deslocamento">--</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Tempo em paradas</div>
              <div class="detail-value" id="detail-tempo-paradas">--</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Consumo médio</div>
              <div class="detail-value">${CONFIG.consumoMedio} km/L</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Custo combustível</div>
              <div class="detail-value" id="detail-custo-combustivel">--</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Custo manutenção</div>
              <div class="detail-value" id="detail-custo-manutencao">--</div>
            </div>
          </div>
        </div>
        
        <div class="route-recommendations">
          <h4>Recomendações</h4>
          <ul id="recommendations-list">
            <li class="recommendation-item">Carregando recomendações...</li>
          </ul>
        </div>
      </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(painelInfo);
    
    // Adicionar estilos
    adicionarEstilos();
    
    // Configurar eventos
    painelInfo.querySelector('.close-button').addEventListener('click', () => {
      painelInfo.style.display = 'none';
    });
    
    // Adicionar botão para mostrar o painel
    adicionarBotaoInfo();
  }
  
  // Adicionar botão para mostrar informações inteligentes
  function adicionarBotaoInfo() {
    // Verificar se já existe
    if (document.getElementById('show-intelligent-info')) return;
    
    // Criar botão
    const botao = document.createElement('button');
    botao.id = 'show-intelligent-info';
    botao.className = 'intelligent-button';
    botao.innerHTML = '<i class="fas fa-chart-line"></i> Análise Inteligente';
    botao.title = 'Mostrar análise inteligente da rota';
    
    // Adicionar evento
    botao.addEventListener('click', () => {
      // Atualizar dados antes de mostrar
      atualizarDadosRota();
      
      // Mostrar painel
      painelInfo.style.display = 'block';
    });
    
    // Procurar um bom lugar para adicionar o botão
    const controlesRota = document.querySelector('.route-controls');
    if (controlesRota) {
      controlesRota.appendChild(botao);
    } else {
      // Alternativa: adicionar após o botão otimizar
      const botaoOtimizar = document.getElementById('optimize-button');
      if (botaoOtimizar && botaoOtimizar.parentNode) {
        botaoOtimizar.parentNode.appendChild(botao);
      }
    }
  }
  
  // Observar mudanças na rota
  function observarMudancasRota() {
    // Observar elemento de informações de rota
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          const infoRota = document.getElementById('route-info');
          if (infoRota) {
            // Extrair dados da rota
            extrairDadosRota(infoRota);
          }
        }
      });
    });
    
    // Iniciar observação
    const container = document.getElementById('bottom-info');
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
    
    // Também monitorar cliques nos botões
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    if (botaoVisualizar) {
      const clickOriginal = botaoVisualizar.onclick;
      botaoVisualizar.onclick = function(event) {
        // Executar original
        if (clickOriginal) clickOriginal.call(this, event);
        
        // Depois de um tempo, extrair dados
        setTimeout(() => {
          const infoRota = document.getElementById('route-info');
          if (infoRota) extrairDadosRota(infoRota);
        }, 1000);
      };
    }
    
    if (botaoOtimizar) {
      const clickOriginal = botaoOtimizar.onclick;
      botaoOtimizar.onclick = function(event) {
        // Executar original
        if (clickOriginal) clickOriginal.call(this, event);
        
        // Depois de um tempo, extrair dados
        setTimeout(() => {
          const infoRota = document.getElementById('route-info');
          if (infoRota) extrairDadosRota(infoRota);
        }, 1000);
      };
    }
  }
  
  // Extrair dados da rota das informações exibidas
  function extrairDadosRota(infoElement) {
    // Extrair distância
    const matchDistancia = infoElement.innerHTML.match(/Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i);
    if (!matchDistancia) return;
    
    // Extrair tempo
    const matchTempo = infoElement.innerHTML.match(/Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i);
    if (!matchTempo) return;
    
    // Extrair número de paradas
    const matchParadas = infoElement.innerHTML.match(/Paradas:<\/strong>\s*(\d+)/i);
    
    // Processar dados extraídos
    const distancia = parseFloat(matchDistancia[1].replace(',', '.'));
    const tempoHoras = parseInt(matchTempo[1]);
    const tempoMinutos = parseInt(matchTempo[2]);
    const paradas = matchParadas ? parseInt(matchParadas[1]) : 0;
    
    // Tipo de rota (normal ou otimizada)
    const tipoRota = infoElement.innerHTML.includes('Rota Otimizada') ? 'otimizada' : 'normal';
    
    // Armazenar dados
    rotaAtual = {
      distancia: distancia,
      tempoHoras: tempoHoras,
      tempoMinutos: tempoMinutos,
      tempoTotal: tempoHoras + (tempoMinutos / 60),
      paradas: paradas,
      tipo: tipoRota
    };
    
    console.log("🧠 [InfoPanel] Dados extraídos da rota:", rotaAtual);
    
    // Atualizar o botão de informações para indicar disponibilidade
    const botaoInfo = document.getElementById('show-intelligent-info');
    if (botaoInfo) {
      botaoInfo.classList.add('has-data');
      
      // Flash para chamar atenção
      botaoInfo.classList.add('flash');
      setTimeout(() => botaoInfo.classList.remove('flash'), 1000);
    }
  }
  
  // Atualizar dados no painel
  function atualizarDadosRota() {
    if (!rotaAtual) return;
    
    // Cálculos adicionais
    const consumo = rotaAtual.distancia / CONFIG.consumoMedio;
    const custoCombustivel = consumo * CONFIG.precoCombustivel;
    const custoManutencao = rotaAtual.distancia * CONFIG.custoManutencao;
    const tempoParadas = (rotaAtual.paradas * CONFIG.tempoParada) / 60; // em horas
    const tempoDeslocamento = rotaAtual.tempoTotal - tempoParadas;
    
    // Atualizar resumo
    document.getElementById('info-distancia').textContent = `${rotaAtual.distancia.toFixed(1)} km`;
    document.getElementById('info-tempo').textContent = `${rotaAtual.tempoHoras}h ${rotaAtual.tempoMinutos}min`;
    document.getElementById('info-combustivel').textContent = `${consumo.toFixed(1)} litros`;
    
    // Atualizar detalhes
    document.getElementById('detail-tempo-deslocamento').textContent = 
      `${Math.floor(tempoDeslocamento)}h ${Math.round((tempoDeslocamento - Math.floor(tempoDeslocamento)) * 60)}min`;
    
    document.getElementById('detail-tempo-paradas').textContent = 
      `${Math.floor(tempoParadas)}h ${Math.round((tempoParadas - Math.floor(tempoParadas)) * 60)}min`;
    
    document.getElementById('detail-custo-combustivel').textContent = `R$ ${custoCombustivel.toFixed(2)}`;
    document.getElementById('detail-custo-manutencao').textContent = `R$ ${custoManutencao.toFixed(2)}`;
    
    // Gerar recomendações
    gerarRecomendacoes();
  }
  
  // Gerar recomendações com base nos dados da rota
  function gerarRecomendacoes() {
    const recomendacoes = [];
    
    // Recomendações baseadas em distância
    if (rotaAtual.distancia > 300) {
      recomendacoes.push("Para viagens longas, planeje paradas a cada 3-4 horas para descanso.");
    }
    
    // Recomendações baseadas em tempo
    if (rotaAtual.tempoTotal > 5) {
      recomendacoes.push("Considere dividir esta viagem em dois dias para maior segurança e conforto.");
    }
    
    // Recomendações de consumo
    const consumo = rotaAtual.distancia / CONFIG.consumoMedio;
    if (consumo > 40) {
      recomendacoes.push("Leve combustível extra ou planeje abastecimentos durante o percurso.");
    }
    
    // Recomendações para otimização
    if (rotaAtual.tipo === 'normal' && rotaAtual.paradas > 3) {
      recomendacoes.push("Com múltiplas paradas, a otimização de rota pode gerar economia significativa.");
    }
    
    // Recomendações para horários
    recomendacoes.push("Para maior eficiência, evite tráfego intenso iniciando a viagem antes das 7h ou após as 9h.");
    
    // Atualizar lista de recomendações
    const lista = document.getElementById('recommendations-list');
    if (lista) {
      lista.innerHTML = recomendacoes.map(rec => `<li class="recommendation-item">${rec}</li>`).join('');
    }
  }
  
  // Adicionar estilos para o painel
  function adicionarEstilos() {
    if (document.getElementById('intelligent-panel-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'intelligent-panel-styles';
    style.textContent = `
      /* Painel Inteligente */
      .intelligent-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        overflow: auto;
        font-family: Arial, sans-serif;
      }
      
      /* Cabeçalho do painel */
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        border-radius: 8px 8px 0 0;
      }
      
      .panel-header h3 {
        margin: 0;
        color: #343a40;
        font-size: 18px;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6c757d;
      }
      
      .close-button:hover {
        color: #343a40;
      }
      
      /* Conteúdo do painel */
      .panel-content {
        padding: 15px;
      }
      
      /* Resumo da rota */
      .route-summary {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        background-color: #f8f9fa;
        border-radius: 6px;
        padding: 15px;
      }
      
      .summary-item {
        display: flex;
        align-items: center;
      }
      
      .summary-item .icon {
        width: 40px;
        height: 40px;
        background-color: #e9ecef;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
      }
      
      .summary-item .icon i {
        font-size: 18px;
        color: #495057;
      }
      
      .summary-item .label {
        font-size: 12px;
        color: #6c757d;
      }
      
      .summary-item .value {
        font-size: 16px;
        font-weight: bold;
        color: #343a40;
      }
      
      /* Detalhes da rota */
      .route-details {
        margin-bottom: 20px;
      }
      
      .route-details h4 {
        font-size: 16px;
        color: #343a40;
        margin-bottom: 10px;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 5px;
      }
      
      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      
      .detail-item {
        background-color: #f8f9fa;
        padding: 10px;
        border-radius: 4px;
      }
      
      .detail-label {
        font-size: 12px;
        color: #6c757d;
      }
      
      .detail-value {
        font-size: 14px;
        font-weight: bold;
        color: #343a40;
      }
      
      /* Recomendações */
      .route-recommendations {
        background-color: #f0f9ff;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid #0d6efd;
      }
      
      .route-recommendations h4 {
        font-size: 16px;
        color: #0d6efd;
        margin-bottom: 10px;
      }
      
      #recommendations-list {
        margin: 0;
        padding: 0 0 0 20px;
      }
      
      .recommendation-item {
        margin-bottom: 8px;
        color: #495057;
      }
      
      /* Botão para mostrar painel */
      .intelligent-button {
        background-color: #0d6efd;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 14px;
        cursor: pointer;
        margin-left: 10px;
        transition: background-color 0.2s;
      }
      
      .intelligent-button:hover {
        background-color: #0b5ed7;
      }
      
      .intelligent-button.has-data {
        background-color: #198754;
      }
      
      .intelligent-button.flash {
        animation: buttonFlash 1s ease;
      }
      
      @keyframes buttonFlash {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); background-color: #198754; }
        100% { transform: scale(1); }
      }
    `;
    
    document.head.appendChild(style);
    
    // Verificar se o Font Awesome está disponível
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
  }
})();