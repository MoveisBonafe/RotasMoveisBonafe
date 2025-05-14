/**
 * Script que força a remoção de botões de reordenação e implementa a reordenação sempre ativa
 * Versão 3.0
 */
(function() {
  console.log('[ForceReorder] Iniciando...');
  
  // Inicializar e também verificar periodicamente
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Verificar frequentemente para garantir que o botão não seja recriado
  setInterval(removerBotoes, 1000);
  
  // Manter essas variáveis no escopo global
  window.reordenacaoAtiva = true;
  
  /**
   * Função de inicialização
   */
  function inicializar() {
    console.log('[ForceReorder] Inicializando...');
    
    // Adicionar estilos
    adicionarEstilos();
    
    // Remover botões desnecessários
    removerBotoes();
    
    // Adicionar botão de rota personalizada
    adicionarBotaoCalcular();
    
    // Ativar a funcionalidade de drag and drop
    setTimeout(ativarDragDrop, 1000);
    setTimeout(ativarDragDrop, 2000);
    setTimeout(ativarDragDrop, 4000);
  }
  
  /**
   * Função para adicionar estilos CSS
   */
  function adicionarEstilos() {
    // Verificar se os estilos já foram adicionados
    if (document.getElementById('force-reorder-styles')) {
      return;
    }
    
    const estilos = document.createElement('style');
    estilos.id = 'force-reorder-styles';
    estilos.textContent = `
      .reordenavel {
        cursor: grab !important;
        position: relative !important;
        padding-left: 30px !important;
        margin-bottom: 5px !important;
        transition: all 0.2s ease;
        background-color: #fff !important;
        border-left: 3px solid #ffc107 !important;
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
      
      #botao-calcular-rota-personalizada {
        display: block;
        width: 100%;
        background-color: #ffc107;
        color: #000;
        font-weight: bold;
        padding: 10px;
        margin: 10px 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      #botao-calcular-rota-personalizada:hover {
        background-color: #ffb300;
      }
    `;
    
    document.head.appendChild(estilos);
    console.log('[ForceReorder] Estilos adicionados');
  }
  
  /**
   * Função para remover botões de reordenação e substituir pelo nosso
   */
  function removerBotoes() {
    // Botões para remover (apenas IDs)
    const botoesRemover = [
      // IDs
      '#botao-reordenar-direto',
      '#botao-reordenar-github',
      '#custom-route',
      '#custom-route-btn',
      '#ativar-reordenacao',
      '#reordenar-btn'
    ];
    
    // O jQuery não está disponível, então vamos implementar contains
    document.querySelectorAll('button').forEach(btn => {
      if (btn.id === 'botao-calcular-rota-personalizada') {
        return; // Não remover nosso próprio botão
      }
      
      if (btn.textContent && (
          btn.textContent.includes('Ativar Reordenação') ||
          btn.textContent.includes('Ativar reordenação') ||
          btn.textContent.includes('Reordenar')
      )) {
        console.log('[ForceReorder] Removendo botão:', btn.textContent);
        btn.parentNode && btn.parentNode.removeChild(btn);
      }
    });
    
    // Tentar pelos IDs
    botoesRemover.forEach(seletor => {
      if (seletor.startsWith('#')) {
        const el = document.getElementById(seletor.substring(1));
        if (el) {
          console.log('[ForceReorder] Removendo pelo ID:', seletor);
          el.parentNode && el.parentNode.removeChild(el);
        }
      }
    });
  }
  
  /**
   * Função para adicionar botão de calcular rota personalizada
   */
  function adicionarBotaoCalcular() {
    // Verificar se o botão já existe
    if (document.getElementById('botao-calcular-rota-personalizada')) {
      return;
    }
    
    // Tenta localizar o botão Otimizar Rota
    let botaoOtimizar = document.querySelector('button.btn-warning, #optimize-route');
    
    // Se não encontrou, tentar encontrar por texto
    if (!botaoOtimizar) {
      const botoes = document.querySelectorAll('button');
      for (const btn of botoes) {
        if (btn.textContent && btn.textContent.includes('Otimizar')) {
          botaoOtimizar = btn;
          break;
        }
      }
    }
    
    if (!botaoOtimizar) {
      console.log('[ForceReorder] Botão otimizar não encontrado');
      return;
    }
    
    // Criar o botão
    const botao = document.createElement('button');
    botao.id = 'botao-calcular-rota-personalizada';
    botao.className = botaoOtimizar.className || 'btn btn-warning btn-block';
    botao.textContent = 'Calcular Rota Personalizada';
    botao.addEventListener('click', calcularRotaPersonalizada);
    
    // Inserir após o botão otimizar
    if (botaoOtimizar.parentNode) {
      botaoOtimizar.parentNode.insertBefore(botao, botaoOtimizar.nextSibling);
      console.log('[ForceReorder] Botão de calcular rota personalizada adicionado');
    }
  }
  
  /**
   * Função para ativar drag and drop
   */
  function ativarDragDrop() {
    // Encontrar o container
    const containerLocais = encontrarContainerLocais();
    
    if (!containerLocais) {
      console.log('[ForceReorder] Container de locais não encontrado');
      return;
    }
    
    console.log('[ForceReorder] Container de locais encontrado:', containerLocais);
    
    // Processar os itens existentes
    processarItens(containerLocais);
    
    // Adicionar observer para novos itens
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          processarItens(containerLocais);
        }
      });
    });
    
    observer.observe(containerLocais, { 
      childList: true, 
      subtree: true 
    });
    
    // Adicionar eventos no container
    containerLocais.removeEventListener('dragover', handleDragOver);
    containerLocais.removeEventListener('drop', handleDrop);
    
    containerLocais.addEventListener('dragover', handleDragOver);
    containerLocais.addEventListener('drop', handleDrop);
    
    console.log('[ForceReorder] Drag and drop ativado');
  }
  
  /**
   * Função para encontrar o container de locais
   */
  function encontrarContainerLocais() {
    // Tentar diversas estratégias para encontrar o container
    
    // 1. Tentar pelo ID ou classes comuns
    const containerSelector = [
      '.locations-list',
      '#locations-list',
      '.location-list',
      '.destinos-container',
      '#destinos-container'
    ];
    
    for (const selector of containerSelector) {
      const container = document.querySelector(selector);
      if (container) {
        return container;
      }
    }
    
    // 2. Tentar encontrar pela frase "Locais adicionados:"
    const titulos = document.querySelectorAll('h3, h4, h5, div, p, label, span');
    for (const titulo of titulos) {
      if (titulo.textContent && titulo.textContent.includes('Locais adicionados')) {
        // Verificar próximo elemento
        if (titulo.nextElementSibling) {
          return titulo.nextElementSibling;
        }
        
        // Verificar pai
        if (titulo.parentElement) {
          // Verificar filhos do pai
          const filhosPai = titulo.parentElement.children;
          for (let i = 0; i < filhosPai.length; i++) {
            if (filhosPai[i] === titulo && i + 1 < filhosPai.length) {
              return filhosPai[i + 1];
            }
          }
          
          // Se não encontrou, retornar o pai
          return titulo.parentElement;
        }
      }
    }
    
    // 3. Procurar elementos com classe contendo "location"
    const elementsWithLocation = document.querySelectorAll('[class*="location"]');
    for (const el of elementsWithLocation) {
      // Verificar se tem itens dentro
      if (el.innerHTML.includes('data-id') || el.innerHTML.includes('badge')) {
        return el;
      }
    }
    
    // 4. Procurar elementos com data-id
    const elementsWithDataId = document.querySelectorAll('[data-id]');
    if (elementsWithDataId.length > 0) {
      // Encontrar o pai comum
      return elementsWithDataId[0].parentElement;
    }
    
    return null;
  }
  
  /**
   * Função para processar os itens do container
   */
  function processarItens(container) {
    console.log('[ForceReorder] Processando itens do container');
    
    // Verificar se tem itens com data-id
    const itens = container.querySelectorAll('[data-id]');
    
    if (itens.length > 0) {
      console.log('[ForceReorder] Encontrados', itens.length, 'itens para configurar');
      
      itens.forEach(item => {
        // Verificar se já foi processado
        if (item.hasAttribute('draggable') && item.classList.contains('reordenavel')) {
          return;
        }
        
        // Adicionar classes e atributos
        item.classList.add('reordenavel');
        item.setAttribute('draggable', 'true');
        
        // Remover eventos anteriores para evitar duplicação
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
        
        // Adicionar eventos
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
      });
    } else {
      console.log('[ForceReorder] Nenhum item com data-id encontrado, tentando extrair do HTML');
      
      // Tentar extrair os itens pelo HTML
      const regex = /<div[^>]*class="[^"]*location-item[^"]*"[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/div>/g;
      const html = container.innerHTML;
      
      let match;
      let encontrouAlgum = false;
      
      // Substituir no HTML
      const novoHTML = html.replace(regex, (match, id, conteudo) => {
        encontrouAlgum = true;
        return `<div class="location-item reordenavel" data-id="${id}" draggable="true">${conteudo}</div>`;
      });
      
      if (encontrouAlgum) {
        console.log('[ForceReorder] Atualizando HTML do container com itens arrastáveis');
        container.innerHTML = novoHTML;
        
        // Adicionar eventos aos novos elementos
        const novosItens = container.querySelectorAll('.reordenavel');
        novosItens.forEach(item => {
          item.addEventListener('dragstart', handleDragStart);
          item.addEventListener('dragend', handleDragEnd);
        });
      }
    }
  }
  
  /**
   * Manipuladores de eventos de arrastar e soltar
   */
  function handleDragStart(e) {
    this.classList.add('arrastando');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
  }
  
  function handleDragEnd(e) {
    this.classList.remove('arrastando');
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const arrastando = document.querySelector('.arrastando');
    
    if (!arrastando) return;
    
    const elementoApos = getElementoApos(this, e.clientY);
    
    if (elementoApos) {
      this.insertBefore(arrastando, elementoApos);
    } else {
      this.appendChild(arrastando);
    }
  }
  
  function handleDrop(e) {
    e.preventDefault();
    console.log('[ForceReorder] Item solto');
  }
  
  /**
   * Função auxiliar para determinar depois de qual elemento inserir
   */
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
  
  /**
   * Função para calcular rota personalizada
   */
  function calcularRotaPersonalizada() {
    console.log('[ForceReorder] Calculando rota personalizada...');
    
    // Encontrar o container
    const container = encontrarContainerLocais();
    
    if (!container) {
      alert('Erro: Não foi possível encontrar a lista de destinos.');
      return;
    }
    
    // Coletar IDs na ordem atual
    const ids = [];
    const itensOrdenados = container.querySelectorAll('.reordenavel, [data-id]');
    
    if (itensOrdenados.length === 0) {
      alert('Adicione pelo menos um destino para calcular a rota.');
      return;
    }
    
    itensOrdenados.forEach(item => {
      const id = item.getAttribute('data-id');
      if (id) ids.push(id);
    });
    
    console.log('[ForceReorder] IDs coletados:', ids);
    
    // Verificar se temos acesso às APIs do Google Maps
    if (!window.google || !window.google.maps || !window.directionsService) {
      console.error('[ForceReorder] APIs do Google Maps não disponíveis');
      alert('Erro: Serviço de direções não está disponível.');
      return;
    }
    
    // Verificar se temos a lista de locais
    if (!window.locations || !Array.isArray(window.locations)) {
      console.error('[ForceReorder] Array locations não disponível');
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
      console.error('[ForceReorder] Origem não encontrada');
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
    
    console.log('[ForceReorder] Calculando rota com waypoints:', waypoints);
    
    // Limpar rota anterior
    if (window.directionsRenderer) {
      window.directionsRenderer.setDirections({routes: []});
    }
    
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
        console.log('[ForceReorder] Rota calculada com sucesso');
        
        // Renderizar rota no mapa
        if (window.directionsRenderer) {
          window.directionsRenderer.setDirections(result);
        }
        
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
        console.error('[ForceReorder] Erro ao calcular rota:', status);
        alert('Erro ao calcular a rota. Tente novamente.');
      }
    });
  }
  
  /**
   * Função para atualizar informações da rota na interface
   */
  function atualizarInfoRota(distanciaKm, duracaoMinutos, waypoints) {
    // Tentar encontrar o elemento de informações da rota
    const routeInfo = document.getElementById('route-info');
    if (!routeInfo) {
      console.log('[ForceReorder] Elemento route-info não encontrado');
      return;
    }
    
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
})();