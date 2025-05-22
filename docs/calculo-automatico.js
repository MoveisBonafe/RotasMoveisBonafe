/**
 * Cálculo Automático Preciso - Móveis Bonafé
 * 
 * Este script automatiza o cálculo preciso de rotas:
 * 1. Captura todas as localizações ao alternar entre rotas
 * 2. Recalcula usando o mesmo método do botão "Visualizar"
 * 3. Mostra o resultado apenas quando o cálculo estiver pronto
 */
(function() {
  console.log("🔄 [CalculoAutomatico] Inicializando (v1.0)");
  
  // Variáveis globais
  let calculando = false;
  let localizacoes = [];
  let servicoDirecoes = null;
  let mostragemMapa = null;
  let mapa = null;
  
  // Dados das rotas
  let rotaNormal = null;
  let rotaOtimizada = null;
  
  // Inicializar depois que a página carregar
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 1000);
  setTimeout(iniciar, 3000);
  
  // Função principal de inicialização
  function iniciar() {
    console.log("🔄 [CalculoAutomatico] Configurando sistema");
    
    // Obter referências do Google Maps
    if (window.google && window.google.maps) {
      if (window.directionsService) servicoDirecoes = window.directionsService;
      if (window.directionsRenderer) mostragemMapa = window.directionsRenderer;
      if (window.map) mapa = window.map;
      
      if (!servicoDirecoes || !mostragemMapa || !mapa) {
        // Se não temos as referências, monitorar a API
        monitorarGoogleMaps();
      }
    }
    
    // Interceptar botões de rota
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    if (botaoVisualizar) {
      interceptarBotao(botaoVisualizar, 'normal');
    }
    
    if (botaoOtimizar) {
      interceptarBotao(botaoOtimizar, 'otimizada');
    }
    
    // Monitorar alterações no DOM para atualizar automaticamente
    configurarMonitorDom();
    
    console.log("🔄 [CalculoAutomatico] Sistema inicializado");
  }
  
  // Monitorar API do Google Maps
  function monitorarGoogleMaps() {
    console.log("🔄 [CalculoAutomatico] Monitorando Google Maps");
    
    const intervalo = setInterval(() => {
      if (window.directionsService) servicoDirecoes = window.directionsService;
      if (window.directionsRenderer) mostragemMapa = window.directionsRenderer;
      if (window.map) mapa = window.map;
      
      if (servicoDirecoes && mostragemMapa && mapa) {
        console.log("🔄 [CalculoAutomatico] API do Google Maps capturada");
        clearInterval(intervalo);
      }
    }, 1000);
    
    // Parar de monitorar após 30 segundos
    setTimeout(() => clearInterval(intervalo), 30000);
  }
  
  // Interceptar cliques nos botões
  function interceptarBotao(botao, tipo) {
    console.log(`🔄 [CalculoAutomatico] Interceptando botão: ${tipo}`);
    
    const clickOriginal = botao.onclick;
    
    botao.onclick = function(event) {
      console.log(`🔄 [CalculoAutomatico] Botão ${tipo} acionado`);
      
      // Capturar localizações antes de executar o original
      capturarLocalizacoes();
      
      // Executar função original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Aguardar processamento e iniciar cálculo automático
      setTimeout(() => {
        // Tipo de rota atual para armazenamento
        window.tipoRotaAtual = tipo;
        
        // Iniciar recálculo se for rota otimizada
        if (tipo === 'otimizada') {
          // Esperar a rota ser redesenhada para começar
          setTimeout(recalcularRotaAutomaticamente, 1500);
        }
      }, 500);
    };
  }
  
  // Capturar localizações atuais
  function capturarLocalizacoes() {
    // Verificar se há locations disponível
    if (window.locations && Array.isArray(window.locations)) {
      localizacoes = [...window.locations];
      console.log(`🔄 [CalculoAutomatico] ${localizacoes.length} localizações capturadas`);
    } else {
      console.log("🔄 [CalculoAutomatico] Nenhuma localização encontrada");
    }
  }
  
  // Recalcular rota automaticamente usando o método do botão Visualizar
  function recalcularRotaAutomaticamente() {
    if (calculando || !servicoDirecoes || localizacoes.length < 2) {
      console.log("🔄 [CalculoAutomatico] Não foi possível iniciar recálculo");
      return;
    }
    
    // Marcar como calculando
    calculando = true;
    
    // Exibir indicador de cálculo
    mostrarIndicadorCalculando();
    
    console.log("🔄 [CalculoAutomatico] Iniciando recálculo automático");
    
    // Encontrar origem (ponto com isOrigin=true)
    const origem = localizacoes.find(l => l.isOrigin);
    if (!origem) {
      console.log("🔄 [CalculoAutomatico] Origem não encontrada");
      calculando = false;
      esconderIndicadorCalculando();
      return;
    }
    
    // Extrair pontos de destino
    const destinos = localizacoes.filter(l => !l.isOrigin);
    
    // Obter ordem atual dos pontos
    const ordemPontos = window.locations.map(l => l.id);
    console.log("🔄 [CalculoAutomatico] Ordem atual:", ordemPontos);
    
    // Converter para coordenadas
    const pontoOrigem = { lat: origem.latitude, lng: origem.longitude };
    
    // Criar waypoints na ordem atual
    const waypoints = [];
    for (let i = 1; i < ordemPontos.length; i++) {
      const id = ordemPontos[i];
      const local = localizacoes.find(l => l.id === id);
      
      if (local) {
        waypoints.push({
          location: { lat: local.latitude, lng: local.longitude },
          stopover: true
        });
      }
    }
    
    // Configurar requisição usando o mesmo formato do botão Visualizar
    const requisicao = {
      origin: pontoOrigem,
      destination: pontoOrigem, // Voltar para origem
      waypoints: waypoints,
      travelMode: 'DRIVING',
      optimizeWaypoints: false // Não otimizar, usar a ordem atual
    };
    
    // Calcular rota
    servicoDirecoes.route(requisicao, (resultado, status) => {
      console.log(`🔄 [CalculoAutomatico] Resultado do cálculo: ${status}`);
      
      if (status === 'OK' && resultado.routes && resultado.routes.length > 0) {
        // Extrair informações da rota
        processarResultadoRota(resultado);
        
        // Atualizar informações na interface
        atualizarInformacoesRota(resultado);
      } else {
        console.log("🔄 [CalculoAutomatico] Erro no cálculo da rota");
      }
      
      // Finalizar
      calculando = false;
      esconderIndicadorCalculando();
    });
  }
  
  // Processar resultado da rota
  function processarResultadoRota(resultado) {
    try {
      // Extrair rota principal
      const rota = resultado.routes[0];
      
      // Calcular distância e tempo totais
      let distanciaTotal = 0;
      let tempoTotal = 0;
      
      rota.legs.forEach(leg => {
        distanciaTotal += leg.distance.value;
        tempoTotal += leg.duration.value;
      });
      
      // Converter para formatos legíveis
      const distanciaKm = (distanciaTotal / 1000).toFixed(1);
      const tempoHoras = Math.floor(tempoTotal / 3600);
      const tempoMinutos = Math.floor((tempoTotal % 3600) / 60);
      
      // Armazenar informações da rota atual
      const tipoRotaAtual = window.tipoRotaAtual || 'desconhecido';
      
      const dadosRota = {
        distancia: parseFloat(distanciaKm),
        tempoHoras: tempoHoras,
        tempoMinutos: tempoMinutos,
        tempoTotalSegundos: tempoTotal,
        legs: rota.legs
      };
      
      // Armazenar no tipo apropriado
      if (tipoRotaAtual === 'normal') {
        rotaNormal = dadosRota;
      } else if (tipoRotaAtual === 'otimizada') {
        rotaOtimizada = dadosRota;
      }
      
      console.log(`🔄 [CalculoAutomatico] Rota ${tipoRotaAtual}: ${distanciaKm} km, ${tempoHoras}h ${tempoMinutos}min`);
    } catch (erro) {
      console.log("🔄 [CalculoAutomatico] Erro ao processar rota:", erro);
    }
  }
  
  // Atualizar informações de rota na interface
  function atualizarInformacoesRota(resultado) {
    try {
      // Encontrar elemento de informações
      const infoRota = document.getElementById('route-info');
      if (!infoRota) {
        console.log("🔄 [CalculoAutomatico] Elemento de informações não encontrado");
        return;
      }
      
      // Verificar tipo de rota atual
      const tipoRota = window.tipoRotaAtual || 'desconhecido';
      
      // Obter dados da rota atual
      const dadosRota = tipoRota === 'otimizada' ? rotaOtimizada : rotaNormal;
      if (!dadosRota) {
        console.log(`🔄 [CalculoAutomatico] Dados da rota ${tipoRota} não disponíveis`);
        return;
      }
      
      // Atualizar informações de tempo e distância
      let novoHTML = infoRota.innerHTML.replace(
        /Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i,
        `Distância total:</strong> ${dadosRota.distancia} km`
      );
      
      novoHTML = novoHTML.replace(
        /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
        `Tempo estimado:</strong> ${dadosRota.tempoHoras}h ${dadosRota.tempoMinutos}min`
      );
      
      // Adicionar comparação se for rota otimizada
      if (tipoRota === 'otimizada' && rotaNormal) {
        novoHTML = adicionarComparacao(novoHTML);
      }
      
      // Atualizar conteúdo
      infoRota.innerHTML = novoHTML;
      
      console.log(`🔄 [CalculoAutomatico] Informações da rota ${tipoRota} atualizadas`);
    } catch (erro) {
      console.log("🔄 [CalculoAutomatico] Erro ao atualizar informações:", erro);
    }
  }
  
  // Adicionar comparação entre rotas
  function adicionarComparacao(html) {
    if (!rotaNormal || !rotaOtimizada) return html;
    
    // Calcular diferenças
    const difDistancia = rotaNormal.distancia - rotaOtimizada.distancia;
    const difTempoSegundos = rotaNormal.tempoTotalSegundos - rotaOtimizada.tempoTotalSegundos;
    const difTempoHoras = difTempoSegundos / 3600;
    
    // Calcular percentuais
    const percentDistancia = (difDistancia / rotaNormal.distancia * 100).toFixed(1);
    const percentTempo = (difTempoSegundos / rotaNormal.tempoTotalSegundos * 100).toFixed(1);
    
    // Determinar textos e cores
    const textoDistancia = difDistancia > 0 ? 'Economia' : 'Aumento';
    const textoTempo = difTempoSegundos > 0 ? 'Economia' : 'Aumento';
    
    const corDistancia = difDistancia > 0 ? '#4CAF50' : '#F44336';
    const corTempo = difTempoSegundos > 0 ? '#4CAF50' : '#F44336';
    
    // Formatar tempo
    const horasDif = Math.floor(Math.abs(difTempoHoras));
    const minutosDif = Math.round((Math.abs(difTempoHoras) - horasDif) * 60);
    const tempoFormatado = horasDif > 0 ? 
                           `${horasDif}h ${minutosDif}min` : 
                           `${minutosDif} minutos`;
    
    // HTML da comparação
    const comparacaoHTML = `
      <div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p><strong>Comparação com rota não otimizada:</strong></p>
        <p>Distância: <span style="color: ${corDistancia}">
          ${textoDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDistancia)}%)
        </span></p>
        <p>Tempo: <span style="color: ${corTempo}">
          ${textoTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
        </span></p>
        <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
          Calculado automaticamente usando o mesmo método do botão "Visualizar".
        </p>
      </div>
    `;
    
    // Verificar se já existe uma comparação
    if (html.includes('route-comparison')) {
      return html.replace(/<div class="route-comparison">(.*?)<\/div>/s, comparacaoHTML);
    } else {
      return html + comparacaoHTML;
    }
  }
  
  // Configurar monitoramento de DOM
  function configurarMonitorDom() {
    const container = document.getElementById('bottom-info');
    if (!container) {
      console.log("🔄 [CalculoAutomatico] Container de informações não encontrado");
      return;
    }
    
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          const infoRota = document.getElementById('route-info');
          if (infoRota && infoRota.innerHTML.includes('Rota Otimizada') && !calculando) {
            // Verificar se acabou de mudar para rota otimizada
            window.tipoRotaAtual = 'otimizada';
            
            // Capturar localizações atuais
            capturarLocalizacoes();
            
            // Iniciar recálculo automático
            setTimeout(recalcularRotaAutomaticamente, 500);
          }
        }
      }
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log("🔄 [CalculoAutomatico] Monitoramento de DOM configurado");
  }
  
  // Exibir indicador "Calculando..."
  function mostrarIndicadorCalculando() {
    let indicador = document.getElementById('calculando-indicador');
    
    if (!indicador) {
      indicador = document.createElement('div');
      indicador.id = 'calculando-indicador';
      indicador.style.position = 'fixed';
      indicador.style.top = '10px';
      indicador.style.right = '10px';
      indicador.style.backgroundColor = 'rgba(0,0,0,0.7)';
      indicador.style.color = 'white';
      indicador.style.padding = '8px 15px';
      indicador.style.borderRadius = '4px';
      indicador.style.zIndex = '9999';
      indicador.style.fontFamily = 'Arial, sans-serif';
      indicador.style.fontSize = '14px';
      indicador.innerHTML = 'Recalculando rota...';
      
      document.body.appendChild(indicador);
    } else {
      indicador.style.display = 'block';
    }
  }
  
  // Esconder indicador
  function esconderIndicadorCalculando() {
    const indicador = document.getElementById('calculando-indicador');
    if (indicador) {
      indicador.style.display = 'none';
    }
  }
})();