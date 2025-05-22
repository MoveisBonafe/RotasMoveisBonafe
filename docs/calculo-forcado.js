/**
 * Cálculo Forçado de Rotas - Móveis Bonafé
 * 
 * Este script força valores consistentes para distância e tempo de todas as rotas,
 * ignorando os cálculos inconsistentes do Google Maps para garantir comparações justas.
 */
(function() {
  console.log("⚙️ [CalculoForcado] Inicializando sistema de cálculos forçados");
  
  // Guardar referências do Google Maps
  let directionsService = null;
  let directionsRenderer = null;
  let map = null;
  
  // Armazenar referências de rotas
  const rotasCalculadas = {
    normal: null,   // Rota original (visualizar)
    otimizada: null // Rota otimizada
  };
  
  // Estado do cálculo de rotas
  let recalculando = false;
  
  // Velocidade média forçada (km/h) - usada para cálculos consistentes
  const VELOCIDADE_MEDIA = 90;
  
  // Inicializar quando a página carregar
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1500);
  setTimeout(inicializar, 3000);
  
  function inicializar() {
    console.log("⚙️ [CalculoForcado] Configurando correções...");
    
    // Obter referências do Google Maps
    if (window.google && window.google.maps) {
      monitorarGoogleMaps();
    }
    
    // Interceptar os botões de Visualizar e Otimizar
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    if (botaoVisualizar) {
      interceptarBotao(botaoVisualizar, 'normal');
    }
    
    if (botaoOtimizar) {
      interceptarBotao(botaoOtimizar, 'otimizada');
    }
    
    // Monitorar alterações na exibição das informações da rota
    observarAlteracoesInfo();
    
    console.log("⚙️ [CalculoForcado] Sistema inicializado com sucesso");
  }
  
  // Monitorar carregamento do Google Maps
  function monitorarGoogleMaps() {
    // Verificar se já temos as referências
    if (window.directionsService) directionsService = window.directionsService;
    if (window.directionsRenderer) directionsRenderer = window.directionsRenderer;
    if (window.map) map = window.map;
    
    // Se não, monitorar constantemente
    if (!directionsService || !directionsRenderer || !map) {
      const intervalo = setInterval(() => {
        if (window.directionsService) directionsService = window.directionsService;
        if (window.directionsRenderer) directionsRenderer = window.directionsRenderer;
        if (window.map) map = window.map;
        
        // Se conseguimos todas, parar de monitorar
        if (directionsService && directionsRenderer && map) {
          console.log("⚙️ [CalculoForcado] API do Google Maps capturada");
          clearInterval(intervalo);
          
          // Interceptar métodos do Google Maps
          interceptarMetodosGoogleMaps();
        }
      }, 1000);
      
      // Parar após um tempo máximo
      setTimeout(() => clearInterval(intervalo), 30000);
    } else {
      // Já temos as referências, interceptar diretamente
      interceptarMetodosGoogleMaps();
    }
  }
  
  // Interceptar métodos do Google Maps para capturar resultados
  function interceptarMetodosGoogleMaps() {
    console.log("⚙️ [CalculoForcado] Interceptando métodos do Google Maps");
    
    // Interceptar o método route do serviço de direções
    if (directionsService && !directionsService._interceptado) {
      const metodoOriginal = directionsService.route;
      
      directionsService.route = function(request, callback) {
        console.log("⚙️ [CalculoForcado] Interceptando rota:", request);
        
        // Chamar método original
        return metodoOriginal.call(this, request, function(result, status) {
          // Processar o resultado antes de devolver
          if (status === 'OK' && result.routes && result.routes.length > 0) {
            processarResultadoRota(request, result);
          }
          
          // Chamar callback original
          if (callback) callback(result, status);
        });
      };
      
      directionsService._interceptado = true;
    }
    
    // Interceptar o renderer
    if (directionsRenderer && !directionsRenderer._interceptado) {
      const metodoOriginal = directionsRenderer.setDirections;
      
      directionsRenderer.setDirections = function(result) {
        console.log("⚙️ [CalculoForcado] Interceptando renderização");
        
        // Adaptar resultado se necessário (usado quando recalculamos)
        const resultadoFinal = (recalculando) ? ajustarResultado(result) : result;
        
        // Chamar método original
        return metodoOriginal.call(this, resultadoFinal);
      };
      
      directionsRenderer._interceptado = true;
    }
  }
  
  // Interceptar botões de Visualizar e Otimizar
  function interceptarBotao(botao, tipo) {
    console.log(`⚙️ [CalculoForcado] Interceptando botão: ${tipo}`);
    
    // Armazenar click original
    const clickOriginal = botao.onclick;
    
    botao.onclick = function(event) {
      console.log(`⚙️ [CalculoForcado] Botão ${tipo} clicado`);
      
      // Definir tipo de rota atual
      window.tipoRotaAtual = tipo;
      
      // Executar comportamento original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Timeout para aguardar o cálculo da rota
      setTimeout(() => {
        verificarEAtualizarInfo(tipo);
      }, 1500);
    };
  }
  
  // Processar o resultado da rota
  function processarResultadoRota(request, result) {
    try {
      // Verificar tipo de rota (normal ou otimizada)
      const tipo = window.tipoRotaAtual || 'desconhecido';
      
      // Extrair informações da rota
      const rota = result.routes[0];
      const legs = rota.legs || [];
      
      // Calcular distância e duração totais
      let distanciaTotal = 0;
      let duracaoTotal = 0;
      
      legs.forEach(leg => {
        distanciaTotal += leg.distance.value; // metros
        duracaoTotal += leg.duration.value;   // segundos
      });
      
      // Converter para km e horas
      const distanciaKm = distanciaTotal / 1000;
      const duracaoHoras = duracaoTotal / 3600;
      
      // Armazenar informações da rota
      const infoRota = {
        distancia: distanciaKm,
        duracao: duracaoHoras,
        legs: legs,
        result: result,
        waypoints: request.waypoints || [],
        timestamp: new Date().getTime()
      };
      
      console.log(`⚙️ [CalculoForcado] Rota ${tipo} processada:`, 
                  distanciaKm.toFixed(2), "km,", 
                  (duracaoHoras * 60).toFixed(0), "min");
      
      // Armazenar no tipo correto
      if (tipo === 'normal') {
        rotasCalculadas.normal = infoRota;
      } else if (tipo === 'otimizada') {
        rotasCalculadas.otimizada = infoRota;
      }
      
      // Atualizar informações na tela
      setTimeout(() => {
        verificarEAtualizarInfo(tipo);
      }, 500);
      
    } catch (erro) {
      console.error("⚙️ [CalculoForcado] Erro ao processar rota:", erro);
    }
  }
  
  // Verificar e atualizar informações na tela
  function verificarEAtualizarInfo(tipo) {
    const infoRota = document.getElementById('route-info');
    if (!infoRota) {
      console.log("⚙️ [CalculoForcado] Elemento de informações não encontrado");
      return;
    }
    
    // Obter informações da rota correta
    const dadosRota = rotasCalculadas[tipo];
    if (!dadosRota) {
      console.log(`⚙️ [CalculoForcado] Sem dados para rota do tipo ${tipo}`);
      return;
    }
    
    // Forçar cálculo baseado na distância (mesmo método para todas)
    const tempoCalculado = calcularTempoPorVelocidadeMedia(dadosRota.distancia);
    
    // Atualizar informações da rota
    atualizarInformacoesRota(infoRota, dadosRota, tempoCalculado, tipo);
  }
  
  // Calcular tempo baseado numa velocidade média constante
  function calcularTempoPorVelocidadeMedia(distanciaKm) {
    // t = d/v (tempo = distância / velocidade)
    const tempoHoras = distanciaKm / VELOCIDADE_MEDIA;
    return tempoHoras;
  }
  
  // Atualizar informações da rota na interface
  function atualizarInformacoesRota(elemento, dadosRota, tempoCalculado, tipo) {
    if (!elemento || !dadosRota) return;
    
    // Formatar valores
    const distanciaKm = dadosRota.distancia.toFixed(1);
    const horasTotal = Math.floor(tempoCalculado);
    const minutosTotal = Math.round((tempoCalculado - horasTotal) * 60);
    
    // Verificar conteúdo atual
    const conteudoAtual = elemento.innerHTML;
    
    // Determinar se é rota normal ou otimizada
    const tituloRota = (tipo === 'otimizada') ? 'Rota Otimizada' : 'Rota Calculada';
    
    // Procurar por padrões de números no HTML atual
    // e substituir com os valores calculados
    let novoConteudo = conteudoAtual;
    
    // Substituir distância
    novoConteudo = novoConteudo.replace(
      /Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i,
      `Distância total:</strong> ${distanciaKm} km`
    );
    
    // Substituir tempo
    novoConteudo = novoConteudo.replace(
      /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
      `Tempo estimado:</strong> ${horasTotal}h ${minutosTotal}min`
    );
    
    // Verificar se precisamos adicionar comparação
    if (tipo === 'otimizada' && rotasCalculadas.normal) {
      novoConteudo = adicionarComparacao(novoConteudo, 
                                        rotasCalculadas.normal, 
                                        dadosRota);
    }
    
    // Atualizar conteúdo
    if (novoConteudo !== conteudoAtual) {
      elemento.innerHTML = novoConteudo;
      console.log(`⚙️ [CalculoForcado] Informações de rota ${tipo} atualizadas`);
    }
  }
  
  // Adicionar comparação entre rota normal e otimizada
  function adicionarComparacao(conteudoHTML, rotaNormal, rotaOtimizada) {
    // Calcular diferenças
    const difDistancia = rotaNormal.distancia - rotaOtimizada.distancia;
    const tempoNormal = calcularTempoPorVelocidadeMedia(rotaNormal.distancia);
    const tempoOtimizado = calcularTempoPorVelocidadeMedia(rotaOtimizada.distancia);
    const difTempo = tempoNormal - tempoOtimizado;
    
    // Calcular percentuais
    const percentDistancia = (difDistancia / rotaNormal.distancia * 100).toFixed(1);
    const percentTempo = (difTempo / tempoNormal * 100).toFixed(1);
    
    // Verificar se já tem comparação
    if (conteudoHTML.includes('route-comparison')) {
      // Atualizar comparação existente
      return conteudoHTML.replace(
        /<div class="route-comparison">(.*?)<\/div>/s,
        criarHTMLComparacao(difDistancia, difTempo, percentDistancia, percentTempo)
      );
    } else {
      // Adicionar nova comparação
      return conteudoHTML + criarHTMLComparacao(difDistancia, difTempo, percentDistancia, percentTempo);
    }
  }
  
  // Criar HTML para a comparação
  function criarHTMLComparacao(difDistancia, difTempo, percentDistancia, percentTempo) {
    // Determinar cores baseadas em economia/aumento
    const corDistancia = difDistancia > 0 ? '#4CAF50' : '#F44336';
    const corTempo = difTempo > 0 ? '#4CAF50' : '#F44336';
    const textoDistancia = difDistancia > 0 ? 'Economia' : 'Aumento';
    const textoTempo = difTempo > 0 ? 'Economia' : 'Aumento';
    
    // Converter tempo de horas para formato legível
    const tempoFormatado = formatarTempo(Math.abs(difTempo));
    
    return `
      <div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p><strong>Comparação com rota não otimizada:</strong></p>
        <p>Distância: <span style="color: ${corDistancia}">
          ${textoDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDistancia)}%)
        </span></p>
        <p>Tempo: <span style="color: ${corTempo}">
          ${textoTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
        </span></p>
        <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
          Todos os cálculos usam a mesma velocidade média de ${VELOCIDADE_MEDIA} km/h para garantir uma comparação justa.
        </p>
        <p style="font-style: italic; font-size: 11px; color: #666;">
          Nota: Os valores podem diferir das estimativas do Google Maps, que usa condições de tráfego variáveis.
        </p>
      </div>
    `;
  }
  
  // Formatar tempo em formato legível
  function formatarTempo(horas) {
    const horasInt = Math.floor(horas);
    const minutos = Math.round((horas - horasInt) * 60);
    
    if (horasInt === 0) {
      return `${minutos} minutos`;
    } else if (minutos === 0) {
      return `${horasInt} hora${horasInt !== 1 ? 's' : ''}`;
    } else {
      return `${horasInt}h ${minutos}min`;
    }
  }
  
  // Ajustar resultado (usado ao recalcular)
  function ajustarResultado(result) {
    // Isso seria usado se precisássemos modificar o resultado antes da renderização
    return result;
  }
  
  // Observar alterações na exibição das informações
  function observarAlteracoesInfo() {
    const container = document.getElementById('bottom-info');
    if (!container) {
      console.log("⚙️ [CalculoForcado] Container de informações não encontrado");
      return;
    }
    
    // Criar observer
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          // Verificar se é info de rota otimizada
          const infoRota = document.getElementById('route-info');
          if (infoRota && infoRota.innerHTML.includes('Rota Otimizada')) {
            // Reajustar valores para a rota otimizada
            setTimeout(() => {
              verificarEAtualizarInfo('otimizada');
            }, 300);
          }
        }
      }
    });
    
    // Iniciar observação
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log("⚙️ [CalculoForcado] Observer configurado");
  }
})();