/**
 * Script para reposicionar ícones dentro do mapa que estão fora de visualização
 * Isso garante que todos os controles importantes estejam visíveis e bem organizados
 */
(function() {
  console.log("[RepositorioIcones] Iniciando reposicionamento de ícones no mapa");
  
  // Executar após carregamento completo e periodicamente para manter ajustes
  setTimeout(reposicionarIcones, 2000);
  setTimeout(reposicionarIcones, 5000);
  setInterval(verificarEReposicionarIcones, 3000);
  
  /**
   * Função principal para reposicionar ícones no mapa
   */
  function reposicionarIcones() {
    console.log("[RepositorioIcones] Reposicionando ícones no mapa");
    
    // 1. Identificar todos os controles e ícones no mapa
    const controlesIcones = identificarControlesIcones();
    
    // 2. Verificar quais ícones estão fora da área visível
    const iconesFora = filtrarIconesForaDeVisualizacao(controlesIcones);
    
    // 3. Criar painel organizado para os ícones
    if (iconesFora.length > 0) {
      console.log(`[RepositorioIcones] ${iconesFora.length} ícones fora da área visível`);
      criarPainelOrganizado(iconesFora);
    } else {
      console.log("[RepositorioIcones] Todos os ícones estão visíveis");
    }
    
    // 4. Garantir que o Pegman esteja visível e posicionado corretamente
    ajustarPosicaoPegman();
  }
  
  /**
   * Identifica todos os controles e ícones presentes no mapa
   */
  function identificarControlesIcones() {
    const controles = [];
    
    // 1. Procurar controles do Google Maps
    document.querySelectorAll('.gmnoprint, .gm-control-active, .gm-svpc, [class*="gm-"]').forEach(elemento => {
      // Verificar se este elemento é visível
      const estiloComputado = window.getComputedStyle(elemento);
      if (estiloComputado.display !== 'none' && estiloComputado.visibility !== 'hidden') {
        controles.push({
          elemento: elemento,
          tipo: determinarTipoControle(elemento),
          retangulo: elemento.getBoundingClientRect(),
          prioridade: determinarPrioridade(elemento)
        });
      }
    });
    
    // 2. Procurar marcadores específicos da aplicação
    document.querySelectorAll('.marker, .pin, .mapMarker, [class*="marker"], [class*="pin"]').forEach(elemento => {
      controles.push({
        elemento: elemento,
        tipo: 'marcador',
        retangulo: elemento.getBoundingClientRect(),
        prioridade: 3
      });
    });
    
    // 3. Procurar outros elementos que possam ser ícones no mapa
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.querySelectorAll('img, svg, button, .button').forEach(elemento => {
        // Verificar se ainda não foi incluído
        if (!controles.some(c => c.elemento === elemento)) {
          controles.push({
            elemento: elemento,
            tipo: 'outro',
            retangulo: elemento.getBoundingClientRect(),
            prioridade: 5
          });
        }
      });
    }
    
    console.log(`[RepositorioIcones] Identificados ${controles.length} controles/ícones no mapa`);
    return controles;
  }
  
  /**
   * Determina o tipo de controle com base em suas características
   */
  function determinarTipoControle(elemento) {
    // Usar classes, atributos e conteúdo para determinar o tipo
    const classes = elemento.className || '';
    const id = elemento.id || '';
    const conteudo = elemento.innerHTML || '';
    
    if (classes.includes('gm-svpc') || conteudo.includes('pegman') || conteudo.includes('street-view')) {
      return 'pegman';
    } else if (classes.includes('gm-zoom') || id.includes('zoom') || conteudo.includes('zoom')) {
      return 'zoom';
    } else if (classes.includes('gm-fullscreen') || id.includes('fullscreen')) {
      return 'fullscreen';
    } else if (classes.includes('gm-style-mtc') || conteudo.includes('Map') || conteudo.includes('Satellite')) {
      return 'mapa-tipo';
    } else if (classes.includes('gm-style-cc') || conteudo.includes('data') || conteudo.includes('Google')) {
      return 'creditos';
    } else if (classes.includes('cluster') || conteudo.includes('cluster')) {
      return 'cluster';
    } else {
      return 'outro';
    }
  }
  
  /**
   * Determina a prioridade do controle (1 = mais importante)
   */
  function determinarPrioridade(elemento) {
    // Pegman tem prioridade alta
    if (elemento.classList.contains('gm-svpc')) {
      return 1;
    }
    
    // Zoom e controles de navegação também são importantes
    if (elemento.classList.contains('gm-control-active') || 
        elemento.classList.contains('gm-zoom-control')) {
      return 2;
    }
    
    // Verificar se é um botão ou controle interativo
    if (elemento.tagName === 'BUTTON' || 
        elemento.getAttribute('role') === 'button' ||
        elemento.classList.contains('button')) {
      return 3;
    }
    
    // Marcadores e clusters
    if (elemento.classList.contains('marker') || 
        elemento.classList.contains('cluster')) {
      return 4;
    }
    
    // Por padrão, baixa prioridade
    return 5;
  }
  
  /**
   * Filtra os ícones que estão fora da área visível do mapa
   */
  function filtrarIconesForaDeVisualizacao(controles) {
    // Obter as dimensões visíveis do mapa
    const mapa = document.getElementById('map');
    if (!mapa) return [];
    
    const mapaRect = mapa.getBoundingClientRect();
    
    // Filtrar ícones que estão fora da área visível
    return controles.filter(controle => {
      const rect = controle.retangulo;
      
      // Verificar se está fora da área visível
      const foraLimites = 
        rect.right < mapaRect.left || // Fora pela esquerda
        rect.left > mapaRect.right || // Fora pela direita
        rect.bottom < mapaRect.top || // Fora por cima
        rect.top > mapaRect.bottom;   // Fora por baixo
      
      // Verificar se está parcialmente oculto
      const parcialmenteOculto = 
        (rect.left < mapaRect.left && rect.right > mapaRect.left) || // Cortado pela esquerda
        (rect.right > mapaRect.right && rect.left < mapaRect.right) || // Cortado pela direita
        (rect.top < mapaRect.top && rect.bottom > mapaRect.top) || // Cortado por cima
        (rect.bottom > mapaRect.bottom && rect.top < mapaRect.bottom); // Cortado por baixo
      
      // Também verificar se o estilo computado indica que está oculto
      const estiloComputado = window.getComputedStyle(controle.elemento);
      const estiloOculto = estiloComputado.display === 'none' || 
                          estiloComputado.visibility === 'hidden' ||
                          estiloComputado.opacity === '0';
      
      // Retornar true para ícones que estão fora, parcialmente visíveis ou ocultos
      return foraLimites || parcialmenteOculto || estiloOculto;
    });
  }
  
  /**
   * Cria um painel organizado para exibir os ícones que estão fora de visualização
   */
  function criarPainelOrganizado(icones) {
    // Verificar se já existe um painel
    let painel = document.querySelector('.icones-repositorio');
    
    // Se não existir, criar um novo
    if (!painel) {
      painel = document.createElement('div');
      painel.className = 'icones-repositorio';
      painel.style.position = 'absolute';
      painel.style.top = '10px';
      painel.style.right = '10px';
      painel.style.backgroundColor = '#FFF8E1';
      painel.style.border = '2px solid #FFA500';
      painel.style.borderRadius = '10px';
      painel.style.padding = '5px';
      painel.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
      painel.style.zIndex = '1000';
      painel.style.display = 'flex';
      painel.style.flexDirection = 'column';
      painel.style.gap = '5px';
      
      // Adicionar título ao painel
      const titulo = document.createElement('div');
      titulo.textContent = 'Controles do Mapa';
      titulo.style.fontWeight = 'bold';
      titulo.style.fontSize = '12px';
      titulo.style.textAlign = 'center';
      titulo.style.marginBottom = '5px';
      painel.appendChild(titulo);
      
      // Adicionar ao mapa
      const mapaElement = document.getElementById('map');
      if (mapaElement) {
        mapaElement.appendChild(painel);
      } else {
        document.body.appendChild(painel);
      }
      
      console.log("[RepositorioIcones] Painel de ícones criado");
    } else {
      // Limpar o painel existente, mantendo apenas o título
      const titulo = painel.querySelector('div');
      painel.innerHTML = '';
      if (titulo) {
        painel.appendChild(titulo);
      }
    }
    
    // Organizar ícones por prioridade
    icones.sort((a, b) => a.prioridade - b.prioridade);
    
    // Adicionar ícones ao painel
    icones.forEach(icone => {
      // Verificar se o ícone já está no painel
      if (painel.contains(icone.elemento)) {
        return;
      }
      
      // Se for o Pegman, tratamento especial
      if (icone.tipo === 'pegman') {
        console.log("[RepositorioIcones] Pegman detectado, posicionando separadamente");
        ajustarPosicaoPegman();
        return;
      }
      
      // Verificar se é um tipo de ícone que queremos clonar em vez de mover
      if (['creditos', 'outro'].includes(icone.tipo)) {
        return; // Ignorar estes tipos
      }
      
      try {
        // Tentar clonar o ícone
        const clone = icone.elemento.cloneNode(true);
        
        // Adicionar classe para estilização
        clone.classList.add('icone-clonado');
        
        // Adicionar título descritivo baseado no tipo
        clone.setAttribute('title', `Controle: ${icone.tipo}`);
        
        // Adicionar evento de clique para redirecionar para o original
        clone.addEventListener('click', function() {
          // Tentar enviar clique para o ícone original
          const eventoClique = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          icone.elemento.dispatchEvent(eventoClique);
        });
        
        // Adicionar ao painel
        painel.appendChild(clone);
        
        console.log(`[RepositorioIcones] Ícone '${icone.tipo}' adicionado ao painel`);
      } catch (e) {
        console.warn(`[RepositorioIcones] Erro ao clonar ícone '${icone.tipo}':`, e);
        
        // Alternativa: criar um botão representativo
        const botaoAlternativo = document.createElement('button');
        botaoAlternativo.textContent = icone.tipo.charAt(0).toUpperCase() + icone.tipo.slice(1);
        botaoAlternativo.className = 'icone-alternativo';
        botaoAlternativo.style.padding = '5px 10px';
        botaoAlternativo.style.backgroundColor = '#FFF8E1';
        botaoAlternativo.style.border = '1px solid #FFA500';
        botaoAlternativo.style.borderRadius = '5px';
        botaoAlternativo.style.cursor = 'pointer';
        
        // Adicionar evento de clique
        botaoAlternativo.addEventListener('click', function() {
          // Tenta enviar clique para o ícone original
          icone.elemento.click();
        });
        
        // Adicionar ao painel
        painel.appendChild(botaoAlternativo);
      }
    });
    
    // Se não adicionamos nenhum ícone (além do título), remover o painel
    if (painel.childElementCount <= 1) {
      if (painel.parentNode) {
        painel.parentNode.removeChild(painel);
      }
      console.log("[RepositorioIcones] Painel removido por não ter ícones");
    }
  }
  
  /**
   * Ajusta a posição do Pegman para garantir que esteja visível
   */
  function ajustarPosicaoPegman() {
    // Encontrar o Pegman
    const pegman = document.querySelector('.gm-svpc');
    if (!pegman) {
      console.log("[RepositorioIcones] Pegman não encontrado");
      return;
    }
    
    // Verificar se já está em container personalizado
    const containerPegman = pegman.closest('.pegman-container');
    if (containerPegman) {
      console.log("[RepositorioIcones] Pegman já está em container personalizado");
      return;
    }
    
    // Criar container para o Pegman
    const container = document.createElement('div');
    container.className = 'pegman-container';
    container.style.position = 'absolute';
    container.style.bottom = '120px';
    container.style.right = '10px';
    container.style.zIndex = '1000';
    container.style.backgroundColor = '#FFF8E1';
    container.style.border = '2px solid #FFA500';
    container.style.borderRadius = '50%';
    container.style.padding = '2px';
    container.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    container.style.cursor = 'grab';
    
    // Verificar se conseguimos obter o Pegman do seu local atual
    if (pegman.parentNode) {
      // Remover do local atual
      const parent = pegman.parentNode;
      parent.removeChild(pegman);
      
      // Adicionar ao novo container
      container.appendChild(pegman);
      
      // Adicionar ao mapa
      const mapaElement = document.getElementById('map');
      if (mapaElement) {
        mapaElement.appendChild(container);
        console.log("[RepositorioIcones] Pegman reposicionado no mapa");
      } else {
        document.body.appendChild(container);
        console.log("[RepositorioIcones] Pegman reposicionado no corpo da página");
      }
      
      // Adicionar tooltip explicativo
      pegman.setAttribute('title', 'Arraste para explorar no Street View');
    }
  }
  
  /**
   * Verifica periodicamente e reposiciona ícones que ficaram fora de visualização
   */
  function verificarEReposicionarIcones() {
    // Verificar se o painel ainda existe e está visível
    const painel = document.querySelector('.icones-repositorio');
    if (painel) {
      const estiloComputado = window.getComputedStyle(painel);
      if (estiloComputado.display === 'none' || estiloComputado.visibility === 'hidden') {
        console.log("[RepositorioIcones] Painel oculto, recriando");
        painel.style.display = 'flex';
        painel.style.visibility = 'visible';
      }
    } else {
      console.log("[RepositorioIcones] Painel não encontrado, recriando");
      reposicionarIcones();
    }
    
    // Verificar se o Pegman ainda está visível
    const pegmanContainer = document.querySelector('.pegman-container');
    if (!pegmanContainer) {
      console.log("[RepositorioIcones] Container do Pegman não encontrado, recriando");
      ajustarPosicaoPegman();
    }
  }
})();