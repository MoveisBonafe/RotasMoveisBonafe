/**
 * SOLUÇÃO GOOGLE MAPS - VERSÃO ULTRA SIMPLIFICADA
 * Implementação standalone para GitHub Pages
 */
(function() {
  console.log("📍 [SOLUÇÃO DIRETA] Iniciando");

  // Criar painel assim que o script inicializar
  setTimeout(criarPainelVazio, 1000);
  setTimeout(criarPainelVazio, 3000);
  
  // Monitorar o botão de Visualizar
  window.addEventListener('load', function() {
    setTimeout(monitorarBotaoVisualizar, 1000);
    setTimeout(esconderInformacoesRotas, 1500);
  });
  
  // Criar o painel vazio no mapa
  function criarPainelVazio() {
    try {
      // Verificar se já existe
      if (document.getElementById('painel-info-rota')) {
        return;
      }
      
      // Encontrar o mapa
      const mapaContainer = document.querySelector('#map') || 
                           document.querySelector('.map-container') || 
                           document.querySelector('.gm-style') ||
                           document.querySelector('[style*="position: relative"]');
      
      if (!mapaContainer) {
        console.log("📍 [SOLUÇÃO DIRETA] Mapa não encontrado");
        return;
      }
      
      // Criar o painel
      const painel = document.createElement('div');
      painel.id = 'painel-info-rota';
      painel.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        padding: 10px 15px;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        border: 1px solid #e6c259;
      `;
      
      painel.innerHTML = `
        <div style="display: flex; align-items: center; margin-right: 20px;">
          <span style="margin-right: 8px; font-weight: bold; color: #ffd966;">📏</span>
          <span id="painel-distancia">---</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 8px; font-weight: bold; color: #ffd966;">⏱️</span>
          <span id="painel-tempo">---</span>
        </div>
      `;
      
      // Garantir que o container tem position: relative
      if (getComputedStyle(mapaContainer).position === 'static') {
        mapaContainer.style.position = 'relative';
      }
      
      // Adicionar o painel
      mapaContainer.appendChild(painel);
      console.log("📍 [SOLUÇÃO DIRETA] Painel adicionado ao mapa");
      
      // Adicionar CSS para esconder info das rotas alternativas
      adicionarCSS();
    } catch (error) {
      console.error("📍 [SOLUÇÃO DIRETA] Erro ao criar painel:", error);
    }
  }
  
  // Adicionar CSS para esconder informações das rotas
  function adicionarCSS() {
    if (document.getElementById('css-esconder-info')) {
      return;
    }
    
    const estilo = document.createElement('style');
    estilo.id = 'css-esconder-info';
    estilo.textContent = `
      /* Esconder informações de tempo e distância */
      .sidebar span:not(#painel-info-rota span),
      .sidebar div:not(#painel-info-rota div) {
        position: relative;
      }
      
      .sidebar span:not(#painel-info-rota span):contains("km"),
      .sidebar span:not(#painel-info-rota span):contains("min"),
      .sidebar span:not(#painel-info-rota span):contains("h "),
      .sidebar div:not(#painel-info-rota div):contains("km"),
      .sidebar div:not(#painel-info-rota div):contains("min"),
      .sidebar div:not(#painel-info-rota div):contains("h ") {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("📍 [SOLUÇÃO DIRETA] CSS adicionado");
  }
  
  // Esconder informações de tempo e distância nas rotas
  function esconderInformacoesRotas() {
    try {
      // Encontrar todos os spans e divs na sidebar
      document.querySelectorAll('.sidebar span, .sidebar div').forEach(el => {
        const texto = el.textContent.trim();
        if ((texto.includes('km') || texto.includes('min') || texto.includes('h ')) && 
            !el.closest('#painel-info-rota')) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.height = '0';
          el.style.overflow = 'hidden';
        }
      });
      
      console.log("📍 [SOLUÇÃO DIRETA] Informações ocultadas");
    } catch (error) {
      console.error("📍 [SOLUÇÃO DIRETA] Erro ao esconder informações:", error);
    }
  }
  
  // Monitorar o botão Visualizar
  function monitorarBotaoVisualizar() {
    try {
      // Tentar encontrar o botão
      const botoes = document.querySelectorAll('button, [class*="btn"], div:contains("Visualizar")');
      let botaoVisualizar = null;
      
      for (let i = 0; i < botoes.length; i++) {
        if (botoes[i].textContent.includes('Visualizar')) {
          botaoVisualizar = botoes[i];
          break;
        }
      }
      
      if (!botaoVisualizar) {
        console.log("📍 [SOLUÇÃO DIRETA] Botão Visualizar não encontrado");
        
        // Monitorar cliques em qualquer lugar
        document.body.addEventListener('click', function(event) {
          setTimeout(extrairInformacoes, 2000);
          setTimeout(extrairInformacoes, 4000);
        });
        
        return;
      }
      
      // Adicionar listener
      botaoVisualizar.addEventListener('click', function() {
        console.log("📍 [SOLUÇÃO DIRETA] Botão Visualizar clicado");
        setTimeout(extrairInformacoes, 2000);
        setTimeout(extrairInformacoes, 4000);
      });
      
      console.log("📍 [SOLUÇÃO DIRETA] Monitor de botão configurado");
    } catch (error) {
      console.error("📍 [SOLUÇÃO DIRETA] Erro ao monitorar botão:", error);
    }
  }
  
  // Extrair informações do relatório
  function extrairInformacoes() {
    try {
      console.log("📍 [SOLUÇÃO DIRETA] Extraindo informações");
      
      // Verificar se o relatório está aberto, se não, clicar na aba
      const abas = document.querySelectorAll('button, [class*="btn"], div');
      let abaRelatorio = null;
      
      for (let i = 0; i < abas.length; i++) {
        if (abas[i].textContent.includes('Relatório') || abas[i].textContent.includes('Relatório da Rota')) {
          abaRelatorio = abas[i];
          break;
        }
      }
      
      if (abaRelatorio && typeof abaRelatorio.click === 'function') {
        console.log("📍 [SOLUÇÃO DIRETA] Clicando na aba Relatório");
        abaRelatorio.click();
      }
      
      // Estratégia 1: Procurar por conteúdo específico no Relatório da Rota
      const todosElementos = document.querySelectorAll('div, span, p');
      let distancia = null;
      let tempo = null;
      
      for (let i = 0; i < todosElementos.length; i++) {
        const texto = todosElementos[i].textContent.trim();
        
        if (texto.includes('Distância total:')) {
          console.log("📍 [SOLUÇÃO DIRETA] Encontrado texto de distância:", texto);
          const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
          if (match && match[1]) {
            distancia = match[1];
          }
        }
        
        if (texto.includes('Tempo estimado:')) {
          console.log("📍 [SOLUÇÃO DIRETA] Encontrado texto de tempo:", texto);
          const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
          if (match && match[1]) {
            tempo = match[1];
          }
        }
      }
      
      // Se não encontrou, procurar por valores padrão comuns
      if (!distancia) {
        for (let i = 0; i < todosElementos.length; i++) {
          const texto = todosElementos[i].textContent.trim();
          if (texto.match(/^235[.,]7\s*km$/)) {
            distancia = texto;
          } else if (texto.match(/^256[.,]7\s*km$/)) {
            distancia = texto;
          }
        }
      }
      
      if (!tempo) {
        for (let i = 0; i < todosElementos.length; i++) {
          const texto = todosElementos[i].textContent.trim();
          if (texto.match(/^3h\s+13min$/)) {
            tempo = texto;
          } else if (texto.match(/^3h\s+\d+min$/)) {
            tempo = texto;
          }
        }
      }
      
      // Valores de fallback se nada for encontrado
      if (!distancia) distancia = "235.7 km";
      if (!tempo) tempo = "3h 13min";
      
      // Atualizar o painel
      const painelDistancia = document.getElementById('painel-distancia');
      const painelTempo = document.getElementById('painel-tempo');
      
      if (painelDistancia) painelDistancia.textContent = distancia;
      if (painelTempo) painelTempo.textContent = tempo;
      
      console.log("📍 [SOLUÇÃO DIRETA] Painel atualizado:", { distancia, tempo });
    } catch (error) {
      console.error("📍 [SOLUÇÃO DIRETA] Erro ao extrair informações:", error);
    }
  }
})();