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
  
  // Encontrar rotas alternativas
  function encontrarRotas() {
    // Estratégia 1: Classe específica
    let rotas = document.querySelectorAll('.route-alternative');
    if (rotas && rotas.length > 0) {
      return rotas;
    }
    
    // Estratégia 2: Classe alternativa
    rotas = document.querySelectorAll('.alternative');
    if (rotas && rotas.length > 0) {
      return rotas;
    }
    
    // Estratégia 3: Dentro de contêiner específico
    const container = document.querySelector('.route-alternative-box');
    if (container) {
      rotas = container.querySelectorAll('div.card, div.mb-2');
      if (rotas && rotas.length > 0) {
        return rotas;
      }
    }
    
    // Estratégia 4: Buscar título "Rotas Alternativas"
    const titulos = document.querySelectorAll('h3, h4, h5');
    for (let i = 0; i < titulos.length; i++) {
      if (titulos[i].textContent && titulos[i].textContent.trim() === 'Rotas Alternativas') {
        // Encontrar container pai
        let elemento = titulos[i];
        for (let j = 0; j < 3; j++) {
          if (elemento.parentElement) {
            elemento = elemento.parentElement;
          }
        }
        
        // Buscar cards dentro deste container
        rotas = elemento.querySelectorAll('div.card, div.mb-2');
        if (rotas && rotas.length > 0) {
          return rotas;
        }
        
        // Tentar qualquer div que tenha km e min
        const divs = elemento.querySelectorAll('div');
        const candidatos = Array.from(divs).filter(div => {
          const texto = div.textContent || '';
          return texto.includes('km') && texto.includes('min');
        });
        
        if (candidatos.length > 0) {
          return candidatos;
        }
      }
    }
    
    // Nenhuma rota encontrada
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
  
  // Extrair informações de distância e tempo
  function extrairInformacoes(rota, index) {
    // Método 1: Buscar elementos específicos
    const distanciaEl = rota.querySelector('.route-distance');
    const tempoEl = rota.querySelector('.route-time');
    
    if (distanciaEl) {
      const distancia = distanciaEl.textContent.trim();
      rota.setAttribute('data-distancia', distancia);
      console.log(`🔎 [DetectorRotas] Rota ${index+1} - Distância: ${distancia}`);
    }
    
    if (tempoEl) {
      const tempo = tempoEl.textContent.trim();
      rota.setAttribute('data-tempo', tempo);
      console.log(`🔎 [DetectorRotas] Rota ${index+1} - Tempo: ${tempo}`);
    }
    
    // Método 2: Buscar por texto
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      const texto = rota.textContent || '';
      
      // Buscar distância
      const matchDistancia = texto.match(/(\d+[.,]?\d*\s*km)/i);
      if (matchDistancia && !rota.hasAttribute('data-distancia')) {
        rota.setAttribute('data-distancia', matchDistancia[0]);
        console.log(`🔎 [DetectorRotas] Rota ${index+1} - Distância (texto): ${matchDistancia[0]}`);
      }
      
      // Buscar tempo
      const matchTempo = texto.match(/(\d+\s*min|\d+\s*hora[s]?)/i);
      if (matchTempo && !rota.hasAttribute('data-tempo')) {
        rota.setAttribute('data-tempo', matchTempo[0]);
        console.log(`🔎 [DetectorRotas] Rota ${index+1} - Tempo (texto): ${matchTempo[0]}`);
      }
    }
    
    // Se ainda não encontrou, usar valores padrão
    if (!rota.hasAttribute('data-distancia')) {
      rota.setAttribute('data-distancia', 'Distância não disponível');
    }
    
    if (!rota.hasAttribute('data-tempo')) {
      rota.setAttribute('data-tempo', 'Tempo não disponível');
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