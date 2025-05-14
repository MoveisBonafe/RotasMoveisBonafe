/**
 * Script para substituir completamente o comportamento padrão da aplicação 
 * e forçar reordenação permanentemente ativa
 */
(function() {
    console.log('[Override] Iniciando substituição de comportamento...');
    
    // Interromper todos os outros scripts de reordenação
    let originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        // Bloquear qualquer tentativa de escutar cliques em botões de reordenação
        if (type === 'click' && 
            this.id && (
                this.id === 'botao-reordenar-direto' || 
                this.id === 'botao-reordenar-github' || 
                this.id === 'custom-route' ||
                this.id === 'custom-route-btn' ||
                this.id === 'ativar-reordenacao' ||
                this.id === 'reordenar-btn'
            )) {
            console.log('[Override] Bloqueando evento de click em:', this.id);
            return;
        }
        
        // Deixar outros eventos passarem normalmente
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Função para inicializar nossa solução
    function inicializar() {
        console.log('[Override] Inicializando...');
        
        // Remover botões existentes
        removerBotoes();
        
        // Adicionar botão de rota personalizada
        adicionarBotaoCalcularRota();
        
        // Ativar reordenação
        ativarReordenacao();
        
        // Verificar novamente depois de um tempo
        setTimeout(removerBotoes, 1000);
        setTimeout(removerBotoes, 2000);
        setTimeout(removerBotoes, 3000);
    }
    
    // Função para remover botões de reordenação existentes
    function removerBotoes() {
        const botoes = document.querySelectorAll('button');
        
        botoes.forEach(botao => {
            // Verificar pelo texto
            if (botao.textContent && 
                (botao.textContent.includes('Ativar Reordenação') || 
                 botao.textContent.includes('Reordenar') || 
                 botao.textContent.includes('Rota Personalizada'))) {
                
                // Se não for nosso botão
                if (botao.id !== 'botao-calcular-rota-override') {
                    console.log('[Override] Removendo botão:', botao.textContent);
                    botao.style.display = 'none'; // Esconder em vez de remover para evitar erros
                }
            }
            
            // Verificar pelo ID
            if (botao.id && 
                (botao.id === 'botao-reordenar-direto' || 
                 botao.id === 'botao-reordenar-github' || 
                 botao.id === 'custom-route' || 
                 botao.id === 'ativar-reordenacao')) {
                
                console.log('[Override] Removendo botão com ID:', botao.id);
                botao.style.display = 'none';
            }
        });
    }
    
    // Função para adicionar nosso botão
    function adicionarBotaoCalcularRota() {
        if (document.getElementById('botao-calcular-rota-override')) {
            console.log('[Override] Botão já existe');
            return;
        }
        
        console.log('[Override] Adicionando botão de calcular rota personalizada');
        
        // Encontrar o botão de otimizar
        const botaoOtimizar = document.querySelector('button');
        
        if (!botaoOtimizar) {
            console.log('[Override] Não foi possível encontrar um botão de referência');
            return;
        }
        
        // Criar nosso botão
        const botao = document.createElement('button');
        botao.id = 'botao-calcular-rota-override';
        botao.className = botaoOtimizar.className || 'btn btn-warning';
        botao.style.backgroundColor = '#ffc107';
        botao.style.color = '#000';
        botao.style.width = '100%';
        botao.style.marginTop = '10px';
        botao.style.marginBottom = '10px';
        botao.style.fontWeight = 'bold';
        botao.style.borderRadius = '4px';
        botao.style.padding = '8px 12px';
        botao.style.border = 'none';
        botao.textContent = 'Calcular Rota Personalizada';
        
        // Adicionar funcionalidade
        botao.addEventListener('click', function() {
            calcularRotaPersonalizada();
        });
        
        // Inserir após o botão de otimizar
        if (botaoOtimizar.parentNode) {
            botaoOtimizar.parentNode.insertBefore(botao, botaoOtimizar.nextSibling);
            console.log('[Override] Botão adicionado com sucesso');
        }
    }
    
    // Função para ativar reordenação
    function ativarReordenacao() {
        console.log('[Override] Ativando reordenação permanente');
        
        // Hack: Definir customRouteMode como true para o código original
        window.customRouteMode = true;
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list');
        if (!container) {
            console.log('[Override] Container de locais não encontrado');
            
            // Tentar novamente em breve
            setTimeout(ativarReordenacao, 1000);
            return;
        }
        
        console.log('[Override] Container de locais encontrado');
        
        // Adicionar classe de estilo
        container.classList.add('custom-route-active');
        
        // Configurar os itens para serem arrastáveis
        const itens = container.querySelectorAll('li, .location-item');
        itens.forEach(item => {
            if (!item.classList.contains('origin-point')) {
                // Adicionar classe e atributo
                item.classList.add('draggable');
                item.setAttribute('draggable', 'true');
                
                // Remover listeners antigos para evitar duplicação
                item.removeEventListener('dragstart', handleDragStart);
                item.removeEventListener('dragend', handleDragEnd);
                
                // Adicionar listeners
                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('dragend', handleDragEnd);
            }
        });
        
        // Adicionar eventos ao container
        container.removeEventListener('dragover', handleDragOver);
        container.removeEventListener('drop', handleDrop);
        
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        
        // Verificar novamente em breve para garantir que novos itens também sejam arrastáveis
        setTimeout(function() {
            const itensNovos = container.querySelectorAll('li, .location-item');
            console.log('[Override] Verificando novamente:', itensNovos.length, 'itens');
            itensNovos.forEach(item => {
                if (!item.classList.contains('origin-point')) {
                    item.classList.add('draggable');
                    item.setAttribute('draggable', 'true');
                    
                    // Garantir que os eventos funcionem
                    item.removeEventListener('dragstart', handleDragStart);
                    item.removeEventListener('dragend', handleDragEnd);
                    
                    item.addEventListener('dragstart', handleDragStart);
                    item.addEventListener('dragend', handleDragEnd);
                }
            });
        }, 500);
        
        // Também verificar quando novos destinos forem adicionados
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    console.log('[Override] Novos nós detectados, configurando para drag & drop');
                    setTimeout(function() {
                        const itensNovos = container.querySelectorAll('li, .location-item');
                        itensNovos.forEach(item => {
                            if (!item.classList.contains('origin-point')) {
                                item.classList.add('draggable');
                                item.setAttribute('draggable', 'true');
                                
                                item.removeEventListener('dragstart', handleDragStart);
                                item.removeEventListener('dragend', handleDragEnd);
                                
                                item.addEventListener('dragstart', handleDragStart);
                                item.addEventListener('dragend', handleDragEnd);
                            }
                        });
                    }, 200);
                }
            });
        });
        
        // Configurar o observer
        observer.observe(container, { childList: true, subtree: true });
        
        // Injetar estilos
        adicionarEstilos();
    }
    
    // Função para adicionar estilos CSS
    function adicionarEstilos() {
        if (document.getElementById('override-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'override-styles';
        style.textContent = `
            .draggable {
                cursor: grab !important;
                position: relative;
                padding-left: 30px !important;
                background-color: #fff;
                transition: all 0.2s ease;
                border-left: 3px solid #ffc107 !important;
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
            
            #botao-calcular-rota-override {
                transition: all 0.3s ease;
            }
            
            #botao-calcular-rota-override:hover {
                background-color: #ffb300 !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(255, 171, 0, 0.3);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Manipuladores de eventos para drag and drop
    function handleDragStart(e) {
        console.log('[Override] Iniciando arrasto');
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // Necessário para Firefox
    }
    
    function handleDragEnd(e) {
        console.log('[Override] Finalizando arrasto');
        this.classList.remove('dragging');
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        const draggedItem = document.querySelector('.dragging');
        if (!draggedItem) return;
        
        const afterElement = getDragAfterElement(this, e.clientY);
        if (afterElement) {
            this.insertBefore(draggedItem, afterElement);
        } else {
            this.appendChild(draggedItem);
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        console.log('[Override] Item solto');
    }
    
    // Função auxiliar para determinar a posição
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
        
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
    
    // Função para calcular a rota personalizada
    function calcularRotaPersonalizada() {
        console.log('[Override] Calculando rota personalizada...');
        
        // Encontrar o container
        const container = document.getElementById('locations-list');
        if (!container) {
            alert('Erro: Não foi possível encontrar a lista de destinos.');
            return;
        }
        
        // Verificar se temos pelo menos um destino
        const itens = container.querySelectorAll('.draggable');
        if (itens.length === 0) {
            alert('Adicione pelo menos um destino para calcular a rota.');
            return;
        }
        
        // Coletar os IDs na ordem atual
        const ids = [];
        itens.forEach(item => {
            const id = item.getAttribute('data-id');
            if (id) ids.push(id);
        });
        
        console.log('[Override] IDs coletados:', ids);
        
        // Verificar se temos as funções e objetos necessários
        if (!window.directionsService || !window.directionsRenderer || !window.map) {
            console.error('[Override] APIs do Google Maps não disponíveis');
            alert('Erro: Serviço de direções não está disponível.');
            return;
        }
        
        // Verificar se temos a lista de locais
        if (!window.locations || !Array.isArray(window.locations)) {
            console.error('[Override] Array locations não disponível');
            alert('Erro: Dados de localização não estão disponíveis.');
            return;
        }
        
        // Mostrar spinner de carregamento (se existir)
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'block';
        
        // Construir waypoints
        const waypoints = [];
        
        // Adicionar origem
        const origem = window.locations.find(loc => loc.isOrigin);
        if (origem) {
            waypoints.push(origem);
        } else {
            console.error('[Override] Origem não encontrada');
            if (spinner) spinner.style.display = 'none';
            alert('Erro: Ponto de origem não encontrado.');
            return;
        }
        
        // Adicionar destinos na ordem dos IDs
        for (const id of ids) {
            const destino = window.locations.find(loc => !loc.isOrigin && String(loc.id) === String(id));
            if (destino) {
                waypoints.push(destino);
            }
        }
        
        if (waypoints.length < 2) {
            if (spinner) spinner.style.display = 'none';
            alert('É necessário pelo menos um destino além da origem para calcular a rota.');
            return;
        }
        
        console.log('[Override] Calculando rota com waypoints:', waypoints);
        
        // Limpar rota anterior
        window.directionsRenderer.setDirections({routes: []});
        
        // Configurar requisição
        const origem_ponto = new google.maps.LatLng(
            waypoints[0].lat,
            waypoints[0].lng
        );
        
        const destino_ponto = new google.maps.LatLng(
            waypoints[waypoints.length - 1].lat,
            waypoints[waypoints.length - 1].lng
        );
        
        // Pontos intermediários
        const waypointsArray = waypoints.slice(1, -1).map(wp => ({
            location: new google.maps.LatLng(wp.lat, wp.lng),
            stopover: true
        }));
        
        const request = {
            origin: origem_ponto,
            destination: destino_ponto,
            waypoints: waypointsArray,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        // Calcular rota
        window.directionsService.route(request, function(result, status) {
            // Esconder spinner
            if (spinner) spinner.style.display = 'none';
            
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[Override] Rota calculada com sucesso');
                
                // Renderizar rota no mapa
                window.directionsRenderer.setDirections(result);
                
                // Calcular distância e duração
                let distanciaTotal = 0;
                let duracaoTotal = 0;
                const legs = result.routes[0].legs;
                
                for (let i = 0; i < legs.length; i++) {
                    distanciaTotal += legs[i].distance.value;
                    duracaoTotal += legs[i].duration.value;
                }
                
                // Converter para km e minutos
                const distanciaKm = (distanciaTotal / 1000).toFixed(1);
                const duracaoMinutos = Math.ceil(duracaoTotal / 60);
                
                // Atualizar informações na interface
                atualizarInfoRota(distanciaKm, duracaoMinutos, waypoints);
                
                alert('Rota personalizada calculada com sucesso!');
            } else {
                console.error('[Override] Erro ao calcular rota:', status);
                alert('Erro ao calcular a rota. Veja o console para detalhes.');
            }
        });
    }
    
    // Função para atualizar informações de rota na interface
    function atualizarInfoRota(distanciaKm, duracaoMinutos, waypoints) {
        // Mostrar o container de resumo da rota
        const routeInfo = document.getElementById('route-info');
        if (!routeInfo) {
            console.error('[Override] Elemento route-info não encontrado');
            return;
        }
        
        // Mostrar o container
        routeInfo.style.display = 'block';
        
        // Atualizar detalhes
        const routeDetails = document.getElementById('route-details');
        if (routeDetails) {
            const horas = Math.floor(duracaoMinutos / 60);
            const minutos = duracaoMinutos % 60;
            
            routeDetails.innerHTML = `
                <p><strong>Distância Total:</strong> ${distanciaKm} km</p>
                <p><strong>Tempo Estimado:</strong> ${horas > 0 ? `${horas}h ` : ''}${minutos}min</p>
                <p><strong>Velocidade Média:</strong> 80 km/h</p>
            `;
        }
        
        // Atualizar sequência
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
    
    // Chamar a inicialização em diferentes momentos para garantir que funcione
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    // Também tentar depois que a API do Google Maps estiver carregada
    const intervalId = setInterval(function() {
        if (window.google && window.google.maps) {
            inicializar();
            clearInterval(intervalId);
        }
    }, 1000);
})();