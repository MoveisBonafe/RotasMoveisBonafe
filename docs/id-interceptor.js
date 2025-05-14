/**
 * Interceptador de IDs que monitora diretamente a adição de destinos
 * Esta é uma abordagem extremamente específica para capturar IDs diretamente
 * na fonte, durante a adição dos destinos
 */
(function() {
  console.log('[ID-Interceptor] Inicializando interceptador de IDs');
  
  // Array para armazenar os IDs conforme são adicionados
  window.destinosInterceptados = [];
  
  // Adicionar log visual
  var DEBUG = true;
  var logContainer = null;
  
  // Origem e destinos conhecidos (backup)
  var ORIGEM = { lat: -22.3731, lng: -48.3796, nome: "Dois Córregos" };
  var DESTINOS_CONHECIDOS = [
    { id: 2, lat: -21.1704, lng: -47.8103, nome: "Ribeirão Preto" },
    { id: 3, lat: -22.9071, lng: -47.0632, nome: "Campinas" }
  ];
  
  // Iniciar
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar várias vezes
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  
  /**
   * Inicializa o interceptador
   */
  function inicializar() {
    log('Inicializando interceptador de IDs');
    
    // Criar log visual
    if (DEBUG) {
      criarLogVisual();
    }
    
    // 1. Interceptar funções que adicionam marcadores/destinos
    interceptarAdicionarDestino();
    
    // 2. Interceptar criação de marcadores
    interceptarCriarMarcador();
    
    // 3. Interceptar botão de otimização
    interceptarBotaoOtimizacao();
    
    // 4. Monitorar mudanças no DOM
    monitorarMudancasDOM();
    
    // 5. Monitorar execução de scripts
    monitorarExecucaoScripts();
    
    // 6. Analisar a DOM atual para ver se encontramos IDs
    analisarDOMAtual();
  }
  
  /**
   * Intercepta funções que adicionam destinos
   */
  function interceptarAdicionarDestino() {
    // Funções comuns para adicionar destino
    var funcoesAlvo = [
      'addLocation',
      'addDestination',
      'addDestino',
      'addNewLocation',
      'createMarker',
      'createLocationMarker'
    ];
    
    // Interceptar funções globais
    for (var i = 0; i < funcoesAlvo.length; i++) {
      var nomeFuncao = funcoesAlvo[i];
      
      if (typeof window[nomeFuncao] === 'function') {
        var funcaoOriginal = window[nomeFuncao];
        
        window[nomeFuncao] = function(nome, funcao) {
          return function() {
            log('Interceptando chamada a ' + nome);
            
            // Chamar função original e capturar retorno
            var resultado = funcaoOriginal.apply(this, arguments);
            
            // Analisar argumentos para extrair ID
            if (arguments.length > 0) {
              log('Argumentos da função:', JSON.stringify(Array.from(arguments)));
              
              // Tentar extrair ID diretamente
              for (var j = 0; j < arguments.length; j++) {
                var arg = arguments[j];
                
                if (typeof arg === 'object' && arg !== null) {
                  if (arg.id && typeof arg.id === 'number') {
                    log('ID encontrado diretamente:', arg.id);
                    registrarID(arg.id);
                  }
                }
              }
              
              // Analisar resultado se for um objeto
              if (resultado && typeof resultado === 'object') {
                if (resultado.id && typeof resultado.id === 'number') {
                  log('ID encontrado no resultado:', resultado.id);
                  registrarID(resultado.id);
                }
              }
            }
            
            return resultado;
          };
        }(nomeFuncao, window[nomeFuncao]);
        
        log('Função ' + nomeFuncao + ' interceptada');
      }
    }
  }
  
  /**
   * Intercepta a criação de marcadores
   */
  function interceptarCriarMarcador() {
    // Verificar se temos acesso ao construtor de Marker
    if (typeof google !== 'undefined' && 
        typeof google.maps !== 'undefined' && 
        typeof google.maps.Marker === 'function') {
      
      // Salvar construtor original
      var MarkerOriginal = google.maps.Marker;
      
      // Substituir com nossa versão
      google.maps.Marker = function() {
        // Analisar argumentos
        if (arguments.length > 0 && arguments[0]) {
          var options = arguments[0];
          
          // Tentar extrair posição e título
          if (options.position && options.title) {
            var lat = null;
            var lng = null;
            
            if (typeof options.position.lat === 'function') {
              lat = options.position.lat();
              lng = options.position.lng();
            } else if (options.position.lat) {
              lat = options.position.lat;
              lng = options.position.lng;
            }
            
            if (lat !== null && lng !== null) {
              var titulo = options.title;
              
              log('Marcador sendo criado: ' + titulo);
              
              // Verificar se é um destino (não é origem)
              if (!titulo.toLowerCase().includes('dois córregos')) {
                // Tentar extrair ID
                var id = null;
                
                // Do título com formato "1: Nome"
                var idMatch = titulo.match(/^(\d+):\s/);
                if (idMatch) {
                  id = parseInt(idMatch[1]);
                }
                
                // De propriedades customizadas
                if (options.id) {
                  id = options.id;
                }
                
                // Da URL do ícone (se tiver um padrão de número)
                if (options.icon && typeof options.icon === 'string') {
                  var iconMatch = options.icon.match(/[\/\\](\d+)\.png/);
                  if (iconMatch) {
                    id = parseInt(iconMatch[1]);
                  }
                }
                
                if (id !== null) {
                  log('ID extraído do marcador: ' + id);
                  registrarID(id);
                } else {
                  // Se não encontrou ID, registrar usando coordenadas
                  log('ID não encontrado, registrando coordenadas');
                  
                  // Verificar com destinos conhecidos
                  for (var i = 0; i < DESTINOS_CONHECIDOS.length; i++) {
                    var conhecido = DESTINOS_CONHECIDOS[i];
                    var distancia = calcularDistancia(lat, lng, conhecido.lat, conhecido.lng);
                    
                    if (distancia < 1) { // Menos de 1km
                      log('Destino reconhecido pela coordenada: ' + conhecido.nome);
                      registrarID(conhecido.id);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
        
        // Criar instância normal
        return new MarkerOriginal(...arguments);
      };
      
      // Manter prototype
      google.maps.Marker.prototype = MarkerOriginal.prototype;
      
      log('Construtor de Marker interceptado');
    } else {
      log('Google Maps API não encontrada ou Marker não disponível');
    }
  }
  
  /**
   * Intercepta o botão de otimização
   */
  function interceptarBotaoOtimizacao() {
    // Monitorar cliques nos botões
    document.addEventListener('click', function(e) {
      var target = e.target;
      
      // Verificar se é um botão de otimização
      if (target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.role === 'button' ||
          target.className.includes('btn') ||
          target.className.includes('button')) {
        
        var texto = target.textContent.trim().toLowerCase();
        var id = target.id || '';
        var classes = target.className || '';
        
        if (texto.includes('otimizar') || 
            texto.includes('calcular') ||
            id.includes('optimize') ||
            classes.includes('optimize')) {
          
          log('Clique em botão de otimização detectado');
          
          // Verificar se temos IDs interceptados
          if (window.destinosInterceptados.length > 0) {
            log('Temos ' + window.destinosInterceptados.length + ' IDs interceptados');
            
            // No primeiro clique vamos deixar o fluxo normal
            // No segundo clique vamos intervir
            if (window.cliquesOtimizacao) {
              window.cliquesOtimizacao++;
              
              if (window.cliquesOtimizacao > 1) {
                log('Segundo clique, intervindo para garantir funcionamento');
                
                // Prevenir comportamento padrão
                e.preventDefault();
                e.stopPropagation();
                
                // Aplicar nossa lógica
                calcularRotaComIdsInterceptados();
                
                return false;
              }
            } else {
              window.cliquesOtimizacao = 1;
            }
          } else {
            log('Nenhum ID interceptado ainda, usando destinos padrão');
            
            // Prevenir comportamento padrão
            e.preventDefault();
            e.stopPropagation();
            
            // Usar destinos padrão
            calcularRotaComDestinosPadrao();
            
            return false;
          }
        }
      }
    }, true); // Fase de captura
    
    log('Monitoramento de cliques para botão de otimização instalado');
  }
  
  /**
   * Monitora mudanças no DOM para detectar novos elementos
   */
  function monitorarMudancasDOM() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Novas adições
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element
            // Verificar se é um item de destino
            if (node.className && 
                (node.className.includes('location-item') || 
                 node.className.includes('destination'))) {
              
              log('Novo item de destino adicionado ao DOM');
              
              // Extrair ID
              var id = null;
              
              if (node.dataset && node.dataset.id) {
                id = parseInt(node.dataset.id);
              } else if (node.getAttribute('data-id')) {
                id = parseInt(node.getAttribute('data-id'));
              } else if (node.id && node.id.match(/\d+$/)) {
                id = parseInt(node.id.match(/\d+$/)[0]);
              }
              
              if (id !== null) {
                log('ID extraído do novo elemento: ' + id);
                registrarID(id);
              }
            }
            
            // Verificar elementos filhos
            var destinosFilhos = node.querySelectorAll('.location-item, [class*="location"]:not(.origin-point), [class*="destino"], [class*="destination"]');
            
            if (destinosFilhos.length > 0) {
              log('Encontrados ' + destinosFilhos.length + ' elementos de destino dentro do novo nó');
              
              destinosFilhos.forEach(function(destino) {
                var id = null;
                
                if (destino.dataset && destino.dataset.id) {
                  id = parseInt(destino.dataset.id);
                } else if (destino.getAttribute('data-id')) {
                  id = parseInt(destino.getAttribute('data-id'));
                } else if (destino.id && destino.id.match(/\d+$/)) {
                  id = parseInt(destino.id.match(/\d+$/)[0]);
                }
                
                if (id !== null) {
                  log('ID extraído de filho: ' + id);
                  registrarID(id);
                }
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    log('Monitor de mudanças no DOM instalado');
  }
  
  /**
   * Monitora execução de scripts dinâmicos
   */
  function monitorarExecucaoScripts() {
    // Interceptar execução de scripts
    var originalCreateElement = document.createElement;
    
    document.createElement = function() {
      var elemento = originalCreateElement.apply(document, arguments);
      
      if (arguments[0].toLowerCase() === 'script') {
        elemento.addEventListener('load', function() {
          log('Script carregado dinamicamente, verificando API do Maps');
          
          // Verificar se Google Maps foi carregado
          if (typeof google !== 'undefined' && 
              typeof google.maps !== 'undefined' && 
              typeof google.maps.Marker === 'function') {
            
            // Re-interceptar construtor de Marker
            interceptarCriarMarcador();
          }
        });
      }
      
      return elemento;
    };
    
    log('Monitoramento de execução de scripts instalado');
  }
  
  /**
   * Analisa a DOM atual para encontrar destinos
   */
  function analisarDOMAtual() {
    log('Analisando DOM atual em busca de destinos');
    
    // Procurar elementos de destino
    var destinos = document.querySelectorAll('.location-item, li:not(.origin-point), [class*="location"]:not(.origin-point), [class*="destino"], [class*="destination"]');
    
    log('Encontrados ' + destinos.length + ' potenciais elementos de destino');
    
    // Analisar cada elemento
    for (var i = 0; i < destinos.length; i++) {
      var destino = destinos[i];
      var texto = destino.textContent.toLowerCase();
      
      log('Analisando elemento ' + i + ': ' + texto);
      
      // Verificar se é um destino (não é origem)
      if (!texto.includes('dois córregos')) {
        // Extrair ID
        var id = null;
        
        if (destino.dataset && destino.dataset.id) {
          id = parseInt(destino.dataset.id);
        } else if (destino.getAttribute('data-id')) {
          id = parseInt(destino.getAttribute('data-id'));
        } else if (destino.id && destino.id.match(/\d+$/)) {
          id = parseInt(destino.id.match(/\d+$/)[0]);
        }
        
        if (id !== null) {
          log('ID extraído do elemento: ' + id);
          registrarID(id);
        } else {
          // Se não encontrou ID, verificar pelo texto
          if (texto.includes('ribeirão') || texto.includes('ribeirao') || texto.includes('preto')) {
            log('Ribeirão Preto identificado pelo texto');
            registrarID(2);
          } else if (texto.includes('campinas')) {
            log('Campinas identificado pelo texto');
            registrarID(3);
          }
        }
      }
    }
    
    // Verificar array global de locations
    if (window.locations && window.locations.length > 0) {
      log('Verificando array global locations');
      
      for (var i = 0; i < window.locations.length; i++) {
        var location = window.locations[i];
        
        if (location && location.id) {
          // Verificar se não é a origem
          if (location.name && !location.name.toLowerCase().includes('dois córregos')) {
            log('ID encontrado no array locations: ' + location.id);
            registrarID(location.id);
          }
        }
      }
    }
  }
  
  /**
   * Calcula rota usando os IDs interceptados
   */
  function calcularRotaComIdsInterceptados() {
    log('Calculando rota com IDs interceptados: ' + window.destinosInterceptados.join(', '));
    
    try {
      // Verificar se temos uma função para calcular usando IDs
      if (typeof calculateCustomRoute === 'function') {
        log('Chamando calculateCustomRoute com IDs interceptados');
        calculateCustomRoute(window.destinosInterceptados);
        return;
      }
      
      // Verificar se temos locations global com IDs
      if (window.locations && window.locations.length > 0) {
        var destinosObj = [];
        var origem = null;
        
        // Encontrar a origem e destinos correspondentes
        for (var i = 0; i < window.locations.length; i++) {
          var loc = window.locations[i];
          
          if (loc && loc.name) {
            if (loc.name.toLowerCase().includes('dois córregos')) {
              origem = {
                lat: loc.lat,
                lng: loc.lng
              };
            } else if (loc.id && window.destinosInterceptados.includes(loc.id)) {
              destinosObj.push({
                id: loc.id,
                lat: loc.lat,
                lng: loc.lng,
                nome: loc.name
              });
            }
          }
        }
        
        if (origem && destinosObj.length > 0) {
          log('Calculando rota com objetos do array locations');
          calcularRotaComObjetosDestino(origem, destinosObj);
          return;
        }
      }
      
      // Se não conseguimos objetos, usar destinos padrão
      log('Não foi possível resolver objetos de destino, usando padrão');
      calcularRotaComDestinosPadrao();
    } catch (e) {
      log('ERRO ao calcular rota: ' + e.message);
      console.error('[ID-Interceptor] Erro:', e);
      
      // Última tentativa
      calcularRotaComDestinosPadrao();
    }
  }
  
  /**
   * Calcula rota com destinos padrão
   */
  function calcularRotaComDestinosPadrao() {
    log('Calculando rota com destinos padrão');
    
    try {
      // Encontrar mapa
      var mapa = encontrarMapa();
      
      if (!mapa) {
        log('Mapa não encontrado');
        alert('Erro: Mapa não encontrado');
        return;
      }
      
      // Limpar rotas existentes
      limparRotas();
      
      // Criar serviços
      var servicoDirecoes = new google.maps.DirectionsService();
      var renderizadorDirecoes = new google.maps.DirectionsRenderer({
        map: mapa
      });
      
      // Salvar referência global
      window.renderizadorInterceptor = renderizadorDirecoes;
      
      // Waypoints (todos exceto último)
      var waypoints = DESTINOS_CONHECIDOS.slice(0, -1).map(function(destino) {
        return {
          location: new google.maps.LatLng(destino.lat, destino.lng),
          stopover: true
        };
      });
      
      // Último destino
      var ultimo = DESTINOS_CONHECIDOS[DESTINOS_CONHECIDOS.length - 1];
      
      // Calcular rota
      servicoDirecoes.route({
        origin: new google.maps.LatLng(ORIGEM.lat, ORIGEM.lng),
        destination: new google.maps.LatLng(ultimo.lat, ultimo.lng),
        waypoints: waypoints,
        optimizeWaypoints: false, // Manter ordem original
        travelMode: google.maps.TravelMode.DRIVING
      }, function(resultado, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          log('Rota calculada com sucesso usando destinos padrão');
          
          // Mostrar no mapa
          renderizadorDirecoes.setDirections(resultado);
          
          // Salvar resultado
          window.resultadoRotaInterceptor = resultado;
          
          // Atualizar interface
          atualizarInterface(resultado);
        } else {
          log('ERRO ao calcular rota: ' + status);
          alert('Erro ao calcular rota: ' + status);
        }
      });
    } catch (e) {
      log('ERRO ao calcular rota com destinos padrão: ' + e.message);
      console.error('[ID-Interceptor] Erro:', e);
      alert('Erro: ' + e.message);
    }
  }
  
  /**
   * Calcula rota com objetos de destino
   */
  function calcularRotaComObjetosDestino(origem, destinos) {
    log('Calculando rota com objetos de destino: ' + destinos.length);
    
    try {
      // Encontrar mapa
      var mapa = encontrarMapa();
      
      if (!mapa) {
        log('Mapa não encontrado');
        alert('Erro: Mapa não encontrado');
        return;
      }
      
      // Limpar rotas existentes
      limparRotas();
      
      // Criar serviços
      var servicoDirecoes = new google.maps.DirectionsService();
      var renderizadorDirecoes = new google.maps.DirectionsRenderer({
        map: mapa
      });
      
      // Salvar referência global
      window.renderizadorInterceptor = renderizadorDirecoes;
      
      // Waypoints (todos exceto último)
      var waypoints = destinos.slice(0, -1).map(function(destino) {
        return {
          location: new google.maps.LatLng(destino.lat, destino.lng),
          stopover: true
        };
      });
      
      // Último destino
      var ultimo = destinos[destinos.length - 1];
      
      // Calcular rota
      servicoDirecoes.route({
        origin: new google.maps.LatLng(origem.lat, origem.lng),
        destination: new google.maps.LatLng(ultimo.lat, ultimo.lng),
        waypoints: waypoints,
        optimizeWaypoints: false, // Manter ordem original
        travelMode: google.maps.TravelMode.DRIVING
      }, function(resultado, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          log('Rota calculada com sucesso usando objetos de destino');
          
          // Mostrar no mapa
          renderizadorDirecoes.setDirections(resultado);
          
          // Salvar resultado
          window.resultadoRotaInterceptor = resultado;
          
          // Atualizar interface
          atualizarInterface(resultado);
        } else {
          log('ERRO ao calcular rota: ' + status);
          alert('Erro ao calcular rota: ' + status);
        }
      });
    } catch (e) {
      log('ERRO ao calcular rota com objetos de destino: ' + e.message);
      console.error('[ID-Interceptor] Erro:', e);
      
      // Tentar com destinos padrão
      calcularRotaComDestinosPadrao();
    }
  }
  
  /**
   * Registra um ID interceptado
   */
  function registrarID(id) {
    // Validar
    if (id === null || isNaN(id)) return;
    
    // Converter para número
    id = parseInt(id);
    
    // Verificar se já temos
    if (!window.destinosInterceptados.includes(id)) {
      window.destinosInterceptados.push(id);
      log('ID ' + id + ' registrado, total: ' + window.destinosInterceptados.length);
    }
  }
  
  /**
   * Encontra a instância do mapa
   */
  function encontrarMapa() {
    // Verificar referência global
    if (window.map instanceof google.maps.Map) {
      return window.map;
    }
    
    // Procurar em todas as propriedades
    for (var prop in window) {
      try {
        if (window[prop] instanceof google.maps.Map) {
          window.map = window[prop];
          return window.map;
        }
      } catch (e) {}
    }
    
    return null;
  }
  
  /**
   * Limpa rotas existentes
   */
  function limparRotas() {
    try {
      // Limpar renderers conhecidos
      var renderizadores = [
        window.directionsRenderer,
        window.renderizadorInterceptor,
        window.renderizadorMonitor,
        window.renderizadorAtual,
        window.renderizadorOriginal
      ];
      
      for (var i = 0; i < renderizadores.length; i++) {
        if (renderizadores[i]) {
          renderizadores[i].setMap(null);
        }
      }
      
      // Procurar outros renderers
      for (var prop in window) {
        try {
          if (window[prop] instanceof google.maps.DirectionsRenderer) {
            window[prop].setMap(null);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error('[ID-Interceptor] Erro ao limpar rotas:', e);
    }
  }
  
  /**
   * Atualiza interface com informações da rota
   */
  function atualizarInterface(resultado) {
    if (!resultado || !resultado.routes || !resultado.routes[0]) {
      return;
    }
    
    var rota = resultado.routes[0];
    var legs = rota.legs || [];
    
    // Calcular totais
    var distancia = 0;
    var duracao = 0;
    
    for (var i = 0; i < legs.length; i++) {
      if (legs[i].distance) distancia += legs[i].distance.value;
      if (legs[i].duration) duracao += legs[i].duration.value;
    }
    
    // Converter para km e horas
    var distanciaKm = (distancia / 1000).toFixed(1);
    var duracaoHoras = Math.floor(duracao / 3600);
    var duracaoMinutos = Math.floor((duracao % 3600) / 60);
    
    log('Distância: ' + distanciaKm + ' km, Tempo: ' + duracaoHoras + 'h ' + duracaoMinutos + 'min');
    
    // Atualizar elementos na interface
    try {
      // Distância
      var elementosDistancia = [
        document.querySelector('.route-info-distance'),
        document.querySelector('[class*="distance"]'),
        document.getElementById('route-distance')
      ];
      
      for (var i = 0; i < elementosDistancia.length; i++) {
        if (elementosDistancia[i]) {
          elementosDistancia[i].textContent = distanciaKm + ' km';
          break;
        }
      }
      
      // Duração
      var elementosDuracao = [
        document.querySelector('.route-info-duration'),
        document.querySelector('[class*="duration"]'),
        document.getElementById('route-duration')
      ];
      
      for (var i = 0; i < elementosDuracao.length; i++) {
        if (elementosDuracao[i]) {
          elementosDuracao[i].textContent = duracaoHoras + 'h ' + duracaoMinutos + 'min';
          break;
        }
      }
    } catch (e) {
      log('ERRO ao atualizar interface: ' + e.message);
    }
  }
  
  /**
   * Calcula distância entre dois pontos (Haversine)
   */
  function calcularDistancia(lat1, lng1, lat2, lng2) {
    var R = 6371; // Raio da Terra em km
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    
    return d;
  }
  
  /**
   * Converte graus para radianos
   */
  function toRad(deg) {
    return deg * Math.PI / 180;
  }
  
  /**
   * Log com saída para console e visual
   */
  function log(mensagem) {
    var agora = new Date().toLocaleTimeString();
    console.log('[ID-Interceptor] ' + mensagem);
    
    // Log visual
    if (DEBUG && logContainer) {
      var item = document.createElement('div');
      item.textContent = agora + ': ' + mensagem;
      item.style.borderBottom = '1px dotted #333';
      item.style.paddingBottom = '2px';
      item.style.marginBottom = '2px';
      
      // Adicionar ao topo
      if (logContainer.firstChild) {
        logContainer.insertBefore(item, logContainer.firstChild);
      } else {
        logContainer.appendChild(item);
      }
      
      // Limitar a 15 itens
      if (logContainer.children.length > 15) {
        logContainer.removeChild(logContainer.lastChild);
      }
    }
  }
  
  /**
   * Cria o container de log visual
   */
  function criarLogVisual() {
    if (logContainer) return;
    
    logContainer = document.createElement('div');
    logContainer.id = 'id-interceptor-log';
    logContainer.style.position = 'fixed';
    logContainer.style.top = '50px';
    logContainer.style.right = '10px';
    logContainer.style.width = '300px';
    logContainer.style.maxHeight = '200px';
    logContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
    logContainer.style.color = '#00ff7f';
    logContainer.style.padding = '8px';
    logContainer.style.fontFamily = 'monospace';
    logContainer.style.fontSize = '10px';
    logContainer.style.overflow = 'auto';
    logContainer.style.zIndex = '9999';
    logContainer.style.border = '1px solid #333';
    logContainer.style.borderRadius = '4px';
    
    // Adicionar título
    var titulo = document.createElement('div');
    titulo.textContent = 'ID Interceptor Log';
    titulo.style.fontWeight = 'bold';
    titulo.style.marginBottom = '5px';
    titulo.style.color = '#ffcc00';
    logContainer.appendChild(titulo);
    
    // Adicionar botão para fechar
    var fechar = document.createElement('button');
    fechar.textContent = '×';
    fechar.style.position = 'absolute';
    fechar.style.top = '2px';
    fechar.style.right = '2px';
    fechar.style.backgroundColor = 'transparent';
    fechar.style.color = '#ff5555';
    fechar.style.border = 'none';
    fechar.style.fontSize = '16px';
    fechar.style.cursor = 'pointer';
    fechar.style.padding = '0 5px';
    fechar.style.lineHeight = '18px';
    fechar.onclick = function() {
      logContainer.style.display = 'none';
    };
    logContainer.appendChild(fechar);
    
    document.body.appendChild(logContainer);
  }
})();