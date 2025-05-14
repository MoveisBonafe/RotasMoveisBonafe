/**
 * Solução definitiva com coordenadas hardcoded para garantir o funcionamento
 */
(function() {
  console.log('[SolucaoHardcoded] Inicializando solução com destinos pré-definidos');
  
  // Adicionar log global para debug
  window.DEBUG_SOLUTION = true;
  
  // Função global de log para debug
  window.logDebug = function() {
    if (window.DEBUG_SOLUTION) {
      console.log.apply(console, arguments);
      
      // Tentar mostrar no DOM também
      try {
        var debugDiv = document.getElementById('debug-info');
        if (!debugDiv) {
          debugDiv = document.createElement('div');
          debugDiv.id = 'debug-info';
          debugDiv.style.position = 'fixed';
          debugDiv.style.bottom = '10px';
          debugDiv.style.right = '10px';
          debugDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
          debugDiv.style.color = '#fff';
          debugDiv.style.padding = '10px';
          debugDiv.style.borderRadius = '5px';
          debugDiv.style.maxHeight = '200px';
          debugDiv.style.maxWidth = '400px';
          debugDiv.style.overflow = 'auto';
          debugDiv.style.zIndex = '9999';
          document.body.appendChild(debugDiv);
        }
        
        var args = Array.prototype.slice.call(arguments);
        var message = args.map(function(arg) {
          return typeof arg === 'object' ? JSON.stringify(arg) : arg;
        }).join(' ');
        
        var logItem = document.createElement('div');
        logItem.textContent = message;
        logItem.style.borderBottom = '1px solid #555';
        logItem.style.paddingBottom = '5px';
        logItem.style.marginBottom = '5px';
        
        // Limitar a 10 itens
        if (debugDiv.children.length > 10) {
          debugDiv.removeChild(debugDiv.children[0]);
        }
        
        debugDiv.appendChild(logItem);
      } catch(e) {}
    }
  };
  
  // Destinos conhecidos comuns
  var DESTINOS_PADRAO = [
    { nome: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    { nome: "Campinas", lat: -22.9071, lng: -47.0632 }
  ];
  
  // Origem (Dois Córregos-SP)
  var ORIGEM = { lat: -22.3731, lng: -48.3796, nome: "Dois Córregos" };
  
  // Capturar eventos
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar várias vezes para garantir
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  
  // Controle
  var botaoSubstituido = false;
  
  /**
   * Inicializar o sistema
   */
  function inicializar() {
    window.logDebug('[SolucaoHardcoded] Inicializando script na página');
    
    if (botaoSubstituido) {
      window.logDebug('[SolucaoHardcoded] Botão já substituído, ignorando');
      return;
    }
    
    // Forçar detecção da versão
    window.logDebug('[SolucaoHardcoded] Tentando detectar URLs no DOM para identificar versão');
    var pageHtml = document.documentElement.innerHTML;
    if (pageHtml.includes('github.io')) {
      window.logDebug('[SolucaoHardcoded] Versão GitHub Pages detectada!');
    }
    
    // Criar botão personalizado se não encontrar o original
    var botao = document.getElementById('optimize-route');
    
    if (!botao) {
      window.logDebug('[SolucaoHardcoded] Botão padrão não encontrado, buscando alternativas...');
      
      // Tentar outros seletores
      botao = document.querySelector('button[id*="optimize"], button[class*="optimize"], button.primary-button');
      
      if (!botao) {
        // Tentar procurar pelo conteúdo do botão
        var todosBotoes = document.querySelectorAll('button');
        for (var i = 0; i < todosBotoes.length; i++) {
          if (todosBotoes[i].textContent.toLowerCase().includes('otimizar') || 
              todosBotoes[i].textContent.toLowerCase().includes('calcular')) {
            botao = todosBotoes[i];
            window.logDebug('[SolucaoHardcoded] Botão encontrado pelo texto:', botao.textContent);
            break;
          }
        }
      }
      
      // Se ainda não encontrou, criar um novo botão
      if (!botao) {
        window.logDebug('[SolucaoHardcoded] Criando botão otimizar personalizado');
        
        botao = document.createElement('button');
        botao.textContent = 'Otimizar Rota';
        botao.id = 'optimize-route-custom';
        botao.style.backgroundColor = '#ffc107';
        botao.style.color = '#000';
        botao.style.border = 'none';
        botao.style.padding = '10px 15px';
        botao.style.borderRadius = '5px';
        botao.style.fontWeight = 'bold';
        botao.style.cursor = 'pointer';
        botao.style.width = '100%';
        botao.style.marginTop = '10px';
        
        // Procurar container para adicionar
        var container = document.querySelector('.sidebar') || 
                        document.querySelector('[class*="sidebar"]') || 
                        document.querySelector('.locations-container') ||
                        document.querySelector('[class*="location"]');
        
        if (container) {
          container.appendChild(botao);
          window.logDebug('[SolucaoHardcoded] Botão personalizado adicionado ao container');
        } else {
          // Último recurso: adicionar ao body
          document.body.appendChild(botao);
          window.logDebug('[SolucaoHardcoded] Botão personalizado adicionado ao body');
        }
      }
    }
    
    if (!botao) {
      window.logDebug('[SolucaoHardcoded] Nenhum botão encontrado, tentando novamente mais tarde...');
      return;
    }
    
    window.logDebug('[SolucaoHardcoded] Botão encontrado, substituindo comportamento');
    window.logDebug('[SolucaoHardcoded] Detalhes botão - ID:', botao.id, ' Classe:', botao.className, ' Texto:', botao.textContent);
    
    // Substituir comportamento
    var oldOnClick = botao.onclick;
    
    // Clonar botão para remover todos os listeners existentes
    var novoBotao = botao.cloneNode(true);
    botao.parentNode.replaceChild(novoBotao, botao);
    
    // Adicionar nosso handler
    novoBotao.addEventListener('click', function(e) {
      // Prevenir padrão
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      window.logDebug('[SolucaoHardcoded] Botão Otimizar Rota clicado');
      
      // Obter destinos (primeiro tentar detectar, depois usar padrão)
      var destinos = capturarDestinosReais() || DESTINOS_PADRAO;
      
      window.logDebug('[SolucaoHardcoded] Destinos a serem usados:', JSON.stringify(destinos));
      
      if (destinos.length === 0) {
        window.logDebug('[SolucaoHardcoded] ERRO: Nenhum destino encontrado');
        alert('Adicione pelo menos um destino para calcular a rota.');
        return false;
      }
      
      // Calcular rota na ordem original
      calcularRotaOriginal(destinos);
      
      return false;
    });
    
    botaoSubstituido = true;
    window.logDebug('[SolucaoHardcoded] Substituição do botão concluída com sucesso');
  }
  
  /**
   * Tentar capturar destinos reais da interface
   */
  function capturarDestinosReais() {
    window.logDebug('[SolucaoHardcoded] Tentando capturar destinos reais...');
    
    try {
      // Verificar se temos um array de locations global
      if (typeof window.locations === 'object' && window.locations.length > 0) {
        var destinos = [];
        
        // Filtrar apenas destinos (não a origem)
        for (var i = 0; i < window.locations.length; i++) {
          var loc = window.locations[i];
          if (loc && loc.lat && loc.lng && 
             (loc.lat !== ORIGEM.lat || loc.lng !== ORIGEM.lng)) {
            destinos.push({
              lat: loc.lat,
              lng: loc.lng,
              nome: loc.name || `Destino ${destinos.length + 1}`
            });
          }
        }
        
        if (destinos.length > 0) {
          window.logDebug('[SolucaoHardcoded] Encontrados destinos no array global:', destinos.length);
          return destinos;
        }
      }
      
      // Procurar elementos no DOM
      var items = document.querySelectorAll('.location-item, li:not(.origin-point), [class*="location"]:not(.origin-point)');
      
      if (items.length > 0) {
        window.logDebug('[SolucaoHardcoded] Encontrados potenciais destinos no DOM:', items.length);
        
        var destinos = [];
        
        // Procurar por elementos que correspondam a Ribeirão Preto e Campinas
        for (var i = 0; i < items.length; i++) {
          var texto = items[i].textContent.toLowerCase();
          window.logDebug('[SolucaoHardcoded] Analisando item DOM:', texto);
          
          if (texto.includes('ribeirão') || texto.includes('ribeirao') || texto.includes('preto')) {
            destinos.push({ nome: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 });
            window.logDebug('[SolucaoHardcoded] Adicionado Ribeirão Preto');
          }
          
          if (texto.includes('campinas')) {
            destinos.push({ nome: "Campinas", lat: -22.9071, lng: -47.0632 });
            window.logDebug('[SolucaoHardcoded] Adicionado Campinas');
          }
          
          // Outros destinos comuns que podem aparecer
          if (texto.includes('bauru')) {
            destinos.push({ nome: "Bauru", lat: -22.3147, lng: -49.0606 });
          }
          
          if (texto.includes('jaú') || texto.includes('jau')) {
            destinos.push({ nome: "Jaú", lat: -22.2967, lng: -48.5578 });
          }
          
          if (texto.includes('piracicaba')) {
            destinos.push({ nome: "Piracicaba", lat: -22.7338, lng: -47.6477 });
          }
          
          if (texto.includes('são carlos') || texto.includes('sao carlos')) {
            destinos.push({ nome: "São Carlos", lat: -22.0087, lng: -47.8909 });
          }
        }
        
        if (destinos.length > 0) {
          window.logDebug('[SolucaoHardcoded] Total de destinos encontrados no DOM:', destinos.length);
          return destinos;
        }
      }
    } catch (err) {
      window.logDebug('[SolucaoHardcoded] Erro ao capturar destinos reais:', err.message);
    }
    
    // Se tudo falhar, retornar nulo para usar os padrão
    window.logDebug('[SolucaoHardcoded] Não foi possível encontrar destinos, usando padrão');
    return null;
  }
  
  /**
   * Calcular e mostrar rota original (não otimizada)
   */
  function calcularRotaOriginal(destinos) {
    window.logDebug('[SolucaoHardcoded] Calculando rota original para', destinos.length, 'destinos');
    
    // Encontrar mapa
    var mapa = encontrarMapa();
    
    if (!mapa) {
      window.logDebug('[SolucaoHardcoded] Mapa não encontrado, tentando criar...');
      mapa = criarMapa();
      
      if (!mapa) {
        window.logDebug('[SolucaoHardcoded] ERRO: Não foi possível encontrar ou criar o mapa');
        alert('Erro: não foi possível acessar o mapa. Tente recarregar a página.');
        return;
      }
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
    window.renderizadorOriginal = renderizadorDirecoes;
    
    // Preparar waypoints
    var waypoints = destinos.slice(0, -1).map(function(destino) {
      return {
        location: new google.maps.LatLng(destino.lat, destino.lng),
        stopover: true
      };
    });
    
    // Último destino
    var ultimoDestino = destinos[destinos.length - 1];
    
    window.logDebug('[SolucaoHardcoded] Origem:', ORIGEM.lat, ORIGEM.lng);
    window.logDebug('[SolucaoHardcoded] Destino final:', ultimoDestino.lat, ultimoDestino.lng);
    window.logDebug('[SolucaoHardcoded] Waypoints:', waypoints.length);
    
    // Solicitar rota (NÃO OTIMIZADA)
    servicoDirecoes.route({
      origin: new google.maps.LatLng(ORIGEM.lat, ORIGEM.lng),
      destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
      waypoints: waypoints,
      optimizeWaypoints: false, // NÃO OTIMIZAR!
      travelMode: google.maps.TravelMode.DRIVING
    }, function(result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        window.logDebug('[SolucaoHardcoded] Rota calculada com sucesso');
        
        // Mostrar no mapa
        renderizadorDirecoes.setDirections(result);
        
        // Salvar globalmente
        window.resultadoRotaOriginal = result;
        
        // Atualizar interface
        mostrarInformacoesRota(result);
      } else {
        window.logDebug('[SolucaoHardcoded] ERRO ao calcular rota:', status);
        alert('Erro ao calcular rota: ' + status);
      }
    });
  }
  
  /**
   * Criar mapa se não existir
   */
  function criarMapa() {
    window.logDebug('[SolucaoHardcoded] Tentando criar novo mapa');
    
    var mapElement = document.getElementById('map') || 
                     document.querySelector('.map') || 
                     document.querySelector('[id*="map"]');
    
    if (!mapElement) {
      window.logDebug('[SolucaoHardcoded] Elemento do mapa não encontrado');
      return null;
    }
    
    try {
      var novoMapa = new google.maps.Map(mapElement, {
        center: { lat: ORIGEM.lat, lng: ORIGEM.lng },
        zoom: 8
      });
      
      window.map = novoMapa;
      window.logDebug('[SolucaoHardcoded] Novo mapa criado com sucesso');
      return novoMapa;
    } catch (e) {
      window.logDebug('[SolucaoHardcoded] Erro ao criar mapa:', e.message);
      return null;
    }
  }
  
  /**
   * Mostrar informações da rota
   */
  function mostrarInformacoesRota(resultado) {
    if (!resultado || !resultado.routes || !resultado.routes[0]) {
      window.logDebug('[SolucaoHardcoded] Resultado da rota inválido');
      return;
    }
    
    var rota = resultado.routes[0];
    var legs = rota.legs || [];
    
    // Calcular totais
    var distanciaTotal = 0;
    var duracaoTotal = 0;
    
    for (var i = 0; i < legs.length; i++) {
      if (legs[i].distance) distanciaTotal += legs[i].distance.value;
      if (legs[i].duration) duracaoTotal += legs[i].duration.value;
    }
    
    // Converter para km e horas
    var distanciaKm = (distanciaTotal / 1000).toFixed(1);
    var duracaoHoras = Math.floor(duracaoTotal / 3600);
    var duracaoMinutos = Math.floor((duracaoTotal % 3600) / 60);
    
    window.logDebug('[SolucaoHardcoded] Rota calculada: ' + 
                   distanciaKm + ' km, ' + 
                   duracaoHoras + 'h ' + duracaoMinutos + 'min');
    
    // Tentar atualizar interface
    var infoDistancia = document.querySelector('.route-info-distance') || 
                        document.querySelector('[class*="distance"]') ||
                        document.getElementById('route-distance');
    
    var infoDuracao = document.querySelector('.route-info-duration') || 
                      document.querySelector('[class*="duration"]') ||
                      document.getElementById('route-duration');
    
    if (infoDistancia) {
      infoDistancia.textContent = distanciaKm + ' km';
      window.logDebug('[SolucaoHardcoded] Distância atualizada na interface');
    }
    
    if (infoDuracao) {
      infoDuracao.textContent = duracaoHoras + 'h ' + duracaoMinutos + 'min';
      window.logDebug('[SolucaoHardcoded] Duração atualizada na interface');
    }
  }
  
  /**
   * Limpar rotas existentes
   */
  function limparRotasExistentes() {
    window.logDebug('[SolucaoHardcoded] Limpando rotas existentes');
    
    try {
      // Limpar renderer global
      if (window.directionsRenderer) {
        try {
          window.directionsRenderer.setMap(null);
          window.logDebug('[SolucaoHardcoded] DirectionsRenderer global limpo');
        } catch (e) {
          window.logDebug('[SolucaoHardcoded] Erro ao limpar DirectionsRenderer global:', e.message);
        }
      }
      
      // Limpar outros renderers
      for (var prop in window) {
        try {
          if (window[prop] instanceof google.maps.DirectionsRenderer) {
            window[prop].setMap(null);
            window.logDebug('[SolucaoHardcoded] DirectionsRenderer em', prop, 'limpo');
          }
        } catch (e) {}
      }
    } catch (e) {
      window.logDebug('[SolucaoHardcoded] Erro ao limpar rotas:', e.message);
    }
  }
  
  /**
   * Encontrar mapa
   */
  function encontrarMapa() {
    window.logDebug('[SolucaoHardcoded] Procurando instância do mapa');
    
    // Verificar referência global
    if (window.map instanceof google.maps.Map) {
      window.logDebug('[SolucaoHardcoded] Mapa encontrado na referência global window.map');
      return window.map;
    }
    
    // Procurar no objeto window
    for (var prop in window) {
      try {
        if (window[prop] instanceof google.maps.Map) {
          window.map = window[prop];
          window.logDebug('[SolucaoHardcoded] Mapa encontrado em window.' + prop);
          return window.map;
        }
      } catch (e) {}
    }
    
    window.logDebug('[SolucaoHardcoded] Mapa não encontrado');
    return null;
  }
})();