/**
 * Script para FORÇAR a primeira rota a ser na ordem original (não otimizada)
 * Esta versão usa uma abordagem mais agressiva que substitui completamente o comportamento do botão
 */
(function() {
    console.log('[ForçaOrdemOriginal] Inicializando...');
    
    // Capturar eventos iniciais
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    
    // Também tentar inicializar imediatamente
    inicializar();
    
    // E com intervalos crescentes para garantir
    setTimeout(inicializar, 100);
    setTimeout(inicializar, 500);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    // Flag para controlar se já processamos o primeiro clique
    let primeiroCliqueProcessado = false;
    let botaoConfigurado = false;
    
    /**
     * Inicializar o sistema
     */
    function inicializar() {
        if (botaoConfigurado) return;
        
        console.log('[ForçaOrdemOriginal] Tentando inicializar...');
        
        // Encontrar o botão de otimizar
        const botao = document.getElementById('optimize-route');
        
        if (!botao) {
            console.log('[ForçaOrdemOriginal] Botão não encontrado, tentando novamente...');
            return;
        }
        
        console.log('[ForçaOrdemOriginal] Botão encontrado, configurando...');
        
        // Salvar o comportamento original
        const comportamentoOriginal = botao.onclick;
        
        // SUBSTITUIR COMPLETAMENTE o comportamento
        botao.onclick = function(e) {
            // Bloquear evento para garantir controle total
            e.preventDefault();
            e.stopPropagation();
            
            console.log('[ForçaOrdemOriginal] Botão clicado');
            
            // Se é a primeira vez que clicamos
            if (!primeiroCliqueProcessado) {
                console.log('[ForçaOrdemOriginal] Processando primeiro clique');
                
                // Capturar destinos
                const destinos = obterDestinosAtuais();
                
                if (destinos.length > 0) {
                    // Desenhar rota em ordem original (NÃO OTIMIZADA)
                    calcularEDesenharRotaOriginal(destinos);
                    
                    // Marcar como processado
                    primeiroCliqueProcessado = true;
                    
                    console.log('[ForçaOrdemOriginal] Primeiro clique processado');
                    return false;
                }
            }
            
            // Se não é o primeiro clique, executar comportamento padrão
            console.log('[ForçaOrdemOriginal] Executando comportamento padrão');
            
            if (typeof comportamentoOriginal === 'function') {
                try {
                    // Criar novo evento para evitar problemas
                    const novoEvento = new Event('click');
                    return comportamentoOriginal.call(this, novoEvento);
                } catch (err) {
                    console.error('[ForçaOrdemOriginal] Erro ao executar comportamento original:', err);
                }
            }
            
            return false;
        };
        
        botaoConfigurado = true;
        console.log('[ForçaOrdemOriginal] Botão configurado com sucesso');
    }
    
    /**
     * Obter destinos atuais
     */
    function obterDestinosAtuais() {
        console.log('[ForçaOrdemOriginal] Capturando destinos atuais');
        
        const destinos = [];
        
        // Encontrar container de destinos (várias tentativas para garantir)
        const container = document.getElementById('locations-list') || 
                          document.querySelector('.location-list') ||
                          document.querySelector('.locations-container') ||
                          document.querySelector('[id*="location"]') ||
                          document.querySelector('[class*="location"]');
        
        if (!container) {
            console.error('[ForçaOrdemOriginal] Container de destinos não encontrado');
            return destinos;
        }
        
        // Obter todos os itens (exceto origem)
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[ForçaOrdemOriginal] Encontrados', items.length, 'destinos');
        
        // Processar cada item
        items.forEach(item => {
            let lat = null, lng = null;
            
            // Tentar extrair coordenadas de várias formas
            if (item.dataset && item.dataset.lat && item.dataset.lng) {
                lat = parseFloat(item.dataset.lat);
                lng = parseFloat(item.dataset.lng);
            } else if (item.getAttribute('data-lat') && item.getAttribute('data-lng')) {
                lat = parseFloat(item.getAttribute('data-lat'));
                lng = parseFloat(item.getAttribute('data-lng'));
            } else {
                // Buscar por coordenadas no conteúdo HTML
                const regex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
                const matches = item.innerHTML.match(regex);
                
                if (matches && matches.length >= 3) {
                    lat = parseFloat(matches[1]);
                    lng = parseFloat(matches[2]);
                }
            }
            
            // Se encontrou coordenadas válidas
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                destinos.push({
                    lat: lat,
                    lng: lng,
                    nome: item.textContent.trim()
                });
                console.log('[ForçaOrdemOriginal] Destino adicionado:', lat, lng);
            } else {
                console.warn('[ForçaOrdemOriginal] Não foi possível extrair coordenadas do item:', item.textContent);
            }
        });
        
        return destinos;
    }
    
    /**
     * Calcular e desenhar rota original
     */
    function calcularEDesenharRotaOriginal(destinos) {
        console.log('[ForçaOrdemOriginal] Calculando rota para', destinos.length, 'destinos');
        
        // Verificar se temos o mínimo necessário
        if (destinos.length === 0) {
            console.error('[ForçaOrdemOriginal] Sem destinos para calcular rota');
            return;
        }
        
        // Origem (Dois Córregos-SP)
        const origem = { lat: -22.3731, lng: -48.3796 };
        
        // Encontrar o mapa
        const mapa = encontrarMapa();
        
        if (!mapa) {
            console.error('[ForçaOrdemOriginal] Mapa não encontrado');
            return;
        }
        
        console.log('[ForçaOrdemOriginal] Mapa encontrado, configurando serviços');
        
        // Remover rotas existentes para limpar o mapa
        limparRotas();
        
        // Configurar serviços do Google Maps
        const servicoDirecoes = new google.maps.DirectionsService();
        
        // Criar um renderizador dedicado para nossa rota
        const renderizadorDirecoes = new google.maps.DirectionsRenderer({
            map: mapa,
            suppressMarkers: false,
            preserveViewport: false
        });
        
        // Salvar globalmente para acessar depois
        window.renderizadorOriginal = renderizadorDirecoes;
        
        // Preparar waypoints
        const waypoints = destinos.slice(0, -1).map(destino => ({
            location: new google.maps.LatLng(destino.lat, destino.lng),
            stopover: true
        }));
        
        // Último destino
        const ultimoDestino = destinos[destinos.length - 1];
        
        console.log('[ForçaOrdemOriginal] Solicitando rota não otimizada');
        
        // Solicitar cálculo da rota (ordem original, não otimizada)
        servicoDirecoes.route({
            origin: new google.maps.LatLng(origem.lat, origem.lng),
            destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
            waypoints: waypoints,
            optimizeWaypoints: false, // NÃO OTIMIZAR! PRESERVAR ORDEM ORIGINAL
            travelMode: google.maps.TravelMode.DRIVING
        }, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[ForçaOrdemOriginal] Rota calculada com sucesso, exibindo no mapa');
                
                // Mostrar no mapa
                renderizadorDirecoes.setDirections(result);
                
                // Salvar resultado globalmente
                window.resultadoRotaOriginal = result;
                
                // Atualizar painel com informações da rota
                atualizarInformacoesDaRota(result);
                
                // Tentar selecionar rota personalizada nos cards
                setTimeout(selecionarRotaPersonalizada, 1000);
            } else {
                console.error('[ForçaOrdemOriginal] Erro ao calcular rota:', status);
            }
        });
    }
    
    /**
     * Atualizar informações da rota no painel
     */
    function atualizarInformacoesDaRota(resultado) {
        if (!resultado || !resultado.routes || !resultado.routes[0]) {
            return;
        }
        
        console.log('[ForçaOrdemOriginal] Atualizando informações da rota');
        
        // Extrair informações
        const rota = resultado.routes[0];
        const legs = rota.legs || [];
        
        // Calcular distância total
        let distanciaTotal = 0;
        let duracaoTotal = 0;
        
        legs.forEach(leg => {
            if (leg.distance) distanciaTotal += leg.distance.value;
            if (leg.duration) duracaoTotal += leg.duration.value;
        });
        
        // Converter para km e horas
        const distanciaKm = (distanciaTotal / 1000).toFixed(1);
        const duracaoHoras = Math.floor(duracaoTotal / 3600);
        const duracaoMinutos = Math.floor((duracaoTotal % 3600) / 60);
        
        console.log(`[ForçaOrdemOriginal] Distância: ${distanciaKm}km, Tempo: ${duracaoHoras}h${duracaoMinutos}min`);
    }
    
    /**
     * Selecionar a rota personalizada nos cards de alternativas
     */
    function selecionarRotaPersonalizada() {
        console.log('[ForçaOrdemOriginal] Procurando card de rota personalizada');
        
        // Procurar container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                          document.querySelector('[class*="alternative-routes"]') ||
                          document.querySelector('[id*="alternative-routes"]');
        
        if (!container) {
            console.log('[ForçaOrdemOriginal] Container de rotas alternativas não encontrado');
            return;
        }
        
        // Procurar cards
        const cards = container.querySelectorAll('.route-option-card, .route-card, [class*="route-option"]');
        
        if (cards.length === 0) {
            console.log('[ForçaOrdemOriginal] Nenhum card de rota encontrado');
            return;
        }
        
        console.log('[ForçaOrdemOriginal] Encontrados', cards.length, 'cards de rota');
        
        // Procurar card que mencione "personalizada"
        for (const card of cards) {
            if (card.textContent.toLowerCase().includes('personalizada')) {
                console.log('[ForçaOrdemOriginal] Card de rota personalizada encontrado, selecionando');
                
                // Tentar clicar
                try {
                    card.click();
                    console.log('[ForçaOrdemOriginal] Rota personalizada selecionada com sucesso');
                } catch (e) {
                    console.error('[ForçaOrdemOriginal] Erro ao clicar no card:', e);
                }
                
                return;
            }
        }
        
        console.log('[ForçaOrdemOriginal] Nenhum card de rota personalizada encontrado');
    }
    
    /**
     * Limpar rotas existentes no mapa
     */
    function limparRotas() {
        try {
            // Verificar se existe um renderer global
            if (window.directionsRenderer) {
                window.directionsRenderer.setMap(null);
            }
            
            // Limpar todos os possíveis renderers
            for (const prop in window) {
                try {
                    if (window[prop] instanceof google.maps.DirectionsRenderer) {
                        window[prop].setMap(null);
                    }
                } catch (e) {}
            }
        } catch (e) {
            console.error('[ForçaOrdemOriginal] Erro ao limpar rotas:', e);
        }
    }
    
    /**
     * Encontrar instância do mapa
     */
    function encontrarMapa() {
        // Verificar se já temos mapa global
        if (window.map instanceof google.maps.Map) {
            return window.map;
        }
        
        // Procurar em todas as propriedades do window
        for (const prop in window) {
            try {
                if (window[prop] instanceof google.maps.Map) {
                    // Salvar referência global
                    window.map = window[prop];
                    return window.map;
                }
            } catch (e) {}
        }
        
        // Se ainda não encontrou, tentar obter elemento e criar novo mapa
        const mapElement = document.getElementById('map') || 
                           document.querySelector('.map') || 
                           document.querySelector('[id*="map"]');
        
        if (mapElement) {
            try {
                const novoMapa = new google.maps.Map(mapElement, {
                    center: { lat: -22.3731, lng: -48.3796 }, // Dois Córregos
                    zoom: 8
                });
                
                window.map = novoMapa;
                return novoMapa;
            } catch (e) {
                console.error('[ForçaOrdemOriginal] Erro ao criar novo mapa:', e);
            }
        }
        
        return null;
    }
})();