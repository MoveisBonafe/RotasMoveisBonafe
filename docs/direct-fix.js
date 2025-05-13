/**
 * CORREÇÃO DIRETA PARA DATAS DE FUNDAÇÃO
 * Este script aplica uma correção direta e agressiva na interface
 * para garantir que as datas de fundação sejam exibidas corretamente
 * no ambiente do GitHub Pages
 */

// Garantir que seja carregado no contexto global
window.applyCityFoundingDateCorrection = function() {
  console.log("[CORREÇÃO DIRETA] Iniciando correção aggressiva de datas de fundação...");
  
  // Dados históricos vem do arquivo carregado fundacao-dados.js
  const DATAS_CORRETAS = window.dadosFundacao ? window.dadosFundacao.DATAS_FUNDACAO : {
    "Ribeirão Preto": { data: "19/06/1856", idade: 169 },
    "São Carlos": { data: "04/11/1857", idade: 168 },
    "Amparo": { data: "08/04/1829", idade: 196 },
    "Dois Córregos": { data: "20/05/1865", idade: 160 },
    "Bauru": { data: "01/08/1896", idade: 129 },
    "Araraquara": { data: "22/08/1817", idade: 208 },
    "Jaú": { data: "15/08/1853", idade: 172 },
    "Campinas": { data: "14/07/1774", idade: 251 },
    "São Paulo": { data: "25/01/1554", idade: 471 }
  };
  
  // Atualizar idades com base no ano atual
  function atualizarIdades() {
    const anoAtual = new Date().getFullYear();
    
    // Para cada cidade nos dados históricos, calcular idade dinâmica
    Object.keys(DATAS_CORRETAS).forEach(cidade => {
      const item = DATAS_CORRETAS[cidade];
      if (item.ano) {
        item.idade = anoAtual - item.ano;
      }
    });
    
    console.log("[CORREÇÃO DIRETA] Idades atualizadas para o ano atual:", anoAtual);
  }
  
  // Função para aplicar correção forçada
  function forceCorrectEventDate() {
    // Primeiro atualizar as idades para o ano atual
    atualizarIdades();
    
    // Obter todos os eventos na lista
    let eventItems = document.querySelectorAll('#events-list .event-item');
    if (!eventItems || eventItems.length === 0) {
      console.log("[CORREÇÃO DIRETA] Nenhum evento encontrado, tentando novamente em 3 segundos...");
      setTimeout(forceCorrectEventDate, 3000);
      return;
    }
    
    console.log(`[CORREÇÃO DIRETA] Processando ${eventItems.length} eventos...`);
    
    // Para cada evento na lista
    eventItems.forEach(item => {
      try {
        // Pegar o texto completo para análise
        const texto = item.textContent || '';
        
        // Verificar se é um evento de aniversário
        if (texto.includes('Aniversário') || texto.includes('Fundação')) {
          // Identificar a cidade
          let cidadeEncontrada = null;
          
          // Verificar cada cidade do catálogo
          Object.keys(DATAS_CORRETAS).forEach(cidade => {
            if (texto.includes(cidade)) {
              cidadeEncontrada = cidade;
            }
          });
          
          // Se encontrou a cidade no catálogo
          if (cidadeEncontrada) {
            const dadosCidade = DATAS_CORRETAS[cidadeEncontrada];
            console.log(`[CORREÇÃO DIRETA] Encontrado evento de ${cidadeEncontrada}, aplicando data ${dadosCidade.data}`);
            
            // Localizar e corrigir elementos
            const dataElement = item.querySelector('.event-date');
            if (dataElement) {
              // Substituir completamente o conteúdo
              dataElement.innerHTML = `
                <span>${cidadeEncontrada}</span> | 
                <strong style="color:#d9534f;font-weight:bold">${dadosCidade.data}</strong>
              `;
            }
            
            const descElement = item.querySelector('.event-description');
            if (descElement) {
              // Preservar parte da descrição e adicionar idade correta
              let descricaoBase = descElement.textContent || '';
              // Remover qualquer menção a anos no final
              descricaoBase = descricaoBase.replace(/\(\d+ anos.*\)/g, '').trim();
              
              // Adicionar a idade correta com destaque
              descElement.innerHTML = `
                ${descricaoBase} 
                <span style="font-style:italic;color:#666;font-weight:bold">
                  (${dadosCidade.idade} anos de fundação)
                </span>
              `;
            }
          }
        }
      } catch (err) {
        console.error("[CORREÇÃO DIRETA] Erro ao processar evento:", err);
      }
    });
  }
  
  // Aplicar correção inicial
  forceCorrectEventDate();
  
  // E também quando eventos forem filtrados (aba de eventos)
  const originalUpdateEventsList = window.updateEventsList;
  if (originalUpdateEventsList) {
    window.updateEventsList = function(...args) {
      // Chamar função original
      originalUpdateEventsList.apply(this, args);
      // Após atualizar a lista, aplicar correção
      setTimeout(forceCorrectEventDate, 500);
    };
    console.log("[CORREÇÃO DIRETA] Interceptação de updateEventsList ativada");
  }
  
  // Também monitorar cliques no botão de filtro de eventos
  const filterButton = document.querySelector('#filter-events-btn');
  if (filterButton) {
    filterButton.addEventListener('click', function() {
      console.log("[CORREÇÃO DIRETA] Filtro de eventos clicado, aplicando correção em 1s...");
      setTimeout(forceCorrectEventDate, 1000);
    });
  }
  
  // Observer para monitorar mudanças na lista de eventos
  const eventsContainer = document.querySelector('#events-list');
  if (eventsContainer) {
    const observer = new MutationObserver(function() {
      console.log("[CORREÇÃO DIRETA] Mudanças detectadas na lista de eventos, aplicando correção...");
      forceCorrectEventDate();
    });
    
    observer.observe(eventsContainer, { 
      childList: true,
      subtree: true
    });
    
    console.log("[CORREÇÃO DIRETA] Observer configurado para a lista de eventos");
  }
  
  console.log("[CORREÇÃO DIRETA] Inicialização concluída com sucesso");
};

// Auto-inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log("[CORREÇÃO DIRETA] Documento carregado, iniciando correção...");
  
  // Iniciar com um pequeno delay para garantir que tudo está carregado
  setTimeout(function() {
    if (window.applyCityFoundingDateCorrection) {
      window.applyCityFoundingDateCorrection();
    }
  }, 2000);
});