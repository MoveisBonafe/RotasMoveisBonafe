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
                }
            }
            
            // 2. Remover botão de legenda duplicado (se existir)
            const legendButtons = document.querySelectorAll('.custom-map-control[title="Mostrar/esconder legenda"]');
            if (legendButtons.length > 1) {
                for (let i = 1; i < legendButtons.length; i++) {
                    if (legendButtons[i].parentNode) {
                        legendButtons[i].parentNode.removeChild(legendButtons[i]);
                    }
                }
            }
            
        } catch (error) {
            console.error("Erro ao corrigir controles do mapa:", error);
        }
    }, 1000);
}

/**
 * Corrige a atribuição de cores para cidades específicas
 */
function fixRegionColors() {
    try {
        // Correção específica para Tietê
        if (typeof regioesSaoPaulo !== 'undefined' && regioesSaoPaulo['Sorocaba'] && regioesSaoPaulo['Bauru']) {
            // Tietê pertence à região de Sorocaba, não Bauru
            const tieteIndex = regioesSaoPaulo['Bauru'].cidades.indexOf('Tietê');
            if (tieteIndex !== -1) {
                // Remover de Bauru
                regioesSaoPaulo['Bauru'].cidades.splice(tieteIndex, 1);
                // Adicionar em Sorocaba se não existir
                if (!regioesSaoPaulo['Sorocaba'].cidades.includes('Tietê')) {
                    regioesSaoPaulo['Sorocaba'].cidades.push('Tietê');
                }
                console.log("Corrigida região de Tietê: Bauru → Sorocaba");
            }
        }
    } catch (error) {
        console.error("Erro ao corrigir cores de regiões:", error);
    }
}

/**
 * Toggle para mostrar/esconder marcadores de contagem regional
 */
function toggleCountMarkers(buttonElement) {
    try {
        const counters = document.querySelectorAll('.counter-marker');
        const isVisible = !counters[0]?.style.display || counters[0]?.style.display !== 'none';
        
        counters.forEach(counter => {
            counter.style.display = isVisible ? 'none' : 'block';
        });
        
        // Atualizar estilo do botão para indicar estado
        if (buttonElement) {
            buttonElement.classList.toggle('active', !isVisible);
        }
        
        // Atualizar todos os botões de contador (pode haver mais de um em diferentes locais da UI)
        document.querySelectorAll('.counter-toggle-button').forEach(btn => {
            btn.classList.toggle('active', !isVisible);
        });
        
    } catch (error) {
        console.error("Erro ao alternar marcadores de contagem:", error);
    }
}

// Garantir que esses ajustes sejam aplicados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        fixMapControls();
        fixRegionColors();
    }, 1500);
});
