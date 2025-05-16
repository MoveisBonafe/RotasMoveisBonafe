/**
 * Script para melhorar a aparência dos itens na lista de locais adicionados
 */
document.addEventListener('DOMContentLoaded', function() {
  // Função para aplicar estilos melhorados à lista de locais
  function melhorarEstiloLocais() {
    // Encontrar todos os itens da lista
    var itens = document.querySelectorAll('#locations-list .list-group-item');
    
    if (itens.length === 0) {
      // Se não encontrou itens, agendar nova tentativa
      setTimeout(melhorarEstiloLocais, 500);
      return;
    }
    
    console.log('[EstiloLocais] Aplicando estilos a', itens.length, 'itens');
    
    // Aplicar estilos a cada item
    itens.forEach(function(item) {
      // Adicionar classes para melhor layout
      item.classList.add('local-adicionado-item');
      
      // Estilizar o botão de remoção
      var botaoRemover = item.querySelector('.btn-danger, .remove-button');
      if (botaoRemover) {
        botaoRemover.classList.add('botao-remover-local');
        
        // Substituir o texto/conteúdo por um ícone mais bonito se for o caso
        if (botaoRemover.textContent.trim() === 'X' || botaoRemover.textContent.trim() === 'x') {
          botaoRemover.innerHTML = '<i class="fas fa-trash-alt"></i>';
          if (!document.querySelector('link[href*="font-awesome"]')) {
            botaoRemover.innerHTML = '×'; // Usar × se Font Awesome não estiver disponível
          }
        }
      }
      
      // Adicionar animação hover
      item.setAttribute('data-estilizado', 'true');
    });
  }
  
  // Função para observar adições à lista
  function observarMudancas() {
    // Criar um observador para o nó da lista
    var listaContainer = document.getElementById('locations-list');
    if (!listaContainer) {
      setTimeout(observarMudancas, 500);
      return;
    }
    
    // Observer que será chamado quando houver mudanças na lista
    var observer = new MutationObserver(function(mutations) {
      melhorarEstiloLocais();
    });
    
    // Configurar e iniciar o observador
    observer.observe(listaContainer, { childList: true, subtree: true });
    console.log('[EstiloLocais] Observer configurado');
    
    // Aplicar estilos pela primeira vez
    melhorarEstiloLocais();
  }
  
  // Aplicar estilos CSS necessários
  function aplicarEstilosCSS() {
    var estilos = `
      /* Estilos para itens na lista de locais */
      .local-adicionado-item {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 8px 12px !important;
        margin-bottom: 6px !important;
        background-color: #f8f9fa !important;
        border-radius: 8px !important;
        border: 1px solid #e9ecef !important;
        transition: all 0.2s ease !important;
      }
      
      .local-adicionado-item:hover {
        background-color: #f1f3f5 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
      }
      
      .botao-remover-local {
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 50% !important;
        background-color: rgba(255, 69, 58, 0.1) !important;
        color: #ff453a !important;
        border: none !important;
        margin-left: 8px !important;
        font-size: 16px !important;
        transition: all 0.2s ease !important;
      }
      
      .botao-remover-local:hover {
        background-color: rgba(255, 69, 58, 0.2) !important;
        transform: scale(1.05) !important;
      }
    `;
    
    // Adicionar estilos à página
    var styleElement = document.createElement('style');
    styleElement.textContent = estilos;
    document.head.appendChild(styleElement);
    console.log('[EstiloLocais] Estilos CSS aplicados');
  }
  
  // Iniciar o processo
  aplicarEstilosCSS();
  observarMudancas();
  
  // Adicionar manipulador para quando novos locais forem adicionados
  document.addEventListener('locationAdded', function() {
    melhorarEstiloLocais();
  });
});