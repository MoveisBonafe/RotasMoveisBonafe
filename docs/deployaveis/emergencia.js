/**
 * SCRIPT DE EMERGÊNCIA - VERSÃO DEFINITIVA
 * 
 * Este script usa múltiplas técnicas para garantir que funcione no GitHub Pages:
 * 1. Carrega no evento window.onload (mais tardio e confiável)
 * 2. Usa setTimeout com diferentes tempos para tentar várias vezes
 * 3. Usa MutationObserver para reagir a mudanças na página
 * 4. Força estilos inline com !important e prioridade alta
 * 5. Aplica mudanças diretas à DOM, sem depender de classes ou IDs específicos
 */

(function() {
  console.log("🔥 SCRIPT DE EMERGÊNCIA INICIADO");
  
  // Executar após carregamento completo
  window.onload = iniciar;
  
  // Backup com DOMContentLoaded
  document.addEventListener('DOMContentLoaded', iniciar);
  
  // Também tentar imediatamente
  setTimeout(iniciar, 0);
  
  // Variável para rastrear se já conseguimos aplicar as mudanças
  let mudancasAplicadas = false;
  
  // Função principal que executa tudo
  function iniciar() {
    console.log("🔥 Tentando aplicar mudanças de emergência");
    
    // Aplicar mudanças
    const resultado = aplicarMudancas();
    
    // Se não conseguir, tentar novamente em diferentes intervalos
    if (!resultado) {
      console.log("🔥 Primeira tentativa falhou, agendando novas tentativas");
      
      // Tentar em diferentes intervalos
      for (let i = 1; i <= 10; i++) {
        setTimeout(aplicarMudancas, i * 500);
      }
      
      // Configurar para tentar periodicamente
      setInterval(aplicarMudancas, 2000);
      
      // Configurar observer para detectar mudanças na DOM
      configurarObserver();
    }
  }
  
  // Configurar observer para detectar mudanças na DOM
  function configurarObserver() {
    const observer = new MutationObserver(function(mutations) {
      // Quando houver alterações, tentar aplicar mudanças
      aplicarMudancas();
    });
    
    // Observar o corpo do documento para todas as mudanças
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
    
    console.log("🔥 Observer configurado para detectar mudanças");
  }
  
  // Aplicar todas as mudanças necessárias
  function aplicarMudancas() {
    try {
      // 1. Encontrar as rotas alternativas
      const rotasAlternativas = document.querySelectorAll('.route-alternative') || 
                               document.querySelectorAll('[class*="route"][class*="alternative"]') ||
                               document.querySelectorAll('div.card.mb-2');
      
      // Se não encontrar rotas, retornar falso
      if (!rotasAlternativas || rotasAlternativas.length === 0) {
        console.log("🔥 Nenhuma rota alternativa encontrada ainda");
        return false;
      }
      
      console.log("🔥 Encontradas " + rotasAlternativas.length + " rotas alternativas");
      
      // Esconder informações de tempo/distância com CSS
      adicionarCSSEmergencia();
      
      // 2. Processar cada rota alternativa
      let dadosExtraidos = false;
      
      rotasAlternativas.forEach(function(rota) {
        // Extrair e ocultar informações de distância e tempo
        extrairEOcultarInformacoes(rota);
        
        // Confirmar se temos dados
        if (rota.getAttribute('data-distancia') && rota.getAttribute('data-tempo')) {
          dadosExtraidos = true;
        }
        
        // Adicionar eventos se ainda não tiver
        if (!rota.hasAttribute('data-eventos-adicionados')) {
          // Evento de clique
          rota.addEventListener('click', function() {
            // Remover seleção das outras rotas
            rotasAlternativas.forEach(r => {
              r.style.backgroundColor = '';
              r.style.borderColor = '';
              r.style.boxShadow = '';
              r.classList.remove('rota-selecionada');
            });
            
            // Adicionar seleção a esta rota
            this.style.backgroundColor = '#fff9e6';
            this.style.borderColor = '#ffd966';
            this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
            this.classList.add('rota-selecionada');
            
            // Atualizar informações no painel
            atualizarPainelInformacoes(
              this.getAttribute('data-distancia'),
              this.getAttribute('data-tempo')
            );
          });
          
          // Evento de hover
          rota.addEventListener('mouseenter', function() {
            if (!this.classList.contains('rota-selecionada')) {
              this.style.backgroundColor = '#f5f9ff';
              this.style.transform = 'translateY(-2px)';
              this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }
          });
          
          rota.addEventListener('mouseleave', function() {
            if (!this.classList.contains('rota-selecionada')) {
              this.style.backgroundColor = '';
              this.style.transform = '';
              this.style.boxShadow = '';
            }
          });
          
          // Marcar como processado
          rota.setAttribute('data-eventos-adicionados', 'true');
        }
      });
      
      // Se não conseguimos extrair dados, retornar falso
      if (!dadosExtraidos) {
        console.log("🔥 Não foi possível extrair dados de distância/tempo");
        return false;
      }
      
      // 3. Criar ou atualizar painel de informações
      criarPainelInformacoes();
      
      // 4. Modificar texto explicativo
      const textoExplicativo = document.querySelector('.route-alternative-box p.text-muted') ||
                              document.querySelector('.card-body p.text-muted');
      
      if (textoExplicativo) {
        textoExplicativo.innerHTML = 'Selecione uma rota e clique em <strong>Visualizar</strong> para ver detalhes.';
        textoExplicativo.style.fontStyle = 'italic';
        textoExplicativo.style.textAlign = 'center';
        textoExplicativo.style.fontSize = '13px';
        textoExplicativo.style.margin = '10px 0';
      }
      
      // Marcar como aplicado com sucesso
      mudancasAplicadas = true;
      console.log("🔥 Mudanças aplicadas com sucesso!");
      
      return true;
    } catch (erro) {
      console.error("🔥 Erro ao aplicar mudanças:", erro);
      return false;
    }
  }
  
  // Extrai e oculta informações de distância e tempo das rotas
  function extrairEOcultarInformacoes(rota) {
    // Buscar todos os elementos dentro da rota
    const elementos = rota.querySelectorAll('*');
    
    // Processar cada elemento
    elementos.forEach(function(elemento) {
      const texto = elemento.textContent || '';
      
      // Verificar se contém informação de distância (km)
      if (texto.includes('km') && !rota.hasAttribute('data-distancia')) {
        rota.setAttribute('data-distancia', texto.trim());
        elemento.style.display = 'none';
      }
      
      // Verificar se contém informação de tempo (min ou hora)
      if ((texto.includes('min') || texto.includes('hora')) && !rota.hasAttribute('data-tempo')) {
        rota.setAttribute('data-tempo', texto.trim());
        elemento.style.display = 'none';
      }
      
      // Verificar classes específicas
      const classNames = elemento.className || '';
      
      if (classNames.includes('distance') || classNames.includes('time') ||
          classNames.includes('route-distance') || classNames.includes('route-time')) {
        // Salvar texto se ainda não tiver
        if (classNames.includes('distance') && !rota.hasAttribute('data-distancia')) {
          rota.setAttribute('data-distancia', texto.trim());
        }
        
        if (classNames.includes('time') && !rota.hasAttribute('data-tempo')) {
          rota.setAttribute('data-tempo', texto.trim());
        }
        
        // Ocultar usando vários métodos
        elemento.style.display = 'none';
        elemento.style.visibility = 'hidden';
        elemento.style.opacity = '0';
        elemento.style.height = '0';
        elemento.style.overflow = 'hidden';
      }
    });
    
    // Verificação adicional para buscar por texto específico
    if (!rota.hasAttribute('data-distancia') || !rota.hasAttribute('data-tempo')) {
      const todoTexto = rota.textContent || '';
      
      // Buscar padrões de distância e tempo
      const matchDistancia = todoTexto.match(/(\d+[.,]?\d*\s*km)/);
      const matchTempo = todoTexto.match(/(\d+\s*min|\d+\s*hora[s]?)/);
      
      if (matchDistancia && !rota.hasAttribute('data-distancia')) {
        rota.setAttribute('data-distancia', matchDistancia[0]);
      }
      
      if (matchTempo && !rota.hasAttribute('data-tempo')) {
        rota.setAttribute('data-tempo', matchTempo[0]);
      }
    }
  }
  
  // Criar ou atualizar painel de informações
  function criarPainelInformacoes() {
    // Verificar se o painel já existe
    let painelInfo = document.getElementById('painel-info-rota');
    
    // Se não existir, criar novo
    if (!painelInfo) {
      // Encontrar o botão Visualizar
      const botaoVisualizar = document.getElementById('visualize-button') ||
                             document.querySelector('button.btn-primary') ||
                             document.querySelector('button.btn-warning') ||
                             document.querySelector('button:contains("Visualizar")');
      
      if (!botaoVisualizar) {
        console.log("🔥 Botão Visualizar não encontrado");
        return false;
      }
      
      console.log("🔥 Botão Visualizar encontrado, criando painel");
      
      // Melhorar aparência do botão
      botaoVisualizar.style.backgroundColor = '#ffc107';
      botaoVisualizar.style.color = '#212529';
      botaoVisualizar.style.fontWeight = 'bold';
      botaoVisualizar.style.padding = '8px 15px';
      botaoVisualizar.style.borderRadius = '4px';
      botaoVisualizar.style.border = 'none';
      botaoVisualizar.style.minWidth = '120px';
      
      // Criar container
      const container = document.createElement('div');
      container.id = 'container-botao-info';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.margin = '12px 0';
      container.style.padding = '5px';
      container.style.backgroundColor = '#f8f9fa';
      container.style.borderRadius = '6px';
      
      // Mover botão para container
      const parent = botaoVisualizar.parentNode;
      parent.removeChild(botaoVisualizar);
      container.appendChild(botaoVisualizar);
      
      // Criar painel de informações
      painelInfo = document.createElement('div');
      painelInfo.id = 'painel-info-rota';
      painelInfo.style.marginLeft = '15px';
      painelInfo.style.padding = '8px 12px';
      painelInfo.style.backgroundColor = 'white';
      painelInfo.style.borderRadius = '4px';
      painelInfo.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      painelInfo.style.fontSize = '14px';
      painelInfo.style.color = '#555';
      
      // Adicionar conteúdo inicial
      painelInfo.innerHTML = `
        <div id="info-distancia" style="margin-bottom: 6px; display: flex; align-items: center;">
          <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
          <span>Selecione uma rota</span>
        </div>
        <div id="info-tempo" style="display: flex; align-items: center;">
          <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
          <span>Selecione uma rota</span>
        </div>
      `;
      
      // Adicionar ao container
      container.appendChild(painelInfo);
      
      // Adicionar container ao DOM
      parent.appendChild(container);
      
      // Adicionar Font Awesome se necessário
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
        const rotaSelecionada = document.querySelector('.route-alternative.rota-selecionada') ||
                                document.querySelector('.rota-selecionada');
        
        if (rotaSelecionada) {
          atualizarPainelInformacoes(
            rotaSelecionada.getAttribute('data-distancia'),
            rotaSelecionada.getAttribute('data-tempo')
          );
        }
      };
    }
    
    return true;
  }
  
  // Atualizar informações no painel
  function atualizarPainelInformacoes(distancia, tempo) {
    // Verificar se temos dados
    if (!distancia || !tempo) {
      console.log("🔥 Sem dados para atualizar painel");
      return;
    }
    
    // Encontrar elementos
    const distanciaEl = document.getElementById('info-distancia');
    const tempoEl = document.getElementById('info-tempo');
    
    // Atualizar conteúdo
    if (distanciaEl && tempoEl) {
      distanciaEl.innerHTML = `
        <i class="fa fa-road" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${distancia}</span>
      `;
      
      tempoEl.innerHTML = `
        <i class="fa fa-clock" style="width: 16px; margin-right: 6px; color: #666;"></i>
        <span>${tempo}</span>
      `;
      
      console.log("🔥 Painel atualizado com:", distancia, tempo);
    } else {
      console.log("🔥 Elementos do painel não encontrados");
    }
  }
  
  // Adicionar CSS de emergência
  function adicionarCSSEmergencia() {
    // Verificar se já existe
    if (document.getElementById('css-emergencia')) {
      return;
    }
    
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.id = 'css-emergencia';
    style.innerHTML = `
      /* Ocultar elementos de tempo e distância */
      .route-alternative .route-distance,
      .route-alternative .route-time,
      .route-alternative div[class*="distance"],
      .route-alternative div[class*="time"],
      .route-alternative span[class*="distance"],
      .route-alternative span[class*="time"],
      div.card.mb-2 .route-distance,
      div.card.mb-2 .route-time {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        pointer-events: none !important;
      }
      
      /* Estilizar rotas alternativas */
      .route-alternative,
      div.card.mb-2 {
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        padding: 10px 15px !important;
        border-radius: 6px !important;
        margin-bottom: 8px !important;
      }
      
      /* Destacar título da rota */
      .route-alternative h5,
      div.card.mb-2 .card-title {
        text-align: center !important;
        padding: 5px 0 !important;
        margin: 0 !important;
      }
      
      /* Animação para informações atualizadas */
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
    console.log("🔥 CSS de emergência adicionado");
  }
})();