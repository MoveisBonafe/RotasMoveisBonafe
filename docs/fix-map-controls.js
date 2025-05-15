/**
 * Script para corrigir os controles do mapa e posicionamento de botões
 * - Reposiciona o botão de contador regional para canto inferior direito
 * - Remove o botão de legenda duplicado
 * - Corrige inicialização de eventos para os botões
 */
function fixMapControls() {
    // Aguardar até que o mapa esteja inicializado
    setTimeout(function() {
        try {
            // 1. Reposicionar botão de contador regional para o canto inferior direito
            const countButton = document.querySelector('.custom-map-control[title="Mostrar contadores regionais"]');
            if (countButton) {
                // Remover das posições anteriores (se existir)
                if (countButton.parentNode) {
                    countButton.parentNode.removeChild(countButton);
                }
                
                // Adicionar ao canto inferior direito
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    const controlDiv = document.createElement('div');
                    controlDiv.className = 'custom-map-control-container';
                    controlDiv.style.position = 'absolute';
                    controlDiv.style.bottom = '90px';
                    controlDiv.style.right = '10px';
                    controlDiv.appendChild(countButton);
                    
                    // Adicionar ao mapa
                    mapElement.appendChild(controlDiv);
                    
                    console.log("Botão de contador regional reposicionado para o canto inferior direito");
                }
            }
            
            // 2. Remover botão de legenda duplicado
            const legendButtons = document.querySelectorAll('.custom-map-control[title="Mostrar legenda de regiões"]');
            if (legendButtons.length > 1) {
                // Manter apenas o primeiro botão
                for (let i = 1; i < legendButtons.length; i++) {
                    const duplicateButton = legendButtons[i];
                    if (duplicateButton && duplicateButton.parentNode) {
                        duplicateButton.parentNode.removeChild(duplicateButton);
                        console.log("Botão de legenda duplicado removido");
                    }
                }
            }
            
            // 3. Garantir que os event listeners estejam configurados corretamente
            const countToggleButtons = document.querySelectorAll('.custom-map-control[title="Mostrar contadores regionais"]');
            countToggleButtons.forEach(button => {
                // Remover eventos antigos (evitar duplicação)
                button.removeEventListener('click', toggleCountMarkers);
                
                // Adicionar evento novo
                button.addEventListener('click', function() {
                    toggleCountMarkers(this);
                });
                
                console.log("Event listener para o botão de contador regional configurado");
            });
            
            // 4. Corrigir cores para cidades específicas
            fixRegionColors();
            
        } catch (error) {
            console.error("Erro ao corrigir controles do mapa:", error);
        }
    }, 2000); // Esperar 2 segundos para garantir que o mapa esteja carregado
}

/**
 * Corrige a atribuição de cores para cidades específicas
 */
function fixRegionColors() {
    // Lista de cidades que devem ser corrigidas
    const fixCities = {
        "Ribeirão Branco": "Sorocaba",
        "Ribeirao Branco": "Sorocaba",
        "Ribeira": "Sorocaba",
        "Taquarivaí": "Sorocaba",
        "Taquarivai": "Sorocaba",
        "Buri": "Sorocaba"
    };
    
    // Buscar por marcadores existentes
    if (window.allMarkers && window.allMarkers.length > 0) {
        window.allMarkers.forEach(marker => {
            const city = marker.cityName;
            
            // Verificar se a cidade está na lista de correções
            if (fixCities[city]) {
                const region = fixCities[city];
                const newColor = getRegionColor("SP", region);
                
                // Atualizar cor do marcador
                if (marker.setIcon && newColor) {
                    const icon = marker.getIcon();
                    if (icon) {
                        // Atualizar a cor no ícone
                        const newIcon = {
                            ...icon,
                            fillColor: newColor,
                            strokeColor: newColor
                        };
                        
                        marker.setIcon(newIcon);
                        
                        // Atualizar propriedades do marcador
                        marker.region = region;
                        marker.regionColor = newColor;
                        
                        console.log(`Cor corrigida para cidade ${city} (Região: ${region})`);
                    }
                }
            }
        });
    }
}

/**
 * Toggle para mostrar/esconder marcadores de contagem regional
 */
function toggleCountMarkers(buttonElement) {
    try {
        if (!buttonElement) {
            console.error("Elemento do botão não fornecido para toggleCountMarkers");
            return;
        }
        
        // Toggle da classe active no botão
        buttonElement.classList.toggle('active');
        
        // Se não existirem marcadores de contagem, não fazer nada
        if (!window.countMarkers || Object.keys(window.countMarkers).length === 0) {
            console.log("Não há marcadores de contagem para mostrar/esconder");
            return;
        }
        
        const isVisible = buttonElement.classList.contains('active');
        
        // Percorrer todos os marcadores de contagem e definir visibilidade
        for (const region in window.countMarkers) {
            const marker = window.countMarkers[region];
            if (marker && marker.setVisible) {
                marker.setVisible(isVisible);
            }
        }
        
        console.log(`Marcadores de contagem ${isVisible ? 'exibidos' : 'escondidos'}`);
    } catch (error) {
        console.error("Erro ao alternar marcadores de contagem:", error);
    }
}

// Executar as correções quando a página estiver carregada
document.addEventListener('DOMContentLoaded', fixMapControls);

// Certificar-se de que as correções sejam aplicadas quando o mapa for carregado
window.addEventListener('load', fixMapControls);

// Permitir acesso global para as funções
window.fixMapControls = fixMapControls;
window.toggleCountMarkers = toggleCountMarkers;
window.fixRegionColors = fixRegionColors;