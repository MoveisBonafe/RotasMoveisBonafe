/**
 * FIX DIRETO MÁXIMA COMPATIBILIDADE - GITHUB PAGES
 * 
 * Este script implementa diretamente no HTML a solução
 * para ocultar informações de rotas alternativas e mostrar
 * junto ao botão Visualizar
 */
(function() {
  console.log("🚀 [FIX-DIRETO] Aplicando solução máxima compatibilidade");
  
  // Executar imediatamente
  inicializar();
  
  // Função principal
  function inicializar() {
    // Tentar imediatamente
    aplicarAjustes();
    
    // Tentar novamente em intervalos
    setTimeout(aplicarAjustes, 500);
    setTimeout(aplicarAjustes, 1500);
    setTimeout(aplicarAjustes, 3000);
    
    // Repetir a cada 2 segundos por um período
    const intervalo = setInterval(aplicarAjustes, 2000);
    setTimeout(() => clearInterval(intervalo), 30000);
    
    // Observar DOM para alterações
    observarDOM();
  }
  
  // Observador de DOM
  function observarDOM() {
    // Criar observer para document.body
    const observer = new MutationObserver(function(mutations) {
      aplicarAjustes();
    });
    
    // Configurar para observar mudanças no body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🚀 [FIX-DIRETO] Observer configurado");
  }
  
  // Aplicar todos os ajustes necessários
  function aplicarAjustes() {
    // 1. Esconder elementos de tempo e distância
    document.querySelectorAll('.route-alternative .route-distance, .route-alternative .route-time').forEach(el => {
      // Aplicar estilo inline com !important
      el.style.setProperty('display', 'none', 'important');
      el.style.visibility = 'hidden';
    });
    
    // 2. Encontrar todas as alternativas e processar
    document.querySelectorAll('.route-alternative').forEach(alternativa => {
      // Extrair as informações e guardar como atributos
      const distancia = alternativa.querySelector('.route-distance');
      const tempo = alternativa.querySelector('.route-time');
      
      if (distancia && tempo) {
        // Guardar textos
        alternativa.setAttribute('data-distancia', distancia.textContent);
        alternativa.setAttribute('data-tempo', tempo.textContent);
        
        // Melhorar estilo da alternativa
        alternativa.style.cursor = 'pointer';
        alternativa.style.borderRadius = '6px';
        alternativa.style.transition = 'background-color 0.2s, transform 0.2s, box-shadow 0.2s';
        
        // Adicionar título centralizado
        const titulo = alternativa.querySelector('h5');
        if (titulo) {
          titulo.style.textAlign = 'center';
          titulo.style.margin = '0';
          titulo.style.padding = '5px 0';
        }
        
        // Adicionar eventos se ainda não tiver
        if (!alternativa.getAttribute('data-processado')) {
          alternativa.setAttribute('data-processado', 'true');
          
          // Efeito hover
          alternativa.addEventListener('mouseenter', function() {
            if (!this.classList.contains('alt-selecionada')) {
              this.style.backgroundColor = '#f0f5ff';
              this.style.transform = 'translateY(-2px)';
              this.style.boxShadow = '0 3px 6px rgba(0,0,0,0.1)';
            }
          });
          
          alternativa.addEventListener('mouseleave', function() {
            if (!this.classList.contains('alt-selecionada')) {
              this.style.backgroundColor = '';
              this.style.transform = '';
              this.style.boxShadow = '';
            }
          });
          
          // Efeito clique
          alternativa.addEventListener('click', function() {
            // Remover seleção anterior
            document.querySelectorAll('.route-alternative').forEach(alt => {
              alt.classList.remove('alt-selecionada');
              alt.style.backgroundColor = '';
              alt.style.borderColor = '';
              alt.style.boxShadow = '';
            });
            
            // Aplicar seleção atual
            this.classList.add('alt-selecionada');
            this.style.backgroundColor = '#fff9e6';
            this.style.borderColor = '#ffd966';
            this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
            
            // Atualizar informações no botão
            const distTexto = this.getAttribute('data-distancia');
            const tempoTexto = this.getAttribute('data-tempo');
            
            atualizarInfoBotao(distTexto, tempoTexto);
          });
        }
      }
    });
    
    // 3. Ajustar texto explicativo
    const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted');
    if (textoExplicativo) {
      textoExplicativo.textContent = 'Escolha uma rota e clique em Visualizar para ver detalhes.';
      textoExplicativo.style.textAlign = 'center';
      textoExplicativo.style.fontStyle = 'italic';
      textoExplicativo.style.fontSize = '13px';
      textoExplicativo.style.margin = '10px 0';
    }
    
    // 4. Modificar o botão visualizar
    ajustarBotaoVisualizar();
  }
  
  // Ajustar o botão visualizar
  function ajustarBotaoVisualizar() {
    const botao = document.getElementById('visualize-button');
    if (!botao) return;
    
    // Verificar se já está modificado
    if (botao.getAttribute('data-modificado') === 'true') return;
    
    // Marcar como modificado
    botao.setAttribute('data-modificado', 'true');
    
    // Ajustar estilo do botão
    botao.style.backgroundColor = '#ffc107';
    botao.style.color = '#212529';
    botao.style.border = 'none';
    botao.style.borderRadius = '4px';
    botao.style.padding = '8px 15px';
    botao.style.fontWeight = 'bold';
    botao.style.minWidth = '120px';
    botao.style.cursor = 'pointer';
    
    // Criar container para botão e informações
    const container = document.createElement('div');
    container.id = 'btn-info-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '12px 0';
    container.style.padding = '5px';
    container.style.backgroundColor = '#f8f9fa';
    container.style.borderRadius = '6px';
    
    // Mover botão para o novo container
    const parent = botao.parentNode;
    parent.removeChild(botao);
    container.appendChild(botao);
    
    // Criar área de informações
    const infoBox = document.createElement('div');
    infoBox.id = 'rota-info-box';
    infoBox.style.marginLeft = '10px';
    infoBox.style.padding = '6px 10px';
    infoBox.style.backgroundColor = 'white';
    infoBox.style.borderRadius = '4px';
    infoBox.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    infoBox.style.color = '#555';
    infoBox.style.fontSize = '13px';
    
    // Adicionar conteúdo
    infoBox.innerHTML = `
      <div id="info-dist" style="margin-bottom: 4px;">
        <i class="fa fa-road" style="width: 14px; margin-right: 5px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div id="info-tempo">
        <i class="fa fa-clock" style="width: 14px; margin-right: 5px; color: #666;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar área de informações ao container
    container.appendChild(infoBox);
    
    // Adicionar container de volta ao DOM
    parent.appendChild(container);
    
    // Garantir que Font Awesome esteja disponível
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(faLink);
    }
    
    // Adicionar CSS para animação
    if (!document.getElementById('fix-direto-css')) {
      const style = document.createElement('style');
      style.id = 'fix-direto-css';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .info-atualizada {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Interceptar clique no botão
    const clickOriginal = botao.onclick;
    botao.onclick = function(event) {
      // Executar comportamento original
      if (clickOriginal) clickOriginal.call(this, event);
      
      // Atualizar informações da rota selecionada
      const rotaSelecionada = document.querySelector('.route-alternative.alt-selecionada');
      if (rotaSelecionada) {
        const dist = rotaSelecionada.getAttribute('data-distancia');
        const tempo = rotaSelecionada.getAttribute('data-tempo');
        atualizarInfoBotao(dist, tempo);
      }
    };
  }
  
  // Atualizar informações no botão
  function atualizarInfoBotao(distancia, tempo) {
    if (!distancia || !tempo) return;
    
    const distElement = document.getElementById('info-dist');
    const tempoElement = document.getElementById('info-tempo');
    
    if (distElement && tempoElement) {
      // Atualizar conteúdo
      distElement.innerHTML = `
        <i class="fa fa-road" style="width: 14px; margin-right: 5px; color: #666;"></i>
        <span>${distancia}</span>
      `;
      
      tempoElement.innerHTML = `
        <i class="fa fa-clock" style="width: 14px; margin-right: 5px; color: #666;"></i>
        <span>${tempo}</span>
      `;
      
      // Adicionar animação
      distElement.classList.add('info-atualizada');
      tempoElement.classList.add('info-atualizada');
      
      // Remover classe após animação
      setTimeout(() => {
        distElement.classList.remove('info-atualizada');
        tempoElement.classList.remove('info-atualizada');
      }, 500);
    }
  }
})();