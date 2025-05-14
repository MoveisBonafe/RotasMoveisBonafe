/**
 * Script direto para reordenação via GitHub Pages
 */
(function() {
  console.log('[Reorder] Inicializando script direto v1.0');
  
  // Esperar pelo DOM
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar várias vezes
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  setTimeout(inicializar, 5000);
  
  // Variáveis
  let botaoReordenar = null;
  let modoReordenacao = false;
  
  // Inicialização
  function inicializar() {
    // Verificar se já inicializou
    if (document.getElementById('botao-reordenar-github')) {
      return;
    }
    
    // Encontrar botão de otimizar rota
    const botaoOtimizar = document.querySelector('#optimize-route, button.btn-warning');
    
    if (!botaoOtimizar) {
      console.log('[Reorder] Botão otimizar não encontrado, tentando novamente depois');
      return;
    }
    
    console.log('[Reorder] Criando botão de reordenação');
    
    // Adicionar estilos
    const estilos = document.createElement('style');
    estilos.textContent = `
      .github-drag {
        padding-left: 25px !important;
        cursor: grab !important;
        position: relative !important;
      }
      
      .github-drag::before {
        content: "≡";
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: #ffc107;
        font-weight: bold;
        font-size: 16px;
      }
      
      .github-dragging {
        opacity: 0.6 !important;
        border: 2px dashed #ffc107 !important;
        background-color: #fffbeb !important;
      }
      
      #botao-reordenar-github {
        width: 100%;
        margin-top: 8px;
        margin-bottom: 8px;
        padding: 8px 12px;
        font-weight: 600;
      }
      
      #botao-reordenar-github.ativo {
        background-color: #ffc107 !important;
        color: black !important;
      }
    `;
    document.head.appendChild(estilos);
    
    // Criar botão
    botaoReordenar = document.createElement('button');
    botaoReordenar.id = 'botao-reordenar-github';
    botaoReordenar.className = 'btn btn-outline-warning';
    botaoReordenar.textContent = 'Ativar Reordenação';
    
    // Adicionar após o botão de otimizar
    botaoOtimizar.parentNode.insertBefore(botaoReordenar, botaoOtimizar.nextSibling);
    
    // Adicionar evento
    botaoReordenar.addEventListener('click', alternarModoReordenacao);
    
    console.log('[Reorder] Inicialização concluída');
  }
  
  // Alternar modo de reordenação
  function alternarModoReordenacao() {
    modoReordenacao = !modoReordenacao;
    
    // Status detalhado para debug
    console.log('[Reorder] Modo reordenação:', modoReordenacao);
    
    if (modoReordenacao) {
      ativarReordenacao();
    } else {
      desativarReordenacao();
    }
  }
  
  // Ativar reordenação
  function ativarReordenacao() {
    console.log('[Reorder] Ativando reordenação');
    
    // Mudar estilo do botão
    botaoReordenar.classList.add('ativo');
    botaoReordenar.textContent = 'Concluir Reordenação';
    
    // Procurar a lista de destinos (várias opções)
    const listaDestinos = document.querySelector('#destinations-list, #locations-list, ul.locations-list');
    
    if (!listaDestinos) {
      alert('Erro: Lista de destinos não encontrada!');
      console.error('[Reorder] Lista de destinos não encontrada');
      return;
    }
    
    // Encontrar todos os itens da lista EXCETO a origem
    let itensDestino = Array.from(listaDestinos.querySelectorAll('li:not(.origin-point)'));
    
    if (itensDestino.length === 0) {
      // Se não encontrar com essa classe, pegar todos menos o primeiro (origem)
      const todosItens = Array.from(listaDestinos.querySelectorAll('li'));
      
      if (todosItens.length > 1) {
        itensDestino = todosItens.slice(1);
      }
    }
    
    console.log('[Reorder] Destinos encontrados:', itensDestino.length);
    
    if (itensDestino.length === 0) {
      alert('Adicione pelo menos um destino para reordenar');
      botaoReordenar.classList.remove('ativo');
      botaoReordenar.textContent = 'Ativar Reordenação';
      modoReordenacao = false;
      return;
    }
    
    // Log de todos os destinos encontrados
    itensDestino.forEach((item, index) => {
      console.log(`[Reorder] Destino ${index+1}:`, item.textContent.trim());
    });
    
    // Configurar cada item
    itensDestino.forEach(item => {
      item.classList.add('github-drag');
      item.setAttribute('draggable', 'true');
      
      // Adicionar eventos
      item.addEventListener('dragstart', iniciarArrasto);
      item.addEventListener('dragend', finalizarArrasto);
    });
    
    // Configurar lista para receber drops
    listaDestinos.addEventListener('dragover', sobreArrasto);
    listaDestinos.addEventListener('drop', soltarItem);
    
    alert('Modo de reordenação ativado. Arraste os destinos para reorganizá-los.');
  }
  
  // Desativar reordenação
  function desativarReordenacao() {
    console.log('[Reorder] Desativando reordenação');
    
    // Restaurar botão
    botaoReordenar.classList.remove('ativo');
    botaoReordenar.textContent = 'Ativar Reordenação';
    
    // Encontrar todos os itens configurados
    const itensArrastaveis = document.querySelectorAll('.github-drag');
    
    if (itensArrastaveis.length === 0) {
      console.log('[Reorder] Nenhum item arrastável encontrado para desativar');
      return;
    }
    
    // Encontrar a lista
    const listaDestinos = itensArrastaveis[0].parentNode;
    
    // Remover configuração de cada item
    itensArrastaveis.forEach(item => {
      item.classList.remove('github-drag');
      item.removeAttribute('draggable');
      
      // Remover eventos
      item.removeEventListener('dragstart', iniciarArrasto);
      item.removeEventListener('dragend', finalizarArrasto);
    });
    
    // Remover evento da lista
    if (listaDestinos) {
      listaDestinos.removeEventListener('dragover', sobreArrasto);
      listaDestinos.removeEventListener('drop', soltarItem);
    }
    
    // Calcular nova rota
    calcularRota();
  }
  
  // Eventos de drag and drop
  function iniciarArrasto(e) {
    console.log('[Reorder] Iniciando arrasto');
    this.classList.add('github-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
  }
  
  function finalizarArrasto() {
    console.log('[Reorder] Finalizando arrasto');
    this.classList.remove('github-dragging');
  }
  
  function sobreArrasto(e) {
    e.preventDefault();
    const itemArrastando = document.querySelector('.github-dragging');
    
    if (!itemArrastando) return;
    
    // Encontrar o elemento mais próximo onde inserir
    const elementoApos = getElementoApos(this, e.clientY);
    
    // Log para debug
    if (elementoApos) {
      console.log('[Reorder] Posicionando após:', elementoApos.textContent.trim());
    } else {
      console.log('[Reorder] Posicionando no final');
    }
    
    if (elementoApos) {
      this.insertBefore(itemArrastando, elementoApos);
    } else {
      this.appendChild(itemArrastando);
    }
  }
  
  function soltarItem(e) {
    e.preventDefault();
    console.log('[Reorder] Item solto');
  }
  
  // Encontrar o elemento após o qual inserir
  function getElementoApos(container, y) {
    // Obter todos os elementos arrastáveis não sendo arrastados
    const elementosArrastaveis = Array.from(
      container.querySelectorAll('.github-drag:not(.github-dragging)')
    );
    
    // Encontrar o primeiro elemento após a posição Y
    return elementosArrastaveis.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  // Calcular nova rota
  function calcularRota() {
    // Encontrar lista de destinos
    const listaDestinos = document.querySelector('#destinations-list, #locations-list, ul.locations-list');
    
    if (!listaDestinos) {
      console.log('[Reorder] Lista de destinos não encontrada para calcular rota');
      alert('Reordenação concluída. Lista atualizada.');
      return;
    }
    
    // Verificar se temos os objetos necessários
    if (window.directionsService && window.directionsRenderer && window.locations) {
      // Coletar IDs na ordem atual
      const itens = listaDestinos.querySelectorAll('li');
      const ids = [];
      
      itens.forEach(item => {
        const id = item.getAttribute('data-id') || 
                  item.getAttribute('data-location-id') ||
                  item.id;
        
        if (id) {
          ids.push(id);
        }
      });
      
      console.log('[Reorder] IDs coletados:', ids);
      
      if (ids.length < 2) {
        console.log('[Reorder] Não há destinos suficientes para uma rota');
        alert('Reordenação concluída.');
        return;
      }
      
      // Verificar função disponível
      if (typeof window.calculateCustomRoute === 'function') {
        window.calculateCustomRoute(ids);
        alert('Rota atualizada com a nova ordem!');
        return;
      }
      
      if (typeof window.calculateRouteWithWaypoints === 'function') {
        // Criar array de waypoints
        const waypoints = [];
        
        // Adicionar origem
        const origem = window.locations.find(loc => loc.isOrigin);
        if (origem) {
          waypoints.push(origem);
        }
        
        // Adicionar demais pontos na ordem dos IDs
        for (const id of ids) {
          const local = window.locations.find(loc => !loc.isOrigin && String(loc.id) === String(id));
          if (local) {
            waypoints.push(local);
          }
        }
        
        console.log('[Reorder] Waypoints:', waypoints);
        
        if (waypoints.length >= 2) {
          window.calculateRouteWithWaypoints(waypoints);
          alert('Rota atualizada com a nova ordem!');
          return;
        }
      }
      
      // Implementação direta se nenhuma função estiver disponível
      const waypoints = [];
      
      // Adicionar origem
      const origem = window.locations.find(loc => loc.isOrigin);
      if (origem) {
        waypoints.push(origem);
      }
      
      // Adicionar demais pontos na ordem dos IDs
      for (const id of ids) {
        const local = window.locations.find(loc => !loc.isOrigin && String(loc.id) === String(id));
        if (local) {
          waypoints.push(local);
        }
      }
      
      if (waypoints.length < 2) {
        console.log('[Reorder] Não há waypoints suficientes');
        alert('Reordenação concluída.');
        return;
      }
      
      // Limpar rota anterior
      window.directionsRenderer.setDirections({routes: []});
      
      // Configurar requisição
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
      
      // Calcular rota
      window.directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          // Renderizar rota
          window.directionsRenderer.setDirections(result);
          
          // Calcular distância
          let totalDistance = 0;
          const legs = result.routes[0].legs;
          
          for (let i = 0; i < legs.length; i++) {
            totalDistance += legs[i].distance.value;
          }
          
          // Converter para km
          const distanceKm = (totalDistance / 1000).toFixed(1);
          
          // Tempo estimado (80 km/h)
          const durationMinutes = Math.ceil(distanceKm / 80 * 60);
          
          // Atualizar informações da rota
          atualizarInfo(distanceKm, durationMinutes, waypoints);
          
          alert('Rota atualizada com a nova ordem!');
        } else {
          console.error('[Reorder] Erro ao calcular rota:', status);
          alert('Erro ao calcular a rota. Veja o console para detalhes.');
        }
      });
    } else {
      console.log('[Reorder] Objetos necessários não encontrados');
      alert('Reordenação concluída. Lista atualizada.');
    }
  }
  
  // Atualizar informações
  function atualizarInfo(distanceKm, durationMinutes, waypoints) {
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
})();