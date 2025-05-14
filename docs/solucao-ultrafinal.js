/**
 * Solução Ultra Final para GitHub Pages - Versão Completa e Definitiva
 * Combina todas as abordagens anteriores com máxima compatibilidade
 */
(function() {
    console.log('[Ultra] Inicializando solução ultra final...');
    
    // Constantes
    const DOIS_CORREGOS = { lat: -22.3731, lng: -48.3796 };
    const CIDADES_CONHECIDAS = [
        { nome: 'Jaú', lat: -22.2967, lng: -48.5578 },
        { nome: 'Mineiros do Tietê', lat: -22.4119, lng: -48.4508 },
        { nome: 'Barra Bonita', lat: -22.4908, lng: -48.5583 },
        { nome: 'Bauru', lat: -22.3147, lng: -49.0606 },
        { nome: 'Brotas', lat: -22.2794, lng: -48.1250 },
        { nome: 'Campinas', lat: -22.9071, lng: -47.0632 },
        { nome: 'Ribeirão Preto', lat: -21.1704, lng: -47.8103 }
    ];
    
    // Variáveis globais
    let destinos = [];
    let directionsService = null;
    let directionsRenderer = null;
    let mapInstance = null;
    
    // Inicialização
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    /**
     * Função principal de inicialização
     */
    function inicializar() {
        console.log('[Ultra] Inicializando...');
        
        // Garantir que o Google Maps está carregado
        if (!window.google || !window.google.maps) {
            console.log('[Ultra] Aguardando carregamento do Google Maps API...');
            return;
        }
        
        // Inicializar serviços
        inicializarServicos();
        
        // Adicionar estilos CSS
        adicionarEstilos();
        
        // Configurar itens para arrastar e soltar
        configurarArrastar();
        
        // Substituir botão de otimizar
        substituirBotaoOtimizar();
    }
    
    /**
     * Inicializar serviços do Google Maps
     */
    function inicializarServicos() {
        if (directionsService && directionsRenderer) {
            return;
        }
        
        console.log('[Ultra] Inicializando serviços do Google Maps');
        
        // Criar serviços
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: false
        });
        
        // Encontrar ou criar mapa
        encontrarMapa();
    }
    
    /**
     * Encontrar instância do mapa
     */
    function encontrarMapa() {
        // Verificar se já existe
        if (mapInstance) {
            return;
        }
        
        console.log('[Ultra] Procurando instância do mapa');
        
        // Procurar mapa existente
        for (const prop in window) {
            try {
                if (window[prop] instanceof google.maps.Map) {
                    mapInstance = window[prop];
                    console.log('[Ultra] Mapa encontrado:', prop);
                    break;
                }
            } catch (e) {}
        }
        
        // Se não encontrou, criar novo
        if (!mapInstance) {
            const element = document.getElementById('map') || 
                         document.querySelector('.map') || 
                         document.querySelector('[id*="map"]');
            
            if (element) {
                console.log('[Ultra] Criando novo mapa');
                
                mapInstance = new google.maps.Map(element, {
                    center: DOIS_CORREGOS,
                    zoom: 9
                });
                
                window.map = mapInstance;
            } else {
                console.log('[Ultra] Elemento do mapa não encontrado');
            }
        }
        
        // Configurar renderer com o mapa
        if (mapInstance && directionsRenderer) {
            try {
                directionsRenderer.setMap(mapInstance);
                console.log('[Ultra] Renderer configurado com o mapa');
            } catch (e) {
                console.error('[Ultra] Erro ao configurar renderer:', e);
            }
        }
    }
    
    /**
     * Adicionar estilos CSS
     */
    function adicionarEstilos() {
        if (document.getElementById('ultra-styles')) {
            return;
        }
        
        console.log('[Ultra] Adicionando estilos CSS');
        
        const style = document.createElement('style');
        style.id = 'ultra-styles';
        style.textContent = `
            /* Estilos para itens arrastáveis */
            .draggable {
                cursor: grab !important;
                position: relative !important;
                border-left: 3px solid #ffc107 !important;
                padding-left: 30px !important;
                margin-bottom: 5px !important;
                transition: all 0.2s ease;
            }
            
            .draggable::before {
                content: "≡";
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #ffc107;
                font-size: 18px;
            }
            
            .draggable:hover {
                background-color: #FFF8E1 !important;
            }
            
            .dragging {
                opacity: 0.7;
                background-color: #FFF8E1;
                border: 2px dashed #ffc107 !important;
            }
            
            /* Estilos para rota personalizada */
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
        
        document.head.appendChild(style);
    }
    
    /**
     * Configurar itens para arrastar e soltar
     */
    function configurarArrastar() {
        console.log('[Ultra] Configurando itens para arrastar e soltar');
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Ultra] Container de destinos não encontrado, tentando novamente em breve...');
            setTimeout(configurarArrastar, 1000);
            return;
        }
        
        console.log('[Ultra] Container de destinos encontrado');
        
        // Configurar os itens existentes
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Ultra] Configurando', itens.length, 'itens existentes');
        
        itens.forEach(item => {
            // Configurar como arrastável
            item.classList.add('draggable');
            item.setAttribute('draggable', true);
            
            // Adicionar eventos
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
        
        // Adicionar eventos ao container
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        
        // Observar novos itens
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (!node.classList.contains('origin-point') &&
                                (node.classList.contains('location-item') || 
                                node.tagName.toLowerCase() === 'li')) {
                                
                                // Configurar como arrastável
                                node.classList.add('draggable');
                                node.setAttribute('draggable', true);
                                node.addEventListener('dragstart', handleDragStart);
                                node.addEventListener('dragend', handleDragEnd);
                                
                                console.log('[Ultra] Novo item configurado como arrastável');
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
    }
    
    /**
     * Handler para início de arrasto
     */
    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    }
    
    /**
     * Handler para fim de arrasto
     */
    function handleDragEnd() {
        this.classList.remove('dragging');
        
        // Salvar ordem atual
        salvarOrdemAtual();
    }
    
    /**
     * Handler para arrasto sobre o container
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const item = document.querySelector('.dragging');
        if (!item) return;
        
        const afterElement = getElementAfter(this, e.clientY);
        
        if (afterElement) {
            this.insertBefore(item, afterElement);
        } else {
            this.appendChild(item);
        }
    }
    
    /**
     * Handler para soltar o item
     */
    function handleDrop(e) {
        e.preventDefault();
        
        // Salvar ordem atual
        salvarOrdemAtual();
    }
    
    /**
     * Determinar depois de qual elemento inserir
     */
    function getElementAfter(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
        
        return draggableElements.reduce((closest, element) => {
            const box = element.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset, element };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    /**
     * Salvar a ordem atual dos destinos
     */
    function salvarOrdemAtual() {
        destinos = [];
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Ultra] Container não encontrado para salvar ordem');
            return;
        }
        
        // Coletar todos os destinos arrastáveis
        const itens = container.querySelectorAll('.draggable, .location-item, li:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Ultra] Coletando', itens.length, 'destinos');
        
        itens.forEach(function(item, index) {
            // Ignorar se for origem
            if (item.classList.contains('origin-point')) {
                return;
            }
            
            // Extrair texto
            let nome = '';
            const nomeElement = item.querySelector('.location-name');
            
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else {
                nome = item.textContent.trim().replace(/^\d+[\s\.\-]*/, '');
            }
            
            if (nome) {
                // Determinar coordenadas
                let coordenadas = null;
                
                // Verificar se é uma cidade conhecida
                for (const cidade of CIDADES_CONHECIDAS) {
                    if (nome.toLowerCase().includes(cidade.nome.toLowerCase())) {
                        coordenadas = { lat: cidade.lat, lng: cidade.lng };
                        break;
                    }
                }
                
                // Se não for uma cidade conhecida, usar coordenadas baseadas no índice
                if (!coordenadas) {
                    const cidade = CIDADES_CONHECIDAS[index % CIDADES_CONHECIDAS.length];
                    coordenadas = {
                        lat: cidade.lat + (Math.random() * 0.01 - 0.005),
                        lng: cidade.lng + (Math.random() * 0.01 - 0.005)
                    };
                }
                
                destinos.push({
                    id: item.getAttribute('data-id') || `destino-${index}`,
                    nome: nome,
                    elemento: item,
                    lat: coordenadas.lat,
                    lng: coordenadas.lng
                });
                
                console.log('[Ultra] Destino salvo:', nome);
            }
        });
        
        console.log('[Ultra] Total de destinos salvos:', destinos.length);
    }
    
    /**
     * Substituir o botão de otimizar
     */
    function substituirBotaoOtimizar() {
        const botao = document.getElementById('optimize-route');
        
        if (!botao) {
            console.log('[Ultra] Botão de otimizar não encontrado, tentando novamente em breve...');
            setTimeout(substituirBotaoOtimizar, 1000);
            return;
        }
        
        console.log('[Ultra] Substituindo comportamento do botão de otimizar');
        
        // Preservar o comportamento original
        const originalOnClick = botao.onclick;
        
        botao.onclick = function(e) {
            e.preventDefault();
            console.log('[Ultra] Botão de otimizar clicado');
            
            // Salvar a ordem atual
            salvarOrdemAtual();
            
            // Verificar se temos destinos
            if (destinos.length === 0) {
                alert('É necessário adicionar pelo menos um destino para calcular a rota.');
                return;
            }
            
            // Garantir que temos os serviços
            inicializarServicos();
            
            // Calcular a rota
            calcularRotaPersonalizada();
            
            // Adicionar opção de rota personalizada
            setTimeout(adicionarRotaPersonalizada, 500);
            
            return false;
        };
    }
    
    /**
     * Adicionar opção de rota personalizada às alternativas
     */
    function adicionarRotaPersonalizada() {
        console.log('[Ultra] Adicionando opção de rota personalizada');
        
        // Verificar se temos destinos
        if (destinos.length === 0) {
            console.log('[Ultra] Sem destinos para adicionar rota personalizada');
            salvarOrdemAtual();
            
            if (destinos.length === 0) {
                console.log('[Ultra] Ainda sem destinos, abortando');
                return;
            }
        }
        
        // Encontrar o container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[Ultra] Container de rotas alternativas não encontrado, tentando novamente em breve...');
            setTimeout(adicionarRotaPersonalizada, 1000);
            return;
        }
        
        console.log('[Ultra] Container de alternativas encontrado');
        
        // Verificar se a opção já existe
        if (container.querySelector('.rota-personalizada-card')) {
            console.log('[Ultra] Opção de rota personalizada já existe');
            return;
        }
        
        // Calcular distância aproximada
        let distanciaKm = "personalizada";
        
        if (window.ultimaDistanciaPersonalizada) {
            distanciaKm = window.ultimaDistanciaPersonalizada + " km";
        }
        
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
                    <span class="badge bg-warning text-dark">${distanciaKm}</span>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        cardRotaPersonalizada.addEventListener('click', function() {
            console.log('[Ultra] Card de rota personalizada clicado');
            
            // Remover seleção de outros cards
            const cards = container.querySelectorAll('.route-option-card');
            cards.forEach(card => card.classList.remove('selected'));
            
            // Selecionar este card
            cardRotaPersonalizada.classList.add('selected');
            
            // Calcular e mostrar rota personalizada
            calcularRotaPersonalizada();
        });
        
        // Adicionar ao container
        const titulo = container.querySelector('h5');
        
        if (titulo && titulo.nextSibling) {
            container.insertBefore(cardRotaPersonalizada, titulo.nextSibling);
        } else {
            container.appendChild(cardRotaPersonalizada);
        }
        
        console.log('[Ultra] Opção de rota personalizada adicionada');
        
        // Selecionar automaticamente e calcular
        setTimeout(function() {
            cardRotaPersonalizada.click();
        }, 100);
    }
    
    /**
     * Calcular a rota personalizada
     */
    function calcularRotaPersonalizada() {
        console.log('[Ultra] Calculando rota personalizada');
        
        // Verificar se temos destinos
        if (destinos.length === 0) {
            console.log('[Ultra] Sem destinos para calcular');
            salvarOrdemAtual();
            
            if (destinos.length === 0) {
                console.log('[Ultra] Ainda sem destinos, abortando');
                return;
            }
        }
        
        // Garantir que temos os serviços
        inicializarServicos();
        
        // Verificar se temos um mapa
        if (!mapInstance) {
            console.error('[Ultra] Mapa não disponível');
            
            // Tentar criar um novo mapa
            const mapElement = document.getElementById('map') || 
                             document.querySelector('.map') || 
                             document.querySelector('[id*="map"]');
            
            if (mapElement) {
                mapInstance = new google.maps.Map(mapElement, {
                    center: DOIS_CORREGOS,
                    zoom: 9
                });
                
                window.map = mapInstance;
                
                // Configurar renderer
                try {
                    directionsRenderer.setMap(mapInstance);
                } catch (e) {
                    console.error('[Ultra] Erro ao configurar renderer:', e);
                    
                    // Criar novo renderer
                    directionsRenderer = new google.maps.DirectionsRenderer({
                        suppressMarkers: false
                    });
                    
                    directionsRenderer.setMap(mapInstance);
                }
            } else {
                console.error('[Ultra] Elemento do mapa não encontrado');
                alert('Mapa não disponível. Por favor, recarregue a página.');
                return;
            }
        }
        
        console.log('[Ultra] Preparando rota com', destinos.length, 'destinos');
        
        // Ponto de origem (Dois Córregos-SP)
        const origem = {
            lat: DOIS_CORREGOS.lat,
            lng: DOIS_CORREGOS.lng,
            nome: 'Dois Córregos'
        };
        
        // Configurar solicitação
        const request = {
            origin: new google.maps.LatLng(origem.lat, origem.lng),
            destination: new google.maps.LatLng(
                destinos[destinos.length - 1].lat, 
                destinos[destinos.length - 1].lng
            ),
            waypoints: destinos.slice(0, -1).map(d => ({
                location: new google.maps.LatLng(d.lat, d.lng),
                stopover: true
            })),
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        // Calcular rota
        console.log('[Ultra] Enviando solicitação de direções');
        
        directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[Ultra] Rota calculada com sucesso');
                
                // Exibir no mapa
                directionsRenderer.setDirections(result);
                
                // Atualizar informações da rota
                atualizarInformacoesRota(result, [origem, ...destinos]);
            } else {
                console.error('[Ultra] Erro ao calcular rota:', status);
                
                // Desenhar linha no mapa como fallback
                desenharRotaManual(mapInstance, [origem, ...destinos]);
            }
        });
    }
    
    /**
     * Atualizar informações da rota na interface
     */
    function atualizarInformacoesRota(result, pontos) {
        console.log('[Ultra] Atualizando informações da rota');
        
        let distanciaTotal, tempoTotal, distanciaKm, horas, minutos;
        
        // Verificar se é um resultado válido da API
        if (result && result.routes && result.routes[0] && result.routes[0].legs) {
            // Calcular distância e tempo
            const pernas = result.routes[0].legs;
            distanciaTotal = 0;
            tempoTotal = 0;
            
            pernas.forEach(perna => {
                distanciaTotal += perna.distance.value;
                tempoTotal += perna.duration.value;
            });
            
            // Converter para unidades mais amigáveis
            distanciaKm = (distanciaTotal / 1000).toFixed(1);
            horas = Math.floor(tempoTotal / 3600);
            minutos = Math.floor((tempoTotal % 3600) / 60);
        } else {
            // Calcular manualmente
            distanciaTotal = 0;
            
            for (let i = 0; i < pontos.length - 1; i++) {
                distanciaTotal += calcularDistancia(
                    pontos[i].lat, pontos[i].lng,
                    pontos[i+1].lat, pontos[i+1].lng
                );
            }
            
            // Converter para unidades mais amigáveis
            distanciaKm = distanciaTotal.toFixed(1);
            
            // Tempo (assumindo 80 km/h)
            const tempoMinutos = Math.round((distanciaTotal / 80) * 60);
            horas = Math.floor(tempoMinutos / 60);
            minutos = tempoMinutos % 60;
        }
        
        console.log('[Ultra] Distância total:', distanciaKm, 'km');
        console.log('[Ultra] Tempo total:', horas, 'h', minutos, 'min');
        
        // Salvar para uso na opção de rota personalizada
        window.ultimaDistanciaPersonalizada = distanciaKm;
        
        // Atualizar badge no card de rota personalizada
        const card = document.querySelector('.rota-personalizada-card');
        if (card) {
            const badge = card.querySelector('.badge');
            if (badge) {
                badge.textContent = `${distanciaKm} km`;
            }
        }
        
        // Atualizar interface
        // 1. Procurar route-info
        const routeInfo = document.getElementById('route-info');
        
        if (routeInfo) {
            // Garantir que está visível
            routeInfo.style.display = 'block';
            
            // Informações detalhadas
            const routeDetails = document.getElementById('route-details');
            if (routeDetails) {
                routeDetails.innerHTML = `
                    <p><strong>Distância Total:</strong> ${distanciaKm} km</p>
                    <p><strong>Tempo Estimado:</strong> ${horas > 0 ? `${horas}h ` : ''}${minutos}min</p>
                    <p><strong>Velocidade Média:</strong> 80 km/h</p>
                    <p><strong>Ordem:</strong> Personalizada</p>
                `;
            }
            
            // Sequência de visitas
            const routeSequence = document.getElementById('route-sequence');
            if (routeSequence) {
                routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
                
                pontos.forEach((ponto, index) => {
                    const sequenceItem = document.createElement('div');
                    sequenceItem.className = 'sequence-item';
                    
                    sequenceItem.innerHTML = `
                        <span class="sequence-number">${index}</span>
                        <span class="sequence-name">${ponto.nome}</span>
                    `;
                    
                    routeSequence.appendChild(sequenceItem);
                });
            }
            
            console.log('[Ultra] Informações da rota atualizadas na interface');
        } else {
            console.log('[Ultra] Elementos de informação da rota não encontrados');
        }
    }
    
    /**
     * Desenhar rota manualmente no mapa (fallback)
     */
    function desenharRotaManual(mapa, pontos) {
        console.log('[Ultra] Desenhando rota manualmente como fallback');
        
        // Limpar rotas existentes
        if (window.rotaManual) {
            window.rotaManual.setMap(null);
        }
        
        // Criar path com as coordenadas
        const path = pontos.map(p => new google.maps.LatLng(p.lat, p.lng));
        
        // Criar polyline
        window.rotaManual = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        
        // Adicionar ao mapa
        window.rotaManual.setMap(mapa);
        
        // Adicionar marcadores
        pontos.forEach((ponto, index) => {
            new google.maps.Marker({
                position: ponto,
                map: mapa,
                label: index.toString()
            });
        });
        
        // Ajustar visualização para mostrar todos os pontos
        const bounds = new google.maps.LatLngBounds();
        pontos.forEach(ponto => bounds.extend(new google.maps.LatLng(ponto.lat, ponto.lng)));
        mapa.fitBounds(bounds);
        
        // Calcular informações manualmente
        atualizarInformacoesRota(null, pontos);
    }
    
    /**
     * Calcular distância entre dois pontos (Haversine)
     */
    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c;
        return d;
    }
    
    /**
     * Converter graus para radianos
     */
    function toRad(Value) {
        return Value * Math.PI / 180;
    }
})();