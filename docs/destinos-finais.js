/**
 * Script de extração de destinos e substituição do botão de otimização
 * Abordagem definitiva para GitHub Pages
 */
(function() {
  console.log('[DestinosFinais] Inicializando...');
  
  // Destinos fixos com coordenadas corretas
  var DESTINOS_FIXOS = [
    { id: 1, nome: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    { id: 2, nome: "Campinas", lat: -22.9071, lng: -47.0632 }
  ];
  
  // Origem
  var ORIGEM = { id: 0, nome: "Dois Córregos", lat: -22.3731, lng: -48.3796 };
  
  // Inicializar
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar várias vezes
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  
  // Controle
  var executado = false;
  
  /**
   * Inicializa o script
   */
  function inicializar() {
    if (executado) return;
    
    console.log('[DestinosFinais] Buscando botão de otimização de rota');
    
    // Buscar botão
    var botao = document.getElementById('optimize-route');
    
    if (!botao) {
      // Procurar por texto
      var botoesOtimizar = document.querySelectorAll('button');
      for (var i = 0; i < botoesOtimizar.length; i++) {
        var texto = botoesOtimizar[i].textContent.toLowerCase();
        if (texto.includes('otimizar') || texto.includes('calcular')) {
          botao = botoesOtimizar[i];
          break;
        }
      }
    }
    
    if (!botao) {
      console.log('[DestinosFinais] Botão não encontrado, tentando novamente mais tarde');
      return;
    }
    
    console.log('[DestinosFinais] Botão encontrado, substituindo comportamento');
    
    // Clonar para remover listeners existentes
    var novoBotao = botao.cloneNode(true);
    if (botao.parentNode) {
      botao.parentNode.replaceChild(novoBotao, botao);
    }
    
    // Adicionar nosso comportamento
    novoBotao.addEventListener('click', handleBotaoClick);
    
    executado = true;
    console.log('[DestinosFinais] Inicialização concluída');
  }
  
  /**
   * Handler do clique no botão
   */
  function handleBotaoClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[DestinosFinais] Botão otimizar rota clicado');
    console.log('[DestinosFinais] Locations global:', window.locations);
    
    // Usar destinos fixos para garantir
    calcularRotaComDestinosFixos();
    
    return false;
  }
  
  /**
   * Calcula rota com destinos fixos
   */
  function calcularRotaComDestinosFixos() {
    console.log('[DestinosFinais] Calculando rota com destinos fixos');
    
    try {
      // Encontrar o mapa
      var mapa = encontrarMapa();
      
      if (!mapa) {
        console.log('[DestinosFinais] Mapa não encontrado');
        alert('Erro: Mapa não encontrado');
        return;
      }
      
      console.log('[DestinosFinais] Mapa encontrado');
      
      // Limpar rotas existentes
      limparRotas();
      
      // Criar serviços
      var servicoDirecoes = new google.maps.DirectionsService();
      var renderizadorDirecoes = new google.maps.DirectionsRenderer({
        map: mapa
      });
      
      // Salvar referência global
      window.renderizadorAtual = renderizadorDirecoes;
      
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
          console.log('[DestinosFinais] Rota calculada com sucesso');
          
          // Mostrar no mapa
          renderizadorDirecoes.setDirections(resultado);
          
          // Salvar resultado
          window.resultadoRotaAtual = resultado;
          
          // Atualizar interface
          atualizarInterface(resultado);
        } else {
          console.log('[DestinosFinais] Erro ao calcular rota:', status);
          alert('Erro ao calcular rota: ' + status);
        }
      });
    } catch (e) {
      console.error('[DestinosFinais] Erro:', e);
      alert('Erro: ' + e.message);
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
      console.error('[DestinosFinais] Erro ao limpar rotas:', e);
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
    
    console.log('[DestinosFinais] Distância:', distanciaKm, 'km, Tempo:', duracaoHoras, 'h', duracaoMinutos, 'min');
    
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
      console.error('[DestinosFinais] Erro ao atualizar interface:', e);
    }
    
    // Criar botão para relatório se não existir
    try {
      var container = document.querySelector('.route-info') || document.querySelector('[class*="info"]');
      
      if (container && !document.getElementById('btn-relatorio-destinos-finais')) {
        var btnRelatorio = document.createElement('button');
        btnRelatorio.id = 'btn-relatorio-destinos-finais';
        btnRelatorio.textContent = 'Mostrar Relatório';
        btnRelatorio.style.backgroundColor = '#ffc107';
        btnRelatorio.style.color = '#000';
        btnRelatorio.style.border = 'none';
        btnRelatorio.style.borderRadius = '4px';
        btnRelatorio.style.padding = '5px 10px';
        btnRelatorio.style.margin = '10px 0';
        btnRelatorio.style.cursor = 'pointer';
        
        btnRelatorio.addEventListener('click', function() {
          mostrarRelatorio(resultado);
        });
        
        container.appendChild(btnRelatorio);
      }
    } catch (e) {}
  }
  
  /**
   * Mostra um relatório da rota
   */
  function mostrarRelatorio(resultado) {
    if (!resultado || !resultado.routes || !resultado.routes[0]) {
      return;
    }
    
    var rota = resultado.routes[0];
    var legs = rota.legs || [];
    
    var relatorioHTML = '<div style="font-family: Arial, sans-serif; padding: 15px;">';
    relatorioHTML += '<h3>Relatório da Rota</h3>';
    relatorioHTML += '<ol>';
    
    // Adicionar origem
    relatorioHTML += '<li><strong>0: ' + ORIGEM.nome + '</strong> (Origem)</li>';
    
    // Adicionar destinos
    for (var i = 0; i < DESTINOS_FIXOS.length; i++) {
      relatorioHTML += '<li><strong>' + (i + 1) + ': ' + DESTINOS_FIXOS[i].nome + '</strong></li>';
    }
    
    relatorioHTML += '</ol>';
    
    // Informações da rota
    if (legs.length > 0) {
      var distanciaTotal = 0;
      var duracaoTotal = 0;
      
      for (var i = 0; i < legs.length; i++) {
        if (legs[i].distance) distanciaTotal += legs[i].distance.value;
        if (legs[i].duration) duracaoTotal += legs[i].duration.value;
      }
      
      var distanciaKm = (distanciaTotal / 1000).toFixed(1);
      var duracaoHoras = Math.floor(duracaoTotal / 3600);
      var duracaoMinutos = Math.floor((duracaoTotal % 3600) / 60);
      
      relatorioHTML += '<p><strong>Distância total:</strong> ' + distanciaKm + ' km</p>';
      relatorioHTML += '<p><strong>Tempo estimado:</strong> ' + duracaoHoras + 'h ' + duracaoMinutos + 'min</p>';
    }
    
    relatorioHTML += '</div>';
    
    // Mostrar relatório
    var container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    container.style.zIndex = '1000';
    container.style.maxWidth = '400px';
    container.style.maxHeight = '80vh';
    container.style.overflow = 'auto';
    
    container.innerHTML = relatorioHTML;
    
    // Botão fechar
    var fechar = document.createElement('button');
    fechar.textContent = 'X';
    fechar.style.position = 'absolute';
    fechar.style.top = '5px';
    fechar.style.right = '5px';
    fechar.style.backgroundColor = '#f44336';
    fechar.style.color = 'white';
    fechar.style.border = 'none';
    fechar.style.borderRadius = '50%';
    fechar.style.width = '25px';
    fechar.style.height = '25px';
    fechar.style.cursor = 'pointer';
    fechar.style.fontWeight = 'bold';
    
    fechar.addEventListener('click', function() {
      document.body.removeChild(container);
    });
    
    container.appendChild(fechar);
    document.body.appendChild(container);
  }
})();