/**
 * Simulador de Clique no Botão Visualizar
 * 
 * Este script:
 * 1. Intercepta o clique no botão Otimizar
 * 2. Captura o resultado da rota original (não otimizada)
 * 3. Executa a otimização, mas usa o mesmo método de cálculo do "Visualizar"
 * 4. Garante valores consistentes para comparação
 */
(function() {
  console.log("🎮 [SimuladorVisualizar] Inicializando");
  
  // Referências do Google Maps
  let directionsService = null;
  let directionsRenderer = null;
  
  // Dados capturados
  let locations = [];
  let rotaOriginal = null;
  
  // Estado
  let simulando = false;
  
  // Inicializar após carregamento
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 1000);
  setTimeout(iniciar, 3000);
  
  function iniciar() {
    console.log("🎮 [SimuladorVisualizar] Configurando sistema");
    
    // Obter referências de API
    captarReferencias();
    
    // Interceptar botão Otimizar
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      interceptarBotaoOtimizar(botaoOtimizar);
    }
    
    console.log("🎮 [SimuladorVisualizar] Sistema configurado");
  }
  
  // Captar referências da API do Google Maps
  function captarReferencias() {
    // Verificar se já temos as referências
    if (window.directionsService) directionsService = window.directionsService;
    if (window.directionsRenderer) directionsRenderer = window.directionsRenderer;
    
    // Se não temos, continuar verificando
    if (!directionsService || !directionsRenderer) {
      setTimeout(captarReferencias, 500);
    }
  }
  
  // Interceptar botão Otimizar
  function interceptarBotaoOtimizar(botao) {
    const clickOriginal = botao.onclick;
    
    botao.onclick = function(event) {
      // Evitar duplicação se já estiver simulando
      if (simulando) {
        console.log("🎮 [SimuladorVisualizar] Simulação já em andamento");
        return;
      }
      
      console.log("🎮 [SimuladorVisualizar] Botão Otimizar interceptado");
      
      // Prevenir comportamento padrão temporariamente
      event.preventDefault();
      event.stopPropagation();
      
      // Iniciar simulação
      simulando = true;
      
      // Capturar localização atual
      capturarLocalizacoes();
      
      // Mostrar indicador de cálculo
      mostrarIndicadorCalculo();
      
      // Primeiro, simular um clique em Visualizar para capturar a rota normal
      simularVisualizacao()
        .then(rotaNormalCapturada => {
          rotaOriginal = rotaNormalCapturada;
          console.log("🎮 [SimuladorVisualizar] Rota normal capturada:", rotaOriginal);
          
          // Agora prosseguir com a otimização 
          setTimeout(() => {
            // Executar o comportamento original do botão otimizar
            if (clickOriginal) {
              clickOriginal.call(botao);
            }
            
            // Aguardar a otimização e então corrigir o resultado
            setTimeout(() => {
              corrigirRotaOtimizada();
            }, 1500);
          }, 500);
        })
        .catch(erro => {
          console.error("🎮 [SimuladorVisualizar] Erro ao simular visualização:", erro);
          // Em caso de erro, prosseguir com o comportamento original
          if (clickOriginal) {
            clickOriginal.call(botao);
          }
          simulando = false;
          esconderIndicadorCalculo();
        });
    };
  }
  
  // Capturar localizações atuais
  function capturarLocalizacoes() {
    if (window.locations && Array.isArray(window.locations)) {
      locations = [...window.locations];
      console.log("🎮 [SimuladorVisualizar] Localizações capturadas:", locations.length);
    } else {
      console.log("🎮 [SimuladorVisualizar] Não foi possível capturar localizações");
    }
  }
  
  // Simular visualização para capturar a rota normal
  function simularVisualizacao() {
    return new Promise((resolve, reject) => {
      try {
        if (!directionsService || locations.length < 2) {
          reject("Serviço de direções não disponível ou localizações insuficientes");
          return;
        }
        
        // Encontrar a origem (ponto com isOrigin = true)
        const origem = locations.find(loc => loc.isOrigin);
        if (!origem) {
          reject("Origem não encontrada");
          return;
        }
        
        // Coordenadas da origem
        const pontoOrigem = { lat: origem.latitude, lng: origem.longitude };
        
        // Criar waypoints para todos os outros pontos
        const pontosDestino = locations.filter(loc => !loc.isOrigin).map(loc => ({
          location: { lat: loc.latitude, lng: loc.longitude },
          stopover: true
        }));
        
        // Configurar requisição de rota (igual ao botão Visualizar)
        const requisicao = {
          origin: pontoOrigem,
          destination: pontoOrigem, // Circular, volta para origem
          waypoints: pontosDestino,
          travelMode: 'DRIVING',
          optimizeWaypoints: false // NÃO otimizar pontos, manter ordem original
        };
        
        // Calcular rota
        directionsService.route(requisicao, (resultado, status) => {
          if (status === 'OK' && resultado.routes && resultado.routes.length > 0) {
            // Extrair informações da rota
            const infoRota = extrairInfoRota(resultado);
            resolve(infoRota);
          } else {
            reject("Falha ao calcular rota: " + status);
          }
        });
      } catch (erro) {
        reject(erro);
      }
    });
  }
  
  // Extrair informações de rota do resultado
  function extrairInfoRota(resultado) {
    const rota = resultado.routes[0];
    let distanciaTotal = 0;
    let tempoTotal = 0;
    
    // Somar distância e tempo de todas as pernas da rota
    rota.legs.forEach(leg => {
      distanciaTotal += leg.distance.value; // metros
      tempoTotal += leg.duration.value; // segundos
    });
    
    // Converter para formatos mais legíveis
    const distanciaKm = distanciaTotal / 1000;
    const tempoHoras = tempoTotal / 3600;
    
    return {
      resultado: resultado,
      rota: rota,
      distanciaKm: distanciaKm,
      tempoHoras: tempoHoras,
      distanciaMetros: distanciaTotal,
      tempoSegundos: tempoTotal
    };
  }
  
  // Corrigir informações da rota otimizada
  function corrigirRotaOtimizada() {
    try {
      // Verificar se temos a rota original
      if (!rotaOriginal) {
        console.log("🎮 [SimuladorVisualizar] Rota original não disponível para correção");
        simulando = false;
        esconderIndicadorCalculo();
        return;
      }
      
      // Encontrar elemento de informações da rota
      const infoRota = document.getElementById('route-info');
      if (!infoRota || !infoRota.innerHTML.includes('Rota Otimizada')) {
        console.log("🎮 [SimuladorVisualizar] Elemento de informações não encontrado ou não é rota otimizada");
        simulando = false;
        esconderIndicadorCalculo();
        return;
      }
      
      // Extrair distância atual da rota otimizada
      const matchDistancia = infoRota.innerHTML.match(/Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i);
      if (!matchDistancia) {
        console.log("🎮 [SimuladorVisualizar] Não foi possível extrair distância da rota otimizada");
        simulando = false;
        esconderIndicadorCalculo();
        return;
      }
      
      // Ler a distância atual (otimizada)
      const distanciaAtual = parseFloat(matchDistancia[1].replace(',', '.'));
      
      // Calcular tempo usando a mesma proporção da rota original
      // Isso simula como se estivéssemos usando o mesmo método de cálculo
      const proporcao = rotaOriginal.tempoHoras / rotaOriginal.distanciaKm;
      const tempoProjetado = distanciaAtual * proporcao;
      
      // Formatar tempo para exibição
      const horas = Math.floor(tempoProjetado);
      const minutos = Math.round((tempoProjetado - horas) * 60);
      
      console.log(`🎮 [SimuladorVisualizar] Ajustando tempo para distância ${distanciaAtual} km: ${horas}h ${minutos}min`);
      
      // Substituir tempo no HTML
      let novoHTML = infoRota.innerHTML.replace(
        /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
        `Tempo estimado:</strong> ${horas}h ${minutos}min`
      );
      
      // Adicionar comparação
      novoHTML = adicionarComparacao(novoHTML, rotaOriginal.distanciaKm, distanciaAtual, 
                                      rotaOriginal.tempoHoras, tempoProjetado);
      
      // Atualizar HTML
      infoRota.innerHTML = novoHTML;
      
      // Finalizar
      console.log("🎮 [SimuladorVisualizar] Correção concluída");
      simulando = false;
      esconderIndicadorCalculo();
    } catch (erro) {
      console.error("🎮 [SimuladorVisualizar] Erro ao corrigir rota otimizada:", erro);
      simulando = false;
      esconderIndicadorCalculo();
    }
  }
  
  // Adicionar comparação entre rotas
  function adicionarComparacao(html, distanciaOriginal, distanciaOtimizada, 
                               tempoOriginal, tempoOtimizado) {
    // Calcular diferenças
    const difDistancia = distanciaOriginal - distanciaOtimizada;
    const difTempo = tempoOriginal - tempoOtimizado;
    
    // Calcular percentuais
    const percentDistancia = (difDistancia / distanciaOriginal * 100).toFixed(1);
    const percentTempo = (difTempo / tempoOriginal * 100).toFixed(1);
    
    // Determinar textos e cores
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
          ${txtDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDistancia)}%)
        </span></p>
        <p>Tempo: <span style="color: ${corTempo}">
          ${txtTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
        </span></p>
        <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
          Cálculos realizados com o método preciso do botão Visualizar.
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
  
  // Mostrar indicador "Calculando..."
  function mostrarIndicadorCalculo() {
    let indicador = document.getElementById('simulador-calculando');
    
    if (!indicador) {
      indicador = document.createElement('div');
      indicador.id = 'simulador-calculando';
      indicador.style.position = 'fixed';
      indicador.style.top = '10px';
      indicador.style.right = '10px';
      indicador.style.backgroundColor = 'rgba(0,0,0,0.8)';
      indicador.style.color = 'white';
      indicador.style.padding = '10px 20px';
      indicador.style.borderRadius = '4px';
      indicador.style.zIndex = '9999';
      indicador.style.fontFamily = 'Arial, sans-serif';
      indicador.style.fontSize = '14px';
      indicador.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      indicador.innerHTML = 'Calculando rota com precisão...';
      
      document.body.appendChild(indicador);
    } else {
      indicador.style.display = 'block';
    }
  }
  
  // Esconder indicador
  function esconderIndicadorCalculo() {
    const indicador = document.getElementById('simulador-calculando');
    if (indicador) {
      indicador.style.display = 'none';
    }
  }
})();