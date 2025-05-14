/**
 * Script para garantir que a rota padrão seja sempre selecionada ao otimizar
 * Esta solução específica lida apenas com este comportamento
 */
(function() {
    console.log('[RotaPadrao] Iniciando script para garantir rota padrão');
    
    // Monitorar o botão de otimizar
    monitorarBotaoOtimizar();
    
    /**
     * Monitorar o botão de otimizar rota
     */
    function monitorarBotaoOtimizar() {
        // Encontrar o botão
        const botao = document.getElementById('optimize-route');
        
        if (!botao) {
            console.log('[RotaPadrao] Botão não encontrado, tentando novamente...');
            setTimeout(monitorarBotaoOtimizar, 1000);
            return;
        }
        
        // Verificar se já foi configurado
        if (botao.getAttribute('data-padrao-configurado') === 'true') {
            return;
        }
        
        // Substituir o evento de clique
        console.log('[RotaPadrao] Configurando botão para mostrar rota padrão');
        
        // Preservar comportamento original
        const originalOnClick = botao.onclick;
        
        // Substituir
        botao.onclick = function(e) {
            console.log('[RotaPadrao] Botão de otimizar clicado');
            
            // Executar o comportamento original
            if (typeof originalOnClick === 'function') {
                originalOnClick.call(this, e);
            }
            
            // Depois de um tempo, garantir que a rota padrão esteja selecionada
            setTimeout(selecionarRotaPadrao, 500);
            
            // Evitar comportamento padrão do botão (recarregar página)
            return false;
        };
        
        // Marcar como configurado
        botao.setAttribute('data-padrao-configurado', 'true');
    }
    
    /**
     * Selecionar a rota padrão (não personalizada)
     */
    function selecionarRotaPadrao() {
        console.log('[RotaPadrao] Selecionando rota padrão');
        
        // Encontrar container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            console.log('[RotaPadrao] Container de alternativas não encontrado');
            setTimeout(selecionarRotaPadrao, 500);
            return;
        }
        
        // Encontrar cartões de rotas
        const cards = container.querySelectorAll('.route-option-card');
        let rotaPadraoCard = null;
        let selecionado = false;
        
        // Procurar a rota padrão (não personalizada) e verificar qual está selecionado
        cards.forEach(card => {
            const texto = card.textContent.toLowerCase();
            
            // Verificar se está selecionado
            if (card.classList.contains('selected')) {
                selecionado = true;
            }
            
            // Se não é rota personalizada e é recomendada, guardar referência
            if (!texto.includes('personalizada') && 
                (texto.includes('recomendada') || texto.includes('otimizada'))) {
                rotaPadraoCard = card;
            }
        });
        
        // Se já tem algo selecionado e não encontramos a rota padrão, não fazer nada
        if (selecionado && !rotaPadraoCard) {
            console.log('[RotaPadrao] Já tem uma rota selecionada e rota padrão não encontrada');
            return;
        }
        
        // Se encontramos a rota padrão, selecionar
        if (rotaPadraoCard) {
            console.log('[RotaPadrao] Selecionando rota padrão automaticamente');
            rotaPadraoCard.click();
        } else {
            console.log('[RotaPadrao] Rota padrão não encontrada');
            
            // Alternativa: selecionar o primeiro card que não seja personalizado
            for (const card of cards) {
                const texto = card.textContent.toLowerCase();
                if (!texto.includes('personalizada')) {
                    console.log('[RotaPadrao] Selecionando primeira rota não-personalizada');
                    card.click();
                    break;
                }
            }
        }
    }
})();