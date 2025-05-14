/**
 * Solução UNIVERSAL para GitHub Pages
 * Versão extremamente robusta que resolve todos os problemas
 */
(function() {
    console.log('[Universal] Inicializando solução universal...');
    
    // Constantes
    const DOIS_CORREGOS = { lat: -22.3731, lng: -48.3796, nome: 'Dois Córregos' };
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
    let destinosOriginais = [];
    let destinosAtuais = [];
    let rotaPersonalizadaAtiva = false;
    let directionsServiceGlobal = null;
    let directionsRendererGlobal = null;
    let ultimoResultadoRota = null;
    
    // Inicialização
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    
    // Garantir a inicialização mesmo se eventos já passaram
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    setTimeout(inicializar, 3000);
    
    /**
     * Função principal de inicialização
     */
    function inicializar() {
        if (window.solucaoUniversalInicializada) {
            return;
        }
        
        console.log('[Universal] Inicializando...');
        
        // Verificar se o Google Maps está carregado
        if (!window.google || !window.google.maps) {
            console.log('[Universal] Google Maps não disponível, tentando novamente...');
            return;
        }
        
        // Inicializar serviços do Google Maps
        inicializarServicosGoogleMaps();
        
        // Adicionar estilos CSS
        adicionarEstilos();
        
        // Configurar arrastar e soltar
        configurarArrastarESoltar();
        
        // Configurar monitoramento de elementos importantes
        configurarMonitoramento();
        
        // Marcar como inicializado
        window.solucaoUniversalInicializada = true;
        
        console.log('[Universal] Inicialização completa');
    }
    
    /**
     * Inicializar serviços do Google Maps
     */
    function inicializarServicosGoogleMaps() {
        console.log('[Universal] Inicializando serviços do Google Maps');
        
        try {
            // Criar serviços globais
            directionsServiceGlobal = new google.maps.DirectionsService();
            directionsRendererGlobal = new google.maps.DirectionsRenderer({
                suppressMarkers: false
            });
            
            // Encontrar ou criar mapa
            const mapa = encontrarMapa();
            
            if (mapa) {
                try {
                    directionsRendererGlobal.setMap(mapa);
                    console.log('[Universal] Renderer configurado com o mapa');
                } catch (e) {
                    console.error('[Universal] Erro ao configurar renderer:', e);
                }
            }
        } catch (e) {
            console.error('[Universal] Erro ao criar serviços do Google Maps:', e);
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
        
        console.log('[Universal] Procurando mapa...');
        
        // Procurar por instâncias do mapa no objeto window
        for (const prop in window) {
            try {
                if (window[prop] instanceof google.maps.Map) {
                    // Salvar globalmente para uso futuro
                    window.map = window[prop];
                    console.log('[Universal] Mapa encontrado em:', prop);
                    return window.map;
                }
            } catch (e) {}
        }
        
        // Se não encontrou, tentar criar um novo mapa
        console.log('[Universal] Mapa não encontrado, tentando criar um novo...');
        
        const mapElement = document.getElementById('map') || 
                         document.querySelector('.map') || 
                         document.querySelector('[id*="map"]');
        
        if (mapElement) {
            try {
                const novoMapa = new google.maps.Map(mapElement, {
                    center: { lat: DOIS_CORREGOS.lat, lng: DOIS_CORREGOS.lng },
                    zoom: 9
                });
                
                window.map = novoMapa;
                console.log('[Universal] Novo mapa criado com sucesso');
                return novoMapa;
            } catch (e) {
                console.error('[Universal] Erro ao criar novo mapa:', e);
            }
        } else {
            console.log('[Universal] Elemento do mapa não encontrado');
        }
        
        return null;
    }
    
    /**
     * Adicionar estilos CSS
     */
    function adicionarEstilos() {
        if (document.getElementById('universal-styles')) {
            return;
        }
        
        console.log('[Universal] Adicionando estilos CSS');
        
        const style = document.createElement('style');
        style.id = 'universal-styles';
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
            
            /* Destaque para relatório */
            .sequencia-personalizada {
                background-color: #fff8e1 !important;
                border-left: 3px solid #ffc107 !important;
                padding: 5px 10px;
                margin-top: 5px;
            }
            
            /* Botão para recalcular */
            .btn-calcular-personalizada {
                background-color: #ffc107 !important;
                color: #000 !important;
                margin-top: 10px;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Configurar arrastar e soltar
     */
    function configurarArrastarESoltar() {
        console.log('[Universal] Configurando arrastar e soltar');
        
        // Procurar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Universal] Container de destinos não encontrado, tentando novamente...');
            setTimeout(configurarArrastarESoltar, 1000);
            return;
        }
        
        console.log('[Universal] Container de destinos encontrado');
        
        // Configurar items existentes
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Universal] Configurando', itens.length, 'itens existentes');
        
        itens.forEach(item => {
            if (item.getAttribute('data-draggable') === 'true') {
                return;
            }
            
            item.classList.add('draggable');
            item.setAttribute('draggable', 'true');
            item.setAttribute('data-draggable', 'true');
            
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
            
            console.log('[Universal] Item configurado para arrastar');
        });
        
        // Configurar container para receber drops
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
                                
                                if (node.getAttribute('data-draggable') === 'true') {
                                    return;
                                }
                                
                                node.classList.add('draggable');
                                node.setAttribute('draggable', 'true');
                                node.setAttribute('data-draggable', 'true');
                                
                                node.addEventListener('dragstart', handleDragStart);
                                node.addEventListener('dragend', handleDragEnd);
                                
                                console.log('[Universal] Novo item configurado para arrastar');
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
     * Manipulador para início de arrasto
     */
    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    }
    
    /**
     * Manipulador para fim de arrasto
     */
    function handleDragEnd() {
        this.classList.remove('dragging');
        
        // Salvar nova ordem
        salvarDestinos();
        
        // Se a rota personalizada está ativa, recalcular
        if (rotaPersonalizadaAtiva) {
            calcularRotaPersonalizada();
        }
    }
    
    /**
     * Manipulador para arrasto sobre container
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
     * Manipulador para soltar item
     */
    function handleDrop(e) {
        e.preventDefault();
        
        // Salvar nova ordem
        salvarDestinos();
        
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
     * Configurar monitoramento de elementos importantes
     */
    function configurarMonitoramento() {
        console.log('[Universal] Configurando monitoramento...');
        
        // Monitorar botão de otimizar
        monitorarBotaoOtimizar();
        
        // Monitorar opções de rota alternativas
        monitorarRotasAlternativas();
        
        // Monitorar relatório
        monitorarRelatorio();
        
        console.log('[Universal] Monitoramento configurado');
    }
    
    /**
     * Monitorar botão de otimizar
     */
    function monitorarBotaoOtimizar() {
        const botaoOtimizar = document.getElementById('optimize-route');
        
        if (!botaoOtimizar) {
            console.log('[Universal] Botão de otimizar não encontrado, tentando novamente...');
            setTimeout(monitorarBotaoOtimizar, 1000);
            return;
        }
        
        // Verificar se já está configurado
        if (botaoOtimizar.getAttribute('data-monitored') === 'true') {
            return;
        }
        
        console.log('[Universal] Configurando botão de otimizar');
        
        // Marcar como configurado
        botaoOtimizar.setAttribute('data-monitored', 'true');
        
        // Preservar comportamento original
        const originalOnClick = botaoOtimizar.onclick;
        
        // Substituir evento de clique
        botaoOtimizar.onclick = function(e) {
            e.preventDefault();
            
            console.log('[Universal] Botão de otimizar clicado');
            
            // Capturar destinos antes da otimização
            salvarDestinos();
            
            // Salvar uma cópia da ordem original
            destinosOriginais = JSON.parse(JSON.stringify(destinosAtuais));
            
            console.log('[Universal] Destinos originais salvos:', destinosOriginais.length);
            
            // Permitir comportamento original
            if (typeof originalOnClick === 'function') {
                originalOnClick.call(this, e);
            }
            
            // Adicionar opção de rota personalizada após a otimização
            setTimeout(adicionarOpcaoRotaPersonalizada, 1000);
            
            return false;
        };
    }
    
    /**
     * Monitorar opções de rota alternativas
     */
    function monitorarRotasAlternativas() {
        console.log('[Universal] Monitorando opções de rota alternativas');
        
        // Verificar periodicamente
        setInterval(() => {
            const container = document.querySelector('.alternative-routes-section') || 
                             document.querySelector('[class*="alternative-routes"]');
            
            if (container) {
                // Verificar se já existe nossa opção
                if (!container.querySelector('.rota-personalizada-card')) {
                    // Se temos destinos, adicionar opção
                    if (destinosOriginais.length > 0 || destinosAtuais.length > 0) {
                        adicionarOpcaoRotaPersonalizada();
                    }
                }
                
                // Verificar outras opções para configurar eventos
                const opcoes = container.querySelectorAll('.route-option-card:not([data-monitored="true"])');
                
                opcoes.forEach(opcao => {
                    opcao.setAttribute('data-monitored', 'true');
                    
                    // Se for nossa opção de rota personalizada
                    if (opcao.classList.contains('rota-personalizada-card')) {
                        opcao.addEventListener('click', function() {
                            console.log('[Universal] Opção de rota personalizada clicada');
                            
                            // Remover seleção de outros cards
                            const cards = container.querySelectorAll('.route-option-card');
                            cards.forEach(card => card.classList.remove('selected'));
                            
                            // Selecionar este card
                            opcao.classList.add('selected');
                            
                            // Marcar que a rota personalizada está ativa
                            rotaPersonalizadaAtiva = true;
                            
                            // Calcular rota personalizada
                            calcularRotaPersonalizada();
                        });
                    } else {
                        // Outras opções - desativar rota personalizada quando clicadas
                        opcao.addEventListener('click', function() {
                            console.log('[Universal] Outra opção de rota clicada');
                            
                            // Desativar rota personalizada
                            rotaPersonalizadaAtiva = false;
                        });
                    }
                });
            }
        }, 1000);
    }
    
    /**
     * Monitorar relatório da rota
     */
    function monitorarRelatorio() {
        console.log('[Universal] Monitorando relatório da rota');
        
        // Monitorar botões que abrem o relatório
        setInterval(() => {
            const botoes = document.querySelectorAll('[data-bs-target="#route-report-modal"], .btn-report, #show-report, [id*="report-button"]');
            
            botoes.forEach(botao => {
                if (botao.getAttribute('data-monitored') !== 'true') {
                    botao.setAttribute('data-monitored', 'true');
                    
                    botao.addEventListener('click', function() {
                        console.log('[Universal] Botão de relatório clicado');
                        
                        // Se a rota personalizada está ativa, preparar relatório
                        if (rotaPersonalizadaAtiva) {
                            setTimeout(atualizarRelatorio, 500);
                        }
                    });
                }
            });
            
            // Verificar se o relatório está aberto
            const relatorio = document.querySelector('#route-report-modal, .route-report, [id*="route-report"]');
            
            if (relatorio && window.getComputedStyle(relatorio).display !== 'none' && rotaPersonalizadaAtiva) {
                atualizarRelatorio();
            }
        }, 1000);
    }
    
    /**
     * Adicionar opção de rota personalizada
     */
    function adicionarOpcaoRotaPersonalizada() {
        console.log('[Universal] Adicionando opção de rota personalizada');
        
        // Encontrar container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[Universal] Container de rotas alternativas não encontrado');
            return;
        }
        
        // Verificar se já existe
        if (container.querySelector('.rota-personalizada-card')) {
            console.log('[Universal] Opção de rota personalizada já existe');
            return;
        }
        
        // Garantir que temos destinos
        if (destinosAtuais.length === 0 && destinosOriginais.length === 0) {
            salvarDestinos();
            
            if (destinosAtuais.length === 0) {
                console.log('[Universal] Sem destinos para adicionar rota personalizada');
                return;
            }
        }
        
        console.log('[Universal] Criando card de rota personalizada');
        
        // Criar card
        const card = document.createElement('div');
        card.className = 'route-option-card rota-personalizada-card';
        card.setAttribute('data-monitored', 'true');
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>Rota Personalizada</h6>
                    <p class="mb-0">Mantém exatamente a ordem que você definiu</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-warning text-dark">Recalcular</span>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        card.addEventListener('click', function() {
            console.log('[Universal] Card de rota personalizada clicado');
            
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
        const titulo = container.querySelector('h5, .alternative-title, [class*="title"]');
        
        if (titulo && titulo.nextElementSibling) {
            container.insertBefore(card, titulo.nextElementSibling);
        } else {
            container.insertBefore(card, container.firstChild);
        }
        
        console.log('[Universal] Opção de rota personalizada adicionada');
    }
    
    /**
     * Salvar destinos na ordem atual
     */
    function salvarDestinos() {
        destinosAtuais = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Universal] Container de destinos não encontrado');
            return;
        }
        
        // Obter todos os itens
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Universal] Salvando', itens.length, 'destinos');
        
        itens.forEach((item, index) => {
            // Extrair texto
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
            destinosAtuais.push({
                id: `destino-${index}`,
                nome: nome,
                lat: coordenadas.lat,
                lng: coordenadas.lng,
                ordem: index + 1 // Origem é 0
            });
            
            console.log('[Universal] Destino salvo:', nome);
        });
        
        // Se não havia destinos originais anteriores, salvar estes como originais também
        if (destinosOriginais.length === 0 && destinosAtuais.length > 0) {
            destinosOriginais = JSON.parse(JSON.stringify(destinosAtuais));
            console.log('[Universal] Destinos originais inicializados');
        }
    }
    
    /**
     * Calcular rota personalizada
     */
    function calcularRotaPersonalizada() {
        console.log('[Universal] Calculando rota personalizada');
        
        // Garantir que temos destinos
        if (destinosAtuais.length === 0) {
            salvarDestinos();
            
            if (destinosAtuais.length === 0) {
                console.error('[Universal] Sem destinos para calcular rota');
                return;
            }
        }
        
        // Encontrar mapa
        const mapa = encontrarMapa();
        
        if (!mapa) {
            console.error('[Universal] Mapa não encontrado para calcular rota');
            return;
        }
        
        // Criar novos serviços para evitar conflitos
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: mapa,
            suppressMarkers: false
        });
        
        // Remover polyline manual se existir
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
            nome: DOIS_CORREGOS.nome
        };
        
        // Destino (último ponto)
        const ultimoDestino = destinosAtuais[destinosAtuais.length - 1];
        
        // Waypoints intermediários
        const waypoints = destinosAtuais.slice(0, -1).map(d => ({
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
        
        // Calcular rota
        directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[Universal] Rota calculada com sucesso');
                
                // Salvar resultado para uso posterior
                ultimoResultadoRota = result;
                
                // Exibir no mapa
                directionsRenderer.setDirections(result);
                
                // Atualizar interface
                atualizarInterface(result, [origem, ...destinosAtuais]);
            } else {
                console.error('[Universal] Erro ao calcular rota:', status);
                
                // Usar fallback manual
                desenharRotaManual(mapa, [origem, ...destinosAtuais]);
            }
        });
    }
    
    /**
     * Atualizar interface com resultado da rota
     */
    function atualizarInterface(result, pontos) {
        console.log('[Universal] Atualizando interface com resultado da rota');
        
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
        
        console.log('[Universal] Distância total:', distanciaKm, 'km');
        console.log('[Universal] Tempo total:', horas + 'h', minutos + 'min');
        
        // 1. Atualizar card da rota personalizada
        const card = document.querySelector('.rota-personalizada-card');
        if (card) {
            const badge = card.querySelector('.badge');
            if (badge) {
                badge.textContent = `${distanciaKm} km`;
            }
        }
        
        // 2. Atualizar informações da rota
        const routeInfo = document.getElementById('route-info');
        if (routeInfo) {
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
                routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas (Personalizada):</strong></div>';
                
                // Adicionar itens na sequência
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
        }
    }
    
    /**
     * Atualizar relatório com a rota personalizada
     */
    function atualizarRelatorio() {
        console.log('[Universal] Atualizando relatório da rota');
        
        // Garantir que temos destinos
        if (destinosAtuais.length === 0) {
            console.log('[Universal] Sem destinos para atualizar relatório');
            return;
        }
        
        // Encontrar container de sequência
        const sequencia = document.querySelector('.route-sequence') || 
                         document.querySelector('.sequencia-container') ||
                         document.querySelector('[id*="sequence"]');
        
        if (!sequencia) {
            console.log('[Universal] Container de sequência não encontrado no relatório');
            return;
        }
        
        console.log('[Universal] Atualizando sequência no relatório');
        
        // Criar HTML da sequência
        let html = '<h5>Sequência da Rota (Personalizada)</h5>';
        html += '<ol class="list-group list-group-numbered sequencia-personalizada">';
        
        // Adicionar origem
        html += `<li class="list-group-item">${DOIS_CORREGOS.nome} (${DOIS_CORREGOS.nome}, SP, Brasil) (Origem)</li>`;
        
        // Adicionar destinos na ordem atual
        destinosAtuais.forEach(destino => {
            html += `<li class="list-group-item">${destino.nome}</li>`;
        });
        
        html += '</ol>';
        
        // Adicionar botão para recalcular
        html += `
            <div class="text-center mt-3">
                <button class="btn btn-calcular-personalizada">
                    Recalcular com esta ordem
                </button>
            </div>
        `;
        
        // Atualizar o conteúdo
        sequencia.innerHTML = html;
        
        // Configurar botão
        const botao = sequencia.querySelector('.btn-calcular-personalizada');
        if (botao) {
            botao.addEventListener('click', function() {
                console.log('[Universal] Botão de recálculo no relatório clicado');
                
                // Emular clique na opção de rota personalizada
                const opcao = document.querySelector('.rota-personalizada-card');
                if (opcao) {
                    opcao.click();
                } else {
                    alert('Não foi possível encontrar a opção de rota personalizada');
                }
            });
        }
    }
    
    /**
     * Desenhar rota manualmente no mapa (fallback)
     */
    function desenharRotaManual(mapa, pontos) {
        console.log('[Universal] Desenhando rota manualmente');
        
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
        atualizarInterface(null, pontos);
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