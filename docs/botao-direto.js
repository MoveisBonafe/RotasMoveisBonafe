/**
 * Abordagem direta e agressiva para forçar rota não otimizada
 * Esta implementação substitui o botão "Otimizar Rota" completamente
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('[BotaoDireto] Script de substituição do botão carregado');
  
  // Tentar várias vezes com atraso crescente
  setTimeout(substituirBotao, 500);
  setTimeout(substituirBotao, 1000);
  setTimeout(substituirBotao, 2000);
  setTimeout(substituirBotao, 3000);
});

// Também tentar quando a página estiver totalmente carregada
window.addEventListener('load', function() {
  console.log('[BotaoDireto] Página carregada, tentando substituir botão...');
  substituirBotao();
  setTimeout(substituirBotao, 1000);
});

// Flag para controlar se já substituímos o botão
var botaoSubstituido = false;

// Origem (Dois Córregos-SP)
var ORIGEM_DOIS_CORREGOS = { lat: -22.3731, lng: -48.3796 };

/**
 * Substituir completamente o botão Otimizar Rota
 */
function substituirBotao() {
  if (botaoSubstituido) return;
  
  var botao = document.getElementById('optimize-route');
  
  if (!botao) {
    console.log('[BotaoDireto] Botão não encontrado');
    return;
  }
  
  console.log('[BotaoDireto] Botão encontrado, substituindo...');
  
  // Remover handlers existentes
  botao.onclick = null;
  botao.removeEventListener('click', null);
  
  // Clonar botão (para remover todos os listeners)
  var novoBotao = botao.cloneNode(true);
  botao.parentNode.replaceChild(novoBotao, botao);
  
  // Adicionar nosso próprio handler
  novoBotao.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[BotaoDireto] Botão Otimizar Rota clicado');
    
    // Capturar destinos
    var destinos = capturarDestinos();
    
    if (destinos.length === 0) {
      alert('Adicione pelo menos um destino para calcular a rota.');
      return false;
    }
    
    // Calcular a rota não otimizada (na ordem original)
    calcularRotaNaoOtimizada(destinos);
    
    return false;
  });
  
  botaoSubstituido = true;
  console.log('[BotaoDireto] Botão substituído com sucesso');
}

/**
 * Capturar todos os destinos adicionados
 */
function capturarDestinos() {
  console.log('[BotaoDireto] Capturando destinos...');
  
  var destinos = [];
  
  try {
    // MÉTODO 1: Tentar acessar array global de locations se existir
    if (typeof window.locations === 'object' && window.locations.length > 0) {
      console.log('[BotaoDireto] Usando array global de locations:', window.locations.length);
      
      // Filtrar apenas destinos (não a origem)
      for (var i = 0; i < window.locations.length; i++) {
        var loc = window.locations[i];
        if (loc && loc.lat && loc.lng && 
           (loc.lat !== ORIGEM_DOIS_CORREGOS.lat || loc.lng !== ORIGEM_DOIS_CORREGOS.lng)) {
          destinos.push({
            lat: loc.lat,
            lng: loc.lng,
            nome: loc.name || `Destino ${destinos.length + 1}`
          });
          console.log('[BotaoDireto] Adicionado do array global:', loc.lat, loc.lng);
        }
      }
      
      if (destinos.length > 0) {
        return destinos;
      }
    }
    
    // MÉTODO 2: Procurar todas as propriedades do objeto window
    for (var prop in window) {
      try {
        // Procurar arrays com elementos que tenham lat/lng
        if (Array.isArray(window[prop]) && window[prop].length > 0 && 
            window[prop][0] && window[prop][0].lat && window[prop][0].lng) {
          console.log('[BotaoDireto] Encontrado possível array de localizações:', prop);
          
          var locs = window[prop];
          
          // Adicionar os destinos (não a origem)
          for (var j = 0; j < locs.length; j++) {
            var loc = locs[j];
            if (loc && loc.lat && loc.lng && 
                (loc.lat !== ORIGEM_DOIS_CORREGOS.lat || loc.lng !== ORIGEM_DOIS_CORREGOS.lng)) {
              destinos.push({
                lat: loc.lat,
                lng: loc.lng,
                nome: loc.name || `Destino ${destinos.length + 1}`
              });
              console.log('[BotaoDireto] Adicionado do objeto window:', loc.lat, loc.lng);
            }
          }
          
          if (destinos.length > 0) {
            return destinos;
          }
        }
      } catch (e) {}
    }
    
    // MÉTODO 3: Extrair do DOM
    var container = document.getElementById('locations-list') || 
                    document.querySelector('.location-list') ||
                    document.querySelector('[class*="location"]');
    
    if (container) {
      // Obter todos os itens (exceto origem)
      var items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
      
      console.log('[BotaoDireto] Encontrados', items.length, 'itens no DOM');
      
      // Processar cada item
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var lat = null, lng = null;
        
        // Método 3.1: Verificar data attributes
        if (item.dataset && item.dataset.lat && item.dataset.lng) {
          lat = parseFloat(item.dataset.lat);
          lng = parseFloat(item.dataset.lng);
        } else if (item.getAttribute('data-lat') && item.getAttribute('data-lng')) {
          lat = parseFloat(item.getAttribute('data-lat'));
          lng = parseFloat(item.getAttribute('data-lng'));
        } 
        // Método 3.2: Buscar no conteúdo HTML por padrão de coordenadas
        else {
          var coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
          var matches = item.innerHTML.match(coordRegex);
          
          if (matches && matches.length >= 3) {
            lat = parseFloat(matches[1]);
            lng = parseFloat(matches[2]);
          }
        }
        
        // Método 3.3: Se não encontrou coordenadas, tente procurar em elementos filhos
        if (!lat || !lng) {
          var childNodes = item.querySelectorAll('*');
          for (var j = 0; j < childNodes.length; j++) {
            var child = childNodes[j];
            if (child.dataset && child.dataset.lat && child.dataset.lng) {
              lat = parseFloat(child.dataset.lat);
              lng = parseFloat(child.dataset.lng);
              break;
            } else if (child.getAttribute('data-lat') && child.getAttribute('data-lng')) {
              lat = parseFloat(child.getAttribute('data-lat'));
              lng = parseFloat(child.getAttribute('data-lng'));
              break;
            }
          }
        }
        
        // Se encontrou coordenadas válidas
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          // Verificar se não é Dois Córregos (origem)
          if (lat !== ORIGEM_DOIS_CORREGOS.lat || lng !== ORIGEM_DOIS_CORREGOS.lng) {
            destinos.push({
              lat: lat,
              lng: lng,
              nome: item.textContent.trim()
            });
            console.log('[BotaoDireto] Destino adicionado do DOM:', lat, lng);
          }
        }
      }
    }
    
    // MÉTODO 4: Último recurso - procurar locais direto nos botões
    if (destinos.length === 0) {
      console.log('[BotaoDireto] Tentando extrair de botões de remoção...');
      
      var botoesRemover = document.querySelectorAll('button[id*="remove"], button[class*="remove"], [class*="delete-button"]');
      
      for (var i = 0; i < botoesRemover.length; i++) {
        var btn = botoesRemover[i];
        var locationId = btn.getAttribute('data-id') || btn.id;
        
        if (locationId) {
          // Tentar encontrar o destino correspondente em algum array global
          for (var prop in window) {
            try {
              if (Array.isArray(window[prop])) {
                for (var j = 0; j < window[prop].length; j++) {
                  var item = window[prop][j];
                  if (item && item.id == locationId && item.lat && item.lng) {
                    destinos.push({
                      lat: item.lat,
                      lng: item.lng,
                      nome: item.name || `Destino ${destinos.length + 1}`
                    });
                    console.log('[BotaoDireto] Destino adicionado de botão:', item.lat, item.lng);
                  }
                }
              }
            } catch (e) {}
          }
        }
      }
    }
  } catch (err) {
    console.error('[BotaoDireto] Erro ao capturar destinos:', err);
  }
  
  console.log('[BotaoDireto] Total de destinos capturados:', destinos.length);
  return destinos;
}

/**
 * Calcular rota na ordem original (não otimizada)
 */
function calcularRotaNaoOtimizada(destinos) {
  if (destinos.length === 0) {
    console.error('[BotaoDireto] Sem destinos para calcular');
    return;
  }
  
  console.log('[BotaoDireto] Calculando rota para', destinos.length, 'destinos na ordem original');
  
  // Encontrar mapa
  var mapa = encontrarMapa();
  
  if (!mapa) {
    console.error('[BotaoDireto] Mapa não encontrado');
    return;
  }
  
  // Limpar rotas existentes
  limparRotasExistentes();
  
  // Criar serviços
  var servicoDirecoes = new google.maps.DirectionsService();
  var renderizadorDirecoes = new google.maps.DirectionsRenderer({
    map: mapa,
    suppressMarkers: false
  });
  
  // Guardar referência global
  window.renderizadorRotaOriginal = renderizadorDirecoes;
  
  // Preparar waypoints (destinos intermediários)
  var waypoints = [];
  for (var i = 0; i < destinos.length - 1; i++) {
    waypoints.push({
      location: new google.maps.LatLng(destinos[i].lat, destinos[i].lng),
      stopover: true
    });
  }
  
  // Último destino
  var ultimoDestino = destinos[destinos.length - 1];
  
  console.log('[BotaoDireto] Solicitando rota não otimizada');
  
  // Solicitar cálculo da rota (NÃO OTIMIZADA)
  servicoDirecoes.route({
    origin: new google.maps.LatLng(ORIGEM_DOIS_CORREGOS.lat, ORIGEM_DOIS_CORREGOS.lng),
    destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
    waypoints: waypoints,
    optimizeWaypoints: false, // NÃO OTIMIZAR! Importante!
    travelMode: google.maps.TravelMode.DRIVING
  }, function(result, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      console.log('[BotaoDireto] Rota calculada com sucesso');
      
      // Mostrar no mapa
      renderizadorDirecoes.setDirections(result);
      
      // Salvar resultado globalmente
      window.resultadoOriginal = result;
      
      // Calcular e mostrar informações
      mostrarInformacoesRota(result);
      
      // Adicionar e selecionar opção "Rota Personalizada" (ordem original)
      setTimeout(adicionarSelecaoRotaPersonalizada, 1000);
    } else {
      console.error('[BotaoDireto] Erro ao calcular rota:', status);
      alert('Não foi possível calcular a rota. Tente novamente.');
    }
  });
}

/**
 * Mostrar informações da rota calculada
 */
function mostrarInformacoesRota(resultado) {
  if (!resultado || !resultado.routes || !resultado.routes[0]) return;
  
  var rota = resultado.routes[0];
  var legs = rota.legs || [];
  
  // Calcular totais
  var distanciaTotal = 0;
  var duracaoTotal = 0;
  
  for (var i = 0; i < legs.length; i++) {
    var leg = legs[i];
    if (leg.distance) distanciaTotal += leg.distance.value;
    if (leg.duration) duracaoTotal += leg.duration.value;
  }
  
  // Converter para km e horas
  var distanciaKm = (distanciaTotal / 1000).toFixed(1);
  var duracaoHoras = Math.floor(duracaoTotal / 3600);
  var duracaoMinutos = Math.floor((duracaoTotal % 3600) / 60);
  
  console.log('[BotaoDireto] Distância:', distanciaKm, 'km, Tempo:', duracaoHoras, 'h', duracaoMinutos, 'min');
  
  // Tentar atualizar informações na interface
  atualizarInfoInterfaceInicial(distanciaKm, duracaoTotal, resultado.routes[0].waypoint_order);
}

/**
 * Atualizar informações na interface
 */
function atualizarInfoInterfaceInicial(distanciaKm, duracaoSegundos, waypointOrder) {
  // Converter segundos para formato horas:minutos
  var horas = Math.floor(duracaoSegundos / 3600);
  var minutos = Math.floor((duracaoSegundos % 3600) / 60);
  
  // Tentar encontrar elementos da interface
  var infoDistancia = document.querySelector('.route-info-distance') || 
                      document.querySelector('[class*="distance"]') ||
                      document.getElementById('route-distance');
  
  var infoDuracao = document.querySelector('.route-info-duration') || 
                   document.querySelector('[class*="duration"]') ||
                   document.getElementById('route-duration');
  
  // Atualizar se encontrou
  if (infoDistancia) {
    infoDistancia.textContent = distanciaKm + ' km';
  }
  
  if (infoDuracao) {
    infoDuracao.textContent = horas + 'h ' + minutos + 'min';
  }
}

/**
 * Adicionar e selecionar opção "Rota Personalizada"
 */
function adicionarSelecaoRotaPersonalizada() {
  console.log('[BotaoDireto] Procurando container de alternativas...');
  
  // Procurar container de alternativas
  var container = document.querySelector('.alternative-routes-section') || 
                 document.querySelector('[class*="alternative-routes"]');
  
  if (!container) {
    console.log('[BotaoDireto] Container de alternativas não encontrado');
    return;
  }
  
  console.log('[BotaoDireto] Container de alternativas encontrado');
  
  // Verificar se já existe card personalizado
  var cards = container.querySelectorAll('.route-option-card, .route-card, [class*="route-option"]');
  var cardPersonalizado = null;
  
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    if (card.textContent.toLowerCase().includes('personalizada')) {
      cardPersonalizado = card;
      break;
    }
  }
  
  // Se encontrou, selecionar
  if (cardPersonalizado) {
    console.log('[BotaoDireto] Card personalizado encontrado, selecionando');
    
    try {
      // Atualizar classe
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('selected');
      }
      
      cardPersonalizado.classList.add('selected');
      
      // Simular clique
      cardPersonalizado.click();
      
      console.log('[BotaoDireto] Card personalizado selecionado');
    } catch (e) {
      console.error('[BotaoDireto] Erro ao selecionar card personalizado:', e);
    }
  } else {
    console.log('[BotaoDireto] Card personalizado não encontrado');
  }
}

/**
 * Limpar rotas existentes
 */
function limparRotasExistentes() {
  try {
    // Limpar renderer global
    if (window.directionsRenderer) {
      window.directionsRenderer.setMap(null);
    }
    
    // Limpar pelo tipo
    for (var prop in window) {
      try {
        if (window[prop] instanceof google.maps.DirectionsRenderer) {
          window[prop].setMap(null);
        }
      } catch (e) {}
    }
  } catch (e) {
    console.error('[BotaoDireto] Erro ao limpar rotas:', e);
  }
}

/**
 * Encontrar instância do mapa
 */
function encontrarMapa() {
  // Verificar referência global
  if (window.map instanceof google.maps.Map) {
    return window.map;
  }
  
  // Procurar no objeto window
  for (var prop in window) {
    try {
      if (window[prop] instanceof google.maps.Map) {
        window.map = window[prop]; // Salvar globalmente
        return window.map;
      }
    } catch (e) {}
  }
  
  // Procurar nos elementos DOM
  var mapElement = document.getElementById('map') || 
                   document.querySelector('.map') || 
                   document.querySelector('[id*="map"]');
  
  if (mapElement) {
    try {
      var novoMapa = new google.maps.Map(mapElement, {
        center: { lat: ORIGEM_DOIS_CORREGOS.lat, lng: ORIGEM_DOIS_CORREGOS.lng },
        zoom: 8
      });
      
      window.map = novoMapa;
      return novoMapa;
    } catch (e) {
      console.error('[BotaoDireto] Erro ao criar novo mapa:', e);
    }
  }
  
  return null;
}