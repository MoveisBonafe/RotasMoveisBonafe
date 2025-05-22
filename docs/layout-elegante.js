/**
 * Layout Elegante para Rotas Alternativas
 * 
 * Este script:
 * 1. Remove informações de tempo/distância das rotas alternativas
 * 2. Adiciona essas informações de forma elegante junto ao botão Visualizar
 * 3. Mantém apenas o título das rotas alternativas para seleção
 */
(function() {
  console.log("🎨 [LayoutElegante] Iniciando reorganização de layout");
  
  // Executar após carregamento completo
  window.addEventListener('load', inicializar);
  setTimeout(inicializar, 1500);
  setTimeout(inicializar, 3000);
  
  function inicializar() {
    console.log("🎨 [LayoutElegante] Configurando observadores");
    
    // Observar quando as rotas alternativas aparecerem
    observarRotasAlternativas();
    
    // Observar quando o botão Visualizar for clicado
    observarBotaoVisualizar();
    
    console.log("🎨 [LayoutElegante] Configuração concluída");
  }
  
  // Observar quando as rotas alternativas aparecerem
  function observarRotasAlternativas() {
    // Verificar periodicamente pela presença do container
    const verificador = setInterval(() => {
      const rotasContainer = document.querySelector('.route-alternative-box');
      if (rotasContainer) {
        clearInterval(verificador);
        console.log("🎨 [LayoutElegante] Container de rotas alternativas encontrado");
        
        // Aplicar alterações
        reorganizarRotasAlternativas(rotasContainer);
        
        // Continuar observando mudanças
        observarMudancasNasRotas();
      }
    }, 500);
  }
  
  // Observar mudanças nas rotas alternativas
  function observarMudancasNasRotas() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          const container = document.querySelector('.route-alternative-box');
          if (container) {
            reorganizarRotasAlternativas(container);
          }
        }
      });
    });
    
    // Observar o corpo do documento para capturar quando as alternativas aparecerem
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Reorganizar as rotas alternativas
  function reorganizarRotasAlternativas(container) {
    console.log("🎨 [LayoutElegante] Reorganizando rotas alternativas");
    
    // Verificar se já foi modificado para evitar duplicação
    if (container.getAttribute('data-layout-modified')) return;
    
    // Encontrar todos os cards de rota
    const rotasCards = container.querySelectorAll('.route-alternative');
    if (!rotasCards.length) return;
    
    // Processar cada card
    rotasCards.forEach(card => {
      // Extrair informações antes de remover
      const titulo = card.querySelector('h5')?.textContent || 'Rota Alternativa';
      
      // Extrair distância e tempo se disponíveis
      const distanciaEl = card.querySelector('.route-distance');
      const tempoEl = card.querySelector('.route-time');
      
      const distancia = distanciaEl ? distanciaEl.textContent.trim() : '';
      const tempo = tempoEl ? tempoEl.textContent.trim() : '';
      
      // Armazenar dados nos atributos do card para uso posterior
      card.setAttribute('data-route-distance', distancia);
      card.setAttribute('data-route-time', tempo);
      
      // Remover elementos de distância e tempo
      if (distanciaEl) distanciaEl.style.display = 'none';
      if (tempoEl) tempoEl.style.display = 'none';
      
      // Adicionar evento para capturar quando o usuário clicar na rota
      card.addEventListener('click', function() {
        // Marcar que esta rota foi selecionada
        setTimeout(() => {
          const todasRotas = document.querySelectorAll('.route-alternative');
          todasRotas.forEach(r => r.removeAttribute('data-selected'));
          card.setAttribute('data-selected', 'true');
          
          // Atualizar informações no botão visualizar
          atualizarBotaoVisualizar(distancia, tempo);
        }, 100);
      });
    });
    
    // Simplificar texto de explicação
    const textoExplicacao = container.querySelector('p.text-muted');
    if (textoExplicacao) {
      textoExplicacao.textContent = 'Selecione uma rota e clique em Visualizar para detalhes.';
      textoExplicacao.style.fontStyle = 'italic';
      textoExplicacao.style.fontSize = '13px';
      textoExplicacao.style.textAlign = 'center';
      textoExplicacao.style.margin = '8px 0';
    }
    
    // Marcar como modificado
    container.setAttribute('data-layout-modified', 'true');
    
    console.log("🎨 [LayoutElegante] Rotas alternativas reorganizadas");
  }
  
  // Observar quando o botão visualizar for clicado
  function observarBotaoVisualizar() {
    // Encontrar o botão
    const botaoVisualizar = document.getElementById('visualize-button');
    if (!botaoVisualizar) {
      setTimeout(observarBotaoVisualizar, 500);
      return;
    }
    
    // Adicionar container para informações
    adicionarContainerInfo(botaoVisualizar);
    
    // Adicionar click handler
    const clickOriginal = botaoVisualizar.onclick;
    botaoVisualizar.onclick = function(event) {
      // Executar comportamento original
      if (clickOriginal) clickOriginal.call(this, event);
      
      // Capturar informações da rota selecionada e atualizar
      const rotaSelecionada = document.querySelector('.route-alternative[data-selected="true"]');
      if (rotaSelecionada) {
        const distancia = rotaSelecionada.getAttribute('data-route-distance');
        const tempo = rotaSelecionada.getAttribute('data-route-time');
        atualizarBotaoVisualizar(distancia, tempo);
      }
    };
    
    console.log("🎨 [LayoutElegante] Botão visualizar configurado");
  }
  
  // Adicionar container para informações junto ao botão
  function adicionarContainerInfo(botao) {
    // Verificar se já existe
    let infoContainer = document.getElementById('botao-info-container');
    
    if (!infoContainer) {
      // Criar o container
      infoContainer = document.createElement('div');
      infoContainer.id = 'botao-info-container';
      infoContainer.style.display = 'flex';
      infoContainer.style.alignItems = 'center';
      infoContainer.style.marginTop = '10px';
      
      // Adicionar botão ao container
      const pai = botao.parentElement;
      pai.removeChild(botao);
      
      // Adicionar informações da rota
      const infoRota = document.createElement('div');
      infoRota.id = 'botao-info-rota';
      infoRota.style.marginLeft = '10px';
      infoRota.style.fontSize = '14px';
      infoRota.style.color = '#555';
      
      // Criar elementos para distância e tempo
      const distanciaEl = document.createElement('div');
      distanciaEl.id = 'botao-info-distancia';
      distanciaEl.style.marginBottom = '3px';
      
      const tempoEl = document.createElement('div');
      tempoEl.id = 'botao-info-tempo';
      
      // Adicionar ao container de informações
      infoRota.appendChild(distanciaEl);
      infoRota.appendChild(tempoEl);
      
      // Montar estrutura completa
      infoContainer.appendChild(botao);
      infoContainer.appendChild(infoRota);
      
      // Estilizar botão
      botao.style.minWidth = '120px';
      
      // Adicionar ao DOM
      pai.appendChild(infoContainer);
    }
  }
  
  // Atualizar informações no botão visualizar
  function atualizarBotaoVisualizar(distancia, tempo) {
    if (!distancia || !tempo) return;
    
    const distanciaEl = document.getElementById('botao-info-distancia');
    const tempoEl = document.getElementById('botao-info-tempo');
    
    if (distanciaEl && tempoEl) {
      // Criar ícones e formatação
      distanciaEl.innerHTML = `<i class="fas fa-road" style="margin-right: 5px;"></i> ${distancia}`;
      tempoEl.innerHTML = `<i class="fas fa-clock" style="margin-right: 5px;"></i> ${tempo}`;
      
      // Adicionar classe de fade-in para animação
      distanciaEl.classList.add('fade-in');
      tempoEl.classList.add('fade-in');
      
      // Adicionar CSS se necessário
      if (!document.getElementById('info-botao-style')) {
        const style = document.createElement('style');
        style.id = 'info-botao-style';
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in {
            animation: fadeIn 0.3s ease-in-out forwards;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
})();