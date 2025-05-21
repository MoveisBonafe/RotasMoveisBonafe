/**
 * Pegman Placement Optimization
 * 
 * Esta solução otimiza o posicionamento do Pegman (Street View) para que:
 * 1. Fique em uma posição mais acessível no mapa
 * 2. Tenha uma aparência mais integrada à interface
 * 3. Facilite o acesso ao Street View em pontos estratégicos
 */
(function() {
  console.log("[PegmanOptimizer] Iniciando otimização de posicionamento do Pegman");
  
  // Inicializar após carregamento completo do mapa
  setTimeout(inicializarOtimizacao, 2000);
  setTimeout(inicializarOtimizacao, 5000);
  setInterval(verificarEAtualizarPegman, 3000);
  
  /**
   * Função principal que inicia o processo de otimização
   */
  function inicializarOtimizacao() {
    console.log("[PegmanOptimizer] Inicializando otimização de posicionamento");
    
    // 1. Otimizar posição do controle no mapa
    otimizarPosicaoControle();
    
    // 2. Melhorar aparência visual
    melhorarAparenciaVisual();
    
    // 3. Implementar posicionamento estratégico para pontos de interesse
    implementarPosicionamentoEstrategico();
  }
  
  /**
   * Otimiza a posição do controle do Pegman no mapa
   */
  function otimizarPosicaoControle() {
    try {
      // Tentar usar a API nativa do Google Maps
      if (window.google && google.maps && window.map) {
        // Posicionar o Pegman no canto inferior direito para melhor acessibilidade
        window.map.setOptions({
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });
        console.log("[PegmanOptimizer] Posição do Pegman otimizada via API");
      }
    } catch (e) {
      console.warn("[PegmanOptimizer] Erro ao otimizar posição via API:", e);
      
      // Alternativa: manipular diretamente o DOM
      const pegmanControle = document.querySelector('.gm-svpc');
      if (pegmanControle) {
        // Remover do local atual
        const parent = pegmanControle.parentNode;
        if (parent) {
          parent.removeChild(pegmanControle);
          
          // Criar novo container no canto inferior direito
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.bottom = '100px';
          container.style.right = '10px';
          container.style.zIndex = '1000';
          
          // Adicionar o controle ao novo container
          container.appendChild(pegmanControle);
          
          // Adicionar o container ao mapa
          document.querySelector('#map').appendChild(container);
          
          console.log("[PegmanOptimizer] Posição do Pegman otimizada via DOM");
        }
      }
    }
  }
  
  /**
   * Melhora a aparência visual do Pegman
   */
  function melhorarAparenciaVisual() {
    // Adicionar estilos para melhorar a aparência do Pegman
    const estilos = document.createElement('style');
    estilos.textContent = `
      /* Estilizar o controle do Pegman */
      .gm-svpc {
        background-color: #FFF8E1 !important;
        border-radius: 50% !important;
        border: 2px solid #FFA500 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
        transition: all 0.3s ease !important;
      }
      
      /* Efeito hover */
      .gm-svpc:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
        background-color: #FFE0B2 !important;
      }
      
      /* Quando o Pegman estiver ativo/arrastando */
      .gm-svpc.dragging {
        background-color: #FFCC80 !important;
        transform: scale(1.2) !important;
      }
    `;
    document.head.appendChild(estilos);
    
    // Tentar adicionar classe personalizada ao Pegman
    setTimeout(() => {
      const pegmanControle = document.querySelector('.gm-svpc');
      if (pegmanControle) {
        pegmanControle.classList.add('pegman-otimizado');
        pegmanControle.setAttribute('title', 'Arraste para explorar no Street View');
        
        // Adicionar evento para detectar quando o Pegman estiver sendo arrastado
        pegmanControle.addEventListener('mousedown', () => {
          pegmanControle.classList.add('dragging');
        });
        
        // Remover classe quando o Pegman for solto
        document.addEventListener('mouseup', () => {
          pegmanControle.classList.remove('dragging');
        });
        
        console.log("[PegmanOptimizer] Aparência do Pegman melhorada");
      }
    }, 1000);
  }
  
  /**
   * Implementa posicionamento estratégico para o Pegman
   * em pontos de interesse no mapa
   */
  function implementarPosicionamentoEstrategico() {
    try {
      // Verificar se temos acesso à API do Street View
      if (window.google && google.maps && google.maps.StreetViewService) {
        console.log("[PegmanOptimizer] API do Street View disponível");
        
        // Instanciar o serviço de Street View
        const streetViewService = new google.maps.StreetViewService();
        
        // Obter localizações no mapa
        const localizacoes = obterLocalizacoes();
        
        if (localizacoes.length > 0) {
          console.log("[PegmanOptimizer] Verificando disponibilidade de Street View para", localizacoes.length, "localizações");
          
          // Para cada localização, verificar se há cobertura do Street View
          localizacoes.forEach((local, index) => {
            setTimeout(() => {
              verificarCoberturaStreetView(streetViewService, local);
            }, index * 1000); // Espaçar as consultas para evitar sobrecarga
          });
        }
      }
    } catch (e) {
      console.warn("[PegmanOptimizer] Erro ao implementar posicionamento estratégico:", e);
    }
  }
  
  /**
   * Obtem as localizações do mapa
   */
  function obterLocalizacoes() {
    const localizacoes = [];
    
    // Tentar obter localizações dos marcadores
    if (window.markers && Array.isArray(window.markers)) {
      window.markers.forEach(marker => {
        if (marker && marker.position) {
          localizacoes.push({
            lat: marker.position.lat(),
            lng: marker.position.lng(),
            nome: marker.title || "Sem nome"
          });
        }
      });
    }
    
    // Se não encontrou nos marcadores, tentar obter da lista de localizações
    if (localizacoes.length === 0 && window.locations && Array.isArray(window.locations)) {
      window.locations.forEach(local => {
        if (local && local.latitude && local.longitude) {
          localizacoes.push({
            lat: local.latitude,
            lng: local.longitude,
            nome: local.name || "Sem nome"
          });
        }
      });
    }
    
    // Se ainda não tiver localizações, verificar no DOM
    if (localizacoes.length === 0) {
      // Tentar obter da lista de localizações no DOM
      document.querySelectorAll('.location-item').forEach(item => {
        // Extrair latitude e longitude
        const texto = item.textContent || '';
        const coordMatch = texto.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        
        if (coordMatch && coordMatch.length === 3) {
          localizacoes.push({
            lat: parseFloat(coordMatch[1]),
            lng: parseFloat(coordMatch[2]),
            nome: texto.split('\n')[0].trim() || "Local sem nome"
          });
        }
      });
    }
    
    return localizacoes;
  }
  
  /**
   * Verifica se há cobertura de Street View para uma localização
   */
  function verificarCoberturaStreetView(streetViewService, local) {
    // Definir raio de busca (50 metros)
    const RAIO_BUSCA = 50;
    
    // Verificar se há panoramas do Street View próximos
    streetViewService.getPanorama({
      location: {lat: local.lat, lng: local.lng},
      radius: RAIO_BUSCA,
      source: google.maps.StreetViewSource.OUTDOOR
    }, (data, status) => {
      if (status === google.maps.StreetViewStatus.OK) {
        console.log(`[PegmanOptimizer] ✓ Cobertura de Street View encontrada para ${local.nome}`);
        
        // Adicionar indicador visual na interface
        adicionarIndicadorStreetView(local, data.location);
      } else {
        console.log(`[PegmanOptimizer] ✗ Sem cobertura de Street View para ${local.nome}`);
      }
    });
  }
  
  /**
   * Adiciona um indicador visual mostrando onde há Street View disponível
   */
  function adicionarIndicadorStreetView(local, panoramaLocation) {
    try {
      // Se temos acesso à API do mapa
      if (window.google && google.maps && window.map) {
        // Criar ícone personalizado
        const icone = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#FFA500" fill-opacity="0.7" />
              <circle cx="12" cy="12" r="6" fill="#FFFFFF" />
              <circle cx="12" cy="12" r="3" fill="#FFA500" />
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        };
        
        // Criar marcador no local do panorama
        const marker = new google.maps.Marker({
          position: {
            lat: panoramaLocation.latLng.lat(),
            lng: panoramaLocation.latLng.lng()
          },
          map: window.map,
          icon: icone,
          title: `Street View disponível: ${local.nome}`,
          zIndex: 1
        });
        
        // Adicionar evento de clique para abrir o Street View
        marker.addListener('click', () => {
          // Criar e abrir o panorama
          const panorama = new google.maps.StreetViewPanorama(
            document.getElementById('map'),
            {
              position: {
                lat: panoramaLocation.latLng.lat(),
                lng: panoramaLocation.latLng.lng()
              },
              pov: {
                heading: 0,
                pitch: 0
              },
              zoom: 1
            }
          );
          
          // Definir o panorama no mapa
          window.map.setStreetView(panorama);
          
          // Adicionar botão para voltar ao mapa
          const backButton = document.createElement('button');
          backButton.textContent = 'Voltar ao Mapa';
          backButton.style.position = 'absolute';
          backButton.style.top = '10px';
          backButton.style.left = '10px';
          backButton.style.zIndex = '1000';
          backButton.style.padding = '10px';
          backButton.style.backgroundColor = '#FFA500';
          backButton.style.color = 'white';
          backButton.style.border = 'none';
          backButton.style.borderRadius = '4px';
          backButton.style.cursor = 'pointer';
          
          backButton.addEventListener('click', () => {
            panorama.setVisible(false);
            if (backButton.parentNode) {
              backButton.parentNode.removeChild(backButton);
            }
          });
          
          document.getElementById('map').appendChild(backButton);
        });
        
        console.log(`[PegmanOptimizer] Indicador Street View adicionado para ${local.nome}`);
      }
    } catch (e) {
      console.warn("[PegmanOptimizer] Erro ao adicionar indicador:", e);
    }
  }
  
  /**
   * Verifica periodicamente o estado do Pegman e atualiza se necessário
   */
  function verificarEAtualizarPegman() {
    // Verificar se o Pegman está visível
    const pegmanControle = document.querySelector('.gm-svpc');
    
    if (!pegmanControle || pegmanControle.style.display === 'none' || pegmanControle.style.visibility === 'hidden') {
      console.log("[PegmanOptimizer] Pegman não encontrado ou escondido, restaurando");
      
      // Adicionar CSS para garantir que o Pegman esteja visível
      const estilos = document.createElement('style');
      estilos.textContent = `
        .gm-svpc, div[title*="Pegman"], div[title*="Street View"] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(estilos);
      
      // Recriar o controle do Pegman
      if (window.google && google.maps && window.map) {
        window.map.setOptions({
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });
      }
    }
  }
})();