/**
 * Script de reordenação sempre ativo
 * Versão 2.0 - Completamente reescrita
 */
(function() {
  console.log('[AlwaysReorder] Iniciando script de reordenação sempre ativa...');
  
  // Carregar quando estiver pronto
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Também carregar após aguardar um pouco
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 4000);
  
  // Váriáveis
  let botaoCalcular = null;
  let reordenacaoAtivada = false;
  
  // Função principal de inicialização
  function inicializar() {
    // Verificar se já inicializou para evitar duplicação
    if (document.getElementById('botao-calcular-rota')) {
      console.log('[AlwaysReorder] Script já inicializado');
      return;
    }
    
    console.log('[AlwaysReorder] Inicializando script...');
    
    // Remover qualquer botão antigo primeiro
    removerBotoesAntigos();
    
    // Adicionar estilos
    adicionarEstilos();
    
    // Encontrar o botão de otimizar rota
    const botaoOtimizar = document.querySelector('#optimize-route, button.btn-warning');
    if (!botaoOtimizar) {
      console.log('[AlwaysReorder] Botão otimizar não encontrado, tentando novamente depois...');
      return;
    }
    
    // Criar botão de calcular rota
    botaoCalcular = document.createElement('button');
    botaoCalcular.id = 'botao-calcular-rota';
    botaoCalcular.className = 'btn btn-warning btn-block';
    botaoCalcular.style.backgroundColor = '#ffc107';
    botaoCalcular.style.color = '#000';
    botaoCalcular.style.fontWeight = 'bold';
    botaoCalcular.style.width = '100%';
    botaoCalcular.style.marginTop = '10px';
    botaoCalcular.style.marginBottom = '10px';
    botaoCalcular.textContent = 'Calcular Rota Personalizada';
    botaoCalcular.addEventListener('click', calcularRotaPersonalizada);
    
    // Adicionar após o botão original
    botaoOtimizar.parentNode.insertBefore(botaoCalcular, botaoOtimizar.nextSibling);
    
    console.log('[AlwaysReorder] Botão adicionado');
    
    // Ativar a reordenação automaticamente
    ativarReordenacao();
  }
  
  // Remover botões antigos (para evitar duplicação)
  function removerBotoesAntigos() {
    const botoesAntigos = document.querySelectorAll('#botao-reordenar-direto, #botao-reordenar-github, #custom-route, #custom-route-btn');
    botoesAntigos.forEach(btn => {
      console.log('[AlwaysReorder] Removendo botão antigo:', btn.id || btn.textContent);
      btn.remove();
    });
  }
  
  // Adicionar estilos CSS
  function adicionarEstilos() {
    const estilo = document.createElement('style');
    estilo.textContent = `
      .reordenavel {
        cursor: grab !important;
        position: relative !important;
        border-left: 3px solid #ffc107 !important;
        padding-left: 30px !important;
        margin-bottom: 5px !important;
        transition: background-color 0.2s ease;
      }
      
      .reordenavel::before {
        content: "≡";
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #ffc107;
        font-weight: bold;
        font-size: 18px;
      }
      
      .reordenavel:hover {
        background-color: #FFF8E1 !important;
      }
      
      .arrastando {
        opacity: 0.7;
        background-color: #FFF8E1;
        border: 2px dashed #ffc107;
      }
    `;
    document.head.appendChild(estilo);
  }
  
  // Ativar a reordenação
  function ativarReordenacao() {
    if (reordenacaoAtivada) {
      console.log('[AlwaysReorder] Reordenação já está ativa');
      return;
    }
    
    console.log('[AlwaysReorder] Ativando reordenação...');
    
    // Encontrar o container de destinos
    const container = encontrarContainerDestinos();
    if (!container) {
      console.log('[AlwaysReorder] Container de destinos não encontrado, tentando novamente depois...');
      setTimeout(ativarReordenacao, 1000);
      return;
    }
    
    console.log('[AlwaysReorder] Container de destinos encontrado:', container);
    
    // Processar os itens atuais
    processarItensDestino(container);
    
    // Adicionar MutationObserver para processar novos itens automaticamente
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          console.log('[AlwaysReorder] Detectada adição de novos nós, processando...');
          processarItensDestino(container);
        }
      });
    });
    
    // Configurar o observer
    observer.observe(container, { childList: true, subtree: true });
    
    // Marcar como ativado
    reordenacaoAtivada = true;
  }
  
  // Função para encontrar o container de destinos
  function encontrarContainerDestinos() {
    // Tentar vários seletores para encontrar o container
    const seletores = [
      '.locations-list', 
      '.location-list', 
      '#locations-list',
      '.destinations-list',
      '#destinations-list',
      '[class*="location"]'
    ];
    
    for (const seletor of seletores) {
      const elementos = document.querySelectorAll(seletor);
      
      for (const el of elementos) {
        // Verificar se parece ser o container certo
        if (el.innerHTML.includes('data-id') || 
            el.innerHTML.includes('badge') ||
            el.innerHTML.toLowerCase().includes('location-item')) {
          return el;
        }
      }
    }
    
    // Se não encontrou nada, logar informações de debug
    logHTMLDebug();
    
    return null;
  }
  
  // Função para processar os itens no container
  function processarItensDestino(container) {
    console.log('[AlwaysReorder] Processando itens no container...');
    
    // Obter HTML atual
    const html = container.innerHTML;
    
    // Extrair itens com regex
    const regex = /<div[^>]*class="location-item"[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/div>/g;
    const destinos = [];
    let match;
    
    while (match = regex.exec(html)) {
      const id = match[1];
      const conteudoHTML = match[0];
      
      if (id && conteudoHTML) {
        destinos.push({ id, html: conteudoHTML });
      }
    }
    
    console.log('[AlwaysReorder] Destinos encontrados:', destinos.length);
    
    if (destinos.length === 0) {
      // Se não encontrou com regex, tentar elementos DOM
      const itens = container.querySelectorAll('[data-id]');
      console.log('[AlwaysReorder] Elementos com data-id:', itens.length);
      
      if (itens.length === 0) {
        return;
      }
      
      // Tentar configurar os itens diretamente
      itens.forEach(item => {
        if (!item.classList.contains('reordenavel') && !item.hasAttribute('draggable')) {
          item.classList.add('reordenavel');
          item.setAttribute('draggable', 'true');
          item.addEventListener('dragstart', iniciarArrasto);
          item.addEventListener('dragend', finalizarArrasto);
        }
      });
    } else {
      // Modificar HTML para incluir classes e remover botões de remoção durante o arrasto
      const novoHTML = destinos.map(d => {
        return d.html.replace('location-item', 'location-item reordenavel')
                    .replace(/draggable="[^"]*"/g, 'draggable="true"');
      }).join('');
      
      // Atualizar o container
      container.innerHTML = novoHTML;
      
      // Adicionar eventos aos elementos
      const itensArrastaveis = container.querySelectorAll('.reordenavel');
      itensArrastaveis.forEach(item => {
        item.addEventListener('dragstart', iniciarArrasto);
        item.addEventListener('dragend', finalizarArrasto);
      });
    }
    
    // Adicionar eventos de arrasto ao container
    container.removeEventListener('dragover', sobreArrasto);
    container.removeEventListener('drop', soltarItem);
    container.addEventListener('dragover', sobreArrasto);
    container.addEventListener('drop', soltarItem);
  }
  
  // Eventos de arrasto
  function iniciarArrasto(e) {
    console.log('[AlwaysReorder] Iniciando arrasto');
    this.classList.add('arrastando');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
  }
  
  function finalizarArrasto() {
    console.log('[AlwaysReorder] Finalizando arrasto');
    this.classList.remove('arrastando');
  }
  
  function sobreArrasto(e) {
    e.preventDefault();
    const itemArrastado = document.querySelector('.arrastando');
    
    if (!itemArrastado) return;
    
    try {
      const elementoApos = getElementoApos(this, e.clientY);
      
      if (elementoApos && elementoApos !== itemArrastado) {
        // Verificar se o elemento não é filho do item arrastado
        if (!itemArrastado.contains(elementoApos)) {
          this.insertBefore(itemArrastado, elementoApos);
        }
      } else if (this.lastChild !== itemArrastado) {
        this.appendChild(itemArrastado);
      }
    } catch (error) {
      console.error('[AlwaysReorder] Erro ao reordenar:', error);
    }
  }
  
  function soltarItem(e) {
    e.preventDefault();
    console.log('[AlwaysReorder] Item solto');
  }
  
  // Calcular qual elemento vem depois baseado na posição Y
  function getElementoApos(container, y) {
    const elementosArrastaveis = [...container.querySelectorAll('.reordenavel:not(.arrastando)')];
    
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
  
  // Calcular rota personalizada
  function calcularRotaPersonalizada() {
    console.log('[AlwaysReorder] Calculando rota personalizada...');
    
    // Encontrar o container
    const container = encontrarContainerDestinos();
    if (!container) {
      alert('Erro: Não foi possível encontrar a lista de destinos.');
      return;
    }
    
    // Coletar IDs na ordem atual
    const ids = [];
    
    // Tentar com elementos arrastáveis
    const itensArrastaveis = container.querySelectorAll('.reordenavel');
    if (itensArrastaveis.length > 0) {
      itensArrastaveis.forEach(item => {
        const id = item.getAttribute('data-id');
        if (id) ids.push(id);
      });
    } else {
      // Tentar extrair do HTML
      const regex = /data-id="([^"]+)"/g;
      let match;
      while (match = regex.exec(container.innerHTML)) {
        ids.push(match[1]);
      }
    }
    
    console.log('[AlwaysReorder] IDs coletados:', ids);
    
    if (ids.length === 0) {
      alert('Adicione pelo menos um destino para calcular a rota.');
      return;
    }
    
    // Calcular rota usando a API do Google Maps
    calcularRota(ids);
  }
  
  // Função para calcular rota com os IDs coletados
  function calcularRota(ids) {
    if (!window.directionsService || !window.directionsRenderer) {
      console.error('[AlwaysReorder] directionsService ou directionsRenderer não disponíveis');
      alert('Erro: Serviço de direções não está disponível.');
      return;
    }
    
    if (!window.locations || !Array.isArray(window.locations)) {
      console.error('[AlwaysReorder] Array locations não disponível');
      alert('Erro: Dados de localização não estão disponíveis.');
      return;
    }
    
    // Construir waypoints
    const waypoints = [];
    
    // Adicionar origem
    const origem = window.locations.find(loc => loc.isOrigin);
    if (origem) {
      waypoints.push(origem);
    } else {
      console.error('[AlwaysReorder] Origem não encontrada');
      alert('Erro: Ponto de origem não encontrado.');
      return;
    }
    
    // Adicionar destinos na ordem dos IDs
    for (const id of ids) {
      const destino = window.locations.find(loc => !loc.isOrigin && String(loc.id) === String(id));
      if (destino) {
        waypoints.push(destino);
      }
    }
    
    if (waypoints.length < 2) {
      alert('É necessário pelo menos um destino além da origem para calcular a rota.');
      return;
    }
    
    console.log('[AlwaysReorder] Calculando rota com waypoints:', waypoints);
    
    // Limpar rota anterior
    window.directionsRenderer.setDirections({routes: []});
    
    // Configurar requisição
    const origem_ponto = new google.maps.LatLng(
      waypoints[0].lat,
      waypoints[0].lng
    );
    
    const destino_ponto = new google.maps.LatLng(
      waypoints[waypoints.length - 1].lat,
      waypoints[waypoints.length - 1].lng
    );
    
    // Pontos intermediários
    const waypointsArray = waypoints.slice(1, -1).map(wp => ({
      location: new google.maps.LatLng(wp.lat, wp.lng),
      stopover: true
    }));
    
    const request = {
      origin: origem_ponto,
      destination: destino_ponto,
      waypoints: waypointsArray,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING
    };
    
    // Calcular rota
    window.directionsService.route(request, function(result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        console.log('[AlwaysReorder] Rota calculada com sucesso');
        
        // Renderizar rota no mapa
        window.directionsRenderer.setDirections(result);
        
        // Calcular distância e duração
        let distanciaTotal = 0;
        const legs = result.routes[0].legs;
        
        for (let i = 0; i < legs.length; i++) {
          distanciaTotal += legs[i].distance.value;
        }
        
        // Converter para km
        const distanciaKm = (distanciaTotal / 1000).toFixed(1);
        
        // Calcular tempo (80 km/h)
        const duracaoMinutos = Math.ceil(distanciaKm / 80 * 60);
        
        // Atualizar informações na interface
        atualizarInfoRota(distanciaKm, duracaoMinutos, waypoints);
        
        alert('Rota personalizada calculada com sucesso!');
      } else {
        console.error('[AlwaysReorder] Erro ao calcular rota:', status);
        alert('Erro ao calcular a rota. Veja o console para detalhes.');
      }
    });
  }
  
  // Atualizar informações da rota na interface
  function atualizarInfoRota(distanciaKm, duracaoMinutos, waypoints) {
    const routeInfo = document.getElementById('route-info');
    if (!routeInfo) return;
    
    // Tornar visível
    routeInfo.style.display = 'block';
    
    // Atualizar detalhes
    const routeDetails = document.getElementById('route-details');
    if (routeDetails) {
      const horas = Math.floor(duracaoMinutos / 60);
      const minutos = duracaoMinutos % 60;
      
      routeDetails.innerHTML = `
        <p><strong>Distância Total:</strong> ${distanciaKm} km</p>
        <p><strong>Tempo Estimado:</strong> ${horas > 0 ? `${horas}h ` : ''}${minutos}min</p>
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
  
  // Log debug de HTML
  function logHTMLDebug() {
    console.log('[AlwaysReorder] Debug HTML:');
    
    // Procurar elementos que possam conter a lista de destinos
    console.log('[AlwaysReorder] Elementos com "location" no nome:');
    document.querySelectorAll('[class*="location"]').forEach((el, i) => {
      console.log(`Elemento ${i}:`, el.tagName, el.className);
      console.log('HTML:', el.innerHTML.substring(0, 100) + '...');
    });
    
    console.log('[AlwaysReorder] Elementos com data-id:');
    document.querySelectorAll('[data-id]').forEach((el, i) => {
      console.log(`Elemento ${i}:`, el.tagName, el.getAttribute('data-id'));
    });
  }
})();