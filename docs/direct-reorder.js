/**
 * Solução de reordenação direta para GitHub Pages
 */
(function() {
  console.log('[Direct-Reorder] Inicializando solução direta');
  
  // Verificar quando a página estiver carregada
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar várias vezes
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  setTimeout(inicializar, 5000);
  
  // Variáveis globais
  let botaoReordenar = null;
  let modoReordenacao = false;
  
  function inicializar() {
    console.log('[Direct-Reorder] Tentando inicializar...');
    
    if (document.getElementById('botao-reordenar-direto')) {
      console.log('[Direct-Reorder] Já inicializado');
      return;
    }
    
    // Adicionar estilos
    const estilos = document.createElement('style');
    estilos.textContent = `
      .github-drag {
        cursor: grab !important;
        position: relative !important;
        background-color: #fffbeb !important;
        border-left: 3px solid #ffc107 !important;
        padding-left: 25px !important;
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
        background-color: #fff8e0 !important;
      }
      
      #botao-reordenar-direto {
        width: 100%;
        margin-top: 8px;
        margin-bottom: 8px;
        padding: 8px 12px;
        font-weight: 600;
        background-color: #ffffff;
        border: 2px solid #ffc107;
        color: #000000;
      }
      
      #botao-reordenar-direto.ativo {
        background-color: #ffc107 !important;
        color: black !important;
      }
    `;
    document.head.appendChild(estilos);
    
    // Encontrar container de localizações (tentar diversos seletores)
    const containers = [
      '#destinations-container', 
      '#locations-container',
      '.locations-container',
      '.locations-section',
      '.sidebar-section'
    ];
    
    let container = null;
    
    for (const selector of containers) {
      const el = document.querySelector(selector);
      if (el) {
        container = el;
        console.log('[Direct-Reorder] Container encontrado:', selector);
        break;
      }
    }
    
    if (!container) {
      console.log('[Direct-Reorder] Container não encontrado, tentando outro método');
      
      // Tentar encontrar pelo botão "Otimizar Rota"
      const botaoOtimizar = document.querySelector('#optimize-route, .btn-warning');
      
      if (botaoOtimizar) {
        console.log('[Direct-Reorder] Botão otimizar encontrado, buscando container pai');
        
        // Navegar para cima na árvore DOM para encontrar um container
        let el = botaoOtimizar.parentElement;
        for (let i = 0; i < 5 && el; i++) {
          if (el.className && el.className.toLowerCase().includes('location')) {
            container = el;
            console.log('[Direct-Reorder] Container encontrado por relação com botão');
            break;
          }
          
          // Se é um container de seção
          if (el.className && (
            el.className.includes('container') || 
            el.className.includes('section') || 
            el.className.includes('sidebar')
          )) {
            container = el;
            console.log('[Direct-Reorder] Container de seção encontrado');
            break;
          }
          
          el = el.parentElement;
        }
        
        // Se ainda não encontrou, usar o pai do botão
        if (!container) {
          container = botaoOtimizar.parentElement;
          console.log('[Direct-Reorder] Usando pai do botão como container');
        }
      } else {
        console.log('[Direct-Reorder] Botão otimizar não encontrado');
        return;
      }
    }
    
    // Encontrar botão otimizar dentro do container
    const botaoOtimizar = container.querySelector('#optimize-route, .btn-warning, button:not(.btn-sm)');
    
    if (!botaoOtimizar) {
      console.log('[Direct-Reorder] Botão otimizar não encontrado no container');
      return;
    }
    
    // Verificar se o botão já existe (para evitar duplicação)
    const botaoJaExiste = document.getElementById('botao-reordenar-direto');
    if (botaoJaExiste) {
      console.log('[Direct-Reorder] Botão já existe, não criando novamente');
      return;
    }
    
    // Criar botão de reordenação
    botaoReordenar = document.createElement('button');
    botaoReordenar.id = 'botao-reordenar-direto';
    botaoReordenar.className = 'btn btn-block';
    botaoReordenar.textContent = 'Ativar Reordenação';
    botaoReordenar.style.width = '100%';
    botaoReordenar.style.marginTop = '10px';
    botaoReordenar.style.marginBottom = '10px';
    botaoReordenar.style.color = '#000';
    botaoReordenar.style.border = '1px solid #ffc107';
    botaoReordenar.style.backgroundColor = '#ffffff';
    botaoReordenar.addEventListener('click', alternarReordenacao);
    
    // Adicionar após o botão otimizar
    botaoOtimizar.parentNode.insertBefore(botaoReordenar, botaoOtimizar.nextSibling);
    
    console.log('[Direct-Reorder] Botão adicionado com sucesso');
  }
  
  function alternarReordenacao() {
    modoReordenacao = !modoReordenacao;
    console.log('[Direct-Reorder] Reordenação:', modoReordenacao);
    
    if (modoReordenacao) {
      ativarReordenacao();
    } else {
      desativarReordenacao();
    }
  }
  
  function ativarReordenacao() {
    // Atualizar botão
    botaoReordenar.classList.add('ativo');
    botaoReordenar.textContent = 'Concluir Reordenação';
    
    console.log('[Direct-Reorder] Ativando modo de reordenação...');
    
    // Solução DIRETA: Usar uma abordagem manual para encontrar e substituir destinos
    const seletores = [
      '.locations-list', '.location-list', '#locations-list', 
      '.locations-container', '#destinations-container',
      '[class*="location"]'
    ];
    
    let container = null;
    
    // Tentar encontrar container de destinos
    for (const selector of seletores) {
      const el = document.querySelector(selector);
      if (el) {
        // Verificar se parece um container de destinos
        if (el.innerHTML.includes('location-item') || 
            el.innerHTML.includes('data-id') || 
            el.innerHTML.includes('badge')) {
          container = el;
          console.log('[Direct-Reorder] Container de destinos encontrado:', selector, el);
          break;
        }
      }
    }
    
    console.log('[Direct-Reorder] Todos os elementos com "location" na classe:');
    document.querySelectorAll('[class*="location"]').forEach((el, i) => {
      console.log(`Elemento ${i}:`, el.tagName, el.className, 'HTML:', el.innerHTML.substring(0, 100));
    });
    
    if (!container) {
      alert('Erro: Não foi possível encontrar a lista de destinos!');
      botaoReordenar.classList.remove('ativo');
      botaoReordenar.textContent = 'Ativar Reordenação';
      modoReordenacao = false;
      return;
    }
    
    // Obter HTML atual do container
    const html = container.innerHTML;
    console.log('[Direct-Reorder] HTML do container:', html);
    
    // Extrair itens com regex
    const regex = /<div[^>]*class="location-item"[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/div>/g;
    const destinos = [];
    let match;
    
    while (match = regex.exec(html)) {
      const id = match[1];
      const conteudo = match[0];
      if (id && conteudo) {
        destinos.push({id, html: conteudo});
      }
    }
    
    console.log('[Direct-Reorder] Destinos encontrados:', destinos.length);
    
    if (destinos.length === 0) {
      alert('Adicione pelo menos um destino para reordenar.');
      botaoReordenar.classList.remove('ativo');
      botaoReordenar.textContent = 'Ativar Reordenação';
      modoReordenacao = false;
      return;
    }
    
    // Criar elementos DIV para cada destino
    const novoHtml = destinos.map(d => {
      // Adicionar classe para arrastar e remover botão apagar
      return d.html.replace('location-item', 'location-item github-drag')
                  .replace(/<button.*?<\/button>/s, '');
    }).join('');
    
    // Armazenar IDs originais para o recálculo
    container.dataset.idsOriginais = destinos.map(d => d.id).join(',');
    
    // Substituir HTML no container
    container.innerHTML = novoHtml;
    
    // Adicionar eventos a cada item
    Array.from(container.querySelectorAll('.github-drag')).forEach(item => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', iniciarArrasto);
      item.addEventListener('dragend', finalizarArrasto);
    });
    
    // Adicionar eventos ao container
    container.addEventListener('dragover', sobreArrasto);
    container.addEventListener('drop', soltarItem);
    
    alert('Modo de reordenação ativado. Arraste os destinos para reorganizá-los.');
  }
  
  function desativarReordenacao() {
    botaoReordenar.classList.remove('ativo');
    botaoReordenar.textContent = 'Ativar Reordenação';
    
    // Encontrar o container
    const container = document.querySelector('.github-drag').closest('[class*="location"]');
    
    if (!container) {
      console.log('[Direct-Reorder] Container não encontrado para desativar');
      return;
    }
    
    // Remover eventos do container
    container.removeEventListener('dragover', sobreArrasto);
    container.removeEventListener('drop', soltarItem);
    
    // Coletar IDs na nova ordem
    const itens = Array.from(container.querySelectorAll('.github-drag'));
    const idsNovos = itens.map(item => {
      const id = item.getAttribute('data-id');
      return id;
    });
    
    console.log('[Direct-Reorder] Nova ordem de IDs:', idsNovos);
    
    // Calcular nova rota
    recalcularRota(idsNovos);
    
    // Restaurar HTML original
    const idsOriginais = container.dataset.idsOriginais;
    if (idsOriginais) {
      console.log('[Direct-Reorder] IDs originais:', idsOriginais);
      
      // Trigger para recalcular a rota com a nova ordem
      if (typeof window.calculateCustomRoute === 'function') {
        window.calculateCustomRoute(idsNovos);
      } else if (typeof window.calculateRouteWithWaypoints === 'function') {
        // Criar waypoints a partir dos IDs
        if (window.locations) {
          const waypoints = [];
          
          // Adicionar origem
          const origem = window.locations.find(loc => loc.isOrigin);
          if (origem) waypoints.push(origem);
          
          // Adicionar destinos na nova ordem
          for (const id of idsNovos) {
            const loc = window.locations.find(l => String(l.id) === String(id));
            if (loc) waypoints.push(loc);
          }
          
          if (waypoints.length >= 2) {
            window.calculateRouteWithWaypoints(waypoints);
          }
        }
      }
    }
  }
  
  // Eventos de drag and drop
  function iniciarArrasto(e) {
    this.classList.add('github-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
  }
  
  function finalizarArrasto() {
    this.classList.remove('github-dragging');
  }
  
  function sobreArrasto(e) {
    e.preventDefault();
    const itemArrastado = document.querySelector('.github-dragging');
    
    if (!itemArrastado) return;
    
    // Verifica se o item arrastado é filho deste container
    // Se não for, é porque pode estar tentando arrastar entre containers diferentes
    if (!this.contains(itemArrastado) && itemArrastado.parentNode) {
      console.log('[Direct-Reorder] Item arrastado não é filho deste container');
      return;
    }
    
    try {
      const elementoApos = getElementoApos(this, e.clientY);
      
      if (elementoApos) {
        // Verificar se o elemento alvo é diferente do elemento arrastado
        // e se o elemento arrastado não é pai do elemento alvo
        if (elementoApos !== itemArrastado && !itemArrastado.contains(elementoApos)) {
          this.insertBefore(itemArrastado, elementoApos);
        }
      } else {
        // Verificar se o item já não é o último filho para evitar operações desnecessárias
        if (this.lastChild !== itemArrastado) {
          this.appendChild(itemArrastado);
        }
      }
    } catch (error) {
      console.error('[Direct-Reorder] Erro ao reordenar:', error);
    }
  }
  
  function soltarItem(e) {
    e.preventDefault();
  }
  
  function getElementoApos(container, y) {
    const itens = Array.from(container.querySelectorAll('.github-drag:not(.github-dragging)'));
    
    return itens.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  function recalcularRota(ids) {
    // Verificar APIs disponíveis
    if (window.directionsService && window.directionsRenderer) {
      // Se temos acesso à array locations
      if (window.locations) {
        const waypoints = [];
        
        // Adicionar origem
        const origem = window.locations.find(loc => loc.isOrigin);
        if (origem) {
          waypoints.push(origem);
        }
        
        // Adicionar outros pontos na ordem dos IDs
        for (const id of ids) {
          const loc = window.locations.find(l => !l.isOrigin && String(l.id) === String(id));
          if (loc) {
            waypoints.push(loc);
          }
        }
        
        console.log('[Direct-Reorder] Waypoints para rota:', waypoints);
        
        if (waypoints.length < 2) {
          alert('Não há destinos suficientes para calcular a rota.');
          return;
        }
        
        // Limpar rota anterior
        window.directionsRenderer.setDirections({routes: []});
        
        // Configurar requisição
        const origemPonto = new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng);
        const destinoPonto = new google.maps.LatLng(
          waypoints[waypoints.length - 1].lat, 
          waypoints[waypoints.length - 1].lng
        );
        
        // Pontos intermediários
        const waypointsArray = waypoints.slice(1, -1).map(wp => ({
          location: new google.maps.LatLng(wp.lat, wp.lng),
          stopover: true
        }));
        
        const request = {
          origin: origemPonto,
          destination: destinoPonto,
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
            
            // Atualizar informações
            atualizarInformacoesRota(distanceKm, durationMinutes, waypoints);
            
            alert('Rota atualizada com a nova ordem!');
          } else {
            console.error('[Direct-Reorder] Erro ao calcular rota:', status);
            alert('Erro ao calcular rota. Verifique o console para detalhes.');
          }
        });
      } else {
        console.log('[Direct-Reorder] Array locations não encontrada');
        alert('Reordenação concluída. Nova ordem salva.');
      }
    } else {
      console.log('[Direct-Reorder] APIs do Google Maps não disponíveis');
      alert('Reordenação concluída.');
    }
  }
  
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