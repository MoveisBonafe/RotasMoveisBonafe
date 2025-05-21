/**
 * Filtro de eventos por cidades no percurso
 * 
 * Este script garante que apenas eventos de cidades que estão no percurso
 * atual sejam exibidos, ocultando todos os outros.
 */

(function() {
  // Executar assim que o script for carregado
  console.log("[CityFilter] Iniciando filtro de eventos por cidades...");
  
  // Função principal para filtrar eventos por cidades no percurso
  function filtrarEventosPorPercurso() {
    console.log("[CityFilter] Verificando cidades no percurso atual...");
    
    // Obter todas as cidades no percurso atual
    const cidadesNoPercurso = obterCidadesNoPercurso();
    console.log("[CityFilter] Cidades no percurso: ", cidadesNoPercurso);
    
    // Se não encontrou nenhuma cidade, não fazer nada
    if (cidadesNoPercurso.length === 0) {
      console.log("[CityFilter] Nenhuma cidade encontrada no percurso");
      return;
    }
    
    // Obter todos os eventos exibidos
    const eventosContainer = document.querySelector('.event-list');
    if (!eventosContainer) {
      console.log("[CityFilter] Container de eventos não encontrado");
      return;
    }
    
    const eventosExibidos = eventosContainer.querySelectorAll('.event-item');
    console.log("[CityFilter] Total de eventos encontrados: " + eventosExibidos.length);
    
    // Filtrar cada evento
    eventosExibidos.forEach(function(eventoElement) {
      // Extrair o nome da cidade do evento
      const cidade = extrairCidadeDoEvento(eventoElement);
      if (!cidade) return;
      
      // Verificar se a cidade está no percurso
      const estaNaRota = cidadeEstaNaRota(cidade, cidadesNoPercurso);
      
      // Atualizar a visibilidade do evento
      if (estaNaRota) {
        eventoElement.style.display = '';
        console.log(`[CityFilter] Mostrando evento para ${cidade} (está no percurso)`);
      } else {
        eventoElement.style.display = 'none';
        console.log(`[CityFilter] Ocultando evento para ${cidade} (não está no percurso)`);
      }
    });
  }
  
  // Função para extrair o nome da cidade de um elemento de evento
  function extrairCidadeDoEvento(eventoElement) {
    // Método 1: Extrair da data do evento (formato "Cidade | Data")
    const elementoData = eventoElement.querySelector('.event-date');
    if (elementoData) {
      const texto = elementoData.textContent || '';
      const match = texto.match(/^([^|]+)\s*\|/);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Método 2: Extrair do título do evento
    const elementoTitulo = eventoElement.querySelector('.event-title');
    if (elementoTitulo) {
      const texto = elementoTitulo.textContent || '';
      // Se o título contém "Aniversário de [Cidade]"
      const match = texto.match(/Anivers[áa]rio\s+d[aeo]\s+(.+)/i);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Método 3: Extrair da primeira linha dentro do evento
    const linhasTitulo = eventoElement.querySelectorAll('div');
    if (linhasTitulo.length > 0) {
      const primeiraLinha = linhasTitulo[0].textContent || '';
      // Padrão "Cidade (Data)"
      const match = primeiraLinha.match(/^([^(]+)\s*\(/);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }
  
  // Função para verificar se uma cidade está no percurso atual
  function cidadeEstaNaRota(cidade, cidadesNoPercurso) {
    if (!cidade) return false;
    
    // Normalizar o nome da cidade para comparação
    const cidadeNormalizada = normalizarNomeCidade(cidade);
    
    // Verificar se a cidade normalizada está na lista de cidades do percurso
    return cidadesNoPercurso.some(function(cidadePercurso) {
      return normalizarNomeCidade(cidadePercurso) === cidadeNormalizada;
    });
  }
  
  // Função para normalizar o nome da cidade (remover acentos, maiúsculas, etc.)
  function normalizarNomeCidade(cidade) {
    if (!cidade) return "";
    
    // Converter para minúsculas
    cidade = cidade.toLowerCase();
    
    // Remover acentos
    cidade = cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Remover sufixos como /SP, - SP, etc.
    cidade = cidade.replace(/\s*[\/\-]\s*sp$/, "");
    
    // Remover "cidade de" do início
    cidade = cidade.replace(/^cidade\s+de\s+/, "");
    
    return cidade.trim();
  }
  
  // Função para obter todas as cidades no percurso atual
  function obterCidadesNoPercurso() {
    const cidadesNoPercurso = [];
    
    // Método 1: Verificar a origem e locais adicionados na sidebar
    const origem = document.querySelector('.sidebar strong');
    if (origem) {
      const textoOrigem = origem.textContent || '';
      if (textoOrigem) {
        // Extrair só a cidade da origem (remover sufixos como ", SP")
        const cidadeOrigem = textoOrigem.split(',')[0].trim();
        cidadesNoPercurso.push(cidadeOrigem);
      }
    }
    
    // Método 2: Verificar locais adicionados na lista
    const locaisAdicionados = document.querySelectorAll('.location-item');
    locaisAdicionados.forEach(function(item) {
      const textoLocal = item.textContent || '';
      // Extrair nome do local (geralmente é a primeira linha ou texto destacado)
      const linhas = textoLocal.split('\n');
      if (linhas.length > 0) {
        const primeiraLinha = linhas[0].trim();
        if (primeiraLinha) {
          cidadesNoPercurso.push(primeiraLinha);
        }
      }
    });
    
    // Adicionar locais da lista de locais adicionados (para confirmar)
    const listaTitulo = document.querySelector('#locationListTitle');
    if (listaTitulo && listaTitulo.nextElementSibling) {
      const locaisLista = listaTitulo.nextElementSibling.querySelectorAll('li');
      locaisLista.forEach(function(item) {
        const textoLocal = item.textContent || '';
        if (textoLocal) {
          cidadesNoPercurso.push(textoLocal.trim());
        }
      });
    }
    
    // Método 3: Verificar no título do percurso (origem → destino)
    const tituloPercurso = document.querySelector('.restrictions-list div[style*="background-color"] span');
    if (tituloPercurso) {
      const textoPercurso = tituloPercurso.textContent || '';
      const cidadesPercurso = textoPercurso.split('→').map(c => c.trim());
      cidadesNoPercurso.push(...cidadesPercurso);
    }
    
    // Método 4: Cidades explicitamente marcadas como "no seu percurso"
    document.querySelectorAll('.city-in-route').forEach(function(elemento) {
      const textoElementoPai = elemento.parentElement.textContent || '';
      const match = textoElementoPai.match(/^([^:]+):/);
      if (match) {
        cidadesNoPercurso.push(match[1].trim());
      }
    });
    
    // Remover duplicatas
    const cidadesUnicas = [...new Set(cidadesNoPercurso)];
    
    return cidadesUnicas;
  }
  
  // Executar o filtro após um curto período
  setTimeout(filtrarEventosPorPercurso, 1000);
  
  // Também filtrar quando a página estiver totalmente carregada
  window.addEventListener('load', function() {
    setTimeout(filtrarEventosPorPercurso, 500);
    setTimeout(filtrarEventosPorPercurso, 2000);
  });
  
  // Observar mudanças no DOM para garantir que o filtro seja aplicado quando novos eventos forem adicionados
  const observer = new MutationObserver(function(mutations) {
    // Verificar se houve alterações relevantes
    const alteracoesRelevantes = mutations.some(function(mutation) {
      return mutation.addedNodes.length > 0 || 
             (mutation.target && 
              (mutation.target.classList.contains('event-list') || 
               mutation.target.classList.contains('location-item')));
    });
    
    if (alteracoesRelevantes) {
      setTimeout(filtrarEventosPorPercurso, 300);
    }
  });
  
  // Observar o corpo do documento para mudanças
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  // Também executar o filtro quando o usuário adicionar um novo local (cliques em botões importantes)
  document.addEventListener('click', function(event) {
    const targetElement = event.target;
    // Verificar se o clique foi em botões relacionados a adição/remoção de locais
    if (targetElement && 
        (targetElement.id === 'add-location-btn' || 
         targetElement.classList.contains('remove-location-btn') ||
         targetElement.id === 'calculate-route-btn' ||
         targetElement.id === 'optimize-route')) {
      setTimeout(filtrarEventosPorPercurso, 500);
    }
  });
  
  console.log("[CityFilter] Filtro de eventos por cidades instalado com sucesso!");
})();