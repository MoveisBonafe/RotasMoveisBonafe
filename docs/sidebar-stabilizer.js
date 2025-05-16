/**
 * Estabilizador de sidebar - elimina o tremor durante o carregamento
 * Este script aplica estilos críticos imediatamente para evitar 
 * que a sidebar trema durante o carregamento da página
 */
(function() {
    // Script de inicialização crítica - executado antes mesmo do DOM estar pronto
    var stabilizeLayout = function() {
        // 1. Aplicar estilos criticamente importantes de forma direta
        var style = document.createElement('style');
        style.textContent = `
            /* Estilos críticos aplicados durante o carregamento */
            body, html {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                height: 100% !important;
                width: 100% !important;
            }
            
            /* Forçar estabilidade na sidebar */
            .sidebar {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                bottom: 0 !important;
                width: 380px !important;
                max-width: 380px !important;
                height: 100% !important;
                overflow-y: auto !important;
                z-index: 10 !important;
                box-sizing: border-box !important;
                transform: none !important;
                transition: none !important;
                animation: none !important;
            }
            
            /* Posicionar o mapa corretamente desde o início */
            .map-container {
                position: absolute !important;
                top: 0 !important;
                left: 380px !important;
                right: 0 !important;
                bottom: 60px !important;
                width: calc(100% - 380px) !important;
                height: calc(100% - 60px) !important;
                overflow: hidden !important;
                transform: none !important;
                transition: none !important;
                animation: none !important;
            }
            
            /* Garantir que as abas inferiores estejam no lugar certo */
            .bottom-tabs-container {
                position: absolute !important;
                left: 380px !important;
                right: 0 !important;
                bottom: 0 !important;
                height: 60px !important;
                width: calc(100% - 380px) !important;
                transform: none !important;
                transition: none !important;
                animation: none !important;
            }
            
            /* Evitar qualquer tipo de animação durante o carregamento */
            * {
                transition-delay: 0s !important;
                animation-delay: 0s !important;
            }
            
            /* Para telas menores */
            @media (max-width: 768px) {
                .sidebar {
                    width: 320px !important;
                    max-width: 320px !important;
                }
                
                .map-container {
                    left: 320px !important;
                    width: calc(100% - 320px) !important;
                }
                
                .bottom-tabs-container {
                    left: 320px !important;
                    width: calc(100% - 320px) !important;
                }
            }
        `;
        
        // Inserir os estilos no cabeçalho o mais rápido possível
        (document.head || document.documentElement).appendChild(style);
        
        console.log("[Sidebar Stabilizer] Estilos críticos aplicados");
    };
    
    // Função executada quando o DOM está pronto para ajustes finos
    var fineTuneLayout = function() {
        // Selecionar elementos principais
        var sidebar = document.querySelector('.sidebar');
        var mapContainer = document.querySelector('.map-container');
        var bottomTabs = document.querySelector('.bottom-tabs-container');
        
        // Aplicar estilos diretamente nos elementos DOM para maior garantia
        if (sidebar) {
            Object.assign(sidebar.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                bottom: '0',
                width: '380px',
                maxWidth: '380px',
                height: '100%',
                overflowY: 'auto',
                zIndex: '10',
                boxSizing: 'border-box'
            });
            
            console.log("[Sidebar Stabilizer] Sidebar estabilizada");
        }
        
        if (mapContainer) {
            Object.assign(mapContainer.style, {
                position: 'absolute',
                top: '0',
                left: sidebar ? sidebar.offsetWidth + 'px' : '380px',
                right: '0',
                bottom: '60px',
                width: sidebar ? 'calc(100% - ' + sidebar.offsetWidth + 'px)' : 'calc(100% - 380px)',
                overflow: 'hidden'
            });
            
            console.log("[Sidebar Stabilizer] Mapa posicionado corretamente");
        }
        
        if (bottomTabs) {
            Object.assign(bottomTabs.style, {
                position: 'absolute',
                left: sidebar ? sidebar.offsetWidth + 'px' : '380px',
                right: '0',
                bottom: '0',
                height: '60px',
                width: sidebar ? 'calc(100% - ' + sidebar.offsetWidth + 'px)' : 'calc(100% - 380px)'
            });
            
            console.log("[Sidebar Stabilizer] Abas inferiores posicionadas");
        }
        
        console.log("[Sidebar Stabilizer] Layout estabilizado com sucesso");
    };
    
    // Aplicar estabilização imediatamente
    stabilizeLayout();
    
    // Aplicar ajustes finos quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fineTuneLayout);
    } else {
        fineTuneLayout();
    }
    
    // Verificar novamente após todos os recursos carregarem
    window.addEventListener('load', fineTuneLayout);
    
    // Verificar quando a janela for redimensionada
    window.addEventListener('resize', fineTuneLayout);
    
    // Fazer verificações adicionais após algum tempo para garantir
    setTimeout(fineTuneLayout, 100);
    setTimeout(fineTuneLayout, 500);
    setTimeout(fineTuneLayout, 1000);
})();