/**
 * Script para garantir que a origem (Dois Córregos) esteja sempre configurada corretamente
 * Este script é executado logo após o carregamento da página
 */

(function() {
  // Executar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', initFixOrigin);
  window.addEventListener('load', initFixOrigin);
  
  // Executar novamente após 3 segundos
  setTimeout(initFixOrigin, 3000);
  
  function initFixOrigin() {
    console.log('Verificando e corrigindo origem...');
    
    // Verificar se o array de locations existe
    if (!window.locations || !Array.isArray(window.locations)) {
      console.error('Array de localizações não encontrado');
      
      // Criar array de localizações se não existir
      window.locations = [];
      console.log('Array de localizações criado');
    }
    
    // Verificar se a origem já existe
    const originExists = window.locations.some(loc => loc && loc.isOrigin === true);
    
    if (!originExists) {
      console.log('Origem não encontrada. Adicionando Dois Córregos como origem...');
      
      // Criar objeto da origem (Dois Córregos)
      const origin = {
        id: 1,
        name: 'Dois Córregos',
        address: 'Dois Córregos, SP, Brasil',
        zipCode: '17300-000',
        latitude: -22.3673,
        longitude: -48.3822,
        isOrigin: true
      };
      
      // Adicionar ao array
      window.locations.push(origin);
      
      // Se existir campo de origem, preencher
      const originInput = document.getElementById('origin');
      if (originInput) {
        originInput.value = origin.name;
      }
      
      // Se existir campo de origem no cabeçalho, preencher
      const headerOriginInput = document.getElementById('header-origin');
      if (headerOriginInput) {
        headerOriginInput.value = origin.name;
      }
      
      // Se existir função para adicionar marcador, chamar
      if (typeof window.addMarkerForLocation === 'function') {
        window.addMarkerForLocation(origin, 0);
      }
      
      console.log('Origem Dois Córregos adicionada com sucesso');
    } else {
      console.log('Origem já configurada corretamente');
    }
    
    // Verificar novamente o array de locations
    console.log(`Total de ${window.locations.length} localizações configuradas`);
    
    // Lógica para debug - mostrar todas as localizações
    if (window.locations.length > 0) {
      console.log('DIAGNÓSTICO DE LOCALIZAÇÕES:');
      window.locations.forEach((loc, index) => {
        if (loc) {
          console.log(`[${index}] ${loc.name} (isOrigin: ${loc.isOrigin}) - Lat: ${loc.latitude}, Lng: ${loc.longitude}`);
        } else {
          console.log(`[${index}] LOCALIZAÇÃO INVÁLIDA`);
        }
      });
    }
  }
})();