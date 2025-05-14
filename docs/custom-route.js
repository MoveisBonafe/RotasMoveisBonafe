// Script dedicado para funcionalidade de Rota Personalizada no GitHub Pages
window.customRouteMode = false;

// Função para alternar o modo de rota personalizada
window.toggleCustomRouteMode = function() {
    window.customRouteMode = !window.customRouteMode;
    const locationsListElement = document.getElementById('locations-list');
    const customRouteButton = document.getElementById('custom-route');
    
    if (window.customRouteMode) {
        // Ativar modo de rota personalizada
        locationsListElement.classList.add('custom-route-active');
        customRouteButton.style.backgroundColor = '#ffc107';
        customRouteButton.style.borderColor = '#ffab00';
        
        // Identificar todos os itens não-origem
        const locationItems = locationsListElement.querySelectorAll('li:not(.origin-point)');
        
        // Adicionar HTML diretamente com botões para solução mais compatível
        locationItems.forEach(item => {
            // Criar o HTML para os botões de subir/descer - usando caracteres unicode simples para maior compatibilidade
            const buttonsHTML = `
                <span class="position-controls" style="margin-right: 10px;">
                    <button type="button" class="btn btn-sm move-up" style="padding: 0 5px; margin-right: 2px; font-size: 16px; color: #ffc107; background-color: transparent; border: 1px solid #ffc107;" title="Mover para cima">↑</button>
                    <button type="button" class="btn btn-sm move-down" style="padding: 0 5px; font-size: 16px; color: #ffc107; background-color: transparent; border: 1px solid #ffc107;" title="Mover para baixo">↓</button>
                </span>
            `;
            
            // Inserir no início do item
            item.innerHTML = buttonsHTML + item.innerHTML;
            
            // Adicionar os event listeners após inserir o HTML
            const upButton = item.querySelector('.move-up');
            const downButton = item.querySelector('.move-down');
            
            if (upButton) {
                upButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const li = this.closest('li');
                    const previousSibling = li.previousElementSibling;
                    if (previousSibling && !previousSibling.classList.contains('origin-point')) {
                        locationsListElement.insertBefore(li, previousSibling);
                        updateCustomRoute();
                    }
                });
            }
            
            if (downButton) {
                downButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const li = this.closest('li');
                    const nextSibling = li.nextElementSibling;
                    if (nextSibling) {
                        locationsListElement.insertBefore(nextSibling, li);
                        updateCustomRoute();
                    }
                });
            }
        });
        
        showNotification('Modo de rota personalizada ativado. Use as setas para reordenar os locais.', 'info');
    } else {
        // Desativar modo de rota personalizada
        locationsListElement.classList.remove('custom-route-active');
        customRouteButton.style.backgroundColor = '#f8f9fa';
        customRouteButton.style.borderColor = '#ced4da';
        
        // Recriar a lista sem os controles
        const items = locationsListElement.querySelectorAll('li');
        items.forEach(item => {
            // Remover controles de posição se existirem
            const controls = item.querySelector('.position-controls');
            if (controls) {
                controls.remove();
            }
        });
        
        // Atualizar a rota com a nova ordem
        updateCustomRoute();
    }
};

// Função para atualizar a rota com a nova ordem personalizada
function updateCustomRoute() {
    const locationsList = document.getElementById('locations-list');
    const items = locationsList.querySelectorAll('li');
    const locationIds = [];
    
    // Coletar IDs na nova ordem
    items.forEach(item => {
        const id = item.getAttribute('data-id');
        if (id) {
            locationIds.push(id);
        }
    });
    
    if (locationIds.length < 2) {
        return; // Não há locais suficientes para uma rota
    }
    
    // Atualizar a variável global para a nova ordem
    window.locationOrder = locationIds;
    
    // Obter dados de location do localStorage se disponível
    let customLocations = [];
    const origin = JSON.parse(localStorage.getItem('currentOrigin') || '{}');
    const destinations = JSON.parse(localStorage.getItem('currentDestinations') || '[]');
    
    // Verificar se temos dados suficientes
    if (!origin.id || destinations.length === 0) {
        return;
    }
    
    // Criar array com origem e destinos
    customLocations = [origin, ...destinations];
    
    // Ordenar localizações de acordo com os IDs
    const sortedLocations = [];
    for (const id of locationIds) {
        const location = customLocations.find(loc => loc.id == id);
        if (location) {
            sortedLocations.push(location);
        }
    }
    
    // Se não tivermos todas as localizações, usar as originais
    if (sortedLocations.length < customLocations.length) {
        return;
    }
    
    // Calcular e mostrar a rota personalizada
    const locationCoordinates = sortedLocations.map(loc => ({
        lat: loc.lat || loc.latitude,
        lng: loc.lng || loc.longitude,
        name: loc.name,
        address: loc.address
    }));
    
    // Atualizar rota no mapa
    if (window.calculateRouteWithWaypoints) {
        window.calculateRouteWithWaypoints(locationCoordinates);
    }
}

// Adicionar CSS para modo de rota personalizada
function addCustomRouteCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-route-active .location-item {
            cursor: pointer;
            position: relative;
            padding-left: 10px;
            transition: background-color 0.2s;
        }
        .custom-route-active .location-item:hover {
            background-color: #fffbeb;
        }
        .draggable {
            cursor: move;
            position: relative;
        }
        .location-item.dragging {
            opacity: 0.7;
            background-color: #fffbeb;
            border: 1px dashed #ffc107;
        }
    `;
    document.head.appendChild(style);
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    addCustomRouteCSS();
    
    // Adicionar evento ao botão de rota personalizada
    const customRouteButton = document.getElementById('custom-route');
    if (customRouteButton) {
        customRouteButton.addEventListener('click', window.toggleCustomRouteMode);
    }
});