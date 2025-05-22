/**
 * SOLUÇÃO APRIMORADA PARA ROTAS ALTERNATIVAS
 * 
 * Este script foi projetado especificamente para o GitHub Pages, com foco em:
 * 1. Múltiplas estratégias para encontrar as rotas alternativas
 * 2. Execução em diferentes momentos para garantir que as rotas sejam encontradas
 * 3. Melhor compatibilidade com a estrutura HTML existente
 */

(function() {
  console.log("⭐ [RotasAlternativas] Iniciando correção aprimorada");
  
  // Váriaveis para rastreamento
  let tentativas = 0;
  const MAX_TENTATIVAS = 15;
  let rotasEncontradas = false;
  let observerAtivo = false;
  
  // Executar quando o documento estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarProcesso);
  } else {
    iniciarProcesso();
  }
  
  // Backup com window.onload (carregamento mais tardio)
  window.addEventListener('load', iniciarProcesso);
  
  // Função principal que inicia o processo
  function iniciarProcesso() {
    // Tentar imediatamente
    tentarModificarRotas();
    
    // Agendar tentativas em diferentes intervalos
    const intervalos = [500, 1000, 1500, 2000, 3000, 5000];
    intervalos.forEach(intervalo => {
      setTimeout(tentarModificarRotas, intervalo);
    });
    
    // Configurar um intervalo regular para verificar
    const intervaloRegular = setInterval(function() {
      tentativas++;
      
      // Parar de tentar após o número máximo de tentativas
      if (tentativas >= MAX_TENTATIVAS || rotasEncontradas) {
        clearInterval(intervaloRegular);
        console.log(`⭐ [RotasAlternativas] Finalizando verificações regulares: ${rotasEncontradas ? 'Rotas encontradas' : 'Número máximo de tentativas atingido'}`);
      } else {
        tentarModificarRotas();
      }
    }, 2000);
    
    // Configurar observador de DOM se ainda não estiver ativo
    if (!observerAtivo) {
      configurarObservador();
      observerAtivo = true;
    }
  }
  
  // Configurar observador para mudanças na DOM
  function configurarObservador() {
    const observer = new MutationObserver(function(mutations) {
      // Se já encontramos rotas, pode parar de observar
      if (rotasEncontradas) {
        observer.disconnect();
        return;
      }
      
      // Verificar se alguma mutação adicionou rotas alternativas
      const deveTentar = mutations.some(mutation => {
        // Verificar se elementos foram adicionados
        return mutation.type === 'childList' && mutation.addedNodes.length > 0;
      });
      
      if (deveTentar) {
        tentarModificarRotas();
      }
    });
    
    // Observar mudanças em todo o corpo do documento
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("⭐ [RotasAlternativas] Observador DOM configurado");
  }
  
  // Tenta encontrar e modificar as rotas alternativas
  function tentarModificarRotas() {
    console.log(`⭐ [RotasAlternativas] Tentativa ${tentativas + 1} de encontrar rotas alternativas`);
    
    // Usar várias estratégias para encontrar as rotas alternativas
    const rotas = encontrarRotasAlternativas();
    
    if (rotas && rotas.length > 0) {
      console.log(`⭐ [RotasAlternativas] Encontradas ${rotas.length} rotas alternativas!`);
      
      // Processar cada rota
      processarRotasAlternativas(rotas);
      
      // Criar ou atualizar o painel de informações
      criarPainelDeInformacoes();
      
      // Selecionar a primeira rota automaticamente
      if (rotas.length > 0 && !document.querySelector('.rota-alternativa-selecionada')) {
        setTimeout(() => rotas[0].click(), 500);
      }
      
      // Marcar como encontrado com sucesso
      rotasEncontradas = true;
      
      return true;
    } else {
      console.log("⭐ [RotasAlternativas] Nenhuma rota alternativa encontrada ainda");
      return false;
    }
  }
  
  // Encontrar rotas alternativas usando várias estratégias
  function encontrarRotasAlternativas() {
    // Estratégia 1: Procurar pela classe específica
    let rotas = document.querySelectorAll('.route-alternative');
    
    // Estratégia 2: Procurar no container de rotas alternativas
    if (!rotas || rotas.length === 0) {
      const container = document.querySelector('.route-alternative-box, .alternatives-container');
      if (container) {
        rotas = container.querySelectorAll('.card, div.mb-2');
      }
    }
    
    // Estratégia 3: Procurar pelo título "Rotas Alternativas"
    if (!rotas || rotas.length === 0) {
      const elementos = document.querySelectorAll('*');
      
      // Encontrar cabeçalho ou título das rotas alternativas
      for (let i = 0; i < elementos.length; i++) {
        if (elementos[i].textContent && 
            elementos[i].textContent.trim() === 'Rotas Alternativas') {
          let elemento = elementos[i];
          
          // Procurar container pai
          for (let j = 0; j < 5; j++) {
            if (elemento.parentElement) {
              elemento = elemento.parentElement;
            } else {
              break;
            }
          }
          
          // Procurar rotas dentro deste container
          const possiveis = elemento.querySelectorAll('div');
          rotas = Array.from(possiveis).filter(el => {
            const texto = el.textContent || '';
            return (texto.includes('km') && texto.includes('min')) && el.children.length >= 2;
          });
          
          break;
        }
      }
    }
    
    // Estratégia 4: Procurar diretamente divs que tenham informações de distância e tempo
    if (!rotas || rotas.length === 0) {
      const todasDivs = document.querySelectorAll('div');
      const candidatos = Array.from(todasDivs).filter(div => {
        const texto = div.textContent || '';
        const temDistancia = texto.includes('km');
        const temTempo = texto.includes('min');
        const tamanhoOk = texto.length < 500; // Não muito grande
        const temSubElementos = div.children.length >= 2;
        
        return temDistancia && temTempo && tamanhoOk && temSubElementos;
      });
      
      if (candidatos.length > 0) {
        rotas = candidatos;
      }
    }
    
    return rotas;
  }
  
  // Processar rotas alternativas encontradas
  function processarRotasAlternativas(rotas) {
    // Aplicar CSS global se necessário
    aplicarCSSGlobal();
    
    // Processar cada rota
    rotas.forEach(function(rota, index) {
      // Verificar se já foi processada
      if (rota.hasAttribute('data-processado-alternativa')) {
        return;
      }
      
      console.log(`⭐ [RotasAlternativas] Processando rota #${index + 1}`);
      
      // Marcar como processada
      rota.setAttribute('data-processado-alternativa', 'true');
      
      // Extrair informações
      extrairInformacoes(rota);
      
      // Adicionar evento de clique
      rota.addEventListener('click', function() {
        // Remover seleção anterior
        document.querySelectorAll('.rota-alternativa-selecionada').forEach(r => {
          r.classList.remove('rota-alternativa-selecionada');
          r.style.backgroundColor = '';
          r.style.borderColor = '';
          r.style.boxShadow = '';
        });
        
        // Selecionar esta rota
        this.classList.add('rota-alternativa-selecionada');
        this.style.backgroundColor = '#fff9e6';
        this.style.borderColor = '#ffd966';
        this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
        
        // Atualizar informações
        atualizarInformacoesPainel(
          this.getAttribute('data-distancia'), 
          this.getAttribute('data-tempo')
        );
      });
      
      // Adicionar efeitos de hover
      rota.addEventListener('mouseenter', function() {
        if (!this.classList.contains('rota-alternativa-selecionada')) {
          this.style.backgroundColor = '#f0f8ff';
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        }
      });
      
      rota.addEventListener('mouseleave', function() {
        if (!this.classList.contains('rota-alternativa-selecionada')) {
          this.style.backgroundColor = '';
          this.style.transform = '';
          this.style.boxShadow = '';
        }
      });
    });
  }
  
  // Extrair informações de distância e tempo
  function extrairInformacoes(rota) {
    let distancia = '';
    let tempo = '';
    
    // Método 1: Procurar elementos com classes específicas
    const distanciaEl = rota.querySelector('.route-distance, [class*="distance"]');
    const tempoEl = rota.querySelector('.route-time, [class*="time"]');
    
    if (distanciaEl) {
      distancia = distanciaEl.textContent.trim();
      console.log(`⭐ [RotasAlternativas] Distância encontrada: ${distancia}`);
    }
    
    if (tempoEl) {
      tempo = tempoEl.textContent.trim();
      console.log(`⭐ [RotasAlternativas] Tempo encontrado: ${tempo}`);
    }
    
    // Método 2: Procurar em todos os elementos filhos
    if (!distancia || !tempo) {
      const elementos = rota.querySelectorAll('*');
      
      for (let i = 0; i < elementos.length; i++) {
        const texto = elementos[i].textContent.trim();
        
        if (texto.includes('km') && !distancia) {
          distancia = texto;
          console.log(`⭐ [RotasAlternativas] Distância encontrada em elemento: ${distancia}`);
          
          // Ocultar este elemento
          elementos[i].style.display = 'none';
        }
        
        if ((texto.includes('min') || texto.includes('hora')) && !tempo) {
          tempo = texto;
          console.log(`⭐ [RotasAlternativas] Tempo encontrado em elemento: ${tempo}`);
          
          // Ocultar este elemento
          elementos[i].style.display = 'none';
        }
      }
    }
    
    // Método 3: Extrair do texto completo
    if (!distancia || !tempo) {
      const texto = rota.textContent || '';
      
      const regexDistancia = /(\d+[.,]?\d*\s*km)/i;
      const regexTempo = /(\d+\s*min|\d+\s*hora[s]?)/i;
      
      const matchDistancia = texto.match(regexDistancia);
      const matchTempo = texto.match(regexTempo);
      
      if (matchDistancia && !distancia) {
        distancia = matchDistancia[0];
        console.log(`⭐ [RotasAlternativas] Distância extraída por regex: ${distancia}`);
      }
      
      if (matchTempo && !tempo) {
        tempo = matchTempo[0];
        console.log(`⭐ [RotasAlternativas] Tempo extraído por regex: ${tempo}`);
      }
    }
    
    // Salvar informações na rota
    rota.setAttribute('data-distancia', distancia || 'Distância não disponível');
    rota.setAttribute('data-tempo', tempo || 'Tempo não disponível');
  }
  
  // Criar painel de informações junto ao botão Visualizar
  function criarPainelDeInformacoes() {
    // Verificar se já existe
    if (document.getElementById('container-info-alternativas')) {
      return;
    }
    
    // Encontrar botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button');
    
    if (!botaoVisualizar) {
      console.log("⭐ [RotasAlternativas] Botão Visualizar não encontrado");
      
      // Tentar encontrar por texto
      const botoes = document.querySelectorAll('button');
      
      for (let i = 0; i < botoes.length; i++) {
        if (botoes[i].textContent && botoes[i].textContent.includes('Visualizar')) {
          botaoVisualizar = botoes[i];
          break;
        }
      }
      
      // Se ainda não encontrou, desistir
      if (!botaoVisualizar) {
        return;
      }
    }
    
    console.log("⭐ [RotasAlternativas] Criando painel de informações");
    
    // Estilizar botão
    botaoVisualizar.style.backgroundColor = '#ffc107';
    botaoVisualizar.style.color = '#212529';
    botaoVisualizar.style.fontWeight = 'bold';
    botaoVisualizar.style.padding = '8px 15px';
    botaoVisualizar.style.borderRadius = '4px';
    botaoVisualizar.style.border = 'none';
    botaoVisualizar.style.minWidth = '120px';
    
    // Criar container
    const container = document.createElement('div');
    container.id = 'container-info-alternativas';
    
    // Aplicar estilos ao container
    Object.assign(container.style, {
      display: 'flex',
      alignItems: 'center',
      margin: '15px 0',
      padding: '5px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    });
    
    // Mover botão para o container
    const parent = botaoVisualizar.parentNode;
    parent.removeChild(botaoVisualizar);
    container.appendChild(botaoVisualizar);
    
    // Criar painel de informações
    const painel = document.createElement('div');
    painel.id = 'painel-info-alternativas';
    
    // Aplicar estilos ao painel
    Object.assign(painel.style, {
      marginLeft: '15px',
      padding: '8px 12px',
      backgroundColor: 'white',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      fontSize: '14px',
      color: '#555'
    });
    
    // Adicionar conteúdo inicial
    painel.innerHTML = `
      <div id="info-distancia-alternativas" style="margin-bottom: 6px; display: flex; align-items: center;">
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo-alternativas" style="display: flex; align-items: center;">
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar painel ao container
    container.appendChild(painel);
    
    // Adicionar container ao DOM
    parent.appendChild(container);
    
    // Garantir que o Font Awesome está disponível
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
      const rotaSelecionada = document.querySelector('.rota-alternativa-selecionada');
      if (rotaSelecionada) {
        atualizarInformacoesPainel(
          rotaSelecionada.getAttribute('data-distancia'),
          rotaSelecionada.getAttribute('data-tempo')
        );
      }
    };
  }
  
  // Atualizar informações no painel
  function atualizarInformacoesPainel(distancia, tempo) {
    if (!distancia || !tempo) return;
    
    const distanciaEl = document.getElementById('info-distancia-alternativas');
    const tempoEl = document.getElementById('info-tempo-alternativas');
    
    if (distanciaEl && tempoEl) {
      // Atualizar conteúdo
      distanciaEl.innerHTML = `
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${distancia}</span>
      `;
      
      tempoEl.innerHTML = `
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${tempo}</span>
      `;
      
      // Adicionar classe para animação
      distanciaEl.classList.add('info-atualizada');
      tempoEl.classList.add('info-atualizada');
      
      // Remover classe após animação
      setTimeout(function() {
        distanciaEl.classList.remove('info-atualizada');
        tempoEl.classList.remove('info-atualizada');
      }, 500);
    }
  }
  
  // Aplicar CSS global
  function aplicarCSSGlobal() {
    // Verificar se já existe
    if (document.getElementById('css-rotas-alternativas')) {
      return;
    }
    
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.id = 'css-rotas-alternativas';
    
    // Definir regras CSS
    style.textContent = `
      /* Ocultar informações de tempo e distância nas rotas alternativas */
      .route-alternative .route-distance,
      .route-alternative .route-time,
      div.card.mb-2 .route-distance,
      div.card.mb-2 .route-time,
      div[class*="distance"],
      div[class*="time"],
      span[class*="distance"],
      span[class*="time"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        pointer-events: none !important;
      }
      
      /* Estilizar rotas alternativas */
      .route-alternative,
      .card.mb-2 {
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        border-radius: 6px !important;
        padding: 10px !important;
        margin-bottom: 8px !important;
      }
      
      /* Centralizar títulos */
      .route-alternative h5,
      .card.mb-2 .card-title {
        text-align: center !important;
        margin: 0 !important;
        padding: 5px 0 !important;
      }
      
      /* Rota selecionada */
      .rota-alternativa-selecionada {
        background-color: #fff9e6 !important;
        border-color: #ffd966 !important;
        box-shadow: 0 0 0 2px rgba(255,217,102,0.5) !important;
      }
      
      /* Animação para atualização de informações */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-3px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .info-atualizada {
        animation: fadeIn 0.3s ease-out forwards;
      }
    `;
    
    // Adicionar ao DOM
    document.head.appendChild(style);
    console.log("⭐ [RotasAlternativas] CSS global aplicado");
  }
})();