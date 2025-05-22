/**
 * MODIFICAÇÃO DIRETA NA PÁGINA - GARANTIDA
 * 
 * Este script modifica diretamente o DOM para garantir que funcione.
 * Utiliza técnicas mais agressivas para garantir que as mudanças apareçam.
 */
(function() {
  console.log("🛠️ [DiretoNaPagina] Iniciando modificações diretas garantidas");
  
  // Verificar periodicamente e aplicar modificações
  const interval = setInterval(aplicarModificacoes, 500);
  
  // Após 1 minuto, parar de verificar para economizar recursos
  setTimeout(() => clearInterval(interval), 60000);
  
  // Executar verificação inicial
  setTimeout(aplicarModificacoes, 500);
  setTimeout(aplicarModificacoes, 1500);
  setTimeout(aplicarModificacoes, 3000);
  
  // Função principal que aplica todas as modificações
  function aplicarModificacoes() {
    console.log("🛠️ [DiretoNaPagina] Verificando e aplicando modificações");
    
    // 1. Esconder informações de distância e tempo nas alternativas
    const rotas = document.querySelectorAll('.route-alternative');
    let encontrouRotas = false;
    
    rotas.forEach(rota => {
      encontrouRotas = true;
      
      // Esconder elementos de distância e tempo
      const distancias = rota.querySelectorAll('.route-distance');
      const tempos = rota.querySelectorAll('.route-time');
      
      // Aplicar estilo diretamente
      distancias.forEach(d => {
        d.style.cssText = "display: none !important;";
        // Capturar o texto antes de esconder
        const textoDistancia = d.textContent.trim();
        rota.setAttribute('data-route-distance', textoDistancia);
      });
      
      tempos.forEach(t => {
        t.style.cssText = "display: none !important;";
        // Capturar o texto antes de esconder
        const textoTempo = t.textContent.trim();
        rota.setAttribute('data-route-time', textoTempo);
      });
      
      // Destacar título
      const titulos = rota.querySelectorAll('h5');
      titulos.forEach(t => {
        t.style.textAlign = 'center';
        t.style.margin = '0';
        t.style.padding = '5px 0';
      });
      
      // Melhorar aparência e adicionar interação
      rota.style.cursor = 'pointer';
      rota.style.border = '1px solid #dee2e6';
      rota.style.borderRadius = '6px';
      rota.style.marginBottom = '8px';
      rota.style.padding = '10px 15px';
      rota.style.backgroundColor = '#fff';
      rota.style.transition = 'all 0.2s ease';
      
      // Adicionar hover effect
      rota.onmouseover = function() {
        this.style.backgroundColor = '#f8f9fa';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.08)';
      };
      
      rota.onmouseout = function() {
        if (!this.classList.contains('selecionada')) {
          this.style.backgroundColor = '#fff';
          this.style.transform = 'none';
          this.style.boxShadow = 'none';
        }
      };
      
      // Adicionar interação de clique
      rota.onclick = function() {
        // Remover seleção das outras rotas
        document.querySelectorAll('.route-alternative').forEach(r => {
          r.classList.remove('selecionada');
          r.style.backgroundColor = '#fff';
          r.style.borderColor = '#dee2e6';
          r.style.boxShadow = 'none';
          r.style.transform = 'none';
        });
        
        // Marcar esta rota como selecionada
        this.classList.add('selecionada');
        this.style.backgroundColor = '#fff9e6';
        this.style.borderColor = '#ffd966';
        this.style.boxShadow = '0 0 0 2px rgba(255, 217, 102, 0.5)';
        
        // Atualizar informações no botão
        const distancia = this.getAttribute('data-route-distance');
        const tempo = this.getAttribute('data-route-time');
        
        if (distancia && tempo) {
          atualizarBotaoVisualizar(distancia, tempo);
        }
      };
    });
    
    // Se encontramos rotas, modificar texto explicativo
    if (encontrouRotas) {
      const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted');
      if (textoExplicativo) {
        textoExplicativo.innerHTML = 'Selecione uma rota e clique em <strong>Visualizar</strong> para mais detalhes.';
        textoExplicativo.style.fontSize = '13px';
        textoExplicativo.style.fontStyle = 'italic';
        textoExplicativo.style.textAlign = 'center';
        textoExplicativo.style.margin = '10px 0';
      }
    }
    
    // 2. Modificar o botão Visualizar para mostrar informações
    const botaoVisualizar = document.getElementById('visualize-button');
    
    if (botaoVisualizar && !document.getElementById('botao-info-container')) {
      modificarBotaoVisualizar(botaoVisualizar);
    }
  }
  
  // Função para modificar o botão Visualizar
  function modificarBotaoVisualizar(botao) {
    // Verificar se o botão já foi modificado
    if (botao.getAttribute('data-modificado') === 'true') return;
    botao.setAttribute('data-modificado', 'true');
    
    console.log("🛠️ [DiretoNaPagina] Modificando botão Visualizar");
    
    // Melhorar aparência do botão
    botao.style.backgroundColor = '#ffc107';
    botao.style.color = '#212529';
    botao.style.fontWeight = 'bold';
    botao.style.border = 'none';
    botao.style.padding = '8px 15px';
    botao.style.borderRadius = '4px';
    botao.style.cursor = 'pointer';
    botao.style.minWidth = '120px';
    botao.style.textAlign = 'center';
    
    // Criar container para botão e informações
    const container = document.createElement('div');
    container.id = 'botao-info-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginTop = '12px';
    container.style.padding = '6px';
    container.style.borderRadius = '6px';
    container.style.backgroundColor = '#f5f5f5';
    
    // Mover botão para o container
    const pai = botao.parentNode;
    pai.removeChild(botao);
    container.appendChild(botao);
    
    // Criar área para informações
    const infoArea = document.createElement('div');
    infoArea.id = 'info-rota-area';
    infoArea.style.marginLeft = '12px';
    infoArea.style.padding = '6px 10px';
    infoArea.style.backgroundColor = 'white';
    infoArea.style.borderRadius = '4px';
    infoArea.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    infoArea.style.fontSize = '14px';
    infoArea.style.color = '#555';
    
    // Adicionar elementos para distância e tempo
    infoArea.innerHTML = `
      <div id="info-distancia" style="margin-bottom: 4px; display: flex; align-items: center;">
        <span style="width: 14px; margin-right: 6px; color: #666;">
          <i class="fa fa-road"></i>
        </span>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo" style="display: flex; align-items: center;">
        <span style="width: 14px; margin-right: 6px; color: #666;">
          <i class="fa fa-clock"></i>
        </span>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar área de informações ao container
    container.appendChild(infoArea);
    
    // Adicionar container ao DOM
    pai.appendChild(container);
    
    // Adicionar CSS para animação
    if (!document.getElementById('modificacoes-css')) {
      const style = document.createElement('style');
      style.id = 'modificacoes-css';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .info-atualizada {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Carregar Font Awesome caso não esteja disponível
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
    
    // Interceptar clique no botão para atualizar informações
    const clickOriginal = botao.onclick;
    botao.onclick = function(event) {
      // Executar comportamento original
      if (clickOriginal) clickOriginal.call(this, event);
      
      // Atualizar com dados da rota selecionada
      const rotaSelecionada = document.querySelector('.route-alternative.selecionada');
      if (rotaSelecionada) {
        const distancia = rotaSelecionada.getAttribute('data-route-distance');
        const tempo = rotaSelecionada.getAttribute('data-route-time');
        atualizarBotaoVisualizar(distancia, tempo);
      }
    };
  }
  
  // Função para atualizar informações no botão
  function atualizarBotaoVisualizar(distancia, tempo) {
    if (!distancia || !tempo) return;
    
    console.log("🛠️ [DiretoNaPagina] Atualizando informações:", distancia, tempo);
    
    const infoDistancia = document.getElementById('info-distancia');
    const infoTempo = document.getElementById('info-tempo');
    
    if (infoDistancia && infoTempo) {
      // Atualizar conteúdo
      infoDistancia.innerHTML = `
        <span style="width: 14px; margin-right: 6px; color: #666;">
          <i class="fa fa-road"></i>
        </span>
        <span>${distancia}</span>
      `;
      
      infoTempo.innerHTML = `
        <span style="width: 14px; margin-right: 6px; color: #666;">
          <i class="fa fa-clock"></i>
        </span>
        <span>${tempo}</span>
      `;
      
      // Aplicar animação
      infoDistancia.classList.add('info-atualizada');
      infoTempo.classList.add('info-atualizada');
      
      // Remover classe após animação
      setTimeout(() => {
        infoDistancia.classList.remove('info-atualizada');
        infoTempo.classList.remove('info-atualizada');
      }, 1000);
    }
  }
  
  // Anexar ao carregamento completo da página
  if (document.readyState === "complete") {
    aplicarModificacoes();
  } else {
    window.addEventListener("load", aplicarModificacoes);
  }
  
  // Também verificar quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicarModificacoes);
  } else {
    aplicarModificacoes();
  }
})();