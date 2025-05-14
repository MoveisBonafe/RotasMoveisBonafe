/**
 * Script para atualizar o painel de locais conforme otimização
 * Esta solução monitora as mudanças de rota e reorganiza os itens no painel
 */
(function() {
    console.log('[AtualizarPainel] Iniciando script para atualizar painel de locais');
    
    // Variáveis de estado
    let rotaOtimizadaAtual = null;
    let rotaPersonalizadaAtiva = false;
    let destinosOriginais = [];
    
    // Inicializar monitoramento
    setInterval(monitorarMudancasRota, 300);
    
    /**
     * Monitorar mudanças nas rotas e nos tipos selecionados
     */
    function monitorarMudancasRota() {
        // Verificar se alguma rota foi calculada (temos diretions)
        const directions = window.directionsRenderer || null;
        
        if (!directions) {
            for (let prop in window) {
                try {
                    if (window[prop] instanceof google.maps.DirectionsRenderer) {
                        // Encontramos o renderer
                        console.log('[AtualizarPainel] DirectionsRenderer encontrado em:', prop);
                        window.directionsRenderer = window[prop];
                        break;
                    }
                } catch (e) {}
            }
        }
        
        // Verificar se temos uma nova rota
        if (window.directionsRenderer && window.directionsRenderer.getDirections) {
            try {
                const direcoes = window.directionsRenderer.getDirections();
                
                if (direcoes && direcoes !== rotaOtimizadaAtual) {
                    console.log('[AtualizarPainel] Nova rota detectada');
                    rotaOtimizadaAtual = direcoes;
                    
                    // Verificar se é rota personalizada ou otimizada
                    verificarTipoRota();
                    
                    // Se não for rota personalizada, reorganizar o painel
                    if (!rotaPersonalizadaAtiva) {
                        // Capturar os destinos originais antes de reorganizar
                        if (destinosOriginais.length === 0) {
                            destinosOriginais = capturarDestinosPainel();
                        }
                        
                        console.log('[AtualizarPainel] Reorganizando painel conforme otimização');
                        reorganizarPainelConforme(direcoes);
                    }
                }
            } catch (e) {
                console.error('[AtualizarPainel] Erro ao obter direções:', e);
            }
        }
        
        // Verificar outro indicador: o container de informações da rota
        const routeSequence = document.getElementById('route-sequence');
        if (routeSequence) {
            // Verificar texto para determinar se é personalizada
            const texto = routeSequence.textContent.toLowerCase();
            if (texto.includes('personalizada')) {
                // Marcamos que é rota personalizada para não reorganizar
                rotaPersonalizadaAtiva = true;
                
                // Restaurar ordem original
                if (destinosOriginais.length > 0) {
                    restaurarOrdemOriginal();
                }
            } else if (rotaPersonalizadaAtiva) {
                // Mudou de personalizada para otimizada
                rotaPersonalizadaAtiva = false;
                
                // Se temos direções, reorganizar
                if (rotaOtimizadaAtual) {
                    reorganizarPainelConforme(rotaOtimizadaAtual);
                }
            }
        }
    }
    
    /**
     * Verificar qual o tipo de rota selecionado
     */
    function verificarTipoRota() {
        // Encontrar container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            return;
        }
        
        // Verificar qual tipo está selecionado
        const cards = container.querySelectorAll('.route-option-card');
        
        cards.forEach(card => {
            if (card.classList.contains('selected')) {
                const texto = card.textContent.toLowerCase();
                
                if (texto.includes('personalizada')) {
                    rotaPersonalizadaAtiva = true;
                    console.log('[AtualizarPainel] Rota personalizada detectada como ativa');
                } else {
                    rotaPersonalizadaAtiva = false;
                    console.log('[AtualizarPainel] Rota otimizada detectada como ativa');
                }
            }
        });
    }
    
    /**
     * Capturar destinos na ordem atual do painel
     */
    function capturarDestinosPainel() {
        const destinos = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[AtualizarPainel] Container de destinos não encontrado');
            return destinos;
        }
        
        // Obter itens não-origem
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        // Processar cada item
        items.forEach(function(item, index) {
            // Salvar dados do item
            destinos.push({
                elemento: item,
                index: index,
                texto: item.textContent,
                html: item.innerHTML,
                className: item.className
            });
        });
        
        console.log('[AtualizarPainel] Capturados', destinos.length, 'destinos originais');
        return destinos;
    }
    
    /**
     * Reorganizar o painel conforme a rota otimizada
     */
    function reorganizarPainelConforme(direcoes) {
        // Verificar se temos uma rota válida
        if (!direcoes || !direcoes.routes || !direcoes.routes[0] || !direcoes.routes[0].waypoint_order) {
            console.log('[AtualizarPainel] Direções inválidas para reorganizar');
            return;
        }
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[AtualizarPainel] Container de destinos não encontrado');
            return;
        }
        
        // Obter itens não-origem
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        const elementos = Array.from(items);
        
        // Obter ordem otimizada
        const ordem = direcoes.routes[0].waypoint_order;
        
        console.log('[AtualizarPainel] Ordem otimizada:', ordem);
        console.log('[AtualizarPainel] Elementos atuais:', elementos.length);
        
        // Verificar se temos elementos suficientes
        if (elementos.length <= 1 || elementos.length !== ordem.length) {
            console.log('[AtualizarPainel] Número de elementos não corresponde à ordem');
            return;
        }
        
        // Criar array temporário com elementos na nova ordem
        const novaOrdem = [];
        
        ordem.forEach((indice, i) => {
            if (elementos[indice]) {
                novaOrdem.push(elementos[indice]);
            }
        });
        
        // Verificar se temos todos os elementos
        if (novaOrdem.length !== elementos.length) {
            console.log('[AtualizarPainel] Nem todos os elementos foram incluídos na nova ordem');
            return;
        }
        
        // Remover elementos atuais
        elementos.forEach(elem => {
            if (elem.parentNode === container) {
                container.removeChild(elem);
            }
        });
        
        // Adicionar na nova ordem
        novaOrdem.forEach(elem => {
            container.appendChild(elem);
        });
        
        console.log('[AtualizarPainel] Painel reorganizado com sucesso');
    }
    
    /**
     * Restaurar a ordem original dos destinos no painel
     */
    function restaurarOrdemOriginal() {
        if (destinosOriginais.length === 0) {
            return;
        }
        
        console.log('[AtualizarPainel] Restaurando ordem original dos destinos');
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[AtualizarPainel] Container de destinos não encontrado');
            return;
        }
        
        // Obter itens atuais
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        const elementos = Array.from(items);
        
        // Verificar se temos o mesmo número de elementos
        if (elementos.length !== destinosOriginais.length) {
            console.log('[AtualizarPainel] Número de elementos mudou, não é possível restaurar');
            return;
        }
        
        // Reorganizar conforme ordem original
        destinosOriginais.forEach((destino, index) => {
            const elemento = elementos.find(elem => elem.textContent.trim() === destino.texto.trim());
            
            if (elemento && elemento.parentNode === container) {
                // Mover para a posição correta
                if (index < elementos.length - 1) {
                    container.insertBefore(elemento, elementos[index + 1]);
                } else {
                    container.appendChild(elemento);
                }
            }
        });
        
        console.log('[AtualizarPainel] Ordem original restaurada');
    }
})();