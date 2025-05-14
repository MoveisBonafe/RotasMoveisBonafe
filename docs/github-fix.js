/**
 * Script para corrigir problemas específicos na versão GitHub Pages
 * Compatível com todas as variações do ambiente
 */
(function() {
    // Exportar a função de correção para o escopo global
    window.corrigirProblemasGitHub = corrigirProblemasGitHub;
    console.log('[GitHubFix] Inicializando correções para ambiente GitHub Pages...');
    
    // Variáveis globais
    let mapaEncontrado = false;
    
    // Inicializar imediatamente e depois repetir caso a página não tenha carregado completamente
    corrigirProblemasGitHub();
    setTimeout(corrigirProblemasGitHub, 1000);
    setTimeout(corrigirProblemasGitHub, 2000);
    setTimeout(corrigirProblemasGitHub, 3000);
    
    // Função principal que aplica todas as correções necessárias
    function corrigirProblemasGitHub() {
        console.log('[GitHubFix] Verificando e corrigindo problemas...');
        
        // 1. Garantir que a instância do mapa seja encontrada e disponibilizada globalmente
        encontrarMapaGoogle();
        
        // 2. Corrigir variáveis de locations para que destinos sejam encontrados
        corrigirLocations();
        
        // 3. Ajustar DirectionsRenderer para usar a instância correta do mapa
        ajustarDirectionsRenderer();
        
        // Verificar novamente se aplicamos todas as correções
        if (!mapaEncontrado || !window.map) {
            setTimeout(encontrarMapaGoogle, 500);
        }
    }
    
    // Função para encontrar a instância do Google Maps
    function encontrarMapaGoogle() {
        if (mapaEncontrado && window.map) {
            return;
        }
        
        console.log('[GitHubFix] Procurando pela instância do mapa...');
        
        // Método 1: Procurar por variáveis globais com nomes comuns
        const possiveisNomes = ['map', 'googleMap', 'gMap', 'myMap', 'mapInstance'];
        
        for (const nome of possiveisNomes) {
            if (window[nome] && typeof window[nome] === 'object' && typeof window[nome].getCenter === 'function') {
                console.log(`[GitHubFix] Mapa encontrado como window.${nome}`);
                window.map = window[nome];
                mapaEncontrado = true;
                break;
            }
        }
        
        // Método 2: Procurar elementos do mapa no DOM e tentar extrair a instância
        if (!mapaEncontrado) {
            const mapElements = document.querySelectorAll('.gm-style');
            
            if (mapElements.length > 0) {
                console.log('[GitHubFix] Elemento .gm-style encontrado, procurando pelo container do mapa');
                
                // Encontrar o elemento pai que pode conter o mapa
                const mapContainer = mapElements[0].closest('[id$="map"], [class*="map"], [id*="map"]');
                
                if (mapContainer) {
                    console.log('[GitHubFix] Container do mapa encontrado:', mapContainer.id || mapContainer.className);
                    
                    // Verificar se o container tem a instância do mapa
                    if (mapContainer.__gm && mapContainer.__gm.map) {
                        window.map = mapContainer.__gm.map;
                        console.log('[GitHubFix] Instância do mapa extraída do container');
                        mapaEncontrado = true;
                    }
                }
            }
        }
        
        // Método 3: Se ainda não encontrou, procurar por todas as instâncias de Google Map na página
        if (!mapaEncontrado && window.google && window.google.maps && window.google.maps.Map) {
            console.log('[GitHubFix] Procurando por todas as instâncias de Map na página');
            
            // Tentar encontrar em todos os objetos disponíveis
            for (const key in window) {
                try {
                    if (window[key] instanceof google.maps.Map) {
                        window.map = window[key];
                        console.log('[GitHubFix] Instância do mapa encontrada em window.' + key);
                        mapaEncontrado = true;
                        break;
                    }
                } catch (e) {
                    // Ignorar erros
                }
            }
        }
        
        // Método 4: Criar uma nova instância do mapa se necessário
        if (!mapaEncontrado && window.google && window.google.maps && window.google.maps.Map) {
            console.log('[GitHubFix] Nenhuma instância do mapa encontrada, tentando criar uma nova');
            
            // Procurar pelo elemento do mapa
            const mapElement = document.getElementById('map') || 
                              document.querySelector('.map') || 
                              document.querySelector('[id$="map"]');
            
            if (mapElement) {
                try {
                    window.map = new google.maps.Map(mapElement, {
                        center: { lat: -22.3731, lng: -48.3796 }, // Dois Córregos-SP
                        zoom: 8
                    });
                    console.log('[GitHubFix] Nova instância do mapa criada');
                    mapaEncontrado = true;
                } catch (e) {
                    console.error('[GitHubFix] Erro ao criar nova instância do mapa:', e);
                }
            }
        }
        
        // Se encontramos o mapa, configurar DirectionsService e DirectionsRenderer
        if (mapaEncontrado && window.map) {
            if (!window.directionsService && window.google && window.google.maps && window.google.maps.DirectionsService) {
                window.directionsService = new google.maps.DirectionsService();
                console.log('[GitHubFix] DirectionsService criado');
            }
            
            // Recriamos o renderer para garantir que ele utilize a instância correta do mapa
            if (window.google && window.google.maps && window.google.maps.DirectionsRenderer) {
                // Se já existe um renderer, remover primeiro
                if (window.directionsRenderer) {
                    try {
                        window.directionsRenderer.setMap(null);
                    } catch (e) {
                        console.log('[GitHubFix] Erro ao remover renderer antigo:', e);
                    }
                }
                
                try {
                    window.directionsRenderer = new google.maps.DirectionsRenderer({
                        map: window.map,
                        suppressMarkers: false
                    });
                    console.log('[GitHubFix] DirectionsRenderer criado com o mapa correto');
                } catch (e) {
                    console.error('[GitHubFix] Erro ao criar DirectionsRenderer:', e);
                }
            }
        }
    }
    
    // Função para corrigir o problema de locations não disponíveis
    function corrigirLocations() {
        if (!window.locations || !Array.isArray(window.locations) || window.locations.length === 0) {
            console.log('[GitHubFix] Array locations não encontrado ou vazio, tentando reconstruir');
            
            // Verificar se temos alternativas
            if (window.locationsData && Array.isArray(window.locationsData) && window.locationsData.length > 0) {
                window.locations = window.locationsData;
                console.log('[GitHubFix] Usando locationsData como locations');
            } else if (window.waypoints && Array.isArray(window.waypoints) && window.waypoints.length > 0) {
                window.locations = window.waypoints;
                console.log('[GitHubFix] Usando waypoints como locations');
            } else {
                // Tentar reconstruir a partir dos elementos do DOM
                reconstruirLocationsDoDOM();
            }
        }
    }
    
    // Função para reconstruir o array de locations a partir dos elementos do DOM
    function reconstruirLocationsDoDOM() {
        console.log('[GitHubFix] Reconstruindo locations a partir do DOM');
        
        const locations = [];
        
        // Adicionar origem
        const origemElement = document.querySelector('.origin-point');
        if (origemElement) {
            const nomeOrigem = origemElement.textContent.trim();
            locations.push({
                id: 'origem',
                name: nomeOrigem || 'Dois Córregos',
                address: nomeOrigem || 'Dois Córregos, SP',
                lat: -22.3731,
                lng: -48.3796,
                isOrigin: true
            });
            console.log('[GitHubFix] Origem adicionada:', nomeOrigem || 'Dois Córregos');
        } else {
            // Se não encontrou elemento de origem, adicionar Dois Córregos como padrão
            locations.push({
                id: 'origem',
                name: 'Dois Córregos',
                address: 'Dois Córregos, SP',
                lat: -22.3731,
                lng: -48.3796,
                isOrigin: true
            });
            console.log('[GitHubFix] Origem padrão adicionada: Dois Córregos');
        }
        
        // Adicionar destinos
        const destinos = document.querySelectorAll('li:not(.origin-point), .location-item');
        
        let destinosAdicionados = 0;
        destinos.forEach((destino, index) => {
            // Verificar se é um destino e não um elemento da interface
            if (!destino.classList.contains('origin-point') && destino.textContent.trim()) {
                // Tentar extrair coordenadas de atributos de dados
                let lat = parseFloat(destino.getAttribute('data-lat')) || 0;
                let lng = parseFloat(destino.getAttribute('data-lng')) || 0;
                
                // Se não tem coordenadas, criar algumas fictícias para demonstração (em torno de Dois Córregos)
                if (!lat || !lng) {
                    // Usar o índice para distribuir os pontos ao redor de Dois Córregos (apenas para visualização)
                    lat = -22.3731 + (Math.random() * 0.2 - 0.1);
                    lng = -48.3796 + (Math.random() * 0.2 - 0.1);
                }
                
                // Extrair nome
                let nome = '';
                const nomeElement = destino.querySelector('.location-name');
                if (nomeElement) {
                    nome = nomeElement.textContent.trim();
                } else {
                    // Limpar o texto para remover possíveis números de sequência
                    nome = destino.textContent.trim().replace(/^\d+[\s\.\-]*/, '');
                }
                
                // Se após limpar ainda temos um nome
                if (nome) {
                    locations.push({
                        id: destino.getAttribute('data-id') || `destino-${index}`,
                        name: nome,
                        address: nome,
                        lat: lat,
                        lng: lng,
                        isOrigin: false
                    });
                    destinosAdicionados++;
                }
            }
        });
        
        console.log(`[GitHubFix] ${destinosAdicionados} destinos adicionados`);
        
        // Se temos pelo menos a origem, salvar o array
        if (locations.length > 0) {
            window.locations = locations;
            console.log('[GitHubFix] Array locations reconstruído com sucesso');
            
            // Também atualizar waypoints para compatibilidade
            window.waypoints = locations;
        }
    }
    
    // Função para ajustar DirectionsRenderer quando houver mudanças no mapa
    function ajustarDirectionsRenderer() {
        if (window.map && window.directionsRenderer) {
            try {
                // Verificar se o mapa do renderer é o mesmo que window.map
                const rendererMap = window.directionsRenderer.getMap();
                
                if (!rendererMap || rendererMap !== window.map) {
                    console.log('[GitHubFix] Atualizando DirectionsRenderer para usar o mapa correto');
                    window.directionsRenderer.setMap(window.map);
                }
            } catch (e) {
                console.error('[GitHubFix] Erro ao ajustar DirectionsRenderer:', e);
                
                // Se deu erro, criar um novo renderer
                try {
                    window.directionsRenderer = new google.maps.DirectionsRenderer({
                        map: window.map,
                        suppressMarkers: false
                    });
                    console.log('[GitHubFix] Novo DirectionsRenderer criado');
                } catch (e2) {
                    console.error('[GitHubFix] Erro ao criar novo DirectionsRenderer:', e2);
                }
            }
        }
    }
    
})();