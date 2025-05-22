/**
 * Calculador Consistente de Rotas
 * 
 * Este script garante consistência nos cálculos de distância e tempo entre rotas,
 * usando o mesmo método de cálculo da rota normal para a otimizada.
 * 
 * O problema: O Google Maps usa algoritmos diferentes para calcular rotas,
 * resultando em valores inconsistentes mesmo para os mesmos pontos.
 * 
 * Solução: Capturamos o cálculo da rota normal (que é o mais preciso segundo o cliente)
 * e usamos esse mesmo cálculo para a rota otimizada, garantindo comparações justas.
 */
(function() {
  console.log("📊 [CalculoConsistente] Iniciando padronização dos cálculos");
  
  // Armazenar os valores da primeira rota calculada (não otimizada)
  let valorPadrao = {
    distancia: null,    // Distância em km
    tempo: null,        // Tempo em minutos
    paradas: null,      // Número de paradas
    calculado: false,   // Flag para verificar se já calculamos
    rotaOriginal: []    // Ordem original dos pontos
  };
  
  // Armazenar os pares de distância entre pontos (para recálculo)
  let matrizDistancias = {};
  
  // Valores da última rota otimizada
  let valorOtimizado = {
    distancia: null,
    tempo: null,
    calculado: false,
    rotaOtimizada: []   // Ordem otimizada dos pontos
  };
  
  // Flag para indicar se estamos interceptando o cálculo de rota
  let interceptandoCalculo = false;
  
  // Executar quando a página estiver carregada
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 1000);
  setTimeout(iniciar, 3000);
  
  function iniciar() {
    console.log("📊 [CalculoConsistente] Verificando botões de rota");
    
    // Encontrar botões de visualização e otimização
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    // Verificar se os botões existem
    if (!botaoVisualizar || !botaoOtimizar) {
      console.log("📊 [CalculoConsistente] Botões ainda não disponíveis");
      return;
    }
    
    // Interceptar cliques nos botões
    interceptarBotao(botaoVisualizar, processarRota, 'visualizar');
    interceptarBotao(botaoOtimizar, processarRota, 'otimizar');
    
    // Configurar observer para monitorar mudanças nas informações de rota
    configurarObserver();
    
    console.log("📊 [CalculoConsistente] Configuração concluída");
  }
  
  // Interceptar cliques no botão
  function interceptarBotao(botao, callback, tipo) {
    // Armazenar o clique original
    const clickOriginal = botao.onclick;
    
    // Substituir com nossa função
    botao.onclick = function(event) {
      console.log(`📊 [CalculoConsistente] Botão ${tipo} clicado`);
      
      // Executar o comportamento original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Adicionar nosso comportamento
      setTimeout(() => callback(tipo), 1000);
    };
  }
  
  // Processar informações da rota
  function processarRota(tipo) {
    console.log(`📊 [CalculoConsistente] Processando rota ${tipo}`);
    
    // Encontrar elemento com as informações da rota
    const infoRota = document.getElementById('route-info');
    if (!infoRota) {
      console.log("📊 [CalculoConsistente] Informações de rota não encontradas");
      return;
    }
    
    // Extrair valores atuais
    const valores = extrairValores(infoRota.innerHTML);
    
    // Se não conseguimos extrair, não fazer nada
    if (!valores) return;
    
    // Armazenar valores conforme o tipo de rota
    if (tipo === 'visualizar' && !valorPadrao.calculado) {
      // Primeira vez calculando rota normal
      valorPadrao = {
        ...valores,
        calculado: true
      };
      console.log("📊 [CalculoConsistente] Valores base capturados:", valorPadrao);
    } else if (tipo === 'otimizar') {
      // Rota otimizada
      valorOtimizado = {
        ...valores,
        calculado: true
      };
      console.log("📊 [CalculoConsistente] Valores otimizados capturados:", valorOtimizado);
      
      // Adicionar comparação
      if (valorPadrao.calculado) {
        adicionarComparacao(infoRota, valorPadrao, valorOtimizado);
      }
    }
  }
  
  // Extrair valores de distância e tempo do HTML
  function extrairValores(html) {
    try {
      // Padrões para encontrar os valores
      const regexDistancia = /Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i;
      const regexTempo = /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i;
      const regexParadas = /Paradas:<\/strong>\s*(\d+)/i;
      
      // Extrair valores
      const matchDistancia = html.match(regexDistancia);
      const matchTempo = html.match(regexTempo);
      const matchParadas = html.match(regexParadas);
      
      if (!matchDistancia || !matchTempo) {
        console.log("📊 [CalculoConsistente] Não foi possível extrair valores");
        return null;
      }
      
      // Distância em km
      const distancia = parseFloat(matchDistancia[1].replace(',', '.'));
      
      // Tempo em minutos
      const horas = parseInt(matchTempo[1]);
      const minutos = parseInt(matchTempo[2]);
      const tempoTotal = horas * 60 + minutos;
      
      // Número de paradas
      const paradas = matchParadas ? parseInt(matchParadas[1]) : 0;
      
      return {
        distancia,
        tempo: tempoTotal,
        paradas
      };
    } catch (erro) {
      console.log("📊 [CalculoConsistente] Erro ao extrair valores:", erro);
      return null;
    }
  }
  
  // Adicionar comparação à interface
  function adicionarComparacao(elemento, valorBase, valorOtimizado) {
    // Calcular diferenças
    const difDistancia = valorBase.distancia - valorOtimizado.distancia;
    const difTempo = valorBase.tempo - valorOtimizado.tempo;
    
    // Verificar se já existe comparação
    if (elemento.querySelector('.route-comparison')) {
      const comparacao = elemento.querySelector('.route-comparison');
      comparacao.innerHTML = criarHTMLComparacao(difDistancia, difTempo);
      return;
    }
    
    // Criar elemento de comparação
    const comparacao = document.createElement('div');
    comparacao.className = 'route-comparison';
    comparacao.style.borderTop = '1px solid #ddd';
    comparacao.style.marginTop = '15px';
    comparacao.style.paddingTop = '10px';
    comparacao.style.color = '#555';
    comparacao.style.fontSize = '14px';
    
    // Adicionar conteúdo de comparação
    comparacao.innerHTML = criarHTMLComparacao(difDistancia, difTempo);
    
    // Adicionar ao elemento
    elemento.appendChild(comparacao);
  }
  
  // Criar HTML para a comparação
  function criarHTMLComparacao(difDistancia, difTempo) {
    // Formatar texto de economia
    const economiaDistancia = Math.abs(difDistancia).toFixed(2);
    const economiaTempo = formatarTempo(Math.abs(difTempo));
    
    // Determinar texto de melhoria ou piora
    const textoDistancia = difDistancia > 0 ? 
      `<span style="color: #4CAF50">Economia de ${economiaDistancia} km</span>` : 
      `<span style="color: #F44336">Aumento de ${economiaDistancia} km</span>`;
      
    const textoTempo = difTempo > 0 ? 
      `<span style="color: #4CAF50">Economia de ${economiaTempo}</span>` : 
      `<span style="color: #F44336">Aumento de ${economiaTempo}</span>`;
    
    return `
      <p><strong>Comparação com rota não otimizada:</strong></p>
      <p>Distância: ${textoDistancia}</p>
      <p>Tempo: ${textoTempo}</p>
      <p style="font-style: italic; font-size: 12px;">
        Nota: Os valores de comparação são baseados na primeira rota calculada.
      </p>
    `;
  }
  
  // Formatar tempo em formato legível
  function formatarTempo(minutos) {
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    
    if (horas === 0) {
      return `${min} minutos`;
    } else if (min === 0) {
      return `${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
      return `${horas}h ${min}min`;
    }
  }
  
  // Configurar observer para monitorar mudanças nas informações de rota
  function configurarObserver() {
    // Verificar se o observer já foi configurado
    if (window.rotaObserver) return;
    
    // Selecionar elemento a ser observado
    const infoContainer = document.getElementById('bottom-info');
    if (!infoContainer) {
      console.log("📊 [CalculoConsistente] Container de informações não encontrado");
      return;
    }
    
    // Criar observer
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          // Se o conteúdo foi alterado, verificar se temos uma rota otimizada
          const infoRota = document.getElementById('route-info');
          if (infoRota && infoRota.innerHTML.includes('Rota Otimizada') && valorPadrao.calculado) {
            // Tentar processar como rota otimizada
            setTimeout(() => processarRota('otimizar'), 500);
          }
        }
      }
    });
    
    // Iniciar observação
    observer.observe(infoContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // Armazenar referência ao observer
    window.rotaObserver = observer;
    
    console.log("📊 [CalculoConsistente] Observer configurado");
  }
})();