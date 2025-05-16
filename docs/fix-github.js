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
    if (locationItem && locationItem.nodeType === 1) {
      routeSummary.appendChild(locationItem);
    } else {
      console.warn('Item de localização inválido');
    }
  } catch (err) {
    console.error('Erro ao adicionar item:', err);
  }
}