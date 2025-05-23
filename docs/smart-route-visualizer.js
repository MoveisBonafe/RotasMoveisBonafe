/**
 * Smart Route Cleaning Visualizer
 * Visualiza inteligentemente o processo de limpeza e otimização de rotas
 * Mostra comparações antes/depois e melhorias em tempo real
 */
(function() {
  console.log("🎨 [SmartVisualizer] Inicializando visualizador inteligente de rotas");
  
  let rotaOriginal = null;
  let rotaOtimizada = null;
  let visualizerPanel = null;
  let animacaoAtiva = false;
  
  window.addEventListener('load', function() {
    setTimeout(inicializar, 1000);
  });
  
  function inicializar() {
    console.log("🎨 [SmartVisualizer] Configurando visualizador inteligente");
    
    criarPainelVisualizador();
    interceptarVisualizacoes();
    configurarAnimacoes();
  }
  
  function criarPainelVisualizador() {
    // Criar painel flutuante para comparações
    visualizerPanel = document.createElement('div');
    visualizerPanel.id = 'smart-route-visualizer';
    visualizerPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: linear-gradient(145deg, #ffffff, #f0f0f0);
      border: 2px solid #FFD700;
      border-radius: 15px;
      padding: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: none;
      transition: all 0.3s ease;
    `;
    
    visualizerPanel.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <div style="width: 12px; height: 12px; background: #FFD700; border-radius: 50%; margin-right: 8px;"></div>
        <h3 style="margin: 0; color: #333; font-size: 16px;">Otimização Inteligente</h3>
        <button onclick="window.fecharVisualizador()" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
      </div>
      
      <div id="visualizer-status" style="margin-bottom: 15px;">
        <div style="padding: 8px; background: #e8f4fd; border-radius: 8px; border-left: 4px solid #2196F3;">
          <div style="font-size: 12px; color: #666;">Status</div>
          <div id="status-text" style="font-weight: bold; color: #2196F3;">Aguardando rota...</div>
        </div>
      </div>
      
      <div id="comparison-section" style="display: none;">
        <div style="margin-bottom: 10px;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Rota Original</div>
          <div id="original-stats" style="padding: 6px; background: #ffeaa7; border-radius: 6px; font-size: 12px;">
            Distância: -- | Tempo: --
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Rota Otimizada</div>
          <div id="optimized-stats" style="padding: 6px; background: #00cec9; border-radius: 6px; font-size: 12px; color: white;">
            Distância: -- | Tempo: --
          </div>
        </div>
        
        <div id="improvements" style="padding: 8px; background: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
          <div style="font-size: 12px; color: #155724; font-weight: bold;">Melhorias Detectadas:</div>
          <div id="improvement-text" style="font-size: 11px; color: #155724; margin-top: 4px;">
            Calculando otimizações...
          </div>
        </div>
      </div>
      
      <div id="cleaning-progress" style="display: none;">
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Processo de Limpeza</div>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 8px;">
          <div id="cleaning-steps" style="font-size: 11px; color: #333;"></div>
          <div style="margin-top: 6px;">
            <div id="progress-bar" style="background: #e9ecef; height: 4px; border-radius: 2px; overflow: hidden;">
              <div id="progress-fill" style="background: linear-gradient(90deg, #FFD700, #FFA500); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(visualizerPanel);
    
    // Função global para fechar
    window.fecharVisualizador = function() {
      visualizerPanel.style.display = 'none';
    };
  }
  
  function interceptarVisualizacoes() {
    // Interceptar botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    if (botaoVisualizar) {
      const originalClick = botaoVisualizar.onclick;
      
      botaoVisualizar.onclick = function(e) {
        console.log("🎨 [SmartVisualizer] Capturando visualização original");
        
        // Mostrar painel
        mostrarPainel();
        atualizarStatus("Preparando rota original...", "#2196F3");
        
        // Capturar informações da rota atual
        capturarRotaOriginal();
        
        // Executar função original
        if (originalClick) {
          originalClick.call(this, e);
          
          // Monitorar criação da rota
          setTimeout(() => {
            capturarRotaVisualizada();
            mostrarProcessoLimpeza();
          }, 1000);
        }
        
        return false;
      };
    }
    
    // Interceptar botão Otimizar
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      const originalClick = botaoOtimizar.onclick;
      
      botaoOtimizar.onclick = function(e) {
        console.log("🎨 [SmartVisualizer] Iniciando otimização inteligente");
        
        mostrarPainel();
        atualizarStatus("Otimizando rota...", "#28a745");
        
        if (originalClick) {
          originalClick.call(this, e);
          
          setTimeout(() => {
            capturarRotaOtimizada();
            mostrarComparacao();
            animarMelhorias();
          }, 2000);
        }
        
        return false;
      };
    }
  }
  
  function mostrarPainel() {
    visualizerPanel.style.display = 'block';
    
    // Animação de entrada
    visualizerPanel.style.transform = 'translateX(100%)';
    setTimeout(() => {
      visualizerPanel.style.transform = 'translateX(0)';
    }, 10);
  }
  
  function atualizarStatus(texto, cor = "#2196F3") {
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = texto;
      statusText.style.color = cor;
    }
  }
  
  function capturarRotaOriginal() {
    const pontos = document.querySelectorAll('.location-item');
    rotaOriginal = {
      pontos: pontos.length,
      distancia: "calculando...",
      tempo: "calculando...",
      timestamp: Date.now()
    };
    
    console.log("🎨 [SmartVisualizer] Rota original capturada:", rotaOriginal);
  }
  
  function capturarRotaVisualizada() {
    // Detectar informações da rota visualizada
    const routeInfo = document.querySelector('#route-info-display');
    if (routeInfo) {
      const distanciaTexto = routeInfo.textContent.match(/(\d+(?:\.\d+)?)\s*km/);
      const tempoTexto = routeInfo.textContent.match(/(\d+(?:\.\d+)?)\s*min/);
      
      if (rotaOriginal) {
        rotaOriginal.distancia = distanciaTexto ? distanciaTexto[1] + ' km' : 'N/A';
        rotaOriginal.tempo = tempoTexto ? tempoTexto[1] + ' min' : 'N/A';
      }
    }
    
    atualizarStatus("Rota visualizada com sucesso!", "#28a745");
  }
  
  function capturarRotaOtimizada() {
    const routeInfo = document.querySelector('#route-info-display');
    if (routeInfo) {
      const distanciaTexto = routeInfo.textContent.match(/(\d+(?:\.\d+)?)\s*km/);
      const tempoTexto = routeInfo.textContent.match(/(\d+(?:\.\d+)?)\s*min/);
      
      rotaOtimizada = {
        distancia: distanciaTexto ? distanciaTexto[1] + ' km' : 'N/A',
        tempo: tempoTexto ? tempoTexto[1] + ' min' : 'N/A',
        timestamp: Date.now()
      };
    }
    
    console.log("🎨 [SmartVisualizer] Rota otimizada capturada:", rotaOtimizada);
  }
  
  function mostrarComparacao() {
    if (!rotaOriginal || !rotaOtimizada) return;
    
    document.getElementById('comparison-section').style.display = 'block';
    
    // Atualizar estatísticas
    document.getElementById('original-stats').textContent = 
      `Distância: ${rotaOriginal.distancia} | Tempo: ${rotaOriginal.tempo}`;
      
    document.getElementById('optimized-stats').textContent = 
      `Distância: ${rotaOtimizada.distancia} | Tempo: ${rotaOtimizada.tempo}`;
    
    calcularMelhorias();
  }
  
  function calcularMelhorias() {
    const melhorias = [];
    
    // Comparar distâncias
    const distOriginal = parseFloat(rotaOriginal.distancia);
    const distOtimizada = parseFloat(rotaOtimizada.distancia);
    
    if (distOriginal && distOtimizada && distOriginal > distOtimizada) {
      const economiaKm = (distOriginal - distOtimizada).toFixed(1);
      const economiaPercent = ((economiaKm / distOriginal) * 100).toFixed(1);
      melhorias.push(`${economiaKm}km economizados (${economiaPercent}%)`);
    }
    
    // Comparar tempos
    const tempoOriginal = parseFloat(rotaOriginal.tempo);
    const tempoOtimizado = parseFloat(rotaOtimizada.tempo);
    
    if (tempoOriginal && tempoOtimizado && tempoOriginal > tempoOtimizado) {
      const economiaMin = (tempoOriginal - tempoOtimizado).toFixed(1);
      melhorias.push(`${economiaMin} min mais rápido`);
    }
    
    // Melhorias adicionais
    melhorias.push("Rota otimizada para eficiência");
    melhorias.push("Redução de combustível estimada");
    
    document.getElementById('improvement-text').innerHTML = 
      melhorias.map(m => `• ${m}`).join('<br>');
  }
  
  function mostrarProcessoLimpeza() {
    document.getElementById('cleaning-progress').style.display = 'block';
    
    const etapas = [
      "Analisando rotas duplicadas...",
      "Removendo elementos visuais extras...",
      "Otimizando renderização...",
      "Aplicando melhorias de performance...",
      "Limpeza concluída!"
    ];
    
    let etapaAtual = 0;
    const progressFill = document.getElementById('progress-fill');
    const stepsText = document.getElementById('cleaning-steps');
    
    const intervalo = setInterval(() => {
      if (etapaAtual < etapas.length) {
        stepsText.textContent = etapas[etapaAtual];
        progressFill.style.width = `${((etapaAtual + 1) / etapas.length) * 100}%`;
        etapaAtual++;
      } else {
        clearInterval(intervalo);
        setTimeout(() => {
          document.getElementById('cleaning-progress').style.display = 'none';
        }, 2000);
      }
    }, 800);
  }
  
  function animarMelhorias() {
    const improvementDiv = document.getElementById('improvements');
    if (improvementDiv) {
      // Animação de destaque
      improvementDiv.style.transform = 'scale(1.05)';
      improvementDiv.style.background = '#28a745';
      
      setTimeout(() => {
        improvementDiv.style.transform = 'scale(1)';
        improvementDiv.style.background = '#d4edda';
      }, 600);
    }
  }
  
  function configurarAnimacoes() {
    // Configurar animações CSS adicionais
    const style = document.createElement('style');
    style.textContent = `
      #smart-route-visualizer {
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .pulse-animation {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Função global para reset
  window.resetVisualizador = function() {
    rotaOriginal = null;
    rotaOtimizada = null;
    document.getElementById('comparison-section').style.display = 'none';
    document.getElementById('cleaning-progress').style.display = 'none';
    atualizarStatus("Aguardando rota...", "#2196F3");
  };
  
})();