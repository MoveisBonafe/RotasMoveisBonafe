/**
 * CORREÇÃO PARA ESTILO DOS BOTÕES
 * 
 * Este script:
 * 1. Padroniza todos os botões de ação (Otimizar, Visualizar, etc)
 * 2. Aplica estilo consistente com gradiente e ícones
 * 3. Estiliza botões das abas inferiores
 */

(function() {
  console.log("[BotoesUI] Iniciando padronização dos botões");
  
  // Executar agora e após carregamento completo
  setTimeout(padronizarBotoes, 500);
  setTimeout(padronizarBotoes, 1500);
  window.addEventListener('load', padronizarBotoes);
  
  // Observar mudanças para aplicar estilização conforme DOM muda
  const observer = new MutationObserver(function() {
    setTimeout(padronizarBotoes, 200);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Função principal que estiliza os botões
  function padronizarBotoes() {
    console.log("[BotoesUI] Aplicando estilo aos botões");
    
    // Estilo CSS para botões
    injetarEstilos();
    
    // 1. ESTILIZAR BOTÕES PRINCIPAIS
    // Identificar e processar cada botão de ação principal
    const botoes = document.querySelectorAll('.action-button, .button-primary, [class*="visualizar"], [class*="otimizar"]');
    
    botoes.forEach(function(botao) {
      // Verificar se já processamos este botão
      if (botao.hasAttribute('data-styled')) return;
      
      // Marcar como processado
      botao.setAttribute('data-styled', 'true');
      
      // Adicionar classe especial para controle de estilo
      botao.classList.add('botao-padronizado');
      
      // Se tiver ícone, manter
      const textoOriginal = botao.textContent.trim();
      
      // Adicionar ícone se necessário
      if (!botao.querySelector('i, span.icon, span.material-icons')) {
        // Determinar qual ícone adicionar
        let icone = '';
        const textoBotao = textoOriginal.toLowerCase();
        
        if (textoBotao.includes('visualizar')) {
          icone = '<i class="fas fa-eye"></i>';
        } else if (textoBotao.includes('otimizar')) {
          icone = '<i class="fas fa-route"></i>';
        } else if (textoBotao.includes('adicionar')) {
          icone = '<i class="fas fa-plus"></i>';
        } else if (textoBotao.includes('importar')) {
          icone = '<i class="fas fa-file-import"></i>';
        } else if (textoBotao.includes('exportar')) {
          icone = '<i class="fas fa-file-export"></i>';
        } else if (textoBotao.includes('salvar')) {
          icone = '<i class="fas fa-save"></i>';
        } else {
          icone = '<i class="fas fa-check"></i>';
        }
        
        // Colocar ícone antes do texto
        botao.innerHTML = icone + ' ' + textoOriginal;
      }
      
      console.log(`[BotoesUI] Botão padronizado: ${textoOriginal}`);
    });
    
    // 2. ESTILIZAR BOTÕES DAS ABAS INFERIORES
    const botoesInferiores = document.querySelectorAll('.bottom-tab-button, .tab-button');
    
    botoesInferiores.forEach(function(botao) {
      // Verificar se já processamos este botão
      if (botao.hasAttribute('data-styled-tab')) return;
      
      // Marcar como processado
      botao.setAttribute('data-styled-tab', 'true');
      
      // Adicionar classe para estilização
      botao.classList.add('botao-tab-padronizado');
      
      console.log(`[BotoesUI] Botão de aba estilizado: ${botao.textContent.trim()}`);
    });
    
    // 3. GARANTIR QUE OS BOTÕES VISUALIZAR/OTIMIZAR ESTÃO CORRETOS
    const botaoVisualizar = document.querySelector('[class*="visualizar"], button:contains("Visualizar")');
    const botaoOtimizar = document.querySelector('[class*="otimizar"], button:contains("Otimizar")');
    
    if (botaoVisualizar) {
      botaoVisualizar.className = 'botao-padronizado botao-visualizar';
      // Garantir que tenha o ícone
      if (!botaoVisualizar.querySelector('i')) {
        const texto = botaoVisualizar.textContent.trim();
        botaoVisualizar.innerHTML = '<i class="fas fa-eye"></i> ' + texto;
      }
    }
    
    if (botaoOtimizar) {
      botaoOtimizar.className = 'botao-padronizado botao-otimizar';
      // Garantir que tenha o ícone
      if (!botaoOtimizar.querySelector('i')) {
        const texto = botaoOtimizar.textContent.trim();
        botaoOtimizar.innerHTML = '<i class="fas fa-route"></i> ' + texto;
      }
    }
    
    console.log("[BotoesUI] Padronização de botões completa");
  }
  
  // Função para injetar os estilos CSS para os botões
  function injetarEstilos() {
    // Verificar se já injetamos o estilo
    if (document.getElementById('botoes-ui-styles')) return;
    
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.id = 'botoes-ui-styles';
    
    style.textContent = `
      /* Estilo base para todos os botões padronizados */
      .botao-padronizado {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 10px 20px !important;
        border-radius: 50px !important;
        border: none !important;
        font-weight: bold !important;
        font-size: 16px !important;
        color: white !important;
        cursor: pointer !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease !important;
        text-align: center !important;
        width: 100% !important;
        margin: 8px 0 !important;
        text-decoration: none !important;
        background: linear-gradient(45deg, #FF9500, #FF5722) !important;
      }
      
      /* Ícones nos botões */
      .botao-padronizado i {
        margin-right: 8px !important;
      }
      
      /* Efeito hover */
      .botao-padronizado:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
        background: linear-gradient(45deg, #FF5722, #FF9500) !important;
      }
      
      /* Efeito active */
      .botao-padronizado:active {
        transform: translateY(1px) !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Botão de visualizar - tom azul */
      .botao-visualizar {
        background: linear-gradient(45deg, #2196F3, #03A9F4) !important;
      }
      
      .botao-visualizar:hover {
        background: linear-gradient(45deg, #03A9F4, #2196F3) !important;
      }
      
      /* Botão de otimizar - tom verde */
      .botao-otimizar {
        background: linear-gradient(45deg, #4CAF50, #8BC34A) !important;
      }
      
      .botao-otimizar:hover {
        background: linear-gradient(45deg, #8BC34A, #4CAF50) !important;
      }
      
      /* Estilo para botões das abas inferiores */
      .botao-tab-padronizado, 
      .bottom-tab-button, 
      button[onclick*="openTab"],
      .nav-tabs button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 8px 16px !important;
        border-radius: 5px 5px 0 0 !important;
        border: 1px solid #ddd !important;
        border-bottom: none !important;
        font-weight: bold !important;
        font-size: 14px !important;
        color: #555 !important;
        background-color: #f8f8f8 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        box-shadow: none !important;
        margin: 0 1px !important;
      }
      
      /* Estilo para aba ativa */
      .botao-tab-padronizado.active,
      .bottom-tab-button.active,
      button[onclick*="openTab"].active,
      .nav-tabs button.active {
        background-color: #fff !important;
        color: #2196F3 !important;
        border-bottom: 1px solid #fff !important;
        z-index: 2 !important;
        position: relative !important;
      }
      
      /* Especificamente para os botões nas abas inferiores */
      .bottom-tabs .bottom-tab-button,
      .tab-container .tab-button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 8px 16px !important;
        border-radius: 50px !important;
        border: none !important;
        font-weight: bold !important;
        font-size: 14px !important;
        color: white !important;
        background: linear-gradient(45deg, #2196F3, #03A9F4) !important;
        cursor: pointer !important;
        margin: 5px !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.2s ease !important;
      }
      
      /* Efeito hover para botões de abas inferiores */
      .bottom-tabs .bottom-tab-button:hover,
      .tab-container .tab-button:hover {
        transform: translateY(-1px) !important; 
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15) !important;
        background: linear-gradient(45deg, #03A9F4, #2196F3) !important;
      }
      
      /* Botão ativo nas abas inferiores */
      .bottom-tabs .bottom-tab-button.active,
      .tab-container .tab-button.active {
        background: linear-gradient(45deg, #4CAF50, #8BC34A) !important;
        color: white !important;
      }
      
      /* Assegurar que os contêineres de abas inferiores tenham aparência correta */
      .bottom-tabs, 
      .tab-container {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        padding: 10px 5px !important;
        background-color: #f5f5f5 !important;
        border-top: 1px solid #ddd !important;
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
    
    console.log("[BotoesUI] Estilos para botões injetados");
    
    // Garantir que temos Font Awesome para os ícones
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
      document.head.appendChild(fontAwesome);
      console.log("[BotoesUI] Font Awesome adicionado para ícones");
    }
  }
})();