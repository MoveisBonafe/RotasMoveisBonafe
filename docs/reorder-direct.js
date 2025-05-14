// Script direto para incluir no HTML sem dependências externas

// Função para adicionar o botão e a funcionalidade de reordenação
function adicionarFuncionalidadeReordenar() {
  console.log("Adicionando funcionalidade de reordenação...");
  
  // Verificar se já existe o botão
  if (document.getElementById('btn-reordenar')) {
    return;
  }
  
  // Encontrar o botão de otimizar rota
  const btnOtimizar = document.getElementById('optimize-route');
  if (!btnOtimizar) {
    console.log("Botão de otimizar não encontrado, tentando novamente em 1s");
    setTimeout(adicionarFuncionalidadeReordenar, 1000);
    return;
  }
  
  // Criar o botão de reordenação
  const btnReordenar = document.createElement('button');
  btnReordenar.id = 'btn-reordenar';
  btnReordenar.className = 'btn btn-secondary w-100';
  btnReordenar.style.marginTop = '10px';
  btnReordenar.style.marginBottom = '10px';
  btnReordenar.textContent = 'Reordenar Destinos';
  
  // Adicionar após o botão de otimizar
  if (btnOtimizar.nextSibling) {
    btnOtimizar.parentNode.insertBefore(btnReordenar, btnOtimizar.nextSibling);
  } else {
    btnOtimizar.parentNode.appendChild(btnReordenar);
  }
  
  // Adicionar estilos CSS
  const estilos = document.createElement('style');
  estilos.textContent = `
    .btn-reordenar-ativo {
      background-color: #ffc107 !important;
      border-color: #ffab00 !important;
      color: #000 !important;
    }
    .btn-seta {
      display: inline-block;
      margin-right: 5px;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 22px;
      border: 1px solid #ffc107;
      border-radius: 3px;
      background-color: transparent;
      color: #ffc107;
      cursor: pointer;
    }
    .btn-seta:hover {
      background-color: #fff8e1;
    }
    .controles-item {
      display: inline-block;
      margin-right: 10px;
    }
  `;
  document.head.appendChild(estilos);
  
  // Flag para controlar o estado de reordenação
  let modoReordenacao = false;
  
  // Evento de clique no botão
  btnReordenar.addEventListener('click', function() {
    modoReordenacao = !modoReordenacao;
    
    // Lista de destinos
    const listaDest = document.getElementById('destinations-list');
    if (!listaDest) {
      alert('Lista de destinos não encontrada!');
      return;
    }
    
    if (modoReordenacao) {
      // Ativar modo de reordenação
      btnReordenar.classList.add('btn-reordenar-ativo');
      btnReordenar.textContent = 'Concluir Reordenação';
      
      // Adicionar botões de reordenação a cada item
      const items = listaDest.querySelectorAll('li');
      
      items.forEach(function(item) {
        // Verificar se já tem controles
        if (item.querySelector('.controles-item')) {
          return;
        }
        
        // Criar div de controles
        const controles = document.createElement('div');
        controles.className = 'controles-item';
        
        // Botão para cima
        const btnCima = document.createElement('button');
        btnCima.type = 'button';
        btnCima.className = 'btn-seta';
        btnCima.innerHTML = '&uarr;';
        btnCima.title = 'Mover para cima';
        
        // Botão para baixo
        const btnBaixo = document.createElement('button');
        btnBaixo.type = 'button';
        btnBaixo.className = 'btn-seta';
        btnBaixo.innerHTML = '&darr;';
        btnBaixo.title = 'Mover para baixo';
        
        // Adicionar botões ao controle
        controles.appendChild(btnCima);
        controles.appendChild(btnBaixo);
        
        // Adicionar controles ao início do item
        if (item.firstChild) {
          item.insertBefore(controles, item.firstChild);
        } else {
          item.appendChild(controles);
        }
        
        // Eventos para os botões
        btnCima.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const li = this.closest('li');
          const prev = li.previousElementSibling;
          
          if (prev) {
            listaDest.insertBefore(li, prev);
            atualizarRotaComOrdemPersonalizada();
          }
        });
        
        btnBaixo.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const li = this.closest('li');
          const next = li.nextElementSibling;
          
          if (next) {
            listaDest.insertBefore(next, li);
            atualizarRotaComOrdemPersonalizada();
          }
        });
      });
      
      alert('Modo de reordenação ativado. Use as setas para reordenar os destinos.');
      
    } else {
      // Desativar modo de reordenação
      btnReordenar.classList.remove('btn-reordenar-ativo');
      btnReordenar.textContent = 'Reordenar Destinos';
      
      // Remover os controles
      const controles = listaDest.querySelectorAll('.controles-item');
      controles.forEach(function(c) {
        c.remove();
      });
      
      // Atualizar a rota
      atualizarRotaComOrdemPersonalizada();
      
      alert('Rota atualizada com a ordem personalizada.');
    }
  });
  
  console.log("Botão de reordenação adicionado com sucesso!");
}

// Função para atualizar a rota com base na ordem personalizada
function atualizarRotaComOrdemPersonalizada() {
  console.log("Atualizando rota com ordem personalizada...");
  
  // Verificar se temos os objetos necessários
  if (!window.directionsService || !window.directionsRenderer || !window.locations) {
    console.error("Objetos necessários não disponíveis para cálculo de rota");
    return;
  }
  
  // Obter a lista de destinos
  const listaDest = document.getElementById('destinations-list');
  if (!listaDest) return;
  
  // Coletar IDs na ordem atual
  const itens = listaDest.querySelectorAll('li');
  const ids = [];
  
  itens.forEach(function(item) {
    const id = item.getAttribute('data-id');
    if (id) {
      ids.push(id);
    }
  });
  
  if (ids.length < 1) {
    console.log("Não há destinos suficientes");
    return;
  }
  
  // Obter origem
  const origem = window.locations.find(loc => loc.isOrigin);
  if (!origem) {
    console.error("Origem não encontrada");
    return;
  }
  
  // Montar array de waypoints na ordem personalizada
  const waypoints = [];
  waypoints.push(origem); // Adicionar origem primeiro
  
  // Adicionar destinos na ordem dos IDs
  for (const id of ids) {
    const location = window.locations.find(loc => !loc.isOrigin && String(loc.id) === String(id));
    if (location) {
      waypoints.push(location);
    }
  }
  
  if (waypoints.length < 2) {
    console.log("Não há waypoints suficientes para uma rota");
    return;
  }
  
  // Limpar rotas anteriores
  window.directionsRenderer.setDirections({routes: []});
  
  // Configurar waypoints para Google Maps
  const gmWaypoints = waypoints.slice(1, -1).map(wp => ({
    location: new google.maps.LatLng(wp.lat, wp.lng),
    stopover: true
  }));
  
  // Origem e destino
  const gmOrigin = new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng);
  const gmDestination = new google.maps.LatLng(
    waypoints[waypoints.length - 1].lat,
    waypoints[waypoints.length - 1].lng
  );
  
  // Configuração da rota
  const request = {
    origin: gmOrigin,
    destination: gmDestination,
    waypoints: gmWaypoints,
    optimizeWaypoints: false, // Não otimizar, usar nossa ordem
    travelMode: google.maps.TravelMode.DRIVING
  };
  
  // Calcular a rota
  window.directionsService.route(request, function(result, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      window.directionsRenderer.setDirections(result);
      
      // Calcular distância total
      let totalDist = 0;
      const legs = result.routes[0].legs;
      
      legs.forEach(function(leg) {
        totalDist += leg.distance.value;
      });
      
      // Converter para km
      const distKm = (totalDist / 1000).toFixed(1);
      
      // Calcular tempo (usando 80 km/h)
      const tempoMin = Math.ceil(totalDist / 1000 / 80 * 60);
      
      // Atualizar informações da rota
      const routeInfo = document.getElementById('route-info');
      if (routeInfo) {
        routeInfo.style.display = 'block';
      }
      
      // Atualizar detalhes
      const detalhes = document.getElementById('route-details');
      if (detalhes) {
        const horas = Math.floor(tempoMin / 60);
        const minutos = tempoMin % 60;
        const textoTempo = horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
        
        detalhes.innerHTML = `
          <p><strong>Distância Total:</strong> ${distKm} km</p>
          <p><strong>Tempo Estimado:</strong> ${textoTempo}</p>
          <p><strong>Velocidade Média:</strong> 80 km/h</p>
        `;
      }
      
      // Atualizar sequência
      const sequencia = document.getElementById('route-sequence');
      if (sequencia) {
        sequencia.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
        
        waypoints.forEach(function(loc, idx) {
          const item = document.createElement('div');
          item.className = 'sequence-item';
          item.innerHTML = `
            <span class="sequence-number">${idx}</span>
            <span class="sequence-name">${loc.name}</span>
          `;
          sequencia.appendChild(item);
        });
      }
      
      console.log("Rota personalizada calculada com sucesso");
    } else {
      console.error("Erro ao calcular rota:", status);
      alert("Erro ao calcular rota personalizada: " + status);
    }
  });
}

// Inicializar após o carregamento da página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', adicionarFuncionalidadeReordenar);
} else {
  adicionarFuncionalidadeReordenar();
}

// Tentar adicionar múltiplas vezes para garantir
setTimeout(adicionarFuncionalidadeReordenar, 1000);
setTimeout(adicionarFuncionalidadeReordenar, 2000);
setTimeout(adicionarFuncionalidadeReordenar, 5000);