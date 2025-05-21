/**
 * Script para remover controles indesejados do mapa
 * e ajustar opções do mapa no Google Maps
 */
(function() {
  console.log("[RemoverControles] Iniciando remoção de controles indesejados");
  
  // Executar após um breve período para garantir que o mapa foi carregado
  setTimeout(iniciarRemocao, 1000);
  // Executar novamente para garantir que qualquer reinicialização também seja tratada
  setTimeout(iniciarRemocao, 3000);
  
  function iniciarRemocao() {
    // Selecionar o elemento do mapa
    const mapa = document.getElementById('map');
    
    // Verificar se o objeto do Google Maps está disponível
    if (window.google && window.google.maps && mapa) {
      console.log("[RemoverControles] Google Maps detectado, ajustando opções");
      
      // Tentar obter a instância do mapa
      const instanciaMapa = window.map || null;
      
      if (instanciaMapa) {
        // Desativar controle de tela cheia
        instanciaMapa.setOptions({
          fullscreenControl: false
        });
        console.log("[RemoverControles] Controle de tela cheia desativado via API");
      }
    }
    
    // Remover controles via CSS também
    const estilo = document.createElement('style');
    estilo.textContent = `
      /* Ocultar controle de tela cheia */
      .gm-fullscreen-control { 
        display: none !important; 
      }
      
      /* Ocultar botões de desfazer */
      button[title*="Desfazer"], 
      button[aria-label*="Desfazer"],
      .gmnoprint button:contains("Desfazer") {
        display: none !important;
      }
    `;
    document.head.appendChild(estilo);
    
    // Função para remover elementos específicos do DOM
    function removerElementos() {
      // Remover botão de tela cheia
      document.querySelectorAll('.gm-fullscreen-control').forEach(el => {
        if (el && el.parentNode) {
          console.log("[RemoverControles] Removendo botão de tela cheia");
          el.parentNode.removeChild(el);
        }
      });
      
      // Remover botões de desfazer
      document.querySelectorAll('button').forEach(btn => {
        const titulo = btn.getAttribute('title') || '';
        const texto = btn.textContent || '';
        
        if (titulo.includes('Desfazer') || texto.includes('Desfazer')) {
          if (btn.parentNode) {
            console.log("[RemoverControles] Removendo botão de desfazer");
            btn.parentNode.removeChild(btn);
          }
        }
      });
    }
    
    // Executar remoção inicial
    removerElementos();
    
    // Continuar verificando e removendo periodicamente
    setInterval(removerElementos, 1000);
  }
})();