/**
 * Sincronizador de Dados para Eventos de Cidades
 * 
 * Este script garante que todos os sistemas de dados usem as mesmas
 * informações corretas para datas de aniversários de cidades.
 */

(function() {
  // Datas oficiais das cidades
  const datasOficiais = {
    "Piedade": "20/05/2025",
    "Ribeirão Preto": "19/06/2025"
  };
  
  // Descrições oficiais com anos completos
  const descricoesOficiais = {
    "Piedade": "Aniversário de fundação de Piedade em 20/05/1842",
    "Ribeirão Preto": "Aniversário de fundação de Ribeirão Preto em 19/06/1856"
  };
  
  // Formato ISO para as datas (usado em algumas partes do sistema)
  const datasISOOficiais = {
    "Piedade": "2025-05-20",
    "Ribeirão Preto": "2025-06-19"
  };
  
  // Executar depois que todos os outros scripts carregarem
  window.addEventListener('load', function() {
    setTimeout(sincronizarDados, 500);
    setTimeout(sincronizarDados, 2000);
    
    // Continuar monitorando após interações do usuário
    document.addEventListener('click', function() {
      setTimeout(sincronizarDados, 100);
    });
  });
  
  function sincronizarDados() {
    console.log("[Sincronizador] Verificando consistência dos dados...");
    
    // Sincronizar dados no objeto allCityEvents se existir
    if (window.allCityEvents && Array.isArray(window.allCityEvents)) {
      console.log("[Sincronizador] Verificando allCityEvents...");
      
      window.allCityEvents.forEach(function(evento) {
        const cidade = evento.city || evento.cityName;
        
        if (datasOficiais[cidade]) {
          // Usar formatação correta baseada no formato original
          if (evento.startDate && evento.startDate.includes('-')) {
            // Formato ISO
            evento.startDate = datasISOOficiais[cidade];
            if (evento.endDate) evento.endDate = datasISOOficiais[cidade];
          } else {
            // Formato BR
            evento.startDate = datasOficiais[cidade];
            if (evento.endDate) evento.endDate = datasOficiais[cidade];
          }
          
          // Atualizar descrição
          if (evento.description) {
            evento.description = descricoesOficiais[cidade];
          }
          
          console.log(`[Sincronizador] Atualizado evento para ${cidade} em allCityEvents`);
        }
      });
    }
    
    // Sincronizar dados no array cityBirthdayEvents se existir no escopo global
    if (window.cityBirthdayEvents && Array.isArray(window.cityBirthdayEvents)) {
      console.log("[Sincronizador] Verificando cityBirthdayEvents...");
      
      window.cityBirthdayEvents.forEach(function(evento) {
        const cidade = evento.city || evento.cityName;
        
        if (datasOficiais[cidade]) {
          // Usar formatação correta baseada no formato original
          if (evento.startDate && evento.startDate.includes('-')) {
            // Formato ISO
            evento.startDate = datasISOOficiais[cidade];
            if (evento.endDate) evento.endDate = datasISOOficiais[cidade];
          } else {
            // Formato BR
            evento.startDate = datasOficiais[cidade];
            if (evento.endDate) evento.endDate = datasOficiais[cidade];
          }
          
          // Atualizar descrição
          if (evento.description) {
            evento.description = descricoesOficiais[cidade];
          }
          
          console.log(`[Sincronizador] Atualizado evento para ${cidade} em cityBirthdayEvents`);
        }
      });
    }
    
    // Sincronizar dados no mockData
    if (window.mockData && window.mockData.cityEvents && Array.isArray(window.mockData.cityEvents)) {
      console.log("[Sincronizador] Verificando mockData.cityEvents...");
      
      window.mockData.cityEvents.forEach(function(evento) {
        const cidade = evento.cityName || evento.city;
        
        if (datasOficiais[cidade]) {
          // Usar formatação correta baseada no formato original
          if (evento.startDate && evento.startDate.includes('-')) {
            // Formato ISO
            evento.startDate = datasISOOficiais[cidade];
            if (evento.endDate) evento.endDate = datasISOOficiais[cidade];
          } else {
            // Formato BR
            evento.startDate = datasOficiais[cidade];
            if (evento.endDate) evento.endDate = datasOficiais[cidade];
          }
          
          // Atualizar descrição
          if (evento.description) {
            evento.description = descricoesOficiais[cidade];
          }
          
          console.log(`[Sincronizador] Atualizado evento para ${cidade} em mockData`);
        }
      });
    }
    
    // Verificar elementos DOM diretamente
    const elementosData = document.querySelectorAll('.event-date');
    elementosData.forEach(function(elemento) {
      const texto = elemento.textContent || '';
      
      // Verificar para cada cidade
      Object.keys(datasOficiais).forEach(function(cidade) {
        if (texto.includes(cidade)) {
          // Extrair partes do texto
          const partes = texto.split('|');
          if (partes.length === 2) {
            elemento.textContent = `${partes[0].trim()} | ${datasOficiais[cidade]}`;
            console.log(`[Sincronizador] Corrigido elemento DOM para ${cidade}`);
          }
        }
      });
    });
    
    // Atualizar descrições
    const elementosDesc = document.querySelectorAll('.event-description');
    elementosDesc.forEach(function(elemento) {
      const texto = elemento.textContent || '';
      
      // Verificar para cada cidade
      Object.keys(descricoesOficiais).forEach(function(cidade) {
        if (texto.includes(cidade)) {
          elemento.textContent = descricoesOficiais[cidade];
          console.log(`[Sincronizador] Atualizada descrição DOM para ${cidade}`);
        }
      });
    });
    
    console.log("[Sincronizador] Sincronização concluída");
  }
})();