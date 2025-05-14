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
        
        // Adicionar evento para capturar a ordem atual antes de otimizar
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
        
        // Verificar se temos as APIs e os dados necessários
        if (!window.directionsService || !window.directionsRenderer || !window.locations) {
            console.error('[DragDropAlt] APIs ou dados necessários não disponíveis');
            alert('Erro: Serviço de direções não está disponível.');
            return;
        }
        
        // Construir waypoints
        const waypoints = [];
        
        // Adicionar origem
        const origem = window.locations.find(loc => loc.isOrigin);
        if (origem) {
            waypoints.push(origem);
        } else {
            console.error('[DragDropAlt] Origem não encontrada');
            alert('Erro: Ponto de origem não encontrado.');
            return;
        }
        
        // Adicionar destinos na ordem salva
        for (const destino of destinos) {
            const loc = window.locations.find(l => !l.isOrigin && String(l.id) === String(destino.id));
            if (loc) {
                waypoints.push(loc);
            }
        }
        
        if (waypoints.length < 2) {
            console.error('[DragDropAlt] Não há destinos suficientes');
            alert('É necessário pelo menos um destino além da origem para calcular a rota.');
            return;
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