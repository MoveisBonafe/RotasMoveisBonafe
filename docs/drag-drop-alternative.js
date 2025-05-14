/**
 * Solução completa para arrastar e soltar destinos + rota personalizada como alternativa
 * Versão 1.0.0
 */
(function() {
    console.log('[DragDropAlt] Inicializando script de arrastar e soltar + rota personalizada alternativa...');
    
    // Variáveis globais
    let destinos = [];
    let rotaPersonalizadaAdicionada = false;
    let observadorAdicionado = false;
    
    // Inicialização
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    setTimeout(inicializar, 3000);
    
    // Função principal de inicialização
    function inicializar() {
        console.log('[DragDropAlt] Iniciando configuração...');
        
        // Adicionar estilos CSS
        adicionarEstilos();
        
        // Configurar drag and drop para os destinos
        configurarDragDrop();
        
        // Monitorar adição de novos destinos
        monitorarNovosDestinos();
        
        // Monitorar botão de otimização de rota
        monitorarOtimizacaoRota();
    }
    
    // Adicionar estilos CSS para arrastar e soltar
    function adicionarEstilos() {
        if (document.getElementById('drag-drop-alt-styles')) {
            return;
        }
        
        const estilos = document.createElement('style');
        estilos.id = 'drag-drop-alt-styles';
        estilos.textContent = `
            /* Estilos para itens arrastáveis */
            .destino-draggable {
                cursor: grab !important;
                position: relative !important;
                border-left: 3px solid #ffc107 !important;
                padding-left: 30px !important;
                margin-bottom: 5px !important;
                background-color: white !important;
                transition: all 0.2s ease;
            }
            
            .destino-draggable::before {
                content: "≡";
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #ffc107;
                font-weight: bold;
                font-size: 18px;
            }
            
            .destino-draggable:hover {
                background-color: #FFF8E1 !important;
            }
            
            .destino-arrastando {
                opacity: 0.7;
                background-color: #FFF8E1;
                border: 2px dashed #ffc107 !important;
            }
            
            /* Estilos para rota personalizada nas alternativas */
            .rota-personalizada-card {
                background-color: #fff8e1 !important;
                border: 2px solid #ffc107 !important;
            }
            
            .rota-personalizada-card.selected {
                background-color: #ffe082 !important;
                border: 2px solid #ffb300 !important;
            }
            
            .rota-personalizada-card::before {
                content: "👆";
                margin-right: 5px;
            }
        `;
        
        document.head.appendChild(estilos);
        console.log('[DragDropAlt] Estilos adicionados');
    }
    
    // Configurar drag and drop para os destinos
    function configurarDragDrop() {
        // Encontrar o container de destinos
        const container = document.querySelector('.location-list, #locations-list, [class*="location-container"]');
        
        if (!container) {
            console.log('[DragDropAlt] Container de destinos não encontrado, tentando novamente em breve...');
            setTimeout(configurarDragDrop, 1000);
            return;
        }
        
        console.log('[DragDropAlt] Container de destinos encontrado');
        
        // Configurar os itens já existentes
        const itens = container.querySelectorAll('li, .location-item');
        itens.forEach(configurarItemArrastavel);
        
        // Adicionar eventos ao container
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
    }
    
    // Configurar um item como arrastável
    function configurarItemArrastavel(item) {
        // Ignorar o ponto de origem
        if (item.classList.contains('origin-point')) {
            return;
        }
        
        // Verificar se já está configurado
        if (item.hasAttribute('draggable') && item.classList.contains('destino-draggable')) {
            return;
        }
        
        console.log('[DragDropAlt] Configurando item como arrastável:', item);
        
        // Adicionar classe e atributos
        item.classList.add('destino-draggable');
        item.setAttribute('draggable', 'true');
        
        // Adicionar eventos
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    }
    
    // Monitorar adição de novos destinos
    function monitorarNovosDestinos() {
        if (observadorAdicionado) {
            return;
        }
        
        const container = document.querySelector('.location-list, #locations-list, [class*="location-container"]');
        
        if (!container) {
            console.log('[DragDropAlt] Container não encontrado para monitorar novos destinos');
            setTimeout(monitorarNovosDestinos, 1000);
            return;
        }
        
        // Criar o observador
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    console.log('[DragDropAlt] Novos nós detectados, configurando como arrastáveis');
                    
                    // Verificar se os novos nós são destinos
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Elemento do DOM
                            // Se é um destino diretamente
                            if (node.classList.contains('location-item') || node.tagName.toLowerCase() === 'li') {
                                configurarItemArrastavel(node);
                            } else {
                                // Verificar se contém destinos
                                const itens = node.querySelectorAll('li, .location-item');
                                itens.forEach(configurarItemArrastavel);
                            }
                        }
                    });
                }
            });
        });
        
        // Configurar e iniciar o observador
        observer.observe(container, {
            childList: true,
            subtree: true
        });
        
        observadorAdicionado = true;
        console.log('[DragDropAlt] Observador de novos destinos configurado');
    }
    
    // Monitorar o botão de otimização de rota
    function monitorarOtimizacaoRota() {
        // Encontrar botão de otimizar
        const botaoOtimizar = document.getElementById('optimize-route');
        
        if (!botaoOtimizar) {
            console.log('[DragDropAlt] Botão de otimizar não encontrado, tentando novamente em breve...');
            setTimeout(monitorarOtimizacaoRota, 1000);
            return;
        }
        
        console.log('[DragDropAlt] Botão de otimizar encontrado, adicionando evento');
        
        // Substituir o comportamento padrão do botão para mostrar a rota personalizada
        const originalOnClick = botaoOtimizar.onclick;
        botaoOtimizar.onclick = function(e) {
            console.log('[DragDropAlt] Intercetando clique no botão de otimizar');
            
            // Salvar a ordem atual dos destinos
            salvarOrdemAtual();
            
            // Chamar a função original se existir
            if (typeof originalOnClick === 'function') {
                originalOnClick.call(this, e);
            }
            
            // Aguardar um momento para que as rotas alternativas sejam calculadas
            setTimeout(function() {
                console.log('[DragDropAlt] Calculando rota personalizada automaticamente');
                calcularRotaPersonalizada();
                
                // Selecionar o card de rota personalizada automaticamente
                setTimeout(function() {
                    const rotaPersonalizadaCard = document.querySelector('.rota-personalizada-card');
                    if (rotaPersonalizadaCard) {
                        // Remover seleção de outros cards
                        const cards = document.querySelectorAll('.route-option-card');
                        cards.forEach(card => card.classList.remove('selected'));
                        
                        // Selecionar o card de rota personalizada
                        rotaPersonalizadaCard.classList.add('selected');
                    }
                }, 200);
            }, 500);
            
            return false; // Impedir comportamento padrão
        };
        
        // Adicionar evento para capturar a ordem atual antes de otimizar (backup)
        botaoOtimizar.addEventListener('click', function() {
            console.log('[DragDropAlt] Botão de otimizar clicado, salvando ordem atual');
            salvarOrdemAtual();
        });
        
        // Também monitorar diretamente a função de exibir rotas alternativas
        const originalRenderRoutes = window.renderAlternativeRoutes;
        if (originalRenderRoutes) {
            window.renderAlternativeRoutes = function(routes) {
                // Chamar a função original
                originalRenderRoutes(routes);
                
                // Adicionar nossa rota personalizada
                adicionarRotaPersonalizada();
                
                // Selecionar automaticamente a rota personalizada
                setTimeout(function() {
                    const rotaPersonalizadaCard = document.querySelector('.rota-personalizada-card');
                    if (rotaPersonalizadaCard) {
                        // Simular clique no card
                        rotaPersonalizadaCard.click();
                        
                        // Ou aplicar a seleção manualmente
                        const cards = document.querySelectorAll('.route-option-card');
                        cards.forEach(card => card.classList.remove('selected'));
                        rotaPersonalizadaCard.classList.add('selected');
                    }
                }, 200);
            };
            console.log('[DragDropAlt] Função renderAlternativeRoutes interceptada');
        } else {
            console.log('[DragDropAlt] Função renderAlternativeRoutes não encontrada, monitorando alternativeRoutesContainer');
            // Monitorar o container de rotas alternativas para adicionar nossa opção quando for preenchido
            monitorarContainerRotasAlternativas();
        }
    }
    
    // Monitorar o container de rotas alternativas
    function monitorarContainerRotasAlternativas() {
        const container = document.querySelector('.alternative-routes-section');
        
        if (!container) {
            console.log('[DragDropAlt] Container de rotas alternativas não encontrado, tentando novamente em breve...');
            setTimeout(monitorarContainerRotasAlternativas, 1000);
            return;
        }
        
        console.log('[DragDropAlt] Container de rotas alternativas encontrado, configurando observador');
        
        // Criar o observador
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    console.log('[DragDropAlt] Alterações no container de rotas alternativas');
                    
                    // Verificar se as rotas foram adicionadas
                    if (container.querySelector('.route-option-card') && !rotaPersonalizadaAdicionada) {
                        console.log('[DragDropAlt] Rotas alternativas detectadas, adicionando rota personalizada');
                        adicionarRotaPersonalizada();
                        
                        // Selecionar automaticamente a rota personalizada após adicioná-la
                        setTimeout(function() {
                            const rotaPersonalizadaCard = document.querySelector('.rota-personalizada-card');
                            if (rotaPersonalizadaCard) {
                                // Simular clique no card
                                rotaPersonalizadaCard.click();
                                
                                // Garantir que está selecionado visualmente
                                const cards = document.querySelectorAll('.route-option-card');
                                cards.forEach(card => card.classList.remove('selected'));
                                rotaPersonalizadaCard.classList.add('selected');
                                
                                // Calcular a rota personalizada
                                setTimeout(function() {
                                    calcularRotaPersonalizada();
                                }, 100);
                            }
                        }, 200);
                    }
                }
            });
        });
        
        // Configurar e iniciar o observador
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    }
    
    // Salvar a ordem atual dos destinos
    function salvarOrdemAtual() {
        destinos = [];
        
        // Encontrar o container de destinos
        const container = document.querySelector('.location-list, #locations-list, [class*="location-container"]');
        
        if (!container) {
            console.log('[DragDropAlt] Container não encontrado para salvar ordem');
            return;
        }
        
        // Coletar todos os destinos arrastáveis
        const itens = container.querySelectorAll('.destino-draggable, .location-item, li:not(.origin-point)');
        
        itens.forEach(function(item) {
            // Tentar extrair o ID e o nome
            let id = item.getAttribute('data-id');
            let nome = '';
            
            // Tentar extrair o nome de diferentes maneiras
            const nomeElement = item.querySelector('.location-name');
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else if (item.textContent) {
                nome = item.textContent.trim();
            }
            
            if (id || nome) {
                destinos.push({
                    id: id,
                    nome: nome,
                    elemento: item
                });
            }
        });
        
        console.log('[DragDropAlt] Ordem atual salva:', destinos);
    }
    
    // Adicionar opção de rota personalizada nas alternativas
    function adicionarRotaPersonalizada() {
        // Verificar se já foi adicionada
        if (rotaPersonalizadaAdicionada || destinos.length === 0) {
            return;
        }
        
        // Encontrar o container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section');
        
        if (!container) {
            console.log('[DragDropAlt] Container de rotas alternativas não encontrado');
            return;
        }
        
        // Calcular distância aproximada entre pontos
        const distanciaTotal = calcularDistanciaAproximadaRota();
        
        // Criar card para rota personalizada
        const cardRotaPersonalizada = document.createElement('div');
        cardRotaPersonalizada.className = 'route-option-card rota-personalizada-card';
        cardRotaPersonalizada.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>Rota Personalizada</h6>
                    <p class="mb-0">Mantém exatamente a ordem que você definiu</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-warning text-dark">${distanciaTotal} km</span>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        cardRotaPersonalizada.addEventListener('click', function() {
            console.log('[DragDropAlt] Card de rota personalizada clicado');
            
            // Remover seleção de outros cards
            const cards = container.querySelectorAll('.route-option-card');
            cards.forEach(card => card.classList.remove('selected'));
            
            // Selecionar este card
            cardRotaPersonalizada.classList.add('selected');
            
            // Certificar-se de que temos todas as informações necessárias antes de calcular
            if (window.corrigirProblemasGitHub) {
                console.log('[DragDropAlt] Aplicando correções do GitHub antes de calcular rota');
                try {
                    window.corrigirProblemasGitHub();
                    window.github_fix_applied = true;
                } catch (e) {
                    console.error('[DragDropAlt] Erro ao aplicar correções:', e);
                }
            }
            
            // Recalcular destinos
            salvarOrdemAtual();
            
            // Aguardar um momento para garantir que tudo está inicializado
            setTimeout(function() {
                // Calcular e mostrar rota personalizada
                calcularRotaPersonalizada();
            }, 100);
        });
        
        // Adicionar ao container
        const titulo = container.querySelector('h5');
        
        if (titulo && titulo.nextSibling) {
            container.insertBefore(cardRotaPersonalizada, titulo.nextSibling);
        } else {
            container.appendChild(cardRotaPersonalizada);
        }
        
        rotaPersonalizadaAdicionada = true;
        console.log('[DragDropAlt] Opção de rota personalizada adicionada');
    }
    
    // Calcular distância aproximada da rota
    function calcularDistanciaAproximadaRota() {
        // Obter localizações dos destinos
        const locations = window.locations || [];
        
        if (locations.length === 0) {
            return "?";
        }
        
        // Encontrar origem
        const origem = locations.find(loc => loc.isOrigin);
        
        if (!origem) {
            return "?";
        }
        
        // Construir array de pontos na ordem personalizada
        const pontos = [origem];
        
        // Adicionar outros pontos na ordem dos destinos salvos
        for (const destino of destinos) {
            const location = locations.find(loc => !loc.isOrigin && String(loc.id) === String(destino.id));
            if (location) {
                pontos.push(location);
            }
        }
        
        // Calcular distância total
        let distanciaTotal = 0;
        for (let i = 0; i < pontos.length - 1; i++) {
            const p1 = pontos[i];
            const p2 = pontos[i + 1];
            
            distanciaTotal += calcularDistanciaHaversine(
                p1.lat, p1.lng,
                p2.lat, p2.lng
            );
        }
        
        return distanciaTotal.toFixed(1);
    }
    
    // Calcular a distância entre dois pontos usando a fórmula de Haversine
    function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distância em km
        
        return d;
    }
    
    // Converter graus para radianos
    function toRad(value) {
        return value * Math.PI / 180;
    }
    
    // Calcular e mostrar rota personalizada
    function calcularRotaPersonalizada() {
        console.log('[DragDropAlt] Calculando rota personalizada');
        
        // Primeiro, forçar aplicação das correções do GitHub
        if (window.corrigirProblemasGitHub) {
            console.log('[DragDropAlt] Aplicando correções do GitHub antes de calcular');
            try {
                window.corrigirProblemasGitHub();
            } catch (e) {
                console.error('[DragDropAlt] Erro ao aplicar correções:', e);
            }
        }
        
        // Na versão standalone, o Google Maps pode estar disponível de forma diferente
        // Verificar e configurar os serviços se necessário
        if (!window.directionsService && window.google && window.google.maps && window.google.maps.DirectionsService) {
            console.log('[DragDropAlt] Criando uma nova instância de DirectionsService');
            window.directionsService = new google.maps.DirectionsService();
        }
        
        // Encontrar o mapa diretamente na página primeiro
        if (!window.map && window.google && window.google.maps) {
            console.log('[DragDropAlt] Buscando o mapa existente na página');
            
            // Primeiro, tentar obter mapa por iframe
            const mapIframe = document.querySelector('iframe[src*="google.com/maps"]');
            if (mapIframe && mapIframe.contentWindow && mapIframe.contentWindow.google && 
                mapIframe.contentWindow.google.maps && mapIframe.contentWindow.google.maps.Map) {
                window.map = mapIframe.contentWindow.google.maps.Map;
                console.log('[DragDropAlt] Mapa encontrado via iframe');
            }
            
            // Se não encontrou, procurar no DOM global
            if (!window.map) {
                // Procurar por elementos com o estilo do Google Maps
                const mapElements = document.querySelectorAll('.gm-style');
                if (mapElements.length > 0) {
                    // Tentar encontrar o elemento do mapa
                    const mapContainer = mapElements[0].closest('[id$="map"], [id*="map"], [class*="map"]');
                    
                    if (mapContainer) {
                        console.log('[DragDropAlt] Container de mapa encontrado:', mapContainer.id || mapContainer.className);
                        
                        // Procurar globalmente por variáveis que possam ter o mapa
                        for (const key in window) {
                            if (key.includes('map') || key === 'map') {
                                try {
                                    const obj = window[key];
                                    if (obj && typeof obj === 'object' && obj.getCenter && typeof obj.getCenter === 'function') {
                                        window.map = obj;
                                        console.log('[DragDropAlt] Encontrado objeto de mapa:', key);
                                        break;
                                    }
                                } catch (e) {
                                    // Ignorar erros de acesso a propriedades
                                }
                            }
                        }
                    }
                }
            }
            
            // Se ainda não encontrou o mapa, procurar por identificadores comuns
            if (!window.map) {
                const mapElement = document.getElementById('map') || 
                                 document.querySelector('.map') || 
                                 document.querySelector('[id$="map"]') ||
                                 document.querySelector('[class$="map"]');
                
                if (mapElement) {
                    console.log('[DragDropAlt] Elemento do mapa encontrado, mas sem instância. Tentando criar um novo mapa');
                    try {
                        // Tentar criar um novo mapa
                        window.map = new google.maps.Map(mapElement, {
                            center: { lat: -22.3731, lng: -48.3796 }, // Dois Córregos-SP
                            zoom: 8
                        });
                    } catch (e) {
                        console.error('[DragDropAlt] Erro ao criar mapa:', e);
                    }
                }
            }
        }
        
        // Vamos procurar por um mapa existente diretamente na estrutura do DOM
        if (!window.map) {
            console.log('[DragDropAlt] Verificando se existe um mapa diretamente no DOM');
            try {
                // O Google Maps costuma criar um elemento div.gm-style no corpo da página
                // dentro dele está a instância do mapa
                const mapDiv = document.querySelector('div.gm-style');
                if (mapDiv) {
                    // Tentar obter o ID da div que contém o mapa
                    const parentMap = mapDiv.closest('div[id]');
                    if (parentMap && parentMap.id) {
                        console.log('[DragDropAlt] Possível elemento de mapa encontrado com ID:', parentMap.id);
                        
                        // Tentar obter mapa da versão GitHub (referências globais geralmente presentes)
                        if (typeof map !== 'undefined') {
                            window.map = map;
                            console.log('[DragDropAlt] Mapa global encontrado');
                        }
                    }
                }
            } catch (e) {
                console.error('[DragDropAlt] Erro ao procurar mapa no DOM:', e);
            }
        }
        
        console.log('[DragDropAlt] Status do mapa:', !!window.map);
        
        // Criar o renderer depois de ter encontrado o mapa
        if (!window.directionsRenderer && window.google && window.google.maps && window.google.maps.DirectionsRenderer) {
            try {
                console.log('[DragDropAlt] Criando uma nova instância de DirectionsRenderer');
                // Se não temos mapa, criar sem o mapa e configurar depois
                if (!window.map) {
                    window.directionsRenderer = new google.maps.DirectionsRenderer({
                        suppressMarkers: false
                    });
                    console.log('[DragDropAlt] DirectionsRenderer criado sem mapa');
                } else {
                    window.directionsRenderer = new google.maps.DirectionsRenderer({
                        map: window.map,
                        suppressMarkers: false
                    });
                    console.log('[DragDropAlt] DirectionsRenderer criado com mapa');
                }
            } catch (e) {
                console.error('[DragDropAlt] Erro ao criar DirectionsRenderer:', e);
            }
        }
        
        // Verificar se temos as APIs e os dados necessários
        if (!window.directionsService || !window.directionsRenderer) {
            console.error('[DragDropAlt] Serviços de direções não disponíveis');
            console.log('[DragDropAlt] directionsService:', !!window.directionsService);
            console.log('[DragDropAlt] directionsRenderer:', !!window.directionsRenderer);
            console.log('[DragDropAlt] google.maps:', !!window.google?.maps);
            alert('Erro: Serviço de direções não está disponível.');
            return;
        }
        
        // Se não temos locations, verificar se podemos obtê-las de outra fonte
        if (!window.locations) {
            console.log('[DragDropAlt] Array locations não encontrado, tentando alternativas');
            
            // Tentar encontrar locations em variáveis alternativas
            if (window.locationsData) {
                window.locations = window.locationsData;
            } else if (window.waypoints) {
                window.locations = window.waypoints;
            } else {
                // Última tentativa: reconstruir a partir dos elementos do DOM
                const locations = [];
                
                // Adicionar origem
                const origemElement = document.querySelector('.origin-point');
                if (origemElement) {
                    const nomeOrigem = origemElement.textContent.trim();
                    // Coordenadas de Dois Córregos-SP - fallback
                    locations.push({
                        id: 'origem',
                        name: nomeOrigem || 'Dois Córregos',
                        lat: -22.3731,
                        lng: -48.3796,
                        isOrigin: true
                    });
                }
                
                // Adicionar destinos
                const destinos = document.querySelectorAll('.destino-draggable, .location-item');
                destinos.forEach((destino, index) => {
                    // Tentar extrair coordenadas de atributos
                    const lat = parseFloat(destino.getAttribute('data-lat') || '0');
                    const lng = parseFloat(destino.getAttribute('data-lng') || '0');
                    
                    if (lat && lng) {
                        locations.push({
                            id: destino.getAttribute('data-id') || `destino-${index}`,
                            name: destino.textContent.trim(),
                            lat: lat,
                            lng: lng,
                            isOrigin: false
                        });
                    }
                });
                
                if (locations.length > 0) {
                    window.locations = locations;
                }
            }
        }
        
        if (!window.locations || !Array.isArray(window.locations) || window.locations.length === 0) {
            console.error('[DragDropAlt] Não foi possível obter os dados de localização');
            alert('Erro: Dados de localização não estão disponíveis.');
            return;
        }
        
        // Encontrar mapa se não estiver disponível globalmente
        if (!window.map && window.google && window.google.maps) {
            console.log('[DragDropAlt] Procurando instância do mapa');
            
            // Procurar no DOM por instâncias do mapa
            const mapElements = document.querySelectorAll('.gm-style');
            if (mapElements.length > 0) {
                // Encontrar elemento pai que possa conter a instância do mapa
                const possibleMapContainer = mapElements[0].closest('[id$=map], [id*=map], [class$=map], [class*=map]');
                
                // Verificar objetos na página buscando instância do mapa
                for (const key in window) {
                    try {
                        if (window[key] instanceof google.maps.Map) {
                            window.map = window[key];
                            console.log('[DragDropAlt] Instância do mapa encontrada:', key);
                            break;
                        }
                    } catch (e) {
                        // Ignorar erros
                    }
                }
                
                if (!window.map && possibleMapContainer && possibleMapContainer.__gm && possibleMapContainer.__gm.map) {
                    window.map = possibleMapContainer.__gm.map;
                    console.log('[DragDropAlt] Mapa encontrado pelo container');
                }
            }
            
            // Se ainda não temos mapa, criar um novo
            if (!window.map) {
                // Buscar o elemento do mapa
                const mapElement = document.getElementById('map') || 
                                  document.querySelector('.map-container') || 
                                  document.querySelector('[id$=map]');
                
                if (mapElement) {
                    console.log('[DragDropAlt] Criando nova instância do mapa');
                    window.map = new google.maps.Map(mapElement, {
                        center: { lat: -22.3731, lng: -48.3796 }, // Dois Córregos-SP
                        zoom: 8
                    });
                }
            }
            
            // Se encontramos/criamos o mapa, verificar renderer
            if (window.map && !window.directionsRenderer) {
                window.directionsRenderer = new google.maps.DirectionsRenderer({
                    map: window.map,
                    suppressMarkers: false
                });
                console.log('[DragDropAlt] Renderer criado com mapa encontrado');
            }
        }
        
        // Construir waypoints
        const waypoints = [];
        
        // Adicionar origem
        let origem = window.locations.find(loc => loc.isOrigin);
        
        // Se não encontrou por isOrigin, usar o primeiro elemento
        if (!origem && window.locations.length > 0) {
            console.log('[DragDropAlt] Origem não encontrada pelo isOrigin, usando primeiro elemento');
            origem = window.locations[0];
        }
        
        if (origem) {
            waypoints.push(origem);
        } else {
            console.error('[DragDropAlt] Origem não encontrada');
            alert('Erro: Ponto de origem não encontrado.');
            return;
        }
        
        // Adicionar destinos na ordem salva
        // Se não temos destinos salvos, tentar extrair do DOM
        if (destinos.length === 0) {
            console.log('[DragDropAlt] Nenhum destino salvo, tentando extrair do DOM');
            
            // Encontrar todos os elementos de destino
            const destinosElements = document.querySelectorAll('.destino-draggable, .location-item, li:not(.origin-point)');
            
            destinosElements.forEach((item, index) => {
                let id = item.getAttribute('data-id') || `item-${index}`;
                let nome = '';
                
                // Extrair nome
                const nomeElement = item.querySelector('.location-name');
                if (nomeElement) {
                    nome = nomeElement.textContent.trim();
                } else {
                    nome = item.textContent.trim();
                }
                
                // Adicionar ao array de destinos
                destinos.push({
                    id: id,
                    nome: nome,
                    elemento: item
                });
            });
            
            console.log('[DragDropAlt] Destinos extraídos do DOM:', destinos.length);
        }
        
        // Se temos coordenadas nos locations, usar elas
        if (window.locations && Array.isArray(window.locations)) {
            for (const destino of destinos) {
                // Procurar location pelo id ou pelo nome
                let loc = window.locations.find(l => !l.isOrigin && String(l.id) === String(destino.id));
                
                // Se não encontrou pelo ID, tentar pelo nome
                if (!loc) {
                    loc = window.locations.find(l => !l.isOrigin && l.name && destino.nome && 
                         l.name.toLowerCase().includes(destino.nome.toLowerCase()));
                }
                
                if (loc) {
                    waypoints.push(loc);
                } else {
                    console.log('[DragDropAlt] Não foi possível encontrar localização para destino:', destino.nome);
                }
            }
        } else {
            console.log('[DragDropAlt] Sem locations disponíveis, usando outra abordagem');
            
            // Se não temos coordenadas, vamos usar a versão mais básica que funciona
            // Verificar se o Google Maps está disponível
            if (window.google && window.google.maps) {
                console.log('[DragDropAlt] Tentando obter coordenadas da API do Google Maps');
                
                // Criar geocoder se não existir
                if (!window.geocoder && window.google.maps.Geocoder) {
                    window.geocoder = new google.maps.Geocoder();
                }
                
                // Usar variáveis globais de coordenadas, se disponíveis
                if (window.markers && Array.isArray(window.markers)) {
                    console.log('[DragDropAlt] Usando markers existentes para obter coordenadas');
                    
                    // Adicionar destinos da ordem dos IDs salvos
                    for (const destino of destinos) {
                        // Tentar encontrar o marker por atributos de dados
                        let marker = window.markers.find(m => m.id && String(m.id) === String(destino.id));
                        
                        // Se não encontrou, tentar pelo título
                        if (!marker && destino.nome) {
                            marker = window.markers.find(m => m.title && 
                                m.title.toLowerCase().includes(destino.nome.toLowerCase()));
                        }
                        
                        if (marker && marker.position) {
                            waypoints.push({
                                id: destino.id,
                                name: destino.nome,
                                lat: marker.position.lat(),
                                lng: marker.position.lng(),
                                isOrigin: false
                            });
                        }
                    }
                } else {
                    console.log('[DragDropAlt] Sem markers disponíveis');
                }
            }
        }
        
        // Verificar se temos destinos suficientes
        if (waypoints.length < 2) {
            console.error('[DragDropAlt] Não há destinos suficientes para calcular a rota');
            
            // Tente extrair coordenadas diretamente dos elementos DOM
            const destinosElements = document.querySelectorAll('.destino-draggable, .location-item, li:not(.origin-point)');
            let extraiuCoordenadasDOM = false;
            
            destinosElements.forEach((item) => {
                // Verificar se tem coordenadas diretamente nos atributos
                const lat = parseFloat(item.getAttribute('data-lat') || '0');
                const lng = parseFloat(item.getAttribute('data-lng') || '0');
                
                if (lat && lng) {
                    waypoints.push({
                        id: item.getAttribute('data-id') || Math.random().toString(36).substring(7),
                        name: item.textContent.trim(),
                        lat: lat,
                        lng: lng,
                        isOrigin: false
                    });
                    extraiuCoordenadasDOM = true;
                }
            });
            
            if (!extraiuCoordenadasDOM || waypoints.length < 2) {
                console.log('[DragDropAlt] Não foi possível extrair coordenadas suficientes');
                alert('É necessário pelo menos um destino além da origem para calcular a rota.\nAdicione mais destinos e tente novamente.');
                return;
            }
        }
        
        // Exibir spinner de carregamento se existir
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'block';
        }
        
        // Configurar request para API de direções
        const request = {
            origin: new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng),
            destination: new google.maps.LatLng(waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng),
            waypoints: waypoints.slice(1, -1).map(wp => ({
                location: new google.maps.LatLng(wp.lat, wp.lng),
                stopover: true
            })),
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        // Chamar o serviço de direções
        window.directionsService.route(request, function(result, status) {
            // Esconder spinner
            if (spinner) {
                spinner.style.display = 'none';
            }
            
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[DragDropAlt] Rota personalizada calculada com sucesso');
                
                // Renderizar no mapa
                window.directionsRenderer.setDirections(result);
                
                // Atualizar informações de rota se possível
                if (typeof updateRouteInfo === 'function') {
                    const pernas = result.routes[0].legs;
                    let distanciaTotal = 0;
                    let duracaoTotal = 0;
                    
                    for (const perna of pernas) {
                        distanciaTotal += perna.distance.value;
                        duracaoTotal += perna.duration.value;
                    }
                    
                    // Converter para km e minutos
                    const distanciaKm = (distanciaTotal / 1000).toFixed(1);
                    const duracaoMinutos = Math.round(duracaoTotal / 60);
                    
                    // Informações para a função de atualização
                    const tspResult = {
                        path: destinos.map(d => d.id),
                        distance: distanciaKm,
                        duration: duracaoMinutos,
                        optimized: false,
                        waypoints: waypoints
                    };
                    
                    updateRouteInfo(tspResult);
                } else {
                    // Tentar atualizar informações manualmente
                    atualizarInformacoesRota(result, waypoints);
                }
            } else {
                console.error('[DragDropAlt] Erro ao calcular rota:', status);
                alert('Erro ao calcular a rota. Veja o console para detalhes.');
            }
        });
    }
    
    // Atualizar informações da rota manualmente
    function atualizarInformacoesRota(result, waypoints) {
        // Verificar se temos o resultado
        if (!result || !result.routes || !result.routes[0] || !result.routes[0].legs) {
            return;
        }
        
        // Calcular distância e duração totais
        const pernas = result.routes[0].legs;
        let distanciaTotal = 0;
        let duracaoTotal = 0;
        
        for (const perna of pernas) {
            distanciaTotal += perna.distance.value;
            duracaoTotal += perna.duration.value;
        }
        
        // Converter para km e minutos
        const distanciaKm = (distanciaTotal / 1000).toFixed(1);
        const duracaoMinutos = Math.round(duracaoTotal / 60);
        
        // Encontrar e atualizar o container de informações da rota
        const routeInfo = document.getElementById('route-info');
        if (!routeInfo) {
            return;
        }
        
        // Garantir que o container esteja visível
        routeInfo.style.display = 'block';
        
        // Atualizar detalhes da rota
        const routeDetails = document.getElementById('route-details');
        if (routeDetails) {
            const horas = Math.floor(duracaoMinutos / 60);
            const minutos = duracaoMinutos % 60;
            
            routeDetails.innerHTML = `
                <p><strong>Distância Total:</strong> ${distanciaKm} km</p>
                <p><strong>Tempo Estimado:</strong> ${horas > 0 ? `${horas}h ` : ''}${minutos}min</p>
                <p><strong>Velocidade Média:</strong> 80 km/h</p>
                <p><strong>Ordem:</strong> Personalizada</p>
            `;
        }
        
        // Atualizar sequência de visitas
        const routeSequence = document.getElementById('route-sequence');
        if (routeSequence) {
            routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
            
            waypoints.forEach((location, index) => {
                const sequenceItem = document.createElement('div');
                sequenceItem.className = 'sequence-item';
                
                sequenceItem.innerHTML = `
                    <span class="sequence-number">${index}</span>
                    <span class="sequence-name">${location.name}</span>
                `;
                
                routeSequence.appendChild(sequenceItem);
            });
        }
    }
    
    // Manipuladores de eventos para drag and drop
    function handleDragStart(e) {
        console.log('[DragDropAlt] Iniciando arrasto');
        this.classList.add('destino-arrastando');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
    }
    
    function handleDragEnd(e) {
        console.log('[DragDropAlt] Finalizando arrasto');
        this.classList.remove('destino-arrastando');
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const elementoArrastado = document.querySelector('.destino-arrastando');
        if (!elementoArrastado) return;
        
        const elementoApos = getElementoApos(this, e.clientY);
        
        if (elementoApos) {
            this.insertBefore(elementoArrastado, elementoApos);
        } else {
            this.appendChild(elementoArrastado);
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        console.log('[DragDropAlt] Item solto');
        
        // Salvar a nova ordem
        salvarOrdemAtual();
    }
    
    // Encontrar o elemento após o qual inserir o item arrastado
    function getElementoApos(container, y) {
        const elementosArrastaveis = [...container.querySelectorAll('.destino-draggable:not(.destino-arrastando)')];
        
        return elementosArrastaveis.reduce((closest, child) => {
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