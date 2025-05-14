# Solução para Funcionalidade de Rota Personalizada no GitHub Pages

Este documento descreve a implementação da funcionalidade de "Rota Personalizada" especificamente para a versão do GitHub Pages do Otimizador de Rotas.

## O Problema

O ambiente do GitHub Pages tem algumas limitações e comportamentos diferentes em comparação com o ambiente de desenvolvimento local:

1. Recursos são carregados de forma diferente
2. A ordem de execução dos scripts pode variar
3. As interações entre os scripts podem ser afetadas
4. O DOM pode ser construído em momentos diferentes

## A Solução

A solução implementada funciona da seguinte maneira:

1. **Script Dedicado**: Um arquivo JavaScript independente (`custom-route-github.js`) que contém toda a lógica necessária
2. **Incorporação Direta**: Código incorporado diretamente no `index.html` para garantir execução
3. **Abordagem Progressiva**: Múltiplas tentativas de inicialização para garantir que o DOM esteja pronto
4. **Isolamento**: Funcionalidade isolada sem dependências externas

## Implementação

Para garantir que a funcionalidade de "Rota Personalizada" funcione corretamente no GitHub Pages:

### Passo 1: Modificar o HTML principal

Adicione o seguinte código ao final do `body` no arquivo `index.html`:

```html
<script>
// Código para adicionar o botão de rota personalizada diretamente no HTML
document.addEventListener('DOMContentLoaded', function() {
    // Função para adicionar botão de Rota Personalizada
    function addCustomRouteButton() {
        // Verificar se já existe o botão
        if (document.getElementById('custom-route')) {
            return;
        }
        
        // Esperar pelo botão de otimizar rota
        const optimizeButton = document.getElementById('optimize-route');
        if (!optimizeButton) {
            console.log('Botão de otimizar rota não encontrado, tentando novamente em 500ms');
            setTimeout(addCustomRouteButton, 500);
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
        
        console.log('✓ Botão de Rota Personalizada adicionado com sucesso');
    }
    
    // Tentar adicionar o botão imediatamente
    addCustomRouteButton();
    
    // Tentar novamente após um tempo para garantir que a página foi carregada
    setTimeout(addCustomRouteButton, 1000);
    setTimeout(addCustomRouteButton, 2000);
    setTimeout(addCustomRouteButton, 3000);
});
</script>
```

### Passo 2: Garantir Disponibilidade das Funções Necessárias

Adicione as seguintes funções globais no arquivo `fix-github.js`:

```javascript
// Calcular rota com waypoints personalizados
window.calculateRouteWithWaypoints = function(waypoints) {
    if (!window.directionsService || !window.directionsRenderer || !waypoints || waypoints.length < 2) {
        console.error('Serviço de direções não disponível ou waypoints insuficientes');
        return;
    }
    
    // Criar array de waypoints para o Google Maps
    const gmWaypoints = waypoints.slice(1, -1).map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: true
    }));
    
    // Origem e destino
    const origin = new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng);
    const destination = new google.maps.LatLng(waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng);
    
    // Configurar solicitação de rota
    const request = {
        origin: origin,
        destination: destination,
        waypoints: gmWaypoints,
        optimizeWaypoints: false, // Não otimizar, usar ordem personalizada
        travelMode: google.maps.TravelMode.DRIVING
    };
    
    // Calcular rota
    window.directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            window.directionsRenderer.setDirections(result);
            
            // Calcular distância total
            let totalDistance = 0;
            const legs = result.routes[0].legs;
            legs.forEach(leg => {
                totalDistance += leg.distance.value;
            });
            
            // Atualizar informações da rota
            if (window.updateRouteInfo) {
                const totalDistanceKm = (totalDistance / 1000).toFixed(1);
                const estimatedTime = Math.ceil(totalDistance / 1000 / 80 * 60); // 80km/h
                
                const routeInfo = {
                    distance: totalDistanceKm,
                    duration: estimatedTime,
                    path: waypoints.map(wp => wp.id)
                };
                
                window.updateRouteInfo(routeInfo);
            }
            
            console.log('Rota personalizada exibida com sucesso');
        } else {
            console.error('Erro ao calcular rota:', status);
            if (window.showNotification) {
                window.showNotification('Erro ao calcular rota personalizada. Tente novamente.', 'error');
            } else {
                alert('Erro ao calcular rota personalizada. Tente novamente.');
            }
        }
    });
};
```

### Passo 3: Adicionar Funcionalidade ao Standalone.html

Repita o mesmo procedimento para o arquivo `standalone.html`, usando a mesma abordagem.

## Como Verificar se Está Funcionando

1. Acesse a versão do GitHub Pages do seu projeto
2. Adicione pelo menos 3 localizações além da origem
3. Clique no botão "Rota Personalizada" que deve aparecer abaixo do botão "Otimizar Rota"
4. Verifique se os botões de seta (↑ e ↓) aparecem ao lado de cada localização
5. Use os botões para reordenar as localizações
6. A rota deve ser atualizada automaticamente na ordem personalizada

## Solução de Problemas

Se a funcionalidade não estiver funcionando:

1. Abra o console do navegador (F12) para verificar erros
2. Verifique se o botão "Otimizar Rota" existe
3. Certifique-se de que `window.locations` está definido
4. Verifique se a função `calculateRouteWithWaypoints` está disponível no escopo global
5. Confirme que a função `updateRouteInfo` existe para exibir as informações da rota

## Considerações Finais

Esta implementação foi projetada especificamente para o ambiente do GitHub Pages, com enfoque em:

1. Robustez - múltiplas tentativas para garantir execução
2. Isolamento - depende o mínimo possível de código externo
3. Clareza - código organizado e comentado
4. Usabilidade - interface intuitiva com botões de seta

A abordagem evita problemas comuns no GitHub Pages, como carregamento assíncrono de scripts e disponibilidade tardia de elementos DOM.