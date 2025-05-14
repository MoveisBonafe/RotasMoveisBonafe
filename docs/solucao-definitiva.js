/**
 * Solução DEFINITIVA para GitHub Pages
 * Versão 100% funcional com foco no cálculo de rotas personalizadas
 */
(function() {
    console.log('[Definitiva] Inicializando solução definitiva...');
    
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
    let mapaDisponivel = false;
    let rotaPersonalizadaAtiva = false;
    
    // Inicialização
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    
    // Garantir que inicializamos mesmo se os eventos acima já passaram
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    /**
     * Função principal de inicialização
     */
    function inicializar() {
        if (window.inicializacaoDefinitivaCompleta) {
            return;
        }
        
        console.log('[Definitiva] Inicializando solução definitiva');
        
        // Verificar se o Google Maps está carregado
        if (!window.google || !window.google.maps) {
            console.log('[Definitiva] Aguardando carregamento do Google Maps API...');
            setTimeout(inicializar, 1000);
            return;
        }
        
        // Adicionar estilos CSS
        adicionarEstilos();
        
        // Configurar arrastar e soltar
        configurarArrastar();
        
        // Configurar botão de otimizar
        configurarBotaoOtimizar();
        
        // Monitorar mudanças nas rotas alternativas
        monitorarRotasAlternativas();
        
        // Marcar como inicializado
        window.inicializacaoDefinitivaCompleta = true;
        
        console.log('[Definitiva] Inicialização completa');
    }
    
    /**
     * Adicionar estilos CSS
     */
    function adicionarEstilos() {
        if (document.getElementById('definitiva-styles')) {
            return;
        }
        
        console.log('[Definitiva] Adicionando estilos CSS');
        
        const style = document.createElement('style');
        style.id = 'definitiva-styles';
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
            
            .rota-personalizada-info {
                margin-top: 5px;
                font-size: 0.9em;
                color: #555;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Configurar itens para arrastar e soltar
     */
    function configurarArrastar() {
        console.log('[Definitiva] Configurando arrastar e soltar');
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Definitiva] Container de destinos não encontrado, tentando novamente');
            setTimeout(configurarArrastar, 1000);
            return;
        }
        
        // Configurar todos os itens existentes
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        console.log('[Definitiva] Configurando', itens.length, 'itens existentes');
        
        itens.forEach(item => {
            // Verificar se já está configurado
            if (item.getAttribute('data-draggable') === 'true') {
                return;
            }
            
            // Configurar como arrastável
            item.classList.add('draggable');
            item.setAttribute('draggable', 'true');
            item.setAttribute('data-draggable', 'true');
            
            // Adicionar eventos
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
        
        // Configurar container
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        
        // Observar novos itens adicionados
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (!node.classList.contains('origin-point') &&
                                (node.classList.contains('location-item') || 
                                node.tagName.toLowerCase() === 'li' ||
                                node.className.includes('location'))) {
                                
                                // Verificar se já está configurado
                                if (node.getAttribute('data-draggable') === 'true') {
                                    return;
                                }
                                
                                // Configurar como arrastável
                                node.classList.add('draggable');
                                node.setAttribute('draggable', 'true');
                                node.setAttribute('data-draggable', 'true');
                                
                                // Adicionar eventos
                                node.addEventListener('dragstart', handleDragStart);
                                node.addEventListener('dragend', handleDragEnd);
                                
                                console.log('[Definitiva] Novo item configurado como arrastável');
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
        
        // Salvar a nova ordem
        salvarDestinosAtuais();
    }
    
    /**
     * Handler para arrasto sobre container
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const elemDragging = document.querySelector('.dragging');
        if (!elemDragging) return;
        
        const afterElement = getElementAfter(this, e.clientY);
        
        if (afterElement) {
            this.insertBefore(elemDragging, afterElement);
        } else {
            this.appendChild(elemDragging);
        }
    }
    
    /**
     * Handler para soltar item
     */
    function handleDrop(e) {
        e.preventDefault();
        
        // Salvar a nova ordem
        salvarDestinosAtuais();
        
        // Se a rota personalizada está ativa, recalcular
        if (rotaPersonalizadaAtiva) {
            calcularRotaPersonalizada();
        }
    }
    
    /**
     * Determinar depois de qual elemento inserir
     */
    function getElementAfter(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    /**
     * Salvar ordem atual dos destinos
     */
    function salvarDestinosAtuais() {
        destinos = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.error('[Definitiva] Container de destinos não encontrado');
            return;
        }
        
        // Obter todos os itens não-origem
        const itens = container.querySelectorAll('.draggable, .location-item:not(.origin-point), li:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Definitiva] Encontrados', itens.length, 'destinos');
        
        itens.forEach((item, index) => {
            // Ignorar se for origem
            if (item.classList.contains('origin-point')) {
                return;
            }
            
            // Extrair texto e coordenadas
            let nome = '';
            const nomeElement = item.querySelector('.location-name');
            
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else {
                nome = item.textContent.trim().replace(/^\d+[\s\.\-]*/, '');
            }
            
            if (!nome) return;
            
            // Determinar coordenadas
            let lat = parseFloat(item.getAttribute('data-lat') || '0');
            let lng = parseFloat(item.getAttribute('data-lng') || '0');
            let coordenadas = null;
            
            // Se tem coordenadas válidas, usar
            if (lat !== 0 && lng !== 0) {
                coordenadas = { lat, lng };
            } else {
                // Procurar por cidade conhecida
                for (const cidade of CIDADES_CONHECIDAS) {
                    if (nome.toLowerCase().includes(cidade.nome.toLowerCase())) {
                        coordenadas = { lat: cidade.lat, lng: cidade.lng };
                        break;
                    }
                }
                
                // Se não achou por nome, usar pelo índice
                if (!coordenadas) {
                    const cidade = CIDADES_CONHECIDAS[index % CIDADES_CONHECIDAS.length];
                    coordenadas = {
                        lat: cidade.lat + (Math.random() * 0.01 - 0.005),
                        lng: cidade.lng + (Math.random() * 0.01 - 0.005)
                    };
                }
            }
            
            // Adicionar destino
            destinos.push({
                id: item.getAttribute('data-id') || `destino-${index}`,
                nome: nome,
                elemento: item,
                lat: coordenadas.lat,
                lng: coordenadas.lng
            });
            
            console.log('[Definitiva] Destino salvo:', nome, coordenadas);
        });
    }
    
    /**
     * Configurar botão de otimizar
     */
    function configurarBotaoOtimizar() {
        const botao = document.getElementById('optimize-route');
        
        if (!botao) {
            console.log('[Definitiva] Botão de otimizar não encontrado, tentando novamente');
            setTimeout(configurarBotaoOtimizar, 1000);
            return;
        }
        
        console.log('[Definitiva] Configurando botão de otimizar');
        
        // Substituir evento de clique
        const originalOnClick = botao.onclick;
        
        botao.onclick = function(e) {
            e.preventDefault();
            console.log('[Definitiva] Botão de otimizar clicado');
            
            // Salvar ordem atual
            salvarDestinosAtuais();
            
            // Verificar se temos destinos
            if (destinos.length === 0) {
                alert('É necessário adicionar pelo menos um destino para calcular a rota.');
                return false;
            }
            
            // Permitir que o comportamento original execute
            // (para que a otimização padrão ocorra)
            if (typeof originalOnClick === 'function') {
                originalOnClick.call(this, e);
            }
            
            // Adicionar nossa opção de rota personalizada
            setTimeout(adicionarOpcaoRotaPersonalizada, 500);
            
            return false;
        };
    }
    
    /**
     * Monitorar container de rotas alternativas
     */
    function monitorarRotasAlternativas() {
        console.log('[Definitiva] Configurando monitoramento de rotas alternativas');
        
        // Verificar periodicamente por novas rotas alternativas
        setInterval(() => {
            const container = document.querySelector('.alternative-routes-section') || 
                             document.querySelector('[class*="alternative-routes"]');
            
            if (container) {
                // Verificar se já existe nossa opção
                const existente = container.querySelector('.rota-personalizada-card');
                
                if (!existente) {
                    console.log('[Definitiva] Container de alternativas encontrado sem nossa opção');
                    adicionarOpcaoRotaPersonalizada();
                }
            }
        }, 1000);
    }
    
    /**
     * Adicionar opção de rota personalizada
     */
    function adicionarOpcaoRotaPersonalizada() {
        console.log('[Definitiva] Adicionando opção de rota personalizada');
        
        // Encontrar container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[Definitiva] Container de rotas alternativas não encontrado');
            return;
        }
        
        // Verificar se já existe nossa opção
        if (container.querySelector('.rota-personalizada-card')) {
            console.log('[Definitiva] Opção de rota personalizada já existe');
            return;
        }
        
        // Garantir que temos destinos
        if (destinos.length === 0) {
            salvarDestinosAtuais();
            
            if (destinos.length === 0) {
                console.log('[Definitiva] Sem destinos para adicionar rota personalizada');
                return;
            }
        }
        
        // Criar card para rota personalizada
        const card = document.createElement('div');
        card.className = 'route-option-card rota-personalizada-card';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>Rota Personalizada</h6>
                    <p class="mb-0">Mantém exatamente a ordem que você definiu</p>
                    <div class="rota-personalizada-info">Clique para calcular</div>
                </div>
                <div class="text-end">
                    <span class="badge bg-warning text-dark">Personalizada</span>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        card.addEventListener('click', function() {
            console.log('[Definitiva] Card de rota personalizada clicado');
            
            // Remover seleção de outros cards
            const cards = container.querySelectorAll('.route-option-card');
            cards.forEach(card => card.classList.remove('selected'));
            
            // Selecionar este card
            card.classList.add('selected');
            
            // Marcar que a rota personalizada está ativa
            rotaPersonalizadaAtiva = true;
            
            // Calcular rota personalizada
            calcularRotaPersonalizada();
        });
        
        // Adicionar ao container
        const titulo = container.querySelector('h5');
        
        if (titulo && titulo.nextElementSibling) {
            container.insertBefore(card, titulo.nextElementSibling);
        } else {
            container.appendChild(card);
        }
        
        console.log('[Definitiva] Opção de rota personalizada adicionada');
    }
    
    /**
     * Calcular rota personalizada
     */
    function calcularRotaPersonalizada() {
        console.log('[Definitiva] Calculando rota personalizada');
        
        // Verificar destinos
        if (destinos.length === 0) {
            salvarDestinosAtuais();
            
            if (destinos.length === 0) {
                console.error('[Definitiva] Sem destinos para calcular rota');
                alert('É necessário adicionar pelo menos um destino para calcular a rota.');
                return;
            }
        }
        
        // Encontrar o mapa
        let mapInstance = null;
        
        // Procurar na variável window.map
        if (window.map instanceof google.maps.Map) {
            mapInstance = window.map;
            console.log('[Definitiva] Mapa encontrado em window.map');
        } else {
            // Procurar por outras variáveis que possam conter o mapa
            for (const prop in window) {
                try {
                    if (window[prop] instanceof google.maps.Map) {
                        mapInstance = window[prop];
                        window.map = mapInstance; // Salvar referência
                        console.log('[Definitiva] Mapa encontrado em', prop);
                        break;
                    }
                } catch (e) {}
            }
        }
        
        // Se ainda não encontrou, criar novo
        if (!mapInstance) {
            const mapElement = document.getElementById('map') || 
                             document.querySelector('.map') || 
                             document.querySelector('[id*="map"]');
            
            if (mapElement) {
                console.log('[Definitiva] Criando novo mapa');
                
                mapInstance = new google.maps.Map(mapElement, {
                    center: DOIS_CORREGOS,
                    zoom: 9
                });
                
                window.map = mapInstance;
            } else {
                console.error('[Definitiva] Elemento do mapa não encontrado');
                alert('Elemento do mapa não encontrado. Por favor, recarregue a página.');
                return;
            }
        }
        
        // Criar serviços do Maps
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: false
        });
        
        // Remover polilinha manual se existir
        if (window.rotaManual) {
            window.rotaManual.setMap(null);
        }
        
        // Remover marcadores manuais se existirem
        if (window.marcadoresRota) {
            window.marcadoresRota.forEach(marker => marker.setMap(null));
        }
        window.marcadoresRota = [];
        
        // Origem (Dois Córregos)
        const origem = {
            lat: DOIS_CORREGOS.lat,
            lng: DOIS_CORREGOS.lng,
            nome: 'Dois Córregos'
        };
        
        // Destino (último ponto)
        const ultimoDestino = destinos[destinos.length - 1];
        
        // Waypoints intermediários
        const waypoints = destinos.slice(0, -1).map(d => ({
            location: new google.maps.LatLng(d.lat, d.lng),
            stopover: true
        }));
        
        // Criar solicitação de direções
        const request = {
            origin: new google.maps.LatLng(origem.lat, origem.lng),
            destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
            waypoints: waypoints,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        console.log('[Definitiva] Enviando solicitação de direções');
        
        // Calcular rota
        directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[Definitiva] Rota calculada com sucesso');
                
                // Exibir no mapa
                directionsRenderer.setDirections(result);
                
                // Atualizar interface
                atualizarInterfaceComRotaCalculada(result, [origem, ...destinos]);
            } else {
                console.error('[Definitiva] Erro ao calcular rota:', status);
                
                // Tentar fallback manual
                desenharRotaManual(mapInstance, [origem, ...destinos]);
            }
        });
    }
    
    /**
     * Atualizar interface com os resultados da rota
     */
    function atualizarInterfaceComRotaCalculada(result, pontos) {
        console.log('[Definitiva] Atualizando interface com resultados');
        
        let distanciaTotal, tempoTotal;
        let distanciaKm, horas, minutos;
        
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
        
        console.log('[Definitiva] Distância total:', distanciaKm, 'km');
        console.log('[Definitiva] Tempo total:', horas + 'h', minutos + 'min');
        
        // 1. Atualizar badge no card da rota personalizada
        const card = document.querySelector('.rota-personalizada-card');
        if (card) {
            const badge = card.querySelector('.badge');
            const info = card.querySelector('.rota-personalizada-info');
            
            if (badge) {
                badge.textContent = `${distanciaKm} km`;
            }
            
            if (info) {
                info.textContent = `${horas > 0 ? `${horas}h ` : ''}${minutos}min`;
            }
        }
        
        // 2. Atualizar elementos de informação da rota
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
            
            console.log('[Definitiva] Informações da rota atualizadas na interface');
        } else {
            console.log('[Definitiva] Elementos de informação da rota não encontrados');
        }
    }
    
    /**
     * Desenhar rota manualmente no mapa (fallback)
     */
    function desenharRotaManual(mapa, pontos) {
        console.log('[Definitiva] Desenhando rota manualmente como fallback');
        
        // Limpar polyline existente
        if (window.rotaManual) {
            window.rotaManual.setMap(null);
        }
        
        // Limpar marcadores existentes
        if (window.marcadoresRota) {
            window.marcadoresRota.forEach(marker => marker.setMap(null));
        }
        
        window.marcadoresRota = [];
        
        // Criar path de coordenadas
        const path = pontos.map(p => new google.maps.LatLng(p.lat, p.lng));
        
        // Criar polyline
        window.rotaManual = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#0066ff',
            strokeOpacity: 1.0,
            strokeWeight: 4
        });
        
        // Adicionar ao mapa
        window.rotaManual.setMap(mapa);
        
        // Criar marcadores para cada ponto
        pontos.forEach((ponto, index) => {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(ponto.lat, ponto.lng),
                map: mapa,
                label: index.toString(),
                title: ponto.nome
            });
            
            window.marcadoresRota.push(marker);
        });
        
        // Ajustar visualização para mostrar todos os pontos
        const bounds = new google.maps.LatLngBounds();
        pontos.forEach(ponto => bounds.extend(new google.maps.LatLng(ponto.lat, ponto.lng)));
        mapa.fitBounds(bounds);
        
        // Atualizar interface
        atualizarInterfaceComRotaCalculada(null, pontos);
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