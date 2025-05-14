/**
 * Monitor geral para todos os botões e interações de rota
 * Este script monitora todos os botões e eventos de clique na página
 */
(function() {
  console.log('[BotaoMonitor] Iniciando monitor geral de botões e cliques');
  
  // Destinos fixos para uso se necessário
  var DESTINOS_FIXOS = [
    { id: 1, nome: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    { id: 2, nome: "Campinas", lat: -22.9071, lng: -47.0632 }
  ];
  
  // Origem
  var ORIGEM = { id: 0, nome: "Dois Córregos", lat: -22.3731, lng: -48.3796 };
  
  // Começar monitoramento
  document.addEventListener('DOMContentLoaded', iniciar);
  window.addEventListener('load', iniciar);
  
  // Variáveis para controle
  var monitorIniciado = false;
  var clickCounter = {};
  
  /**
   * Inicializa o monitoramento
   */
  function iniciar() {
    if (monitorIniciado) return;
    
    console.log('[BotaoMonitor] Iniciando monitoramento de todos os botões e cliques');
    
    // 1. Adicionar estilos para feedback visual
    adicionarEstilos();
    
    // 2. Criar painel de status
    criarPainelStatus();
    
    // 3. Monitorar cliques em toda a página
    document.body.addEventListener('click', monitorarCliques, true);
    
    // 4. Monitorar mudanças no DOM
    monitorarMudancasDOM();
    
    // 5. Procurar e listar todos os botões existentes agora
    listarBotoesExistentes();
    
    // 6. Injetar botão de rota fixo como garantia
    injetarBotaoRota();
    
    monitorIniciado = true;
    console.log('[BotaoMonitor] Monitoramento iniciado');
  }
  
  /**
   * Adiciona estilos para feedback visual
   */
  function adicionarEstilos() {
    var estilo = document.createElement('style');
    estilo.textContent = `
      .botao-destacado {
        box-shadow: 0 0 5px 2px #ff5722 !important;
      }
      #botao-monitor-painel {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background-color: rgba(0,0,0,0.8);
        color: #00ff00;
        font-family: monospace;
        font-size: 11px;
        padding: 10px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        max-height: 200px;
        overflow: auto;
      }
      #botao-monitor-painel h4 {
        margin: 0 0 5px 0;
        color: #ff5722;
      }
      #botao-monitor-painel button.fechar {
        position: absolute;
        top: 2px;
        right: 2px;
        background: #f44336;
        color: white;
        border: none;
        width: 16px;
        height: 16px;
        line-height: 14px;
        font-size: 10px;
        text-align: center;
        cursor: pointer;
        border-radius: 50%;
      }
      #botao-monitor-fixo {
        position: fixed;
        bottom: 60px;
        right: 10px;
        background-color: #ffc107;
        color: #000;
        font-weight: bold;
        padding: 8px 15px;
        border-radius: 4px;
        z-index: 9999;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(estilo);
  }
  
  /**
   * Cria o painel de status
   */
  function criarPainelStatus() {
    var painel = document.createElement('div');
    painel.id = 'botao-monitor-painel';
    
    var titulo = document.createElement('h4');
    titulo.textContent = 'Monitor de Botões';
    painel.appendChild(titulo);
    
    var conteudo = document.createElement('div');
    conteudo.id = 'botao-monitor-conteudo';
    painel.appendChild(conteudo);
    
    var fechar = document.createElement('button');
    fechar.className = 'fechar';
    fechar.textContent = 'x';
    fechar.onclick = function() {
      painel.style.display = 'none';
    };
    painel.appendChild(fechar);
    
    document.body.appendChild(painel);
  }
  
  /**
   * Monitora todos os cliques na página
   */
  function monitorarCliques(e) {
    var elemento = e.target;
    
    // Verificar se é um botão ou elemento clicável
    if (elemento.tagName === 'BUTTON' || 
        elemento.tagName === 'A' || 
        elemento.role === 'button' ||
        elemento.className.includes('btn') ||
        elemento.className.includes('button')) {
      
      var id = elemento.id || 'sem-id';
      var texto = elemento.textContent.trim();
      var classes = elemento.className;
      
      // Registrar o clique
      clickCounter[id] = (clickCounter[id] || 0) + 1;
      
      // Destacar o elemento
      elemento.classList.add('botao-destacado');
      
      // Remover o destaque após 1s
      setTimeout(function() {
        elemento.classList.remove('botao-destacado');
      }, 1000);
      
      // Logar no console
      console.log('[BotaoMonitor] Clique detectado:', id, texto, classes);
      
      // Verificar se é o botão de otimização
      if (texto.toLowerCase().includes('otimizar') || 
          texto.toLowerCase().includes('calcular') ||
          id.includes('optimize') ||
          classes.includes('optimize')) {
        
        console.log('[BotaoMonitor] BOTÃO DE OTIMIZAÇÃO CLICADO!');
        
        // Atualizar painel
        atualizarPainel(`Botão de otimização clicado: ${texto}`);
        
        // Verificar se é na versão GitHub Pages
        if (window.location.hostname.includes('github.io')) {
          // Se for o primeiro clique, não intervir para ver se funciona nativamente
          var count = clickCounter[id] || 1;
          
          if (count > 1) {
            console.log('[BotaoMonitor] Segunda tentativa, intervindo...');
            
            // Intervindo no segundo clique
            e.preventDefault();
            e.stopPropagation();
            
            // Chamar nossa implementação
            calcularRotaComDestinosFixos();
            
            return false;
          }
        }
      }
    }
  }
  
  /**
   * Atualiza o painel de status
   */
  function atualizarPainel(mensagem) {
    var conteudo = document.getElementById('botao-monitor-conteudo');
    if (!conteudo) return;
    
    var item = document.createElement('div');
    item.textContent = new Date().toLocaleTimeString() + ': ' + mensagem;
    item.style.borderBottom = '1px dotted #333';
    item.style.paddingBottom = '3px';
    item.style.marginBottom = '3px';
    
    // Adicionar ao topo
    if (conteudo.firstChild) {
      conteudo.insertBefore(item, conteudo.firstChild);
    } else {
      conteudo.appendChild(item);
    }
    
    // Limitar a 10 itens
    if (conteudo.children.length > 10) {
      conteudo.removeChild(conteudo.lastChild);
    }
  }
  
  /**
   * Monitora mudanças no DOM para detectar novos botões
   */
  function monitorarMudancasDOM() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // ELEMENT_NODE
            // Verificar se o nó adicionado é um botão
            if (node.tagName === 'BUTTON' || 
                node.tagName === 'A' ||
                node.role === 'button' ||
                node.className.includes('btn') ||
                node.className.includes('button')) {
              
              var id = node.id || 'sem-id';
              var texto = node.textContent.trim();
              
              console.log('[BotaoMonitor] Novo botão detectado:', id, texto);
              atualizarPainel(`Novo botão: ${texto}`);
            }
            
            // Verificar botões dentro do nó
            var botoes = node.querySelectorAll('button, a[role="button"], .btn, .button');
            
            if (botoes.length > 0) {
              console.log('[BotaoMonitor] Novos botões detectados dentro de elemento:', botoes.length);
              atualizarPainel(`${botoes.length} novos botões dentro de elemento`);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Lista todos os botões existentes na página agora
   */
  function listarBotoesExistentes() {
    var botoes = document.querySelectorAll('button, a[role="button"], [class*="btn"], [class*="button"]');
    
    console.log('[BotaoMonitor] Total de botões existentes:', botoes.length);
    atualizarPainel(`Total de botões: ${botoes.length}`);
    
    // Listar cada botão
    for (var i = 0; i < botoes.length; i++) {
      var botao = botoes[i];
      var id = botao.id || 'sem-id';
      var texto = botao.textContent.trim();
      var classes = botao.className;
      
      console.log('[BotaoMonitor] Botão', i, ':', id, texto, classes);
      
      // Verificar se pode ser o botão de otimização
      if (texto.toLowerCase().includes('otimizar') || 
          texto.toLowerCase().includes('calcular') ||
          id.includes('optimize') ||
          classes.includes('optimize')) {
        
        console.log('[BotaoMonitor] POSSÍVEL BOTÃO DE OTIMIZAÇÃO:', id, texto);
        atualizarPainel(`Possível botão de otimização: ${texto}`);
        
        // Destacar visualmente
        botao.classList.add('botao-destacado');
        
        // Remover o destaque após 2s
        setTimeout(function(b) {
          return function() {
            b.classList.remove('botao-destacado');
          };
        }(botao), 2000);
      }
    }
  }
  
  /**
   * Injeta um botão de rota fixo como garantia
   */
  function injetarBotaoRota() {
    var botaoFixo = document.createElement('button');
    botaoFixo.id = 'botao-monitor-fixo';
    botaoFixo.textContent = 'Calcular Rota';
    
    botaoFixo.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('[BotaoMonitor] Botão fixo clicado');
      atualizarPainel('Botão fixo clicado, calculando rota...');
      
      // Calcular rota com nossos destinos
      calcularRotaComDestinosFixos();
    });
    
    document.body.appendChild(botaoFixo);
    console.log('[BotaoMonitor] Botão fixo injetado');
  }
  
  /**
   * Calcula rota com destinos fixos
   */
  function calcularRotaComDestinosFixos() {
    console.log('[BotaoMonitor] Calculando rota com destinos fixos');
    atualizarPainel('Calculando rota com destinos fixos...');
    
    try {
      // Encontrar o mapa
      var mapa = encontrarMapa();
      
      if (!mapa) {
        console.log('[BotaoMonitor] Mapa não encontrado');
        atualizarPainel('ERRO: Mapa não encontrado');
        return;
      }
      
      console.log('[BotaoMonitor] Mapa encontrado');
      atualizarPainel('Mapa encontrado');
      
      // Limpar rotas existentes
      limparRotas();
      
      // Criar serviços
      var servicoDirecoes = new google.maps.DirectionsService();
      var renderizadorDirecoes = new google.maps.DirectionsRenderer({
        map: mapa
      });
      
      // Salvar referência global
      window.renderizadorMonitor = renderizadorDirecoes;
      
      // Waypoints (todos exceto último)
      var waypoints = DESTINOS_FIXOS.slice(0, -1).map(function(destino) {
        return {
          location: new google.maps.LatLng(destino.lat, destino.lng),
          stopover: true
        };
      });
      
      // Último destino
      var ultimo = DESTINOS_FIXOS[DESTINOS_FIXOS.length - 1];
      
      // Calcular rota
      servicoDirecoes.route({
        origin: new google.maps.LatLng(ORIGEM.lat, ORIGEM.lng),
        destination: new google.maps.LatLng(ultimo.lat, ultimo.lng),
        waypoints: waypoints,
        optimizeWaypoints: false, // Manter ordem original
        travelMode: google.maps.TravelMode.DRIVING
      }, function(resultado, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log('[BotaoMonitor] Rota calculada com sucesso');
          atualizarPainel('Rota calculada com sucesso!');
          
          // Mostrar no mapa
          renderizadorDirecoes.setDirections(resultado);
          
          // Salvar resultado
          window.resultadoRotaMonitor = resultado;
          
          // Atualizar interface
          atualizarInterface(resultado);
        } else {
          console.log('[BotaoMonitor] Erro ao calcular rota:', status);
          atualizarPainel('ERRO ao calcular rota: ' + status);
        }
      });
    } catch (e) {
      console.error('[BotaoMonitor] Erro:', e);
      atualizarPainel('ERRO: ' + e.message);
    }
  }
  
  /**
   * Encontra instância do mapa
   */
  function encontrarMapa() {
    // Verificar referência global
    if (window.map instanceof google.maps.Map) {
      return window.map;
    }
    
    // Verificar outras variáveis
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
      console.error('[BotaoMonitor] Erro ao limpar rotas:', e);
    }
  }
  
  /**
   * Atualiza a interface com informações da rota
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
    
    console.log('[BotaoMonitor] Distância:', distanciaKm, 'km, Tempo:', duracaoHoras, 'h', duracaoMinutos, 'min');
    atualizarPainel(`Rota: ${distanciaKm} km, ${duracaoHoras}h ${duracaoMinutos}min`);
    
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
      console.error('[BotaoMonitor] Erro ao atualizar interface:', e);
    }
  }
})();