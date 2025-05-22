/**
 * DETECTOR DE ROTAS ALTERNATIVAS
 * 
 * Este script é responsável por encontrar e manipular as rotas alternativas.
 * Usa várias estratégias para encontrar as rotas e extrair as informações.
 */
(function() {
  console.log("🔎 [DetectorRotas] Inicializando");
  
  // Variáveis para controle
  let tentativas = 0;
  const MAX_TENTATIVAS = 12;
  let rotasEncontradas = false;
  let observerConfigurado = false;
  
  // Executar quando a página carrega
  window.addEventListener('load', iniciar);
  
  // Também tentar imediatamente
  setTimeout(iniciar, 100);
  
  // E em intervalos
  const intervalos = [500, 1000, 2000, 3000, 5000];
  intervalos.forEach(tempo => {
    setTimeout(iniciar, tempo);
  });
  
  // Função principal
  function iniciar() {
    console.log(`🔎 [DetectorRotas] Tentativa ${tentativas+1} de ${MAX_TENTATIVAS}`);
    
    if (rotasEncontradas || tentativas >= MAX_TENTATIVAS) {
      return;
    }
    
    tentativas++;
    
    // 1. Adicionar CSS para ocultar elementos
    adicionarCSS();
    
    // 2. Tentar encontrar rotas
    const rotas = encontrarRotas();
    
    if (rotas && rotas.length > 0) {
      console.log(`🔎 [DetectorRotas] Encontradas ${rotas.length} rotas alternativas`);
      
      // 3. Processar cada rota
      processarRotas(rotas);
      
      rotasEncontradas = true;
    } else {
      console.log("🔎 [DetectorRotas] Nenhuma rota alternativa encontrada ainda");
    }
    
    // 4. Configurar observer (apenas uma vez)
    if (!observerConfigurado) {
      configurarObserver();
      observerConfigurado = true;
    }
  }
  
  // Adicionar CSS para ocultar informações
  function adicionarCSS() {
    if (document.getElementById('css-detector-rotas')) {
      return;
    }
    
    const estilo = document.createElement('style');
    estilo.id = 'css-detector-rotas';
    estilo.textContent = `
      /* Ocultar elementos de distância e tempo */
      .route-alternative .route-distance,
      .route-alternative .route-time,
      .alternative .route-distance,
      .alternative .route-time,
      div.mb-2 .route-distance,
      div.mb-2 .route-time {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Estilos para rotas alternativas */
      .route-alternative,
      .alternative,
      div.mb-2 {
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 6px;
      }
      
      /* Rota selecionada */
      .rota-selecionada {
        background-color: #fff9e6 !important;
        border-color: #ffd966 !important;
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("🔎 [DetectorRotas] CSS adicionado");
  }
  
  // Encontrar rotas alternativas - versão melhorada
  function encontrarRotas() {
    console.log("🔎 [DetectorRotas] Buscando rotas alternativas...");
    
    // Estratégia 1: Classe específica
    let rotas = document.querySelectorAll('.route-alternative');
    if (rotas && rotas.length > 0) {
      console.log(`🔎 [DetectorRotas] Encontradas ${rotas.length} rotas pela classe .route-alternative`);
      return rotas;
    }
    
    // Estratégia 2: Classe alternativa
    rotas = document.querySelectorAll('.alternative');
    if (rotas && rotas.length > 0) {
      console.log(`🔎 [DetectorRotas] Encontradas ${rotas.length} rotas pela classe .alternative`);
      return rotas;
    }
    
    // Estratégia 3: Dentro de contêiner específico
    const containers = [
      '.route-alternative-box',
      '.route-alternatives',
      '.alternatives',
      '.routes-container',
      '#route-alternatives'
    ];
    
    for (const selector of containers) {
      const container = document.querySelector(selector);
      if (container) {
        rotas = container.querySelectorAll('div.card, div.mb-2, .route-item, .route-option');
        if (rotas && rotas.length > 0) {
          console.log(`🔎 [DetectorRotas] Encontradas ${rotas.length} rotas dentro do container ${selector}`);
          return rotas;
        }
      }
    }
    
    // Estratégia 4: Buscar título "Rotas Alternativas"
    const textosTitulo = ['Rotas Alternativas', 'Alternativas de Rota', 'Opções de Rota', 'Rotas Disponíveis'];
    const titulos = document.querySelectorAll('h1, h2, h3, h4, h5, h6, div.title, .header, .heading');
    
    for (let i = 0; i < titulos.length; i++) {
      const textoTitulo = titulos[i].textContent?.trim() || '';
      
      // Verificar se o título corresponde a algum dos textos procurados
      const encontrado = textosTitulo.some(texto => textoTitulo.includes(texto));
      
      if (encontrado) {
        console.log(`🔎 [DetectorRotas] Encontrado título de rotas alternativas: "${textoTitulo}"`);
        
        // Encontrar container pai - tentar vários níveis
        let elemento = titulos[i];
        let elementoPai = null;
        
        // Tentar até 5 níveis acima
        for (let j = 0; j < 5; j++) {
          if (elemento.parentElement) {
            elemento = elemento.parentElement;
            
            // Verificar se este elemento contém possíveis rotas
            const divs = elemento.querySelectorAll('div');
            const possiveisRotas = Array.from(divs).filter(div => {
              const texto = div.textContent || '';
              return (texto.includes('km') && texto.includes('min')) || 
                     (texto.match(/\d+\s*km/) && texto.match(/\d+\s*min/));
            });
            
            if (possiveisRotas.length > 0) {
              console.log(`🔎 [DetectorRotas] Encontradas ${possiveisRotas.length} possíveis rotas por texto (km/min)`);
              elementoPai = elemento;
              break;
            }
          }
        }
        
        // Se encontrou um elemento pai com rotas
        if (elementoPai) {
          // Buscar cards ou divs que pareçam ser rotas alternativas
          rotas = elementoPai.querySelectorAll('div.card, div.mb-2, .list-group-item');
          if (rotas && rotas.length > 0) {
            console.log(`🔎 [DetectorRotas] Encontradas ${rotas.length} rotas em cards`);
            return rotas;
          }
          
          // Buscar qualquer div que possa ser uma rota alternativa
          const divs = elementoPai.querySelectorAll('div');
          const candidatos = Array.from(divs).filter(div => {
            // Filtrar apenas divs que tenham textos que pareçam ser uma rota
            const texto = div.textContent || '';
            return (texto.includes('km') && texto.includes('min')) || 
                   (texto.match(/\d+\s*km/) && texto.match(/\d+\s*min/));
          });
          
          if (candidatos.length > 0) {
            console.log(`🔎 [DetectorRotas] Encontradas ${candidatos.length} rotas por conteúdo`);
            return candidatos;
          }
        }
      }
    }
    
    // Estratégia 5: Última chance - buscar qualquer div com distância e tempo
    console.log("🔎 [DetectorRotas] Tentando estratégia de último recurso...");
    const todasDivs = document.querySelectorAll('div');
    const candidatosFinais = Array.from(todasDivs).filter(div => {
      const texto = div.textContent || '';
      const contemDistancia = texto.match(/\d+[.,]?\d*\s*km/);
      const contemTempo = texto.match(/\d+\s*min/);
      return contemDistancia && contemTempo && div.children.length < 5;
    });
    
    if (candidatosFinais.length > 0) {
      console.log(`🔎 [DetectorRotas] Encontradas ${candidatosFinais.length} possíveis rotas (último recurso)`);
      return candidatosFinais;
    }
    
    // Nenhuma rota encontrada
    console.log("🔎 [DetectorRotas] Nenhuma rota alternativa encontrada após todas as tentativas");
    return null;
  }
  
  // Processar rotas encontradas
  function processarRotas(rotas) {
    rotas.forEach(function(rota, index) {
      // Verificar se já foi processada
      if (rota.hasAttribute('data-rota-processada')) {
        return;
      }
      
      // Marcar como processada
      rota.setAttribute('data-rota-processada', 'true');
      
      // Extrair informações
      extrairInformacoes(rota, index);
      
      // Adicionar evento de clique
      rota.addEventListener('click', function() {
        // Remover seleção anterior
        document.querySelectorAll('.rota-selecionada').forEach(r => {
          r.classList.remove('rota-selecionada');
          r.style.backgroundColor = '';
          r.style.borderColor = '';
        });
        
        // Selecionar esta rota
        this.classList.add('rota-selecionada');
        this.style.backgroundColor = '#fff9e6';
        this.style.borderColor = '#ffd966';
        
        // Emitir evento para atualizar o painel
        const evento = new CustomEvent('rotaSelecionada', {
          detail: {
            distancia: this.getAttribute('data-distancia'),
            tempo: this.getAttribute('data-tempo')
          }
        });
        document.dispatchEvent(evento);
      });
    });
    
    // Selecionar primeira rota automaticamente
    if (rotas.length > 0) {
      setTimeout(() => {
        rotas[0].click();
      }, 500);
    }
  }
  
  // Extrair informações de distância e tempo - versão aprimorada
  function extrairInformacoes(rota, index) {
    console.log(`🔎 [DetectorRotas] Extraindo informações da rota ${index+1}`);
    
    // Método 1: Buscar elementos específicos por classe
    const classesDistancia = ['.route-distance', '.distance', '.km', '.distancia'];
    const classesTempo = ['.route-time', '.time', '.duration', '.tempo', '.min'];
    
    let distanciaEncontrada = false;
    let tempoEncontrado = false;
    
    // Tentar encontrar por classes
    for (const classe of classesDistancia) {
      const distanciaEl = rota.querySelector(classe);
      if (distanciaEl) {
        const distancia = distanciaEl.textContent.trim();
        rota.setAttribute('data-distancia', distancia);
        console.log(`🔎 [DetectorRotas] Rota ${index+1} - Distância por classe ${classe}: ${distancia}`);
        distanciaEncontrada = true;
        break;
      }
    }
    
    for (const classe of classesTempo) {
      const tempoEl = rota.querySelector(classe);
      if (tempoEl) {
        const tempo = tempoEl.textContent.trim();
        rota.setAttribute('data-tempo', tempo);
        console.log(`🔎 [DetectorRotas] Rota ${index+1} - Tempo por classe ${classe}: ${tempo}`);
        tempoEncontrado = true;
        break;
      }
    }
    
    // Método 2: Buscar spans, divs ou qualquer elemento com conteúdo
    if (!distanciaEncontrada || !tempoEncontrado) {
      const elementos = rota.querySelectorAll('span, div, p, strong, b');
      
      for (let i = 0; i < elementos.length; i++) {
        const texto = elementos[i].textContent.trim();
        
        // Verificar distância
        if (!distanciaEncontrada && texto.match(/\d+[.,]?\d*\s*km/i)) {
          rota.setAttribute('data-distancia', texto);
          console.log(`🔎 [DetectorRotas] Rota ${index+1} - Distância por elemento: ${texto}`);
          distanciaEncontrada = true;
        }
        
        // Verificar tempo
        if (!tempoEncontrado && (texto.match(/\d+\s*min/i) || texto.match(/\d+\s*hora[s]?/i))) {
          rota.setAttribute('data-tempo', texto);
          console.log(`🔎 [DetectorRotas] Rota ${index+1} - Tempo por elemento: ${texto}`);
          tempoEncontrado = true;
        }
        
        // Se encontrou ambos, parar
        if (distanciaEncontrada && tempoEncontrado) {
          break;
        }
      }
    }
    
    // Método 3: Analisar todo o texto da rota
    if (!distanciaEncontrada || !tempoEncontrado) {
      const textoCompleto = rota.textContent || '';
      
      // Padrões mais detalhados para capturar distância
      const padroesDistancia = [
        /(\d+[.,]?\d*\s*km)/i,                  // 150 km, 150.5 km, 150,5 km
        /distância:\s*(\d+[.,]?\d*\s*km)/i,     // distância: 150 km
        /percurso:\s*(\d+[.,]?\d*\s*km)/i,      // percurso: 150 km
        /(\d+[.,]?\d*)\s*quilômetros/i,         // 150 quilômetros
        /(\d+[.,]?\d*)\s*quilometros/i          // 150 quilometros (sem acento)
      ];
      
      // Padrões mais detalhados para capturar tempo
      const padroesTempo = [
        /(\d+\s*min)/i,                         // 45 min
        /(\d+\s*minutos)/i,                     // 45 minutos
        /(\d+\s*hora[s]?(?:\s+e\s+\d+\s*min)?)/i, // 1 hora, 2 horas, 1 hora e 30 min
        /tempo:\s*(\d+\s*min|\d+\s*hora[s]?)/i, // tempo: 45 min, tempo: 1 hora
        /duração:\s*(\d+\s*min|\d+\s*hora[s]?)/i // duração: 45 min
      ];
      
      // Buscar distância com padrões mais específicos
      if (!distanciaEncontrada) {
        for (const padrao of padroesDistancia) {
          const match = textoCompleto.match(padrao);
          if (match) {
            const distancia = match[1] || match[0];
            rota.setAttribute('data-distancia', distancia);
            console.log(`🔎 [DetectorRotas] Rota ${index+1} - Distância por padrão: ${distancia}`);
            distanciaEncontrada = true;
            break;
          }
        }
      }
      
      // Buscar tempo com padrões mais específicos
      if (!tempoEncontrado) {
        for (const padrao of padroesTempo) {
          const match = textoCompleto.match(padrao);
          if (match) {
            const tempo = match[1] || match[0];
            rota.setAttribute('data-tempo', tempo);
            console.log(`🔎 [DetectorRotas] Rota ${index+1} - Tempo por padrão: ${tempo}`);
            tempoEncontrado = true;
            break;
          }
        }
      }
    }
    
    // Se ainda não encontrou, usar valores padrão ou estimados
    if (!distanciaEncontrada) {
      // Método 4: Ver se existe algum número seguido de "km" em qualquer formato
      const textoCompleto = rota.textContent || '';
      const numerosSeguidos = textoCompleto.match(/(\d+[.,]?\d*)/g);
      
      if (numerosSeguidos && numerosSeguidos.length > 0) {
        // Tenta encontrar um número que pareça ser uma distância (geralmente entre 1 e 2000)
        for (const num of numerosSeguidos) {
          const valor = parseFloat(num.replace(',', '.'));
          if (valor >= 1 && valor <= 2000) {
            const distanciaEstimada = `${valor} km`;
            rota.setAttribute('data-distancia', distanciaEstimada);
            console.log(`🔎 [DetectorRotas] Rota ${index+1} - Distância estimada: ${distanciaEstimada}`);
            break;
          }
        }
      }
      
      // Se ainda não tiver, usar padrão
      if (!rota.hasAttribute('data-distancia')) {
        rota.setAttribute('data-distancia', 'Distância não disponível');
        console.log(`🔎 [DetectorRotas] Rota ${index+1} - Distância não encontrada`);
      }
    }
    
    if (!tempoEncontrado) {
      // Método 4: Ver se existe algum número que possa ser tempo em minutos
      const textoCompleto = rota.textContent || '';
      const numerosSeguidos = textoCompleto.match(/(\d+)/g);
      
      if (numerosSeguidos && numerosSeguidos.length > 0) {
        // Tenta encontrar um número que pareça ser um tempo (geralmente entre 1 e 1000 minutos)
        for (const num of numerosSeguidos) {
          const valor = parseInt(num);
          if (valor >= 1 && valor <= 1000) {
            const tempoEstimado = `${valor} min`;
            rota.setAttribute('data-tempo', tempoEstimado);
            console.log(`🔎 [DetectorRotas] Rota ${index+1} - Tempo estimado: ${tempoEstimado}`);
            break;
          }
        }
      }
      
      // Se ainda não tiver, usar padrão
      if (!rota.hasAttribute('data-tempo')) {
        rota.setAttribute('data-tempo', 'Tempo não disponível');
        console.log(`🔎 [DetectorRotas] Rota ${index+1} - Tempo não encontrado`);
      }
    }
  }
  
  // Configurar observer para monitorar mudanças
  function configurarObserver() {
    const observer = new MutationObserver(function(mutations) {
      if (rotasEncontradas) {
        return;
      }
      
      // Verificar se alguma mutação adicionou elementos
      const deveVerificar = mutations.some(mutation => {
        return mutation.addedNodes.length > 0;
      });
      
      if (deveVerificar) {
        iniciar();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🔎 [DetectorRotas] Observer configurado");
  }
})();