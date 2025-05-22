/**
 * Intelligent Auto-Calculation Wizard
 * 
 * Assistente inteligente de cálculo que:
 * - Analisa tipos de estrada para cálculos mais precisos
 * - Estima gastos de combustível
 * - Calcula tempos de parada realistas
 * - Mostra comparações detalhadas de otimização
 */
(function() {
  console.log("🧙 [IntellWizard] Iniciando assistente inteligente de cálculo");
  
  // Configurações e fatores de cálculo
  const CONFIG = {
    // Velocidades por tipo de via (km/h)
    velocidades: {
      rodovia: 110,    // Rodovias principais
      estadual: 90,     // Estradas estaduais
      urbana: 40,       // Vias urbanas
      rural: 60,        // Estradas rurais
      media: 90         // Velocidade média padrão
    },
    
    // Fatores de tempo
    tempos: {
      parada: 15,       // Minutos por parada
      descanso: 40,     // Minutos de descanso a cada 4h de viagem
      transito: 1.1     // Fator de trânsito (aumento de 10%)
    },
    
    // Consumo e custos
    custos: {
      combustivel: 5.50,        // R$/litro
      consumo: 8,               // Km/litro
      consumoUrbano: 6,         // Km/litro em área urbana
      consumoRodovia: 10,       // Km/litro em rodovias
      manutencao: 0.50          // R$/km para manutenção
    }
  };
  
  // Estado do sistema
  let dadosRotas = {
    normal: null,
    otimizada: null
  };
  
  // Inicialização
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1500);
  setTimeout(inicializar, 3000);
  
  function inicializar() {
    console.log("🧙 [IntellWizard] Configurando assistente");
    
    // Interceptar botões de rota
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    if (botaoVisualizar) interceptarBotao(botaoVisualizar, 'normal');
    if (botaoOtimizar) interceptarBotao(botaoOtimizar, 'otimizada');
    
    // Observar alterações na interface
    observarAlteracoes();
    
    // Processar qualquer rota existente
    processarRotaExistente();
    
    console.log("🧙 [IntellWizard] Assistente pronto");
  }
  
  // Interceptar cliques nos botões
  function interceptarBotao(botao, tipo) {
    const clickOriginal = botao.onclick;
    
    botao.onclick = function(event) {
      console.log(`🧙 [IntellWizard] Botão ${tipo} acionado`);
      
      // Executar comportamento original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Processar após um tempo
      window.tipoRotaAtual = tipo;
      setTimeout(() => analisarRota(tipo), 1000);
      setTimeout(() => analisarRota(tipo), 2000);
    };
  }
  
  // Observar alterações relevantes no DOM
  function observarAlteracoes() {
    const container = document.getElementById('bottom-info');
    if (!container) return;
    
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          const infoRota = document.getElementById('route-info');
          if (infoRota) {
            const tipoAtual = infoRota.innerHTML.includes('Rota Otimizada') ? 
                              'otimizada' : 'normal';
            analisarRota(tipoAtual);
          }
        }
      }
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  // Processar rota já exibida
  function processarRotaExistente() {
    const infoRota = document.getElementById('route-info');
    if (infoRota) {
      const tipoAtual = infoRota.innerHTML.includes('Rota Otimizada') ? 
                        'otimizada' : 'normal';
      analisarRota(tipoAtual);
    }
  }
  
  // Analisar rota atual
  function analisarRota(tipo) {
    console.log(`🧙 [IntellWizard] Analisando rota ${tipo}`);
    
    // Encontrar elemento de informações
    const infoElement = document.getElementById('route-info');
    if (!infoElement) {
      console.log("🧙 [IntellWizard] Elemento de informações não encontrado");
      return;
    }
    
    // Extrair distância
    const matchDistancia = infoElement.innerHTML.match(/Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i);
    if (!matchDistancia) {
      console.log("🧙 [IntellWizard] Não foi possível extrair a distância");
      return;
    }
    
    // Extrair número de paradas
    const matchParadas = infoElement.innerHTML.match(/Paradas:<\/strong>\s*(\d+)/i);
    const numParadas = matchParadas ? parseInt(matchParadas[1]) : 0;
    
    // Calcular proporções de tipos de estrada
    const distanciaKm = parseFloat(matchDistancia[1].replace(',', '.'));
    const tiposEstrada = estimarTiposEstrada(distanciaKm, numParadas);
    
    // Calcular tempo de viagem
    const tempoViagem = calcularTempoViagem(distanciaKm, tiposEstrada, numParadas);
    
    // Calcular custos
    const custos = calcularCustos(distanciaKm, tiposEstrada);
    
    // Armazenar dados completos da rota
    dadosRotas[tipo] = {
      distancia: distanciaKm,
      paradas: numParadas,
      tiposEstrada: tiposEstrada,
      tempo: tempoViagem,
      custos: custos
    };
    
    // Atualizar informações na interface
    atualizarInformacoes(infoElement, tipo);
  }
  
  // Estimar tipos de estrada com base na distância e número de paradas
  function estimarTiposEstrada(distancia, paradas) {
    // Proporções básicas que variam com distância total
    let proporcoes = {
      rodovia: 0,
      estadual: 0,
      urbana: 0,
      rural: 0
    };
    
    if (distancia < 30) {
      // Rotas curtas: mais urbanas, menos rodovias
      proporcoes.urbana = 0.6;
      proporcoes.estadual = 0.2;
      proporcoes.rural = 0.15;
      proporcoes.rodovia = 0.05;
    } else if (distancia < 100) {
      // Rotas médias: equilíbrio entre tipos
      proporcoes.estadual = 0.4;
      proporcoes.urbana = 0.3;
      proporcoes.rodovia = 0.2;
      proporcoes.rural = 0.1;
    } else if (distancia < 300) {
      // Rotas longas: mais rodovias e estaduais
      proporcoes.rodovia = 0.45;
      proporcoes.estadual = 0.3;
      proporcoes.urbana = 0.15;
      proporcoes.rural = 0.1;
    } else {
      // Rotas muito longas: predominância de rodovias
      proporcoes.rodovia = 0.6;
      proporcoes.estadual = 0.25;
      proporcoes.urbana = 0.1;
      proporcoes.rural = 0.05;
    }
    
    // Ajustar com base no número de paradas (mais paradas = mais áreas urbanas)
    if (paradas > 0) {
      // Cada parada adiciona % de área urbana
      const ajusteUrbano = Math.min(0.3, paradas * 0.05);
      proporcoes.urbana += ajusteUrbano;
      
      // Reduzir de rodovias e estaduais proporcionalmente
      const reducao = ajusteUrbano / 2;
      proporcoes.rodovia -= reducao;
      proporcoes.estadual -= reducao;
      
      // Garantir que não fiquem negativos
      proporcoes.rodovia = Math.max(0.05, proporcoes.rodovia);
      proporcoes.estadual = Math.max(0.05, proporcoes.estadual);
      
      // Normalizar para soma = 1
      const total = proporcoes.rodovia + proporcoes.estadual + proporcoes.urbana + proporcoes.rural;
      Object.keys(proporcoes).forEach(key => {
        proporcoes[key] /= total;
      });
    }
    
    return proporcoes;
  }
  
  // Calcular tempo de viagem com base em distância, tipos de estrada e paradas
  function calcularTempoViagem(distancia, tiposEstrada, paradas) {
    // Calcular tempo base com base nos tipos de estrada
    let tempoBaseHoras = 0;
    
    tempoBaseHoras += (distancia * tiposEstrada.rodovia) / CONFIG.velocidades.rodovia;
    tempoBaseHoras += (distancia * tiposEstrada.estadual) / CONFIG.velocidades.estadual;
    tempoBaseHoras += (distancia * tiposEstrada.urbana) / CONFIG.velocidades.urbana;
    tempoBaseHoras += (distancia * tiposEstrada.rural) / CONFIG.velocidades.rural;
    
    // Aplicar fator de trânsito
    const tempoComTransito = tempoBaseHoras * CONFIG.tempos.transito;
    
    // Adicionar tempo para paradas
    const tempoParadas = (paradas * CONFIG.tempos.parada) / 60; // Converter para horas
    
    // Adicionar pausas para descanso em viagens longas
    const numDescansos = Math.floor(tempoComTransito / 4); // A cada 4 horas
    const tempoDescanso = (numDescansos * CONFIG.tempos.descanso) / 60; // Converter para horas
    
    // Tempo total em horas
    const tempoTotalHoras = tempoComTransito + tempoParadas + tempoDescanso;
    
    // Extrair horas e minutos
    const horas = Math.floor(tempoTotalHoras);
    const minutos = Math.round((tempoTotalHoras - horas) * 60);
    
    return {
      tempoTotalHoras: tempoTotalHoras,
      horas: horas,
      minutos: minutos,
      tempoBase: tempoBaseHoras,
      tempoParadas: tempoParadas,
      tempoDescanso: tempoDescanso
    };
  }
  
  // Calcular custos da viagem
  function calcularCustos(distancia, tiposEstrada) {
    // Calcular consumo de combustível variando por tipo de estrada
    const consumoRodovia = distancia * tiposEstrada.rodovia / CONFIG.custos.consumoRodovia;
    const consumoUrbano = distancia * tiposEstrada.urbana / CONFIG.custos.consumoUrbano;
    const consumoOutras = distancia * (tiposEstrada.estadual + tiposEstrada.rural) / CONFIG.custos.consumo;
    
    // Consumo total em litros
    const consumoTotal = consumoRodovia + consumoUrbano + consumoOutras;
    
    // Custo de combustível
    const custoCombustivel = consumoTotal * CONFIG.custos.combustivel;
    
    // Custo de manutenção (por km)
    const custoManutencao = distancia * CONFIG.custos.manutencao;
    
    // Custo total
    const custoTotal = custoCombustivel + custoManutencao;
    
    return {
      consumoTotal: consumoTotal,
      custoCombustivel: custoCombustivel,
      custoManutencao: custoManutencao,
      custoTotal: custoTotal
    };
  }
  
  // Atualizar informações na interface
  function atualizarInformacoes(elemento, tipo) {
    // Obter dados da rota atual
    const dadosRota = dadosRotas[tipo];
    if (!dadosRota) return;
    
    // Atualizar tempo
    let novoHTML = elemento.innerHTML.replace(
      /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
      `Tempo estimado:</strong> ${dadosRota.tempo.horas}h ${dadosRota.tempo.minutos}min`
    );
    
    // Se for rota otimizada e temos dados da rota normal, adicionar comparativo
    if (tipo === 'otimizada' && dadosRotas.normal) {
      novoHTML = adicionarComparacao(novoHTML, dadosRotas.normal, dadosRota);
    }
    
    // Atualizar conteúdo
    if (novoHTML !== elemento.innerHTML) {
      elemento.innerHTML = novoHTML;
      console.log(`🧙 [IntellWizard] Informações atualizadas para rota ${tipo}`);
    }
  }
  
  // Adicionar comparação detalhada entre rotas
  function adicionarComparacao(html, rotaNormal, rotaOtimizada) {
    // Calcular diferenças
    const difDistancia = rotaNormal.distancia - rotaOtimizada.distancia;
    const difTempo = rotaNormal.tempo.tempoTotalHoras - rotaOtimizada.tempo.tempoTotalHoras;
    const difCusto = rotaNormal.custos.custoTotal - rotaOtimizada.custos.custoTotal;
    const difConsumo = rotaNormal.custos.consumoTotal - rotaOtimizada.custos.consumoTotal;
    
    // Calcular percentuais
    const percentDistancia = (difDistancia / rotaNormal.distancia * 100).toFixed(1);
    const percentTempo = (difTempo / rotaNormal.tempo.tempoTotalHoras * 100).toFixed(1);
    const percentCusto = (difCusto / rotaNormal.custos.custoTotal * 100).toFixed(1);
    
    // Determinar textos e cores
    const txtDistancia = difDistancia > 0 ? 'Economia' : 'Aumento';
    const txtTempo = difTempo > 0 ? 'Economia' : 'Aumento';
    const txtCusto = difCusto > 0 ? 'Economia' : 'Aumento';
    
    const corDistancia = difDistancia > 0 ? '#4CAF50' : '#F44336';
    const corTempo = difTempo > 0 ? '#4CAF50' : '#F44336';
    const corCusto = difCusto > 0 ? '#4CAF50' : '#F44336';
    
    // Formatar tempo
    const horasDif = Math.floor(Math.abs(difTempo));
    const minutosDif = Math.round((Math.abs(difTempo) - horasDif) * 60);
    const tempoFormatado = horasDif > 0 ? 
                           `${horasDif}h ${minutosDif}min` : 
                           `${minutosDif} minutos`;
    
    // HTML da comparação
    const comparacaoHTML = `
      <div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p><strong>Análise Inteligente - Comparação de Rotas:</strong></p>
        <p>Distância: <span style="color: ${corDistancia}">
          ${txtDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDistancia)}%)
        </span></p>
        <p>Tempo: <span style="color: ${corTempo}">
          ${txtTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
        </span></p>
        <p>Combustível: <span style="color: ${corDistancia}">
          ${difConsumo > 0 ? 'Economia' : 'Aumento'} de ${Math.abs(difConsumo).toFixed(1)} litros
        </span></p>
        <p>Custo total: <span style="color: ${corCusto}">
          ${txtCusto} de R$ ${Math.abs(difCusto).toFixed(2)} (${Math.abs(percentCusto)}%)
        </span></p>
        <div style="margin-top: 10px; font-size: 12px; color: #666; padding: 8px; background-color: #f5f5f5; border-radius: 4px;">
          <p style="margin: 0; padding-bottom: 5px;"><strong>Detalhes da Análise:</strong></p>
          <p style="margin: 0; margin-bottom: 3px;">• Esta análise considera diferentes tipos de estrada</p>
          <p style="margin: 0; margin-bottom: 3px;">• Inclui tempos de parada e descanso obrigatório</p>
          <p style="margin: 0;">• Calcula consumo e custos operacionais</p>
        </div>
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