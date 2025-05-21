/**
 * Script exclusivo para garantir que o Pegman (Street View) apareça no mapa
 */
(function() {
  console.log("[PegmanFix] Iniciando correção para o Pegman (Street View)");
  
  // Aplicar em diferentes momentos para garantir que funcione
  setTimeout(adicionarPegman, 2000);
  setTimeout(adicionarPegman, 5000);
  setTimeout(adicionarPegman, 10000);
  
  function adicionarPegman() {
    console.log("[PegmanFix] Tentando habilitar o Pegman (Street View)");
    
    try {
      // Verificar se temos acesso à API do Google Maps
      if (window.google && google.maps) {
        console.log("[PegmanFix] API do Google Maps encontrada");
        
        // Método 1: Habilitar pelo objeto do mapa
        if (window.map && typeof window.map.setOptions === 'function') {
          console.log("[PegmanFix] Objeto do mapa encontrado, habilitando Street View");
          window.map.setOptions({
            streetViewControl: true,
            fullscreenControl: false,
            zoomControl: false,
            mapTypeControl: false
          });
        } 
        
        // Método 2: Modificar diretamente os controles existentes
        modificarControlesDiretos();
      }
    } catch (e) {
      console.warn("[PegmanFix] Erro ao acessar o mapa:", e);
    }
    
    // Injetar CSS para mostrar o Pegman mesmo que os outros métodos falhem
    injetarCSS();
  }
  
  function modificarControlesDiretos() {
    try {
      // Procurar os controles do Street View no DOM
      const controlesSV = document.querySelectorAll('.gm-svpc');
      console.log("[PegmanFix] Controles Street View encontrados:", controlesSV.length);
      
      controlesSV.forEach(control => {
        // Mostrar o controle
        control.style.display = 'block';
        control.style.visibility = 'visible';
        control.style.opacity = '1';
        // Remover classes que podem estar escondendo
        control.classList.remove('hidden', 'invisible');
        console.log("[PegmanFix] Controle Street View restaurado");
      });
      
      // Se não encontrou nenhum controle, tentar encontrar pelo conteúdo/atributos
      if (controlesSV.length === 0) {
        console.log("[PegmanFix] Buscando controles por atributos alternativos");
        
        // Procurar elementos que possivelmente são o controle do Street View
        const possiveisControles = document.querySelectorAll('div[title*="Street"], div[title*="street"], div[title*="Pegman"], div[aria-label*="Street"], button[title*="Street"]');
        
        possiveisControles.forEach(control => {
          control.style.display = 'block';
          control.style.visibility = 'visible';
          control.style.opacity = '1';
          console.log("[PegmanFix] Possível controle Street View restaurado por atributo");
        });
      }
      
      // Verificar controles do tipo gmnoprint (Google Maps impressão)
      document.querySelectorAll('.gmnoprint').forEach(control => {
        // Verificar se este controle contém algo relacionado ao Street View
        if (control.innerHTML.includes('gm-svpc') || 
            control.querySelector('.gm-svpc') || 
            control.innerHTML.includes('Pegman') || 
            control.innerHTML.includes('Street View')) {
          
          control.style.display = 'block';
          control.style.visibility = 'visible';
          control.style.opacity = '1';
          console.log("[PegmanFix] Controle gmnoprint com Street View restaurado");
        }
      });
    } catch (e) {
      console.warn("[PegmanFix] Erro ao modificar controles:", e);
    }
  }
  
  function injetarCSS() {
    // Verificar se já injetamos o CSS
    if (!document.getElementById('pegman-css-fix')) {
      const style = document.createElement('style');
      style.id = 'pegman-css-fix';
      style.textContent = `
        /* Garantir que o Pegman seja mostrado */
        .gm-svpc, 
        div[title*="Street"], 
        div[title*="street"], 
        div[title*="Pegman"], 
        div[aria-label*="Street"], 
        button[title*="Street"],
        .gm-style-mtc div[role="button"][aria-label*="Street"],
        .gmnoprint div[title*="Street"],
        .gmnoprint div[title*="Pegman"] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        
        /* Assegurar que o Street View está habilitado */
        .gm-style .gm-svpc {
          display: block !important;
        }
      `;
      document.head.appendChild(style);
      console.log("[PegmanFix] CSS injetado para preservar o Pegman");
    }
  }
})();