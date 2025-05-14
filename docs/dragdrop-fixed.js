// Implementação de Drag and Drop para reordenação de destinos
// Versão específica para GitHub Pages

(function() {
  console.log('[DragDrop] Inicializando script de drag and drop v2');
  
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
    if (document.getElementById('drag-route-btn')) {
      console.log('[DragDrop] Botão já existe');
      return;
    }
    
    // Elementos necessários
    const optimizeButton = document.getElementById('optimize-route');
    
    // Tentar encontrar a lista de destinos com diferentes seletores
    let destinationsList = document.getElementById('destinations-list');
    
    // Se não encontrar, tentar outros seletores possíveis
    if (!destinationsList) {
      destinationsList = document.getElementById('locations-list');
    }
    
    if (!destinationsList) {
      destinationsList = document.querySelector('ul.locations-list');
    }
    
    if (!optimizeButton || !destinationsList) {
      // Logar quais elementos estão faltando para debug
      console.log('[DragDrop] Elementos necessários não encontrados:',
        {
          optimizeButton: !!optimizeButton,
          destinationsList: !!destinationsList
        }
      );
      
      // Se estamos no GitHub Pages e não encontramos os elementos, tentar encontrar alternativas
      if (window.location.href.includes('github.io')) {
        // Tentar encontrar baseado na estrutura comum
        if (!optimizeButton) {
          optimizeButton = document.querySelector('button.btn-warning');
        }
        
        if (!destinationsList) {
          destinationsList = document.querySelector('ul');
        }
      }
      
      // Se ainda não encontrou, abandonar tentativa
      if (!optimizeButton || !destinationsList) {
        console.log('[DragDrop] Impossível encontrar elementos necessários, tentando novamente mais tarde');
        return;
      }
    }
    
    console.log('[DragDrop] Elementos encontrados, iniciando configuração');
    
    // Adicionar estilos CSS
    adicionarEstilos();
    
    // Criar botão com ID diferente para evitar conflitos
    const dragDropBtn = document.createElement('button');
    dragDropBtn.id = 'drag-route-btn';
    dragDropBtn.className = 'btn btn-outline-warning w-100 mb-3';
    dragDropBtn.style.marginTop = '10px';
    dragDropBtn.textContent = 'Rota Personalizada (Arrastar e Soltar)';
    
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
    // Verificar se já existe o estilo
    if (document.getElementById('dragdrop-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'dragdrop-styles';
    style.textContent = `
      .draggable {
        cursor: grab !important;
        position: relative !important;
        padding-left: 25px !important;
      }
      
      .draggable::before {
        content: "≡";
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: #ffc107;
        font-size: 18px;
        opacity: 0.8;
      }
      
      .draggable.dragging {
        opacity: 0.7 !important;
        border: 2px dashed #ffc107 !important;
        background-color: #fffbeb !important;
        cursor: grabbing !important;
        z-index: 100 !important;
      }
      
      .dragdrop-active {
        background-color: #ffc107 !important;
        color: black !important;
        border-color: #ffab00 !important;
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
      
      .dragdrop-placeholder {
        height: 2px;
        background-color: #ffc107;
        transition: all 0.2s;
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
    info.innerHTML = 'Arraste os itens para reordenar os destinos. <strong>Importante:</strong> Segure e arraste para mudar a ordem.';
    
    // Adicionar a info logo após o botão
    btn.parentNode.insertBefore(info, btn.nextSibling);
    
    // Configurar cada item da lista para drag and drop
    // Selecionar todos os itens que não são ponto de origem
    const items = lista.querySelectorAll('li:not(.origin-point)');
    
    if (items.length === 0) {
      // Se não encontrar itens com a classe específica, tentar todos os LIs
      const allItems = lista.querySelectorAll('li');
      console.log('[DragDrop] Items encontrados:', allItems.length);
      
      // Excluir o primeiro item (origem) se existir mais de um
      if (allItems.length > 1) {
        for (let i = 1; i < allItems.length; i++) {
          configurarItemArrastavel(allItems[i]);
        }
      } else if (allItems.length === 1) {
        // Se só tiver um item, usar ele mesmo
        configurarItemArrastavel(allItems[0]);
      }
    } else {
      // Configurar os itens encontrados
      items.forEach(item => configurarItemArrastavel(item));
    }
    
    // Adicionar eventos à lista
    lista.addEventListener('dragover', handleDragOver);
    lista.addEventListener('drop', handleDrop);
    
    // Mostrar notificação
    mostrarNotificacao('Arraste os destinos para reordenar (segure e arraste)', 'info');
    
    // Fazer log do estado
    console.log('[DragDrop] Modo drag and drop ativado com', items.length, 'items');
  }
  
  // Configurar um item para ser arrastável
  function configurarItemArrastavel(item) {
    item.classList.add('draggable');
    item.setAttribute('draggable', 'true');
    
    // Adicionar eventos de drag
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    
    console.log('[DragDrop] Item configurado:', item.textContent);
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
    const items = lista.querySelectorAll('.draggable');
    
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
    mostrarNotificacao('Rota atualizada com a nova ordem de destinos', 'success');
  }
  
  // Manipuladores de eventos de drag and drop
  function handleDragStart(e) {
    // Marcar que este é o elemento que está sendo arrastado
    this.classList.add('dragging');
    
    // Configurar o data transfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id') || '');
    
    // Criar um elemento fantasma para o arrasto (opcional)
    try {
      // Clonar o elemento para usar como fantasma
      const ghost = this.cloneNode(true);
      ghost.style.width = this.offsetWidth + 'px';
      ghost.style.height = '20px';
      ghost.style.backgroundColor = '#ffc107';
      ghost.style.opacity = '0.5';
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      document.body.appendChild(ghost);
      
      // Tentar definir a imagem do fantasma
      e.dataTransfer.setDragImage(ghost, 10, 10);
      
      // Remover o fantasma após um instante
      setTimeout(() => {
        document.body.removeChild(ghost);
      }, 0);
    } catch (err) {
      console.log('[DragDrop] Erro ao configurar imagem fantasma:', err);
    }
    
    console.log('[DragDrop] Iniciando arrasto do item:', this.textContent);
  }
  
  function handleDragEnd() {
    // Remover a classe de arrasto
    this.classList.remove('dragging');
    console.log('[DragDrop] Fim do arrasto');
  }
  
  function handleDragOver(e) {
    // Necessário para permitir o drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Encontrar o elemento que está sendo arrastado
    const draggable = document.querySelector('.dragging');
    if (!draggable) return;
    
    // Encontrar o elemento que deve vir após o ponto atual
    const afterElement = getDragAfterElement(this, e.clientY);
    
    // Remover placeholder existente
    const placeholder = document.querySelector('.dragdrop-placeholder');
    if (placeholder) placeholder.remove();
    
    // Mostrar visualmente onde o item será posicionado
    if (afterElement) {
      // Criar um marcador visual
      const placeholderMark = document.createElement('div');
      placeholderMark.className = 'dragdrop-placeholder';
      this.insertBefore(placeholderMark, afterElement);
    } else {
      // Adicionar ao final
      const placeholderMark = document.createElement('div');
      placeholderMark.className = 'dragdrop-placeholder';
      this.appendChild(placeholderMark);
    }
  }
  
  function handleDrop(e) {
    e.preventDefault();
    
    // Remover placeholder existente
    const placeholder = document.querySelector('.dragdrop-placeholder');
    if (placeholder) placeholder.remove();
    
    // Obter o elemento arrastado
    const draggable = document.querySelector('.dragging');
    if (!draggable) return;
    
    // Encontrar o elemento que deve vir após o ponto atual
    const afterElement = getDragAfterElement(this, e.clientY);
    
    // Reposicionar o elemento
    if (afterElement) {
      this.insertBefore(draggable, afterElement);
    } else {
      this.appendChild(draggable);
    }
    
    // Atualizar a rota em tempo real (opcional)
    setTimeout(() => {
      calcularRotaPrevia(this);
    }, 100);
    
    console.log('[DragDrop] Item solto e reposicionado');
  }
  
  // Determinar após qual elemento o item deve ser posicionado
  function getDragAfterElement(container, y) {
    // Obter todos os elementos arrastáveis, exceto o que está sendo arrastado
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    
    // Encontrar o elemento mais próximo abaixo da posição Y
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      // Se o offset for negativo (estamos acima do elemento)
      // e for maior que o offset atual, este é o novo "mais próximo"
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  // Pré-visualizar a rota com a nova ordem
  function calcularRotaPrevia(lista) {
    // Implementação opcional para dar feedback visual
    console.log('[DragDrop] Pré-visualizando rota com nova ordem');
  }
  
  // Calcular e aplicar a nova rota personalizada
  function calcularRotaPersonalizada(lista) {
    console.log('[DragDrop] Calculando rota personalizada');
    
    // Obter a ordem atual dos itens
    const items = lista.querySelectorAll('li');
    const ids = [];
    
    // Extrair os IDs na ordem correta
    items.forEach(item => {
      // Tentar diferentes atributos onde o ID pode estar armazenado
      const id = item.getAttribute('data-id') || 
                item.getAttribute('data-location-id') || 
                item.id;
      
      if (id) {
        ids.push(id);
      }
    });
    
    console.log('[DragDrop] IDs coletados:', ids);
    
    // Verificar se temos itens suficientes
    if (ids.length < 1) {
      console.log('[DragDrop] Não há destinos suficientes para recalcular a rota');
      return;
    }
    
    // Verificar qual função de cálculo de rota está disponível
    if (typeof window.calculateCustomRoute === 'function') {
      console.log('[DragDrop] Usando calculateCustomRoute existente');
      window.calculateCustomRoute(ids);
      return;
    }
    
    if (typeof window.calculateRouteWithWaypoints === 'function') {
      console.log('[DragDrop] Usando calculateRouteWithWaypoints existente');
      
      // Precisamos converter IDs para objetos de localização
      if (window.locations) {
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
        
        if (waypoints.length >= 2) {
          window.calculateRouteWithWaypoints(waypoints);
          return;
        }
      }
    }
    
    // Implementação alternativa se nenhuma função global estiver disponível
    if (typeof window.directionsService !== 'undefined' && 
        typeof window.directionsRenderer !== 'undefined' && 
        typeof window.locations !== 'undefined') {
      
      console.log('[DragDrop] Usando implementação direta para cálculo de rota');
      
      // Obter localizações na ordem correta
      const waypoints = [];
      
      // Adicionar origem primeiro (se existir)
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
        console.log('[DragDrop] Não há pontos suficientes para uma rota:', waypoints);
        return;
      }
      
      console.log('[DragDrop] Calculando rota com waypoints:', waypoints);
      
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
      console.log('[DragDrop] Objetos necessários não encontrados para cálculo de rota');
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
    }, 5000);
  }
})();