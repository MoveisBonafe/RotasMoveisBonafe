// Funcionalidade de Rota Personalizada para GitHub Pages
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já existe um botão de Rota Personalizada
    if (document.getElementById('custom-route')) {
        console.log('Botão de rota personalizada já existe');
        return;
    }
    
    // Pegar referência para o botão de otimizar rota
    const optimizeButton = document.getElementById('optimize-route');
    if (!optimizeButton) {
        console.error('Botão de otimizar rota não encontrado');
        return;
    }
    
    // Adicionar CSS para modo de rota personalizada
    const style = document.createElement('style');
    style.textContent = `
        .custom-route-active .location-item {
            cursor: pointer;
            position: relative;
            transition: background-color 0.2s;
        }
        .custom-route-active .location-item:hover {
            background-color: #fffbeb;
        }
        .move-button {
            padding: 2px 5px;
            margin-right: 2px;
            color: #ffc107;
            background-color: transparent;
            border: 1px solid #ffc107;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
        }
        .move-button:hover {
            background-color: #fff8e1;
        }
    `;
    document.head.appendChild(style);
    
    // Criar botão de rota personalizada
    const customRouteButton = document.createElement('button');
    customRouteButton.id = 'custom-route';
    customRouteButton.className = 'btn';
    customRouteButton.style.backgroundColor = '#f8f9fa';
    customRouteButton.style.color = '#000000';
    customRouteButton.style.fontWeight = '600';
    customRouteButton.style.borderColor = '#ced4da';
    customRouteButton.style.width = '100%';
    customRouteButton.style.marginBottom = '10px';
    customRouteButton.textContent = 'Rota Personalizada';
    
    // Inserir o botão após o botão de otimizar
    optimizeButton.parentNode.insertBefore(customRouteButton, optimizeButton.nextSibling);
    
    // Adicionar espaço
    const spacer = document.createElement('div');
    spacer.style.height = '5px';
    optimizeButton.parentNode.insertBefore(spacer, customRouteButton);
    
    // Variável para controlar o modo
    let customRouteMode = false;
    
    // Função para atualizar a rota
    window.updateCustomRoute = function() {
        const locationsList = document.getElementById('locations-list');
        if (!locationsList) return;
        
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
            console.log('Não há locais suficientes para uma rota');
            return;
        }
        
        // Aqui você pode chamar a função que calcula a rota com a nova ordem
        if (window.calculateRouteWithWaypoints && window.locations) {
            // Ordenar locations de acordo com os IDs
            const sortedLocations = [];
            for (const id of locationIds) {
                const location = window.locations.find(loc => String(loc.id) === String(id));
                if (location) {
                    sortedLocations.push(location);
                }
            }
            
            if (sortedLocations.length > 1) {
                window.calculateRouteWithWaypoints(sortedLocations);
            }
        } else {
            console.log('Função de cálculo de rota não disponível ou não há locations');
        }
    };
    
    // Adicionar evento ao botão
    customRouteButton.addEventListener('click', function() {
        customRouteMode = !customRouteMode;
        
        const locationsListElement = document.getElementById('locations-list');
        if (!locationsListElement) return;
        
        if (customRouteMode) {
            // Ativar modo
            this.style.backgroundColor = '#ffc107';
            this.style.borderColor = '#ffab00';
            locationsListElement.classList.add('custom-route-active');
            
            // Adicionar botões para cada item
            const locationItems = locationsListElement.querySelectorAll('li:not(.origin-point)');
            locationItems.forEach(function(item, index) {
                // Criar HTML para botões
                const controls = document.createElement('div');
                controls.className = 'custom-route-controls';
                controls.style.display = 'inline-block';
                controls.style.marginRight = '10px';
                
                // Botão para cima
                const upBtn = document.createElement('button');
                upBtn.type = 'button';
                upBtn.className = 'move-button move-up';
                upBtn.textContent = '↑';
                upBtn.title = 'Mover para cima';
                
                // Botão para baixo
                const downBtn = document.createElement('button');
                downBtn.type = 'button';
                downBtn.className = 'move-button move-down';
                downBtn.textContent = '↓';
                downBtn.title = 'Mover para baixo';
                
                // Adicionar botões ao controle
                controls.appendChild(upBtn);
                controls.appendChild(downBtn);
                
                // Inserir no início do item
                item.insertBefore(controls, item.firstChild);
                
                // Adicionar eventos
                upBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const li = this.closest('li');
                    const prev = li.previousElementSibling;
                    if (prev && !prev.classList.contains('origin-point')) {
                        locationsListElement.insertBefore(li, prev);
                        window.updateCustomRoute();
                    }
                });
                
                downBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const li = this.closest('li');
                    const next = li.nextElementSibling;
                    if (next) {
                        locationsListElement.insertBefore(next, li);
                        window.updateCustomRoute();
                    }
                });
            });
            
            // Notificação
            if (window.showNotification) {
                window.showNotification('Modo de rota personalizada ativado. Use as setas para reordenar os locais.', 'info');
            } else {
                alert('Modo de rota personalizada ativado. Use as setas para reordenar os locais.');
            }
        } else {
            // Desativar modo
            this.style.backgroundColor = '#f8f9fa';
            this.style.borderColor = '#ced4da';
            locationsListElement.classList.remove('custom-route-active');
            
            // Remover botões
            const controls = locationsListElement.querySelectorAll('.custom-route-controls');
            controls.forEach(function(control) {
                control.remove();
            });
            
            // Atualizar rota
            window.updateCustomRoute();
        }
    });
    
    console.log('✓ Funcionalidade de Rota Personalizada inicializada com sucesso');
});