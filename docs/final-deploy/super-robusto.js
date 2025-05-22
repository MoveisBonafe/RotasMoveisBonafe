/**
 * SCRIPT SUPER ROBUSTO PARA ROTAS ALTERNATIVAS
 * 
 * Esta versão utiliza uma estratégia muito mais agressiva para encontrar
 * as rotas alternativas mesmo quando o HTML tem estrutura diferente.
 */

(function() {
  // Executar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', iniciar);
  
  // Backup com window.onload 
  window.onload = iniciar;
  
  // Também tentar iniciar imediatamente
  setTimeout(iniciar, 100);
  
  // Variáveis globais
  let tentativas = 0;
  const MAX_TENTATIVAS = 20;
  let intervalChecker = null;
  
  // Função principal
  function iniciar() {
    console.log("🚀 SUPER ROBUSTO: Iniciando (tentativa " + (tentativas + 1) + ")");
    
    // Limpar intervalo anterior se existir
    if (intervalChecker) {
      clearInterval(intervalChecker);
    }
    
    // Configurar verificação periódica
    intervalChecker = setInterval(verificarEAplicar, 1000);
    
    // Também tentar agora
    verificarEAplicar();
    
    // Observar mudanças no DOM
    observarDOM();
  }
  
  // Verificar se elementos existem e aplicar mudanças
  function verificarEAplicar() {
    tentativas++;
    console.log("🚀 SUPER ROBUSTO: Verificando elementos (tentativa " + tentativas + ")");
    
    // Buscar título da seção de rotas alternativas
    const tituloRotasAlt = buscarElementoPorTexto('Rotas Alternativas');
    if (tituloRotasAlt) {
      console.log("🚀 SUPER ROBUSTO: Título 'Rotas Alternativas' encontrado!");
      
      // Encontrar o container pai que contém as rotas
      let containerRotas = null;
      
      // Método 1: Subir na hierarquia e procurar um container
      let elementoAtual = tituloRotasAlt;
      for (let i = 0; i < 5; i++) {
        elementoAtual = elementoAtual.parentElement;
        if (elementoAtual) {
          // Verificar se este elemento contém as rotas
          const possiveisRotas = encontrarRotasAlternativas(elementoAtual);
          if (possiveisRotas && possiveisRotas.length > 0) {
            containerRotas = elementoAtual;
            break;
          }
        } else {
          break;
        }
      }
      
      // Se encontrou o container, processar as rotas
      if (containerRotas) {
        const rotasEncontradas = encontrarRotasAlternativas(containerRotas);
        if (rotasEncontradas && rotasEncontradas.length > 0) {
          console.log("🚀 SUPER ROBUSTO: Encontradas " + rotasEncontradas.length + " rotas alternativas!");
          
          // Processar cada rota
          processarRotasAlternativas(rotasEncontradas);
          
          // Criar painel de informações
          criarOuAtualizarPainel();
          
          // Limpar intervalo após sucesso
          if (intervalChecker) {
            clearInterval(intervalChecker);
            intervalChecker = null;
          }
          
          return true;
        }
      }
    }
    
    // Método alternativo: procurar diretamente por cards que podem ser rotas
    const possiveisCards = document.querySelectorAll('.card, .card-body, .route-alternative, .alternative');
    if (possiveisCards.length > 0) {
      console.log("🚀 SUPER ROBUSTO: Encontrados " + possiveisCards.length + " possíveis cards de rotas");
      
      // Filtrar apenas os que parecem ser rotas alternativas
      const rotasProvaveis = Array.from(possiveisCards).filter(card => {
        const texto = card.textContent || '';
        return (texto.includes('km') && texto.includes('min')) || 
               texto.includes('Opção') || 
               texto.includes('Rota');
      });
      
      if (rotasProvaveis.length > 0) {
        console.log("🚀 SUPER ROBUSTO: Filtrados " + rotasProvaveis.length + " cards que parecem ser rotas");
        processarRotasAlternativas(rotasProvaveis);
        criarOuAtualizarPainel();
        
        // Limpar intervalo após sucesso
        if (intervalChecker) {
          clearInterval(intervalChecker);
          intervalChecker = null;
        }
        
        return true;
      }
    }
    
    // Se chegou ao número máximo de tentativas, parar
    if (tentativas >= MAX_TENTATIVAS) {
      console.log("🚀 SUPER ROBUSTO: Número máximo de tentativas atingido, parando verificação");
      if (intervalChecker) {
        clearInterval(intervalChecker);
        intervalChecker = null;
      }
    }
    
    return false;
  }
  
  // Encontrar elemento por texto contido
  function buscarElementoPorTexto(texto) {
    // Expressão para buscar com flexibilidade
    const regexp = new RegExp(texto, 'i');
    
    // Array para guardar todos os elementos de texto
    const elementos = [];
    
    // Recursão para buscar em toda a árvore DOM
    function buscarRecursivo(node) {
      // Ignorar scripts e estilos
      if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
        return;
      }
      
      // Verificar nós de texto
      if (node.nodeType === Node.TEXT_NODE) {
        if (regexp.test(node.textContent)) {
          elementos.push(node.parentNode);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Verificar atributos
        if (node.title && regexp.test(node.title)) {
          elementos.push(node);
        }
        
        if (node.alt && regexp.test(node.alt)) {
          elementos.push(node);
        }
        
        if (node.placeholder && regexp.test(node.placeholder)) {
          elementos.push(node);
        }
        
        // Processar filhos
        for (let i = 0; i < node.childNodes.length; i++) {
          buscarRecursivo(node.childNodes[i]);
        }
      }
    }
    
    // Iniciar busca a partir do body
    buscarRecursivo(document.body);
    
    // Retornar o primeiro elemento encontrado
    return elementos.length > 0 ? elementos[0] : null;
  }
  
  // Encontrar rotas alternativas dentro de um container
  function encontrarRotasAlternativas(container) {
    // Tentar diferentes seletores
    let rotas = container.querySelectorAll('.route-alternative, .card.mb-2, .alternative');
    
    // Se não encontrar, tentar buscar por cards que contenham distância e tempo
    if (!rotas || rotas.length === 0) {
      const todosCards = container.querySelectorAll('.card, div[class*="card"], div[class*="alternative"]');
      
      if (todosCards && todosCards.length > 0) {
        rotas = Array.from(todosCards).filter(card => {
          const texto = card.textContent || '';
          return (texto.includes('km') && texto.includes('min'));
        });
      }
    }
    
    // Método final: buscar divs que contenham km e min
    if (!rotas || rotas.length === 0) {
      const todasDivs = container.querySelectorAll('div');
      
      if (todasDivs && todasDivs.length > 0) {
        rotas = Array.from(todasDivs).filter(div => {
          if (div.children.length >= 2) { // Deve ter pelo menos alguns filhos
            const texto = div.textContent || '';
            return (texto.includes('km') && texto.includes('min') && !texto.includes('Rotas Alternativas'));
          }
          return false;
        });
      }
    }
    
    return rotas;
  }
  
  // Processar rotas alternativas
  function processarRotasAlternativas(rotas) {
    rotas.forEach((rota, index) => {
      console.log("🚀 SUPER ROBUSTO: Processando rota #" + (index + 1));
      
      // Estilizar a rota
      rota.style.cursor = 'pointer';
      rota.style.transition = 'all 0.2s ease';
      rota.style.borderRadius = '6px';
      rota.style.marginBottom = '8px';
      
      // Extrair informações de distância e tempo
      extrairInformacoesDaRota(rota);
      
      // Adicionar eventos se ainda não tiver
      if (!rota.hasAttribute('data-processado')) {
        // Marcar como processado
        rota.setAttribute('data-processado', 'true');
        
        // Adicionar evento de clique
        rota.addEventListener('click', function() {
          // Remover seleção das outras rotas
          rotas.forEach(r => {
            r.style.backgroundColor = '';
            r.style.borderColor = '';
            r.style.boxShadow = '';
            r.classList.remove('rota-selecionada');
          });
          
          // Adicionar seleção a esta rota
          this.style.backgroundColor = '#fff9e6';
          this.style.borderColor = '#ffd966';
          this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
          this.classList.add('rota-selecionada');
          
          // Atualizar informações
          atualizarInformacoesPainel(this);
        });
        
        // Adicionar evento de hover
        rota.addEventListener('mouseenter', function() {
          if (!this.classList.contains('rota-selecionada')) {
            this.style.backgroundColor = '#f5f9ff';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
          }
        });
        
        rota.addEventListener('mouseleave', function() {
          if (!this.classList.contains('rota-selecionada')) {
            this.style.backgroundColor = '';
            this.style.transform = '';
            this.style.boxShadow = '';
          }
        });
      }
      
      // Ocultar elementos de distância e tempo
      ocultarElementosDistanciaTempo(rota);
    });
  }
  
  // Extrair informações de uma rota
  function extrairInformacoesDaRota(rota) {
    // Método 1: buscar por classes específicas
    const distancias = rota.querySelectorAll('.route-distance, [class*="distance"]');
    const tempos = rota.querySelectorAll('.route-time, [class*="time"]');
    
    if (distancias.length > 0) {
      rota.setAttribute('data-distancia', distancias[0].textContent.trim());
    }
    
    if (tempos.length > 0) {
      rota.setAttribute('data-tempo', tempos[0].textContent.trim());
    }
    
    // Método 2: buscar por conteúdo de texto
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      const texto = rota.textContent || '';
      
      // Padrão para distância: número seguido de km
      const padraoDistancia = /(\d+[,.]?\d*\s*km)/i;
      const matchDistancia = texto.match(padraoDistancia);
      
      if (matchDistancia && !rota.hasAttribute('data-distancia')) {
        rota.setAttribute('data-distancia', matchDistancia[0]);
      }
      
      // Padrão para tempo: número seguido de min ou hora
      const padraoTempo = /(\d+\s*min|\d+\s*hora[s]?)/i;
      const matchTempo = texto.match(padraoTempo);
      
      if (matchTempo && !rota.hasAttribute('data-tempo')) {
        rota.setAttribute('data-tempo', matchTempo[0]);
      }
    }
    
    // Método 3: procurar em cada filho
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      Array.from(rota.querySelectorAll('*')).forEach(elemento => {
        const texto = elemento.textContent || '';
        
        if (texto.includes('km') && !rota.hasAttribute('data-distancia')) {
          rota.setAttribute('data-distancia', texto.trim());
        }
        
        if ((texto.includes('min') || texto.includes('hora')) && !rota.hasAttribute('data-tempo')) {
          rota.setAttribute('data-tempo', texto.trim());
        }
      });
    }
    
    console.log("🚀 SUPER ROBUSTO: Dados extraídos", 
      rota.getAttribute('data-distancia'), 
      rota.getAttribute('data-tempo'));
  }
  
  // Ocultar elementos de distância e tempo
  function ocultarElementosDistanciaTempo(rota) {
    // Adicionar CSS global se ainda não existir
    if (!document.getElementById('css-ocultacao')) {
      const estilo = document.createElement('style');
      estilo.id = 'css-ocultacao';
      estilo.textContent = `
        .route-distance, .route-time, 
        [class*="distance"], [class*="time"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(estilo);
    }
    
    // Método 1: ocultar por classes
    const ocultar = rota.querySelectorAll('.route-distance, .route-time, [class*="distance"], [class*="time"]');
    ocultar.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.height = '0';
      el.style.overflow = 'hidden';
    });
    
    // Método 2: ocultar por conteúdo
    Array.from(rota.querySelectorAll('*')).forEach(elemento => {
      const texto = elemento.textContent || '';
      
      // Se o elemento contém apenas distância ou tempo (e não outro texto), ocultá-lo
      if ((texto.match(/^\s*\d+[,.]?\d*\s*km\s*$/) || 
           texto.match(/^\s*\d+\s*min\s*$/) ||
           texto.match(/^\s*\d+\s*hora[s]?\s*$/)) && 
          !elemento.querySelector('*')) { // não ocultar se tiver filhos
        
        elemento.style.display = 'none';
        elemento.style.visibility = 'hidden';
        elemento.style.opacity = '0';
        elemento.style.height = '0';
        elemento.style.overflow = 'hidden';
      }
    });
  }
  
  // Criar ou atualizar painel de informações
  function criarOuAtualizarPainel() {
    // Verificar se o painel já existe
    if (document.getElementById('painel-info-super-robusto')) {
      return;
    }
    
    console.log("🚀 SUPER ROBUSTO: Criando painel de informações");
    
    // Encontrar o botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button') || 
                          document.querySelector('button:contains("Visualizar")') ||
                          document.querySelector('button.btn-primary') ||
                          document.querySelector('button.btn-warning');
    
    if (!botaoVisualizar) {
      console.log("🚀 SUPER ROBUSTO: Botão Visualizar não encontrado");
      
      // Tentar novamente mais tarde
      setTimeout(criarOuAtualizarPainel, 1000);
      return;
    }
    
    // Melhorar aparência do botão
    botaoVisualizar.style.backgroundColor = '#ffc107';
    botaoVisualizar.style.color = '#212529';
    botaoVisualizar.style.fontWeight = 'bold';
    botaoVisualizar.style.borderRadius = '4px';
    botaoVisualizar.style.border = 'none';
    botaoVisualizar.style.padding = '8px 15px';
    botaoVisualizar.style.minWidth = '120px';
    
    // Criar container
    const container = document.createElement('div');
    container.id = 'container-super-robusto';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '10px 0';
    container.style.padding = '5px';
    container.style.backgroundColor = '#f8f9fa';
    container.style.borderRadius = '6px';
    
    // Mover botão para container
    const parent = botaoVisualizar.parentNode;
    parent.removeChild(botaoVisualizar);
    container.appendChild(botaoVisualizar);
    
    // Criar painel de informações
    const painel = document.createElement('div');
    painel.id = 'painel-info-super-robusto';
    painel.style.marginLeft = '15px';
    painel.style.padding = '8px 12px';
    painel.style.backgroundColor = 'white';
    painel.style.borderRadius = '4px';
    painel.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    painel.style.fontSize = '14px';
    painel.style.color = '#555';
    
    // Adicionar conteúdo
    painel.innerHTML = `
      <div id="info-dist-super" style="margin-bottom: 6px; display: flex; align-items: center;">
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo-super" style="display: flex; align-items: center;">
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar ao container
    container.appendChild(painel);
    
    // Adicionar container ao DOM
    parent.appendChild(container);
    
    // Adicionar Font Awesome se necessário
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
    
    // Interceptar clique no botão
    const clickOriginal = botaoVisualizar.onclick;
    botaoVisualizar.onclick = function(event) {
      // Executar comportamento original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Atualizar informações da rota selecionada
      const rotaSelecionada = document.querySelector('.rota-selecionada');
      if (rotaSelecionada) {
        atualizarInformacoesPainel(rotaSelecionada);
      }
    };
  }
  
  // Atualizar informações no painel
  function atualizarInformacoesPainel(rota) {
    const distancia = rota.getAttribute('data-distancia');
    const tempo = rota.getAttribute('data-tempo');
    
    if (!distancia || !tempo) {
      console.log("🚀 SUPER ROBUSTO: Sem dados para atualizar painel");
      return;
    }
    
    console.log("🚀 SUPER ROBUSTO: Atualizando painel com", distancia, tempo);
    
    const distEl = document.getElementById('info-dist-super');
    const tempoEl = document.getElementById('info-tempo-super');
    
    if (distEl && tempoEl) {
      distEl.innerHTML = `
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${distancia}</span>
      `;
      
      tempoEl.innerHTML = `
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${tempo}</span>
      `;
    }
  }
  
  // Observar mudanças no DOM
  function observarDOM() {
    const observer = new MutationObserver(function(mutations) {
      verificarEAplicar();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🚀 SUPER ROBUSTO: Observer configurado");
  }
  
  // Extensão para querySelectorAll com seletor por texto
  Element.prototype.querySelectorContains = function(selector, text) {
    let elements = this.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function(element) {
      return RegExp(text, 'i').test(element.textContent);
    });
  };
  
  // Extensão para querySelector com texto
  document.querySelector = (function(querySelector) {
    return function(selector) {
      // Se o seletor contém :contains, tratar especialmente
      if (selector.includes(':contains(')) {
        // Extrair o texto a ser buscado
        const match = selector.match(/:contains\(["']?([^)"']+)["']?\)/);
        if (match) {
          const baseSelector = selector.replace(/:contains\(["']?([^)"']+)["']?\)/, '');
          const text = match[1];
          
          // Encontrar todos os elementos que correspondem ao seletor base
          const allElements = document.querySelectorAll(baseSelector);
          
          // Filtrar por texto
          for (let i = 0; i < allElements.length; i++) {
            if (allElements[i].textContent.includes(text)) {
              return allElements[i];
            }
          }
          
          return null;
        }
      }
      
      // Caso contrário, usar o querySelector normal
      return querySelector.call(this, selector);
    };
  })(document.querySelector);
})();