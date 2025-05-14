// Script independente para adicionar funcionalidade de Rota Personalizada no GitHub Pages
// Este arquivo deve ser carregado diretamente no HTML da página

(function() {
  // Executar quando o DOM estiver totalmente carregado
  function inicializarRotaPersonalizada() {
    console.log('[RotaPersonalizada] Iniciando...');
    
    // 1. Verificar se estamos na página principal do aplicativo
    if (document.getElementById('app-container') === null) {
      console.log('[RotaPersonalizada] Não estamos na página principal. Abortando.');
      return;
    }
    
    // 2. Encontrar o botão de otimizar rota
    const botaoOtimizar = document.getElementById('optimize-route');
    if (!botaoOtimizar) {
      console.log('[RotaPersonalizada] Botão de otimizar não encontrado. Tentando novamente em 1 segundo.');
      setTimeout(inicializarRotaPersonalizada, 1000);
      return;
    }
    
    // 3. Verificar se o botão de rota personalizada já existe
    if (document.getElementById('custom-route-btn')) {
      console.log('[RotaPersonalizada] Botão já existe. Abortando.');
      return;
    }
    
    // 4. Adicionar CSS para os botões e estados
    adicionarEstilos();
    
    // 5. Criar e adicionar o botão de rota personalizada
    const botaoPersonalizado = criarBotaoRotaPersonalizada();
    const divBotao = botaoOtimizar.parentNode;
    
    // Adicionar espaço antes do botão
    const espaco = document.createElement('div');
    espaco.style.height = '10px';
    
    // Inserir após o botão de otimizar
    if (botaoOtimizar.nextSibling) {
      divBotao.insertBefore(espaco, botaoOtimizar.nextSibling);
      divBotao.insertBefore(botaoPersonalizado, espaco.nextSibling);
    } else {
      divBotao.appendChild(espaco);
      divBotao.appendChild(botaoPersonalizado);
    }
    
    console.log('[RotaPersonalizada] Botão de rota personalizada adicionado com sucesso.');
  }
  
  // Adicionar estilos CSS necessários
  function adicionarEstilos() {
    const estilos = document.createElement('style');
    estilos.textContent = `
      .modo-rota-personalizada .location-item {
        position: relative;
        transition: background-color 0.2s;
      }
      .modo-rota-personalizada .location-item:hover {
        background-color: #fffbeb;
      }
      .btn-rota-personalizada {
        width: 100%;
        margin-bottom: 10px;
        padding: 8px 12px;
        background-color: #f8f9fa;
        border: 1px solid #ced4da;
        border-radius: 4px;
        color: #000;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .btn-rota-personalizada.ativo {
        background-color: #ffc107;
        border-color: #ffab00;
      }
      .btn-rota-personalizada:hover {
        background-color: #e9ecef;
      }
      .btn-rota-personalizada.ativo:hover {
        background-color: #ffab00;
      }
      .btn-mover {
        padding: 2px 4px;
        margin-right: 3px;
        background: transparent;
        border: 1px solid #ffc107;
        border-radius: 3px;
        color: #ffc107;
        font-size: 12px;
        cursor: pointer;
      }
      .btn-mover:hover {
        background-color: #fff8e1;
      }
      .controles-rota {
        display: inline-block;
        margin-right: 8px;
      }
    `;
    document.head.appendChild(estilos);
  }
  
  // Criar o botão de rota personalizada
  function criarBotaoRotaPersonalizada() {
    const botao = document.createElement('button');
    botao.id = 'custom-route-btn';
    botao.className = 'btn-rota-personalizada';
    botao.textContent = 'Rota Personalizada';
    
    // Variável para controlar o estado do modo
    let modoAtivo = false;
    
    // Adicionar evento de clique
    botao.addEventListener('click', function() {
      // Alternar o estado
      modoAtivo = !modoAtivo;
      
      // Lista de localizações
      const listaLocais = document.getElementById('locations-list');
      if (!listaLocais) {
        console.error('[RotaPersonalizada] Lista de localizações não encontrada');
        return;
      }
      
      if (modoAtivo) {
        // Ativar o modo de rota personalizada
        botao.classList.add('ativo');
        listaLocais.classList.add('modo-rota-personalizada');
        
        // Adicionar botões para cada item da lista (exceto o ponto de origem)
        const itensLista = listaLocais.querySelectorAll('li:not(.origin-point)');
        
        itensLista.forEach(function(item) {
          // Criar container para os botões
          const controles = document.createElement('div');
          controles.className = 'controles-rota';
          
          // Botão para mover para cima
          const btnCima = document.createElement('button');
          btnCima.type = 'button';
          btnCima.className = 'btn-mover btn-cima';
          btnCima.textContent = '↑';
          btnCima.title = 'Mover para cima';
          
          // Botão para mover para baixo
          const btnBaixo = document.createElement('button');
          btnBaixo.type = 'button';
          btnBaixo.className = 'btn-mover btn-baixo';
          btnBaixo.textContent = '↓';
          btnBaixo.title = 'Mover para baixo';
          
          // Adicionar os botões ao controle
          controles.appendChild(btnCima);
          controles.appendChild(btnBaixo);
          
          // Inserir no início do item
          item.insertBefore(controles, item.firstChild);
          
          // Evento de clique no botão para cima
          btnCima.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const li = this.closest('li');
            const prev = li.previousElementSibling;
            
            if (prev && !prev.classList.contains('origin-point')) {
              listaLocais.insertBefore(li, prev);
              atualizarRotaPersonalizada();
            }
          });
          
          // Evento de clique no botão para baixo
          btnBaixo.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const li = this.closest('li');
            const next = li.nextElementSibling;
            
            if (next) {
              listaLocais.insertBefore(next, li);
              atualizarRotaPersonalizada();
            }
          });
        });
        
        // Exibir notificação
        mostrarNotificacao('Modo de rota personalizada ativado. Use as setas para reordenar os locais.');
        
      } else {
        // Desativar o modo de rota personalizada
        botao.classList.remove('ativo');
        listaLocais.classList.remove('modo-rota-personalizada');
        
        // Remover os botões de controle
        const controles = listaLocais.querySelectorAll('.controles-rota');
        controles.forEach(function(controle) {
          controle.remove();
        });
        
        // Atualizar rota com a ordem atual
        atualizarRotaPersonalizada();
      }
    });
    
    return botao;
  }
  
  // Função para mostrar notificação
  function mostrarNotificacao(mensagem, tipo = 'info') {
    // Verificar se existe a função de notificação global
    if (window.showNotification) {
      window.showNotification(mensagem, tipo);
    } else {
      // Criar nossa própria notificação
      const notificacao = document.createElement('div');
      notificacao.style.position = 'fixed';
      notificacao.style.top = '20px';
      notificacao.style.left = '50%';
      notificacao.style.transform = 'translateX(-50%)';
      notificacao.style.padding = '10px 20px';
      notificacao.style.borderRadius = '4px';
      notificacao.style.backgroundColor = tipo === 'error' ? '#f44336' : '#4caf50';
      notificacao.style.color = '#fff';
      notificacao.style.zIndex = '9999';
      notificacao.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      notificacao.textContent = mensagem;
      
      document.body.appendChild(notificacao);
      
      // Remover após 3 segundos
      setTimeout(function() {
        notificacao.style.opacity = '0';
        notificacao.style.transition = 'opacity 0.5s';
        
        setTimeout(function() {
          if (notificacao.parentNode) {
            notificacao.parentNode.removeChild(notificacao);
          }
        }, 500);
        
      }, 3000);
    }
  }
  
  // Função para atualizar a rota com a ordem personalizada
  function atualizarRotaPersonalizada() {
    console.log('[RotaPersonalizada] Atualizando rota personalizada...');
    
    // Obter a lista de localizações
    const listaLocais = document.getElementById('locations-list');
    if (!listaLocais) return;
    
    // Coletar os IDs na ordem atual
    const itens = listaLocais.querySelectorAll('li');
    const ids = [];
    
    itens.forEach(function(item) {
      const id = item.getAttribute('data-id');
      if (id) {
        ids.push(id);
      }
    });
    
    if (ids.length < 2) {
      console.log('[RotaPersonalizada] Não há locais suficientes para uma rota');
      return;
    }
    
    // Verificar se temos a função global calculateRouteWithWaypoints
    if (typeof window.calculateRouteWithWaypoints === 'function' && window.locations) {
      // Ordenar as localizações de acordo com os IDs
      const locaisOrdenados = [];
      
      for (const id of ids) {
        const localEncontrado = window.locations.find(local => String(local.id) === String(id));
        if (localEncontrado) {
          locaisOrdenados.push(localEncontrado);
        }
      }
      
      if (locaisOrdenados.length > 1) {
        // Chamar a função para calcular a rota
        window.calculateRouteWithWaypoints(locaisOrdenados);
      }
    } else {
      // Se não tivermos a função, vamos implementá-la agora
      implementarCalculoRotaPersonalizada(ids);
    }
  }
  
  // Implementar a função de cálculo de rota personalizada se ela não existir
  function implementarCalculoRotaPersonalizada(ids) {
    console.log('[RotaPersonalizada] Implementando função de cálculo de rota personalizada...');
    
    // Verificar se temos os objetos necessários
    if (!window.directionsService || !window.directionsRenderer || !window.locations) {
      console.error('[RotaPersonalizada] Objetos necessários não encontrados:', {
        directionsService: !!window.directionsService,
        directionsRenderer: !!window.directionsRenderer,
        locations: !!window.locations
      });
      return;
    }
    
    // Obter as localizações na ordem correta
    const waypoints = [];
    
    for (const id of ids) {
      const localEncontrado = window.locations.find(local => String(local.id) === String(id));
      if (localEncontrado) {
        waypoints.push(localEncontrado);
      }
    }
    
    if (waypoints.length < 2) {
      console.error('[RotaPersonalizada] Não há waypoints suficientes');
      return;
    }
    
    // Criar array de waypoints para o Google Maps
    const gmWaypoints = waypoints.slice(1, -1).map(wp => ({
      location: new google.maps.LatLng(wp.lat, wp.lng),
      stopover: true
    }));
    
    // Origem e destino
    const origin = new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng);
    const destination = new google.maps.LatLng(waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng);
    
    // Configurar solicitação de rota
    const request = {
      origin: origin,
      destination: destination,
      waypoints: gmWaypoints,
      optimizeWaypoints: false, // Não otimizar, usar ordem personalizada
      travelMode: google.maps.TravelMode.DRIVING
    };
    
    // Calcular rota
    window.directionsService.route(request, function(result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        window.directionsRenderer.setDirections(result);
        
        // Calcular distância total
        let totalDistance = 0;
        const legs = result.routes[0].legs;
        legs.forEach(leg => {
          totalDistance += leg.distance.value;
        });
        
        // Atualizar informações da rota
        if (window.updateRouteInfo) {
          const totalDistanceKm = (totalDistance / 1000).toFixed(1);
          const estimatedTime = Math.ceil(totalDistance / 1000 / 80 * 60); // 80km/h
          
          const routeInfo = {
            distance: totalDistanceKm,
            duration: estimatedTime,
            path: waypoints.map(wp => wp.id)
          };
          
          window.updateRouteInfo(routeInfo);
        } else {
          // Se não tivermos a função updateRouteInfo, atualizar manualmente
          const routeInfoElement = document.getElementById('route-info');
          if (routeInfoElement) {
            const totalDistanceKm = (totalDistance / 1000).toFixed(1);
            const estimatedTime = Math.ceil(totalDistance / 1000 / 80 * 60); // 80km/h
            
            let html = '<h4>Resumo da Rota</h4>';
            html += `<p><strong>Distância Total:</strong> ${totalDistanceKm} km</p>`;
            html += `<p><strong>Tempo Estimado:</strong> ${estimatedTime} minutos</p>`;
            
            routeInfoElement.innerHTML = html;
          }
        }
        
        console.log('[RotaPersonalizada] Rota personalizada calculada com sucesso');
      } else {
        console.error('[RotaPersonalizada] Erro ao calcular rota:', status);
        mostrarNotificacao('Erro ao calcular rota personalizada. Tente novamente.', 'error');
      }
    });
  }
  
  // Criar a função global
  window.calculateRouteWithWaypoints = window.calculateRouteWithWaypoints || function(waypoints) {
    if (!waypoints || waypoints.length < 2) {
      console.error('[RotaPersonalizada] Waypoints insuficientes');
      return;
    }
    
    // Obter os IDs
    const ids = waypoints.map(wp => wp.id);
    
    // Implementar o cálculo
    implementarCalculoRotaPersonalizada(ids);
  };
  
  // Iniciar após o carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarRotaPersonalizada);
  } else {
    // DOM já está carregado
    inicializarRotaPersonalizada();
  }
  
  // Tentar várias vezes para garantir que os elementos estejam presentes
  setTimeout(inicializarRotaPersonalizada, 1000);
  setTimeout(inicializarRotaPersonalizada, 2000);
  setTimeout(inicializarRotaPersonalizada, 3000);
  setTimeout(inicializarRotaPersonalizada, 5000);
})();