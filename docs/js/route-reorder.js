// Script independente para reordenação de rotas
// Versão autônoma que funciona sem dependências

(function() {
  // Função principal que vai ser chamada após o carregamento do DOM
  function adicionarBotaoReordenar() {
    console.log("[Reorder] Inicializando script de reordenação");
    
    // 1. Verificar se já existe o botão
    if (document.getElementById('reorder-route-btn')) {
      console.log("[Reorder] Botão já existe");
      return;
    }
    
    // 2. Encontrar os elementos necessários
    const optimizeButton = document.getElementById('optimize-route');
    const destinationsList = document.getElementById('destinations-list');
    
    if (!optimizeButton) {
      console.log("[Reorder] Botão de otimizar não encontrado, tentando novamente em 1s");
      setTimeout(adicionarBotaoReordenar, 1000);
      return;
    }
    
    if (!destinationsList) {
      console.log("[Reorder] Lista de destinos não encontrada, tentando novamente em 1s");
      setTimeout(adicionarBotaoReordenar, 1000);
      return;
    }
    
    // 3. Adicionar CSS para controles de reordenação
    adicionarEstilos();
    
    // 4. Criar e adicionar o botão
    const reorderButton = document.createElement('button');
    reorderButton.id = 'reorder-route-btn';
    reorderButton.className = 'btn btn-secondary w-100 mb-3';
    reorderButton.textContent = 'Reordenar Destinos';
    reorderButton.style.marginTop = '8px';
    
    // Inserir o botão após o botão de otimizar
    optimizeButton.parentNode.insertBefore(reorderButton, optimizeButton.nextSibling);
    
    // 5. Adicionar o evento de clique
    let modoReordenar = false;
    
    reorderButton.addEventListener('click', function() {
      modoReordenar = !modoReordenar;
      
      if (modoReordenar) {
        // Ativar modo de reordenação
        reorderButton.textContent = 'Concluir Reordenação';
        reorderButton.classList.remove('btn-secondary');
        reorderButton.classList.add('btn-warning');
        
        // Adicionar botões de reordenação para cada item
        const items = destinationsList.querySelectorAll('li');
        
        items.forEach(function(item) {
          // Verificar se já tem os botões
          if (item.querySelector('.reorder-controls')) {
            return;
          }
          
          // Criar div para controles
          const controls = document.createElement('div');
          controls.className = 'reorder-controls';
          controls.style.display = 'inline-block';
          controls.style.marginRight = '10px';
          
          // Botão para mover para cima
          const upButton = document.createElement('button');
          upButton.type = 'button';
          upButton.className = 'reorder-btn';
          upButton.innerHTML = '&uarr;';
          upButton.title = 'Mover para cima';
          upButton.style.marginRight = '3px';
          
          // Botão para mover para baixo
          const downButton = document.createElement('button');
          downButton.type = 'button';
          downButton.className = 'reorder-btn';
          downButton.innerHTML = '&darr;';
          downButton.title = 'Mover para baixo';
          
          // Adicionar botões ao controle
          controls.appendChild(upButton);
          controls.appendChild(downButton);
          
          // Adicionar controles ao item
          if (item.firstChild) {
            item.insertBefore(controls, item.firstChild);
          } else {
            item.appendChild(controls);
          }
          
          // Eventos dos botões
          upButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const li = this.closest('li');
            const prev = li.previousElementSibling;
            
            if (prev) {
              destinationsList.insertBefore(li, prev);
              atualizarRotaCustomizada();
            }
          });
          
          downButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const li = this.closest('li');
            const next = li.nextElementSibling;
            
            if (next) {
              destinationsList.insertBefore(next, li);
              atualizarRotaCustomizada();
            }
          });
        });
        
        // Notificar o usuário
        mostrarNotificacao('Modo de reordenação ativado. Use as setas para reordenar os destinos.');
        
      } else {
        // Desativar modo de reordenação
        reorderButton.textContent = 'Reordenar Destinos';
        reorderButton.classList.remove('btn-warning');
        reorderButton.classList.add('btn-secondary');
        
        // Remover botões de reordenação
        const controls = destinationsList.querySelectorAll('.reorder-controls');
        controls.forEach(function(control) {
          control.remove();
        });
        
        // Aplicar a ordem personalizada
        atualizarRotaCustomizada();
        
        // Notificar o usuário
        mostrarNotificacao('Rota atualizada com a nova ordem.');
      }
    });
    
    console.log("[Reorder] Botão de reordenação adicionado com sucesso");
  }
  
  // Função para adicionar estilos CSS
  function adicionarEstilos() {
    const style = document.createElement('style');
    style.textContent = `
      .reorder-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background: #fff;
        color: #ffc107;
        border: 1px solid #ffc107;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .reorder-btn:hover {
        background: #fff8e1;
      }
      
      .reorder-controls {
        display: inline-flex;
        align-items: center;
        margin-right: 8px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Função para mostrar notificação
  function mostrarNotificacao(mensagem, tipo = 'info') {
    console.log("[Reorder] " + mensagem);
    
    // Verificar se existe função global de notificação
    if (typeof window.showNotification === 'function') {
      window.showNotification(mensagem, tipo);
      return;
    }
    
    // Criar notificação personalizada se não existir global
    let notification = document.getElementById('reorder-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'reorder-notification';
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.maxWidth = '300px';
      notification.style.padding = '15px 20px';
      notification.style.backgroundColor = tipo === 'error' ? '#f44336' : '#4caf50';
      notification.style.color = 'white';
      notification.style.borderRadius = '4px';
      notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      notification.style.zIndex = '9999';
      notification.style.transition = 'opacity 0.3s ease';
      notification.style.opacity = '0';
      
      document.body.appendChild(notification);
    }
    
    // Atualizar conteúdo e estilo
    notification.textContent = mensagem;
    notification.style.backgroundColor = tipo === 'error' ? '#f44336' : 
                                         tipo === 'warning' ? '#ff9800' : 
                                         tipo === 'success' ? '#4caf50' : '#2196f3';
    
    // Mostrar notificação
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Esconder depois de 3 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      
      // Remover do DOM após a transição
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  // Função para atualizar a rota com a nova ordem
  function atualizarRotaCustomizada() {
    console.log("[Reorder] Atualizando rota com a nova ordem");
    
    // Obter todos os destinos na nova ordem
    const destinationsList = document.getElementById('destinations-list');
    if (!destinationsList) return;
    
    const items = destinationsList.querySelectorAll('li');
    const locationIds = [];
    
    items.forEach(item => {
      const id = item.getAttribute('data-id');
      if (id) {
        locationIds.push(id);
      }
    });
    
    // Verificar se temos destinos suficientes
    if (locationIds.length < 1) {
      console.log("[Reorder] Não há destinos suficientes para recalcular a rota");
      return;
    }
    
    // Verificar se a função de rota personalizada existe global
    if (typeof window.calculateCustomRoute === 'function') {
      console.log("[Reorder] Usando função global calculateCustomRoute");
      window.calculateCustomRoute(locationIds);
      return;
    }
    
    // Se não tiver função global, tentar implementar localmente
    if (typeof window.directionsService !== 'undefined' && 
        typeof window.directionsRenderer !== 'undefined' && 
        typeof window.locations !== 'undefined') {
        
      console.log("[Reorder] Implementando cálculo de rota personalizada");
      
      // Obter as localizações na nova ordem
      const origin = window.locations.find(loc => loc.isOrigin === true);
      const waypoints = [];
      
      // Adicionar ponto de origem
      if (origin) {
        waypoints.push(origin);
      }
      
      // Adicionar destinos na ordem personalizada
      for (const id of locationIds) {
        const location = window.locations.find(loc => String(loc.id) === String(id));
        if (location) {
          waypoints.push(location);
        }
      }
      
      if (waypoints.length < 2) {
        console.log("[Reorder] Não há pontos suficientes para uma rota");
        return;
      }
      
      // Limpar rotas anteriores
      window.directionsRenderer.setDirections({routes: []});
      
      // Criar waypoints para o Google Maps API
      const googleWaypoints = waypoints.slice(1, -1).map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: true
      }));
      
      // Origem e destino
      const googleOrigin = new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng);
      const googleDestination = new google.maps.LatLng(
        waypoints[waypoints.length - 1].lat, 
        waypoints[waypoints.length - 1].lng
      );
      
      // Configurar a requisição
      const request = {
        origin: googleOrigin,
        destination: googleDestination,
        waypoints: googleWaypoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING
      };
      
      // Calcular a rota
      window.directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          window.directionsRenderer.setDirections(result);
          
          // Calcular distância total
          let distance = 0;
          const legs = result.routes[0].legs;
          
          for (let i = 0; i < legs.length; i++) {
            distance += legs[i].distance.value;
          }
          
          distance = (distance / 1000).toFixed(1); // Converter para km
          
          // Calcular tempo estimado (assumindo 80 km/h)
          const duration = Math.ceil((distance / 80) * 60);
          
          // Atualizar informações da rota
          const routeInfo = document.getElementById('route-info');
          if (routeInfo) {
            routeInfo.style.display = 'block';
          }
          
          // Verificar se existe função de atualização de rota
          if (typeof window.updateRouteInfo === 'function') {
            window.updateRouteInfo({
              distance: distance,
              duration: duration,
              path: waypoints.map(wp => wp.id)
            });
          } else {
            // Atualizar diretamente o HTML
            const routeDetails = document.getElementById('route-details');
            if (routeDetails) {
              const hours = Math.floor(duration / 60);
              const mins = duration % 60;
              const timeText = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
              
              routeDetails.innerHTML = `
                <p><strong>Distância Total:</strong> ${distance} km</p>
                <p><strong>Tempo Estimado:</strong> ${timeText}</p>
                <p><strong>Velocidade Média:</strong> 80 km/h</p>
              `;
            }
            
            // Atualizar sequência de visitas
            const routeSequence = document.getElementById('route-sequence');
            if (routeSequence) {
              routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
              
              waypoints.forEach((location, index) => {
                const item = document.createElement('div');
                item.className = 'sequence-item';
                item.innerHTML = `
                  <span class="sequence-number">${index}</span>
                  <span class="sequence-name">${location.name}</span>
                `;
                routeSequence.appendChild(item);
              });
            }
          }
          
          console.log("[Reorder] Rota personalizada calculada com sucesso");
        } else {
          console.error("[Reorder] Erro ao calcular rota:", status);
          mostrarNotificacao('Erro ao calcular rota personalizada: ' + status, 'error');
        }
      });
    } else {
      console.log("[Reorder] Não foi possível encontrar os objetos necessários para o cálculo de rota");
    }
  }
  
  // Registrar a função de atualização de rota no escopo global
  window.calculateCustomRoute = atualizarRotaCustomizada;
  
  // Inicializar o script quando o DOM estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', adicionarBotaoReordenar);
  } else {
    // O DOM já está carregado
    adicionarBotaoReordenar();
  }
  
  // Tentar várias vezes para garantir que os elementos existam
  setTimeout(adicionarBotaoReordenar, 1000);
  setTimeout(adicionarBotaoReordenar, 2000);
  setTimeout(adicionarBotaoReordenar, 3000);
})();