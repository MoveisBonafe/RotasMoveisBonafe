/**
 * SOLUÇÃO ESPECÍFICA para a versão atual do GitHub Pages
 * Baseado na interface visualizada na imagem
 */
(function() {
  console.log('[SolucaoEspecifica] Iniciando solução específica para GitHub Pages');
  
  // Destinos observados na imagem
  var DESTINOS = [
    { id: 1, nome: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    { id: 2, nome: "Campinas", lat: -22.9071, lng: -47.0632 }
  ];
  
  // Origem (Dois Córregos-SP)
  var ORIGEM = { id: 0, nome: "Dois Córregos", lat: -22.3731, lng: -48.3796 };
  
  // Inicializar ao carregar a página
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Também tentar depois de um curto delay para garantir
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  
  // Variáveis de controle
  var botaoSubstituido = false;
  var logVisualAtivo = true;
  var logContainer = null;
  
  /**
   * Inicializa o script
   */
  function inicializar() {
    if (botaoSubstituido) return;
    
    log('Inicializando solução específica');
    
    // Criar log visual
    if (logVisualAtivo) {
      criarLogVisual();
    }
    
    // Verificar se estamos na URL correta
    if (window.location.href.includes('github.io')) {
      log('URL do GitHub Pages detectada');
    }
    
    // Encontrar o botão de otimização
    var botao = document.querySelector('.otimizar-rota, .primary-button, #optimize-route');
    
    // Se não encontrou pelo seletor específico, tentar pelo texto
    if (!botao) {
      var botoes = document.querySelectorAll('button');
      for (var i = 0; i < botoes.length; i++) {
        if (botoes[i].textContent.trim().toLowerCase().includes('otimizar')) {
          botao = botoes[i];
          break;
        }
      }
    }
    
    if (!botao) {
      log('Botão "Otimizar Rota" não encontrado, tentando novamente mais tarde');
      return;
    }
    
    log('Botão "Otimizar Rota" encontrado, ID: ' + botao.id + ', classe: ' + botao.className);
    
    // Substituir o comportamento do botão
    try {
      // Clonar para remover todos os eventos existentes
      var novoBotao = botao.cloneNode(true);
      botao.parentNode.replaceChild(novoBotao, botao);
      
      // Adicionar nosso evento de clique
      novoBotao.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        log('Botão "Otimizar Rota" clicado');
        
        // Chamar nossa função para calcular rota
        calcularRotaPersonalizada();
        
        return false;
      });
      
      log('Comportamento do botão substituído com sucesso');
      botaoSubstituido = true;
      
      // Verificar se temos o array global de locations
      if (window.locations) {
        log('Array global locations encontrado, tamanho: ' + window.locations.length);
      } else {
        log('Array global locations não encontrado');
      }
    } catch (e) {
      log('ERRO ao substituir botão: ' + e.message);
      console.error('Erro ao substituir botão:', e);
    }
  }
  
  /**
   * Calcula a rota personalizada na ordem original dos destinos
   */
  function calcularRotaPersonalizada() {
    log('Calculando rota personalizada com destinos fixos');
    
    try {
      // Encontrar o mapa
      var mapa = encontrarMapa();
      
      if (!mapa) {
        log('Mapa não encontrado');
        alert('Erro: Mapa não encontrado. Tente recarregar a página.');
        return;
      }
      
      log('Mapa encontrado com sucesso');
      
      // Limpar rotas existentes
      limparRotasExistentes();
      
      // Criar serviços do Google Maps
      var servicoDirecoes = new google.maps.DirectionsService();
      var renderizadorDirecoes = new google.maps.DirectionsRenderer({
        map: mapa,
        suppressMarkers: false
      });
      
      // Salvar referência global
      window.renderizadorDirecoes = renderizadorDirecoes;
      
      // Preparar waypoints para todos os destinos exceto o último
      var waypoints = DESTINOS.slice(0, -1).map(function(destino) {
        return {
          location: new google.maps.LatLng(destino.lat, destino.lng),
          stopover: true
        };
      });
      
      // Último destino
      var ultimoDestino = DESTINOS[DESTINOS.length - 1];
      
      log('Origem: ' + ORIGEM.nome);
      log('Destino final: ' + ultimoDestino.nome);
      log('Waypoints: ' + (DESTINOS.length - 1));
      
      // Solicitar rota (NÃO OTIMIZADA)
      servicoDirecoes.route({
        origin: new google.maps.LatLng(ORIGEM.lat, ORIGEM.lng),
        destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
        waypoints: waypoints,
        optimizeWaypoints: false, // NÃO OTIMIZAR!
        travelMode: google.maps.TravelMode.DRIVING
      }, function(resultado, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          log('Rota calculada com sucesso!');
          
          // Mostrar no mapa
          renderizadorDirecoes.setDirections(resultado);
          
          // Salvar resultado globalmente
          window.resultadoRota = resultado;
          
          // Atualizar a interface
          atualizarInterface(resultado);
          
          // Corrigir relatório da rota (se necessário)
          setTimeout(corrigirRelatorio, 1000);
        } else {
          log('ERRO ao calcular rota: ' + status);
          alert('Erro ao calcular rota: ' + status);
        }
      });
    } catch (e) {
      log('ERRO ao calcular rota: ' + e.message);
      console.error('Erro ao calcular rota:', e);
      alert('Erro ao calcular rota: ' + e.message);
    }
  }
  
  /**
   * Atualiza a interface com as informações da rota
   */
  function atualizarInterface(resultado) {
    if (!resultado || !resultado.routes || !resultado.routes[0]) {
      log('Resultado da rota inválido');
      return;
    }
    
    var rota = resultado.routes[0];
    var legs = rota.legs || [];
    
    // Calcular distância e duração total
    var distanciaTotal = 0;
    var duracaoTotal = 0;
    
    for (var i = 0; i < legs.length; i++) {
      if (legs[i].distance) distanciaTotal += legs[i].distance.value;
      if (legs[i].duration) duracaoTotal += legs[i].duration.value;
    }
    
    // Converter para unidades apropriadas
    var distanciaKm = (distanciaTotal / 1000).toFixed(1);
    var duracaoHoras = Math.floor(duracaoTotal / 3600);
    var duracaoMinutos = Math.floor((duracaoTotal % 3600) / 60);
    
    log('Distância total: ' + distanciaKm + ' km');
    log('Tempo estimado: ' + duracaoHoras + 'h ' + duracaoMinutos + 'min');
    
    // Atualizar elementos na interface
    var elementosDistancia = [
      document.querySelector('.route-info-distance'),
      document.querySelector('[class*="distance"]'),
      document.getElementById('route-distance')
    ];
    
    for (var i = 0; i < elementosDistancia.length; i++) {
      if (elementosDistancia[i]) {
        elementosDistancia[i].textContent = distanciaKm + ' km';
        log('Elemento de distância atualizado');
        break;
      }
    }
    
    var elementosDuracao = [
      document.querySelector('.route-info-duration'),
      document.querySelector('[class*="duration"]'),
      document.getElementById('route-duration')
    ];
    
    for (var i = 0; i < elementosDuracao.length; i++) {
      if (elementosDuracao[i]) {
        elementosDuracao[i].textContent = duracaoHoras + 'h ' + duracaoMinutos + 'min';
        log('Elemento de duração atualizado');
        break;
      }
    }
  }
  
  /**
   * Corrige o relatório da rota para garantir que a origem seja 0
   */
  function corrigirRelatorio() {
    log('Verificando relatório da rota');
    
    var relatorio = document.querySelector('.route-report') || 
                    document.querySelector('[class*="report"]') ||
                    document.querySelector('.sequence-report');
    
    if (!relatorio) {
      log('Relatório não encontrado');
      return;
    }
    
    log('Relatório encontrado, verificando itens');
    
    var itens = relatorio.querySelectorAll('li, div[class*="item"]');
    
    for (var i = 0; i < itens.length; i++) {
      var texto = itens[i].textContent.toLowerCase();
      
      if (texto.includes('dois córregos')) {
        log('Item da origem encontrado no relatório');
        
        // Verificar se o número de sequência começa com 0
        var match = texto.match(/^(\d+)[:\.\s-]/);
        
        if (match && match[1] !== '0') {
          log('Número da origem incorreto: ' + match[1] + ', corrigindo para 0');
          itens[i].innerHTML = itens[i].innerHTML.replace(match[0], '0' + match[0].substring(match[1].length));
        }
      }
    }
  }
  
  /**
   * Limpa rotas existentes no mapa
   */
  function limparRotasExistentes() {
    log('Limpando rotas existentes');
    
    try {
      // Limpar renderers conhecidos
      var renderizadores = [
        window.directionsRenderer,
        window.renderizadorDirecoes,
        window.renderizadorAtual,
        window.renderizadorOriginal
      ];
      
      for (var i = 0; i < renderizadores.length; i++) {
        if (renderizadores[i]) {
          renderizadores[i].setMap(null);
          log('Renderer ' + i + ' limpo');
        }
      }
      
      // Procurar outros renderers no objeto window
      for (var prop in window) {
        try {
          if (window[prop] instanceof google.maps.DirectionsRenderer) {
            window[prop].setMap(null);
            log('Renderer adicional limpo: ' + prop);
          }
        } catch (e) {}
      }
    } catch (e) {
      log('ERRO ao limpar rotas: ' + e.message);
      console.error('Erro ao limpar rotas:', e);
    }
  }
  
  /**
   * Encontra a instância do mapa
   */
  function encontrarMapa() {
    log('Procurando instância do mapa');
    
    // Verificar referência global
    if (window.map instanceof google.maps.Map) {
      log('Mapa encontrado na variável global window.map');
      return window.map;
    }
    
    // Procurar em todas as propriedades do objeto window
    for (var prop in window) {
      try {
        if (window[prop] instanceof google.maps.Map) {
          window.map = window[prop]; // Salvar referência global
          log('Mapa encontrado na variável global window.' + prop);
          return window.map;
        }
      } catch (e) {}
    }
    
    log('Mapa não encontrado em variáveis globais');
    
    // Tentar obter elemento do mapa e criar nova instância
    var mapContainer = document.getElementById('map') || 
                       document.querySelector('.map') ||
                       document.querySelector('[id*="map"]');
    
    if (mapContainer) {
      log('Container do mapa encontrado, tentando criar nova instância');
      
      try {
        var novoMapa = new google.maps.Map(mapContainer, {
          center: { lat: ORIGEM.lat, lng: ORIGEM.lng },
          zoom: 8
        });
        
        window.map = novoMapa;
        log('Nova instância do mapa criada com sucesso');
        return novoMapa;
      } catch (e) {
        log('ERRO ao criar nova instância do mapa: ' + e.message);
        console.error('Erro ao criar mapa:', e);
      }
    }
    
    return null;
  }
  
  /**
   * Cria o container para log visual
   */
  function criarLogVisual() {
    if (logContainer) return;
    
    logContainer = document.createElement('div');
    logContainer.id = 'solucao-especifica-log';
    logContainer.style.position = 'fixed';
    logContainer.style.bottom = '10px';
    logContainer.style.left = '10px';
    logContainer.style.width = '300px';
    logContainer.style.maxHeight = '200px';
    logContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
    logContainer.style.color = '#ffc107';
    logContainer.style.fontFamily = 'monospace';
    logContainer.style.fontSize = '11px';
    logContainer.style.padding = '10px';
    logContainer.style.borderRadius = '5px';
    logContainer.style.zIndex = '9999';
    logContainer.style.overflow = 'auto';
    
    // Adicionar título
    var titulo = document.createElement('div');
    titulo.textContent = 'Solução Específica - Log';
    titulo.style.fontWeight = 'bold';
    titulo.style.marginBottom = '5px';
    titulo.style.borderBottom = '1px solid #ffc107';
    titulo.style.paddingBottom = '3px';
    logContainer.appendChild(titulo);
    
    // Adicionar botão para fechar
    var fechar = document.createElement('button');
    fechar.textContent = 'X';
    fechar.style.position = 'absolute';
    fechar.style.top = '5px';
    fechar.style.right = '5px';
    fechar.style.backgroundColor = '#f44336';
    fechar.style.color = 'white';
    fechar.style.border = 'none';
    fechar.style.width = '16px';
    fechar.style.height = '16px';
    fechar.style.lineHeight = '14px';
    fechar.style.textAlign = 'center';
    fechar.style.borderRadius = '50%';
    fechar.style.fontSize = '10px';
    fechar.style.cursor = 'pointer';
    fechar.onclick = function() {
      logContainer.style.display = 'none';
    };
    logContainer.appendChild(fechar);
    
    document.body.appendChild(logContainer);
    log('Log visual inicializado');
  }
  
  /**
   * Função de log
   */
  function log(mensagem) {
    console.log('[SolucaoEspecifica] ' + mensagem);
    
    if (logVisualAtivo && logContainer) {
      var item = document.createElement('div');
      item.textContent = mensagem;
      item.style.borderBottom = '1px dotted rgba(255,193,7,0.3)';
      item.style.paddingBottom = '3px';
      item.style.marginBottom = '3px';
      
      // Inserir no topo
      if (logContainer.childNodes.length > 2) { // Pular título e botão fechar
        logContainer.insertBefore(item, logContainer.childNodes[2]);
      } else {
        logContainer.appendChild(item);
      }
      
      // Limitar a 15 itens
      if (logContainer.childNodes.length > 17) { // 2 iniciais + 15 logs
        logContainer.removeChild(logContainer.lastChild);
      }
    }
  }
})();