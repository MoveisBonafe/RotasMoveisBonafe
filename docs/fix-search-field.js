/**
 * Correção para restaurar a funcionalidade do campo de busca
 * Garante que o Google Places API continue funcionando
 */
(function() {
  console.log("🔍 [FixSearchField] Restaurando funcionalidade do campo de busca");
  
  window.addEventListener('load', function() {
    setTimeout(restaurarBusca, 1000);
  });
  
  function restaurarBusca() {
    try {
      // Procurar pelo campo de busca
      const camposBusca = document.querySelectorAll('input[type="text"], input[placeholder*="buscar"], input[placeholder*="endereço"], input[placeholder*="CEP"]');
      
      camposBusca.forEach(campo => {
        // Verificar se o campo perdeu a funcionalidade de autocomplete
        if (campo && !campo.hasAttribute('data-autocomplete-fixed')) {
          console.log("🔍 [FixSearchField] Restaurando autocomplete para:", campo.placeholder || campo.id);
          
          // Recriar o autocomplete se necessário
          if (window.google && window.google.maps && window.google.maps.places) {
            try {
              const autocomplete = new google.maps.places.Autocomplete(campo, {
                types: ['geocode'],
                componentRestrictions: { country: 'BR' }
              });
              
              // Marcar como corrigido
              campo.setAttribute('data-autocomplete-fixed', 'true');
              
              console.log("🔍 [FixSearchField] Autocomplete restaurado com sucesso");
            } catch (e) {
              console.log("🔍 [FixSearchField] Erro ao recriar autocomplete:", e);
            }
          }
        }
      });
      
      // Garantir que containers do Google Places não sejam removidos
      protegerElementosGoogle();
      
    } catch (e) {
      console.log("🔍 [FixSearchField] Erro na restauração:", e);
    }
  }
  
  function protegerElementosGoogle() {
    // Proteger elementos críticos do Google Maps/Places
    const elementosProtegidos = [
      '.pac-container',
      '.gm-style',
      '.gmnoprint',
      '[class*="pac-"]',
      '[class*="gm-"]'
    ];
    
    elementosProtegidos.forEach(seletor => {
      const elementos = document.querySelectorAll(seletor);
      elementos.forEach(elemento => {
        // Adicionar atributo de proteção
        elemento.setAttribute('data-protected', 'true');
        
        // Restaurar se foi escondido
        if (elemento.style.display === 'none' || elemento.style.visibility === 'hidden') {
          elemento.style.display = '';
          elemento.style.visibility = '';
        }
      });
    });
  }
  
  // Executar verificação periodicamente
  setInterval(restaurarBusca, 5000);
  
})();