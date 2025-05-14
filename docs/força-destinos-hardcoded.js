/**
 * SOLUÇÃO DEFINITIVA para forçar destinos específicos no GitHub Pages
 * Esta abordagem é extremamente agressiva e substitui diretamente o array locations global
 */
(function() {
  console.log('[ForçaDestinosHardcoded] Iniciando script de intercepção de destinos');
  
  // Adicionar log global para depuração visual
  var LOG_VISUAL = true;
  var LOG_CONTAINER = null;
  
  // Destinos fixos que sabemos que funcionam
  var DESTINOS_FIXOS = [
    { id: 1, name: "Ribeirão Preto", lat: -21.1704, lng: -47.8103, address: "Ribeirão Preto, SP" },
    { id: 2, name: "Campinas", lat: -22.9071, lng: -47.0632, address: "Campinas, SP" }
  ];
  
  // Origem (Dois Córregos-SP)
  var ORIGEM = { id: 0, name: "Dois Córregos", lat: -22.3731, lng: -48.3796, address: "Dois Córregos, SP" };
  
  // Inicializar nos eventos principais
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar várias vezes para garantir intercepção
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  setTimeout(inicializar, 3000);
  setTimeout(inicializar, 5000);
  
  // Variável de controle
  var jaExecutado = false;
  
  /**
   * Inicializa o script e monitora eventos
   */
  function inicializar() {
    if (jaExecutado) return;
    
    log('Inicializando script de intercepção de destinos');
    criarLogVisual();
    
    // 1. Substituir array global de locations
    if (substituirArrayLocations()) {
      log('Array locations substituído com sucesso!');
      jaExecutado = true;
    } else {
      log('Não foi possível substituir o array locations ainda, monitorando mudanças...');
      observarDOM();
    }
    
    // 2. Monitorar o botão de otimização para substituir seu comportamento
    observarBotaoOtimizar();
  }
  
  /**
   * Substitui o array global de locations com nossos destinos fixos
   */
  function substituirArrayLocations() {
    try {
      // Se locations ainda não existe, criar
      if (typeof window.locations === 'undefined') {
        log('Array locations não encontrado, criando novo...');
        window.locations = [ORIGEM].concat(DESTINOS_FIXOS);
        return true;
      }
      
      // Se já existe, verificar se tem a origem
      var temOrigem = false;
      var temDestinos = false;
      
      // Verificar origem
      for (var i = 0; i < window.locations.length; i++) {
        var loc = window.locations[i];
        if (loc && loc.name && loc.name.toLowerCase().includes('dois córregos')) {
          temOrigem = true;
        }
        
        // Verificar se destinos já existem
        if (loc && loc.name) {
          if (loc.name.toLowerCase().includes('ribeirão') || 
              loc.name.toLowerCase().includes('ribeirao') || 
              loc.name.toLowerCase().includes('campinas')) {
            temDestinos = true;
          }
        }
      }
      
      // Se já tem origem e destinos, não precisamos substituir
      if (temOrigem && temDestinos) {
        log('Array locations já contém origem e destinos');
        return true;
      }
      
      // Se não tem origem, adicionar
      if (!temOrigem) {
        log('Adicionando origem ao array locations');
        window.locations.unshift(ORIGEM);
      }
      
      // Se não tem destinos, adicionar
      if (!temDestinos) {
        log('Adicionando destinos ao array locations');
        Array.prototype.push.apply(window.locations, DESTINOS_FIXOS);
      }
      
      log('Array locations atualizado:', window.locations);
      return true;
    } catch (err) {
      log('ERRO ao substituir array locations:', err.message);
      return false;
    }
  }
  
  /**
   * Observa mudanças no DOM para interceptar novos elementos
   */
  function observarDOM() {
    var observer = new MutationObserver(function(mutations) {
      // Verificar se durante as alterações locations foi criado
      if (typeof window.locations === 'undefined') return;
      
      // Tentar substituir novamente
      if (substituirArrayLocations()) {
        log('Array locations foi detectado e substituído via observador!');
        observer.disconnect();
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Monitora o botão de otimização para substituir seu comportamento
   */
  function observarBotaoOtimizar() {
    // Procurar botão imediatamente
    var botao = document.getElementById('optimize-route');
    
    if (!botao) {
      // Tentar outras seletores
      botao = document.querySelector('button:contains("Otimizar"), button:contains("Calcular")');
    }
    
    if (botao) {
      log('Botão de otimização encontrado, substituindo comportamento...');
      substituirComportamentoBotao(botao);
    } else {
      // Monitorar para quando o botão for criado
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // ELEMENT_NODE
              var botaoEncontrado = null;
              
              // Verificar se o próprio nó é o botão
              if (node.id === 'optimize-route' || 
                 (node.tagName === 'BUTTON' && 
                  (node.textContent.includes('Otimizar') || node.textContent.includes('Calcular')))) {
                botaoEncontrado = node;
              } else {
                // Procurar dentro dos elementos adicionados
                var botoes = node.querySelectorAll('button');
                botoes.forEach(function(btn) {
                  if (btn.id === 'optimize-route' || 
                     btn.textContent.includes('Otimizar') || 
                     btn.textContent.includes('Calcular')) {
                    botaoEncontrado = btn;
                  }
                });
              }
              
              if (botaoEncontrado) {
                log('Botão de otimização detectado:', botaoEncontrado.textContent);
                substituirComportamentoBotao(botaoEncontrado);
                observer.disconnect();
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  
  /**
   * Substitui o comportamento do botão de otimização
   */
  function substituirComportamentoBotao(botao) {
    try {
      // Clonar o botão para remover todos os event listeners
      var novoBotao = botao.cloneNode(true);
      if (botao.parentNode) {
        botao.parentNode.replaceChild(novoBotao, botao);
      }
      
      // Adicionar nosso comportamento
      novoBotao.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        log('Botão de otimização clicado com handler personalizado');
        
        // Garantir que o array de locations esteja atualizado
        substituirArrayLocations();
        
        // Tentar chamar a função de cálculo de rota apropriada
        if (typeof calculateRoute === 'function') {
          log('Chamando calculateRoute()...');
          calculateRoute();
        } else if (typeof optimizeRoute === 'function') {
          log('Chamando optimizeRoute()...');
          optimizeRoute();
        } else {
          // Tentar obter a função de alguma maneira
          var possiveisFuncoes = [
            window.calculateRoute,
            window.optimizeRoute, 
            window.directionsCalculateRoute,
            window.directionsOptimizeRoute
          ];
          
          var funcionou = false;
          for (var i = 0; i < possiveisFuncoes.length; i++) {
            if (typeof possiveisFuncoes[i] === 'function') {
              log('Chamando função alternativa:', i);
              possiveisFuncoes[i]();
              funcionou = true;
              break;
            }
          }
          
          if (!funcionou) {
            log('ERRO: Não foi possível encontrar a função de cálculo de rota');
            alert('Erro: Não foi possível calcular a rota. Tente recarregar a página.');
          }
        }
        
        return false;
      });
      
      log('Comportamento do botão substituído com sucesso');
    } catch (err) {
      log('ERRO ao substituir comportamento do botão:', err.message);
    }
  }
  
  /**
   * Função de log com saída para console e visual
   */
  function log() {
    var args = Array.prototype.slice.call(arguments);
    var mensagem = ['[ForçaDestinosHardcoded]'].concat(args);
    
    // Log para console
    console.log.apply(console, mensagem);
    
    // Log visual se ativado
    if (LOG_VISUAL && LOG_CONTAINER) {
      var texto = mensagem.map(function(arg) {
        return typeof arg === 'object' ? JSON.stringify(arg) : arg;
      }).join(' ');
      
      var item = document.createElement('div');
      item.className = 'log-item';
      item.textContent = new Date().toLocaleTimeString() + ': ' + texto;
      
      // Inserir no topo para mais recentes ficarem em cima
      if (LOG_CONTAINER.firstChild) {
        LOG_CONTAINER.insertBefore(item, LOG_CONTAINER.firstChild);
      } else {
        LOG_CONTAINER.appendChild(item);
      }
      
      // Limitar a 30 itens
      if (LOG_CONTAINER.children.length > 30) {
        LOG_CONTAINER.removeChild(LOG_CONTAINER.lastChild);
      }
    }
  }
  
  /**
   * Cria o container para logs visuais
   */
  function criarLogVisual() {
    if (!LOG_VISUAL) return;
    
    try {
      // Verificar se já existe
      LOG_CONTAINER = document.getElementById('log-container-forca-destinos');
      
      if (!LOG_CONTAINER) {
        // Criar container
        LOG_CONTAINER = document.createElement('div');
        LOG_CONTAINER.id = 'log-container-forca-destinos';
        LOG_CONTAINER.style.position = 'fixed';
        LOG_CONTAINER.style.bottom = '10px';
        LOG_CONTAINER.style.left = '10px';
        LOG_CONTAINER.style.width = '400px';
        LOG_CONTAINER.style.maxHeight = '200px';
        LOG_CONTAINER.style.backgroundColor = 'rgba(0,0,0,0.8)';
        LOG_CONTAINER.style.color = '#ffcc00';
        LOG_CONTAINER.style.padding = '10px';
        LOG_CONTAINER.style.borderRadius = '5px';
        LOG_CONTAINER.style.fontFamily = 'monospace';
        LOG_CONTAINER.style.fontSize = '11px';
        LOG_CONTAINER.style.overflow = 'auto';
        LOG_CONTAINER.style.zIndex = '9999';
        document.body.appendChild(LOG_CONTAINER);
        
        // Adicionar título
        var titulo = document.createElement('div');
        titulo.textContent = 'Força Destinos Hardcoded - Logs';
        titulo.style.fontWeight = 'bold';
        titulo.style.marginBottom = '5px';
        titulo.style.borderBottom = '1px solid #ffcc00';
        titulo.style.paddingBottom = '3px';
        LOG_CONTAINER.appendChild(titulo);
        
        // Adicionar botão para fechar
        var fechar = document.createElement('button');
        fechar.textContent = 'X';
        fechar.style.position = 'absolute';
        fechar.style.top = '5px';
        fechar.style.right = '5px';
        fechar.style.backgroundColor = '#ff3300';
        fechar.style.color = 'white';
        fechar.style.border = 'none';
        fechar.style.borderRadius = '3px';
        fechar.style.width = '20px';
        fechar.style.height = '20px';
        fechar.style.lineHeight = '18px';
        fechar.style.cursor = 'pointer';
        fechar.onclick = function() {
          LOG_CONTAINER.style.display = 'none';
        };
        LOG_CONTAINER.appendChild(fechar);
        
        // Estilo para itens de log
        var estilo = document.createElement('style');
        estilo.textContent = `
          #log-container-forca-destinos .log-item {
            margin-bottom: 3px;
            border-bottom: 1px dotted rgba(255,204,0,0.3);
            padding-bottom: 3px;
          }
        `;
        document.head.appendChild(estilo);
        
        log('Log visual inicializado');
      }
    } catch (err) {
      console.error('[ForçaDestinosHardcoded] Erro ao criar log visual:', err);
    }
  }
})();