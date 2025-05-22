/**
 * Depurador para GitHub Pages - Móveis Bonafé
 * 
 * Este script monitora e registra informações importantes sobre a execução
 * no ambiente do GitHub Pages para ajudar na depuração de problemas.
 */
(function() {
  // Registrar início da execução
  console.log("🐞 [Debug-GitHub] Iniciando monitoramento para GitHub Pages");
  console.log("🐞 [Debug-GitHub] Versão: 1.1 (22/05/2025)");
  console.log("🐞 [Debug-GitHub] URL: " + window.location.href);
  
  // Verificar se estamos realmente no GitHub Pages
  const isGitHubPages = window.location.href.includes('github.io');
  console.log("🐞 [Debug-GitHub] Ambiente GitHub Pages?", isGitHubPages);
  
  // Monitorar carregamento dos scripts
  const scriptsCarregados = [];
  const scriptsExistentes = document.querySelectorAll('script');
  
  scriptsExistentes.forEach(script => {
    const src = script.getAttribute('src') || 'inline';
    scriptsCarregados.push(src);
    console.log("🐞 [Debug-GitHub] Script carregado:", src);
  });
  
  // Configurar monitoramento da rota
  monitorarCalculosRota();
  
  // Monitorar quando a página estiver totalmente carregada
  window.addEventListener('load', () => {
    console.log("🐞 [Debug-GitHub] Página completamente carregada");
    setTimeout(verificarComponentes, 2000);
  });
  
  // Verificar componentes críticos
  function verificarComponentes() {
    // Verificar botões
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    console.log("🐞 [Debug-GitHub] Botão Visualizar encontrado?", !!botaoVisualizar);
    console.log("🐞 [Debug-GitHub] Botão Otimizar encontrado?", !!botaoOtimizar);
    
    // Verificar áreas de informação
    const routeInfo = document.getElementById('route-info');
    console.log("🐞 [Debug-GitHub] Route-info encontrado?", !!routeInfo);
    
    if (routeInfo) {
      console.log("🐞 [Debug-GitHub] Conteúdo atual de route-info:", routeInfo.innerHTML);
    }
    
    // Verificar API do Google Maps
    console.log("🐞 [Debug-GitHub] Google Maps disponível?", !!window.google && !!window.google.maps);
    console.log("🐞 [Debug-GitHub] DirectionsService disponível?", !!window.directionsService);
    console.log("🐞 [Debug-GitHub] DirectionsRenderer disponível?", !!window.directionsRenderer);
    
    // Verificar variáveis globais importantes
    console.log("🐞 [Debug-GitHub] Variável locations disponível?", !!window.locations);
    console.log("🐞 [Debug-GitHub] Quantidade de locations:", window.locations ? window.locations.length : 0);
    
    // Monitorar execução posterior
    setTimeout(verificarComponentes, 10000);
  }
  
  // Monitorar cálculos de rota
  function monitorarCalculosRota() {
    // Interceptar a API do Google Maps
    if (window.google && window.google.maps) {
      // Monitorar DirectionsService
      const originalDirectionsService = window.google.maps.DirectionsService;
      window.google.maps.DirectionsService = function() {
        const service = new originalDirectionsService();
        console.log("🐞 [Debug-GitHub] DirectionsService criado");
        
        // Interceptar método route
        const routeOriginal = service.route;
        service.route = function(request, callback) {
          console.log("🐞 [Debug-GitHub] Rota solicitada:", request);
          
          // Monitore o callback
          return routeOriginal.call(this, request, function(result, status) {
            console.log("🐞 [Debug-GitHub] Resultado da rota:", status, result);
            
            // Extrair informações de tempo e distância
            if (status === 'OK' && result.routes && result.routes.length > 0) {
              const rota = result.routes[0];
              let distanciaTotal = 0;
              let tempoTotal = 0;
              
              rota.legs.forEach(leg => {
                distanciaTotal += leg.distance.value;
                tempoTotal += leg.duration.value;
              });
              
              console.log("🐞 [Debug-GitHub] Distância calculada:", (distanciaTotal/1000).toFixed(2), "km");
              console.log("🐞 [Debug-GitHub] Tempo calculado:", Math.floor(tempoTotal/3600), "h", Math.floor((tempoTotal%3600)/60), "min");
            }
            
            // Chamar o callback original
            if (callback) callback(result, status);
          });
        };
        
        return service;
      };
      
      console.log("🐞 [Debug-GitHub] Monitoramento da API do Google Maps configurado");
    } else {
      console.log("🐞 [Debug-GitHub] Google Maps ainda não carregado, tentando novamente mais tarde");
      setTimeout(monitorarCalculosRota, 1000);
    }
  }
  
  // Monitorar alterações no DOM
  function monitorarDOM() {
    // Verificar a área de informações da rota
    const routeInfo = document.getElementById('route-info');
    if (!routeInfo) {
      console.log("🐞 [Debug-GitHub] Elemento route-info não encontrado para monitorar");
      return;
    }
    
    // Criar um observer para monitorar alterações
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          console.log("🐞 [Debug-GitHub] Alteração detectada em route-info:", routeInfo.innerHTML);
        }
      });
    });
    
    // Configurar e iniciar o observer
    observer.observe(routeInfo, {
      childList: true,
      characterData: true,
      subtree: true
    });
    
    console.log("🐞 [Debug-GitHub] Monitoramento de DOM configurado");
  }
  
  // Iniciar monitoramento do DOM quando a página carregar
  setTimeout(monitorarDOM, 3000);
})();