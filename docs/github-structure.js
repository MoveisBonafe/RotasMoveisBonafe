/**
 * Script para analisar a estrutura HTML do GitHub Pages
 */
(function() {
  console.log('[GH-Structure] Inicializando análise da estrutura...');
  
  function analisarEstrutura() {
    console.log('[GH-Structure] Executando análise de estrutura');
    
    // Encontrar todas as listas
    const todasListas = document.querySelectorAll('ul');
    console.log('[GH-Structure] Total de listas encontradas:', todasListas.length);
    
    // Analisar cada lista
    todasListas.forEach((lista, idx) => {
      console.log(`[GH-Structure] === LISTA ${idx} ===`);
      console.log(`[GH-Structure] ID: "${lista.id}", Classes: "${lista.className}"`);
      console.log(`[GH-Structure] Total de itens: ${lista.children.length}`);
      console.log(`[GH-Structure] HTML da lista:`);
      console.log(lista.outerHTML);
      
      // Analisar itens
      Array.from(lista.children).forEach((item, i) => {
        console.log(`[GH-Structure] Item ${i}:`);
        console.log(`[GH-Structure] Texto: "${item.textContent.trim()}"`);
        console.log(`[GH-Structure] Classes: "${item.className}"`);
        console.log(`[GH-Structure] Atributos:`, Array.from(item.attributes).map(a => `${a.name}="${a.value}"`));
        console.log(`[GH-Structure] HTML do item:`, item.outerHTML);
      });
    });
    
    // Analisar se locations existe
    if (window.locations) {
      console.log('[GH-Structure] Array locations existe com', window.locations.length, 'itens');
      window.locations.forEach((loc, i) => {
        console.log(`[GH-Structure] Location ${i}:`, 
          'id:', loc.id, 
          'name:', loc.name, 
          'isOrigin:', loc.isOrigin || false);
      });
    } else {
      console.log('[GH-Structure] Array locations não encontrado.');
    }
    
    // Verificar container de destinos
    const possiveisContainers = [
      '#destinations-container',
      '#locations-container',
      '.locations-container',
      '.sidebar-section'
    ];
    
    possiveisContainers.forEach(seletor => {
      const container = document.querySelector(seletor);
      if (container) {
        console.log(`[GH-Structure] Container de destinos encontrado: ${seletor}`);
        console.log(`[GH-Structure] HTML do container:`, container.outerHTML);
      }
    });
    
    // Verificar como são adicionados novos locais
    console.log('[GH-Structure] Funções para adicionar locais:');
    [
      'addLocation',
      'addLocationToList',
      'addMarker',
      'createMarker',
      'processLocationInput',
      'addDestination'
    ].forEach(funcName => {
      if (typeof window[funcName] === 'function') {
        console.log(`[GH-Structure] Função ${funcName} encontrada`);
        
        // Analisar código da função
        const funcStr = window[funcName].toString();
        console.log(`[GH-Structure] Código resumido de ${funcName}:`, 
          funcStr.length > 500 ? funcStr.substring(0, 500) + '...' : funcStr);
      }
    });
  }
  
  // Executar após a página carregar
  window.addEventListener('load', () => {
    console.log('[GH-Structure] Página carregada, aguardando inicialização...');
    setTimeout(analisarEstrutura, 3000);
  });
  
  // Verificar se elementos principais foram carregados
  const verificarElementos = setInterval(() => {
    if (window.map && window.locations) {
      console.log('[GH-Structure] Elementos principais carregados, iniciando análise...');
      analisarEstrutura();
      clearInterval(verificarElementos);
    }
  }, 1000);
})();