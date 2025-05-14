/**
 * Script direto para reordenação via GitHub Pages
 * Versão 1.1 - Diagnóstico avançado e detecção robusta
 */
(function() {
  console.log('[Reorder] Inicializando script direto v1.1');
  
  // Esperar pelo DOM
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar várias vezes
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  setTimeout(inicializar, 5000);
  setTimeout(inicializar, 7000);
  setTimeout(inicializar, 10000);
  
  // Tentar inicializar quando o mapa for carregado
  const verificarObjetosMapa = setInterval(function() {
    if (window.map && window.directionsService && window.locations) {
      console.log('[Reorder] Objetos do mapa detectados, inicializando...');
      inicializar();
      clearInterval(verificarObjetosMapa);
    }
  }, 500);
  
  // Variáveis
  let botaoReordenar = null;
  let modoReordenacao = false;
  
  // Inicialização
  function inicializar() {
    // Verificar se já inicializou
    if (document.getElementById('botao-reordenar-github')) {
      return;
    }
    
    // Log para verificar se o script está sendo executado
    console.log('[Reorder] Tentando inicializar script de reordenação');
    console.log('[Reorder] Verificando todas as variáveis globais:', Object.keys(window));
    
    // Verificar se os objetos necessários estão prontos
    if (window.map && window.locations) {
      console.log('[Reorder] Objetos principais estão prontos');
    } else {
      console.log('[Reorder] Objetos principais ainda não disponíveis:', 
                 'map:', !!window.map, 
                 'locations:', !!window.locations);
    }
    
    // Encontrar botão de otimizar rota
    const botaoOtimizar = document.querySelector('#optimize-route, button.btn-warning');
    
    // Se não encontrou o botão, procurar qualquer botão amarelo
    if (!botaoOtimizar) {
      console.log('[Reorder] Botão otimizar não encontrado, buscando alternativas...');
      const botoes = document.querySelectorAll('button');
      console.log('[Reorder] Total de botões:', botoes.length);
      
      // Listar todos os botões para debug
      botoes.forEach((btn, i) => {
        console.log(`[Reorder] Botão ${i}:`, btn.id, btn.className, btn.textContent.trim());
      });
      
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
    console.log('[Reorder] Procurando lista de destinos...');
    
    // Log de todas as listas e elementos location no documento
    const todasUls = document.querySelectorAll('ul');
    console.log('[Reorder] Listas encontradas:', todasUls.length);
    todasUls.forEach((ul, i) => {
      console.log(`[Reorder] Lista ${i}:`, ul.id, ul.className, 'Itens:', ul.children.length);
    });
    
    // Procurar por elementos com classes que contenham "location"
    const elementosLocation = document.querySelectorAll('[class*="location"]');
    console.log('[Reorder] Elementos com "location" na classe:', elementosLocation.length);
    elementosLocation.forEach((el, i) => {
      console.log(`[Reorder] Elemento location ${i}:`, el.tagName, el.id, el.className, 'Filhos:', el.children.length);
    });
    
    // Tentar vários seletores diferentes
    let listaDestinos = document.querySelector('#destinations-list, #locations-list, .locations-list, .location-list');
    
    // Se não encontrou, tentar outras abordagens
    if (!listaDestinos) {
      console.log('[Reorder] Tentando encontrar lista por conteúdo...');
      
      // Procurar qualquer lista que tenha mais de um item
      const candidatos = Array.from(document.querySelectorAll('ul')).filter(ul => ul.children.length > 0);
      
      for (const lista of candidatos) {
        // Verificar se tem o texto "Origem" ou o nome da origem (ex: "Dois Córregos")
        const conteudoLista = lista.textContent.toLowerCase();
        if (conteudoLista.includes('origem') || 
            conteudoLista.includes('dois córregos') || 
            conteudoLista.includes('dois corrego')) {
          listaDestinos = lista;
          console.log('[Reorder] Lista encontrada por conteúdo:', listaDestinos);
          break;
        }
      }
      
      // Se ainda não encontrou, pegar a primeira lista com mais de 1 item
      if (!listaDestinos && candidatos.length > 0) {
        listaDestinos = candidatos[0];
        console.log('[Reorder] Usando primeira lista com itens:', listaDestinos);
      }
    }
    
    if (!listaDestinos) {
      alert('Erro: Lista de destinos não encontrada! Por favor, adicione pelo menos um destino.');
      console.error('[Reorder] Lista de destinos não encontrada');
      botaoReordenar.classList.remove('ativo');
      botaoReordenar.textContent = 'Ativar Reordenação';
      modoReordenacao = false;
      return;
    }
    
    console.log('[Reorder] Lista encontrada:', listaDestinos.id, listaDestinos.className);
    console.log('[Reorder] Conteúdo da lista:', listaDestinos.innerHTML);
    
    // Agora sabemos que são DIVs, não LIs! Ajustar seletores
    // Tentar encontrar os elementos DIV com classe location-item
    let itensDestino = Array.from(listaDestinos.querySelectorAll('div.location-item'));
    console.log('[Reorder] Itens com classe location-item:', itensDestino.length);
    
    // Se não encontrou, tentar outros seletores comuns
    if (itensDestino.length === 0) {
      itensDestino = Array.from(listaDestinos.querySelectorAll('.location-item'));
      console.log('[Reorder] Itens com classe .location-item (sem div):', itensDestino.length);
    }
    
    // Tentar com qualquer elemento que tenha data-id
    if (itensDestino.length === 0) {
      itensDestino = Array.from(listaDestinos.querySelectorAll('[data-id]'));
      console.log('[Reorder] Itens com atributo data-id:', itensDestino.length);
    }
    
    // Tentar encontrar itens por conteúdo
    if (itensDestino.length === 0) {
      // Talvez sejam elementos <li> em algumas implementações
      const todosLI = Array.from(listaDestinos.querySelectorAll('li'));
      console.log('[Reorder] Total de elementos LI:', todosLI.length);
      
      if (todosLI.length > 0) {
        // Encontrar elementos que NÃO são a origem
        const origemIdx = todosLI.findIndex(item => 
          item.textContent.toLowerCase().includes('origem') || 
          item.textContent.toLowerCase().includes('dois córregos') ||
          item.textContent.toLowerCase().includes('dois corrego')
        );
        
        if (origemIdx !== -1) {
          console.log('[Reorder] Origem identificada pelo texto na posição (LI):', origemIdx);
          itensDestino = [...todosLI];
          itensDestino.splice(origemIdx, 1);
        } else {
          // Se não identificou, assumir que o primeiro é a origem
          console.log('[Reorder] Assumindo primeiro item como origem (LI)');
          itensDestino = todosLI.slice(1);
        }
      } else {
        // Verificar filhos diretos (mesmo que não sejam LI ou DIV)
        const todosFilhos = Array.from(listaDestinos.children);
        console.log('[Reorder] Total de filhos diretos:', todosFilhos.length);
        
        if (todosFilhos.length > 0) {
          // Pegar todos os elementos que parecem ser destinos
          itensDestino = todosFilhos.filter(item => {
            const texto = item.textContent.toLowerCase();
            return !texto.includes('origem') && 
                   !texto.includes('dois córregos') &&
                   !texto.includes('dois corrego');
          });
          
          console.log('[Reorder] Filhos filtrados (não origem):', itensDestino.length);
        }
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
      console.log('[Reorder] Configurando item para drag:', item.textContent.trim().substring(0, 30));
      
      // Verificar se o item já tem a classe para evitar duplicação
      if (!item.classList.contains('github-drag')) {
        item.classList.add('github-drag');
      }
      
      // Adicionar atributo draggable
      item.setAttribute('draggable', 'true');
      
      // Limpar eventos antigos (para evitar duplicação)
      item.removeEventListener('dragstart', iniciarArrasto);
      item.removeEventListener('dragend', finalizarArrasto);
      
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
    console.log('[Reorder] Recalculando rota com nova ordem');
    
    // Usar a mesma lógica para encontrar a lista de destinos
    let listaDestinos = document.querySelector('#destinations-list, #locations-list, .locations-list, .location-list');
    
    // Se não encontrou, tentar outras abordagens
    if (!listaDestinos) {
      console.log('[Reorder] Tentando encontrar lista para recálculo...');
      
      // Procurar qualquer contêiner com classe que mencione location
      const candidatosDiv = document.querySelectorAll('[class*="location"]');
      console.log('[Reorder] Elementos com "location" na classe:', candidatosDiv.length);
      
      for (const div of candidatosDiv) {
        if (div.children.length > 0) {
          listaDestinos = div;
          console.log('[Reorder] Lista encontrada por classe location:', div.className);
          break;
        }
      }
      
      // Se ainda não encontrou, tentar com listas
      if (!listaDestinos) {
        const candidatosUl = Array.from(document.querySelectorAll('ul')).filter(ul => ul.children.length > 0);
        
        for (const lista of candidatosUl) {
          // Verificar se tem o texto "Origem" ou o nome da origem
          const conteudoLista = lista.textContent.toLowerCase();
          if (conteudoLista.includes('origem') || 
              conteudoLista.includes('dois córregos') || 
              conteudoLista.includes('dois corrego')) {
            listaDestinos = lista;
            console.log('[Reorder] Lista encontrada por conteúdo para recálculo');
            break;
          }
        }
        
        // Se ainda não encontrou, pegar a primeira lista com mais de 1 item
        if (!listaDestinos && candidatosUl.length > 0) {
          listaDestinos = candidatosUl[0];
          console.log('[Reorder] Usando primeira lista com itens para recálculo');
        }
      }
    }
    
    if (!listaDestinos) {
      console.log('[Reorder] Lista de destinos não encontrada para calcular rota');
      alert('Reordenação concluída. A lista foi atualizada.');
      return;
    }
    
    console.log('[Reorder] Lista para recálculo encontrada:', listaDestinos.className);
    
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