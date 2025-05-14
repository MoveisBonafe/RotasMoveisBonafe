/**
 * Script para garantir que a primeira rota mostrada seja sempre a original
 * (na ordem em que os destinos foram adicionados)
 */
(function() {
    console.log('[PrimeiraRotaOriginal] Inicializando garantia de rota original');
    
    // Variáveis
    let botaoOtimizarMonitorado = false;
    let primeiraOtimizacao = true;
    
    // Iniciar monitoramento do botão de otimizar imediatamente
    inicializar();
    
    // Também inicializar nos eventos padrão
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    
    // Garantir inicialização em qualquer contexto com maior prioridade
    setTimeout(inicializar, 100);
    setTimeout(inicializar, 500);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    /**
     * Inicializar monitoramento
     */
    function inicializar() {
        if (botaoOtimizarMonitorado) return;
        
        // Encontrar botão de otimizar
        const botao = document.getElementById('optimize-route');
        
        if (!botao) {
            console.log('[PrimeiraRotaOriginal] Botão não encontrado, tentando novamente...');
            return;
        }
        
        // Configurar monitoramento
        monitorarBotaoOtimizar(botao);
    }
    
    /**
     * Monitorar botão de otimizar
     */
    function monitorarBotaoOtimizar(botao) {
        if (botaoOtimizarMonitorado) return;
        
        console.log('[PrimeiraRotaOriginal] Configurando botão de otimizar');
        
        // Salvar handler original
        const handlerOriginal = botao.onclick;
        
        // Substituir por nosso handler
        botao.onclick = function(e) {
            console.log('[PrimeiraRotaOriginal] Botão de otimizar clicado');
            
            // Impedir a execução padrão imediatamente para garantir nossa prioridade
            e.preventDefault();
            e.stopPropagation();
                
            // Se for a primeira otimização, usar ordem original
            if (primeiraOtimizacao) {
                console.log('[PrimeiraRotaOriginal] Primeira otimização, usando ordem original');
                
                // Capturar destinos atuais
                const destinos = obterDestinosAtuais();
                
                if (destinos.length > 0) {
                    // Calcular rota na ordem original IMEDIATAMENTE
                    calcularRotaNaOrdemOriginal(destinos);
                    
                    // Marcar como processado
                    primeiraOtimizacao = false;
                    
                    // Selecionar o tipo "Rota Personalizada" se disponível
                    setTimeout(selecionarTipoRotaPersonalizada, 1000);
                    
                    console.log('[PrimeiraRotaOriginal] Primeira otimização processada');
                    
                    // Executar handler original com atraso para não sobrescrever nossa rota
                    setTimeout(() => {
                        if (typeof handlerOriginal === 'function') {
                            try {
                                // Executar usando um novo evento para evitar problemas
                                const novoEvento = new Event('click');
                                handlerOriginal.call(this, novoEvento);
                            } catch (err) {
                                console.error('[PrimeiraRotaOriginal] Erro ao executar handler original:', err);
                            }
                        }
                    }, 1500);
                    
                    return false;
                }
            }
            
            // Se não é a primeira otimização, executar comportamento padrão
            if (typeof handlerOriginal === 'function') {
                try {
                    handlerOriginal.call(this, e);
                } catch (err) {
                    console.error('[PrimeiraRotaOriginal] Erro ao executar handler original:', err);
                }
            }
            
            return false;
        };
        
        // Marcar como monitorado
        botaoOtimizarMonitorado = true;
    }
    
    /**
     * Selecionar o tipo "Rota Personalizada" nas alternativas
     */
    function selecionarTipoRotaPersonalizada() {
        console.log('[PrimeiraRotaOriginal] Tentando selecionar rota personalizada');
        
        // Encontrar container das rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                          document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[PrimeiraRotaOriginal] Container de rotas alternativas não encontrado');
            return;
        }
        
        // Procurar por um card que mencione "personalizada"
        const cards = container.querySelectorAll('.route-option-card, .route-card, [class*="route-option"]');
        
        for (const card of cards) {
            if (card.textContent.toLowerCase().includes('personalizada')) {
                // Encontramos o card da rota personalizada
                console.log('[PrimeiraRotaOriginal] Card de rota personalizada encontrado');
                
                // Simular clique
                try {
                    card.click();
                    console.log('[PrimeiraRotaOriginal] Rota personalizada selecionada');
                    return;
                } catch (e) {
                    console.error('[PrimeiraRotaOriginal] Erro ao selecionar rota personalizada:', e);
                }
            }
        }
        
        console.log('[PrimeiraRotaOriginal] Card de rota personalizada não encontrado');
    }
    
    /**
     * Obter destinos atuais do painel
     */
    function obterDestinosAtuais() {
        const destinos = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[PrimeiraRotaOriginal] Container de destinos não encontrado');
            return destinos;
        }
        
        // Obter todos os itens (exceto origem)
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        // Processar cada item para extrair informação de localização
        items.forEach(item => {
            // Tentar extrair lat/lng dos dados do elemento
            let lat = null, lng = null;
            
            // Verificar atributos data
            if (item.dataset.lat && item.dataset.lng) {
                lat = parseFloat(item.dataset.lat);
                lng = parseFloat(item.dataset.lng);
            } else if (item.getAttribute('data-lat') && item.getAttribute('data-lng')) {
                lat = parseFloat(item.getAttribute('data-lat'));
                lng = parseFloat(item.getAttribute('data-lng'));
            }
            
            // Se não conseguir, tenta buscar dentro do HTML por coordenadas
            if (!lat || !lng) {
                const coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
                const matches = item.innerHTML.match(coordRegex);
                
                if (matches && matches.length >= 3) {
                    lat = parseFloat(matches[1]);
                    lng = parseFloat(matches[2]);
                }
            }
            
            // Se encontrou coordenadas, adicionar ao array
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                destinos.push({
                    lat: lat,
                    lng: lng,
                    nome: item.textContent.trim()
                });
            }
        });
        
        return destinos;
    }
    
    /**
     * Calcular rota na ordem original (como adicionado)
     */
    function calcularRotaNaOrdemOriginal(destinos) {
        console.log('[PrimeiraRotaOriginal] Calculando rota na ordem original para', destinos.length, 'destinos');
        
        // Localização de Dois Córregos
        const origemDoisCorregosSP = { lat: -22.3731, lng: -48.3796 };
        
        // Encontrar mapa
        const mapa = encontrarMapa();
        
        if (!mapa) {
            console.error('[PrimeiraRotaOriginal] Mapa não encontrado');
            return;
        }
        
        // Configurar serviços do Google Maps
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: mapa,
            suppressMarkers: false
        });
        
        // Se tem destinos, calcular rota
        if (destinos.length > 0) {
            // Preparar waypoints
            const waypoints = destinos.slice(0, -1).map(destino => ({
                location: new google.maps.LatLng(destino.lat, destino.lng),
                stopover: true
            }));
            
            // Último destino
            const ultimoDestino = destinos[destinos.length - 1];
            
            // Solicitar rota na ordem original (NÃO OTIMIZADA)
            directionsService.route({
                origin: new google.maps.LatLng(origemDoisCorregosSP.lat, origemDoisCorregosSP.lng),
                destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
                waypoints: waypoints,
                optimizeWaypoints: false,  // IMPORTANTE: NÃO OTIMIZAR
                travelMode: google.maps.TravelMode.DRIVING
            }, function(result, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    console.log('[PrimeiraRotaOriginal] Rota na ordem original calculada com sucesso');
                    directionsRenderer.setDirections(result);
                    
                    // Salvar globalmente para que outros scripts possam acessar
                    window.directionsResultOriginal = result;
                    
                    // Salvar no renderer global, se existir
                    if (window.directionsRenderer) {
                        try {
                            window.directionsRenderer.setDirections(result);
                        } catch (e) {
                            console.error('[PrimeiraRotaOriginal] Erro ao definir directions no renderer global:', e);
                        }
                    }
                } else {
                    console.error('[PrimeiraRotaOriginal] Erro ao calcular rota na ordem original:', status);
                }
            });
        }
    }
    
    /**
     * Encontrar instância do mapa
     */
    function encontrarMapa() {
        // Verificar se já existe um mapa global salvo
        if (window.map instanceof google.maps.Map) {
            return window.map;
        }
        
        // Procurar por instâncias do mapa no objeto window
        for (const prop in window) {
            try {
                if (window[prop] instanceof google.maps.Map) {
                    window.map = window[prop]; // Salvar referência
                    return window.map;
                }
            } catch (e) {}
        }
        
        return null;
    }
})();