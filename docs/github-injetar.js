/**
 * INJETOR DIRETO PARA O GITHUB PAGES
 * Esta solução é extremamente agressiva e manipula diretamente o DOM
 * para garantir o funcionamento no GitHub Pages.
 */

// Executar imediatamente e após carregamento da página
(function() {
  console.log("🔴 INJETOR: Script iniciado");
  
  // Executar agora e quando a página carregar
  executarSolucao();
  
  // Backup com load
  window.addEventListener('load', executarSolucao);
  
  // Backup com DOMContentLoaded
  document.addEventListener('DOMContentLoaded', executarSolucao);
  
  // Também agendar execuções repetidas
  setTimeout(executarSolucao, 500);
  setTimeout(executarSolucao, 1000);
  setTimeout(executarSolucao, 2000);
  setInterval(executarSolucao, 2500);
  
  // Função principal que executa tudo
  function executarSolucao() {
    console.log("🔴 INJETOR: Tentando aplicar solução");
    
    try {
      // 1. Encontrar as rotas alternativas (usando diferentes métodos)
      let rotasAlternativas = [];
      
      // Método 1: Buscar pela classe específica
      rotasAlternativas = document.querySelectorAll('.route-alternative');
      
      // Método 2: Se não encontrou, procurar cards que podem ser rotas
      if (!rotasAlternativas || rotasAlternativas.length === 0) {
        rotasAlternativas = document.querySelectorAll('.card.mb-2');
      }
      
      // Método 3: Buscar divs abaixo do título "Rotas Alternativas"
      if (!rotasAlternativas || rotasAlternativas.length === 0) {
        const textoRotasAlt = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.trim() === 'Rotas Alternativas'
        );
        
        if (textoRotasAlt) {
          const containerPai = textoRotasAlt.parentElement.parentElement;
          rotasAlternativas = containerPai.querySelectorAll('div > div.card');
        }
      }
      
      // Verificar se encontramos rotas
      if (rotasAlternativas && rotasAlternativas.length > 0) {
        console.log("🔴 INJETOR: Encontradas " + rotasAlternativas.length + " rotas alternativas");
        
        // 2. Processar cada rota alternativa
        rotasAlternativas.forEach(function(rota, index) {
          processarRota(rota, index);
        });
        
        // 3. Criar ou atualizar o painel de informações
        const painelCriado = criarPainelInformacoes();
        
        // 4. Selecionar a primeira rota se nenhuma estiver selecionada
        const rotaSelecionada = document.querySelector('.rota-selecionada');
        if (!rotaSelecionada && rotasAlternativas.length > 0) {
          // Simular clique na primeira rota
          rotasAlternativas[0].click();
        }
        
        // 5. Adicionar CSS global para garantir que os estilos sejam aplicados
        adicionarCSS();
        
        return true;
      } else {
        console.log("🔴 INJETOR: Nenhuma rota alternativa encontrada");
        return false;
      }
    } catch (erro) {
      console.error("🔴 INJETOR: Erro ao executar solução", erro);
      return false;
    }
  }
  
  // Processar uma rota alternativa
  function processarRota(rota, index) {
    // Verificar se já foi processada
    if (rota.hasAttribute('data-processado-injetor')) {
      return;
    }
    
    console.log("🔴 INJETOR: Processando rota #" + (index + 1));
    
    // Marcar como processada
    rota.setAttribute('data-processado-injetor', 'true');
    
    // 1. Extrair informações de distância e tempo
    extrairInformacoes(rota);
    
    // 2. Ocultar elementos originais de distância e tempo
    ocultarInformacoes(rota);
    
    // 3. Adicionar estilo à rota
    rota.style.cursor = 'pointer';
    rota.style.transition = 'all 0.2s ease';
    rota.style.borderRadius = '6px';
    rota.style.padding = '10px 15px';
    rota.style.marginBottom = '8px';
    
    // 4. Adicionar evento de clique
    rota.addEventListener('click', function() {
      // Remover seleção das outras rotas
      document.querySelectorAll('.route-alternative, .card.mb-2').forEach(function(r) {
        r.classList.remove('rota-selecionada');
        r.style.backgroundColor = '';
        r.style.borderColor = '';
        r.style.boxShadow = '';
      });
      
      // Selecionar esta rota
      this.classList.add('rota-selecionada');
      this.style.backgroundColor = '#fff9e6';
      this.style.borderColor = '#ffd966';
      this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
      
      // Atualizar painel de informações
      atualizarPainel(
        this.getAttribute('data-distancia'),
        this.getAttribute('data-tempo')
      );
    });
    
    // 5. Adicionar eventos de hover
    rota.addEventListener('mouseenter', function() {
      if (!this.classList.contains('rota-selecionada')) {
        this.style.backgroundColor = '#f5f9ff';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      }
    });
    
    rota.addEventListener('mouseleave', function() {
      if (!this.classList.contains('rota-selecionada')) {
        this.style.backgroundColor = '';
        this.style.transform = '';
        this.style.boxShadow = '';
      }
    });
  }
  
  // Extrair informações de distância e tempo de uma rota
  function extrairInformacoes(rota) {
    // Método 1: Buscar por classes específicas
    const distanciaEls = rota.querySelectorAll('.route-distance, [class*="distance"]');
    const tempoEls = rota.querySelectorAll('.route-time, [class*="time"]');
    
    // Salvar informações se encontradas
    if (distanciaEls.length > 0) {
      rota.setAttribute('data-distancia', distanciaEls[0].textContent.trim());
      console.log("🔴 INJETOR: Distância encontrada por classe", rota.getAttribute('data-distancia'));
    }
    
    if (tempoEls.length > 0) {
      rota.setAttribute('data-tempo', tempoEls[0].textContent.trim());
      console.log("🔴 INJETOR: Tempo encontrado por classe", rota.getAttribute('data-tempo'));
    }
    
    // Método 2: Buscar por texto contendo km e min
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      // Buscar em todos os elementos filhos
      const elementos = rota.querySelectorAll('*');
      
      for (let i = 0; i < elementos.length; i++) {
        const texto = elementos[i].textContent || '';
        
        // Buscar distância (contém km)
        if (texto.includes('km') && !rota.hasAttribute('data-distancia')) {
          rota.setAttribute('data-distancia', texto.trim());
          console.log("🔴 INJETOR: Distância encontrada por texto", texto.trim());
        }
        
        // Buscar tempo (contém min ou hora)
        if ((texto.includes('min') || texto.includes('hora')) && !rota.hasAttribute('data-tempo')) {
          rota.setAttribute('data-tempo', texto.trim());
          console.log("🔴 INJETOR: Tempo encontrado por texto", texto.trim());
        }
        
        // Se já encontrou ambos, parar
        if (rota.hasAttribute('data-distancia') && rota.hasAttribute('data-tempo')) {
          break;
        }
      }
    }
    
    // Método 3: Extrair do texto completo da rota
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      const textoCompleto = rota.textContent || '';
      
      // Expressões regulares para encontrar padrões
      const regexDistancia = /(\d+[.,]?\d*\s*km)/i;
      const regexTempo = /(\d+\s*min|\d+\s*hora[s]?)/i;
      
      // Buscar distância
      if (!rota.hasAttribute('data-distancia')) {
        const matchDistancia = textoCompleto.match(regexDistancia);
        if (matchDistancia) {
          rota.setAttribute('data-distancia', matchDistancia[0]);
          console.log("🔴 INJETOR: Distância encontrada por regex", matchDistancia[0]);
        }
      }
      
      // Buscar tempo
      if (!rota.hasAttribute('data-tempo')) {
        const matchTempo = textoCompleto.match(regexTempo);
        if (matchTempo) {
          rota.setAttribute('data-tempo', matchTempo[0]);
          console.log("🔴 INJETOR: Tempo encontrado por regex", matchTempo[0]);
        }
      }
    }
    
    // Verificar se conseguimos extrair ambas as informações
    if (!rota.hasAttribute('data-distancia')) {
      console.log("🔴 INJETOR: Não foi possível extrair distância, usando valor padrão");
      rota.setAttribute('data-distancia', 'Distância indisponível');
    }
    
    if (!rota.hasAttribute('data-tempo')) {
      console.log("🔴 INJETOR: Não foi possível extrair tempo, usando valor padrão");
      rota.setAttribute('data-tempo', 'Tempo indisponível');
    }
  }
  
  // Ocultar informações originais de distância e tempo
  function ocultarInformacoes(rota) {
    // 1. Ocultar por classes específicas
    const elementos = rota.querySelectorAll('.route-distance, .route-time, [class*="distance"], [class*="time"]');
    
    elementos.forEach(function(el) {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.height = '0';
      el.style.width = '0';
      el.style.overflow = 'hidden';
      el.style.position = 'absolute';
      el.style.pointerEvents = 'none';
    });
    
    // 2. Ocultar por conteúdo (elementos que contêm apenas km ou min)
    const todosElementos = rota.querySelectorAll('*');
    
    todosElementos.forEach(function(el) {
      const texto = el.textContent || '';
      
      // Se o elemento contém apenas informação de distância ou tempo, ocultá-lo
      if ((texto.match(/^\s*\d+[.,]?\d*\s*km\s*$/) || 
          texto.match(/^\s*\d+\s*min\s*$/) || 
          texto.match(/^\s*\d+\s*hora[s]?\s*$/)) && 
          !el.children.length) { // Não ocultar se tiver filhos
        
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.height = '0';
        el.style.overflow = 'hidden';
      }
    });
  }
  
  // Criar painel de informações ao lado do botão Visualizar
  function criarPainelInformacoes() {
    // Verificar se já existe
    if (document.getElementById('painel-info-injetor')) {
      return true;
    }
    
    // Encontrar o botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button') || 
                           document.querySelector('button.btn-primary') ||
                           document.querySelector('button.btn-warning') ||
                           document.querySelector('button:contains("Visualizar")');
    
    if (!botaoVisualizar) {
      console.log("🔴 INJETOR: Botão Visualizar não encontrado");
      return false;
    }
    
    console.log("🔴 INJETOR: Criando painel de informações");
    
    // Melhorar aparência do botão
    botaoVisualizar.style.backgroundColor = '#ffc107';
    botaoVisualizar.style.color = '#212529';
    botaoVisualizar.style.fontWeight = 'bold';
    botaoVisualizar.style.padding = '8px 15px';
    botaoVisualizar.style.borderRadius = '4px';
    botaoVisualizar.style.border = 'none';
    botaoVisualizar.style.minWidth = '120px';
    botaoVisualizar.style.cursor = 'pointer';
    
    // Criar container
    const container = document.createElement('div');
    container.id = 'container-info-injetor';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '15px 0';
    container.style.padding = '5px';
    container.style.backgroundColor = '#f8f9fa';
    container.style.borderRadius = '8px';
    
    // Mover botão para container
    const parent = botaoVisualizar.parentNode;
    parent.removeChild(botaoVisualizar);
    container.appendChild(botaoVisualizar);
    
    // Criar painel de informações
    const painel = document.createElement('div');
    painel.id = 'painel-info-injetor';
    painel.style.marginLeft = '15px';
    painel.style.padding = '8px 12px';
    painel.style.backgroundColor = 'white';
    painel.style.borderRadius = '6px';
    painel.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    painel.style.fontSize = '14px';
    painel.style.color = '#555';
    painel.style.transition = 'all 0.3s ease';
    
    // Adicionar conteúdo inicial
    painel.innerHTML = `
      <div id="info-distancia-injetor" style="margin-bottom: 6px; display: flex; align-items: center;">
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo-injetor" style="display: flex; align-items: center;">
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
    const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted') || 
                           document.querySelector('.card-body p.text-muted');
    
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
      
      // Atualizar informações
      const rotaSelecionada = document.querySelector('.rota-selecionada');
      if (rotaSelecionada) {
        atualizarPainel(
          rotaSelecionada.getAttribute('data-distancia'),
          rotaSelecionada.getAttribute('data-tempo')
        );
      }
    };
    
    return true;
  }
  
  // Atualizar informações no painel
  function atualizarPainel(distancia, tempo) {
    // Verificar se temos dados
    if (!distancia || !tempo) {
      console.log("🔴 INJETOR: Dados incompletos para atualizar painel");
      return;
    }
    
    console.log("🔴 INJETOR: Atualizando painel com", distancia, tempo);
    
    // Encontrar elementos
    const distanciaEl = document.getElementById('info-distancia-injetor');
    const tempoEl = document.getElementById('info-tempo-injetor');
    
    // Atualizar conteúdo
    if (distanciaEl && tempoEl) {
      distanciaEl.innerHTML = `
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${distancia}</span>
      `;
      
      tempoEl.innerHTML = `
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${tempo}</span>
      `;
      
      // Adicionar animação
      distanciaEl.style.animation = 'none';
      tempoEl.style.animation = 'none';
      
      // Forçar reflow
      void distanciaEl.offsetWidth;
      void tempoEl.offsetWidth;
      
      // Adicionar animação
      distanciaEl.style.animation = 'fadeIn 0.3s ease-out forwards';
      tempoEl.style.animation = 'fadeIn 0.3s ease-out forwards';
    }
  }
  
  // Adicionar CSS global
  function adicionarCSS() {
    // Verificar se já existe
    if (document.getElementById('css-injetor')) {
      return;
    }
    
    // Criar elemento de estilo
    const estilo = document.createElement('style');
    estilo.id = 'css-injetor';
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
        position: absolute !important;
        pointer-events: none !important;
      }
      
      /* Estilizar rotas alternativas */
      .route-alternative,
      .card.mb-2 {
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        border-radius: 6px !important;
        padding: 10px 15px !important;
        margin-bottom: 8px !important;
      }
      
      /* Efeito hover nas rotas */
      .route-alternative:hover,
      .card.mb-2:hover {
        background-color: #f5f9ff !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
      }
      
      /* Rota selecionada */
      .rota-selecionada {
        background-color: #fff9e6 !important;
        border-color: #ffd966 !important;
        box-shadow: 0 0 0 2px rgba(255,217,102,0.5) !important;
      }
      
      /* Animação para atualizações */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-3px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Estilos para o painel */
      #painel-info-injetor {
        background-color: white !important;
        border-radius: 6px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        padding: 8px 12px !important;
        margin-left: 15px !important;
        font-size: 14px !important;
        color: #555 !important;
      }
      
      /* Estilos para o container */
      #container-info-injetor {
        display: flex !important;
        align-items: center !important;
        margin: 15px 0 !important;
        padding: 5px !important;
        background-color: #f8f9fa !important;
        border-radius: 8px !important;
      }
      
      /* Botão Visualizar */
      #visualize-button {
        background-color: #ffc107 !important;
        color: #212529 !important;
        font-weight: bold !important;
        padding: 8px 15px !important;
        border-radius: 4px !important;
        border: none !important;
        min-width: 120px !important;
      }
    `;
    
    // Adicionar ao DOM
    document.head.appendChild(estilo);
    console.log("🔴 INJETOR: CSS global adicionado");
  }
})();