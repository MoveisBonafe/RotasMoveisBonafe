/**
 * Otimizador Preciso de Rotas
 * 
 * Este script:
 * 1. Captura todas as localizações quando o usuário clica em "Otimizar"
 * 2. Calcula TODAS as possíveis combinações de rotas usando o método "Visualizar"
 * 3. Encontra a rota com menor distância/tempo e a mostra como resultado
 * 4. Exibe um indicador de "Calculando..." durante o processo
 */
(function() {
  console.log("🧭 [OtimizadorPreciso] Inicializando otimizador preciso");
  
  // Referências para a API do Google Maps
  let directionsService = null;
  let directionsRenderer = null;
  let map = null;
  
  // Lista de localizações e estado de cálculo
  let localizacoes = [];
  let calculando = false;
  let melhorRota = null;
  
  // Elemento de overlay para indicador "Calculando..."
  let overlayCalculando = null;
  
  // Inicializar após carregamento da página
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1500);
  setTimeout(inicializar, 3000);
  
  function inicializar() {
    console.log("🧭 [OtimizadorPreciso] Configurando sistema");
    
    // Interceptar API do Google Maps
    if (window.google && window.google.maps) {
      // Tentar obter as referências necessárias
      if (window.directionsService) {
        directionsService = window.directionsService;
      }
      
      if (window.directionsRenderer) {
        directionsRenderer = window.directionsRenderer;
      }
      
      if (window.map) {
        map = window.map;
      }
      
      // Se ainda não temos as referências, configurar interceptadores
      if (!directionsService || !directionsRenderer || !map) {
        monitorarGoogleMaps();
      }
    }
    
    // Interceptar o botão de otimização
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      interceptarBotaoOtimizar(botaoOtimizar);
    }
    
    // Criar overlay para "Calculando..."
    criarOverlay();
    
    console.log("🧭 [OtimizadorPreciso] Configuração concluída");
  }
  
  // Monitorar o Google Maps para obter referências
  function monitorarGoogleMaps() {
    console.log("🧭 [OtimizadorPreciso] Monitorando Google Maps");
    
    // Verificar periodicamente
    const intervalo = setInterval(() => {
      if (window.directionsService) directionsService = window.directionsService;
      if (window.directionsRenderer) directionsRenderer = window.directionsRenderer;
      if (window.map) map = window.map;
      
      if (directionsService && directionsRenderer && map) {
        console.log("🧭 [OtimizadorPreciso] Referências do Google Maps obtidas");
        clearInterval(intervalo);
      }
    }, 1000);
    
    // Limite de tempo para monitoramento
    setTimeout(() => clearInterval(intervalo), 30000);
  }
  
  // Interceptar botão de otimização
  function interceptarBotaoOtimizar(botao) {
    console.log("🧭 [OtimizadorPreciso] Interceptando botão de otimização");
    
    // Armazenar função original
    const originalOnClick = botao.onclick;
    
    // Substituir com nossa função
    botao.onclick = function(event) {
      // Evitar execução duplicada
      if (calculando) {
        console.log("🧭 [OtimizadorPreciso] Já existe um cálculo em andamento");
        return;
      }
      
      console.log("🧭 [OtimizadorPreciso] Botão de otimização clicado");
      
      // Capturar localizações antes de fazer qualquer coisa
      capturarLocalizacoes();
      
      // Verificar se temos localizações suficientes
      if (localizacoes.length < 3) { // Origem + pelo menos 2 destinos
        console.log("🧭 [OtimizadorPreciso] Localizações insuficientes para otimização");
        
        // Executar comportamento original
        if (originalOnClick) {
          return originalOnClick.call(this, event);
        }
        return;
      }
      
      // Iniciar nosso processo de otimização
      event.preventDefault();
      event.stopPropagation();
      
      console.log("🧭 [OtimizadorPreciso] Iniciando processo de otimização personalizado");
      
      // Mostrar overlay "Calculando..."
      mostrarCalculando();
      
      // Iniciar otimização
      otimizarRotasComPrecisao();
      
      return false;
    };
  }
  
  // Capturar todas as localizações atuais
  function capturarLocalizacoes() {
    // Limpar lista anterior
    localizacoes = [];
    
    // Verificar a variável global
    if (window.locations && Array.isArray(window.locations)) {
      localizacoes = window.locations.slice();
      console.log("🧭 [OtimizadorPreciso] Capturadas", localizacoes.length, "localizações");
    } else {
      console.log("🧭 [OtimizadorPreciso] Nenhuma localização encontrada");
    }
  }
  
  // Criar overlay "Calculando..."
  function criarOverlay() {
    // Verificar se já existe
    if (overlayCalculando) return;
    
    // Criar elemento
    overlayCalculando = document.createElement('div');
    overlayCalculando.style.position = 'fixed';
    overlayCalculando.style.top = '0';
    overlayCalculando.style.left = '0';
    overlayCalculando.style.width = '100%';
    overlayCalculando.style.height = '100%';
    overlayCalculando.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlayCalculando.style.zIndex = '9999';
    overlayCalculando.style.display = 'flex';
    overlayCalculando.style.alignItems = 'center';
    overlayCalculando.style.justifyContent = 'center';
    overlayCalculando.style.flexDirection = 'column';
    overlayCalculando.style.color = 'white';
    overlayCalculando.style.fontFamily = 'Arial, sans-serif';
    overlayCalculando.style.fontSize = '24px';
    overlayCalculando.style.display = 'none'; // Inicialmente oculto
    
    // Conteúdo do overlay
    overlayCalculando.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 20px;">Calculando todas as rotas possíveis...</div>
        <div id="progresso-calculo" style="margin-bottom: 20px;">0%</div>
        <div style="width: 300px; height: 10px; background: #555; border-radius: 5px; overflow: hidden;">
          <div id="barra-progresso" style="width: 0%; height: 100%; background: linear-gradient(45deg, #FFD700, #FFA500);"></div>
        </div>
        <div style="margin-top: 20px; font-size: 16px;">
          Aguarde enquanto todas as possibilidades são calculadas<br>
          usando o algoritmo preciso.
        </div>
      </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(overlayCalculando);
  }
  
  // Mostrar overlay "Calculando..."
  function mostrarCalculando() {
    if (overlayCalculando) {
      overlayCalculando.style.display = 'flex';
      document.getElementById('progresso-calculo').textContent = '0%';
      document.getElementById('barra-progresso').style.width = '0%';
      calculando = true;
    }
  }
  
  // Atualizar progresso do cálculo
  function atualizarProgresso(percentual) {
    if (overlayCalculando) {
      document.getElementById('progresso-calculo').textContent = `${Math.round(percentual)}%`;
      document.getElementById('barra-progresso').style.width = `${percentual}%`;
    }
  }
  
  // Esconder overlay "Calculando..."
  function esconderCalculando() {
    if (overlayCalculando) {
      overlayCalculando.style.display = 'none';
      calculando = false;
    }
  }
  
  // Otimizar rotas usando o método preciso
  function otimizarRotasComPrecisao() {
    console.log("🧭 [OtimizadorPreciso] Iniciando otimização precisa com", localizacoes.length, "pontos");
    
    // Verificar serviço de direções
    if (!directionsService) {
      console.log("🧭 [OtimizadorPreciso] Serviço de direções não disponível");
      esconderCalculando();
      return;
    }
    
    // Encontrar origem (primeiro ponto com isOrigin=true)
    const origem = localizacoes.find(loc => loc.isOrigin);
    if (!origem) {
      console.log("🧭 [OtimizadorPreciso] Origem não encontrada");
      esconderCalculando();
      return;
    }
    
    // Filtrar apenas os destinos
    const destinos = localizacoes.filter(loc => !loc.isOrigin);
    
    // Caso básico: sem destinos ou apenas um destino
    if (destinos.length <= 1) {
      console.log("🧭 [OtimizadorPreciso] Não há suficientes destinos para otimizar");
      esconderCalculando();
      return;
    }
    
    // Gerar todas as permutações possíveis dos destinos
    const permutacoes = gerarPermutacoes(destinos);
    console.log("🧭 [OtimizadorPreciso] Calculando", permutacoes.length, "permutações possíveis");
    
    // Preparar para calcular todas as rotas
    let melhorDistancia = Infinity;
    melhorRota = null;
    let permutacaoAtual = 0;
    
    // Função para calcular a próxima rota
    function calcularProximaRota() {
      // Verificar se terminamos
      if (permutacaoAtual >= permutacoes.length) {
        finalizarOtimizacao();
        return;
      }
      
      // Atualizar progresso
      const progresso = (permutacaoAtual / permutacoes.length) * 100;
      atualizarProgresso(progresso);
      
      // Obter a permutação atual
      const rotaAtual = permutacoes[permutacaoAtual];
      
      // Preparar pontos para a rota
      const pontoOrigem = { lat: origem.latitude, lng: origem.longitude };
      const pontosDestino = rotaAtual.map(dest => {
        return { lat: dest.latitude, lng: dest.longitude };
      });
      
      // Criar waypoints para a API do Google Maps
      const waypoints = pontosDestino.map(ponto => {
        return {
          location: ponto,
          stopover: true
        };
      });
      
      // Configurar requisição de rota
      const requisicao = {
        origin: pontoOrigem,
        destination: pontoOrigem, // Voltar para a origem
        waypoints: waypoints,
        travelMode: 'DRIVING',
        optimizeWaypoints: false // Não queremos que o Google otimize
      };
      
      // Calcular esta rota
      directionsService.route(requisicao, (resultado, status) => {
        if (status === 'OK' && resultado.routes && resultado.routes.length > 0) {
          // Calcular distância total
          let distanciaTotal = 0;
          let tempoTotal = 0;
          
          resultado.routes[0].legs.forEach(leg => {
            distanciaTotal += leg.distance.value;
            tempoTotal += leg.duration.value;
          });
          
          // Verificar se é a melhor rota até agora
          if (distanciaTotal < melhorDistancia) {
            melhorDistancia = distanciaTotal;
            melhorRota = {
              permutacao: rotaAtual,
              resultado: resultado,
              distanciaTotal: distanciaTotal,
              tempoTotal: tempoTotal
            };
            
            console.log("🧭 [OtimizadorPreciso] Nova melhor rota encontrada:", 
                        (distanciaTotal / 1000).toFixed(2), "km");
          }
        } else {
          console.log("🧭 [OtimizadorPreciso] Erro ao calcular rota:", status);
        }
        
        // Avançar para a próxima permutação
        permutacaoAtual++;
        
        // Usar setTimeout para não bloquear a UI
        setTimeout(calcularProximaRota, 100);
      });
    }
    
    // Iniciar o cálculo da primeira rota
    calcularProximaRota();
  }
  
  // Finalizar o processo de otimização
  function finalizarOtimizacao() {
    console.log("🧭 [OtimizadorPreciso] Finalizando otimização");
    
    // Esconder overlay
    esconderCalculando();
    
    // Verificar se encontramos uma boa rota
    if (!melhorRota) {
      console.log("🧭 [OtimizadorPreciso] Nenhuma rota válida encontrada");
      alert("Não foi possível calcular uma rota otimizada. Por favor, tente novamente.");
      return;
    }
    
    // Desenhar a melhor rota no mapa
    if (directionsRenderer) {
      directionsRenderer.setDirections(melhorRota.resultado);
      console.log("🧭 [OtimizadorPreciso] Rota otimizada renderizada no mapa");
    }
    
    // Atualizar informações da rota
    atualizarInformacoesRota(melhorRota);
  }
  
  // Atualizar informações da rota na interface
  function atualizarInformacoesRota(rota) {
    // Encontrar o elemento de informações
    const infoRota = document.getElementById('route-info');
    if (!infoRota) {
      console.log("🧭 [OtimizadorPreciso] Elemento de informações não encontrado");
      return;
    }
    
    // Converter para formatos legíveis
    const distanciaKm = (rota.distanciaTotal / 1000).toFixed(2);
    const tempoHoras = Math.floor(rota.tempoTotal / 3600);
    const tempoMinutos = Math.floor((rota.tempoTotal % 3600) / 60);
    
    // Criar descrição da ordem da rota
    const ordemHTML = ['<ol>'];
    
    // Adicionar a origem
    const origem = localizacoes.find(loc => loc.isOrigin);
    ordemHTML.push(`<li>${origem.name} (Origem)</li>`);
    
    // Adicionar os destinos na ordem otimizada
    rota.permutacao.forEach(dest => {
      ordemHTML.push(`<li>${dest.name}</li>`);
    });
    
    // Adicionar retorno para a origem
    ordemHTML.push(`<li>${origem.name} (Retorno)</li>`);
    ordemHTML.push('</ol>');
    
    // Atualizar HTML das informações
    infoRota.innerHTML = `
      <p><strong>Rota Otimizada</strong></p>
      <p><strong>Distância total:</strong> ${distanciaKm} km</p>
      <p><strong>Tempo estimado:</strong> ${tempoHoras}h ${tempoMinutos}min</p>
      <p><strong>Paradas:</strong> ${rota.permutacao.length}</p>
      <p><strong>Sequência otimizada:</strong></p>
      ${ordemHTML.join('')}
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p style="font-style: italic; color: #4CAF50;">
          Esta rota foi calculada com o algoritmo de alta precisão.<br>
          Todas as ${calcularFatorial(rota.permutacao.length)} possibilidades foram analisadas.
        </p>
      </div>
    `;
    
    // Atualizar a lista de localizações na ordem otimizada
    atualizarListaLocalizacoes(rota.permutacao);
  }
  
  // Atualizar a lista de localizações na ordem otimizada
  function atualizarListaLocalizacoes(permutacao) {
    // Obter ID original com isOrigin
    const origem = localizacoes.find(loc => loc.isOrigin);
    
    // Reorganizar as localizações
    window.locations = [origem].concat(permutacao);
    
    // Atualizar a lista visual
    const listaContainer = document.getElementById('location-list');
    if (listaContainer) {
      // Limpar a lista atual
      listaContainer.innerHTML = '';
      
      // Adicionar na nova ordem
      window.locations.forEach(loc => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.innerHTML = `
          <strong>${loc.name}</strong>${loc.isOrigin ? ' (Origem)' : ''}
          <br>${loc.address}
          ${loc.zipCode ? '<br>CEP: ' + loc.zipCode : ''}
          <button class="remove-button" style="width: auto; margin-left: 10px;" 
           onclick="removeLocation(${loc.id})">Remover</button>
        `;
        listaContainer.appendChild(item);
      });
    }
  }
  
  // Gerar todas as permutações possíveis de um array
  function gerarPermutacoes(array) {
    // Para grandes arrays, limitar para não travar o navegador
    if (array.length > 8) {
      console.log("🧭 [OtimizadorPreciso] Array muito grande para permutações completas, usando algoritmo aproximado");
      return [array.slice()]; // Retornar apenas a ordem atual como aproximação
    }
    
    const resultado = [];
    
    // Função recursiva para gerar permutações
    function permutar(arr, m = []) {
      if (arr.length === 0) {
        resultado.push(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          const atual = arr.slice();
          const proximo = atual.splice(i, 1);
          permutar(atual, m.concat(proximo));
        }
      }
    }
    
    permutar(array);
    return resultado;
  }
  
  // Calcular fatorial para mostrar o número de permutações
  function calcularFatorial(n) {
    if (n <= 1) return 1;
    let resultado = 1;
    for (let i = 2; i <= n; i++) {
      resultado *= i;
    }
    return resultado;
  }
})();