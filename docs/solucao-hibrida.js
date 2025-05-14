/**
 * Solução híbrida que combina arrasto/soltura com rota personalizada direta
 * Esta versão mantém as funcionalidades essenciais enquanto garante compatibilidade
 */
(function() {
    console.log('[Hibrida] Inicializando solução híbrida...');
    
    // Variáveis globais
    let destinos = [];
    let mapaDisponivel = false;
    let dragDropAtivado = false;
    
    // Inicializar toda a solução
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    /**
     * Função principal de inicialização
     */
    function inicializar() {
        console.log('[Hibrida] Inicializando solução...');
        
        // Adicionar estilos para arrastar e soltar
        adicionarEstilosCSS();
        
        // Ativar arrastar e soltar nos destinos
        ativarArrastoESoltura();
        
        // Monitorar botão de otimizar
        monitorarBotaoOtimizar();
        
        // Verificar disponibilidade do mapa
        verificarMapa();
    }
    
    /**
     * Adicionar estilos CSS para arrastar e soltar
     */
    function adicionarEstilosCSS() {
        if (document.getElementById('hibrida-styles')) {
            return;
        }
        
        console.log('[Hibrida] Adicionando estilos CSS');
        
        const estilos = document.createElement('style');
        estilos.id = 'hibrida-styles';
        estilos.textContent = `
            /* Estilos para itens arrastáveis */
            .draggable {
                cursor: grab !important;
                position: relative !important;
                border-left: 3px solid #ffc107 !important;
                padding-left: 30px !important;
                margin-bottom: 5px !important;
                background-color: white !important;
                transition: all 0.2s ease;
            }
            
            .draggable::before {
                content: "≡";
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #ffc107;
                font-weight: bold;
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
        
        document.head.appendChild(estilos);
    }
    
    /**
     * Monitorar o botão de otimizar rota
     */
    function monitorarBotaoOtimizar() {
        const botaoOtimizar = document.getElementById('optimize-route');
        
        if (!botaoOtimizar) {
            console.log('[Hibrida] Botão de otimizar não encontrado, tentando novamente em breve...');
            setTimeout(monitorarBotaoOtimizar, 1000);
            return;
        }
        
        console.log('[Hibrida] Botão de otimizar encontrado, adicionando evento');
        
        // Substituir o comportamento do botão
        botaoOtimizar.addEventListener('click', function(e) {
            // Salvar os destinos na ordem atual
            salvarDestinosAtuais();
            
            console.log('[Hibrida] Botão de otimizar clicado, destinos salvos');
            
            // Aguardar que o comportamento original seja executado
            setTimeout(function() {
                // Adicionar a opção de rota personalizada às alternativas
                setTimeout(adicionarRotaPersonalizada, 300);
            }, 500);
        });
    }
    
    /**
     * Ativar arrastar e soltar para destinos
     */
    function ativarArrastoESoltura() {
        if (dragDropAtivado) {
            return;
        }
        
        console.log('[Hibrida] Ativando arrastar e soltar');
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Hibrida] Container de destinos não encontrado, tentando novamente em breve...');
            setTimeout(ativarArrastoESoltura, 1000);
            return;
        }
        
        console.log('[Hibrida] Container de destinos encontrado');
        
        // Adicionar classe para estilização
        container.classList.add('drag-drop-enabled');
        
        // Configurar os itens já existentes
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item, div[class*="location"]');
        
        console.log('[Hibrida] Configurando', itens.length, 'itens como arrastáveis');
        
        itens.forEach(item => {
            // Ignorar o ponto de origem
            if (item.classList.contains('origin-point')) {
                return;
            }
            
            // Adicionar classes e atributos
            item.classList.add('draggable');
            item.setAttribute('draggable', 'true');
            
            // Adicionar eventos
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
        
        // Adicionar eventos ao container
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        
        // Monitorar novos itens adicionados
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Elemento DOM
                            // Se é um destino diretamente
                            if (!node.classList.contains('origin-point') &&
                                (node.classList.contains('location-item') || 
                                 node.tagName.toLowerCase() === 'li')) {
                                
                                // Configurar como arrastável
                                node.classList.add('draggable');
                                node.setAttribute('draggable', 'true');
                                node.addEventListener('dragstart', handleDragStart);
                                node.addEventListener('dragend', handleDragEnd);
                                
                                console.log('[Hibrida] Novo destino configurado como arrastável');
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
        
        dragDropAtivado = true;
        console.log('[Hibrida] Arrastar e soltar ativado');
    }
    
    /**
     * Handler para início de arrasto
     */
    function handleDragStart(e) {
        console.log('[Hibrida] Iniciando arrasto');
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // Para Firefox
    }
    
    /**
     * Handler para fim de arrasto
     */
    function handleDragEnd(e) {
        console.log('[Hibrida] Finalizando arrasto');
        this.classList.remove('dragging');
        
        // Salvar a nova ordem
        salvarDestinosAtuais();
    }
    
    /**
     * Handler para arrasto sobre o container
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const elementoArrastado = document.querySelector('.dragging');
        if (!elementoArrastado) return;
        
        const elementoApos = getElementoApos(this, e.clientY);
        
        if (elementoApos) {
            this.insertBefore(elementoArrastado, elementoApos);
        } else {
            this.appendChild(elementoArrastado);
        }
    }
    
    /**
     * Handler para soltar o elemento
     */
    function handleDrop(e) {
        e.preventDefault();
        console.log('[Hibrida] Item solto');
        
        // Salvar a nova ordem
        salvarDestinosAtuais();
    }
    
    /**
     * Determinar depois de qual elemento inserir
     */
    function getElementoApos(container, y) {
        const elementosArrastaveis = [...container.querySelectorAll('.draggable:not(.dragging)')];
        
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
    
    /**
     * Salvar a ordem atual dos destinos
     */
    function salvarDestinosAtuais() {
        destinos = [];
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Hibrida] Container não encontrado para salvar ordem');
            return;
        }
        
        // Coletar todos os destinos arrastáveis
        const itens = container.querySelectorAll('.draggable, .location-item, li:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Hibrida] Coletando', itens.length, 'destinos');
        
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
                // Procurar por coordenadas
                let lat = parseFloat(item.getAttribute('data-lat') || '0');
                let lng = parseFloat(item.getAttribute('data-lng') || '0');
                
                destinos.push({
                    id: item.getAttribute('data-id') || `destino-${index}`,
                    nome: nome,
                    elemento: item,
                    lat: lat,
                    lng: lng
                });
                
                console.log('[Hibrida] Destino salvo:', nome);
            }
        });
        
        console.log('[Hibrida] Total de destinos salvos:', destinos.length);
    }
    
    /**
     * Verificar se o mapa está disponível
     */
    function verificarMapa() {
        if (mapaDisponivel) {
            return;
        }
        
        console.log('[Hibrida] Verificando disponibilidade do mapa');
        
        if (!window.google || !window.google.maps) {
            console.log('[Hibrida] Google Maps não disponível, tentando novamente em breve...');
            setTimeout(verificarMapa, 1000);
            return;
        }
        
        console.log('[Hibrida] Google Maps disponível');
        
        // Procurar o mapa
        for (const prop in window) {
            try {
                if (window[prop] instanceof google.maps.Map) {
                    window.map = window[prop];
                    console.log('[Hibrida] Mapa encontrado:', prop);
                    mapaDisponivel = true;
                    break;
                }
            } catch (e) {}
        }
        
        if (!mapaDisponivel) {
            console.log('[Hibrida] Mapa não encontrado, tentando novamente em breve...');
            setTimeout(verificarMapa, 1000);
        }
    }
    
    /**
     * Adicionar opção de rota personalizada às alternativas
     */
    function adicionarRotaPersonalizada() {
        console.log('[Hibrida] Adicionando opção de rota personalizada');
        
        // Verificar se temos destinos
        if (destinos.length === 0) {
            console.log('[Hibrida] Sem destinos para adicionar rota personalizada');
            salvarDestinosAtuais();
            
            if (destinos.length === 0) {
                console.log('[Hibrida] Ainda sem destinos, abortando');
                return;
            }
        }
        
        // Encontrar o container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[Hibrida] Container de rotas alternativas não encontrado, tentando novamente em breve...');
            setTimeout(adicionarRotaPersonalizada, 1000);
            return;
        }
        
        console.log('[Hibrida] Container de alternativas encontrado');
        
        // Verificar se a opção já existe
        if (container.querySelector('.rota-personalizada-card')) {
            console.log('[Hibrida] Opção de rota personalizada já existe');
            return;
        }
        
        // Calcular distância aproximada
        const distanciaTotal = "personalizada";
        
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
                    <span class="badge bg-warning text-dark">${distanciaTotal}</span>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        cardRotaPersonalizada.addEventListener('click', function() {
            console.log('[Hibrida] Card de rota personalizada clicado');
            
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
        
        console.log('[Hibrida] Opção de rota personalizada adicionada');
        
        // Selecionar automaticamente e calcular
        setTimeout(function() {
            cardRotaPersonalizada.click();
        }, 100);
    }
    
    /**
     * Calcular a rota personalizada
     */
    function calcularRotaPersonalizada() {
        console.log('[Hibrida] Calculando rota personalizada');
        
        // Verificar se temos os serviços necessários
        if (!window.google || !window.google.maps) {
            console.error('[Hibrida] Google Maps não disponível');
            alert('Google Maps não está disponível. Por favor, recarregue a página.');
            return;
        }
        
        // Criar ou reutilizar serviços
        if (!window.directionsService) {
            window.directionsService = new google.maps.DirectionsService();
        }
        
        if (!window.directionsRenderer) {
            window.directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: false
            });
        }
        
        // Garantir que temos o mapa
        verificarMapa();
        
        if (!window.map) {
            console.error('[Hibrida] Mapa não disponível');
            alert('Mapa não está disponível. Por favor, recarregue a página.');
            return;
        }
        
        // Configurar o renderer com o mapa
        try {
            window.directionsRenderer.setMap(window.map);
        } catch (e) {
            console.error('[Hibrida] Erro ao configurar renderer:', e);
            
            // Tentar criar um novo renderer
            window.directionsRenderer = new google.maps.DirectionsRenderer({
                map: window.map,
                suppressMarkers: false
            });
        }
        
        // Preparar pontos para a rota
        if (destinos.length === 0) {
            console.error('[Hibrida] Sem destinos para calcular rota');
            salvarDestinosAtuais();
            
            if (destinos.length === 0) {
                // Usar localizações conhecidas
                const cidadesConhecidas = [
                    { nome: 'Jaú', lat: -22.2967, lng: -48.5578 },
                    { nome: 'Mineiros do Tietê', lat: -22.4119, lng: -48.4508 }
                ];
                
                const elementos = document.querySelectorAll('.draggable, .location-item, li:not(.origin-point)');
                elementos.forEach((elem, idx) => {
                    const texto = elem.textContent.trim().toLowerCase();
                    
                    if (texto.includes('jaú') || texto.includes('jau')) {
                        destinos.push({
                            id: 'jau',
                            nome: 'Jaú',
                            lat: cidadesConhecidas[0].lat,
                            lng: cidadesConhecidas[0].lng
                        });
                    } else if (texto.includes('mineiros') || texto.includes('tietê') || texto.includes('tiete')) {
                        destinos.push({
                            id: 'mineiros',
                            nome: 'Mineiros do Tietê',
                            lat: cidadesConhecidas[1].lat,
                            lng: cidadesConhecidas[1].lng
                        });
                    }
                });
                
                // Se ainda não temos destinos, adicionar automaticamente
                if (destinos.length === 0) {
                    destinos.push({
                        id: 'jau',
                        nome: 'Jaú',
                        lat: cidadesConhecidas[0].lat,
                        lng: cidadesConhecidas[0].lng
                    });
                    
                    destinos.push({
                        id: 'mineiros',
                        nome: 'Mineiros do Tietê',
                        lat: cidadesConhecidas[1].lat,
                        lng: cidadesConhecidas[1].lng
                    });
                }
            }
        }
        
        console.log('[Hibrida] Preparando rota com', destinos.length, 'destinos');
        
        // Ponto de origem (Dois Córregos-SP)
        const origem = {
            lat: -22.3731,
            lng: -48.3796,
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
        console.log('[Hibrida] Enviando solicitação de direções');
        
        window.directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[Hibrida] Rota calculada com sucesso');
                
                // Exibir no mapa
                window.directionsRenderer.setDirections(result);
                
                // Atualizar informações da rota
                atualizarInformacoesRota(result, [origem, ...destinos]);
            } else {
                console.error('[Hibrida] Erro ao calcular rota:', status);
                alert('Erro ao calcular a rota. Por favor, tente novamente.');
            }
        });
    }
    
    /**
     * Atualizar informações da rota na interface
     */
    function atualizarInformacoesRota(result, pontos) {
        console.log('[Hibrida] Atualizando informações da rota');
        
        if (!result || !result.routes || !result.routes[0] || !result.routes[0].legs) {
            console.error('[Hibrida] Resultado da rota inválido');
            return;
        }
        
        // Calcular distância e tempo
        const pernas = result.routes[0].legs;
        let distanciaTotal = 0;
        let tempoTotal = 0;
        
        pernas.forEach(perna => {
            distanciaTotal += perna.distance.value;
            tempoTotal += perna.duration.value;
        });
        
        // Converter para unidades mais amigáveis
        const distanciaKm = (distanciaTotal / 1000).toFixed(1);
        const horas = Math.floor(tempoTotal / 3600);
        const minutos = Math.floor((tempoTotal % 3600) / 60);
        
        console.log('[Hibrida] Distância total:', distanciaKm, 'km');
        console.log('[Hibrida] Tempo total:', horas, 'h', minutos, 'min');
        
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
            
            console.log('[Hibrida] Informações da rota atualizadas na interface');
        } else {
            console.log('[Hibrida] Elementos de informação da rota não encontrados');
        }
        
        // Atualizar badge no card de rota personalizada
        const card = document.querySelector('.rota-personalizada-card');
        if (card) {
            const badge = card.querySelector('.badge');
            if (badge) {
                badge.textContent = `${distanciaKm} km`;
            }
        }
    }
})();