/**
 * IMPLEMENTAÇÃO DIRETA PARA ROTAS ALTERNATIVAS
 * 
 * Este script aplica as mudanças diretamente no DOM sem depender
 * de detecção automática ou adaptação, garantindo resultados
 * consistentes em qualquer ambiente incluindo GitHub Pages.
 */
(function() {
  console.log("✨ [RotasFixDireto] Inicializando modificação direta nas rotas");
  
  // Executar imediatamente e depois periodicamente
  aplicarFix();
  setInterval(aplicarFix, 1000);
  
  // Função principal que aplica todas as modificações
  function aplicarFix() {
    // 1. Remover tempos e distâncias das alternativas
    removerInfosRotasAlternativas();
    
    // 2. Adicionar informações ao botão de visualização
    modificarBotaoVisualizar();
  }
  
  // Remove informações de tempo e distância das alternativas
  function removerInfosRotasAlternativas() {
    // Encontrar todas as rotas alternativas
    const alternativas = document.querySelectorAll('.route-alternative');
    
    // Para cada alternativa, esconder elementos de distância e tempo
    alternativas.forEach(alternativa => {
      const distancia = alternativa.querySelector('.route-distance');
      const tempo = alternativa.querySelector('.route-time');
      
      if (distancia) distancia.style.display = 'none';
      if (tempo) tempo.style.display = 'none';
      
      // Destacar o título da rota
      const titulo = alternativa.querySelector('h5');
      if (titulo) {
        titulo.style.textAlign = 'center';
        titulo.style.fontWeight = 'bold';
        titulo.style.padding = '5px 0';
      }
      
      // Adicionar estilo para destacar seleção
      alternativa.style.cursor = 'pointer';
      alternativa.style.transition = 'all 0.2s';
      alternativa.style.borderRadius = '6px';
      
      // Adicionar evento de clique para capturar dados
      if (!alternativa.getAttribute('data-modificado')) {
        alternativa.setAttribute('data-modificado', 'true');
        
        // Extrair e armazenar dados antes de esconder
        if (distancia && tempo) {
          alternativa.setAttribute('data-distancia', distancia.textContent);
          alternativa.setAttribute('data-tempo', tempo.textContent);
        }
        
        // Adicionar evento de clique
        alternativa.addEventListener('click', function() {
          // Remover destaque de todas as alternativas
          document.querySelectorAll('.route-alternative').forEach(alt => {
            alt.style.backgroundColor = '';
            alt.style.borderColor = '';
            alt.style.boxShadow = '';
          });
          
          // Destacar esta alternativa
          this.style.backgroundColor = '#fffbeb';
          this.style.borderColor = '#ffd966';
          this.style.boxShadow = '0 0 0 2px rgba(255, 217, 102, 0.5)';
          
          // Extrair dados para mostrar no botão
          const dist = this.getAttribute('data-distancia');
          const t = this.getAttribute('data-tempo');
          
          // Atualizar botão com estas informações
          atualizarInfoNoBotao(dist, t);
        });
      }
    });
    
    // Simplificar texto explicativo
    const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted');
    if (textoExplicativo) {
      textoExplicativo.innerHTML = 'Selecione uma rota e clique em <strong>Visualizar</strong> para ver detalhes.';
      textoExplicativo.style.fontStyle = 'italic';
      textoExplicativo.style.fontSize = '13px';
      textoExplicativo.style.textAlign = 'center';
    }
  }
  
  // Modificar botão visualizar para mostrar informações da rota
  function modificarBotaoVisualizar() {
    const botao = document.getElementById('visualize-button');
    if (!botao) return;
    
    // Verificar se já foi modificado
    if (botao.getAttribute('data-modificado')) return;
    botao.setAttribute('data-modificado', 'true');
    
    // Armazenar estilo original do botão
    const estiloOriginal = {
      backgroundColor: botao.style.backgroundColor,
      padding: botao.style.padding,
      borderRadius: botao.style.borderRadius,
      color: botao.style.color,
      fontWeight: botao.style.fontWeight
    };
    
    // Melhorar aparência do botão
    botao.style.backgroundColor = '#ffc107';
    botao.style.padding = '8px 15px';
    botao.style.borderRadius = '4px';
    botao.style.color = '#212529';
    botao.style.fontWeight = 'bold';
    botao.style.transition = 'all 0.2s';
    
    // Criar container para botão e informações
    const container = document.createElement('div');
    container.id = 'botao-info-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '10px 0';
    container.style.padding = '5px';
    container.style.borderRadius = '6px';
    container.style.backgroundColor = '#f5f5f5';
    
    // Substituir botão atual pelo container
    const pai = botao.parentNode;
    pai.removeChild(botao);
    container.appendChild(botao);
    
    // Criar área de informações
    const infoArea = document.createElement('div');
    infoArea.id = 'botao-info-area';
    infoArea.style.marginLeft = '15px';
    infoArea.style.fontSize = '14px';
    infoArea.style.color = '#555';
    infoArea.style.padding = '5px 10px';
    infoArea.style.backgroundColor = 'white';
    infoArea.style.borderRadius = '4px';
    infoArea.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    
    // Criar elementos para distância e tempo
    infoArea.innerHTML = `
      <div id="botao-info-distancia" style="margin-bottom: 4px;">
        <i class="fas fa-road" style="margin-right: 6px;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="botao-info-tempo">
        <i class="fas fa-clock" style="margin-right: 6px;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar área de informações ao container
    container.appendChild(infoArea);
    
    // Adicionar container ao DOM
    pai.appendChild(container);
    
    // Adicionar estilos para Font Awesome se necessário
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(faLink);
    }
    
    // Adicionar manipulador de clique para o botão
    const clickOriginal = botao.onclick;
    botao.onclick = function(event) {
      // Executar handler original
      if (clickOriginal) clickOriginal.call(this, event);
      
      // Encontrar alternativa selecionada e buscar informações
      const alternativaSelecionada = document.querySelector('.route-alternative[style*="background-color"]');
      if (alternativaSelecionada) {
        const dist = alternativaSelecionada.getAttribute('data-distancia');
        const tempo = alternativaSelecionada.getAttribute('data-tempo');
        atualizarInfoNoBotao(dist, tempo);
      }
    };
  }
  
  // Atualizar informações no botão
  function atualizarInfoNoBotao(distancia, tempo) {
    if (!distancia || !tempo) return;
    
    const distanciaEl = document.getElementById('botao-info-distancia');
    const tempoEl = document.getElementById('botao-info-tempo');
    
    if (distanciaEl && tempoEl) {
      distanciaEl.innerHTML = `<i class="fas fa-road" style="margin-right: 6px;"></i> ${distancia}`;
      tempoEl.innerHTML = `<i class="fas fa-clock" style="margin-right: 6px;"></i> ${tempo}`;
      
      // Animação para destacar atualização
      [distanciaEl, tempoEl].forEach(el => {
        el.style.animation = 'none';
        setTimeout(() => {
          el.style.animation = 'pulsar 0.5s ease';
        }, 10);
      });
      
      // Adicionar estilo de animação se não existir
      if (!document.getElementById('rotas-fix-styles')) {
        const style = document.createElement('style');
        style.id = 'rotas-fix-styles';
        style.textContent = `
          @keyframes pulsar {
            0% { background-color: #fff; }
            50% { background-color: #fffde7; }
            100% { background-color: #fff; }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
})();