/**
 * SOLUÇÃO SIMPLES E EFICIENTE
 * Exibe tempo e distância no mapa e remove da sidebar
 */
(function() {
  // Configurações
  const CONFIG = {
    intervalo: 300, // ms entre verificações
    tentativas: 10,
    ocultarNaSidebar: true,
    estiloPainel: {
      posicao: 'top', // top, bottom
      corBorda: '#e6c259',
      corFundo: 'white',
      corTexto: '#333',
      corIcone: '#ffd966'
    }
  };
  
  // Variáveis globais
  let contadorTentativas = 0;
  let painelCriado = false;
  let infoAtual = {
    distancia: '---',
    tempo: '---'
  };

  // Inicializar quando a página carregar
  document.addEventListener('DOMContentLoaded', iniciar);
  window.addEventListener('load', iniciar);
  setTimeout(iniciar, 500);
  
  // Função principal
  function iniciar() {
    // Criar o painel de informações
    criarPainelInfo();
    
    // Ocultar informações na sidebar se configurado
    if (CONFIG.ocultarNaSidebar) {
      ocultarInfoNaSidebar();
    }
    
    // Monitorar eventos relevantes
    monitorarEventos();
  }
  
  // Criar o painel de informações
  function criarPainelInfo() {
    if (painelCriado) return;
    
    try {
      // Encontrar o container do mapa
      const mapa = document.querySelector('#map') || 
                   document.querySelector('.gm-style') ||
                   document.querySelector('[style*="position: relative"]');
      
      if (!mapa) {
        if (contadorTentativas < CONFIG.tentativas) {
          contadorTentativas++;
          setTimeout(criarPainelInfo, CONFIG.intervalo);
        }
        return;
      }
      
      // Garantir que o mapa tem position relative
      if (window.getComputedStyle(mapa).position === 'static') {
        mapa.style.position = 'relative';
      }
      
      // Criar o painel
      const painel = document.createElement('div');
      painel.id = 'info-rota-painel';
      painel.style.cssText = `
        position: absolute;
        ${CONFIG.estiloPainel.posicao === 'top' ? 'top: 10px;' : 'bottom: 10px;'}
        left: 50%;
        transform: translateX(-50%);
        background-color: ${CONFIG.estiloPainel.corFundo};
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border-radius: 4px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        z-index: 1000;
        font-size: 13px;
        border: 1px solid ${CONFIG.estiloPainel.corBorda};
      `;
      
      // Adicionar conteúdo
      painel.innerHTML = `
        <div style="display: flex; align-items: center; margin-right: 16px;">
          <span style="margin-right: 6px; color: ${CONFIG.estiloPainel.corIcone};">📏</span>
          <span id="rota-distancia">${infoAtual.distancia}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 6px; color: ${CONFIG.estiloPainel.corIcone};">⏱️</span>
          <span id="rota-tempo">${infoAtual.tempo}</span>
        </div>
      `;
      
      // Adicionar ao mapa
      mapa.appendChild(painel);
      painelCriado = true;
      
      console.log("[SolucaoSimples] Painel criado com sucesso");
    } catch (erro) {
      console.error("[SolucaoSimples] Erro ao criar painel:", erro);
      
      if (contadorTentativas < CONFIG.tentativas) {
        contadorTentativas++;
        setTimeout(criarPainelInfo, CONFIG.intervalo);
      }
    }
  }
  
  // Ocultar informações de tempo e distância na sidebar
  function ocultarInfoNaSidebar() {
    // Adicionar estilos CSS para ocultar
    const estilo = document.createElement('style');
    estilo.textContent = `
      /* Ocultar elementos com distância e tempo na sidebar */
      .sidebar span:not(#info-rota-painel *):empty,
      .sidebar div:not(#info-rota-painel *):empty {
        display: none !important;
      }
      
      .rotas-alternativas span,
      .rotas-alternativas div,
      .rota-alternativa span,
      .rota-alternativa div,
      .rota-otimizada span,
      .rota-otimizada div {
        position: relative;
      }
    `;
    
    document.head.appendChild(estilo);
    
    // Aplicar ocultação diretamente nos elementos existentes
    try {
      const elementos = document.querySelectorAll('.sidebar span, .sidebar div');
      elementos.forEach(el => {
        if (el.closest('#info-rota-painel')) return;
        
        const texto = el.textContent.trim();
        if (texto.includes('km') || texto.includes('min') || texto.match(/^\d+[.,]\d+$/)) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.height = '0';
          el.style.opacity = '0';
          el.textContent = '';
        }
      });
    } catch (erro) {
      console.error("[SolucaoSimples] Erro ao ocultar elementos:", erro);
    }
    
    // Verificar novamente após um tempo
    setTimeout(ocultarInfoNaSidebar, 2000);
  }
  
  // Monitorar eventos relevantes
  function monitorarEventos() {
    // 1. Monitorar clique no botão Visualizar
    try {
      const botoes = document.querySelectorAll('button, div[class*="btn"], span[class*="btn"]');
      botoes.forEach(botao => {
        if (botao.textContent.includes('Visualizar')) {
          botao.addEventListener('click', () => {
            console.log("[SolucaoSimples] Botão Visualizar clicado");
            setTimeout(extrairInformacoes, 1500);
          });
        }
      });
    } catch (erro) {
      console.error("[SolucaoSimples] Erro ao monitorar botão:", erro);
    }
    
    // 2. Monitorar clique nas abas
    try {
      const abas = document.querySelectorAll('button, div[class*="tab"]');
      abas.forEach(aba => {
        if (aba.textContent.includes('Relatório')) {
          aba.addEventListener('click', () => {
            console.log("[SolucaoSimples] Aba Relatório clicada");
            setTimeout(extrairInformacoes, 800);
          });
        }
      });
    } catch (erro) {
      console.error("[SolucaoSimples] Erro ao monitorar abas:", erro);
    }
    
    // 3. Monitorar cliques gerais como fallback
    document.addEventListener('click', function(event) {
      // Limitar frequência de verificações para não sobrecarregar
      if (Math.random() < 0.2) { // 20% de chance apenas
        setTimeout(extrairInformacoes, 1500);
      }
    });
  }
  
  // Extrair informações de tempo e distância
  function extrairInformacoes() {
    try {
      // 1. Tentar obter do Relatório da Rota
      const infoExtraida = buscarInfoRelatorio();
      
      // 2. Atualizar o painel se encontrou informações
      if (infoExtraida.distancia !== '---' || infoExtraida.tempo !== '---') {
        atualizarPainel(infoExtraida);
      }
      
      // 3. Ocultar informações na sidebar novamente
      if (CONFIG.ocultarNaSidebar) {
        ocultarInfoNaSidebar();
      }
    } catch (erro) {
      console.error("[SolucaoSimples] Erro ao extrair informações:", erro);
    }
  }
  
  // Buscar informações no relatório
  function buscarInfoRelatorio() {
    let distancia = '---';
    let tempo = '---';
    
    try {
      // Procurar pela aba de relatório
      const abaRelatorio = document.querySelector('div:contains("Relatório da Rota"), button:contains("Relatório")');
      if (abaRelatorio && typeof abaRelatorio.click === 'function') {
        abaRelatorio.click();
      }
      
      // Buscar texto com distância total
      document.querySelectorAll('div, span, p').forEach(el => {
        const texto = el.textContent.trim();
        
        // Procurar distância
        if (texto.includes('Distância total:')) {
          const match = texto.match(/Distância total:\s*(\d+[.,]?\d*\s*km)/i);
          if (match && match[1]) {
            distancia = match[1];
          }
        }
        
        // Procurar tempo
        if (texto.includes('Tempo estimado:')) {
          const match = texto.match(/Tempo estimado:\s*(\d+h\s+\d+min|\d+\s*min)/i);
          if (match && match[1]) {
            tempo = match[1];
          }
        }
      });
      
      // Se não encontrou, procurar valores específicos
      if (distancia === '---') {
        document.querySelectorAll('div, span').forEach(el => {
          const texto = el.textContent.trim();
          if (texto.match(/^\d+[.,]\d+\s*km$/)) {
            distancia = texto;
          }
        });
      }
      
      if (tempo === '---') {
        document.querySelectorAll('div, span').forEach(el => {
          const texto = el.textContent.trim();
          if (texto.match(/^\d+h\s+\d+min$/) || texto.match(/^\d+\s*min$/)) {
            tempo = texto;
          }
        });
      }
    } catch (erro) {
      console.error("[SolucaoSimples] Erro ao buscar informações:", erro);
    }
    
    return { distancia, tempo };
  }
  
  // Atualizar o painel com as informações
  function atualizarPainel(info) {
    try {
      // Atualizar as informações globais
      if (info.distancia !== '---') infoAtual.distancia = info.distancia;
      if (info.tempo !== '---') infoAtual.tempo = info.tempo;
      
      // Atualizar o painel
      const distanciaEl = document.getElementById('rota-distancia');
      const tempoEl = document.getElementById('rota-tempo');
      
      if (distanciaEl) distanciaEl.textContent = infoAtual.distancia;
      if (tempoEl) tempoEl.textContent = infoAtual.tempo;
      
      console.log("[SolucaoSimples] Painel atualizado:", infoAtual);
    } catch (erro) {
      console.error("[SolucaoSimples] Erro ao atualizar painel:", erro);
    }
  }
})();