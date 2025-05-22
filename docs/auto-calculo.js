/**
 * Auto-Cálculo Móveis Bonafé
 * 
 * Este script garante cálculos de tempo precisos baseados nas distâncias,
 * substituindo automaticamente os valores calculados pelo Google Maps
 * para apresentar um tempo de viagem mais realista.
 */
(function() {
  console.log("[AutoCalculo] Inicializando (Versão 1.3)");
  
  // Velocidade média em km/h para cálculos
  const VELOCIDADE_MEDIA = 90;
  
  // Variáveis de estado
  let ultimaDistancia = 0;
  let rotas = {
    normal: null,
    otimizada: null
  };
  
  // Monitorar a página após o carregamento
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 2000);
  setTimeout(iniciar, 5000);
  
  function iniciar() {
    console.log("[AutoCalculo] Verificando elementos da página");
    
    // Interceptar botões
    interceptarBotoes();
    
    // Configurar observador para mudanças nas informações de rota
    configurarObservador();
    
    // Tentar corrigir os valores atuais (se existirem)
    corrigirValoresAtuais();
    
    console.log("[AutoCalculo] Inicialização concluída");
  }
  
  // Interceptar cliques nos botões
  function interceptarBotoes() {
    const botaoVisualizar = document.getElementById('visualize-button');
    const botaoOtimizar = document.getElementById('optimize-button');
    
    if (botaoVisualizar) {
      console.log("[AutoCalculo] Botão Visualizar encontrado");
      interceptarBotao(botaoVisualizar, 'normal');
    }
    
    if (botaoOtimizar) {
      console.log("[AutoCalculo] Botão Otimizar encontrado");
      interceptarBotao(botaoOtimizar, 'otimizada');
    }
  }
  
  // Interceptar um botão específico
  function interceptarBotao(botao, tipo) {
    const clickOriginal = botao.onclick;
    
    botao.onclick = function(event) {
      console.log(`[AutoCalculo] Clique no botão ${tipo} detectado`);
      
      // Executar comportamento original
      if (clickOriginal) {
        clickOriginal.call(this, event);
      }
      
      // Aguardar e corrigir valores
      setTimeout(() => corrigirValores(tipo), 1000);
      setTimeout(() => corrigirValores(tipo), 2000);
      setTimeout(() => corrigirValores(tipo), 3000);
    };
  }
  
  // Configurar observador para mudanças nas informações
  function configurarObservador() {
    const container = document.getElementById('bottom-info');
    if (!container) {
      console.log("[AutoCalculo] Container de informações não encontrado");
      return;
    }
    
    console.log("[AutoCalculo] Configurando observador para mudanças");
    
    // Criar observer
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData' || mutation.type === 'subtree') {
          // Verificar o conteúdo atual
          const infoRota = document.getElementById('route-info');
          if (infoRota) {
            // Determinar tipo de rota
            const tipo = infoRota.innerHTML.includes('Rota Otimizada') ? 'otimizada' : 'normal';
            
            // Corrigir valores
            setTimeout(() => corrigirValores(tipo), 300);
          }
        }
      }
    });
    
    // Configurar e iniciar observador
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  // Corrigir valores atuais (se já existirem)
  function corrigirValoresAtuais() {
    const infoRota = document.getElementById('route-info');
    if (!infoRota) {
      console.log("[AutoCalculo] Nenhuma informação de rota encontrada");
      return;
    }
    
    // Determinar tipo de rota
    const tipo = infoRota.innerHTML.includes('Rota Otimizada') ? 'otimizada' : 'normal';
    
    // Corrigir valores
    corrigirValores(tipo);
  }
  
  // Corrigir valores de tempo baseados na distância
  function corrigirValores(tipo) {
    const infoRota = document.getElementById('route-info');
    if (!infoRota) {
      console.log("[AutoCalculo] Elemento de informações não encontrado");
      return;
    }
    
    console.log(`[AutoCalculo] Corrigindo valores para rota ${tipo}`);
    
    // Extrair distância atual
    const matchDistancia = infoRota.innerHTML.match(/Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i);
    if (!matchDistancia) {
      console.log("[AutoCalculo] Não foi possível extrair a distância");
      return;
    }
    
    // Converter para número
    const distanciaKm = parseFloat(matchDistancia[1].replace(',', '.'));
    ultimaDistancia = distanciaKm;
    
    // Calcular tempo com velocidade média
    const tempoHoras = distanciaKm / VELOCIDADE_MEDIA;
    const horasInt = Math.floor(tempoHoras);
    const minutosInt = Math.round((tempoHoras - horasInt) * 60);
    
    console.log(`[AutoCalculo] Distância: ${distanciaKm} km, Tempo calculado: ${horasInt}h ${minutosInt}min`);
    
    // Armazenar valores para esta rota
    rotas[tipo] = {
      distancia: distanciaKm,
      tempo: tempoHoras
    };
    
    // Substituir o tempo no HTML
    let novoHTML = infoRota.innerHTML.replace(
      /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
      `Tempo estimado:</strong> ${horasInt}h ${minutosInt}min`
    );
    
    // Verificar se precisamos adicionar comparação
    if (tipo === 'otimizada' && rotas.normal) {
      novoHTML = adicionarComparacao(novoHTML, rotas.normal.distancia, distanciaKm, 
                                     rotas.normal.tempo, tempoHoras);
    }
    
    // Atualizar o HTML
    if (novoHTML !== infoRota.innerHTML) {
      infoRota.innerHTML = novoHTML;
      console.log("[AutoCalculo] Valores atualizados com sucesso");
    }
  }
  
  // Adicionar comparação entre rotas
  function adicionarComparacao(html, distanciaNormal, distanciaOtimizada, 
                               tempoNormal, tempoOtimizado) {
    // Calcular diferenças
    const difDistancia = distanciaNormal - distanciaOtimizada;
    const difTempo = tempoNormal - tempoOtimizado;
    
    // Calcular percentuais
    const percentDistancia = (difDistancia / distanciaNormal * 100).toFixed(1);
    const percentTempo = (difTempo / tempoNormal * 100).toFixed(1);
    
    // Determinar cores baseadas em economia/aumento
    const corDistancia = difDistancia > 0 ? '#4CAF50' : '#F44336';
    const corTempo = difTempo > 0 ? '#4CAF50' : '#F44336';
    const textoDistancia = difDistancia > 0 ? 'Economia' : 'Aumento';
    const textoTempo = difTempo > 0 ? 'Economia' : 'Aumento';
    
    // Formatar tempo
    const horasDif = Math.floor(Math.abs(difTempo));
    const minutosDif = Math.round((Math.abs(difTempo) - horasDif) * 60);
    const tempoFormatado = horasDif > 0 ? 
                          `${horasDif}h ${minutosDif}min` : 
                          `${minutosDif} minutos`;
    
    // Verificar se já tem comparação
    if (html.includes('route-comparison')) {
      // Substituir comparação existente
      return html.replace(
        /<div class="route-comparison">(.*?)<\/div>/s,
        `<div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
          <p><strong>Comparação com rota não otimizada:</strong></p>
          <p>Distância: <span style="color: ${corDistancia}">
            ${textoDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDistancia)}%)
          </span></p>
          <p>Tempo: <span style="color: ${corTempo}">
            ${textoTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
          </span></p>
          <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
            Cálculos baseados em velocidade média de ${VELOCIDADE_MEDIA} km/h.
          </p>
        </div>`
      );
    } else {
      // Adicionar nova comparação
      return html + `
        <div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
          <p><strong>Comparação com rota não otimizada:</strong></p>
          <p>Distância: <span style="color: ${corDistancia}">
            ${textoDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDistancia)}%)
          </span></p>
          <p>Tempo: <span style="color: ${corTempo}">
            ${textoTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
          </span></p>
          <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
            Cálculos baseados em velocidade média de ${VELOCIDADE_MEDIA} km/h.
          </p>
        </div>
      `;
    }
  }
})();