/**
 * Script simplificado para forçar a primeira rota a ser na ordem original
 */
window.addEventListener('load', function() {
  console.log('[RotaOriginalSimples] Carregando...');
  
  // Tentar configurar após um curto período para garantir que o DOM está pronto
  setTimeout(configurarBotao, 1000);
  setTimeout(configurarBotao, 2000);
  setTimeout(configurarBotao, 3000);
  
  // Variável para controlar se já configuramos
  var configurado = false;
  var primeiraVez = true;
  
  function configurarBotao() {
    if (configurado) return;
    
    console.log('[RotaOriginalSimples] Tentando configurar botão...');
    
    var botao = document.getElementById('optimize-route');
    if (!botao) {
      console.log('[RotaOriginalSimples] Botão não encontrado');
      return;
    }
    
    console.log('[RotaOriginalSimples] Botão encontrado, configurando...');
    
    // Salvar o handler original
    var handlerOriginal = botao.onclick;
    
    // Substituir pelo nosso handler
    botao.onclick = function(e) {
      console.log('[RotaOriginalSimples] Botão clicado');
      
      // Se for a primeira vez
      if (primeiraVez) {
        console.log('[RotaOriginalSimples] Primeira execução');
        primeiraVez = false;
        
        // Impedir comportamento padrão
        e.preventDefault();
        e.stopPropagation();
        
        // Capturar destinos
        var destinos = obterDestinos();
        
        // Se tem destinos, calcular rota original
        if (destinos.length > 0) {
          calcularRotaOriginal(destinos);
          return false;
        }
      }
      
      // Se não for a primeira vez, chamar o handler original
      if (typeof handlerOriginal === 'function') {
        return handlerOriginal.call(this, e);
      }
      
      return true;
    };
    
    configurado = true;
    console.log('[RotaOriginalSimples] Configuração concluída');
  }
  
  // Obter destinos atuais
  function obterDestinos() {
    console.log('[RotaOriginalSimples] Obtendo destinos');
    
    var resultado = [];
    
    // Encontrar container
    var container = document.getElementById('locations-list') || 
                    document.querySelector('.location-list') ||
                    document.querySelector('[class*="location"]');
    
    if (!container) {
      console.log('[RotaOriginalSimples] Container não encontrado');
      return resultado;
    }
    
    // Obter itens (exceto origem)
    var items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
    
    console.log('[RotaOriginalSimples] Encontrados', items.length, 'destinos');
    
    // Extrair informações
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var lat = null, lng = null;
      
      // Tentar extrair coordenadas
      if (item.dataset && item.dataset.lat && item.dataset.lng) {
        lat = parseFloat(item.dataset.lat);
        lng = parseFloat(item.dataset.lng);
      } else if (item.getAttribute('data-lat') && item.getAttribute('data-lng')) {
        lat = parseFloat(item.getAttribute('data-lat'));
        lng = parseFloat(item.getAttribute('data-lng'));
      } else {
        // Buscar coordenadas no conteúdo
        var html = item.innerHTML;
        var matches = html.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        
        if (matches && matches.length >= 3) {
          lat = parseFloat(matches[1]);
          lng = parseFloat(matches[2]);
        }
      }
      
      // Se encontrou coordenadas válidas
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        resultado.push({
          lat: lat,
          lng: lng,
          nome: item.textContent.trim()
        });
        console.log('[RotaOriginalSimples] Adicionado destino:', lat, lng);
      }
    }
    
    return resultado;
  }
  
  // Calcular rota na ordem original
  function calcularRotaOriginal(destinos) {
    console.log('[RotaOriginalSimples] Calculando rota para', destinos.length, 'destinos');
    
    if (destinos.length === 0) return;
    
    // Encontrar mapa
    var mapa = encontrarMapa();
    
    if (!mapa) {
      console.log('[RotaOriginalSimples] Mapa não encontrado');
      return;
    }
    
    // Origem (Dois Córregos-SP)
    var origem = { lat: -22.3731, lng: -48.3796 };
    
    // Último destino
    var ultimoDestino = destinos[destinos.length - 1];
    
    // Waypoints (demais destinos)
    var waypoints = [];
    for (var i = 0; i < destinos.length - 1; i++) {
      waypoints.push({
        location: new google.maps.LatLng(destinos[i].lat, destinos[i].lng),
        stopover: true
      });
    }
    
    // Limpar rotas existentes
    limparRotasExistentes();
    
    // Criar serviços
    var servicoRota = new google.maps.DirectionsService();
    var rendererRota = new google.maps.DirectionsRenderer({
      map: mapa,
      suppressMarkers: false
    });
    
    // Solicitar rota não otimizada
    servicoRota.route({
      origin: new google.maps.LatLng(origem.lat, origem.lng),
      destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
      waypoints: waypoints,
      optimizeWaypoints: false, // NÃO OTIMIZAR!
      travelMode: google.maps.TravelMode.DRIVING
    }, function(resultado, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        console.log('[RotaOriginalSimples] Rota calculada com sucesso');
        rendererRota.setDirections(resultado);
        
        // Salvar globalmente
        window.resultadoRotaOriginal = resultado;
        window.rendererRotaOriginal = rendererRota;
        
        // Atualizar renderer global se existir
        if (window.directionsRenderer) {
          try {
            window.directionsRenderer.setDirections(resultado);
          } catch (e) {
            console.error('[RotaOriginalSimples] Erro ao atualizar renderer global:', e);
          }
        }
      } else {
        console.error('[RotaOriginalSimples] Erro ao calcular rota:', status);
      }
    });
  }
  
  // Limpar rotas existentes
  function limparRotasExistentes() {
    try {
      // Limpar renderer global
      if (window.directionsRenderer) {
        try {
          window.directionsRenderer.setMap(null);
        } catch (e) {}
      }
      
      // Limpar outras instâncias
      for (var prop in window) {
        try {
          if (window[prop] instanceof google.maps.DirectionsRenderer) {
            window[prop].setMap(null);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error('[RotaOriginalSimples] Erro ao limpar rotas:', e);
    }
  }
  
  // Encontrar instância do mapa
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
    
    return null;
  }
});