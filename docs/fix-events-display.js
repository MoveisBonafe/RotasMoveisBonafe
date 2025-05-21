/**
 * Correção Imediata para Exibição de Eventos
 * 
 * Este script:
 * 1. Força a exibição apenas de eventos de cidades no percurso
 * 2. Corrige problemas com datas faltantes
 * 3. Aplica um seletor mais forte e direto
 */

// Executar imediatamente
(function() {
  console.log("[EVENTOS] Iniciando correção imediata para eventos...");
  
  // Executar correção agora e após um período
  aplicarCorrecao();
  setTimeout(aplicarCorrecao, 1000);
  setTimeout(aplicarCorrecao, 2000);
  
  // Também observar mudanças no DOM
  const observer = new MutationObserver(function() {
    aplicarCorrecao();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Também corrigir quando houver interação do usuário
  document.addEventListener('click', aplicarCorrecao);
  
  function aplicarCorrecao() {
    // 1. Identificar cidades adicionadas no percurso (apenas as que foram explicitamente adicionadas)
    const cidadesAdicionadas = new Set();
    
    // Coletar cidade de origem
    const origem = document.querySelector('.sidebar strong');
    if (origem && origem.textContent) {
      const cidadeOrigem = origem.textContent.split(',')[0].trim();
      cidadesAdicionadas.add(cidadeOrigem.toLowerCase());
      console.log("[EVENTOS] Origem identificada: " + cidadeOrigem);
    }
    
    // Coletar destinos adicionados (os itens com classe 'location-item')
    document.querySelectorAll('.location-item').forEach(item => {
      // A primeira linha geralmente contém o nome da cidade
      const texto = item.textContent || '';
      const primeiraLinha = texto.split('\n')[0].trim();
      if (primeiraLinha) {
        cidadesAdicionadas.add(primeiraLinha.toLowerCase());
        console.log("[EVENTOS] Destino identificado: " + primeiraLinha);
      }
    });
    
    // Se não encontrou nenhuma cidade além da origem, não continuar
    if (cidadesAdicionadas.size <= 1) {
      console.log("[EVENTOS] Insuficientes cidades para filtragem");
      return;
    }
    
    console.log("[EVENTOS] Cidades no percurso: " + Array.from(cidadesAdicionadas).join(', '));
    
    // 2. Verificar e corrigir cada evento na lista
    const eventosContainer = document.querySelector('.event-list');
    if (!eventosContainer) return;
    
    const eventosItens = eventosContainer.querySelectorAll('.event-item');
    console.log("[EVENTOS] Total de eventos encontrados: " + eventosItens.length);
    
    eventosItens.forEach(eventoItem => {
      // Extrair cidade do evento (do título ou primeira linha)
      let cidadeEvento = '';
      
      // Tentar do título "Aniversário da Cidade"
      const tituloEvento = eventoItem.querySelector('.event-title');
      if (tituloEvento) {
        const textoTitulo = tituloEvento.textContent || '';
        // Buscar "Buri" em "Aniversário da Cidade\nBuri | 24/07/2025"
        const linhas = textoTitulo.split('\n');
        if (linhas.length > 1) {
          // Pegar apenas a parte antes do pipe na segunda linha
          const segundaLinha = linhas[1].split('|')[0].trim();
          cidadeEvento = segundaLinha;
        }
      }
      
      // Se não encontrou no título, tentar da data do evento
      if (!cidadeEvento) {
        const dataEvento = eventoItem.querySelector('.event-date');
        if (dataEvento) {
          const textoData = dataEvento.textContent || '';
          // Formato: "Cidade | Data"
          const partes = textoData.split('|');
          if (partes.length > 0) {
            cidadeEvento = partes[0].trim();
          }
        }
      }
      
      // Se ainda não encontrou, tentar do primeiro elemento dentro do item
      if (!cidadeEvento) {
        const primeiroDivs = eventoItem.querySelectorAll('div');
        if (primeiroDivs.length > 0) {
          // Verificar se a primeira div tem o padrão "Cidade (Data)"
          const textoPrimeiraDiv = primeiroDivs[0].textContent || '';
          const match = textoPrimeiraDiv.match(/^([^(]+)\s*\(/);
          if (match) {
            cidadeEvento = match[1].trim();
          }
        }
      }
      
      // Verificar e corrigir a descrição (para o problema "sem data")
      const descricaoEvento = eventoItem.querySelector('.event-description');
      if (descricaoEvento) {
        const textoDescricao = descricaoEvento.textContent || '';
        
        // Se contém "Aniversário de fundação de [Cidade]" mas não tem data
        if (textoDescricao.includes('Aniversário de fundação de') && 
            !textoDescricao.includes('em ')) {
          
          // Adicionar a data correta
          let dataCorrigida = '';
          
          // Casos específicos
          if (textoDescricao.includes('Piedade')) {
            dataCorrigida = '20/05/1842';
          } else if (textoDescricao.includes('Ribeirão Preto')) {
            dataCorrigida = '19/06/1856';
          } else if (textoDescricao.includes('Dois Córregos')) {
            dataCorrigida = '04/02/1883';
          } else {
            // Extrair a data do elemento de data, se disponível
            const dataElement = eventoItem.querySelector('.event-date');
            if (dataElement) {
              const textoData = dataElement.textContent || '';
              const partesData = textoData.split('|');
              if (partesData.length > 1) {
                const dataExtraida = partesData[1].trim().split('/'); // formato: DD/MM/YYYY
                if (dataExtraida.length >= 2) {
                  dataCorrigida = dataExtraida[0] + '/' + dataExtraida[1];
                }
              }
            }
          }
          
          // Aplicar a correção se uma data válida foi encontrada
          if (dataCorrigida) {
            descricaoEvento.textContent = textoDescricao + ' em ' + dataCorrigida;
            console.log("[EVENTOS] Corrigida descrição para: " + descricaoEvento.textContent);
          }
        }
      }
      
      // Aplicar a visibilidade com base na cidade
      if (cidadeEvento) {
        // Normalizar para comparação (converter para minúsculas e remover acentos)
        const cidadeEventoNormalizada = normalizarTexto(cidadeEvento);
        
        // Verificar se está na lista de cidades adicionadas
        let cidadeNoPercurso = false;
        for (const cidadeAdicionada of cidadesAdicionadas) {
          if (cidadeAdicionada.includes(cidadeEventoNormalizada) || 
              cidadeEventoNormalizada.includes(cidadeAdicionada)) {
            cidadeNoPercurso = true;
            break;
          }
        }
        
        // Definir visibilidade com base na presença no percurso
        if (cidadeNoPercurso) {
          eventoItem.style.display = '';
          console.log("[EVENTOS] Mostrando evento para " + cidadeEvento + " (está no percurso)");
        } else {
          eventoItem.style.display = 'none';
          console.log("[EVENTOS] Ocultando evento para " + cidadeEvento + " (não está no percurso)");
        }
      } else {
        // Se não foi possível determinar a cidade, ocultar o evento
        eventoItem.style.display = 'none';
        console.log("[EVENTOS] Ocultando evento sem cidade identificada");
      }
    });
  }
  
  // Função auxiliar para normalizar texto (remover acentos, converter para minúsculas)
  function normalizarTexto(texto) {
    if (!texto) return '';
    
    // Converter para minúsculas
    texto = texto.toLowerCase();
    
    // Remover acentos
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Remover sufixos comuns como "/SP", "- SP"
    texto = texto.replace(/\s*[\/\-]\s*sp$/, "");
    
    return texto.trim();
  }
  
  console.log("[EVENTOS] Correção de eventos instalada com sucesso!");
})();