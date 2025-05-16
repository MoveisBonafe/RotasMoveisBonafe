/**
 * Script para adicionar os botões personalizados ao mapa
 */
document.addEventListener('DOMContentLoaded', function() {
  // Função para adicionar os botões ao mapa
  function adicionarBotoesMapa() {
    // Verificar se o mapa está disponível
    if (!window.map) {
      console.log('[BotoesAdicionais] Mapa não disponível, tentando novamente em 1s...');
      setTimeout(adicionarBotoesMapa, 1000);
      return;
    }
    
    console.log('[BotoesAdicionais] Adicionando botões ao mapa');
    
    // Criar o container de botões se não existir
    let botoesContainer = document.querySelector('.botoes-adicionais-container');
    if (!botoesContainer) {
      botoesContainer = document.createElement('div');
      botoesContainer.className = 'botoes-adicionais-container';
      document.body.appendChild(botoesContainer);
    }
    
    // Configuração dos botões a serem adicionados
    const botoes = [
      {
        id: 'btn-postos-combustivel',
        label: 'Postos de Combustível',
        icon: '⛽',
        className: 'btn-posto',
        onClick: function() {
          alert('Buscando postos de combustível próximos à rota...');
        }
      },
      {
        id: 'btn-pontos-parada',
        label: 'Pontos de Parada',
        icon: '🛑',
        className: 'btn-parada',
        onClick: function() {
          alert('Exibindo pontos de parada recomendados...');
        }
      },
      {
        id: 'btn-restaurantes',
        label: 'Restaurantes',
        icon: '🍽️',
        className: 'btn-restaurante',
        onClick: function() {
          alert('Buscando restaurantes próximos à rota...');
        }
      },
      {
        id: 'btn-hoteis',
        label: 'Hotéis',
        icon: '🏨',
        className: 'btn-hotel',
        onClick: function() {
          alert('Exibindo hotéis ao longo da rota...');
        }
      }
    ];
    
    // Criar e adicionar cada botão
    botoes.forEach(botao => {
      const btn = document.createElement('button');
      btn.id = botao.id;
      btn.className = `botao-mapa ${botao.className}`;
      btn.innerHTML = `<span class="botao-icone">${botao.icon}</span><span class="botao-label">${botao.label}</span>`;
      btn.addEventListener('click', botao.onClick);
      
      botoesContainer.appendChild(btn);
    });
    
    // Posicionar o container
    ajustarPosicaoBotoes();
    
    // Adicionar listener para ajustar a posição em caso de redimensionamento
    window.addEventListener('resize', ajustarPosicaoBotoes);
    
    console.log('[BotoesAdicionais] Botões adicionados com sucesso');
  }
  
  // Função para ajustar a posição dos botões
  function ajustarPosicaoBotoes() {
    const container = document.querySelector('.botoes-adicionais-container');
    if (!container) return;
    
    // Posicionar no canto superior direito do mapa
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      const mapRect = mapContainer.getBoundingClientRect();
      
      container.style.position = 'absolute';
      container.style.top = (mapRect.top + 10) + 'px';
      container.style.right = (window.innerWidth - mapRect.right + 10) + 'px';
      container.style.zIndex = '1000';
    }
  }
  
  // Aplicar estilos necessários
  function aplicarEstilos() {
    const estilos = `
      .botoes-adicionais-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .botao-mapa {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: white;
        border: none;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: 500;
        color: #333;
        text-align: left;
        width: 190px;
      }
      
      .botao-mapa:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.12);
      }
      
      .botao-mapa:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .botao-icone {
        margin-right: 8px;
        font-size: 16px;
      }
      
      .btn-posto {
        border-left: 3px solid #30b046;
      }
      
      .btn-parada {
        border-left: 3px solid #e74c3c;
      }
      
      .btn-restaurante {
        border-left: 3px solid #f39c12;
      }
      
      .btn-hotel {
        border-left: 3px solid #3498db;
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = estilos;
    document.head.appendChild(styleElement);
  }
  
  // Inicializar
  aplicarEstilos();
  setTimeout(adicionarBotoesMapa, 2000); // Esperar o mapa carregar
});