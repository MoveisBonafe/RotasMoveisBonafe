// COPIE E COLE ESTE SCRIPT NO CONSOLE DO NAVEGADOR
// ENQUANTO VISUALIZA UMA ROTA NO GITHUB PAGES

(function() {
  console.log("🔧 Iniciando modificação manual das rotas alternativas");

  // 1. Ocultar informações de tempo e distância nas rotas
  const css = `
    .route-alternative .route-distance,
    .route-alternative .route-time {
      display: none !important;
      visibility: hidden !important;
    }
    
    .route-alternative {
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      border-radius: 6px !important;
      padding: 10px !important;
      margin-bottom: 8px !important;
    }
    
    .route-alternative h5 {
      text-align: center !important;
      margin: 0 !important;
      padding: 5px 0 !important;
    }
    
    .rota-selecionada {
      background-color: #fff9e6 !important;
      border-color: #ffd966 !important;
      box-shadow: 0 0 0 2px rgba(255,217,102,0.5) !important;
    }
    
    #container-info-manual {
      display: flex !important;
      align-items: center !important;
      margin: 15px 0 !important;
      padding: 5px !important;
      background-color: #f8f9fa !important;
      border-radius: 8px !important;
    }
    
    #painel-info-manual {
      margin-left: 15px !important;
      padding: 8px 12px !important;
      background-color: white !important;
      border-radius: 6px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
      font-size: 14px !important;
      color: #555 !important;
    }
  `;
  
  // Adicionar CSS
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  
  // 2. Processar rotas alternativas - em um único bloco
  console.log("🔧 Buscando rotas alternativas...");
  const rotas = document.querySelectorAll('.route-alternative');
  
  if (rotas.length === 0) {
    console.log("🔧 Nenhuma rota alternativa encontrada. Adicione pontos e calcule uma rota primeiro.");
    return;
  }
  
  console.log(`🔧 Encontradas ${rotas.length} rotas alternativas!`);
  
  // 3. Manipular cada rota
  rotas.forEach(function(rota) {
    // Extrair informações
    const distanciaEl = rota.querySelector('.route-distance');
    const tempoEl = rota.querySelector('.route-time');
    
    let distancia = "N/A";
    let tempo = "N/A";
    
    if (distanciaEl) {
      distancia = distanciaEl.textContent.trim();
      console.log(`🔧 Distância: ${distancia}`);
    }
    
    if (tempoEl) {
      tempo = tempoEl.textContent.trim();
      console.log(`🔧 Tempo: ${tempo}`);
    }
    
    // Guardar dados
    rota.setAttribute('data-distancia', distancia);
    rota.setAttribute('data-tempo', tempo);
    
    // Adicionar evento de clique
    rota.addEventListener('click', function() {
      // Remover seleção anterior
      document.querySelectorAll('.route-alternative').forEach(r => {
        r.classList.remove('rota-selecionada');
      });
      
      // Selecionar esta rota
      this.classList.add('rota-selecionada');
      
      // Atualizar painel
      const distEl = document.querySelector('#info-dist-manual');
      const tempoEl = document.querySelector('#info-tempo-manual');
      
      if (distEl && tempoEl) {
        distEl.innerHTML = `<i class="fa fa-road" style="margin-right: 5px;"></i> ${this.getAttribute('data-distancia')}`;
        tempoEl.innerHTML = `<i class="fa fa-clock" style="margin-right: 5px;"></i> ${this.getAttribute('data-tempo')}`;
      }
    });
  });
  
  // 4. Modificar botão Visualizar
  const botaoVisualizar = document.getElementById('visualize-button');
  
  if (!botaoVisualizar) {
    console.log("🔧 Botão Visualizar não encontrado");
    return;
  }
  
  console.log("🔧 Modificando botão Visualizar");
  
  // Estilizar botão
  botaoVisualizar.style.backgroundColor = '#ffc107';
  botaoVisualizar.style.color = '#212529';
  botaoVisualizar.style.fontWeight = 'bold';
  botaoVisualizar.style.padding = '8px 15px';
  botaoVisualizar.style.borderRadius = '4px';
  botaoVisualizar.style.border = 'none';
  botaoVisualizar.style.minWidth = '120px';
  
  // Criar container
  const container = document.createElement('div');
  container.id = 'container-info-manual';
  
  // Mover botão
  const parent = botaoVisualizar.parentNode;
  parent.removeChild(botaoVisualizar);
  container.appendChild(botaoVisualizar);
  
  // Criar painel de informações
  const painel = document.createElement('div');
  painel.id = 'painel-info-manual';
  painel.innerHTML = `
    <div id="info-dist-manual" style="margin-bottom: 6px; display: flex; align-items: center;">
      <i class="fa fa-road" style="margin-right: 5px;"></i>
      <span>Selecione uma rota</span>
    </div>
    <div id="info-tempo-manual" style="display: flex; align-items: center;">
      <i class="fa fa-clock" style="margin-right: 5px;"></i>
      <span>Selecione uma rota</span>
    </div>
  `;
  
  // Adicionar painel ao container
  container.appendChild(painel);
  
  // Adicionar container de volta ao DOM
  parent.appendChild(container);
  
  // Modificar texto explicativo
  const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted');
  if (textoExplicativo) {
    textoExplicativo.textContent = 'Selecione uma rota e clique em Visualizar para ver detalhes.';
    textoExplicativo.style.textAlign = 'center';
    textoExplicativo.style.fontStyle = 'italic';
    textoExplicativo.style.fontSize = '13px';
  }
  
  // Selecionar primeira rota automaticamente
  if (rotas.length > 0) {
    rotas[0].click();
  }
  
  console.log("🔧 Modificação manual concluída com sucesso!");
})();