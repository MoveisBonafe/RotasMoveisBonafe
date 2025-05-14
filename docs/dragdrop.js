// Implementação de Drag and Drop para reordenação de destinos
// Versão específica para GitHub Pages

(function() {
  console.log('[DragDrop] Inicializando script de drag and drop');
  
  // Esperar pelo DOM
  document.addEventListener('DOMContentLoaded', inicializarDragDrop);
  
  // Também tentar alguns segundos depois para garantir
  setTimeout(inicializarDragDrop, 1000);
  setTimeout(inicializarDragDrop, 2000);
  setTimeout(inicializarDragDrop, 3000);
  
  // Função principal de inicialização
  function inicializarDragDrop() {
    console.log('[DragDrop] Verificando elementos necessários...');
    
    // Verificar se já existe o botão
    if (document.getElementById('dragdrop-btn')) {
      console.log('[DragDrop] Botão já existe');
      return;
    }
    
    // Elementos necessários
    const optimizeButton = document.getElementById('optimize-route');
    const destinationsList = document.getElementById('destinations-list');
    
    if (!optimizeButton || !destinationsList) {
      console.log('[DragDrop] Elementos necessários não encontrados, tentando novamente mais tarde');
      return;
    }
    
    // Adicionar estilos CSS
    adicionarEstilos();
    
    // Criar botão
    const dragDropBtn = document.createElement('button');
    dragDropBtn.id = 'dragdrop-btn';
    dragDropBtn.className = 'btn btn-outline-warning w-100 mb-3';
    dragDropBtn.style.marginTop = '10px';
    dragDropBtn.textContent = 'Rota Personalizada';
    
    // Adicionar o botão ao DOM
    optimizeButton.parentNode.insertBefore(dragDropBtn, optimizeButton.nextSibling);
    
    // Estado do modo drag and drop
    let modoDragDropAtivo = false;
    
    // Adicionar evento ao botão
    dragDropBtn.addEventListener('click', function() {
      modoDragDropAtivo = !modoDragDropAtivo;
      
      if (modoDragDropAtivo) {
        // Ativar modo
        ativarModoDragDrop(dragDropBtn, destinationsList);
      } else {
        // Desativar modo
        desativarModoDragDrop(dragDropBtn, destinationsList);
      }
    });
    
    console.log('[DragDrop] Inicialização concluída');
  }
  
  // Adicionar estilos CSS
  function adicionarEstilos() {
    const style = document.createElement('style');
    style.textContent = `
      .draggable {
        cursor: grab;
        position: relative;
      }
      
      .draggable::before {
        content: "⣿";
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: #ffc107;
        font-size: 14px;
        opacity: 0.7;
      }
      
      .draggable.dragging {
        opacity: 0.7;
        border: 2px dashed #ffc107;
        cursor: grabbing;
      }
      
      .draggable-placeholder {
        border: 2px dashed #ffc107;
        background-color: #fff8e1;
        height: 40px;
        margin-bottom: 10px;
        border-radius: 8px;
      }
      
      .draggable-indicator {
        margin-right: 5px;
        color: #ffc107;
      }
      
      .dragdrop-active {
        background-color: #ffc107 !important;
        color: black !important;
        border-color: #ffab00 !important;
      }
      
      .dragdrop-active:hover {
        background-color: #ffab00 !important;
      }
      
      .dragdrop-info {
        margin-top: 10px;
        padding: 8px;
        border-radius: 4px;
        background-color: #fff8e1;
        border: 1px solid #ffecb3;
        font-size: 14px;
        color: #856404;
        text-align: center;
        margin-bottom: 10px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Ativar o modo drag and drop
  function ativarModoDragDrop(btn, lista) {
    btn.classList.add('dragdrop-active');
    
    // Adicionar info
    const info = document.createElement('div');
    info.className = 'dragdrop-info';
    info.id = 'dragdrop-info';
    info.innerHTML = '<i class="bi bi-info-circle"></i> Arraste os itens para reordenar os destinos.';
    
    if (lista.previousElementSibling) {
      lista.parentNode.insertBefore(info, lista);
    } else {
      lista.parentNode.prepend(info);
    }
    
    // Configurar cada item da lista para drag and drop
    const items = lista.querySelectorAll('li');
    
    items.forEach(item => {
      item.classList.add('draggable');
      item.setAttribute('draggable', 'true');
      
      // Adicionar eventos de drag and drop
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
    });
    
    // Adicionar eventos à lista
    lista.addEventListener('dragover', handleDragOver);
    lista.addEventListener('drop', handleDrop);
    
    // Mostrar notificação
    mostrarNotificacao('Modo de rota personalizada ativado. Arraste os destinos para reordenar.', 'info');
  }
  
  // Desativar o modo drag and drop
  function desativarModoDragDrop(btn, lista) {
    btn.classList.remove('dragdrop-active');
    
    // Remover info
    const info = document.getElementById('dragdrop-info');
    if (info) {
      info.remove();
    }
    
    // Remover configuração de cada item
    const items = lista.querySelectorAll('li');
    
    items.forEach(item => {
      item.classList.remove('draggable');
      item.removeAttribute('draggable');
      
      // Remover eventos
      item.removeEventListener('dragstart', handleDragStart);
      item.removeEventListener('dragend', handleDragEnd);
    });
    
    // Remover eventos da lista
    lista.removeEventListener('dragover', handleDragOver);
    lista.removeEventListener('drop', handleDrop);
    
    // Calcular a nova rota
    calcularRotaPersonalizada(lista);
    
    // Mostrar notificação
    mostrarNotificacao('Rota atualizada com a nova ordem de destinos.', 'success');
  }
  
  // Manipuladores de eventos de drag and drop
  function handleDragStart(e) {
    this.classList.add('dragging');
    
    // Configurar o data transfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id || '');
    
    // Configurar a imagem de arrasto (opcional)
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
  }
  
  function handleDragEnd() {
    this.classList.remove('dragging');
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const draggable = document.querySelector('.dragging');
    if (!draggable) return;
    
    // Encontrar o elemento mais próximo
    const afterElement = getElementAfterDragPosition(this, e.clientY);
    
    if (afterElement) {
      this.insertBefore(draggable, afterElement);
    } else {
      this.appendChild(draggable);
    }
  }
  
  function handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    
    // Calcular nova ordem (opcional, já que está sendo feito no handleDragOver)
    setTimeout(() => {
      calcularRotaPrevia(this);
    }, 100);
  }
  
  // Função para encontrar o elemento após a posição do mouse
  function getElementAfterDragPosition(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  // Calcular rota prévia com a nova ordem (sem aplicar)
  function calcularRotaPrevia(lista) {
    // Implementar se necessário para pré-visualização
  }
  
  // Calcular e aplicar rota personalizada
  function calcularRotaPersonalizada(lista) {
    // Obter a ordem atual dos itens
    const items = lista.querySelectorAll('li');
    const ids = [];
    
    items.forEach(item => {
      const id = item.getAttribute('data-id');
      if (id) {
        ids.push(id);
      }
    });
    
    // Verificar se temos itens suficientes
    if (ids.length < 1) {
      console.log('[DragDrop] Não há destinos suficientes para recalcular a rota');
      return;
    }
    
    // Verificar se temos acesso às funções necessárias
    if (typeof window.calculateCustomRoute === 'function') {
      window.calculateCustomRoute(ids);
      return;
    }
    
    // Implementação alternativa para cálculo de rota
    if (typeof window.locations !== 'undefined' && 
        typeof window.directionsService !== 'undefined' && 
        typeof window.directionsRenderer !== 'undefined') {
      
      console.log('[DragDrop] Usando implementação direta para cálculo de rota');
      
      // Obter localizações na ordem correta
      const waypoints = [];
      
      // Adicionar origem primeiro
      const origin = window.locations.find(loc => loc.isOrigin);
      if (origin) {
        waypoints.push(origin);
      }
      
      // Adicionar os demais pontos na ordem do IDs
      for (const id of ids) {
        const location = window.locations.find(loc => !loc.isOrigin && String(loc.id) === String(id));
        if (location) {
          waypoints.push(location);
        }
      }
      
      if (waypoints.length < 2) {
        console.log('[DragDrop] Não há pontos suficientes para uma rota');
        return;
      }
      
      // Limpar rota anterior
      window.directionsRenderer.setDirections({routes: []});
      
      // Configurar requisição para o DirectionsService
      const originPoint = new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng);
      const destinationPoint = new google.maps.LatLng(
        waypoints[waypoints.length - 1].lat, 
        waypoints[waypoints.length - 1].lng
      );
      
      // Pontos intermediários
      const waypointsArray = waypoints.slice(1, -1).map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: true
      }));
      
      const request = {
        origin: originPoint,
        destination: destinationPoint,
        waypoints: waypointsArray,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING
      };
      
      // Calcular a rota
      window.directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          // Renderizar a rota
          window.directionsRenderer.setDirections(result);
          
          // Calcular distância total
          let totalDistance = 0;
          const legs = result.routes[0].legs;
          
          for (let i = 0; i < legs.length; i++) {
            totalDistance += legs[i].distance.value;
          }
          
          // Converter para km e arredondar
          const distanceKm = (totalDistance / 1000).toFixed(1);
          
          // Calcular tempo estimado (80 km/h)
          const durationMinutes = Math.ceil(distanceKm / 80 * 60);
          
          // Atualizar informações da rota
          atualizarInformacoesRota(distanceKm, durationMinutes, waypoints);
          
          console.log('[DragDrop] Rota personalizada calculada com sucesso');
        } else {
          console.error('[DragDrop] Erro ao calcular rota:', status);
          mostrarNotificacao('Erro ao calcular rota personalizada', 'error');
        }
      });
    } else {
      console.log('[DragDrop] Objetos necessários não encontrados');
    }
  }
  
  // Atualizar informações da rota na interface
  function atualizarInformacoesRota(distanceKm, durationMinutes, waypoints) {
    const routeInfo = document.getElementById('route-info');
    if (!routeInfo) return;
    
    // Tornar visível
    routeInfo.style.display = 'block';
    
    // Atualizar detalhes
    const routeDetails = document.getElementById('route-details');
    if (routeDetails) {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      routeDetails.innerHTML = `
        <p><strong>Distância Total:</strong> ${distanceKm} km</p>
        <p><strong>Tempo Estimado:</strong> ${hours > 0 ? `${hours}h ` : ''}${minutes}min</p>
        <p><strong>Velocidade Média:</strong> 80 km/h</p>
      `;
    }
    
    // Atualizar sequência
    const routeSequence = document.getElementById('route-sequence');
    if (routeSequence) {
      routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
      
      waypoints.forEach((location, index) => {
        const sequenceItem = document.createElement('div');
        sequenceItem.className = 'sequence-item';
        
        sequenceItem.innerHTML = `
          <span class="sequence-number">${index}</span>
          <span class="sequence-name">${location.name}</span>
        `;
        
        routeSequence.appendChild(sequenceItem);
      });
    }
  }
  
  // Função para mostrar notificações
  function mostrarNotificacao(mensagem, tipo = 'info') {
    console.log('[DragDrop] ' + mensagem);
    
    // Verificar se existe função global
    if (typeof window.showNotification === 'function') {
      window.showNotification(mensagem, tipo);
      return;
    }
    
    // Criar notificação própria
    let notification = document.getElementById('dragdrop-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'dragdrop-notification';
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.zIndex = '9999';
      notification.style.padding = '12px 20px';
      notification.style.borderRadius = '4px';
      notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
      notification.style.transition = 'all 0.3s ease';
      notification.style.opacity = '0';
      
      document.body.appendChild(notification);
    }
    
    // Configurar estilo baseado no tipo
    if (tipo === 'error') {
      notification.style.backgroundColor = '#f44336';
    } else if (tipo === 'success') {
      notification.style.backgroundColor = '#4caf50';
    } else if (tipo === 'warning') {
      notification.style.backgroundColor = '#ff9800';
    } else {
      notification.style.backgroundColor = '#2196f3';
    }
    
    notification.style.color = 'white';
    notification.textContent = mensagem;
    
    // Animar entrada
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Animar saída
    setTimeout(() => {
      notification.style.opacity = '0';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
})();