/**
 * Script para capturar e registrar informações sobre os locais para facilitar debug
 */
(function() {
  console.log('[LogFinder] Iniciando busca por elementos de destino na página');
  
  // Adicionar estilo para a janela de debug
  adicionarEstilo();
  
  // Monitorar eventos
  document.addEventListener('DOMContentLoaded', iniciar);
  window.addEventListener('load', iniciar);
  
  // Tentar várias vezes para garantir
  setTimeout(iniciar, 1000);
  setTimeout(iniciar, 2000);
  setTimeout(iniciar, 3000);
  
  // Controle
  var executado = false;
  
  /**
   * Função principal que busca informações sobre destinos
   */
  function iniciar() {
    if (executado) return;
    
    console.log('[LogFinder] Iniciando captura de informações');
    var debugInfo = [];
    
    // Criar janela de debug
    var debugDiv = document.createElement('div');
    debugDiv.id = 'debug-finder';
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    debugDiv.style.color = '#ff0';
    debugDiv.style.padding = '15px';
    debugDiv.style.borderRadius = '5px';
    debugDiv.style.maxHeight = '500px';
    debugDiv.style.maxWidth = '600px';
    debugDiv.style.overflow = 'auto';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.fontSize = '12px';
    debugDiv.style.fontFamily = 'monospace';
    document.body.appendChild(debugDiv);
    
    // Adicionar título
    var titulo = document.createElement('h3');
    titulo.textContent = 'Captura de Informações - Debug';
    titulo.style.margin = '0 0 10px 0';
    titulo.style.color = '#ffc107';
    debugDiv.appendChild(titulo);
    
    // Adicionar botão para fechar
    var fechar = document.createElement('button');
    fechar.textContent = 'X';
    fechar.style.position = 'absolute';
    fechar.style.top = '5px';
    fechar.style.right = '5px';
    fechar.style.background = '#f00';
    fechar.style.color = '#fff';
    fechar.style.border = 'none';
    fechar.style.borderRadius = '3px';
    fechar.style.cursor = 'pointer';
    fechar.onclick = function() {
      document.body.removeChild(debugDiv);
    };
    debugDiv.appendChild(fechar);
    
    // 1. Verificar variáveis globais
    debugInfo.push('--- VARIÁVEIS GLOBAIS ---');
    
    if (typeof window.locations !== 'undefined') {
      debugInfo.push('window.locations: ' + JSON.stringify(window.locations));
    } else {
      debugInfo.push('window.locations não encontrado');
    }
    
    if (typeof window.map !== 'undefined') {
      try {
        debugInfo.push('window.map encontrado: ' + (window.map instanceof google.maps.Map));
      } catch (e) {
        debugInfo.push('window.map encontrado mas não é uma instância de Map');
      }
    } else {
      debugInfo.push('window.map não encontrado');
    }
    
    // 2. Verificar elementos DOM
    debugInfo.push('--- ELEMENTOS DOM ---');
    
    // Buscar por botões
    var botoes = {
      'optimize-route': document.getElementById('optimize-route'),
      'botões com "otimizar"': document.querySelectorAll('button:not([id="optimize-route"]):not([id="optimize-route-custom"])')
    };
    
    for (var key in botoes) {
      if (key === 'botões com "otimizar"') {
        var botoesEncontrados = [];
        botoes[key].forEach(function(btn) {
          if (btn.textContent.toLowerCase().includes('otimizar') || 
              btn.textContent.toLowerCase().includes('calcular')) {
            botoesEncontrados.push({
              id: btn.id,
              classe: btn.className,
              texto: btn.textContent.trim()
            });
          }
        });
        debugInfo.push(key + ': ' + JSON.stringify(botoesEncontrados));
      } else {
        var btn = botoes[key];
        if (btn) {
          debugInfo.push(key + ': encontrado (id=' + btn.id + ', classe=' + btn.className + ')');
        } else {
          debugInfo.push(key + ': não encontrado');
        }
      }
    }
    
    // Buscar por containers de destinos
    var containers = {
      '.location-container': document.querySelector('.location-container'),
      '.location-item': document.querySelectorAll('.location-item'),
      '.locations-list': document.querySelector('.locations-list'),
      'li:not(.origin-point)': document.querySelectorAll('li:not(.origin-point)'),
      '[class*="location"]': document.querySelectorAll('[class*="location"]:not(.origin-point)')
    };
    
    for (var key in containers) {
      var container = containers[key];
      if (container) {
        if (container.length !== undefined) { // NodeList
          debugInfo.push(key + ': ' + container.length + ' elementos encontrados');
          
          // Mostrar textos dos primeiros 5 elementos
          var textos = [];
          for (var i = 0; i < Math.min(container.length, 5); i++) {
            textos.push(container[i].textContent.trim());
          }
          
          if (textos.length > 0) {
            debugInfo.push('  Textos: ' + JSON.stringify(textos));
          }
        } else { // Elemento único
          debugInfo.push(key + ': encontrado');
          debugInfo.push('  Conteúdo: ' + container.textContent.trim());
        }
      } else {
        debugInfo.push(key + ': não encontrado');
      }
    }
    
    // 3. Procurar por nomes de cidades específicas
    debugInfo.push('--- BUSCA POR CIDADES NO DOM ---');
    
    var cidades = ['ribeirão preto', 'ribeirao preto', 'campinas', 'bauru', 'jaú', 'jau', 
                  'piracicaba', 'são carlos', 'sao carlos', 'dois córregos', 'dois corregos'];
    
    for (var i = 0; i < cidades.length; i++) {
      var cidade = cidades[i];
      var elementos = [];
      
      var textNodes = getTextNodesContaining(document.body, cidade);
      for (var j = 0; j < textNodes.length; j++) {
        var parent = textNodes[j].parentNode;
        elementos.push({
          tag: parent.tagName,
          id: parent.id,
          class: parent.className,
          text: textNodes[j].textContent.trim()
        });
      }
      
      debugInfo.push('Cidade "' + cidade + '": ' + elementos.length + ' ocorrências');
      if (elementos.length > 0) {
        debugInfo.push('  Primeiras ocorrências: ' + JSON.stringify(elementos.slice(0, 3)));
      }
    }
    
    // Mostrar todas as informações
    debugDiv.innerHTML += '<pre>' + debugInfo.join('\n') + '</pre>';
    
    console.log('[LogFinder] Captura de informações concluída');
    executado = true;
  }
  
  /**
   * Encontra todos os nós de texto que contêm uma determinada string
   */
  function getTextNodesContaining(element, text) {
    text = text.toLowerCase();
    var result = [];
    
    function recursiveWalk(node) {
      if (node.nodeType === 3) { // Node.TEXT_NODE
        if (node.textContent.toLowerCase().indexOf(text) > -1) {
          result.push(node);
        }
      } else {
        for (var i = 0; i < node.childNodes.length; i++) {
          recursiveWalk(node.childNodes[i]);
        }
      }
    }
    
    recursiveWalk(element);
    return result;
  }
  
  /**
   * Adiciona estilo para a janela de debug
   */
  function adicionarEstilo() {
    var style = document.createElement('style');
    style.textContent = `
      #debug-finder {
        font-family: monospace;
        font-size: 12px;
        line-height: 1.4;
      }
      #debug-finder pre {
        margin: 0;
        white-space: pre-wrap;
      }
      #debug-finder h3 {
        font-size: 16px;
        margin-bottom: 10px;
      }
    `;
    document.head.appendChild(style);
  }
})();