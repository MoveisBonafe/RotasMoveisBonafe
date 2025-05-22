/**
 * SOLUÇÃO INTEGRADA PARA ROTAS ALTERNATIVAS
 * 
 * Este script integra as funcionalidades de detecção de rotas,
 * painel de informações e ajuste do Pegman em um único arquivo,
 * garantindo máxima compatibilidade com o GitHub Pages.
 */
(function() {
  console.log("🔄 [SolucaoIntegrada] Inicializando solução completa");
  
  // Configurações globais
  const CONFIG = {
    intervalos: [500, 1000, 2000, 3000, 5000, 8000, 12000],
    maxTentativas: 15,
    cores: {
      principal: '#ffd966',  // Amarelo Móveis Bonafé
      secundaria: '#fff9e6',
      texto: '#212529',
      borda: '#e6c259'
    }
  };
  
  // Estado global
  const ESTADO = {
    tentativasRotas: 0,
    tentativasPainel: 0,
    tentativasPegman: 0,
    rotasEncontradas: false,
    painelCriado: false,
    pegmanAjustado: false,
    observerConfigurado: false
  };
  
  // ======================================================
  // INICIALIZAÇÃO E CONTROLE
  // ======================================================
  
  // Executar quando a página carrega
  window.addEventListener('load', iniciarTudo);
  document.addEventListener('DOMContentLoaded', iniciarTudo);
  
  // Também tentar imediatamente
  setTimeout(iniciarTudo, 100);
  
  // E em intervalos crescentes
  CONFIG.intervalos.forEach(tempo => {
    setTimeout(iniciarTudo, tempo);
  });
  
  // Função principal de inicialização
  function iniciarTudo() {
    console.log("🔄 [SolucaoIntegrada] Verificando componentes...");
    
    // 1. Injetar CSS geral
    injetarCSSGeral();
    
    // 2. Iniciar módulos
    setTimeout(iniciarRotas, 200);
    setTimeout(iniciarPainel, 500);
    setTimeout(iniciarPegman, 800);
    
    // 3. Configurar observer (apenas uma vez)
    if (!ESTADO.observerConfigurado) {
      configurarObserver();
      ESTADO.observerConfigurado = true;
    }
    
    // 4. Adicionar comunicação entre módulos
    window.addEventListener('rotaDetectada', function(e) {
      console.log("🔄 [SolucaoIntegrada] Evento de rota detectada recebido");
    });
    
    document.addEventListener('rotaSelecionada', function(e) {
      console.log("🔄 [SolucaoIntegrada] Evento de rota selecionada recebido");
    });
  }
  
  // CSS Geral da solução
  function injetarCSSGeral() {
    if (document.getElementById('css-solucao-integrada')) {
      return;
    }
    
    const estilo = document.createElement('style');
    estilo.id = 'css-solucao-integrada';
    estilo.textContent = `
      /* Ocultar elementos de distância e tempo nas rotas alternativas */
      .route-alternative .route-distance,
      .route-alternative .route-time,
      .alternative .route-distance,
      .alternative .route-time,
      div.mb-2 .route-distance,
      div.mb-2 .route-time,
      .route-info .route-distance,
      .route-info .route-time {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Estilos para o painel de informações */
      #container-info-rotas {
        display: flex;
        align-items: center;
        margin: 10px 0;
        padding: 5px;
        background-color: #f8f9fa;
        border-radius: 6px;
      }
      
      #painel-info-rotas {
        margin-left: 15px;
        padding: 8px 12px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #555;
      }
      
      /* Manter o Pegman (Street View) */
      .gm-svpc {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Esconder botões de edição e fullscreen */
      .gm-style-mtc,
      .gm-fullscreen-control {
        display: none !important;
      }
      
      /* Estilizar controles do mapa com a cor do Móveis Bonafé */
      .gm-control-active {
        background-color: ${CONFIG.cores.principal} !important;
        border-color: ${CONFIG.cores.borda} !important;
      }
      
      /* Estilizar o botão Visualizar */
      #visualize-button,
      button:contains("Visualizar"),
      [class*="btn"]:contains("Visualizar") {
        background-color: ${CONFIG.cores.principal} !important;
        color: ${CONFIG.cores.texto} !important;
        font-weight: bold !important;
        border-radius: 4px !important;
        border: none !important;
        padding: 8px 15px !important;
      }
      
      /* Estilizar as rotas alternativas */
      .route-alternative,
      .alternative,
      div.mb-2 {
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 6px;
      }
      
      /* Rota selecionada */
      .rota-selecionada {
        background-color: ${CONFIG.cores.secundaria} !important;
        border-color: ${CONFIG.cores.principal} !important;
      }
      
      /* Animação para informações atualizadas */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-3px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .info-atualizada {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    
    document.head.appendChild(estilo);
    console.log("🔄 [SolucaoIntegrada] CSS geral adicionado");
  }
  
  // Configurar observer para monitorar mudanças
  function configurarObserver() {
    const observer = new MutationObserver(function(mutations) {
      // Verificar se alguma mutação adicionou elementos
      const deveVerificar = mutations.some(mutation => {
        return mutation.addedNodes.length > 0;
      });
      
      if (deveVerificar) {
        if (!ESTADO.rotasEncontradas) {
          setTimeout(iniciarRotas, 200);
        }
        
        if (!ESTADO.painelCriado) {
          setTimeout(iniciarPainel, 300);
        }
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🔄 [SolucaoIntegrada] Observer configurado");
  }
  
  // ======================================================
  // MÓDULO DE DETECÇÃO DE ROTAS
  // ======================================================
  
  // Inicializar detecção de rotas
  function iniciarRotas() {
    if (ESTADO.rotasEncontradas || ESTADO.tentativasRotas >= CONFIG.maxTentativas) {
      return;
    }
    
    ESTADO.tentativasRotas++;
    console.log(`🔎 [DetectorRotas] Tentativa ${ESTADO.tentativasRotas} de ${CONFIG.maxTentativas}`);
    
    // Buscar rotas alternativas
    const rotas = encontrarRotas();
    
    if (rotas && rotas.length > 0) {
      console.log(`🔎 [DetectorRotas] Encontradas ${rotas.length} rotas alternativas`);
      
      // Processar cada rota
      processarRotas(rotas);
      
      ESTADO.rotasEncontradas = true;
      
      // Emitir evento para outros módulos
      const evento = new CustomEvent('rotaDetectada', {
        detail: { rotas: rotas }
      });
      window.dispatchEvent(evento);
    } else {
      console.log("🔎 [DetectorRotas] Nenhuma rota alternativa encontrada ainda");
    }
  }
  
  // Encontrar rotas alternativas
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
        this.style.backgroundColor = CONFIG.cores.secundaria;
        this.style.borderColor = CONFIG.cores.principal;
        
        // Emitir evento para atualizar o painel
        const evento = new CustomEvent('rotaSelecionada', {
          detail: {
            distancia: this.getAttribute('data-distancia'),
            tempo: this.getAttribute('data-tempo'),
            indice: index
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
  
  // ======================================================
  // MÓDULO DE PAINEL DE INFORMAÇÕES
  // ======================================================
  
  // Inicializar painel de informações
  function iniciarPainel() {
    if (ESTADO.painelCriado || ESTADO.tentativasPainel >= CONFIG.maxTentativas) {
      return;
    }
    
    ESTADO.tentativasPainel++;
    console.log(`📊 [PainelInfo] Tentativa ${ESTADO.tentativasPainel} de ${CONFIG.maxTentativas}`);
    
    // Criar painel de informações
    const resultado = criarPainel();
    
    if (resultado) {
      ESTADO.painelCriado = true;
    }
  }
  
  // Criar painel de informações
  function criarPainel() {
    // Verificar se já existe
    if (document.getElementById('container-info-rotas')) {
      return true;
    }
    
    // Encontrar botão Visualizar - várias estratégias
    let botaoVisualizar = null;
    
    // Estratégia 1: Por ID
    botaoVisualizar = document.getElementById('visualize-button');
    
    // Estratégia 2: Por nome de classe + texto
    if (!botaoVisualizar) {
      const botoesClasse = document.querySelectorAll('.btn, .btn-primary, .button, .btn-secondary, .btn-info');
      for (let i = 0; i < botoesClasse.length; i++) {
        const texto = botoesClasse[i].textContent || '';
        if (texto.trim() === 'Visualizar') {
          botaoVisualizar = botoesClasse[i];
          console.log("📊 [PainelInfo] Botão Visualizar encontrado por classe");
          break;
        }
      }
    }
    
    // Estratégia 3: Qualquer botão com o texto
    if (!botaoVisualizar) {
      const botoes = document.querySelectorAll('button');
      for (let i = 0; i < botoes.length; i++) {
        const texto = botoes[i].textContent || '';
        if (texto.includes('Visualizar')) {
          botaoVisualizar = botoes[i];
          console.log("📊 [PainelInfo] Botão Visualizar encontrado por tag button");
          break;
        }
      }
    }
    
    // Estratégia 4: Qualquer elemento com o texto exato
    if (!botaoVisualizar) {
      const elementos = document.querySelectorAll('div, a, span');
      for (let i = 0; i < elementos.length; i++) {
        const texto = elementos[i].textContent || '';
        if (texto.trim() === 'Visualizar') {
          botaoVisualizar = elementos[i];
          console.log("📊 [PainelInfo] Elemento 'Visualizar' encontrado");
          break;
        }
      }
    }
    
    // Ainda não encontrou
    if (!botaoVisualizar) {
      console.log("📊 [PainelInfo] Não foi possível encontrar o botão Visualizar");
      return false;
    }
    
    console.log("📊 [PainelInfo] Criando painel");
    
    // Criar container
    const container = document.createElement('div');
    container.id = 'container-info-rotas';
    
    // Tentar inserir após ou antes do botão Visualizar
    let parent = botaoVisualizar.parentNode;
    
    // Tentar mover o botão para o container (pode falhar em alguns casos)
    try {
      // Primeiro tenta adicionar após o botão
      parent.insertBefore(container, botaoVisualizar.nextSibling);
    } catch (e) {
      console.log("📊 [PainelInfo] Falha ao inserir após o botão, tentando antes:", e);
      try {
        // Se falhar, tenta adicionar antes do botão
        parent.insertBefore(container, botaoVisualizar);
      } catch (e2) {
        console.log("📊 [PainelInfo] Falha ao inserir antes do botão, tentando no pai:", e2);
        try {
          // Se ainda falhar, adiciona ao pai
          parent.appendChild(container);
        } catch (e3) {
          console.log("📊 [PainelInfo] Todas as tentativas falharam:", e3);
          // Último recurso: adicionar ao body
          document.body.appendChild(container);
        }
      }
    }
    
    // Criar painel
    const painel = document.createElement('div');
    painel.id = 'painel-info-rotas';
    painel.innerHTML = `
      <div id="info-dist" style="margin-bottom: 6px;">
        <i class="fa fa-road" style="margin-right: 5px;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo">
        <i class="fa fa-clock" style="margin-right: 5px;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar painel ao container
    container.appendChild(painel);
    
    // Garantir que o Font Awesome está disponível
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
    
    // Escutar evento de rota selecionada
    document.addEventListener('rotaSelecionada', function(e) {
      atualizarPainel(e.detail.distancia, e.detail.tempo);
    });
    
    // Interceptar clique no botão com tratamento de erros
    try {
      const clickOriginal = botaoVisualizar.onclick;
      botaoVisualizar.addEventListener('click', function(event) {
        // Executar comportamento original se possível
        if (clickOriginal && typeof clickOriginal === 'function') {
          try {
            clickOriginal.call(this, event);
          } catch (e) {
            console.log("📊 [PainelInfo] Erro ao executar comportamento original do botão:", e);
          }
        }
        
        // Atualizar informações
        setTimeout(function() {
          const rotaSelecionada = document.querySelector('.rota-selecionada');
          if (rotaSelecionada) {
            atualizarPainel(
              rotaSelecionada.getAttribute('data-distancia'),
              rotaSelecionada.getAttribute('data-tempo')
            );
          } else {
            console.log("📊 [PainelInfo] Nenhuma rota selecionada para exibir no painel");
          }
        }, 500); // Pequeno atraso para dar tempo de processar a rota
      });
      console.log("📊 [PainelInfo] Evento de clique adicionado ao botão Visualizar");
    } catch (e) {
      console.log("📊 [PainelInfo] Não foi possível adicionar evento de clique ao botão:", e);
    }
    
    console.log("📊 [PainelInfo] Painel criado com sucesso");
    return true;
  }
  
  // Atualizar informações no painel
  function atualizarPainel(distancia, tempo) {
    if (!distancia || !tempo) {
      return;
    }
    
    const distanciaEl = document.getElementById('info-dist');
    const tempoEl = document.getElementById('info-tempo');
    
    if (distanciaEl && tempoEl) {
      // Atualizar conteúdo
      distanciaEl.innerHTML = `
        <i class="fa fa-road" style="margin-right: 5px;"></i>
        <span>${distancia}</span>
      `;
      
      tempoEl.innerHTML = `
        <i class="fa fa-clock" style="margin-right: 5px;"></i>
        <span>${tempo}</span>
      `;
      
      // Adicionar animação
      distanciaEl.classList.add('info-atualizada');
      tempoEl.classList.add('info-atualizada');
      
      // Remover classe após animação
      setTimeout(function() {
        distanciaEl.classList.remove('info-atualizada');
        tempoEl.classList.remove('info-atualizada');
      }, 500);
      
      console.log(`📊 [PainelInfo] Painel atualizado - ${distancia}, ${tempo}`);
    }
  }
  
  // ======================================================
  // MÓDULO DO PEGMAN (STREET VIEW)
  // ======================================================
  
  // Inicializar ajustes do Pegman
  function iniciarPegman() {
    if (ESTADO.pegmanAjustado || ESTADO.tentativasPegman >= CONFIG.maxTentativas) {
      return;
    }
    
    ESTADO.tentativasPegman++;
    console.log("🚶‍♂️ [PegmanFix] Tentando ajustar o mapa");
    
    // Verificar se o mapa do Google está carregado
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      console.log("🚶‍♂️ [PegmanFix] API do Google Maps ainda não carregada");
      return;
    }
    
    // Tentar encontrar o objeto do mapa
    const mapElements = document.querySelectorAll('.gm-style');
    if (mapElements.length === 0) {
      console.log("🚶‍♂️ [PegmanFix] Elementos do mapa não encontrados");
      return;
    }
    
    console.log(`🚶‍♂️ [PegmanFix] Encontrados ${mapElements.length} elementos do mapa`);
    
    // Tentar outras abordagens baseadas no DOM
    setTimeout(ajustarControlesMapa, 1000);
    
    ESTADO.pegmanAjustado = true;
  }
  
  // Tentar ajustar os controles do mapa pelo DOM
  function ajustarControlesMapa() {
    // Verificar se o Pegman está visível
    const pegman = document.querySelector('.gm-svpc');
    if (pegman) {
      console.log("🚶‍♂️ [PegmanFix] Pegman encontrado e ajustado");
      
      // Garantir que seja visível
      pegman.style.display = 'block';
      pegman.style.visibility = 'visible';
      pegman.style.opacity = '1';
      
      // Adicionar uma borda amarela suave para destacar
      pegman.style.borderColor = CONFIG.cores.borda;
    } else {
      console.log("🚶‍♂️ [PegmanFix] Pegman não encontrado no DOM");
    }
    
    // Esconder botões de fullscreen
    const fullscreenBtn = document.querySelector('.gm-fullscreen-control');
    if (fullscreenBtn) {
      fullscreenBtn.style.display = 'none';
      console.log("🚶‍♂️ [PegmanFix] Botão de tela cheia escondido");
    }
    
    // Aplicar cor amarela do Móveis Bonafé nos botões
    const botoes = document.querySelectorAll('.gm-control-active');
    botoes.forEach(botao => {
      botao.style.backgroundColor = CONFIG.cores.principal;
      botao.style.borderColor = CONFIG.cores.borda;
    });
    
    console.log("🚶‍♂️ [PegmanFix] Ajustes nos controles do mapa aplicados");
  }
})();