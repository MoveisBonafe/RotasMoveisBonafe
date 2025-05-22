/**
 * CORREÇÃO DO PEGMAN (STREET VIEW)
 * 
 * Este script garante que o ícone do Pegman (Street View) seja mantido no mapa
 * enquanto remove outros controles desnecessários.
 */
(function() {
  console.log("🚶‍♂️ [PegmanFix] Inicializando ajustes para adicionar Pegman");
  
  // Variáveis para controle
  let tentativas = 0;
  const MAX_TENTATIVAS = 10;
  let ajustesAplicados = false;
  
  // Executar quando a página carrega
  window.addEventListener('load', iniciar);
  
  // Também tentar imediatamente
  setTimeout(iniciar, 100);
  
  // E em intervalos
  const intervalos = [1000, 2000, 3000, 5000, 8000];
  intervalos.forEach(tempo => {
    setTimeout(iniciar, tempo);
  });
  
  // Função principal
  function iniciar() {
    if (ajustesAplicados || tentativas >= MAX_TENTATIVAS) {
      return;
    }
    
    tentativas++;
    console.log("🚶‍♂️ [PegmanFix] Tentando ajustar o mapa");
    
    // Verificar se o mapa do Google está carregado
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      console.log("🚶‍♂️ [PegmanFix] API do Google Maps ainda não carregada");
      return;
    }
    
    // Tentar encontrar o objeto do mapa
    const mapElements = document.querySelectorAll('.gm-style');
    if (mapElements.length === 0) {
      console.log("🚶‍♂️ [PegmanFix] Elementos do mapa não encontrados");
      return;
    }
    
    console.log(`🚶‍♂️ [PegmanFix] Encontrados ${mapElements.length} elementos do mapa, mas não o objeto do mapa`);
    
    // Como não temos acesso direto ao objeto do mapa, vamos usar uma abordagem alternativa
    // Adicionar CSS para garantir que o Pegman seja visível e outros controles sejam escondidos
    adicionarCSS();
    
    // Tentar outras abordagens baseadas no DOM
    setTimeout(ajustarControlesMapa, 1000);
    
    ajustesAplicados = true;
  }
  
  // Adicionar CSS para controlar os elementos do mapa
  function adicionarCSS() {
    if (document.getElementById('css-pegman-fix')) {
      return;
    }
    
    const estilo = document.createElement('style');
    estilo.id = 'css-pegman-fix';
    estilo.textContent = `
      /* Manter o Pegman (Street View) */
      .gm-svpc {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Esconder botões de edição e fullscreen */
      .gm-style-mtc,
      .gm-fullscreen-control {
        display: none !important;
      }
      
      /* Estilizar o botão do Pegman para destacá-lo */
      .gm-svpc {
        background-color: #fff !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        cursor: grab !important;
      }
      
      /* Deixar o mapa com controles mínimos */
      .gmnoprint:not(.gm-bundled-control) {
        display: none !important;
      }
      
      /* Manter apenas os controles essenciais */
      .gm-bundled-control .gmnoprint {
        display: block !important;
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("🚶‍♂️ [PegmanFix] CSS para o Pegman adicionado");
  }
  
  // Tentar ajustar os controles do mapa pelo DOM
  function ajustarControlesMapa() {
    // Verificar se o Pegman está visível
    const pegman = document.querySelector('.gm-svpc');
    if (pegman) {
      console.log("🚶‍♂️ [PegmanFix] Pegman encontrado e ajustado");
      
      // Garantir que seja visível
      pegman.style.display = 'block';
      pegman.style.visibility = 'visible';
      pegman.style.opacity = '1';
      
      // Adicionar uma borda amarela suave para destacar
      pegman.style.borderColor = '#ffd966';
    } else {
      console.log("🚶‍♂️ [PegmanFix] Pegman não encontrado no DOM");
    }
    
    // Esconder botões de fullscreen
    const fullscreenBtn = document.querySelector('.gm-fullscreen-control');
    if (fullscreenBtn) {
      fullscreenBtn.style.display = 'none';
      console.log("🚶‍♂️ [PegmanFix] Botão de tela cheia escondido");
    }
    
    // Aplicar cor amarela do Móveis Bonafé nos botões
    const botoes = document.querySelectorAll('.gm-control-active');
    botoes.forEach(botao => {
      botao.style.backgroundColor = '#ffd966';
      botao.style.borderColor = '#e6c259';
    });
    
    console.log("🚶‍♂️ [PegmanFix] Ajustes nos controles do mapa aplicados");
  }
})();