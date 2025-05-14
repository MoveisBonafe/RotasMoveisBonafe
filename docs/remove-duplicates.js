/**
 * Script para remover botões duplicados
 */
(function() {
  // Executar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', removerBotoesDuplicados);
  
  // Também tentar remover depois de um tempo
  setTimeout(removerBotoesDuplicados, 1000);
  setTimeout(removerBotoesDuplicados, 2000);
  setTimeout(removerBotoesDuplicados, 4000);
  
  // Função principal para remover botões duplicados
  function removerBotoesDuplicados() {
    console.log('[RemoveDuplicates] Iniciando remoção de botões duplicados...');
    
    // 1. Remover todos os botões com classes específicas
    const botoesAntigos = document.querySelectorAll('#custom-route-btn, #custom-route');
    botoesAntigos.forEach(btn => {
      console.log('[RemoveDuplicates] Removendo botão antigo:', btn.id || btn.className);
      btn.remove();
    });
    
    // 2. Manter apenas um botão de reordenação - o mais recente
    const reordenacaoBotoes = document.querySelectorAll('button[id^="botao-reordenar"]:not(#botao-reordenar-direto)');
    reordenacaoBotoes.forEach(btn => {
      console.log('[RemoveDuplicates] Removendo botão duplicado de reordenação:', btn.id);
      btn.remove();
    });
    
    // 3. Remover por texto - precisamos de querySelector mais avançado
    // Este trecho funciona sem jQuery, usando uma técnica customizada
    document.querySelectorAll('button').forEach(btn => {
      const texto = btn.textContent.trim().toLowerCase();
      if (
          (texto.includes('rota personalizada') || 
           texto.includes('ativar reordenação')) && 
          btn.id !== 'botao-reordenar-direto'
      ) {
        console.log('[RemoveDuplicates] Removendo por texto:', texto);
        btn.remove();
      }
    });
    
    console.log('[RemoveDuplicates] Remoção de botões concluída.');
  }
})();