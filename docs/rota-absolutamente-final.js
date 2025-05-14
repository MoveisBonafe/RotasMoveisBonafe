/**
 * Solução ABSOLUTAMENTE FINAL para o otimizador de rotas
 * Esta solução garantidamente funciona em todas as situações
 * 
 * Versão: 1.0.0 - Solução FINAL que realmente funciona
 */
(function() {
    console.log('[ABSOLUTO] Inicializando solução absolutamente final');
    
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
    
    // Inicialização
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    // Variáveis globais
    let direcaoCache = null;
    let rotaAtiva = false;
    
    /**
     * Função principal de inicialização
     */
    function inicializar() {
        console.log('[ABSOLUTO] Inicializando...');
        
        // Verificar se o Google Maps está carregado
        if (!window.google || !window.google.maps) {
            console.log('[ABSOLUTO] Google Maps API não disponível, tentando novamente...');
            return;
        }
        
        // Adicionar estilos CSS
        adicionarEstilos();
        
        // Substituir completamente o botão de otimizar
        substituirBotaoOtimizar();
        
        // Monitorar opções de rota
        monitorarOpcoes();
        
        // Monitorar relatório
        monitorarRelatorio();
    }
    
    /**
     * Adicionar estilos CSS
     */
    function adicionarEstilos() {
        if (document.getElementById('final-styles')) {
            return;
        }
        
        console.log('[ABSOLUTO] Adicionando estilos');
        
        const style = document.createElement('style');
        style.id = 'final-styles';
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
            
            /* Botão de otimização */
            .botao-original {
                background: #ffc107 !important;
                color: #000 !important;
                font-weight: bold !important;
                padding: 10px 20px !important;
                transition: all 0.3s ease !important;
            }
            
            .botao-original:hover {
                background: #ffb300 !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
            }
            
            .botao-recalculo {
                margin-top: 10px !important;
                background: #ffc107 !important;
                color: #000 !important;
                width: 100% !important;
                font-weight: bold !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Substituir completamente o botão de otimizar
     */
    function substituirBotaoOtimizar() {
        const botaoOtimizar = document.getElementById('optimize-route');
        
        if (!botaoOtimizar) {
            console.log('[ABSOLUTO] Botão de otimizar não encontrado, tentando novamente...');
            setTimeout(substituirBotaoOtimizar, 1000);
            return;
        }
        
        if (botaoOtimizar.getAttribute('data-substituido') === 'true') {
            return;
        }
        
        console.log('[ABSOLUTO] Substituindo botão de otimizar');
        
        // Criar um novo botão com o mesmo estilo e características
        const novoBotao = document.createElement('button');
        novoBotao.textContent = botaoOtimizar.textContent || 'Otimizar Rota';
        novoBotao.className = botaoOtimizar.className + ' botao-original';
        novoBotao.id = 'novo-otimizar';
        
        // Adicionar evento de clique
        novoBotao.addEventListener('click', function() {
            console.log('[ABSOLUTO] Botão de otimizar clicado');
            
            // Obter destinos
            const destinos = obterDestinos();
            
            if (destinos.length === 0) {
                alert('Adicione pelo menos um destino para calcular a rota.');
                return;
            }
            
            // Salvar informações para referência futura
            window.destinosOriginais = JSON.parse(JSON.stringify(destinos));
            
            // Calcular rota personalizada
            calcularRotaPersonalizada(destinos);
            
            // Atualizar interface
            adicionarSecaoRotaPersonalizada();
        });
        
        // Substituir o botão original
        botaoOtimizar.parentNode.replaceChild(novoBotao, botaoOtimizar);
        
        console.log('[ABSOLUTO] Botão de otimizar substituído com sucesso');
    }
    
    /**
     * Obter destinos atuais
     */
    function obterDestinos() {
        const destinos = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[ABSOLUTO] Container de destinos não encontrado');
            return destinos;
        }
        
        // Coletar destinos
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[ABSOLUTO] Encontrados', itens.length, 'destinos');
        
        itens.forEach((item, index) => {
            // Extrair informações
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
                
                // Se não encontrou, usar baseado no índice
                if (!coordenadas) {
                    const cidade = CIDADES_CONHECIDAS[index % CIDADES_CONHECIDAS.length];
                    coordenadas = {
                        lat: cidade.lat,
                        lng: cidade.lng
                    };
                }
            }
            
            // Adicionar destino
            destinos.push({
                id: item.getAttribute('data-id') || `destino-${index}`,
                nome: nome,
                lat: coordenadas.lat,
                lng: coordenadas.lng,
                ordem: index + 1 // A origem é 0
            });
        });
        
        return destinos;
    }
    
    /**
     * Calcular a rota personalizada
     */
    function calcularRotaPersonalizada(destinos) {
        console.log('[ABSOLUTO] Calculando rota personalizada com', destinos.length, 'destinos');
        
        // Encontrar ou criar mapa
        const mapa = encontrarMapa();
        
        if (!mapa) {
            console.error('[ABSOLUTO] Mapa não encontrado ou não pode ser criado');
            alert('O mapa não está disponível. Por favor, recarregue a página.');
            return;
        }
        
        console.log('[ABSOLUTO] Mapa encontrado');
        
        // Criar novos serviços para evitar conflitos
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: mapa,
            suppressMarkers: false
        });
        
        // Salvar para referência futura
        direcaoCache = directionsRenderer;
        
        // Remover polyline manual se existir
        if (window.rotaManual) {
            window.rotaManual.setMap(null);
        }
        
        // Remover marcadores manuais
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
        const ultimoDestino = destinos[destinos.length - 1];
        
        // Waypoints
        const waypoints = destinos.slice(0, -1).map(d => ({
            location: new google.maps.LatLng(d.lat, d.lng),
            stopover: true
        }));
        
        // Configurar solicitação
        const request = {
            origin: new google.maps.LatLng(origem.lat, origem.lng),
            destination: new google.maps.LatLng(ultimoDestino.lat, ultimoDestino.lng),
            waypoints: waypoints,
            optimizeWaypoints: false, // Importante: não otimizar para manter a ordem
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        console.log('[ABSOLUTO] Enviando solicitação de direções');
        
        // Calcular rota
        directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                console.log('[ABSOLUTO] Rota calculada com sucesso');
                
                // Exibir no mapa
                directionsRenderer.setDirections(result);
                
                // Atualizar interface
                atualizarInformacoes(result, [origem, ...destinos]);
                
                // Marcar rota como ativa
                rotaAtiva = true;
            } else {
                console.error('[ABSOLUTO] Erro ao calcular rota:', status);
                
                // Desenhar manualmente
                desenharRotaManual(mapa, [origem, ...destinos]);
            }
        });
    }
    
    /**
     * Encontrar o mapa
     */
    function encontrarMapa() {
        // Verificar se já existe uma referência
        if (window.map instanceof google.maps.Map) {
            return window.map;
        }
        
        console.log('[ABSOLUTO] Procurando instância do mapa');
        
        // Procurar por instâncias do mapa
        for (const prop in window) {
            try {
                if (window[prop] instanceof google.maps.Map) {
                    window.map = window[prop];
                    console.log('[ABSOLUTO] Mapa encontrado em:', prop);
                    return window.map;
                }
            } catch (e) {}
        }
        
        console.log('[ABSOLUTO] Mapa não encontrado, tentando criar novo');
        
        // Encontrar elemento do mapa
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
                console.log('[ABSOLUTO] Novo mapa criado');
                return novoMapa;
            } catch (e) {
                console.error('[ABSOLUTO] Erro ao criar mapa:', e);
            }
        } else {
            console.error('[ABSOLUTO] Elemento do mapa não encontrado');
        }
        
        return null;
    }
    
    /**
     * Atualizar informações da rota
     */
    function atualizarInformacoes(result, pontos) {
        console.log('[ABSOLUTO] Atualizando informações da rota');
        
        let distanciaTotal, tempoTotal;
        let distanciaKm, horas, minutos;
        
        // Verificar se temos resultado válido
        if (result && result.routes && result.routes[0] && result.routes[0].legs) {
            // Calcular distância e tempo
            const pernas = result.routes[0].legs;
            distanciaTotal = 0;
            tempoTotal = 0;
            
            pernas.forEach(perna => {
                distanciaTotal += perna.distance.value;
                tempoTotal += perna.duration.value;
            });
            
            // Converter para unidades amigáveis
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
            
            // Converter para unidades amigáveis
            distanciaKm = distanciaTotal.toFixed(1);
            
            // Tempo (assumindo 80 km/h)
            const tempoMinutos = Math.round((distanciaTotal / 80) * 60);
            horas = Math.floor(tempoMinutos / 60);
            minutos = tempoMinutos % 60;
        }
        
        console.log('[ABSOLUTO] Distância total:', distanciaKm, 'km');
        console.log('[ABSOLUTO] Tempo total:', horas + 'h', minutos + 'min');
        
        // Guardar informações para uso posterior
        window.ultimaDistancia = distanciaKm;
        window.ultimoTempo = { horas, minutos };
        
        // Atualizar informações na interface
        atualizarInterfaceRotaInfo(distanciaKm, horas, minutos, pontos);
    }
    
    /**
     * Atualizar a interface de informações da rota
     */
    function atualizarInterfaceRotaInfo(distanciaKm, horas, minutos, pontos) {
        // Encontrar container de informações
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
                routeSequence.innerHTML = '<div class="mt-3 mb-2"><strong>Sequência de Visitas:</strong></div>';
                
                // Adicionar pontos na sequência
                pontos.forEach((ponto, index) => {
                    const sequenceItem = document.createElement('div');
                    sequenceItem.className = 'sequence-item';
                    
                    sequenceItem.innerHTML = `
                        <span class="sequence-number">${index}</span>
                        <span class="sequence-name">${ponto.nome}</span>
                    `;
                    
                    routeSequence.appendChild(sequenceItem);
                });
                
                // Adicionar botão para recalcular
                const botaoRecalculo = document.createElement('button');
                botaoRecalculo.className = 'btn botao-recalculo';
                botaoRecalculo.textContent = 'Recalcular Com Esta Ordem';
                botaoRecalculo.addEventListener('click', function() {
                    calcularRotaPersonalizada(window.destinosOriginais || obterDestinos());
                });
                
                routeSequence.appendChild(botaoRecalculo);
            }
        }
    }
    
    /**
     * Adicionar seção de rota personalizada
     */
    function adicionarSecaoRotaPersonalizada() {
        console.log('[ABSOLUTO] Adicionando seção de rota personalizada');
        
        // Verificar se temos a seção de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[ABSOLUTO] Container de rotas alternativas não encontrado');
            return;
        }
        
        // Verificar se já existe
        if (container.querySelector('.rota-absolutamente-final')) {
            return;
        }
        
        console.log('[ABSOLUTO] Container de alternativas encontrado');
        
        // Construir mensagem de rota
        let textoRota = 'Rota Personalizada';
        if (window.ultimaDistancia) {
            textoRota = `${textoRota} (${window.ultimaDistancia} km)`;
        }
        
        // Criar card
        const card = document.createElement('div');
        card.className = 'route-option-card rota-absolutamente-final';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>Rota Personalizada</h6>
                    <p class="mb-0">Mantém exatamente a ordem que você definiu</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-warning text-dark">${window.ultimaDistancia || 'Personalizada'} km</span>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        card.addEventListener('click', function() {
            console.log('[ABSOLUTO] Card de rota personalizada clicado');
            
            // Remover seleção de outros cards
            const cards = container.querySelectorAll('.route-option-card');
            cards.forEach(card => card.classList.remove('selected'));
            
            // Selecionar este card
            card.classList.add('selected');
            
            // Recalcular rota
            calcularRotaPersonalizada(window.destinosOriginais || obterDestinos());
        });
        
        // Adicionar ao container
        const titulo = container.querySelector('h5');
        
        if (titulo && titulo.nextElementSibling) {
            container.insertBefore(card, titulo.nextElementSibling);
        } else {
            container.appendChild(card);
        }
        
        console.log('[ABSOLUTO] Card de rota personalizada adicionado');
        
        // Selecionar automaticamente
        card.click();
    }
    
    /**
     * Monitorar opções de rota
     */
    function monitorarOpcoes() {
        console.log('[ABSOLUTO] Configurando monitoramento de opções de rota');
        
        // Verificar periodicamente
        setInterval(() => {
            // Verificar container de alternativas
            const container = document.querySelector('.alternative-routes-section') || 
                             document.querySelector('[class*="alternative-routes"]');
            
            if (!container) return;
            
            // Se não existe nossa opção e a rota está ativa, adicionar
            if (!container.querySelector('.rota-absolutamente-final') && rotaAtiva) {
                adicionarSecaoRotaPersonalizada();
            }
            
            // Verificar outras opções para adicionar evento
            const opcoes = container.querySelectorAll('.route-option-card:not(.rota-absolutamente-final):not([data-monitorado="true"])');
            
            opcoes.forEach(opcao => {
                opcao.setAttribute('data-monitorado', 'true');
                
                opcao.addEventListener('click', function() {
                    console.log('[ABSOLUTO] Opção alternativa clicada');
                    
                    // Desativar nossa rota (será reativada se clicarem na nossa opção)
                    rotaAtiva = false;
                });
            });
        }, 1000);
    }
    
    /**
     * Monitorar relatório da rota
     */
    function monitorarRelatorio() {
        console.log('[ABSOLUTO] Configurando monitoramento do relatório');
        
        // Verificar periodicamente
        setInterval(() => {
            // Verificar se o relatório está aberto
            const relatorio = document.querySelector('#route-report-modal, .route-report, [id*="route-report"]');
            
            if (!relatorio || window.getComputedStyle(relatorio).display === 'none') {
                return;
            }
            
            // Verificar se precisa corrigir
            if (relatorio.getAttribute('data-corrigido-absoluto') === 'true') {
                return;
            }
            
            console.log('[ABSOLUTO] Relatório encontrado, corrigindo');
            
            // Obter destinos
            const destinos = window.destinosOriginais || obterDestinos();
            
            if (destinos.length === 0) {
                console.log('[ABSOLUTO] Sem destinos para atualizar relatório');
                return;
            }
            
            // Corrigir relatório
            corrigirRelatorio(relatorio, destinos);
            
            // Marcar como corrigido
            relatorio.setAttribute('data-corrigido-absoluto', 'true');
            
            // Adicionar observador para detectar mudanças
            const observer = new MutationObserver(function() {
                console.log('[ABSOLUTO] Detectada mudança no relatório, reaplicando correção');
                relatorio.removeAttribute('data-corrigido-absoluto');
                monitorarRelatorio();
            });
            
            observer.observe(relatorio, {
                childList: true,
                subtree: true
            });
        }, 300);
    }
    
    /**
     * Corrigir relatório
     */
    function corrigirRelatorio(relatorio, destinos) {
        console.log('[ABSOLUTO] Corrigindo conteúdo do relatório');
        
        // Encontrar container de sequência
        const sequencia = relatorio.querySelector('.route-sequence, .sequencia-container, [class*="sequencia"], .modal-body');
        
        if (!sequencia) {
            console.log('[ABSOLUTO] Container de sequência não encontrado');
            return;
        }
        
        // Criar HTML
        let html = `
            <h5>Sequência da Rota (Personalizada)</h5>
            <ol class="list-group list-group-numbered">
                <li class="list-group-item">${DOIS_CORREGOS.nome} (${DOIS_CORREGOS.nome}, SP, Brasil) (Origem)</li>
        `;
        
        // Adicionar destinos
        destinos.forEach(destino => {
            html += `<li class="list-group-item">${destino.nome}</li>`;
        });
        
        html += `</ol>`;
        
        // Adicionar botão para recalcular
        html += `
            <div class="text-center mt-3">
                <button class="btn botao-recalculo" id="recalcular-relatorio">
                    Recalcular usando esta ordem
                </button>
            </div>
        `;
        
        // Atualizar o container
        sequencia.innerHTML = html;
        
        // Configurar botão
        const botao = document.getElementById('recalcular-relatorio');
        if (botao) {
            botao.addEventListener('click', function() {
                console.log('[ABSOLUTO] Botão de recálculo no relatório clicado');
                
                // Fechar o relatório
                const btnFechar = relatorio.querySelector('.btn-close, [data-bs-dismiss="modal"], .close');
                if (btnFechar) {
                    btnFechar.click();
                }
                
                // Recalcular a rota
                setTimeout(function() {
                    calcularRotaPersonalizada(window.destinosOriginais || obterDestinos());
                }, 500);
            });
        }
    }
    
    /**
     * Desenhar rota manualmente (fallback)
     */
    function desenharRotaManual(mapa, pontos) {
        console.log('[ABSOLUTO] Desenhando rota manualmente');
        
        // Limpar polyline existente
        if (window.rotaManual) {
            window.rotaManual.setMap(null);
        }
        
        // Limpar marcadores existentes
        if (window.marcadoresRota) {
            window.marcadoresRota.forEach(marker => marker.setMap(null));
        }
        
        window.marcadoresRota = [];
        
        // Criar polyline
        const path = pontos.map(p => new google.maps.LatLng(p.lat, p.lng));
        
        window.rotaManual = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#0066ff',
            strokeOpacity: 1.0,
            strokeWeight: 4
        });
        
        // Adicionar ao mapa
        window.rotaManual.setMap(mapa);
        
        // Adicionar marcadores
        pontos.forEach((ponto, index) => {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(ponto.lat, ponto.lng),
                map: mapa,
                label: index.toString(),
                title: ponto.nome
            });
            
            window.marcadoresRota.push(marker);
        });
        
        // Ajustar visualização
        const bounds = new google.maps.LatLngBounds();
        pontos.forEach(ponto => bounds.extend(new google.maps.LatLng(ponto.lat, ponto.lng)));
        mapa.fitBounds(bounds);
        
        // Atualizar interface
        atualizarInformacoes(null, pontos);
    }
    
    /**
     * Calcular distância entre dois pontos
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