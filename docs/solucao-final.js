/**
 * SOLUÇÃO DEFINITIVA PARA ROTAS ALTERNATIVAS
 * 
 * Este script força mudanças diretas na interface, lidando com casos específicos
 * como o GitHub Pages onde seletores CSS normais podem não funcionar.
 */

// Executar apenas quando o DOM estiver totalmente carregado
window.addEventListener('load', function() {
  // Também usar DOMContentLoaded como backup
  document.addEventListener('DOMContentLoaded', iniciarCorrecoes);
  
  // Iniciar as correções agora e em intervalos regulares
  iniciarCorrecoes();
  setInterval(iniciarCorrecoes, 2000);
});

// Função principal de correções
function iniciarCorrecoes() {
  console.log("🎯 [Solução Final] Aplicando correções forçadas");
  
  // Aplicar todas as correções necessárias
  esconderTempoDistancia();
  modificarEstiloRotas();
  criarContainerInfoRotas();
  
  // Tentativas adicionais para garantir
  setTimeout(esconderTempoDistancia, 500);
  setTimeout(modificarEstiloRotas, 1000);
  setTimeout(criarContainerInfoRotas, 1500);
}

// Esconder elementos de tempo e distância usando vários métodos
function esconderTempoDistancia() {
  // Método 1: CSS Display None
  const estilos = document.createElement('style');
  estilos.textContent = `
    /* Esconder tempo e distância usando CSS */
    .route-alternative .route-distance,
    .route-alternative .route-time,
    .route-alternative div[class*="distance"],
    .route-alternative div[class*="time"],
    .route-alternative span[class*="distance"],
    .route-alternative span[class*="time"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      pointer-events: none !important;
    }
    
    /* Aumentar tamanho do título para compensar */
    .route-alternative h5 {
      text-align: center !important;
      padding: 10px 0 !important;
      font-size: 16px !important;
      margin: 0 !important;
    }
    
    /* Melhorar estilo das rotas alternativas */
    .route-alternative {
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      padding: 10px 15px !important;
      border-radius: 6px !important;
      margin-bottom: 8px !important;
    }
    
    .route-alternative:hover {
      background-color: #f0f8ff !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
    }
    
    .route-alternative.selecionada {
      background-color: #fff9e6 !important;
      border-color: #ffd966 !important;
      box-shadow: 0 0 0 2px rgba(255,217,102,0.5) !important;
    }
  `;
  
  // Adicionar estilos ao DOM se ainda não existirem
  if (!document.getElementById('estilos-correcao')) {
    estilos.id = 'estilos-correcao';
    document.head.appendChild(estilos);
  }
  
  // Método 2: Manipulação direta do DOM
  document.querySelectorAll('.route-alternative').forEach(function(rota) {
    // Encontrar e ocultar elementos de distância e tempo
    const divsNaRota = rota.querySelectorAll('div');
    
    divsNaRota.forEach(function(div) {
      // Salvar texto se contiver km ou min
      const texto = div.textContent || '';
      
      if (texto.includes('km')) {
        rota.setAttribute('data-distancia', texto.trim());
        div.style.display = 'none';
      } else if (texto.includes('min')) {
        rota.setAttribute('data-tempo', texto.trim());
        div.style.display = 'none';
      }
    });
    
    // Garantir que temos dados salvos
    if (!rota.getAttribute('data-processado')) {
      // Buscar elementos específicos
      const distanciaEls = rota.querySelectorAll('.route-distance, [class*="distance"]');
      const tempoEls = rota.querySelectorAll('.route-time, [class*="time"]');
      
      distanciaEls.forEach(el => {
        if (!rota.getAttribute('data-distancia')) {
          rota.setAttribute('data-distancia', el.textContent.trim());
        }
        el.style.display = 'none';
      });
      
      tempoEls.forEach(el => {
        if (!rota.getAttribute('data-tempo')) {
          rota.setAttribute('data-tempo', el.textContent.trim());
        }
        el.style.display = 'none';
      });
      
      // Marcar como processado
      rota.setAttribute('data-processado', 'true');
    }
  });
  
  // Modificar texto explicativo
  const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted');
  if (textoExplicativo) {
    textoExplicativo.textContent = 'Selecione uma rota e clique em Visualizar para ver detalhes.';
    textoExplicativo.style.fontStyle = 'italic';
    textoExplicativo.style.textAlign = 'center';
    textoExplicativo.style.fontSize = '13px';
    textoExplicativo.style.margin = '10px 0';
  }
}

// Modificar estilo das rotas alternativas
function modificarEstiloRotas() {
  document.querySelectorAll('.route-alternative').forEach(function(rota) {
    // Aplicar estilos
    rota.style.cursor = 'pointer';
    rota.style.transition = 'all 0.2s ease';
    rota.style.padding = '10px 15px';
    rota.style.borderRadius = '6px';
    rota.style.marginBottom = '8px';
    
    // Configurar eventos
    if (!rota.getAttribute('data-eventos')) {
      rota.setAttribute('data-eventos', 'true');
      
      // Evento de hover
      rota.addEventListener('mouseover', function() {
        if (!this.classList.contains('selecionada')) {
          this.style.backgroundColor = '#f0f8ff';
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        }
      });
      
      rota.addEventListener('mouseout', function() {
        if (!this.classList.contains('selecionada')) {
          this.style.backgroundColor = '';
          this.style.transform = '';
          this.style.boxShadow = '';
        }
      });
      
      // Evento de clique
      rota.addEventListener('click', function() {
        // Remover seleção das outras rotas
        document.querySelectorAll('.route-alternative').forEach(r => {
          r.classList.remove('selecionada');
          r.style.backgroundColor = '';
          r.style.borderColor = '';
          r.style.boxShadow = '';
        });
        
        // Adicionar seleção a esta rota
        this.classList.add('selecionada');
        this.style.backgroundColor = '#fff9e6';
        this.style.borderColor = '#ffd966';
        this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
        
        // Atualizar informações
        atualizarInfoBotao(
          this.getAttribute('data-distancia'), 
          this.getAttribute('data-tempo')
        );
      });
    }
  });
}

// Criar container para informações junto ao botão Visualizar
function criarContainerInfoRotas() {
  // Verificar se já existe
  if (document.getElementById('container-info-botao')) {
    return;
  }
  
  // Encontrar botão
  const botaoVisualizar = document.getElementById('visualize-button');
  if (!botaoVisualizar) {
    console.log("🎯 [Solução Final] Botão Visualizar não encontrado");
    return;
  }
  
  console.log("🎯 [Solução Final] Criando container para informações");
  
  // Melhorar aparência do botão
  botaoVisualizar.style.backgroundColor = '#ffc107';
  botaoVisualizar.style.color = '#212529';
  botaoVisualizar.style.fontWeight = 'bold';
  botaoVisualizar.style.padding = '8px 15px';
  botaoVisualizar.style.borderRadius = '4px';
  botaoVisualizar.style.border = 'none';
  botaoVisualizar.style.cursor = 'pointer';
  botaoVisualizar.style.minWidth = '120px';
  botaoVisualizar.style.textAlign = 'center';
  
  // Criar container
  const container = document.createElement('div');
  container.id = 'container-info-botao';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.marginTop = '10px';
  container.style.marginBottom = '10px';
  container.style.padding = '5px';
  container.style.backgroundColor = '#f8f9fa';
  container.style.borderRadius = '6px';
  
  // Mover botão para container
  const parent = botaoVisualizar.parentNode;
  parent.removeChild(botaoVisualizar);
  container.appendChild(botaoVisualizar);
  
  // Criar área de informações
  const infoArea = document.createElement('div');
  infoArea.id = 'area-info-rota';
  infoArea.style.marginLeft = '15px';
  infoArea.style.padding = '8px 12px';
  infoArea.style.backgroundColor = 'white';
  infoArea.style.borderRadius = '4px';
  infoArea.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  infoArea.style.fontSize = '14px';
  infoArea.style.color = '#555';
  
  // Adicionar elementos para distância e tempo
  infoArea.innerHTML = `
    <div id="area-info-distancia" style="margin-bottom: 6px; display: flex; align-items: center;">
      <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
      <span>Selecione uma rota</span>
    </div>
    <div id="area-info-tempo" style="display: flex; align-items: center;">
      <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
      <span>Selecione uma rota</span>
    </div>
  `;
  
  // Adicionar área ao container
  container.appendChild(infoArea);
  
  // Adicionar container ao DOM
  parent.appendChild(container);
  
  // Adicionar Font Awesome se necessário
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
  }
  
  // Interceptar clique no botão
  const clickOriginal = botaoVisualizar.onclick;
  botaoVisualizar.onclick = function(event) {
    // Executar comportamento original
    if (clickOriginal) {
      clickOriginal.call(this, event);
    }
    
    // Atualizar informações da rota selecionada
    const rotaSelecionada = document.querySelector('.route-alternative.selecionada');
    if (rotaSelecionada) {
      atualizarInfoBotao(
        rotaSelecionada.getAttribute('data-distancia'),
        rotaSelecionada.getAttribute('data-tempo')
      );
    }
  };
}

// Atualizar informações no botão
function atualizarInfoBotao(distancia, tempo) {
  if (!distancia || !tempo) return;
  
  console.log("🎯 [Solução Final] Atualizando informações:", distancia, tempo);
  
  const distanciaEl = document.getElementById('area-info-distancia');
  const tempoEl = document.getElementById('area-info-tempo');
  
  if (distanciaEl && tempoEl) {
    distanciaEl.innerHTML = `
      <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
      <span>${distancia}</span>
    `;
    
    tempoEl.innerHTML = `
      <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
      <span>${tempo}</span>
    `;
  }
}