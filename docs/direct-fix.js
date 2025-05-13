/**
 * CORREÇÃO DIRETA PARA DATAS DE FUNDAÇÃO - VERSÃO SIMPLIFICADA
 * Este script aplica uma correção direta na interface
 * para garantir que as datas de fundação sejam exibidas corretamente
 * no ambiente do GitHub Pages
 * 
 * VERSÃO SIMPLIFICADA - Sem uso de MutationObserver para evitar loops
 */

// Garantir que seja carregado no contexto global
window.applyCityFoundingDateCorrection = function() {
  console.log("[CORREÇÃO DIRETA] Iniciando correção simplificada de datas de fundação...");
  
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
  
  // VERSÃO SIMPLIFICADA: Função com limite de tentativas
  let attemptCount = 0;
  const MAX_ATTEMPTS = 3;
  
  // Função para aplicar correção forçada
  function forceCorrectEventDate() {
    // Incrementar contador de tentativas
    attemptCount++;
    
    // Verificar limite de tentativas
    if (attemptCount > MAX_ATTEMPTS) {
      console.log(`[CORREÇÃO DIRETA] Limite de ${MAX_ATTEMPTS} tentativas atingido. Parando correções.`);
      return;
    }
    
    // Primeiro atualizar as idades para o ano atual
    atualizarIdades();
    
    // Obter todos os eventos na lista
    let eventItems = document.querySelectorAll('#events-list .event-item');
    if (!eventItems || eventItems.length === 0) {
      console.log(`[CORREÇÃO DIRETA] Nenhum evento encontrado (tentativa ${attemptCount}/${MAX_ATTEMPTS}), tentando novamente em 3 segundos...`);
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
  
  // VERSÃO SIMPLIFICADA: Não interceptamos mais a função de atualização
  // Apenas adicionamos botões específicos para acionar a correção
  
  console.log("[CORREÇÃO DIRETA] Versão simplificada: sem interceptação de funções");
  
  // Adicionar botão de ajuda para correção manual se necessário
  setTimeout(function() {
    // Verificar se o botão de filtro de eventos existe
    const filterButton = document.querySelector('#filter-events-btn');
    if (filterButton && filterButton.parentNode) {
      
      // Criar botão auxiliar de correção
      const fixButton = document.createElement('button');
      fixButton.className = 'btn btn-sm btn-outline-secondary mt-2';
      fixButton.style.fontSize = '0.8rem';
      fixButton.innerHTML = '<i class="fa fa-magic"></i> Corrigir Datas';
      fixButton.setAttribute('title', 'Clique para corrigir as datas de fundação');
      
      // Adicionar evento de clique
      fixButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("[CORREÇÃO DIRETA] Correção manual acionada pelo usuário");
        forceCorrectEventDate();
      });
      
      // Adicionar ao DOM próximo ao botão de filtro
      filterButton.parentNode.appendChild(document.createElement('br'));
      filterButton.parentNode.appendChild(fixButton);
      
      console.log("[CORREÇÃO DIRETA] Botão de correção manual adicionado");
    }
  }, 2000);
  
  // Simplificado: Apenas agendar uma correção única após cliques no filtro 
  // ao invés de adicionar event listeners que podem acumular
  setTimeout(function() {
    // Uma única correção após algum tempo para eventos já filtrados
    console.log("[CORREÇÃO DIRETA] Agendando correção única após 5 segundos...");
    setTimeout(forceCorrectEventDate, 5000);
  }, 2000);
  
  // VERSÃO SIMPLIFICADA: Sem uso de MutationObserver (que pode causar loops)
  // Ao invés disso, usamos um intervalo regular para verificar e corrigir
  
  // Um intervalo de 10 segundos para verificar e corrigir periódicamente
  // Só ativa após o carregamento inicial da página
  setTimeout(function() {
    console.log("[CORREÇÃO DIRETA] Configurando verificação periódica a cada 10 segundos");
    
    // Contador para limitar o número de verificações (evita consumo excessivo)
    let checkCount = 0;
    const MAX_CHECKS = 12; // 2 minutos total (12 x 10s)
    
    const periodicCheck = setInterval(function() {
      // Incrementar contador
      checkCount++;
      
      // Checar se ainda há eventos para corrigir
      const eventItems = document.querySelectorAll('#events-list .event-item');
      if (eventItems && eventItems.length > 0) {
        console.log(`[CORREÇÃO DIRETA] Verificação periódica #${checkCount}: ${eventItems.length} eventos encontrados`);
        forceCorrectEventDate();
      }
      
      // Se atingiu o limite, parar as verificações
      if (checkCount >= MAX_CHECKS) {
        console.log("[CORREÇÃO DIRETA] Limite de verificações periódicas atingido. Parando verificações.");
        clearInterval(periodicCheck);
      }
    }, 10000); // 10 segundos
    
    console.log("[CORREÇÃO DIRETA] Verificação periódica configurada com sucesso");
  }, 3000);
  
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