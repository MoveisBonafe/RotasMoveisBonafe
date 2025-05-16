function processCepFile(content) {
  // Encontrar o container de forma mais robusta
  const routeSummary = document.getElementById('route-summary') || 
                      document.querySelector('.route-summary') || 
                      document.querySelector('.summary-container');

  if (!routeSummary) {
    console.error('Container de resumo da rota não encontrado');
    return;
  }

  // Verificações de segurança antes de manipular o DOM
  try {
    // Prevenir múltiplas seleções de arquivo
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.onclick = function(e) {
            // Se já estiver processando, impedir nova seleção
            if (this.getAttribute('data-processing') === 'true') {
                e.preventDefault();
                return false;
            }

            // Marcar como processando
            this.setAttribute('data-processing', 'true');

            // Liberar após um tempo
            setTimeout(() => {
                this.removeAttribute('data-processing');
            }, 2000);
        };
    }

    if (locationItem && locationItem.nodeType === 1) {
        routeSummary.appendChild(locationItem);
    } else {
        console.warn('Item de localização inválido');
    }
} catch (err) {
    console.error('Erro ao adicionar item:', err);
}
}