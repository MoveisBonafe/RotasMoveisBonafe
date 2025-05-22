/**
 * Cálculo Direto e Imediato
 * 
 * Este script força o cálculo imediato usando exatamente o mesmo algoritmo
 * para qualquer tipo de rota, garantindo valores consistentes.
 */
(function() {
  console.log("⚡ [CalculoDireto] Inicializando versão final");
  
  // Velocidade média (km/h)
  const VELOCIDADE = 90;
  
  // Monitoramento e estado
  let servicoDirecoes = null;
  let rotaNormal = null;
  
  // Configurar após carregamento
  window.addEventListener('DOMContentLoaded', configurar);
  setTimeout(configurar, 1000);
  setTimeout(configurar, 3000);
  
  function configurar() {
    console.log("⚡ [CalculoDireto] Configurando sistema");
    
    // Configurar intervalo para verificação contínua
    setInterval(verificarECorrigir, 500);
    
    // Monitorar alterações na interface
    observarDOM();
    
    // Monitorar botões
    const btnVisualizar = document.getElementById('visualize-button');
    const btnOtimizar = document.getElementById('optimize-button');
    
    if (btnVisualizar) {
      const clickOriginal = btnVisualizar.onclick;
      btnVisualizar.onclick = function(event) {
        if (clickOriginal) clickOriginal.call(this, event);
        // Marcar tipo de rota
        setTimeout(() => {
          window.tipoRota = 'normal';
          verificarECorrigir();
        }, 1000);
        setTimeout(verificarECorrigir, 2000);
      };
    }
    
    if (btnOtimizar) {
      const clickOriginal = btnOtimizar.onclick;
      btnOtimizar.onclick = function(event) {
        if (clickOriginal) clickOriginal.call(this, event);
        // Marcar tipo de rota
        setTimeout(() => {
          window.tipoRota = 'otimizada';
          verificarECorrigir();
        }, 1000);
        setTimeout(verificarECorrigir, 2000);
      };
    }
    
    console.log("⚡ [CalculoDireto] Sistema configurado");
  }
  
  // Verificar e corrigir imediatamente
  function verificarECorrigir() {
    // Verificar elemento de informações
    const infoRota = document.getElementById('route-info');
    if (!infoRota) return;
    
    // Extrair distância
    const matchDistancia = infoRota.innerHTML.match(/Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i);
    if (!matchDistancia) return;
    
    // Calcular com velocidade fixa
    const distancia = parseFloat(matchDistancia[1].replace(',', '.'));
    const tempoHoras = distancia / VELOCIDADE;
    const horas = Math.floor(tempoHoras);
    const minutos = Math.round((tempoHoras - horas) * 60);
    
    console.log(`⚡ [CalculoDireto] Calculando: ${distancia} km → ${horas}h ${minutos}min`);
    
    // Verificar tipo de rota atual
    const isOtimizada = infoRota.innerHTML.includes('Rota Otimizada');
    const tipoAtual = isOtimizada ? 'otimizada' : 'normal';
    
    // Se for rota normal, armazenar para comparação
    if (tipoAtual === 'normal') {
      rotaNormal = {
        distancia: distancia,
        tempo: tempoHoras
      };
    }
    
    // Substituir tempo no HTML
    let novoHTML = infoRota.innerHTML;
    
    // Atualizar tempo
    novoHTML = novoHTML.replace(
      /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
      `Tempo estimado:</strong> ${horas}h ${minutos}min`
    );
    
    // Se for rota otimizada e temos dados da normal, adicionar comparação
    if (tipoAtual === 'otimizada' && rotaNormal) {
      novoHTML = adicionarComparacao(novoHTML, rotaNormal, {
        distancia: distancia,
        tempo: tempoHoras
      });
    }
    
    // Atualizar conteúdo se houver mudança
    if (novoHTML !== infoRota.innerHTML) {
      infoRota.innerHTML = novoHTML;
    }
  }
  
  // Observar mudanças no DOM
  function observarDOM() {
    const container = document.getElementById('bottom-info');
    if (!container) return;
    
    const observer = new MutationObserver(() => {
      verificarECorrigir();
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  // Adicionar comparação entre rotas
  function adicionarComparacao(html, normal, otimizada) {
    // Calcular diferenças
    const difDistancia = normal.distancia - otimizada.distancia;
    const difTempo = normal.tempo - otimizada.tempo;
    
    // Calcular percentuais
    const percentDist = (difDistancia / normal.distancia * 100).toFixed(1);
    const percentTempo = (difTempo / normal.tempo * 100).toFixed(1);
    
    // Determinar texto e cores
    const txtDistancia = difDistancia > 0 ? 'Economia' : 'Aumento';
    const txtTempo = difTempo > 0 ? 'Economia' : 'Aumento';
    
    const corDistancia = difDistancia > 0 ? '#4CAF50' : '#F44336';
    const corTempo = difTempo > 0 ? '#4CAF50' : '#F44336';
    
    // Formatar tempo
    const horasDif = Math.floor(Math.abs(difTempo));
    const minutosDif = Math.round((Math.abs(difTempo) - horasDif) * 60);
    const tempoFormatado = horasDif > 0 ? 
                          `${horasDif}h ${minutosDif}min` : 
                          `${minutosDif} minutos`;
    
    // HTML da comparação
    const comparacaoHTML = `
      <div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p><strong>Comparação com rota não otimizada:</strong></p>
        <p>Distância: <span style="color: ${corDistancia}">
          ${txtDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDist)}%)
        </span></p>
        <p>Tempo: <span style="color: ${corTempo}">
          ${txtTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
        </span></p>
        <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
          Cálculos baseados em velocidade média de ${VELOCIDADE} km/h.
        </p>
      </div>
    `;
    
    // Verificar se já existe comparação
    if (html.includes('route-comparison')) {
      return html.replace(/<div class="route-comparison">(.*?)<\/div>/s, comparacaoHTML);
    } else {
      return html + comparacaoHTML;
    }
  }
})();