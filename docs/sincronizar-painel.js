/**
 * Script para sincronizar o painel de locais com o tipo de rota selecionado
 * Esta solução garante que o painel sempre reflete a ordem da rota atual
 */
(function() {
    console.log('[SincronizarPainel] Iniciando sincronização do painel com tipo de rota');
    
    // Variáveis de estado
    let ordemOriginal = [];      // Ordem original dos destinos como adicionados
    let ordemOtimizada = null;   // Ordem otimizada calculada pelo sistema
    let tipoRotaAtual = '';      // Tipo de rota atualmente selecionado
    let ultimaOrdemAplicada = ''; // Última ordem aplicada ao painel
    
    // Iniciar monitoramento
    setInterval(monitorarTiposRota, 500);
    
    /**
     * Monitorar os tipos de rota disponíveis e detectar mudanças
     */
    function monitorarTiposRota() {
        // Encontrar container de alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                          document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            return;
        }
        
        // Obter os cards de rota
        const cards = container.querySelectorAll('.route-option-card');
        let novoTipoRota = '';
        
        // Verificar qual está selecionado
        cards.forEach(card => {
            // Configurar evento de clique se ainda não tiver
            if (!card.getAttribute('data-sincronizado')) {
                card.setAttribute('data-sincronizado', 'true');
                
                // Adicionar evento de clique
                card.addEventListener('click', function() {
                    const tipo = identificarTipoRota(card);
                    console.log('[SincronizarPainel] Card de rota clicado:', tipo);
                    
                    // Se for um novo tipo, vamos reorganizar o painel 
                    if (tipo !== tipoRotaAtual) {
                        tipoRotaAtual = tipo;
                        setTimeout(() => reorganizarPainelPorTipoRota(tipo), 300);
                    }
                });
            }
            
            // Verificar se este card está selecionado
            if (card.classList.contains('selected')) {
                novoTipoRota = identificarTipoRota(card);
            }
        });
        
        // Se o tipo de rota mudou, atualizar e reorganizar
        if (novoTipoRota && novoTipoRota !== tipoRotaAtual) {
            console.log('[SincronizarPainel] Tipo de rota mudou para:', novoTipoRota);
            tipoRotaAtual = novoTipoRota;
            
            // Capturar a ordem original na primeira execução
            if (ordemOriginal.length === 0) {
                capturarOrdemOriginal();
            }
            
            // Capturar ordem otimizada se for o caso
            if (novoTipoRota === 'otimizada' && !ordemOtimizada) {
                capturarOrdemOtimizada();
            }
            
            // Reorganizar o painel para este tipo de rota
            reorganizarPainelPorTipoRota(novoTipoRota);
        }
    }
    
    /**
     * Identificar o tipo de rota pelo card
     */
    function identificarTipoRota(card) {
        const texto = card.textContent.toLowerCase();
        
        if (texto.includes('personalizada')) {
            return 'personalizada';
        } else if (texto.includes('otimizada') || texto.includes('recomendada')) {
            return 'otimizada';
        } else if (texto.includes('proximidade')) {
            return 'proximidade';
        } else {
            // Tentar extrair algum identificador único
            const regex = /rota\s+(\w+)/i;
            const matches = texto.match(regex);
            return matches ? matches[1].toLowerCase() : 'desconhecida';
        }
    }
    
    /**
     * Capturar a ordem original dos destinos no painel
     */
    function capturarOrdemOriginal() {
        console.log('[SincronizarPainel] Capturando ordem original dos destinos');
        ordemOriginal = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[SincronizarPainel] Container de destinos não encontrado');
            return;
        }
        
        // Obter todos os itens (exceto origem)
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        // Capturar cada destino
        items.forEach((item, index) => {
            ordemOriginal.push({
                elemento: item,
                indice: index,
                html: item.innerHTML,
                texto: item.textContent.trim()
            });
        });
        
        console.log('[SincronizarPainel] Ordem original capturada com', ordemOriginal.length, 'destinos');
    }
    
    /**
     * Capturar a ordem otimizada da rota atual
     */
    function capturarOrdemOtimizada() {
        console.log('[SincronizarPainel] Tentando capturar ordem otimizada');
        
        // Checar renderer global
        if (!window.directionsRenderer) {
            // Procurar pelo renderer
            for (const prop in window) {
                try {
                    if (window[prop] instanceof google.maps.DirectionsRenderer) {
                        window.directionsRenderer = window[prop];
                        break;
                    }
                } catch (e) {}
            }
        }
        
        // Verificar se temos renderer e se tem direções
        if (window.directionsRenderer && window.directionsRenderer.getDirections) {
            try {
                const directions = window.directionsRenderer.getDirections();
                
                if (directions && directions.routes && directions.routes[0] && directions.routes[0].waypoint_order) {
                    // Capturar a ordem otimizada
                    ordemOtimizada = directions.routes[0].waypoint_order;
                    console.log('[SincronizarPainel] Ordem otimizada capturada:', ordemOtimizada);
                    return;
                }
            } catch (e) {
                console.error('[SincronizarPainel] Erro ao obter direções:', e);
            }
        }
        
        // Alternativa: verificar na interface
        const sequenciaContainer = document.getElementById('route-sequence');
        
        if (sequenciaContainer) {
            const itens = sequenciaContainer.querySelectorAll('.sequence-item');
            
            if (itens.length > 1) { // Pelo menos origem + um destino
                // Construir ordem baseada no que está sendo exibido
                ordemOtimizada = [];
                
                // Pular o primeiro (origem)
                for (let i = 1; i < itens.length; i++) {
                    const item = itens[i];
                    // Usar índice - 1 pois o primeiro elemento é sempre a origem
                    ordemOtimizada.push(i - 1);
                }
                
                console.log('[SincronizarPainel] Ordem otimizada capturada da interface:', ordemOtimizada);
            }
        }
    }
    
    /**
     * Reorganizar o painel conforme o tipo de rota selecionado
     */
    function reorganizarPainelPorTipoRota(tipo) {
        console.log('[SincronizarPainel] Reorganizando painel para tipo:', tipo);
        
        // Verificar se já aplicamos esta ordem
        if (ultimaOrdemAplicada === tipo) {
            return;
        }
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[SincronizarPainel] Container de destinos não encontrado');
            return;
        }
        
        // Se for rota personalizada, restaurar ordem original
        if (tipo === 'personalizada') {
            // Garantir que temos a ordem original
            if (ordemOriginal.length === 0) {
                capturarOrdemOriginal();
                
                if (ordemOriginal.length === 0) {
                    console.log('[SincronizarPainel] Sem ordem original para restaurar');
                    return;
                }
            }
            
            // Obter itens atuais
            const itensAtuais = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
            
            // Verificar se o número de itens é o mesmo
            if (itensAtuais.length !== ordemOriginal.length) {
                console.log('[SincronizarPainel] Número de itens mudou, não é possível restaurar');
                return;
            }
            
            // Remover itens atuais
            const elementosAtuais = Array.from(itensAtuais);
            elementosAtuais.forEach(elem => {
                container.removeChild(elem);
            });
            
            // Adicionar na ordem original
            ordemOriginal.forEach(item => {
                // Encontrar elemento correspondente
                const elemento = elementosAtuais.find(e => e.textContent.trim() === item.texto);
                
                if (elemento) {
                    container.appendChild(elemento);
                }
            });
            
            console.log('[SincronizarPainel] Ordem original restaurada no painel');
        }
        // Se for rota otimizada, usar ordem otimizada
        else if (tipo === 'otimizada') {
            // Garantir que temos a ordem otimizada
            if (!ordemOtimizada) {
                capturarOrdemOtimizada();
                
                if (!ordemOtimizada) {
                    console.log('[SincronizarPainel] Sem ordem otimizada para aplicar');
                    return;
                }
            }
            
            // Obter itens atuais
            const itensAtuais = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
            const elementosAtuais = Array.from(itensAtuais);
            
            // Verificar se temos elementos suficientes
            if (elementosAtuais.length === 0 || elementosAtuais.length !== ordemOtimizada.length) {
                console.log('[SincronizarPainel] Número de elementos não corresponde à ordem otimizada');
                return;
            }
            
            // Criar array com nova ordem
            const novaOrdem = [];
            
            ordemOtimizada.forEach((indice, i) => {
                if (elementosAtuais[indice]) {
                    novaOrdem.push(elementosAtuais[indice]);
                }
            });
            
            // Verificar se temos todos os elementos
            if (novaOrdem.length !== elementosAtuais.length) {
                console.log('[SincronizarPainel] Nem todos os elementos foram incluídos na nova ordem');
                return;
            }
            
            // Remover elementos atuais
            elementosAtuais.forEach(elem => {
                if (elem.parentNode === container) {
                    container.removeChild(elem);
                }
            });
            
            // Adicionar na nova ordem
            novaOrdem.forEach(elem => {
                container.appendChild(elem);
            });
            
            console.log('[SincronizarPainel] Ordem otimizada aplicada ao painel');
        }
        
        // Marcar esta ordem como aplicada
        ultimaOrdemAplicada = tipo;
    }
})();