/**
 * Ajuste de Rotas Alternativas
 * 
 * Remove informações de tempo/distância das rotas alternativas
 * e as coloca no botão visualizar ou ao lado dele.
 */
(function() {
  console.log("📏 [AjusteRotas] Iniciando ajuste de rotas alternativas");
  
  // Executar quando a página carregar
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 1000);
  setTimeout(iniciar, 3000);
  
  function iniciar() {
    // Verificar periodicamente pela presença do container de rotas alternativas
    const intervalo = setInterval(() => {
      const containerRotas = document.querySelector('.route-alternative-box');
      if (containerRotas) {
        reorganizarRotas(containerRotas);
        
        // Parar a verificação periódica
        clearInterval(intervalo);
        
        // Configurar observador para mudanças futuras
        observarMudancas();
      }
    }, 500);
    
    // Limitar o tempo máximo de verificação
    setTimeout(() => clearInterval(intervalo), 30000);
  }
  
  // Reorganizar as rotas alternativas
  function reorganizarRotas(container) {
    console.log("📏 [AjusteRotas] Reorganizando rotas alternativas");
    
    // Encontrar todas as rotas alternativas
    const rotas = container.querySelectorAll('.route-alternative');
    if (!rotas.length) return;
    
    // Verificar se já temos os estilos necessários
    adicionarEstilos();
    
    // Processar cada rota
    rotas.forEach(rota => {
      // Verificar se já foi processada
      if (rota.getAttribute('data-processada')) return;
      
      // Encontrar elementos de distância e tempo
      const distancia = rota.querySelector('.route-distance');
      const tempo = rota.querySelector('.route-time');
      
      if (distancia && tempo) {
        // Armazenar dados originais como atributos data-
        rota.setAttribute('data-distancia', distancia.textContent);
        rota.setAttribute('data-tempo', tempo.textContent);
        
        // Esconder elementos originais
        distancia.style.display = 'none';
        tempo.style.display = 'none';
        
        // Marcar como processada
        rota.setAttribute('data-processada', 'true');
        
        // Adicionar handler de clique para capturar seleção
        rota.addEventListener('click', () => {
          setTimeout(() => {
            // Remover seleção de todas as rotas
            document.querySelectorAll('.route-alternative').forEach(r => 
              r.classList.remove('rota-selecionada'));
            
            // Adicionar classe de seleção a esta rota
            rota.classList.add('rota-selecionada');
            
            // Atualizar informações no botão visualizar
            atualizarBotaoVisualizar(distancia.textContent, tempo.textContent);
          }, 100);
        });
      }
    });
    
    // Interceptar o botão visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    if (botaoVisualizar && !botaoVisualizar.getAttribute('data-interceptado')) {
      // Criar container para o botão e informações
      const container = document.createElement('div');
      container.className = 'container-botao-info';
      
      // Mover o botão para o novo container
      const paiOriginal = botaoVisualizar.parentNode;
      paiOriginal.removeChild(botaoVisualizar);
      container.appendChild(botaoVisualizar);
      
      // Criar elemento para informações
      const infoElement = document.createElement('div');
      infoElement.className = 'info-rota';
      infoElement.innerHTML = '<div class="info-distancia"></div><div class="info-tempo"></div>';
      container.appendChild(infoElement);
      
      // Adicionar container ao DOM
      paiOriginal.appendChild(container);
      
      // Marcar botão como interceptado
      botaoVisualizar.setAttribute('data-interceptado', 'true');
      
      // Interceptar clique para atualizar informações
      const clickOriginal = botaoVisualizar.onclick;
      botaoVisualizar.onclick = function(event) {
        // Executar comportamento original
        if (clickOriginal) clickOriginal.call(this, event);
        
        // Encontrar rota selecionada
        const rotaSelecionada = document.querySelector('.route-alternative.rota-selecionada');
        if (rotaSelecionada) {
          const dist = rotaSelecionada.getAttribute('data-distancia');
          const tempo = rotaSelecionada.getAttribute('data-tempo');
          atualizarBotaoVisualizar(dist, tempo);
        }
      };
    }
    
    // Remover texto explicativo confuso
    const textoExplicativo = container.querySelector('p.text-muted');
    if (textoExplicativo) {
      textoExplicativo.textContent = 'Selecione uma rota e clique em Visualizar para mais detalhes.';
    }
  }
  
  // Atualizar informações no botão visualizar
  function atualizarBotaoVisualizar(distancia, tempo) {
    if (!distancia || !tempo) return;
    
    const infoDistancia = document.querySelector('.info-distancia');
    const infoTempo = document.querySelector('.info-tempo');
    
    if (infoDistancia && infoTempo) {
      infoDistancia.innerHTML = '<i class="fa fa-road"></i> ' + distancia;
      infoTempo.innerHTML = '<i class="fa fa-clock"></i> ' + tempo;
      
      // Adicionar animação
      infoDistancia.classList.add('animado');
      infoTempo.classList.add('animado');
      
      // Remover classe após animação
      setTimeout(() => {
        infoDistancia.classList.remove('animado');
        infoTempo.classList.remove('animado');
      }, 1000);
    }
  }
  
  // Observar mudanças para processar novas rotas alternativas
  function observarMudancas() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // Verificar se temos um container de rotas
          const container = document.querySelector('.route-alternative-box');
          if (container) {
            reorganizarRotas(container);
          }
        }
      });
    });
    
    // Observar todo o corpo do documento
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Adicionar estilos necessários
  function adicionarEstilos() {
    if (document.getElementById('ajuste-rotas-estilos')) return;
    
    const estilos = document.createElement('style');
    estilos.id = 'ajuste-rotas-estilos';
    estilos.textContent = `
      /* Estilos para rotas alternativas */
      .route-alternative {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .route-alternative:hover {
        background-color: #f5f5f5;
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .route-alternative.rota-selecionada {
        background-color: #fff9e6;
        border-color: #ffd966;
        box-shadow: 0 0 0 2px rgba(255,217,102,0.5);
      }
      
      /* Container para botão e informações */
      .container-botao-info {
        display: flex;
        align-items: center;
        margin-top: 10px;
        background-color: #f8f9fa;
        padding: 5px;
        border-radius: 5px;
      }
      
      /* Informações da rota */
      .info-rota {
        margin-left: 15px;
        padding: 5px 10px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .info-distancia, .info-tempo {
        font-size: 14px;
        color: #555;
        margin: 2px 0;
      }
      
      .info-rota i {
        width: 20px;
        color: #666;
        margin-right: 5px;
      }
      
      /* Animação para destacar atualizações */
      @keyframes destaque {
        0% { background-color: #fff; }
        30% { background-color: #fff9e6; }
        100% { background-color: #fff; }
      }
      
      .animado {
        animation: destaque 1s ease;
      }
      
      /* Esconder elementos originais */
      .route-alternative .route-distance,
      .route-alternative .route-time {
        display: none !important;
      }
    `;
    
    document.head.appendChild(estilos);
    
    // Adicionar Font Awesome se necessário
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
  }
})();