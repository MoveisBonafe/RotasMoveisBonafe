/**
 * Correção específica para a cidade de Piedade
 * Este arquivo corrige datas e descrições incorretas e remove entradas duplicadas
 */

// Executar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Tempo para garantir que tudo seja carregado
  setTimeout(corrigirPiedade, 1000);
  setTimeout(corrigirPiedade, 3000);
});

// Executar também quando a página estiver completamente carregada
window.addEventListener('load', function() {
  setTimeout(corrigirPiedade, 500);
  
  // Observar mudanças no DOM para reagir quando novos eventos são adicionados
  const observer = new MutationObserver(function(mutations) {
    setTimeout(corrigirPiedade, 300);
  });
  
  observer.observe(document.body, { 
    childList: true,
    subtree: true
  });
});

// Executar quando o usuário interage com a página
document.addEventListener('click', function() {
  setTimeout(corrigirPiedade, 300);
});

function corrigirPiedade() {
  console.log('[PiedadeFix] Iniciando correção para Piedade...');
  
  // Dados corretos
  const dataCorreta = '20/05/2025';
  const descricaoCorreta = 'Aniversário de fundação de Piedade em 20/05/1842';
  
  // 1. Limpar duplicações - encontrar todos os eventos relacionados a Piedade
  let eventosPiedade = [];
  document.querySelectorAll('.event-item').forEach(function(item) {
    if (item.textContent.includes('Piedade')) {
      eventosPiedade.push(item);
    }
  });
  
  console.log(`[PiedadeFix] Encontrados ${eventosPiedade.length} eventos para Piedade`);
  
  // Se encontrou mais de um evento, manter apenas o primeiro e ocultar os outros
  if (eventosPiedade.length > 1) {
    // Corrigir o primeiro evento
    const primeiro = eventosPiedade[0];
    corrigirElemento(primeiro);
    
    // Ocultar os demais (duplicados)
    for (let i = 1; i < eventosPiedade.length; i++) {
      eventosPiedade[i].style.display = 'none';
      console.log(`[PiedadeFix] Ocultado evento duplicado #${i+1}`);
    }
  } else if (eventosPiedade.length === 1) {
    // Apenas um evento encontrado, corrigir seus dados
    corrigirElemento(eventosPiedade[0]);
  }
  
  // 2. Fazer correção direta para elementos que possam estar fora do padrão
  document.querySelectorAll('*').forEach(function(elem) {
    if (elem.childNodes.length === 1 && elem.childNodes[0].nodeType === 3) {
      const texto = elem.textContent;
      
      // Corrigir texto no formato "Piedade | DATA"
      if (texto.includes('Piedade') && texto.includes('|')) {
        if (texto.includes('18/03/2025') || texto.includes('19/05/2025')) {
          const partes = texto.split('|');
          if (partes.length > 0) {
            const cidade = partes[0].trim();
            elem.textContent = `${cidade} | ${dataCorreta}`;
            console.log(`[PiedadeFix] Corrigido texto: ${texto} -> ${elem.textContent}`);
          }
        }
      }
      
      // Corrigir descrição de fundação
      if (texto.includes('Piedade') && texto.includes('fundação') && texto.includes('19/03/1842')) {
        elem.textContent = descricaoCorreta;
        console.log(`[PiedadeFix] Corrigida descrição: ${texto} -> ${descricaoCorreta}`);
      }
    }
  });
  
  // 3. Verificar se o mockData está disponível e corrigir lá também
  if (window.mockData && window.mockData.cityEvents) {
    let corrigido = false;
    
    window.mockData.cityEvents.forEach(function(evento) {
      if (evento.cityName === 'Piedade') {
        // Extrair dia e mês da data correta
        const [dia, mes, ano] = dataCorreta.split('/');
        
        // Corrigir no formato de dados
        evento.startDate = `${ano}-${mes}-${dia}`;
        evento.endDate = `${ano}-${mes}-${dia}`;
        evento.description = descricaoCorreta;
        
        corrigido = true;
        console.log('[PiedadeFix] Corrigido evento de Piedade no mockData');
      }
    });
    
    if (!corrigido) {
      console.log('[PiedadeFix] Evento de Piedade não encontrado no mockData');
    }
  }
  
  console.log('[PiedadeFix] Correção concluída');
}

// Função auxiliar para corrigir um elemento de evento
function corrigirElemento(elemento) {
  // Dados corretos
  const dataCorreta = '20/05/2025';
  const descricaoCorreta = 'Aniversário de fundação de Piedade em 20/05/1842';
  
  // Encontrar elementos específicos dentro do evento
  const dataElement = elemento.querySelector('.event-date');
  const descElement = elemento.querySelector('.event-description');
  
  // Corrigir data
  if (dataElement) {
    const texto = dataElement.textContent;
    if (texto.includes('Piedade')) {
      const partes = texto.split('|');
      if (partes.length > 0) {
        const cidade = partes[0].trim();
        dataElement.textContent = `${cidade} | ${dataCorreta}`;
        console.log(`[PiedadeFix] Corrigida data: ${texto} -> ${dataElement.textContent}`);
      }
    }
  }
  
  // Corrigir descrição
  if (descElement) {
    descElement.textContent = descricaoCorreta;
    console.log('[PiedadeFix] Corrigida descrição para o valor correto');
  }
}