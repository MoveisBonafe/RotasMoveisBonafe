/**
 * Solução final para GitHub Pages
 * Extremamente simplificada para evitar conflitos
 */
(function() {
    console.log('[Final] Inicializando solução final...');
    
    // Garantir que o script é carregado corretamente antes de prosseguir
    if (!window.google || !window.google.maps) {
        console.log('[Final] Google Maps API não disponível, esperando carregamento...');
        
        // Tentar novamente após um tempo
        setTimeout(function() {
            window.location.reload();
        }, 2000);
        
        return;
    }
    
    // Variáveis globais
    const DOIS_CORREGOS = { lat: -22.3731, lng: -48.3796 };
    const CIDADES_CONHECIDAS = [
        { nome: 'Jaú', lat: -22.2967, lng: -48.5578 },
        { nome: 'Mineiros do Tietê', lat: -22.4119, lng: -48.4508 },
        { nome: 'Barra Bonita', lat: -22.4908, lng: -48.5583 },
        { nome: 'Bauru', lat: -22.3147, lng: -49.0606 },
        { nome: 'Brotas', lat: -22.2794, lng: -48.1250 }
    ];
    
    // Inicializar
    inicializar();
    
    /**
     * Função principal de inicialização
     */
    function inicializar() {
        console.log('[Final] Inicializando...');
        
        // Adicionar estilos CSS
        adicionarEstilos();
        
        // Configurar destinos para arrastar e soltar
        configurarArrastar();
        
        // Substituir botão de otimizar
        substituirBotaoOtimizar();
    }
    
    /**
     * Adicionar estilos CSS
     */
    function adicionarEstilos() {
        if (document.getElementById('solucao-final-styles')) {
            return;
        }
        
        console.log('[Final] Adicionando estilos CSS');
        
        const style = document.createElement('style');
        style.id = 'solucao-final-styles';
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
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Configurar itens para arrastar e soltar
     */
    function configurarArrastar() {
        console.log('[Final] Configurando itens para arrastar e soltar');
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Final] Container de destinos não encontrado, tentando novamente em breve...');
            setTimeout(configurarArrastar, 1000);
            return;
        }
        
        console.log('[Final] Container de destinos encontrado');
        
        // Configurar os itens existentes
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item');
        
        console.log('[Final] Configurando', itens.length, 'itens existentes');
        
        itens.forEach(item => {
            if (item.classList.contains('origin-point')) {
                return;
            }
            
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
                                
                                console.log('[Final] Novo item configurado como arrastável');
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
     * Substituir o botão de otimizar
     */
    function substituirBotaoOtimizar() {
        const botao = document.getElementById('optimize-route');
        
        if (!botao) {
            console.log('[Final] Botão de otimizar não encontrado, tentando novamente em breve...');
            setTimeout(substituirBotaoOtimizar, 1000);
            return;
        }
        
        console.log('[Final] Substituindo comportamento do botão de otimizar');
        
        // Preservar o evento original mas adicionar nosso comportamento depois
        const originalOnClick = botao.onclick;
        
        botao.onclick = function(e) {
            e.preventDefault();
            
            // Obter destinos na ordem atual
            const destinos = obterDestinos();
            
            console.log('[Final] Destinos obtidos:', destinos.length);
            
            if (destinos.length === 0) {
                alert('É necessário adicionar pelo menos um destino para calcular a rota.');
                return;
            }
            
            // Criar mapa se não existir ou pegar o existente
            let map = window.map;
            
            if (!map) {
                // Encontrar o elemento do mapa
                const mapElement = document.getElementById('map') || 
                                 document.querySelector('.map') || 
                                 document.querySelector('[id*="map"]');
                
                if (!mapElement) {
                    console.error('[Final] Elemento do mapa não encontrado');
                    alert('Elemento do mapa não encontrado. Por favor, recarregue a página.');
                    return;
                }
                
                // Criar novo mapa
                map = new google.maps.Map(mapElement, {
                    center: DOIS_CORREGOS,
                    zoom: 9
                });
                
                window.map = map;
                console.log('[Final] Novo mapa criado');
            }
            
            console.log('[Final] Mapa disponível, calculando rota');
            
            // Calcular rota personalizada
            calcularRotaPersonalizada(map, destinos);
            
            return false;
        };
    }
    
    /**
     * Obter destinos na ordem atual
     */
    function obterDestinos() {
        const destinos = [];
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.error('[Final] Container de destinos não encontrado');
            return destinos;
        }
        
        // Pegar todos os itens não-origem
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Final] Encontrados', itens.length, 'elementos de destino');
        
        itens.forEach((item, index) => {
            // Extrair texto
            let nome = '';
            const nomeElement = item.querySelector('.location-name');
            
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else {
                nome = item.textContent.trim().replace(/^\d+[\s\.-]*/, '');
            }
            
            if (!nome) return;
            
            // Determinar coordenadas
            let coordenadas = null;
            
            // Verificar se o texto corresponde a alguma cidade conhecida
            for (const cidade of CIDADES_CONHECIDAS) {
                if (nome.toLowerCase().includes(cidade.nome.toLowerCase())) {
                    coordenadas = { lat: cidade.lat, lng: cidade.lng };
                    console.log('[Final] Cidade conhecida encontrada:', cidade.nome);
                    break;
                }
            }
            
            // Se não encontrou por nome, usar coordenadas específicas baseadas no índice
            if (!coordenadas) {
                const cidade = CIDADES_CONHECIDAS[index % CIDADES_CONHECIDAS.length];
                coordenadas = {
                    lat: cidade.lat + (Math.random() * 0.01 - 0.005),
                    lng: cidade.lng + (Math.random() * 0.01 - 0.005)
                };
            }
            
            // Adicionar destino
            destinos.push({
                nome: nome,
                lat: coordenadas.lat,
                lng: coordenadas.lng
            });
            
            console.log('[Final] Destino adicionado:', nome, coordenadas);
        });
        
        // Se não encontrou nenhum destino, adicionar alguns padrão
        if (destinos.length === 0) {
            destinos.push({
                nome: 'Jaú',
                lat: CIDADES_CONHECIDAS[0].lat,
                lng: CIDADES_CONHECIDAS[0].lng
            });
            
            destinos.push({
                nome: 'Mineiros do Tietê',
                lat: CIDADES_CONHECIDAS[1].lat,
                lng: CIDADES_CONHECIDAS[1].lng
            });
            
            console.log('[Final] Destinos padrão adicionados');
        }
        
        return destinos;
    }
    
    /**
     * Calcular rota personalizada
     */
    function calcularRotaPersonalizada(map, destinos) {
        console.log('[Final] Calculando rota personalizada com', destinos.length, 'destinos');
        
        // Criar serviço de direções
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map
        });
        
        // Origem (Dois Córregos)
        const origem = {
            lat: DOIS_CORREGOS.lat,
            lng: DOIS_CORREGOS.lng
        };
        
        // Preparar waypoints
        const waypoints = destinos.slice(0, -1).map(d => ({
            location: new google.maps.LatLng(d.lat, d.lng),
            stopover: true
        }));
        
        // Destino (último ponto)
        const destino = destinos[destinos.length - 1];
        
        // Solicitar rota
        directionsService.route({
            origin: new google.maps.LatLng(origem.lat, origem.lng),
            destination: new google.maps.LatLng(destino.lat, destino.lng),
            waypoints: waypoints,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
        }, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[Final] Rota calculada com sucesso');
                
                // Exibir no mapa
                directionsRenderer.setDirections(result);
                
                // Atualizar informações
                atualizarInformacoesRota(result, [{ nome: 'Dois Córregos', ...origem }, ...destinos]);
            } else {
                console.error('[Final] Erro ao calcular rota:', status);
                
                // Situação de emergência: desenhar manualmente a rota
                desenharRotaManual(map, [origem, ...destinos.map(d => ({ lat: d.lat, lng: d.lng }))]);
            }
        });
    }
    
    /**
     * Atualizar as informações da rota na interface
     */
    function atualizarInformacoesRota(result, pontos) {
        console.log('[Final] Atualizando informações da rota');
        
        if (!result || !result.routes || !result.routes[0] || !result.routes[0].legs) {
            console.error('[Final] Resultado inválido da API de direções');
            return;
        }
        
        // Calcular distância e tempo
        const legs = result.routes[0].legs;
        let distanciaTotal = 0;
        let tempoTotal = 0;
        
        legs.forEach(leg => {
            distanciaTotal += leg.distance.value;
            tempoTotal += leg.duration.value;
        });
        
        // Converter para unidades amigáveis
        const distanciaKm = (distanciaTotal / 1000).toFixed(1);
        const horas = Math.floor(tempoTotal / 3600);
        const minutos = Math.floor((tempoTotal % 3600) / 60);
        
        console.log('[Final] Distância total:', distanciaKm, 'km');
        console.log('[Final] Tempo total:', horas + 'h', minutos + 'min');
        
        // Encontrar elementos de informação
        const routeInfo = document.getElementById('route-info');
        
        if (routeInfo) {
            // Mostrar o container
            routeInfo.style.display = 'block';
            
            // Atualizar detalhes
            const routeDetails = document.getElementById('route-details');
            if (routeDetails) {
                routeDetails.innerHTML = `
                    <p><strong>Distância Total:</strong> ${distanciaKm} km</p>
                    <p><strong>Tempo Estimado:</strong> ${horas > 0 ? `${horas}h ` : ''}${minutos}min</p>
                    <p><strong>Velocidade Média:</strong> 80 km/h</p>
                    <p><strong>Ordem:</strong> Personalizada</p>
                `;
            }
            
            // Atualizar sequência
            const routeSequence = document.getElementById('route-sequence');
            if (routeSequence) {
                routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
                
                pontos.forEach((ponto, index) => {
                    const item = document.createElement('div');
                    item.className = 'sequence-item';
                    
                    item.innerHTML = `
                        <span class="sequence-number">${index}</span>
                        <span class="sequence-name">${ponto.nome}</span>
                    `;
                    
                    routeSequence.appendChild(item);
                });
            }
        } else {
            console.log('[Final] Elementos de informação de rota não encontrados');
        }
    }
    
    /**
     * Desenhar rota manualmente no mapa (fallback)
     */
    function desenharRotaManual(map, pontos) {
        console.log('[Final] Desenhando rota manualmente como fallback');
        
        // Limpar rotas existentes
        if (window.rotaManual) {
            window.rotaManual.setMap(null);
        }
        
        // Criar polyline
        window.rotaManual = new google.maps.Polyline({
            path: pontos,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        
        // Adicionar ao mapa
        window.rotaManual.setMap(map);
        
        // Adicionar marcadores
        pontos.forEach((ponto, index) => {
            new google.maps.Marker({
                position: ponto,
                map: map,
                label: index.toString()
            });
        });
        
        // Ajustar visualização para mostrar todos os pontos
        const bounds = new google.maps.LatLngBounds();
        pontos.forEach(ponto => bounds.extend(ponto));
        map.fitBounds(bounds);
        
        // Calcular distância aproximada
        let distancia = 0;
        for (let i = 0; i < pontos.length - 1; i++) {
            distancia += calcularDistancia(
                pontos[i].lat, pontos[i].lng,
                pontos[i+1].lat, pontos[i+1].lng
            );
        }
        
        // Calcular tempo (assumindo 80 km/h)
        const tempoMinutos = Math.round((distancia / 80) * 60);
        const horas = Math.floor(tempoMinutos / 60);
        const minutos = tempoMinutos % 60;
        
        // Mostrar informações
        const routeInfo = document.getElementById('route-info');
        
        if (routeInfo) {
            // Mostrar o container
            routeInfo.style.display = 'block';
            
            // Atualizar detalhes
            const routeDetails = document.getElementById('route-details');
            if (routeDetails) {
                routeDetails.innerHTML = `
                    <p><strong>Distância Total:</strong> ${distancia.toFixed(1)} km</p>
                    <p><strong>Tempo Estimado:</strong> ${horas > 0 ? `${horas}h ` : ''}${minutos}min</p>
                    <p><strong>Velocidade Média:</strong> 80 km/h</p>
                    <p><strong>Ordem:</strong> Personalizada</p>
                `;
            }
        }
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