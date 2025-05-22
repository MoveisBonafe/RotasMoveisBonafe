/**
 * CORREÇÃO PARA OS BOTÕES DO OTIMIZADOR DE ROTAS MÓVEIS BONAFÉ
 * 
 * Este script melhora a aparência dos botões na interface,
 * aplicando a cor amarela (ffc107) característica da Móveis Bonafé.
 */

(function() {
  console.log("🔸 [BotõesEstilo] Iniciando correção dos botões");
  
  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarEstilos);
  } else {
    aplicarEstilos();
  }
  
  // Garantir execução após carregamento completo
  window.addEventListener('load', aplicarEstilos);
  
  // Tentar várias vezes para garantir a aplicação
  setTimeout(aplicarEstilos, 1000);
  setTimeout(aplicarEstilos, 2000);
  setTimeout(aplicarEstilos, 3000);
  
  // Função principal para aplicar estilos
  function aplicarEstilos() {
    console.log("🔸 [BotõesEstilo] Aplicando estilos aos botões");
    
    // Aplicar CSS global
    aplicarCSSGlobal();
    
    // Estilizar botões específicos
    estilizarBotoes();
    
    // Corrigir abas inferiores
    ajustarAbasInferiores();
  }
  
  // Aplicar CSS global para botões
  function aplicarCSSGlobal() {
    // Verificar se já existe
    if (document.getElementById('css-botoes-estilo')) {
      return;
    }
    
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.id = 'css-botoes-estilo';
    
    // Definir regras CSS
    style.textContent = `
      /* Estilo geral para todos os botões */
      button, .btn, input[type="button"], input[type="submit"] {
        background-color: #ffc107 !important;
        color: #212529 !important;
        font-weight: bold !important;
        border-radius: 6px !important;
        border: none !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        transition: all 0.2s ease !important;
      }
      
      /* Efeito hover nos botões */
      button:hover, .btn:hover, input[type="button"]:hover, input[type="submit"]:hover {
        background-color: #ffca2c !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
      }
      
      /* Botões específicos */
      #visualize-button, #optimize-button {
        min-width: 120px !important;
        padding: 8px 15px !important;
      }
      
      /* Abas inferiores */
      .bottom-tab-button, .bottom-tab-btn {
        background-color: #ffc107 !important;
        color: #212529 !important;
        border-radius: 6px !important;
        margin: 0 5px !important;
        font-weight: bold !important;
      }
      
      /* Aba ativa */
      .bottom-tab-button.active, .bottom-tab-btn.active {
        background-color: #ffca2c !important;
        box-shadow: 0 0 0 2px rgba(255,193,7,0.5) !important;
      }
      
      /* Fundo das abas */
      .bottom-tabs, .bottom-tab-content, #bottom-info {
        background-color: #ffffff !important;
      }
    `;
    
    // Adicionar ao DOM
    document.head.appendChild(style);
    
    console.log("🔸 [BotõesEstilo] CSS global aplicado");
  }
  
  // Estilizar botões específicos diretamente
  function estilizarBotoes() {
    // Botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    if (botaoVisualizar) {
      Object.assign(botaoVisualizar.style, {
        backgroundColor: '#ffc107',
        color: '#212529',
        fontWeight: 'bold',
        padding: '8px 15px',
        borderRadius: '6px',
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '120px'
      });
      console.log("🔸 [BotõesEstilo] Botão Visualizar estilizado");
    }
    
    // Botão Otimizar
    const botaoOtimizar = document.getElementById('optimize-button');
    if (botaoOtimizar) {
      Object.assign(botaoOtimizar.style, {
        backgroundColor: '#ffc107',
        color: '#212529',
        fontWeight: 'bold',
        padding: '8px 15px',
        borderRadius: '6px',
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '120px'
      });
      console.log("🔸 [BotõesEstilo] Botão Otimizar estilizado");
    }
    
    // Outros botões importantes
    const seletoresBotoes = [
      'button.btn-primary',
      'button.btn-warning',
      'button.btn-success',
      'button.btn-info'
    ];
    
    seletoresBotoes.forEach(seletor => {
      const botoes = document.querySelectorAll(seletor);
      botoes.forEach(botao => {
        botao.style.backgroundColor = '#ffc107';
        botao.style.color = '#212529';
        botao.style.fontWeight = 'bold';
        botao.style.borderRadius = '6px';
        botao.style.border = 'none';
      });
    });
  }
  
  // Ajustar abas inferiores
  function ajustarAbasInferiores() {
    // Fundo das abas
    const containerAbas = document.querySelector('.bottom-tabs-container');
    if (containerAbas) {
      containerAbas.style.backgroundColor = '#ffffff';
    }
    
    // Abas individuais
    const botoesTabs = document.querySelectorAll('.bottom-tab-button, .bottom-tab-btn');
    botoesTabs.forEach(botao => {
      botao.style.backgroundColor = '#ffc107';
      botao.style.color = '#212529';
      botao.style.fontWeight = 'bold';
      botao.style.borderRadius = '6px';
      botao.style.margin = '0 5px';
      
      // Verificar se é a aba ativa
      if (botao.classList.contains('active')) {
        botao.style.backgroundColor = '#ffca2c';
        botao.style.boxShadow = '0 0 0 2px rgba(255,193,7,0.5)';
      }
    });
    
    // Conteúdo das abas
    const conteudoAbas = document.querySelectorAll('.bottom-tab-content');
    conteudoAbas.forEach(conteudo => {
      conteudo.style.backgroundColor = '#ffffff';
    });
    
    console.log("🔸 [BotõesEstilo] Abas inferiores ajustadas");
  }
})();