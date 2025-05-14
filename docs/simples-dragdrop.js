/**
 * Script simples e independente para reordenação por Drag and Drop
 * Versão minimalista para GitHub Pages
 */
(function() {
  // Executar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', inicializar);
  
  // Também tentar inicializar após alguns segundos (para garantir)
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  
  // Variáveis globais dentro do escopo
  let dragAtivo = false;
  let botaoDrag = null;
  let listaDrop = null;
  
  // Função principal
  function inicializar() {
    // Verificar se já foi inicializado
    if (document.getElementById('dragdrop-simples-btn')) {
      return;
    }
    
    console.log('[SimpleDrag] Inicializando...');
    
    // Encontrar elementos necessários
    const botaoOtimizar = document.getElementById('optimize-route');
    
    // Tentar encontrar a lista de destinos
    listaDrop = document.getElementById('destinations-list');
    
    if (!listaDrop) {
      listaDrop = document.getElementById('locations-list');
    }
    
    if (!listaDrop) {
      listaDrop = document.querySelector('.locations-list');
    }
    
    // Verificar se encontramos os elementos
    if (!botaoOtimizar || !listaDrop) {
      console.log('[SimpleDrag] Não encontrou elementos necessários. Tentando novamente mais tarde...');
      return;
    }
    
    console.log('[SimpleDrag] Elementos encontrados');
    
    // Adicionar estilos
    const estilos = document.createElement('style');
    estilos.textContent = `
      .item-arrastavel {
        cursor: grab !important;
        user-select: none !important;
      }
      
      .item-arrastavel::before {
        content: "⋮";
        display: inline-block;
        margin-right: 10px;
        color: #ffc107;
        font-weight: bold;
      }
      
      .item-arrastando {
        opacity: 0.6;
        background-color: #fff8e1 !important;
        border: 2px dashed #ffc107 !important;
      }
      
      .drop-ativo {
        background-color: #f8f9fa;
        border: 1px dashed #ced4da;
        border-radius: 5px;
        padding: 5px;
      }
      
      .botao-ativo {
        background-color: #ffc107 !important;
        color: black !important;
      }
    `;
    document.head.appendChild(estilos);
    
    // Criar o botão de drag and drop
    botaoDrag = document.createElement('button');
    botaoDrag.id = 'dragdrop-simples-btn';
    botaoDrag.className = 'btn btn-secondary';
    botaoDrag.style.width = '100%';
    botaoDrag.style.marginTop = '8px';
    botaoDrag.style.marginBottom = '8px';
    botaoDrag.textContent = 'Ativar Reordenação';
    
    // Inserir após o botão de otimizar
    botaoOtimizar.parentNode.insertBefore(botaoDrag, botaoOtimizar.nextSibling);
    
    // Adicionar evento
    botaoDrag.addEventListener('click', alternarDragDrop);
    
    console.log('[SimpleDrag] Inicializado com sucesso');
  }
  
  // Alternar modo de drag and drop
  function alternarDragDrop() {
    dragAtivo = !dragAtivo;
    
    if (dragAtivo) {
      // Ativar
      ativarDragDrop();
    } else {
      // Desativar
      desativarDragDrop();
    }
  }
  
  // Ativar drag and drop
  function ativarDragDrop() {
    console.log('[SimpleDrag] Ativando drag and drop');
    
    // Alterar aparência do botão
    botaoDrag.classList.add('botao-ativo');
    botaoDrag.textContent = 'Concluir Reordenação';
    
    // Destacar a área de drop
    listaDrop.classList.add('drop-ativo');
    
    // Configurar os itens (excluindo a origem)
    const itens = listaDrop.querySelectorAll('li:not(.origin-point)');
    
    if (itens.length === 0) {
      alert('Adicione pelo menos um destino para reordenar.');
      desativarDragDrop();
      return;
    }
    
    // Configurar cada item
    itens.forEach(item => {
      item.classList.add('item-arrastavel');
      item.setAttribute('draggable', 'true');
      
      // Adicionar eventos
      item.addEventListener('dragstart', iniciarArrasto);
      item.addEventListener('dragend', finalizarArrasto);
    });
    
    // Configurar área de drop
    listaDrop.addEventListener('dragover', permitirDrop);
    listaDrop.addEventListener('drop', processarDrop);
    
    alert('Modo de reordenação ativado. Arraste os destinos para reorganizá-los.');
  }
  
  // Desativar drag and drop
  function desativarDragDrop() {
    console.log('[SimpleDrag] Desativando drag and drop');
    
    // Restaurar aparência do botão
    botaoDrag.classList.remove('botao-ativo');
    botaoDrag.textContent = 'Ativar Reordenação';
    
    // Remover destaque da área de drop
    listaDrop.classList.remove('drop-ativo');
    
    // Remover configuração dos itens
    const itens = listaDrop.querySelectorAll('.item-arrastavel');
    
    itens.forEach(item => {
      item.classList.remove('item-arrastavel');
      item.removeAttribute('draggable');
      
      // Remover eventos
      item.removeEventListener('dragstart', iniciarArrasto);
      item.removeEventListener('dragend', finalizarArrasto);
    });
    
    // Remover eventos da área de drop
    listaDrop.removeEventListener('dragover', permitirDrop);
    listaDrop.removeEventListener('drop', processarDrop);
    
    // Calcular nova rota
    calcularRotaPersonalizada();
  }
  
  // Funções para drag and drop
  function iniciarArrasto(e) {
    this.classList.add('item-arrastando');
    e.dataTransfer.effectAllowed = 'move';
    
    // Armazenar referência ao elemento arrastado
    e.dataTransfer.setData('text/plain', '');
  }
  
  function finalizarArrasto() {
    this.classList.remove('item-arrastando');
  }
  
  function permitirDrop(e) {
    e.preventDefault();
    
    const arrastando = document.querySelector('.item-arrastando');
    if (!arrastando) return;
    
    // Determinar onde inserir o elemento
    const elementoApos = obterElementoApos(this, e.clientY);
    
    if (elementoApos) {
      // Verificar se não estamos tentando posicionar antes da origem
      if (elementoApos.classList.contains('origin-point')) {
        // Posicionar após a origem
        this.insertBefore(arrastando, elementoApos.nextElementSibling);
      } else {
        this.insertBefore(arrastando, elementoApos);
      }
    } else {
      // Adicionar ao final
      this.appendChild(arrastando);
    }
  }
  
  function processarDrop(e) {
    e.preventDefault();
  }
  
  // Função para determinar onde inserir o elemento
  function obterElementoApos(container, y) {
    // Obter todos os elementos arrastáveis que não estão sendo arrastados
    const elementosArrastaveis = [...container.querySelectorAll(':scope > li:not(.item-arrastando)')];
    
    return elementosArrastaveis.reduce((mais_proximo, elemento) => {
      const caixa = elemento.getBoundingClientRect();
      const offset = y - caixa.top - caixa.height / 2;
      
      if (offset < 0 && offset > mais_proximo.offset) {
        return { offset: offset, elemento: elemento };
      } else {
        return mais_proximo;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).elemento;
  }
  
  // Calcular nova rota
  function calcularRotaPersonalizada() {
    // Tentar usar as funções globais disponíveis
    if (window.locations && window.directionsService && window.directionsRenderer) {
      console.log('[SimpleDrag] Calculando rota personalizada');
      
      // Obter a sequência atual de IDs
      const items = listaDrop.querySelectorAll('li');
      const ids = [];
      
      items.forEach(item => {
        // Buscar o ID do atributo data-id ou similar
        const id = item.getAttribute('data-id') || 
                  item.getAttribute('data-location-id') || 
                  item.id;
        
        if (id) {
          ids.push(id);
        }
      });
      
      console.log('[SimpleDrag] IDs coletados:', ids);
      
      // Verificar se temos IDs suficientes
      if (ids.length < 2) {
        console.log('[SimpleDrag] Não há destinos suficientes para uma rota');
        return;
      }
      
      // Verificar qual função de rota usar
      if (typeof window.calculateCustomRoute === 'function') {
        window.calculateCustomRoute(ids);
        return;
      }
      
      if (typeof window.calculateRouteWithWaypoints === 'function') {
        // Converter IDs para objetos de localização
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
      
      // Implementação direta se as funções globais não estiverem disponíveis
      if (window.directionsService && window.directionsRenderer) {
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
        
        if (waypoints.length >= 2) {
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
              
              console.log('[SimpleDrag] Rota calculada com sucesso');
              alert('Rota atualizada com a nova ordem de destinos!');
            } else {
              console.error('[SimpleDrag] Erro ao calcular rota:', status);
              alert('Erro ao calcular rota personalizada. Verifique o console para detalhes.');
            }
          });
        }
      }
    } else {
      console.log('[SimpleDrag] Objetos necessários para cálculo de rota não encontrados');
      alert('Reordenação completa. A ordem dos destinos foi atualizada.');
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
})();