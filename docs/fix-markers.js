/**
 * Script para corrigir problemas com marcadores no mapa
 * Esta é uma solução independente que vai garantir que os marcadores apareçam sempre
 */
(function() {
    console.log('[FixMarkers] Iniciando correção de marcadores...');
    
    // Variáveis do módulo
    let initialized = false;
    let markers = [];
    let map = null;
    
    // Inicializar quando o documento estiver pronto
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
    setTimeout(init, 2000);
    setTimeout(init, 4000);
    
    // Função principal
    function init() {
        if (initialized) return;
        
        console.log('[FixMarkers] Iniciando...');
        
        // Verificar se Google Maps está disponível
        if (!window.google || !window.google.maps) {
            console.log('[FixMarkers] Google Maps não disponível, tentando novamente em breve');
            setTimeout(init, 1000);
            return;
        }
        
        // Encontrar mapa
        findMap();
        
        if (!map) {
            console.log('[FixMarkers] Mapa não encontrado, tentando novamente em breve');
            setTimeout(init, 1000);
            return;
        }
        
        // Sobrescrever função de addMarker se existir
        if (typeof window.addMarker === 'function') {
            console.log('[FixMarkers] Sobrescrevendo função addMarker');
            window.originalAddMarker = window.addMarker;
            window.addMarker = function(location) {
                // Chamar função original
                const result = window.originalAddMarker(location);
                // Adicionar nosso próprio marcador como backup
                addMarkerToMap(location);
                return result;
            };
        }
        
        // Verificar se há localizações para adicionar
        findAndAddLocations();
        
        // Monitorar alterações na lista de localizações
        startLocationMonitoring();
        
        // Corrigir marcadores a cada 5 segundos
        setInterval(checkAndFixMarkers, 5000);
        
        initialized = true;
        console.log('[FixMarkers] Inicialização concluída');
    }
    
    // Encontrar o mapa
    function findMap() {
        // Verificar variável global
        if (window.map instanceof google.maps.Map) {
            map = window.map;
            console.log('[FixMarkers] Mapa encontrado na variável global');
            return;
        }
        
        // Verificar outras variáveis globais
        for (const key in window) {
            try {
                if (window[key] instanceof google.maps.Map) {
                    map = window[key];
                    console.log('[FixMarkers] Mapa encontrado na variável:', key);
                    return;
                }
            } catch (e) {
                // Ignorar erros
            }
        }
        
        // Procurar elementos do mapa no DOM
        const mapElements = document.querySelectorAll('.gm-style');
        if (mapElements.length > 0) {
            const container = mapElements[0].closest('[id$=map], [id*=map], [class$=map], [class*=map]');
            if (container && container.__gm && container.__gm.map) {
                map = container.__gm.map;
                console.log('[FixMarkers] Mapa encontrado pelo container do DOM');
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
            console.log('[FixMarkers] Novo mapa criado');
            
            // Armazenar globalmente
            window.map = map;
        }
    }
    
    // Encontrar e adicionar localizações ao mapa
    function findAndAddLocations() {
        // Verificar diversas fontes possíveis de dados
        const potentialSources = ['locations', 'waypoints', 'locationData', 'points', 'markers'];
        
        // Tentar cada fonte
        for (const source of potentialSources) {
            if (window[source] && Array.isArray(window[source]) && window[source].length > 0) {
                console.log(`[FixMarkers] Localizações encontradas em window.${source}`);
                window[source].forEach(addMarkerToMap);
                return;
            }
        }
        
        // Se não encontrou em variáveis globais, procurar no DOM
        console.log('[FixMarkers] Procurando localizações no DOM');
        extractLocationsFromDOM().forEach(addMarkerToMap);
    }
    
    // Extrair localizações do DOM
    function extractLocationsFromDOM() {
        const locations = [];
        
        // Encontrar origem
        const originElement = document.querySelector('.origin-point');
        if (originElement) {
            locations.push({
                isOrigin: true,
                name: originElement.textContent.trim(),
                lat: -22.3731, // Dois Córregos-SP
                lng: -48.3796
            });
        }
        
        // Encontrar destinos
        const destinationItems = document.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point)');
        
        destinationItems.forEach((item, index) => {
            // Tentar obter coordenadas dos atributos de dados
            let lat = parseFloat(item.getAttribute('data-lat') || '0');
            let lng = parseFloat(item.getAttribute('data-lng') || '0');
            
            // Verificar se o texto contém coordenadas em formato conhecido
            const text = item.textContent || '';
            if (!lat && !lng) {
                // Buscar por padrões de coordenadas como "-22.1234, -48.5678"
                const coordMatch = text.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
                if (coordMatch) {
                    lat = parseFloat(coordMatch[1]);
                    lng = parseFloat(coordMatch[2]);
                }
            }
            
            // Se ainda não temos coordenadas válidas, usar posição aproximada
            if (!lat || !lng) {
                // Criar posições em círculo ao redor de Dois Córregos
                const radius = 0.3;
                const angle = (index / destinationItems.length) * Math.PI * 2;
                lat = -22.3731 + Math.cos(angle) * radius;
                lng = -48.3796 + Math.sin(angle) * radius;
            }
            
            // Extrair nome
            let name = '';
            const nameElement = item.querySelector('.location-name');
            if (nameElement) {
                name = nameElement.textContent.trim();
            } else {
                name = text.trim().split('\n')[0];
            }
            
            // Extrair ID
            const id = item.getAttribute('data-id') || `marker-${index}`;
            
            locations.push({
                id: id,
                name: name,
                lat: lat,
                lng: lng,
                isOrigin: false
            });
        });
        
        return locations;
    }
    
    // Adicionar marcador ao mapa
    function addMarkerToMap(location) {
        if (!map || !location || !location.lat || !location.lng) return;
        
        // Verificar se já existe marcador nessa posição
        for (const marker of markers) {
            const pos = marker.getPosition();
            if (pos && pos.lat() === location.lat && pos.lng() === location.lng) {
                console.log('[FixMarkers] Marcador já existe nessa posição');
                return;
            }
        }
        
        // Determinar ícone
        let icon = {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(16, 32)
        };
        
        if (location.isOrigin) {
            icon.url = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
            icon.scaledSize = new google.maps.Size(40, 40);
            icon.anchor = new google.maps.Point(20, 40);
        }
        
        // Criar marcador
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: map,
            title: location.name || 'Local',
            icon: icon,
            zIndex: location.isOrigin ? 1000 : 10
        });
        
        // Adicionar popup (infowindow)
        const infowindow = new google.maps.InfoWindow({
            content: `<div><strong>${location.name || 'Local'}</strong></div>`
        });
        
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
        
        // Guardar referência
        markers.push(marker);
        
        console.log(`[FixMarkers] Marcador adicionado: ${location.name}`);
        return marker;
    }
    
    // Iniciar monitoramento de alterações na lista de locais
    function startLocationMonitoring() {
        // Monitorar adição de novos elementos na lista
        const locationLists = document.querySelectorAll('.location-list, #locations-list, [class*="location-container"]');
        
        if (locationLists.length === 0) {
            console.log('[FixMarkers] Lista de locais não encontrada, tentando novamente em breve');
            setTimeout(startLocationMonitoring, 1000);
            return;
        }
        
        // Configurar MutationObserver para cada lista
        locationLists.forEach(list => {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log('[FixMarkers] Detectada adição de novos locais');
                        
                        // Verificar se foram adicionados novos locais
                        setTimeout(findAndAddLocations, 100);
                    }
                });
            });
            
            observer.observe(list, {
                childList: true,
                subtree: true
            });
            
            console.log('[FixMarkers] Monitoramento configurado para lista de locais');
        });
    }
    
    // Verificar e consertar marcadores faltantes periodicamente
    function checkAndFixMarkers() {
        const locationsInDOM = extractLocationsFromDOM();
        
        // Verificar se há marcadores faltando
        if (markers.length < locationsInDOM.length) {
            console.log('[FixMarkers] Detectada diferença entre marcadores e locais');
            
            // Adicionar marcadores faltantes
            for (const location of locationsInDOM) {
                let exists = false;
                
                // Verificar se já existe marcador para este local
                for (const marker of markers) {
                    const pos = marker.getPosition();
                    if (pos && 
                        Math.abs(pos.lat() - location.lat) < 0.001 && 
                        Math.abs(pos.lng() - location.lng) < 0.001) {
                        exists = true;
                        break;
                    }
                }
                
                // Adicionar se não existir
                if (!exists) {
                    addMarkerToMap(location);
                }
            }
        }
        
        // Garantir que todos os marcadores estão visíveis
        for (const marker of markers) {
            if (marker.getMap() !== map) {
                console.log('[FixMarkers] Restaurando marcador que foi removido do mapa');
                marker.setMap(map);
            }
        }
    }
})();