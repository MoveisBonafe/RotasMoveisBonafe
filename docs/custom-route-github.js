/**
 * Implementação robusta e independente de rota personalizada para GitHub Pages
 * Esta versão não depende de variáveis globais específicas
 */
(function() {
    console.log('[CustomRouteGitHub] Inicializando solução de rota personalizada...');
    
    // Variáveis do módulo
    let map = null;
    let directionsService = null;
    let directionsRenderer = null;
    let locations = [];
    let currentCustomOrder = [];
    let initialized = false;
    
    // Inicializar quando o documento estiver pronto
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
    setTimeout(init, 1500);
    setTimeout(init, 3000);
    
    // Função de inicialização
    // Corrigir animação de rota
    function fixRouteAnimation() {
        // Procurar pela função de animação original
        const scriptElements = document.getElementsByTagName('script');
        let animateFunction = null;
        
        for (let i = 0; i < scriptElements.length; i++) {
            const content = scriptElements[i].textContent || '';
            if (content.includes('function animateRoute') || content.includes('function animate')) {
                // Encontrou a função de animação
                console.log('[CustomRouteGitHub] Encontrada função de animação de rota');
                
                // Sobrescrever a função original para ser mais resiliente
                window.originalAnimateRoute = window.animateRoute;
                window.animateRoute = function(path) {
                    // Verificar se o path existe
                    if (!path || !path.length) {
                        console.log('[CustomRouteGitHub] Animação de rota chamada sem path válido');
                        return;
                    }
                    
                    // Chamar a função original se existir
                    if (typeof window.originalAnimateRoute === 'function') {
                        try {
                            window.originalAnimateRoute(path);
                        } catch (e) {
                            console.log('[CustomRouteGitHub] Erro ao animar rota:', e);
                        }
                    }
                };
                
                break;
            }
        }
        
        // Monitorar a variável routePath para evitar erros
        let originalRoutePathDescriptor = Object.getOwnPropertyDescriptor(window, 'routePath');
        
        if (!originalRoutePathDescriptor) {
            Object.defineProperty(window, 'routePath', {
                configurable: true,
                get: function() {
                    return window._actualRoutePath || null;
                },
                set: function(newValue) {
                    console.log('[CustomRouteGitHub] routePath sendo definido:', newValue ? 'valor válido' : 'valor inválido');
                    window._actualRoutePath = newValue;
                }
            });
        }
    }
    
    function init() {
        if (initialized) return;
        
        console.log('[CustomRouteGitHub] Iniciando configuração...');
        
        // Verificar se Google Maps está disponível
        if (!window.google || !window.google.maps) {
            console.log('[CustomRouteGitHub] Google Maps não disponível ainda, tentando novamente em breve');
            setTimeout(init, 1000);
            return;
        }
        
        // Adicionar estilos CSS para rotas personalizadas
        addStyles();
        
        // Configurar drag and drop
        setupDragDrop();
        
        // Adicionar observadores para novos destinos
        observeNewDestinations();
        
        // Adicionar observador para rotas alternativas
        observeAlternativeRoutes();
        
        // Inicializar serviços do Google Maps
        initGoogleMapsServices();
        
        initialized = true;
        console.log('[CustomRouteGitHub] Inicialização concluída');
        
        // Aplicar correções específicas para animação de rota
        fixRouteAnimation();
    }
    
    // Adicionar estilos CSS
    function addStyles() {
        if (document.getElementById('custom-route-github-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'custom-route-github-styles';
        styleElement.textContent = `
            .draggable-item {
                cursor: move !important;
                position: relative !important;
                border-left: 3px solid #ffc107 !important;
                padding-left: 30px !important;
                transition: all 0.2s ease;
                background-color: white !important;
            }
            
            .draggable-item::before {
                content: "≡";
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #ffc107;
                font-weight: bold;
                font-size: 18px;
            }
            
            .draggable-item:hover {
                background-color: #FFF8E1 !important;
            }
            
            .dragging {
                opacity: 0.7;
                background-color: #FFF8E1;
                border: 2px dashed #ffc107 !important;
            }
            
            .custom-route-card {
                background-color: #fff8e1 !important;
                border: 2px solid #ffc107 !important;
            }
            
            .custom-route-card.selected {
                background-color: #ffe082 !important;
                border: 2px solid #ffb300 !important;
            }
            
            .custom-route-card::before {
                content: "👆";
                margin-right: 5px;
            }
        `;
        
        document.head.appendChild(styleElement);
        console.log('[CustomRouteGitHub] Estilos adicionados');
    }
    
    // Configurar drag and drop
    function setupDragDrop() {
        console.log('[CustomRouteGitHub] Configurando drag and drop');
        
        // Encontrar container
        const container = document.querySelector('.location-list, #locations-list, [class*="location-container"]');
        
        if (!container) {
            console.log('[CustomRouteGitHub] Container não encontrado, tentando novamente em breve');
            setTimeout(setupDragDrop, 1000);
            return;
        }
        
        // Adicionar eventos ao container
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        
        // Configurar itens existentes
        const items = container.querySelectorAll('li, .location-item');
        items.forEach(setupDraggableItem);
    }
    
    // Configurar item arrastável
    function setupDraggableItem(item) {
        // Ignorar o ponto de origem
        if (item.classList.contains('origin-point')) return;
        
        // Verificar se já está configurado
        if (item.hasAttribute('draggable') && item.classList.contains('draggable-item')) return;
        
        // Adicionar classe e atributos
        item.classList.add('draggable-item');
        item.setAttribute('draggable', 'true');
        
        // Adicionar eventos
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        
        console.log('[CustomRouteGitHub] Item configurado como arrastável');
    }
    
    // Observar novos destinos
    function observeNewDestinations() {
        const container = document.querySelector('.location-list, #locations-list, [class*="location-container"]');
        
        if (!container) {
            console.log('[CustomRouteGitHub] Container não encontrado para observação');
            setTimeout(observeNewDestinations, 1000);
            return;
        }
        
        // Criar e iniciar o observador
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Elemento do DOM
                            if (node.classList.contains('location-item') || node.tagName.toLowerCase() === 'li') {
                                setupDraggableItem(node);
                            } else {
                                const items = node.querySelectorAll('li, .location-item');
                                items.forEach(setupDraggableItem);
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true
        });
        
        console.log('[CustomRouteGitHub] Observador de novos destinos configurado');
    }
    
    // Observar rotas alternativas
    function observeAlternativeRoutes() {
        // Encontrar container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section, .rotas-alternativas');
        
        if (!container) {
            console.log('[CustomRouteGitHub] Container de rotas alternativas não encontrado, tentando novamente em breve');
            setTimeout(observeAlternativeRoutes, 1000);
            return;
        }
        
        // Criar e iniciar o observador
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    if (container.querySelector('.route-option-card')) {
                        addCustomRouteOption();
                    }
                }
            });
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true
        });
        
        console.log('[CustomRouteGitHub] Observador de rotas alternativas configurado');
        
        // Também interceptar evento de clique no botão de otimizar
        const optimizeButton = document.getElementById('optimize-route');
        if (optimizeButton) {
            optimizeButton.addEventListener('click', function() {
                setTimeout(saveCurrentOrder, 100);
            });
        }
    }
    
    // Inicializar serviços do Google Maps
    function initGoogleMapsServices() {
        // Encontrar mapa
        findMap();
        
        // Criar serviços de direções se necessário
        if (!directionsService && window.google && window.google.maps) {
            directionsService = new google.maps.DirectionsService();
            console.log('[CustomRouteGitHub] Serviço de direções criado');
        }
        
        if (map && !directionsRenderer && window.google && window.google.maps) {
            directionsRenderer = new google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: false,
                preserveViewport: true // Preservar a visualização atual do mapa
            });
            console.log('[CustomRouteGitHub] Renderer de direções criado');
            
            // Garantir que o marcador de origem seja mostrado
            setTimeout(function() {
                showOriginMarker();
            }, 500);
        }
        
        // Encontrar localizações
        findLocations();
    }
    
    // Encontrar mapa
    function findMap() {
        // Verificar variáveis globais comuns
        if (window.map instanceof google.maps.Map) {
            map = window.map;
            console.log('[CustomRouteGitHub] Mapa encontrado na variável global window.map');
            return;
        }
        
        // Verificar outras variáveis globais
        for (const key in window) {
            try {
                if (window[key] instanceof google.maps.Map) {
                    map = window[key];
                    console.log('[CustomRouteGitHub] Mapa encontrado na variável:', key);
                    return;
                }
            } catch (e) {
                // Ignorar erros
            }
        }
        
        // Buscar pelo DOM
        const mapElements = document.querySelectorAll('.gm-style');
        if (mapElements.length > 0) {
            const container = mapElements[0].closest('[id$=map], [id*=map], [class$=map], [class*=map]');
            if (container && container.__gm && container.__gm.map) {
                map = container.__gm.map;
                console.log('[CustomRouteGitHub] Mapa encontrado pelo container do DOM');
                return;
            }
        }
        
        // Criar novo mapa
        const mapElement = document.getElementById('map') || 
                       document.querySelector('.map-container') || 
                       document.querySelector('[id$=map]');
                       
        if (mapElement) {
            map = new google.maps.Map(mapElement, {
                center: { lat: -22.3731, lng: -48.3796 }, // Dois Córregos-SP
                zoom: 8
            });
            console.log('[CustomRouteGitHub] Novo mapa criado');
        } else {
            console.log('[CustomRouteGitHub] Elemento do mapa não encontrado');
        }
    }
    
    // Mostrar marcador de origem
    function showOriginMarker() {
        // Encontrar mapa e origem
        if (!map) findMap();
        
        // Verificar se origem já existe
        let existingMarker = null;
        
        // Verificar se já existe um marcador global de origem
        if (window.originMarker && window.originMarker instanceof google.maps.Marker) {
            existingMarker = window.originMarker;
        }
        
        // Encontrar coordenadas da origem
        findLocations();
        let origin = locations.find(loc => loc.isOrigin);
        
        if (!origin && locations.length > 0) {
            // Se não encontrou origem específica, usar primeiro elemento
            origin = locations[0];
        }
        
        if (!origin) {
            // Usar coordenadas padrão de Dois Córregos-SP
            origin = {
                lat: -22.3731,
                lng: -48.3796,
                name: 'Dois Córregos'
            };
        }
        
        // Se já existe marcador, atualizar posição
        if (existingMarker) {
            existingMarker.setPosition(new google.maps.LatLng(origin.lat, origin.lng));
            existingMarker.setMap(map);
            console.log('[CustomRouteGitHub] Marcador de origem existente restaurado');
            return;
        }
        
        // Criar ícone padrão
        const icon = {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 40)
        };
        
        // Criar marcador
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(origin.lat, origin.lng),
            map: map,
            icon: icon,
            title: origin.name || 'Origem',
            zIndex: 1000
        });
        
        // Guardar globalmente para referência futura
        window.originMarker = marker;
        
        console.log('[CustomRouteGitHub] Marcador de origem criado');
    }
    
    // Encontrar localizações
    function findLocations() {
        // Verificar variáveis globais comuns
        if (window.locations && Array.isArray(window.locations) && window.locations.length > 0) {
            locations = window.locations;
            console.log('[CustomRouteGitHub] Localizações encontradas em window.locations');
            return;
        }
        
        // Verificar outras variáveis
        const possibleArrays = ['locationsData', 'waypoints', 'points', 'destinations'];
        
        for (const arrayName of possibleArrays) {
            if (window[arrayName] && Array.isArray(window[arrayName]) && window[arrayName].length > 0) {
                locations = window[arrayName];
                console.log('[CustomRouteGitHub] Localizações encontradas em:', arrayName);
                return;
            }
        }
        
        // Se ainda não encontrou, tentar extrair do DOM
        locations = extractLocationsFromDOM();
        
        if (locations.length > 0) {
            console.log('[CustomRouteGitHub] Localizações extraídas do DOM:', locations.length);
        } else {
            console.log('[CustomRouteGitHub] Não foi possível encontrar localizações');
        }
    }
    
    // Extrair localizações do DOM
    function extractLocationsFromDOM() {
        const result = [];
        
        // Extrair origem
        const origin = document.querySelector('.origin-point');
        if (origin) {
            result.push({
                id: 'origin',
                name: origin.textContent.trim(),
                lat: -22.3731, // Coordenadas de Dois Córregos-SP
                lng: -48.3796,
                isOrigin: true
            });
        }
        
        // Extrair destinos
        const destinationItems = document.querySelectorAll('.location-item:not(.origin-point), li:not(.origin-point)');
        
        destinationItems.forEach((item, index) => {
            // Tentar extrair coordenadas de data-attributes
            let lat = parseFloat(item.getAttribute('data-lat') || '0');
            let lng = parseFloat(item.getAttribute('data-lng') || '0');
            
            // Se não há coordenadas, usar posição aproximada
            if (!lat || !lng) {
                // Usar posições aproximadas em torno de Dois Córregos
                const radius = 0.5;
                const angle = (index / destinationItems.length) * Math.PI * 2;
                lat = -22.3731 + Math.cos(angle) * radius;
                lng = -48.3796 + Math.sin(angle) * radius;
            }
            
            result.push({
                id: item.getAttribute('data-id') || `destination-${index}`,
                name: item.textContent.trim(),
                lat: lat,
                lng: lng,
                isOrigin: false
            });
        });
        
        return result;
    }
    
    // Salvar ordem atual
    function saveCurrentOrder() {
        currentCustomOrder = [];
        
        const container = document.querySelector('.location-list, #locations-list, [class*="location-container"]');
        if (!container) return;
        
        const items = container.querySelectorAll('.draggable-item, .location-item:not(.origin-point), li:not(.origin-point)');
        
        items.forEach((item, index) => {
            const id = item.getAttribute('data-id') || `item-${index}`;
            const name = item.textContent.trim();
            
            currentCustomOrder.push({
                id: id,
                name: name,
                element: item
            });
        });
        
        console.log('[CustomRouteGitHub] Ordem atual salva:', currentCustomOrder.length);
        
        // Adicionar opção de rota personalizada
        setTimeout(addCustomRouteOption, 500);
    }
    
    // Adicionar opção de rota personalizada
    function addCustomRouteOption() {
        if (currentCustomOrder.length === 0) return;
        
        // Verificar se já existe
        if (document.querySelector('.custom-route-card')) return;
        
        const container = document.querySelector('.alternative-routes-section, .rotas-alternativas');
        if (!container) return;
        
        // Calcular distância aproximada
        const distance = calculateApproximateDistance();
        
        // Criar card
        const card = document.createElement('div');
        card.className = 'route-option-card custom-route-card';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>Rota Personalizada</h6>
                    <p class="mb-0">Mantém exatamente a ordem que você definiu</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-warning text-dark">${distance} km</span>
                </div>
            </div>
        `;
        
        // Adicionar evento
        card.addEventListener('click', function() {
            const cards = container.querySelectorAll('.route-option-card');
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            calculateCustomRoute();
        });
        
        // Inserir no container
        const title = container.querySelector('h5, .route-options-title');
        if (title && title.nextSibling) {
            container.insertBefore(card, title.nextSibling);
        } else {
            container.appendChild(card);
        }
        
        console.log('[CustomRouteGitHub] Opção de rota personalizada adicionada');
    }
    
    // Calcular distância aproximada
    function calculateApproximateDistance() {
        findLocations(); // Atualizar localizações
        
        if (locations.length < 2) return "?";
        
        // Encontrar origem
        const origin = locations.find(loc => loc.isOrigin);
        if (!origin) return "?";
        
        // Ordenar pontos seguindo currentCustomOrder
        const orderedPoints = [origin];
        
        for (const item of currentCustomOrder) {
            const point = locations.find(loc => !loc.isOrigin && String(loc.id) === String(item.id));
            if (point) {
                orderedPoints.push(point);
            }
        }
        
        // Adicionar pontos restantes que não estão em currentCustomOrder
        for (const loc of locations) {
            if (!loc.isOrigin && !orderedPoints.includes(loc)) {
                orderedPoints.push(loc);
            }
        }
        
        // Calcular distância total
        let totalDistance = 0;
        for (let i = 0; i < orderedPoints.length - 1; i++) {
            const p1 = orderedPoints[i];
            const p2 = orderedPoints[i + 1];
            
            totalDistance += calculateHaversineDistance(
                p1.lat, p1.lng,
                p2.lat, p2.lng
            );
        }
        
        return totalDistance.toFixed(1);
    }
    
    // Calcular distância de Haversine
    function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        
        return d;
    }
    
    // Converter para radianos
    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    // Calcular rota personalizada
    function calculateCustomRoute() {
        console.log('[CustomRouteGitHub] Calculando rota personalizada');
        
        // Verificar requisitos
        if (!map) {
            findMap();
            if (!map) {
                console.error('[CustomRouteGitHub] Mapa não encontrado');
                alert('Erro: Mapa não disponível.');
                return;
            }
        }
        
        if (!directionsService) {
            directionsService = new google.maps.DirectionsService();
        }
        
        if (!directionsRenderer) {
            directionsRenderer = new google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: false
            });
        }
        
        // Atualizar localizações
        findLocations();
        
        if (locations.length < 2) {
            console.error('[CustomRouteGitHub] Localizações insuficientes');
            alert('Erro: Necessário pelo menos um destino além da origem.');
            return;
        }
        
        // Mostrar spinner se existir
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'block';
        
        // Construir waypoints
        const orderedPoints = [];
        
        // Adicionar origem
        const origin = locations.find(loc => loc.isOrigin);
        if (origin) {
            orderedPoints.push(origin);
        } else if (locations.length > 0) {
            // Usar primeiro ponto como origem
            orderedPoints.push(locations[0]);
        } else {
            console.error('[CustomRouteGitHub] Não foi possível encontrar a origem');
            if (spinner) spinner.style.display = 'none';
            alert('Erro: Origem não encontrada');
            return;
        }
        
        // Adicionar destinos na ordem personalizada
        for (const item of currentCustomOrder) {
            const point = locations.find(loc => !loc.isOrigin && String(loc.id) === String(item.id));
            if (point) {
                orderedPoints.push(point);
            }
        }
        
        // Configurar request
        const request = {
            origin: new google.maps.LatLng(orderedPoints[0].lat, orderedPoints[0].lng),
            destination: new google.maps.LatLng(orderedPoints[orderedPoints.length - 1].lat, orderedPoints[orderedPoints.length - 1].lng),
            waypoints: orderedPoints.slice(1, -1).map(wp => ({
                location: new google.maps.LatLng(wp.lat, wp.lng),
                stopover: true
            })),
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        // Chamar serviço de direções
        directionsService.route(request, function(result, status) {
            // Esconder spinner
            if (spinner) spinner.style.display = 'none';
            
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[CustomRouteGitHub] Rota personalizada calculada com sucesso');
                
                // Exibir no mapa
                directionsRenderer.setDirections(result);
                
                // Desativar temporariamente a animação de rota original para evitar conflitos
                if (window.routePath) {
                    console.log('[CustomRouteGitHub] Preservando variável routePath para evitar erros de animação');
                    // Guardar temporariamente
                    window._tempRoutePath = window.routePath;
                    // Criar um falso path para a animação não falhar
                    window.routePath = result.routes[0].overview_path || [];
                }
                
                // Garantir que o marcador de origem seja visível
                setTimeout(function() {
                    showOriginMarker();
                }, 500);
                
                // Atualizar informações da rota
                updateRouteInfo(result, orderedPoints);
            } else {
                console.error('[CustomRouteGitHub] Erro ao calcular rota:', status);
                alert('Erro ao calcular a rota. Por favor, tente novamente.');
            }
        });
    }
    
    // Atualizar informações da rota
    function updateRouteInfo(result, points) {
        if (!result || !result.routes || !result.routes[0] || !result.routes[0].legs) return;
        
        // Calcular totais
        const legs = result.routes[0].legs;
        let totalDistance = 0;
        let totalDuration = 0;
        
        for (const leg of legs) {
            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
        }
        
        // Converter para unidades amigáveis
        const distanceKm = (totalDistance / 1000).toFixed(1);
        const durationMinutes = Math.round(totalDuration / 60);
        
        // Encontrar e atualizar container de informações
        const routeInfo = document.getElementById('route-info');
        if (!routeInfo) return;
        
        // Mostrar container
        routeInfo.style.display = 'block';
        
        // Atualizar detalhes
        const routeDetails = document.getElementById('route-details');
        if (routeDetails) {
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            
            routeDetails.innerHTML = `
                <p><strong>Distância Total:</strong> ${distanceKm} km</p>
                <p><strong>Tempo Estimado:</strong> ${hours > 0 ? `${hours}h ` : ''}${minutes}min</p>
                <p><strong>Velocidade Média:</strong> 80 km/h</p>
                <p><strong>Ordem:</strong> Personalizada</p>
            `;
        }
        
        // Atualizar sequência
        const routeSequence = document.getElementById('route-sequence');
        if (routeSequence) {
            routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
            
            points.forEach((point, index) => {
                const item = document.createElement('div');
                item.className = 'sequence-item';
                
                item.innerHTML = `
                    <span class="sequence-number">${index}</span>
                    <span class="sequence-name">${point.name}</span>
                `;
                
                routeSequence.appendChild(item);
            });
        }
        
        // Notificar usuário
        console.log('[CustomRouteGitHub] Rota calculada e atualizada com sucesso');
        
        // Mostrar notificação se possível
        if (typeof showNotification === 'function') {
            showNotification('Rota personalizada calculada com sucesso!', 'success');
        }
    }
    
    // Manipuladores de eventos para drag and drop
    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
    }
    
    function handleDragEnd(e) {
        this.classList.remove('dragging');
        saveCurrentOrder();
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;
        
        const afterElement = getDragAfterElement(this, e.clientY);
        
        if (afterElement) {
            this.insertBefore(draggingElement, afterElement);
        } else {
            this.appendChild(draggingElement);
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        saveCurrentOrder();
    }
    
    // Obter elemento após o qual inserir
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
})();