/**
 * Correção do filtro de eventos de cidades
 * Este script garante que eventos só sejam exibidos quando a cidade estiver realmente no percurso
 * Soluciona o problema de eventos aparecendo sem cidades adicionadas
 */

(function() {
    // Executar quando o documento estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar um tempo para que outros scripts carreguem
        setTimeout(fixEventFilter, 1000);
    });
    
    // Verificar se o documento já está carregado
    if (document.readyState !== 'loading') {
        setTimeout(fixEventFilter, 1000);
    }
    
    // Função principal para corrigir o filtro de eventos
    function fixEventFilter() {
        console.log('[EventFilter] Inicializando correção do filtro de eventos');
        
        // Substituir a função de verificação de eventos
        if (window.updateRouteEvents && typeof window.updateRouteEvents === 'function') {
            // Guardar a função original para caso seja necessário
            window._originalUpdateRouteEvents = window.updateRouteEvents;
            
            // Sobrescrever com nossa função corrigida
            window.updateRouteEvents = function() {
                console.log('[EventFilter] Usando filtro de eventos corrigido');
                
                // Verificar se há locais adicionados
                const locationsList = document.querySelector('#locations-list');
                const locationsItems = locationsList ? locationsList.querySelectorAll('.location-item') : [];
                
                if (!locationsItems.length) {
                    console.log('[EventFilter] Sem locais adicionados, ocultando eventos');
                    clearEventsList();
                    return;
                }
                
                // Obter cidades do percurso atual
                const citiesInRoute = getCitiesInRoute();
                console.log('[EventFilter] Cidades no percurso:', citiesInRoute);
                
                if (!citiesInRoute.length) {
                    console.log('[EventFilter] Sem cidades no percurso, ocultando eventos');
                    clearEventsList();
                    return;
                }
                
                // Filtrar eventos apenas para cidades que estão no percurso
                filterCityEvents(citiesInRoute);
            };
            
            console.log('[EventFilter] Função de atualização de eventos substituída');
        } else {
            console.warn('[EventFilter] Função updateRouteEvents não encontrada, aplicando correção alternativa');
            
            // Configurar um observador para detectar quando eventos são adicionados
            setupEventsObserver();
        }
        
        // Executar a correção quando a página mudar de estado
        window.addEventListener('hashchange', function() {
            setTimeout(checkAndFixEvents, 500);
        });
        
        // Verificar periodicamente
        setInterval(checkAndFixEvents, 5000);
        
        // Executar uma verificação inicial
        checkAndFixEvents();
    }
    
    // Obter lista de cidades realmente no percurso
    function getCitiesInRoute() {
        // Verificar se há locais adicionados
        const locationsList = document.querySelector('#locations-list');
        if (!locationsList) return [];
        
        const locationItems = locationsList.querySelectorAll('.location-item');
        if (!locationItems.length) return [];
        
        // Extrair nomes das cidades dos locais adicionados
        const cities = [];
        locationItems.forEach(item => {
            const cityText = item.textContent || '';
            // Extrair apenas o nome da cidade
            const cityMatch = cityText.match(/([A-Za-zÀ-ÖØ-öø-ÿ\s\-']+)(?:,|\s-)/);
            if (cityMatch && cityMatch[1]) {
                cities.push(cityMatch[1].trim());
            }
        });
        
        console.log('[EventFilter] Cidades extraídas dos locais:', cities);
        return cities;
    }
    
    // Filtrar eventos para mostrar apenas cidades do percurso
    function filterCityEvents(citiesInRoute) {
        // Verificar se a variável global de eventos existe
        if (typeof window.allCityEvents === 'undefined') {
            console.warn('[EventFilter] Variável global de eventos não encontrada');
            return;
        }
        
        // Se não houver cidades, limpar lista
        if (!citiesInRoute.length) {
            clearEventsList();
            return;
        }
        
        // Filtrar eventos relevantes
        const filteredEvents = window.allCityEvents.filter(event => {
            // Normalizar nome da cidade do evento
            const eventCity = normalizeCity(event.city);
            
            // Verificar se alguma cidade do percurso corresponde
            return citiesInRoute.some(city => {
                const routeCity = normalizeCity(city);
                return eventCity === routeCity || 
                       eventCity.includes(routeCity) || 
                       routeCity.includes(eventCity);
            });
        });
        
        console.log('[EventFilter] Eventos filtrados:', filteredEvents.length);
        
        // Atualizar a lista na interface
        updateEventsList(filteredEvents);
    }
    
    // Atualizar lista de eventos na interface
    function updateEventsList(events) {
        // Buscar o elemento da lista de eventos
        const eventsList = document.querySelector('.event-list, .eventos-list, #events-list');
        if (!eventsList) {
            console.warn('[EventFilter] Lista de eventos não encontrada');
            return;
        }
        
        // Limpar a lista atual
        eventsList.innerHTML = '';
        
        // Se não houver eventos, mostrar mensagem
        if (!events.length) {
            eventsList.innerHTML = '<p>Nenhum evento encontrado para o período e cidades selecionados.</p>';
            return;
        }
        
        // Adicionar cada evento à lista
        events.forEach(event => {
            // Criar elemento para o evento
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            
            // Determinar classe de importância
            let importanceClass = 'low';
            if (event.importance === 'Alto') {
                importanceClass = 'high';
            } else if (event.importance === 'Médio') {
                importanceClass = 'medium';
            }
            
            // Determinar classe do tipo
            let typeClass = '';
            if (event.eventType === 'Feriado') {
                typeClass = 'holiday';
            } else if (event.eventType === 'Evento Cultural') {
                typeClass = 'cultural';
            } else if (event.eventType === 'Evento Comercial') {
                typeClass = 'commercial';
            }
            
            // Criar HTML para o evento
            eventItem.innerHTML = `
                <div class="event-header">
                    <h5 class="event-title">${event.event}</h5>
                    <span class="event-type ${typeClass}">${event.eventType}</span>
                    <span class="event-importance ${importanceClass}">${event.importance}</span>
                </div>
                <div class="event-city">${event.city} | ${event.startDate}</div>
                <div class="event-description">${event.description}</div>
            `;
            
            // Adicionar à lista
            eventsList.appendChild(eventItem);
        });
    }
    
    // Limpar lista de eventos
    function clearEventsList() {
        const eventsList = document.querySelector('.event-list, .eventos-list, #events-list');
        if (eventsList) {
            eventsList.innerHTML = '<p>Nenhum evento encontrado para o período e cidades selecionados.</p>';
        }
    }
    
    // Normalizar nome de cidade para comparação
    function normalizeCity(cityName) {
        if (!cityName) return '';
        
        return cityName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // remover acentos
            .replace(/[^\w\s]/g, '')  // remover caracteres especiais
            .replace(/\s+/g, ' ')     // remover espaços extras
            .trim();
    }
    
    // Configurar observador para lista de eventos
    function setupEventsObserver() {
        // Criar observador para detectar quando eventos são adicionados
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Verificar se foi adicionado algum evento
                    const hasEventItems = Array.from(mutation.addedNodes).some(node => 
                        node.classList && 
                        (node.classList.contains('event-item') || node.querySelector('.event-item'))
                    );
                    
                    if (hasEventItems) {
                        console.log('[EventFilter] Eventos adicionados detectados, aplicando filtro');
                        checkAndFixEvents();
                    }
                }
            });
        });
        
        // Procurar elemento da lista de eventos
        const eventsList = document.querySelector('.event-list, .eventos-list, #events-list');
        if (eventsList) {
            // Observar mudanças na lista de eventos
            observer.observe(eventsList, { childList: true, subtree: true });
            console.log('[EventFilter] Observador configurado para a lista de eventos');
        } else {
            // Observar o documento inteiro para encontrar quando a lista for adicionada
            observer.observe(document.body, { childList: true, subtree: true });
            console.log('[EventFilter] Observador configurado para o documento inteiro');
        }
    }
    
    // Verificação completa para corrigir eventos
    function checkAndFixEvents() {
        // Verificar se há locais adicionados
        const locationsList = document.querySelector('#locations-list');
        const locationsItems = locationsList ? locationsList.querySelectorAll('.location-item') : [];
        
        if (!locationsItems.length) {
            console.log('[EventFilter] Verificação: Sem locais adicionados, ocultando eventos');
            clearEventsList();
            return;
        }
        
        // Obter cidades do percurso atual
        const citiesInRoute = getCitiesInRoute();
        
        if (!citiesInRoute.length) {
            console.log('[EventFilter] Verificação: Sem cidades no percurso, ocultando eventos');
            clearEventsList();
            return;
        }
        
        // Filtrar eventos apenas para cidades que estão no percurso
        filterCityEvents(citiesInRoute);
    }
})();