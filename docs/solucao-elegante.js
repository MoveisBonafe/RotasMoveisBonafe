/**
 * SOLUÇÃO ELEGANTE PARA ROTAS ALTERNATIVAS
 * 
 * Este script:
 * 1. Remove as informações de distância e tempo das rotas alternativas
 * 2. Cria um painel elegante ao lado do botão Visualizar
 * 3. Mostra as informações da rota selecionada nesse painel
 */

(function() {
  // Executar quando a página carregar
  window.addEventListener('load', iniciar);
  
  // Função principal
  function iniciar() {
    console.log("💎 Solução Elegante: Iniciando...");
    
    // Aplicar mudanças imediatamente e depois em intervalos
    aplicarMudancas();
    setInterval(aplicarMudancas, 1000);
    
    // Observar mudanças no DOM
    const observer = new MutationObserver(function() {
      aplicarMudancas();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Aplicar todas as mudanças necessárias
  function aplicarMudancas() {
    // 1. Adicionar CSS para ocultar informações de rotas alternativas
    adicionarCSS();
    
    // 2. Encontrar e processar as rotas alternativas
    const secaoRotasAlt = document.querySelector('.route-alternative-box, .card-body');
    
    if (secaoRotasAlt) {
      // Encontrar todas as rotas
      const rotas = secaoRotasAlt.querySelectorAll('.route-alternative, .card.mb-2');
      
      if (rotas && rotas.length > 0) {
        console.log("💎 Solução Elegante: Encontradas " + rotas.length + " rotas alternativas");
        
        // Processar cada rota
        rotas.forEach(function(rota) {
          // Processar apenas se ainda não foi feito
          if (!rota.hasAttribute('data-processado')) {
            // Marcar como processada
            rota.setAttribute('data-processado', 'true');
            
            // Extrair e salvar informações de distância e tempo
            extrairInformacoes(rota);
            
            // Adicionar estilo e comportamento
            estilizarRota(rota);
            
            // Adicionar evento de clique
            rota.addEventListener('click', function() {
              // Remover seleção das outras rotas
              rotas.forEach(r => {
                r.classList.remove('rota-selecionada');
                r.style.backgroundColor = '';
                r.style.boxShadow = '';
                r.style.borderColor = '';
              });
              
              // Adicionar seleção a esta rota
              this.classList.add('rota-selecionada');
              this.style.backgroundColor = '#fff9e6';
              this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
              this.style.borderColor = '#ffd966';
              
              // Atualizar painel de informações
              atualizarPainel(
                this.getAttribute('data-distancia'),
                this.getAttribute('data-tempo')
              );
            });
          }
        });
        
        // 3. Criar ou atualizar painel de informações
        criarPainelInformacoes();
      }
    }
  }
  
  // Adicionar CSS para ocultar informações de rotas
  function adicionarCSS() {
    if (!document.getElementById('estilo-solucao-elegante')) {
      const estilo = document.createElement('style');
      estilo.id = 'estilo-solucao-elegante';
      estilo.textContent = `
        /* Ocultar informações de distância e tempo nas rotas alternativas */
        .route-alternative .route-distance,
        .route-alternative .route-time,
        .card.mb-2 .route-distance,
        .card.mb-2 .route-time,
        div[class*="distance"],
        div[class*="time"],
        span[class*="distance"],
        span[class*="time"] {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        
        /* Estilizar rotas alternativas */
        .route-alternative,
        .card.mb-2 {
          cursor: pointer !important;
          transition: all 0.25s ease !important;
          border-radius: 6px !important;
          padding: 10px 15px !important;
          margin-bottom: 8px !important;
        }
        
        .route-alternative:hover,
        .card.mb-2:hover {
          background-color: #f0f8ff !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 3px 6px rgba(0,0,0,0.1) !important;
        }
        
        .rota-selecionada {
          background-color: #fff9e6 !important;
          border-color: #ffd966 !important;
          box-shadow: 0 0 0 2px rgba(255,217,102,0.5) !important;
        }
        
        /* Estilizar painel de informações */
        #painel-info-elegante {
          background-color: white;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 8px 12px;
          margin-left: 15px;
          transition: all 0.3s ease;
        }
        
        #container-botao-info {
          display: flex;
          align-items: center;
          margin: 15px 0;
          padding: 5px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        /* Animação para atualização de informações */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .info-atualizada {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `;
      
      document.head.appendChild(estilo);
      console.log("💎 Solução Elegante: CSS adicionado");
    }
  }
  
  // Extrair informações de distância e tempo de uma rota
  function extrairInformacoes(rota) {
    // Método 1: Buscar por classes específicas
    const distanciaEls = rota.querySelectorAll('.route-distance, [class*="distance"]');
    const tempoEls = rota.querySelectorAll('.route-time, [class*="time"]');
    
    if (distanciaEls.length > 0) {
      rota.setAttribute('data-distancia', distanciaEls[0].textContent.trim());
    }
    
    if (tempoEls.length > 0) {
      rota.setAttribute('data-tempo', tempoEls[0].textContent.trim());
    }
    
    // Método 2: Buscar por texto
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      const texto = rota.textContent || '';
      
      // Buscar padrões de distância (km) e tempo (min/hora)
      const matchDistancia = texto.match(/(\d+[.,]?\d*\s*km)/i);
      const matchTempo = texto.match(/(\d+\s*min|\d+\s*hora[s]?)/i);
      
      if (matchDistancia && !rota.hasAttribute('data-distancia')) {
        rota.setAttribute('data-distancia', matchDistancia[0]);
      }
      
      if (matchTempo && !rota.hasAttribute('data-tempo')) {
        rota.setAttribute('data-tempo', matchTempo[0]);
      }
    }
    
    // Método 3: Buscar em cada elemento filho
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      const elementos = rota.querySelectorAll('*');
      
      elementos.forEach(function(el) {
        const texto = el.textContent || '';
        
        if (texto.includes('km') && !rota.hasAttribute('data-distancia')) {
          rota.setAttribute('data-distancia', texto.trim());
          el.style.display = 'none';
        }
        
        if ((texto.includes('min') || texto.includes('hora')) && !rota.hasAttribute('data-tempo')) {
          rota.setAttribute('data-tempo', texto.trim());
          el.style.display = 'none';
        }
      });
    }
    
    console.log("💎 Solução Elegante: Informações extraídas", 
                rota.getAttribute('data-distancia'), 
                rota.getAttribute('data-tempo'));
  }
  
  // Estilizar uma rota alternativa
  function estilizarRota(rota) {
    // Centralizar título da rota se existir
    const titulo = rota.querySelector('h5, .card-title');
    if (titulo) {
      titulo.style.textAlign = 'center';
      titulo.style.margin = '0';
      titulo.style.padding = '5px 0';
    }
    
    // Adicionar estilos à rota
    rota.style.cursor = 'pointer';
    rota.style.transition = 'all 0.25s ease';
    rota.style.borderRadius = '6px';
    rota.style.padding = '10px 15px';
    rota.style.marginBottom = '8px';
  }
  
  // Criar painel de informações junto ao botão Visualizar
  function criarPainelInformacoes() {
    // Verificar se já existe
    if (document.getElementById('container-botao-info')) {
      return;
    }
    
    // Encontrar botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button') ||
                           document.querySelector('button.btn-primary:not([id])') ||
                           document.querySelector('button:contains("Visualizar")');
    
    if (!botaoVisualizar) {
      console.log("💎 Solução Elegante: Botão Visualizar não encontrado");
      return;
    }
    
    console.log("💎 Solução Elegante: Criando painel de informações");
    
    // Melhorar aparência do botão
    botaoVisualizar.style.backgroundColor = '#ffc107';
    botaoVisualizar.style.color = '#212529';
    botaoVisualizar.style.fontWeight = 'bold';
    botaoVisualizar.style.padding = '8px 15px';
    botaoVisualizar.style.borderRadius = '4px';
    botaoVisualizar.style.border = 'none';
    botaoVisualizar.style.minWidth = '120px';
    
    // Criar container para botão e informações
    const container = document.createElement('div');
    container.id = 'container-botao-info';
    
    // Mover botão para container
    const parent = botaoVisualizar.parentNode;
    parent.removeChild(botaoVisualizar);
    container.appendChild(botaoVisualizar);
    
    // Criar painel de informações
    const painel = document.createElement('div');
    painel.id = 'painel-info-elegante';
    
    // Adicionar conteúdo
    painel.innerHTML = `
      <div id="info-distancia" style="margin-bottom: 6px; display: flex; align-items: center;">
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo" style="display: flex; align-items: center;">
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar ao container
    container.appendChild(painel);
    
    // Adicionar container ao DOM
    parent.appendChild(container);
    
    // Adicionar Font Awesome se necessário
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
    
    // Modificar texto explicativo
    const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted, .card-body p.text-muted');
    if (textoExplicativo) {
      textoExplicativo.textContent = 'Selecione uma rota e clique em Visualizar para ver detalhes.';
      textoExplicativo.style.textAlign = 'center';
      textoExplicativo.style.fontStyle = 'italic';
      textoExplicativo.style.fontSize = '13px';
      textoExplicativo.style.margin = '10px 0';
    }
    
    // Interceptar clique no botão
    const clickOriginal = botaoVisualizar.onclick;
    botaoVisualizar.onclick = function(event) {
      // Executar comportamento original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Atualizar informações da rota selecionada
      const rotaSelecionada = document.querySelector('.rota-selecionada');
      if (rotaSelecionada) {
        atualizarPainel(
          rotaSelecionada.getAttribute('data-distancia'),
          rotaSelecionada.getAttribute('data-tempo')
        );
      }
    };
  }
  
  // Atualizar informações no painel
  function atualizarPainel(distancia, tempo) {
    if (!distancia || !tempo) {
      console.log("💎 Solução Elegante: Sem dados para atualizar");
      return;
    }
    
    console.log("💎 Solução Elegante: Atualizando painel com", distancia, tempo);
    
    const distanciaEl = document.getElementById('info-distancia');
    const tempoEl = document.getElementById('info-tempo');
    
    if (distanciaEl && tempoEl) {
      // Atualizar conteúdo com animação
      distanciaEl.innerHTML = `
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${distancia}</span>
      `;
      
      tempoEl.innerHTML = `
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${tempo}</span>
      `;
      
      // Adicionar classe para animar
      distanciaEl.classList.add('info-atualizada');
      tempoEl.classList.add('info-atualizada');
      
      // Remover classe após animação
      setTimeout(function() {
        distanciaEl.classList.remove('info-atualizada');
        tempoEl.classList.remove('info-atualizada');
      }, 500);
    }
  }
})();