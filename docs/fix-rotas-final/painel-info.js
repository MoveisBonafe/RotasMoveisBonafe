/**
 * PAINEL DE INFORMAÇÕES PARA ROTAS ALTERNATIVAS
 * 
 * Este script cria um painel elegante ao lado do botão Visualizar
 * para mostrar informações de distância e tempo da rota selecionada.
 */
(function() {
  console.log("📊 [PainelInfo] Inicializando");
  
  // Variáveis para controle
  let painelCriado = false;
  let tentativas = 0;
  const MAX_TENTATIVAS = 10;
  
  // Executar quando a página carrega
  window.addEventListener('load', iniciar);
  
  // Também tentar imediatamente
  setTimeout(iniciar, 100);
  
  // E em intervalos
  const intervalos = [500, 1000, 2000, 3000, 5000];
  intervalos.forEach(tempo => {
    setTimeout(iniciar, tempo);
  });
  
  // Escutar evento de rota selecionada
  document.addEventListener('rotaSelecionada', function(e) {
    atualizarPainel(e.detail.distancia, e.detail.tempo);
  });
  
  // Função principal
  function iniciar() {
    console.log(`📊 [PainelInfo] Tentativa ${tentativas+1} de ${MAX_TENTATIVAS}`);
    
    if (painelCriado || tentativas >= MAX_TENTATIVAS) {
      return;
    }
    
    tentativas++;
    
    // 1. Adicionar CSS para o painel
    adicionarCSS();
    
    // 2. Criar painel de informações
    const resultado = criarPainel();
    
    if (resultado) {
      painelCriado = true;
    }
  }
  
  // Adicionar CSS para o painel
  function adicionarCSS() {
    if (document.getElementById('css-painel-info')) {
      return;
    }
    
    const estilo = document.createElement('style');
    estilo.id = 'css-painel-info';
    estilo.textContent = `
      /* Container que contém botão e painel */
      #container-info-rotas {
        display: flex;
        align-items: center;
        margin: 10px 0;
        padding: 5px;
        background-color: #f8f9fa;
        border-radius: 6px;
      }
      
      /* Painel de informações */
      #painel-info-rotas {
        margin-left: 15px;
        padding: 8px 12px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #555;
      }
      
      /* Estilo para o botão Visualizar */
      #visualize-button {
        background-color: #ffc107 !important;
        color: #212529 !important;
        font-weight: bold !important;
        border-radius: 4px !important;
        border: none !important;
        padding: 8px 15px !important;
      }
      
      /* Animação para informações atualizadas */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-3px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .info-atualizada {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("📊 [PainelInfo] CSS adicionado");
  }
  
  // Criar painel de informações
  function criarPainel() {
    // Verificar se já existe
    if (document.getElementById('container-info-rotas')) {
      return true;
    }
    
    // Encontrar botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    
    if (!botaoVisualizar) {
      console.log("📊 [PainelInfo] Botão Visualizar não encontrado");
      
      // Tentar qualquer botão que possa ser o Visualizar
      const botoes = document.querySelectorAll('button');
      let botaoEncontrado = null;
      
      for (let i = 0; i < botoes.length; i++) {
        const texto = botoes[i].textContent || '';
        if (texto.includes('Visualizar')) {
          botaoEncontrado = botoes[i];
          break;
        }
      }
      
      if (!botaoEncontrado) {
        return false;
      }
      
      console.log("📊 [PainelInfo] Botão Visualizar encontrado por texto");
      botaoVisualizar = botaoEncontrado;
    }
    
    console.log("📊 [PainelInfo] Criando painel");
    
    // Criar container
    const container = document.createElement('div');
    container.id = 'container-info-rotas';
    
    // Mover botão para container
    const parent = botaoVisualizar.parentNode;
    parent.removeChild(botaoVisualizar);
    container.appendChild(botaoVisualizar);
    
    // Criar painel
    const painel = document.createElement('div');
    painel.id = 'painel-info-rotas';
    painel.innerHTML = `
      <div id="info-dist" style="margin-bottom: 6px;">
        <i class="fa fa-road" style="margin-right: 5px;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo">
        <i class="fa fa-clock" style="margin-right: 5px;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar painel ao container
    container.appendChild(painel);
    
    // Adicionar container ao DOM
    parent.appendChild(container);
    
    // Garantir que o Font Awesome está disponível
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
      
      // Atualizar informações
      const rotaSelecionada = document.querySelector('.rota-selecionada');
      if (rotaSelecionada) {
        atualizarPainel(
          rotaSelecionada.getAttribute('data-distancia'),
          rotaSelecionada.getAttribute('data-tempo')
        );
      }
    };
    
    return true;
  }
  
  // Atualizar informações no painel
  function atualizarPainel(distancia, tempo) {
    if (!distancia || !tempo) {
      return;
    }
    
    const distanciaEl = document.getElementById('info-dist');
    const tempoEl = document.getElementById('info-tempo');
    
    if (distanciaEl && tempoEl) {
      // Atualizar conteúdo
      distanciaEl.innerHTML = `
        <i class="fa fa-road" style="margin-right: 5px;"></i>
        <span>${distancia}</span>
      `;
      
      tempoEl.innerHTML = `
        <i class="fa fa-clock" style="margin-right: 5px;"></i>
        <span>${tempo}</span>
      `;
      
      // Adicionar animação
      distanciaEl.classList.add('info-atualizada');
      tempoEl.classList.add('info-atualizada');
      
      // Remover classe após animação
      setTimeout(function() {
        distanciaEl.classList.remove('info-atualizada');
        tempoEl.classList.remove('info-atualizada');
      }, 500);
      
      console.log(`📊 [PainelInfo] Painel atualizado - ${distancia}, ${tempo}`);
    }
  }
})();