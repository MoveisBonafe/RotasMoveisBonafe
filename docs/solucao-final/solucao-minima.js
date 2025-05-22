/**
 * SOLUÇÃO MÍNIMA PARA ROTAS ALTERNATIVAS
 * Esta solução foi projetada para causar o mínimo de interferência possível
 * com o código existente, focando apenas em ocultar as informações de tempo/distância
 * das rotas alternativas e mostrar essas informações junto ao botão Visualizar.
 */
(function() {
  // Executar após um atraso para garantir que a página foi carregada
  setTimeout(function() {
    console.log("🔍 [Solução Mínima] Iniciando...");
    
    // Adicionar CSS simples
    const css = `
      /* Ocultar elementos de distância e tempo */
      .route-alternative .route-distance,
      .route-alternative .route-time {
        display: none !important;
      }
      
      /* Container de informações */
      #container-info-minimo {
        display: flex;
        align-items: center;
        margin: 10px 0;
        padding: 5px;
        background-color: #f8f9fa;
        border-radius: 6px;
      }
      
      /* Painel de informações */
      #painel-info-minimo {
        margin-left: 15px;
        padding: 8px 12px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #555;
      }
      
      /* Rota selecionada */
      .rota-selecionada {
        background-color: #fff9e6;
        border-color: #ffd966;
      }
    `;
    
    // Adicionar o CSS à página
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    // Função para encontrar rotas alternativas
    function encontrarEProcessarRotas() {
      // Buscar rotas alternativas
      const rotas = document.querySelectorAll('.route-alternative');
      
      if (rotas.length === 0) {
        console.log("🔍 [Solução Mínima] Nenhuma rota alternativa encontrada");
        return;
      }
      
      console.log(`🔍 [Solução Mínima] Encontradas ${rotas.length} rotas alternativas`);
      
      // Processar cada rota
      rotas.forEach(function(rota) {
        // Verificar se já foi processada
        if (rota.hasAttribute('data-processada')) {
          return;
        }
        
        // Marcar como processada
        rota.setAttribute('data-processada', 'true');
        
        // Extrair informações
        const distanciaEl = rota.querySelector('.route-distance');
        const tempoEl = rota.querySelector('.route-time');
        
        if (distanciaEl) {
          rota.setAttribute('data-distancia', distanciaEl.textContent.trim());
        }
        
        if (tempoEl) {
          rota.setAttribute('data-tempo', tempoEl.textContent.trim());
        }
        
        // Adicionar evento de clique
        rota.addEventListener('click', function() {
          // Remover seleção das outras rotas
          document.querySelectorAll('.rota-selecionada').forEach(r => {
            r.classList.remove('rota-selecionada');
          });
          
          // Selecionar esta rota
          this.classList.add('rota-selecionada');
          
          // Atualizar informações no painel
          const painelDistancia = document.getElementById('info-distancia-minimo');
          const painelTempo = document.getElementById('info-tempo-minimo');
          
          if (painelDistancia && painelTempo) {
            painelDistancia.textContent = this.getAttribute('data-distancia') || 'N/A';
            painelTempo.textContent = this.getAttribute('data-tempo') || 'N/A';
          }
        });
      });
    }
    
    // Função para criar painel de informações
    function criarPainelInformacoes() {
      // Verificar se já existe
      if (document.getElementById('container-info-minimo')) {
        return;
      }
      
      // Encontrar botão Visualizar
      const botaoVisualizar = document.getElementById('visualize-button');
      
      if (!botaoVisualizar) {
        console.log("🔍 [Solução Mínima] Botão Visualizar não encontrado");
        return;
      }
      
      console.log("🔍 [Solução Mínima] Criando painel de informações");
      
      // Criar container
      const container = document.createElement('div');
      container.id = 'container-info-minimo';
      
      // Mover botão para container
      const parent = botaoVisualizar.parentNode;
      parent.removeChild(botaoVisualizar);
      container.appendChild(botaoVisualizar);
      
      // Criar painel
      const painel = document.createElement('div');
      painel.id = 'painel-info-minimo';
      painel.innerHTML = `
        <div>Distância: <span id="info-distancia-minimo">Selecione uma rota</span></div>
        <div>Tempo: <span id="info-tempo-minimo">Selecione uma rota</span></div>
      `;
      
      // Adicionar painel ao container
      container.appendChild(painel);
      
      // Adicionar container ao DOM
      parent.appendChild(container);
    }
    
    // Iniciar processamento
    encontrarEProcessarRotas();
    criarPainelInformacoes();
    
    // Tentar novamente após alguns segundos (caso as rotas sejam carregadas depois)
    setTimeout(function() {
      encontrarEProcessarRotas();
      criarPainelInformacoes();
    }, 3000);
    
    // Configurar observer para detectar quando novas rotas são adicionadas
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          encontrarEProcessarRotas();
        }
      });
    });
    
    // Observar mudanças no DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🔍 [Solução Mínima] Configuração concluída");
  }, 1000); // Aguardar 1 segundo para a página carregar
})();