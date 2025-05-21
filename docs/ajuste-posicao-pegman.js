/**
 * Script específico para corrigir a posição do Pegman e outros ícones no mapa
 * Este script garante que o Pegman esteja bem posicionado e visível
 */
(function() {
  console.log("[AjustePosicaoPegman] Iniciando ajuste específico para a posição do Pegman");
  
  // Aplicar ajustes após um curto período e depois periodicamente
  setTimeout(ajustarPosicao, 1000);
  setTimeout(ajustarPosicao, 3000);
  setTimeout(ajustarPosicao, 6000);
  setInterval(verificarPosicao, 3000);
  
  /**
   * Função principal para ajustar a posição do Pegman e outros ícones
   */
  function ajustarPosicao() {
    console.log("[AjustePosicaoPegman] Ajustando posição do Pegman");
    
    // Mover manualmente o Pegman para uma posição estratégica
    moverPegmanParaPosicaoEstrategica();
    
    // Ajustar outros ícones importantes
    ajustarOutrosIcones();
    
    // Adicionar ícones e controles personalizados em posições adequadas
    adicionarControlesPersonalizados();
  }
  
  /**
   * Move o Pegman para uma posição estratégica no mapa
   */
  function moverPegmanParaPosicaoEstrategica() {
    // Tentativa 1: Localizar o Pegman existente e reposicioná-lo
    const pegman = document.querySelector('.gm-svpc, [title*="Pegman"], [title*="Street View"]');
    
    if (pegman) {
      console.log("[AjustePosicaoPegman] Pegman encontrado, reposicionando...");
      
      // Verificar se já criamos um container personalizado
      const containerExistente = document.querySelector('.pegman-container-fixo');
      if (containerExistente) {
        console.log("[AjustePosicaoPegman] Container do Pegman já existe");
        return;
      }
      
      // Remover do seu container atual
      if (pegman.parentNode) {
        try {
          pegman.parentNode.removeChild(pegman);
        } catch (e) {
          console.warn("[AjustePosicaoPegman] Não foi possível remover Pegman do container atual:", e);
        }
      }
      
      // Criar container posicionado corretamente
      const container = document.createElement('div');
      container.className = 'pegman-container-fixo';
      
      // Estilos de posicionamento fixo no canto superior direito
      container.style.position = 'absolute';
      container.style.top = '30px';
      container.style.right = '30px';
      container.style.zIndex = '9999';
      container.style.backgroundColor = '#FFF8E1';
      container.style.border = '2px solid #FFA500';
      container.style.borderRadius = '50%';
      container.style.padding = '5px';
      container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      container.style.cursor = 'grab';
      container.style.transition = 'all 0.3s ease';
      
      // Adicionar efeito de hover
      container.onmouseover = function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
      };
      container.onmouseout = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      };
      
      // Adicionar o Pegman ao novo container
      container.appendChild(pegman);
      
      // Adicionar o container ao mapa
      const mapaElement = document.getElementById('map');
      if (mapaElement) {
        mapaElement.appendChild(container);
        console.log("[AjustePosicaoPegman] Pegman reposicionado no mapa com sucesso");
      } else {
        document.body.appendChild(container);
        console.log("[AjustePosicaoPegman] Pegman reposicionado no body");
      }
      
      // Adicionar título explicativo
      pegman.setAttribute('title', 'Arraste para explorar a vista de rua');
    } else {
      console.log("[AjustePosicaoPegman] Pegman não encontrado, tentando criar um novo");
      
      // Tentativa 2: Se não encontrou o Pegman, criar um botão personalizado
      criarPegmanPersonalizado();
    }
  }
  
  /**
   * Cria um Pegman personalizado quando o original não é encontrado
   */
  function criarPegmanPersonalizado() {
    // Verificar se já temos um Pegman personalizado
    if (document.querySelector('.pegman-personalizado')) {
      return;
    }
    
    // Criar container
    const container = document.createElement('div');
    container.className = 'pegman-container-fixo';
    container.style.position = 'absolute';
    container.style.top = '30px';
    container.style.right = '30px';
    container.style.zIndex = '9999';
    container.style.backgroundColor = '#FFF8E1';
    container.style.border = '2px solid #FFA500';
    container.style.borderRadius = '50%';
    container.style.padding = '5px';
    container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    container.style.cursor = 'pointer';
    container.style.transition = 'all 0.3s ease';
    
    // Criar ícone do Pegman personalizado
    const pegmanPersonalizado = document.createElement('div');
    pegmanPersonalizado.className = 'pegman-personalizado';
    pegmanPersonalizado.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFA500"><path d="M12 2c2.76 0 5 2.24 5 5 0 2.5-1.04 4-3 5l1 5h-6l1-5c-1.96-1-3-2.5-3-5 0-2.76 2.24-5 5-5zm0 2c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zm-8 13v4h16v-4h-16z"/></svg>';
    
    // Adicionar efeitos visuais
    container.onmouseover = function() {
      this.style.transform = 'scale(1.1)';
      this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
    };
    container.onmouseout = function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    };
    
    // Adicionar comportamento do Street View
    container.addEventListener('click', function() {
      ativarStreetView();
    });
    
    // Adicionar tooltip
    container.setAttribute('title', 'Clique para ativar o Street View');
    
    // Adicionar o ícone ao container
    container.appendChild(pegmanPersonalizado);
    
    // Adicionar o container ao mapa
    const mapaElement = document.getElementById('map');
    if (mapaElement) {
      mapaElement.appendChild(container);
      console.log("[AjustePosicaoPegman] Pegman personalizado criado com sucesso");
    } else {
      document.body.appendChild(container);
      console.log("[AjustePosicaoPegman] Pegman personalizado adicionado ao body");
    }
  }
  
  /**
   * Ativa o Street View programaticamente
   */
  function ativarStreetView() {
    try {
      console.log("[AjustePosicaoPegman] Tentando ativar Street View");
      
      // Verificar se temos acesso à API do Google Maps
      if (window.google && google.maps && window.map) {
        // Tentar habilitar Street View no centro do mapa atual
        const centro = window.map.getCenter();
        
        // Criar um panorama do Street View
        const panorama = new google.maps.StreetViewPanorama(
          document.getElementById('map'),
          {
            position: centro,
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
        backButton.style.zIndex = '10000';
        backButton.style.padding = '10px';
        backButton.style.backgroundColor = '#FFA500';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '4px';
        backButton.style.cursor = 'pointer';
        
        backButton.addEventListener('click', function() {
          panorama.setVisible(false);
          if (backButton.parentNode) {
            backButton.parentNode.removeChild(backButton);
          }
        });
        
        document.getElementById('map').appendChild(backButton);
        
        console.log("[AjustePosicaoPegman] Street View ativado com sucesso");
      } else {
        console.warn("[AjustePosicaoPegman] API do Google Maps não disponível");
      }
    } catch (e) {
      console.error("[AjustePosicaoPegman] Erro ao ativar Street View:", e);
    }
  }
  
  /**
   * Ajusta outros ícones importantes no mapa
   */
  function ajustarOutrosIcones() {
    // Botões de zoom
    const botoesZoom = document.querySelectorAll('.gm-bundled-control, .gm-control-active, [class*="zoom"]');
    
    botoesZoom.forEach(botao => {
      // Verificar se é um botão de zoom
      const conteudo = botao.innerHTML || '';
      const classes = botao.className || '';
      
      if (conteudo.includes('zoom') || classes.includes('zoom')) {
        // Mover para posição adequada
        if (botao.parentNode) {
          botao.parentNode.style.top = '100px';
          botao.parentNode.style.left = '10px';
        }
      }
    });
    
    // Outros controles do mapa
    document.querySelectorAll('.gmnoprint').forEach(controle => {
      // Verificar se não é o Pegman
      if (!controle.innerHTML.includes('pegman') && !controle.querySelector('.gm-svpc')) {
        controle.style.bottom = 'auto';
        controle.style.top = '150px';
        controle.style.left = '10px';
      }
    });
  }
  
  /**
   * Adiciona controles personalizados em posições adequadas
   */
  function adicionarControlesPersonalizados() {
    // Verificar se já temos controles personalizados
    if (document.querySelector('.controles-personalizados')) {
      return;
    }
    
    // Criar painel de controles
    const painel = document.createElement('div');
    painel.className = 'controles-personalizados';
    painel.style.position = 'absolute';
    painel.style.top = '30px';
    painel.style.left = '10px';
    painel.style.zIndex = '1000';
    painel.style.backgroundColor = '#FFF8E1';
    painel.style.border = '2px solid #FFA500';
    painel.style.borderRadius = '10px';
    painel.style.padding = '5px';
    painel.style.display = 'flex';
    painel.style.flexDirection = 'column';
    painel.style.gap = '5px';
    
    // Adicionar controles comuns
    
    // 1. Botão de zoom in
    const zoomInBtn = document.createElement('button');
    zoomInBtn.textContent = '+';
    zoomInBtn.style.width = '30px';
    zoomInBtn.style.height = '30px';
    zoomInBtn.style.borderRadius = '50%';
    zoomInBtn.style.border = 'none';
    zoomInBtn.style.backgroundColor = '#FFA500';
    zoomInBtn.style.color = 'white';
    zoomInBtn.style.fontWeight = 'bold';
    zoomInBtn.style.fontSize = '16px';
    zoomInBtn.style.cursor = 'pointer';
    
    zoomInBtn.addEventListener('click', function() {
      if (window.map && typeof window.map.getZoom === 'function') {
        window.map.setZoom(window.map.getZoom() + 1);
      }
    });
    
    // 2. Botão de zoom out
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.textContent = '-';
    zoomOutBtn.style.width = '30px';
    zoomOutBtn.style.height = '30px';
    zoomOutBtn.style.borderRadius = '50%';
    zoomOutBtn.style.border = 'none';
    zoomOutBtn.style.backgroundColor = '#FFA500';
    zoomOutBtn.style.color = 'white';
    zoomOutBtn.style.fontWeight = 'bold';
    zoomOutBtn.style.fontSize = '16px';
    zoomOutBtn.style.cursor = 'pointer';
    
    zoomOutBtn.addEventListener('click', function() {
      if (window.map && typeof window.map.getZoom === 'function') {
        window.map.setZoom(window.map.getZoom() - 1);
      }
    });
    
    // Adicionar ao painel
    painel.appendChild(zoomInBtn);
    painel.appendChild(zoomOutBtn);
    
    // Adicionar ao mapa
    const mapaElement = document.getElementById('map');
    if (mapaElement) {
      mapaElement.appendChild(painel);
      console.log("[AjustePosicaoPegman] Controles personalizados adicionados");
    }
  }
  
  /**
   * Verifica periodicamente a posição do Pegman
   */
  function verificarPosicao() {
    // Verificar se o Pegman está visível e bem posicionado
    const pegmanContainer = document.querySelector('.pegman-container-fixo');
    if (!pegmanContainer) {
      console.log("[AjustePosicaoPegman] Container do Pegman não encontrado, reposicionando");
      ajustarPosicao();
    }
    
    // Verificar se os controles personalizados estão visíveis
    const controlesPersonalizados = document.querySelector('.controles-personalizados');
    if (!controlesPersonalizados) {
      console.log("[AjustePosicaoPegman] Controles personalizados não encontrados, recriando");
      adicionarControlesPersonalizados();
    }
  }
})();