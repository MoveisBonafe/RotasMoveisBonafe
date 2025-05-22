/**
 * SCRIPT PARA EXECUÇÃO DIRETA NO CONSOLE DO NAVEGADOR
 * 
 * Como usar:
 * 1. Abra o site no GitHub Pages
 * 2. Abra o console do navegador (F12 -> Console)
 * 3. Cole todo este código no console
 * 4. Pressione Enter para executar
 */

(function() {
  console.log("🔥 EXECUÇÃO DIRETA: Iniciando modificação das rotas");
  
  // Função que faz todo o trabalho
  function modificarRotasAlternativas() {
    try {
      // 1. Encontrar as rotas alternativas usando vários métodos
      let rotas = [];
      
      // Método 1: Procurar pela classe route-alternative
      const rotasClasse = document.querySelectorAll('.route-alternative');
      if (rotasClasse && rotasClasse.length > 0) {
        rotas = Array.from(rotasClasse);
        console.log("🔥 Encontradas rotas pelo seletor .route-alternative:", rotasClasse.length);
      }
      
      // Método 2: Procurar cards dentro da seção de rotas alternativas
      if (rotas.length === 0) {
        // Encontrar o título "Rotas Alternativas"
        const todosTextos = document.querySelectorAll('*');
        let tituloRotas = null;
        
        for (let i = 0; i < todosTextos.length; i++) {
          if (todosTextos[i].textContent.trim() === 'Rotas Alternativas') {
            tituloRotas = todosTextos[i];
            break;
          }
        }
        
        if (tituloRotas) {
          console.log("🔥 Título 'Rotas Alternativas' encontrado!");
          
          // Procurar por cards nas proximidades (navegar até 3 níveis acima e depois para baixo)
          let elemento = tituloRotas;
          for (let i = 0; i < 3; i++) {
            if (elemento.parentElement) {
              elemento = elemento.parentElement;
            } else {
              break;
            }
          }
          
          // Procurar cards dentro deste elemento pai
          const cards = elemento.querySelectorAll('.card, .card-body, div.mb-2');
          
          if (cards && cards.length > 0) {
            // Filtrar apenas os que parecem ser rotas (contêm km ou min)
            rotas = Array.from(cards).filter(card => {
              const texto = card.textContent || '';
              return texto.includes('km') || texto.includes('min');
            });
            
            console.log("🔥 Encontradas rotas a partir do título:", rotas.length);
          }
        }
      }
      
      // Método 3: Procurar qualquer elemento que possa ser uma rota
      if (rotas.length === 0) {
        const todosElementos = document.querySelectorAll('div');
        
        rotas = Array.from(todosElementos).filter(el => {
          const texto = el.textContent || '';
          const temKm = texto.includes('km');
          const temMin = texto.includes('min');
          const temFilhos = el.children.length >= 2 && el.children.length <= 10;
          const naoMuitoGrande = texto.length < 500;
          
          return temKm && temMin && temFilhos && naoMuitoGrande;
        });
        
        console.log("🔥 Encontradas possíveis rotas pelo conteúdo:", rotas.length);
      }
      
      // Se encontrou rotas, processá-las
      if (rotas.length > 0) {
        console.log("🔥 Processando " + rotas.length + " rotas alternativas");
        
        // 2. Processar cada rota encontrada
        for (let i = 0; i < rotas.length; i++) {
          const rota = rotas[i];
          
          // Extrair informações de distância e tempo
          let distancia = '';
          let tempo = '';
          
          // Método 1: Buscar pelo texto em elementos específicos
          const textos = Array.from(rota.querySelectorAll('*')).map(el => el.textContent.trim());
          
          for (let j = 0; j < textos.length; j++) {
            if (textos[j].includes('km') && !distancia) {
              distancia = textos[j];
              console.log("🔥 Distância encontrada:", distancia);
            }
            
            if ((textos[j].includes('min') || textos[j].includes('hora')) && !tempo) {
              tempo = textos[j];
              console.log("🔥 Tempo encontrado:", tempo);
            }
          }
          
          // Método 2: Extrair do texto completo
          if (!distancia || !tempo) {
            const textoCompleto = rota.textContent || '';
            
            // Expressões regulares para extrair padrões
            const matchDistancia = textoCompleto.match(/(\d+[.,]?\d*\s*km)/i);
            const matchTempo = textoCompleto.match(/(\d+\s*min|\d+\s*hora[s]?)/i);
            
            if (matchDistancia && !distancia) {
              distancia = matchDistancia[0];
              console.log("🔥 Distância extraída por regex:", distancia);
            }
            
            if (matchTempo && !tempo) {
              tempo = matchTempo[0];
              console.log("🔥 Tempo extraído por regex:", tempo);
            }
          }
          
          // Salvar informações na rota
          rota.setAttribute('data-distancia', distancia || 'Não disponível');
          rota.setAttribute('data-tempo', tempo || 'Não disponível');
          
          // Ocultar elementos de distância e tempo
          const elementosParaOcultar = Array.from(rota.querySelectorAll('*')).filter(el => {
            const texto = el.textContent.trim();
            return (texto.match(/^\s*\d+[.,]?\d*\s*km\s*$/) || 
                   texto.match(/^\s*\d+\s*min\s*$/) || 
                   texto.match(/^\s*\d+\s*hora[s]?\s*$/)) && 
                   el.children.length === 0;
          });
          
          elementosParaOcultar.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.height = '0';
            el.style.overflow = 'hidden';
          });
          
          // Adicionar estilo à rota
          rota.style.cursor = 'pointer';
          rota.style.transition = 'all 0.2s ease';
          rota.style.borderRadius = '6px';
          rota.style.padding = '10px 15px';
          rota.style.marginBottom = '8px';
          
          // Adicionar evento de clique
          rota.addEventListener('click', function() {
            // Remover seleção das outras rotas
            rotas.forEach(r => {
              r.classList.remove('rota-selecionada');
              r.style.backgroundColor = '';
              r.style.borderColor = '';
              r.style.boxShadow = '';
            });
            
            // Selecionar esta rota
            this.classList.add('rota-selecionada');
            this.style.backgroundColor = '#fff9e6';
            this.style.borderColor = '#ffd966';
            this.style.boxShadow = '0 0 0 2px rgba(255,217,102,0.5)';
            
            // Atualizar painel de informações
            const painel = document.getElementById('painel-info-direto');
            if (painel) {
              const distEl = painel.querySelector('.info-distancia');
              const tempoEl = painel.querySelector('.info-tempo');
              
              if (distEl && tempoEl) {
                distEl.innerHTML = `<i class="fa fa-road" style="margin-right: 5px;"></i> ${this.getAttribute('data-distancia')}`;
                tempoEl.innerHTML = `<i class="fa fa-clock" style="margin-right: 5px;"></i> ${this.getAttribute('data-tempo')}`;
              }
            }
          });
          
          // Adicionar efeitos hover
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
        }
        
        // 3. Criar painel de informações junto ao botão Visualizar
        criarPainelInformacoes();
        
        // 4. Selecionar primeira rota automaticamente
        if (rotas.length > 0) {
          rotas[0].click();
        }
        
        return true;
      } else {
        console.log("🔥 Nenhuma rota alternativa encontrada");
        return false;
      }
    } catch (erro) {
      console.error("🔥 Erro ao processar rotas:", erro);
      return false;
    }
  }
  
  // Criar painel de informações junto ao botão Visualizar
  function criarPainelInformacoes() {
    // Verificar se já existe
    if (document.getElementById('painel-info-direto')) {
      return;
    }
    
    // Encontrar o botão Visualizar
    const botaoVisualizar = document.getElementById('visualize-button') ||
                           document.querySelector('button:contains("Visualizar")') ||
                           document.querySelector('button.btn-primary');
    
    if (!botaoVisualizar) {
      console.log("🔥 Botão Visualizar não encontrado");
      
      // Tentar método alternativo para encontrar o botão
      const todosBotoes = document.querySelectorAll('button');
      for (let i = 0; i < todosBotoes.length; i++) {
        if (todosBotoes[i].textContent.includes('Visualizar')) {
          console.log("🔥 Botão Visualizar encontrado por texto");
          botaoVisualizar = todosBotoes[i];
          break;
        }
      }
      
      if (!botaoVisualizar) {
        return;
      }
    }
    
    console.log("🔥 Botão Visualizar encontrado, criando painel");
    
    // Estilizar o botão
    botaoVisualizar.style.backgroundColor = '#ffc107';
    botaoVisualizar.style.color = '#212529';
    botaoVisualizar.style.fontWeight = 'bold';
    botaoVisualizar.style.padding = '8px 15px';
    botaoVisualizar.style.border = 'none';
    botaoVisualizar.style.borderRadius = '4px';
    botaoVisualizar.style.minWidth = '120px';
    
    // Criar container
    const container = document.createElement('div');
    container.id = 'container-info-direto';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '15px 0';
    container.style.padding = '5px';
    container.style.backgroundColor = '#f8f9fa';
    container.style.borderRadius = '8px';
    
    // Mover botão para container
    const parent = botaoVisualizar.parentNode;
    parent.removeChild(botaoVisualizar);
    container.appendChild(botaoVisualizar);
    
    // Criar painel de informações
    const painel = document.createElement('div');
    painel.id = 'painel-info-direto';
    painel.style.marginLeft = '15px';
    painel.style.padding = '8px 12px';
    painel.style.backgroundColor = 'white';
    painel.style.borderRadius = '6px';
    painel.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    painel.style.fontSize = '14px';
    painel.style.color = '#555';
    
    // Adicionar conteúdo
    painel.innerHTML = `
      <div class="info-distancia" style="margin-bottom: 6px; display: flex; align-items: center;">
        <i class="fa fa-road" style="margin-right: 5px;"></i>
        <span>Selecione uma rota</span>
      </div>
      <div class="info-tempo" style="display: flex; align-items: center;">
        <i class="fa fa-clock" style="margin-right: 5px;"></i>
        <span>Selecione uma rota</span>
      </div>
    `;
    
    // Adicionar ao container
    container.appendChild(painel);
    
    // Adicionar container ao DOM
    parent.appendChild(container);
    
    // Adicionar Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
    
    // Modificar texto explicativo
    const textoExplicativo = document.querySelector('p.text-muted');
    if (textoExplicativo) {
      textoExplicativo.textContent = 'Selecione uma rota e clique em Visualizar para ver detalhes.';
      textoExplicativo.style.textAlign = 'center';
      textoExplicativo.style.fontStyle = 'italic';
      textoExplicativo.style.fontSize = '13px';
      textoExplicativo.style.margin = '10px 0';
    }
  }
  
  // Executar agora e em intervalos
  modificarRotasAlternativas();
  
  // Tentar mais algumas vezes após a carga inicial
  setTimeout(modificarRotasAlternativas, 1000);
  setTimeout(modificarRotasAlternativas, 2000);
  setTimeout(modificarRotasAlternativas, 3000);
})();