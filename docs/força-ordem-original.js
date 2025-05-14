/**
 * Script para FORÇAR a primeira rota a ser na ordem original (não otimizada)
 * Esta versão usa uma abordagem mais agressiva que substitui completamente o comportamento do botão
 */
(function() {
    // Usar 'var' em vez de 'let' para garantir hoisting correto
    var primeiroCliqueProcessado = false;
    var botaoConfigurado = false;
    var scriptCarregado = false;
    
    console.log('[ForçaOrdemOriginal] Inicializando...');
    
    // Funções principais
    function inicializar() {
        if (scriptCarregado) return;
        scriptCarregado = true;
        
        console.log('[ForçaOrdemOriginal] Iniciando configuração...');
        
        // Instalar monitoramento do botão assim que o DOM estiver pronto
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(configurarBotao, 100);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(configurarBotao, 100);
            });
        }
        
        // Também tentar após um tempo
        setTimeout(configurarBotao, 500);
        setTimeout(configurarBotao, 1000);
        setTimeout(configurarBotao, 2000);
    }
    
    function configurarBotao() {
        if (botaoConfigurado) return;
        
        var botao = document.getElementById('optimize-route');
        
        if (!botao) {
            console.log('[ForçaOrdemOriginal] Botão não encontrado, tentando novamente...');
            return;
        }
        
        console.log('[ForçaOrdemOriginal] Botão encontrado, configurando...');
        
        // Salvar handler original
        var handlerOriginal = botao.onclick;
        
        // Substituir por nosso handler
        botao.onclick = function(e) {
            // Prevenir comportamento padrão
            e.preventDefault();
            e.stopPropagation();
            
            console.log('[ForçaOrdemOriginal] Botão clicado');
            
            // Se é o primeiro clique
            if (!primeiroCliqueProcessado) {
                console.log('[ForçaOrdemOriginal] Processando primeiro clique');
                
                // Capturar destinos
                var destinos = obterDestinosAtuais();
                
                if (destinos.length > 0) {
                    // Calcular rota não otimizada (original)
                    calcularEDesenharRotaOriginal(destinos);
                    
                    // Marcar como processado
                    primeiroCliqueProcessado = true;
                    
                    // Tentar selecionar o card de rota personalizada
                    setTimeout(selecionarRotaPersonalizada, 1000);
                    
                    return false;
                }
            }
            
            // Para cliques subsequentes, usar comportamento original
            if (typeof handlerOriginal === 'function') {
                try {
                    handlerOriginal.call(this, e);
                } catch (err) {
                    console.error('[ForçaOrdemOriginal] Erro ao executar comportamento original:', err);
                }
            }
            
            return false;
        };
        
        botaoConfigurado = true;
        console.log('[ForçaOrdemOriginal] Botão configurado com sucesso');
    }
    
    function obterDestinosAtuais() {
        console.log('[ForçaOrdemOriginal] Obtendo destinos atuais');
        
        var destinos = [];
        
        // Encontrar container
        var container = document.getElementById('locations-list') || 
                        document.querySelector('.location-list') ||
                        document.querySelector('.locations-container') ||
                        document.querySelector('[id*="location"]') ||
                        document.querySelector('[class*="location"]');
        
        if (!container) {
            console.error('[ForçaOrdemOriginal] Container de destinos não encontrado');
            return destinos;
        }
        
        // Obter itens (exceto origem)
        var items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[ForçaOrdemOriginal] Encontrados', items.length, 'destinos');
        
        // Extrair para cada item
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var lat = null, lng = null;
            
            // Tentar extrair coordenadas
            if (item.dataset && item.dataset.lat && item.dataset.lng) {
                lat = parseFloat(item.dataset.lat);
                lng = parseFloat(item.dataset.lng);
            } else if (item.getAttribute('data-lat') && item.getAttribute('data-lng')) {
                lat = parseFloat(item.getAttribute('data-lat'));
                lng = parseFloat(item.getAttribute('data-lng'));
            } else {
                // Buscar por coordenadas no conteúdo
                var coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
                var matches = item.innerHTML.match(coordRegex);
                
                if (matches && matches.length >= 3) {
                    lat = parseFloat(matches[1]);
                    lng = parseFloat(matches[2]);
                }
            }
            
            // Se tem coordenadas válidas
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                destinos.push({
                    lat: lat,
                    lng: lng,
                    nome: item.textContent.trim()
                });
                console.log('[ForçaOrdemOriginal] Destino adicionado:', lat, lng);
            }
        }
        
        return destinos;
    }
    
    function calcularEDesenharRotaOriginal(destinos) {
        if (!destinos || destinos.length === 0) {
            console.error('[ForçaOrdemOriginal] Sem destinos para calcular');
            return;
        }
        
        console.log('[ForçaOrdemOriginal] Calculando rota para', destinos.length, 'destinos');
        
        // Origem (Dois Córregos-SP)
        var origem = { lat: -22.3731, lng: -48.3796 };
        
        // Encontrar mapa
        var mapa = encontrarMapa();
        
        if (!mapa) {
            console.error('[ForçaOrdemOriginal] Mapa não encontrado');
            return;
        }
        
        // Limpar rotas existentes
        limparRotas();
        
        // Criar serviços
        var servicoDirecoes = new google.maps.DirectionsService();
        var renderizador = new google.maps.DirectionsRenderer({
            map: mapa,
            suppressMarkers: false
        });
        
        // Guardar referência global
        window.renderizadorOriginal = renderizador;
        
        // Preparar waypoints
        var waypoints = [];
        for (var i = 0; i < destinos.length - 1; i++) {
            waypoints.push({
                location: new google.maps.LatLng(destinos[i].lat, destinos[i].lng),
                stopover: true
            });
        }
        
        // Último destino
        var ultimoDestino = destinos[destinos.length - 1];
        
        // Solicitar rota
        servicoDirecoes.route({
            origin: new google.maps.LatLng(origem.lat, origem.lng),
            destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
            waypoints: waypoints,
            optimizeWaypoints: false, // NÃO OTIMIZAR!
            travelMode: google.maps.TravelMode.DRIVING
        }, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[ForçaOrdemOriginal] Rota calculada com sucesso');
                
                // Mostrar no mapa
                renderizador.setDirections(result);
                
                // Salvar resultado
                window.resultadoRotaOriginal = result;
                
                // Tentar atualizar renderer global
                if (window.directionsRenderer) {
                    try {
                        window.directionsRenderer.setDirections(result);
                    } catch (e) {
                        console.error('[ForçaOrdemOriginal] Erro ao atualizar renderer global:', e);
                    }
                }
                
                // Atualizar informações
                atualizarInformacoesDaRota(result);
            } else {
                console.error('[ForçaOrdemOriginal] Erro ao calcular rota:', status);
            }
        });
    }
    
    function limparRotas() {
        try {
            // Limpar renderer global
            if (window.directionsRenderer) {
                window.directionsRenderer.setMap(null);
            }
            
            // Limpar outros renderers
            for (var prop in window) {
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
    
    function atualizarInformacoesDaRota(resultado) {
        if (!resultado || !resultado.routes || !resultado.routes[0]) return;
        
        var rota = resultado.routes[0];
        var legs = rota.legs || [];
        
        // Calcular totais
        var distanciaTotal = 0;
        var duracaoTotal = 0;
        
        for (var i = 0; i < legs.length; i++) {
            var leg = legs[i];
            if (leg.distance) distanciaTotal += leg.distance.value;
            if (leg.duration) duracaoTotal += leg.duration.value;
        }
        
        // Converter para km e horas
        var distanciaKm = (distanciaTotal / 1000).toFixed(1);
        var duracaoHoras = Math.floor(duracaoTotal / 3600);
        var duracaoMinutos = Math.floor((duracaoTotal % 3600) / 60);
        
        console.log('[ForçaOrdemOriginal] Distância:', distanciaKm, 'km, Tempo:', duracaoHoras, 'h', duracaoMinutos, 'min');
    }
    
    function selecionarRotaPersonalizada() {
        console.log('[ForçaOrdemOriginal] Procurando card de rota personalizada');
        
        // Procurar container
        var container = document.querySelector('.alternative-routes-section') || 
                        document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[ForçaOrdemOriginal] Container de rotas alternativas não encontrado');
            return;
        }
        
        // Procurar cards
        var cards = container.querySelectorAll('.route-option-card, .route-card, [class*="route-option"]');
        
        if (cards.length === 0) {
            console.log('[ForçaOrdemOriginal] Nenhum card de rota encontrado');
            return;
        }
        
        // Procurar card personalizado
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            if (card.textContent.toLowerCase().includes('personalizada')) {
                console.log('[ForçaOrdemOriginal] Card personalizado encontrado, selecionando');
                
                try {
                    card.click();
                    console.log('[ForçaOrdemOriginal] Card personalizado selecionado');
                } catch (e) {
                    console.error('[ForçaOrdemOriginal] Erro ao selecionar card:', e);
                }
                
                return;
            }
        }
    }
    
    function encontrarMapa() {
        // Verificar referência global
        if (window.map instanceof google.maps.Map) {
            return window.map;
        }
        
        // Procurar no window
        for (var prop in window) {
            try {
                if (window[prop] instanceof google.maps.Map) {
                    window.map = window[prop];
                    return window.map;
                }
            } catch (e) {}
        }
        
        // Tentar criar novo mapa
        var mapElement = document.getElementById('map') || 
                         document.querySelector('.map') || 
                         document.querySelector('[id*="map"]');
        
        if (mapElement) {
            try {
                var novoMapa = new google.maps.Map(mapElement, {
                    center: { lat: -22.3731, lng: -48.3796 },
                    zoom: 8
                });
                
                window.map = novoMapa;
                return novoMapa;
            } catch (e) {
                console.error('[ForçaOrdemOriginal] Erro ao criar mapa:', e);
            }
        }
        
        return null;
    }
    
    // Iniciar agora
    inicializar();
    
    // E em diferentes eventos do DOM
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
})();