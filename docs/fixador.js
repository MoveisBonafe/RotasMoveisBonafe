/**
 * Fixador Automático para Tempos de Viagem - Móveis Bonafé
 * 
 * Este script é uma versão extremamente simplificada projetada
 * para funcionar no GitHub Pages sem dependências externas.
 * 
 * Ele força o cálculo de tempo baseado na velocidade média de 90 km/h.
 */

// Auto-executável quando carregado
(function() {
  // Flag para debugging
  const DEBUG = true;
  
  // Log personalizado
  function log(msg) {
    if (DEBUG) console.log("[AutoFixador] " + msg);
  }
  
  log("Inicializando fixador automático");
  
  // Velocidade média em km/h
  const VELOCIDADE = 90;
  
  // Dados das rotas
  let rotaNormal = null;
  
  // Função principal
  function fixarTemposRota() {
    try {
      log("Verificando informações da rota");
      
      // Encontrar container de informações
      const infoElement = document.getElementById('route-info');
      if (!infoElement) {
        log("Informações da rota não encontradas");
        return false;
      }
      
      // Extrair distância atual
      const conteudo = infoElement.innerHTML;
      const matchDistancia = conteudo.match(/Distância total:<\/strong>\s*(\d+[.,]\d+)\s*km/i);
      
      if (!matchDistancia) {
        log("Não foi possível extrair a distância");
        return false;
      }
      
      // Extrair tipo de rota
      const isRotaOtimizada = conteudo.includes('Rota Otimizada');
      const tipoRota = isRotaOtimizada ? 'otimizada' : 'normal';
      
      // Obter distância e calcular tempo
      const distanciaKm = parseFloat(matchDistancia[1].replace(',', '.'));
      const tempoHoras = distanciaKm / VELOCIDADE;
      const horasInt = Math.floor(tempoHoras);
      const minutosInt = Math.round((tempoHoras - horasInt) * 60);
      
      log(`Rota ${tipoRota}: ${distanciaKm} km = ${horasInt}h ${minutosInt}min a ${VELOCIDADE} km/h`);
      
      // Armazenar dados da rota normal para comparações
      if (tipoRota === 'normal') {
        rotaNormal = {
          distancia: distanciaKm,
          tempo: tempoHoras
        };
        log("Dados da rota normal armazenados");
      }
      
      // Substituir o tempo no HTML
      let novoConteudo = conteudo.replace(
        /Tempo estimado:<\/strong>\s*(\d+)h\s*(\d+)min/i,
        `Tempo estimado:</strong> ${horasInt}h ${minutosInt}min`
      );
      
      // Adicionar comparação para rotas otimizadas
      if (tipoRota === 'otimizada' && rotaNormal) {
        const difDistancia = rotaNormal.distancia - distanciaKm;
        const difTempo = rotaNormal.tempo - tempoHoras;
        
        // Se já existir uma comparação, remover
        if (novoConteudo.includes('route-comparison')) {
          novoConteudo = novoConteudo.replace(/<div class="route-comparison">(.*?)<\/div>/s, '');
        }
        
        // Calcular percentuais
        const percentDistancia = (difDistancia / rotaNormal.distancia * 100).toFixed(1);
        const percentTempo = (difTempo / rotaNormal.tempo * 100).toFixed(1);
        
        // Determinar cores e textos
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
        
        // Adicionar comparação
        novoConteudo += `
          <div class="route-comparison" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
            <p><strong>Comparação com rota não otimizada:</strong></p>
            <p>Distância: <span style="color: ${corDistancia}">
              ${textoDistancia} de ${Math.abs(difDistancia).toFixed(1)} km (${Math.abs(percentDistancia)}%)
            </span></p>
            <p>Tempo: <span style="color: ${corTempo}">
              ${textoTempo} de ${tempoFormatado} (${Math.abs(percentTempo)}%)
            </span></p>
            <p style="font-style: italic; font-size: 12px; margin-top: 8px;">
              Cálculos baseados em velocidade média de ${VELOCIDADE} km/h.
            </p>
          </div>
        `;
        
        log("Comparação adicionada");
      }
      
      // Atualizar o conteúdo
      if (novoConteudo !== conteudo) {
        infoElement.innerHTML = novoConteudo;
        log("Conteúdo atualizado com sucesso");
        return true;
      } else {
        log("Nenhuma atualização necessária");
        return false;
      }
    } catch (erro) {
      log("Erro ao fixar tempos: " + erro.message);
      return false;
    }
  }
  
  // Interceptar cliques em botões
  function interceptarBotoes() {
    log("Interceptando botões");
    
    try {
      // Botão Visualizar
      const botaoVisualizar = document.getElementById('visualize-button');
      if (botaoVisualizar) {
        const clickOriginal = botaoVisualizar.onclick;
        botaoVisualizar.onclick = function(event) {
          // Executar função original
          if (clickOriginal) clickOriginal.call(this, event);
          
          // Executar nossa correção após um tempo
          setTimeout(fixarTemposRota, 1000);
          setTimeout(fixarTemposRota, 2000);
        };
        log("Botão Visualizar interceptado");
      }
      
      // Botão Otimizar
      const botaoOtimizar = document.getElementById('optimize-button');
      if (botaoOtimizar) {
        const clickOriginal = botaoOtimizar.onclick;
        botaoOtimizar.onclick = function(event) {
          // Executar função original
          if (clickOriginal) clickOriginal.call(this, event);
          
          // Executar nossa correção após um tempo
          setTimeout(fixarTemposRota, 1000);
          setTimeout(fixarTemposRota, 2000);
        };
        log("Botão Otimizar interceptado");
      }
    } catch (erro) {
      log("Erro ao interceptar botões: " + erro.message);
    }
  }
  
  // Configurar observer para mudanças no DOM
  function configurarObserver() {
    log("Configurando observer");
    
    try {
      const container = document.getElementById('bottom-info');
      if (!container) {
        log("Container de informações não encontrado");
        return;
      }
      
      // Criar observer
      const observer = new MutationObserver(function(mutations) {
        let deveAtualizar = false;
        
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' || mutation.type === 'subtree') {
            deveAtualizar = true;
          }
        });
        
        if (deveAtualizar) {
          setTimeout(fixarTemposRota, 300);
        }
      });
      
      // Iniciar observação
      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      log("Observer configurado com sucesso");
    } catch (erro) {
      log("Erro ao configurar observer: " + erro.message);
    }
  }
  
  // Inicializar sistema
  function inicializar() {
    log("Inicializando sistema");
    
    // Interceptar botões
    interceptarBotoes();
    
    // Configurar observer
    configurarObserver();
    
    // Corrigir valores atuais (se existirem)
    fixarTemposRota();
    
    // Verificar periodicamente
    setInterval(fixarTemposRota, 2000);
    
    log("Sistema inicializado com sucesso");
  }
  
  // Executar quando o DOM estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
  
  // Executar também após um tempo para garantir
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 3000);
})();