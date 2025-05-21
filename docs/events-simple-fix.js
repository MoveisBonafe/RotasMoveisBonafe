/**
 * CORREÇÃO SIMPLIFICADA PARA EVENTOS
 * 
 * Solução extremamente simples e direta que:
 * 1. Mostra apenas eventos de cidades que estão no percurso
 * 2. Corrige datas para o formato completo
 */

// Auto-executável
(function() {
  console.log("[Fix] Iniciando solução SIMPLIFICADA para eventos");
  
  // Executar agora e periodicamente
  corrigirEventos();
  setInterval(corrigirEventos, 1000);
  
  // Também registrar para mudanças no DOM
  const observer = new MutationObserver(corrigirEventos);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Executar quando o usuário interagir
  document.addEventListener('click', function() {
    setTimeout(corrigirEventos, 200);
  });
  
  // Função principal - abordagem simples e direta
  function corrigirEventos() {
    // 1. Identificar todas as cidades que têm marcadores no mapa
    const cidadesComMarcadores = [];
    
    // Adicionar a origem
    const origem = document.querySelector('.sidebar strong');
    if (origem) {
      cidadesComMarcadores.push(origem.textContent.split(',')[0].trim());
    }
    
    // Adicionar todos os locais com marcadores
    document.querySelectorAll('.location-item').forEach(function(item) {
      const texto = item.textContent;
      const cidade = texto.split('\n')[0].trim();
      cidadesComMarcadores.push(cidade);
    });
    
    console.log("[Fix] Cidades com marcadores: " + cidadesComMarcadores.join(', '));
    
    // 2. Mostrar apenas eventos de cidades que estão na lista de marcadores
    const eventosItems = document.querySelectorAll('.event-item');
    
    eventosItems.forEach(function(evento) {
      // Obter a cidade deste evento
      const elementoData = evento.querySelector('.event-date');
      if (!elementoData) return;
      
      const textoData = elementoData.textContent;
      // Formato: "Cidade | Data"
      const cidade = textoData.split('|')[0].trim();
      
      // Verificar se esta cidade está na lista de marcadores
      let cidadeNoPercurso = false;
      
      for (let i = 0; i < cidadesComMarcadores.length; i++) {
        const cidadeMarcador = cidadesComMarcadores[i].toLowerCase();
        const cidadeEvento = cidade.toLowerCase();
        
        // Verificar se um contém o outro
        if (cidadeMarcador.includes(cidadeEvento) || cidadeEvento.includes(cidadeMarcador)) {
          cidadeNoPercurso = true;
          break;
        }
      }
      
      // Mostrar ou ocultar conforme necessário
      if (cidadeNoPercurso) {
        evento.style.display = '';
        
        // Também corrigir a descrição se necessário
        const descricao = evento.querySelector('.event-description');
        if (descricao) {
          const textoDescricao = descricao.textContent;
          
          // Corrigir datas conforme a cidade
          if (textoDescricao.includes('Piedade') && !textoDescricao.includes('20/05/1842')) {
            descricao.textContent = "Aniversário de fundação de Piedade em 20/05/1842";
          } 
          else if (textoDescricao.includes('Buri') && textoDescricao.includes('em 2025')) {
            descricao.textContent = "Aniversário de fundação de Buri em 20/12/1921";
          }
          else if (textoDescricao.includes('Santos') && textoDescricao.includes('em 2025')) {
            descricao.textContent = "Aniversário de fundação de Santos em 26/01/1546";
          }
          else if (textoDescricao.includes('Itapeva') && textoDescricao.includes('em 2025')) {
            descricao.textContent = "Aniversário de fundação de Itapeva em 20/09/1769";
          }
          else if (textoDescricao.includes('Cristina') && textoDescricao.includes('em 2025')) {
            descricao.textContent = "Aniversário de fundação de Cristina em 14/03/1841";
          }
          else if (textoDescricao.includes('Dois Córregos') && textoDescricao.includes('em 2025')) {
            descricao.textContent = "Aniversário de fundação de Dois Córregos em 04/02/1883";
          }
        }
      } else {
        evento.style.display = 'none';
      }
    });
  }
})();