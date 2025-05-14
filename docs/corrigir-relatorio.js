/**
 * Script para corrigir especificamente o relatório da rota
 * Versão extremamente específica focada exclusivamente no relatório
 */
(function() {
    console.log('[CorrigirRelatorio] Iniciando script para corrigir o relatório');
    
    // Monitoramento contínuo
    setInterval(monitorarRelatorio, 500);
    
    // Capturar ordem correta dos elementos no painel
    function capturarOrdemCorreta() {
        console.log('[CorrigirRelatorio] Capturando ordem correta dos destinos');
        
        const locais = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[CorrigirRelatorio] Container de destinos não encontrado');
            return locais;
        }
        
        // Obter itens não-origem
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[CorrigirRelatorio] Encontrados', items.length, 'destinos');
        
        items.forEach(item => {
            let nome = '';
            const nomeElement = item.querySelector('.location-name');
            
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else {
                nome = item.textContent.trim().replace(/^\d+[\s\.\-]*/, '');
            }
            
            if (nome) {
                locais.push(nome);
            }
        });
        
        console.log('[CorrigirRelatorio] Ordem correta capturada:', locais);
        return locais;
    }
    
    // Monitorar o relatório de rota
    function monitorarRelatorio() {
        // Verificar se o relatório está aberto
        const relatorio = document.querySelector('#route-report-modal, .route-report, [id*="route-report"]');
        
        if (!relatorio || window.getComputedStyle(relatorio).display === 'none') {
            return;
        }
        
        console.log('[CorrigirRelatorio] Relatório detectado');
        
        // Capturar ordem correta
        const ordemCorreta = capturarOrdemCorreta();
        
        if (ordemCorreta.length === 0) {
            console.log('[CorrigirRelatorio] Sem destinos para corrigir');
            return;
        }
        
        // Encontrar sequência no relatório
        const sequencia = document.querySelector('.sequencia-container, .route-sequence, [class*="sequencia"]');
        
        if (!sequencia) {
            console.log('[CorrigirRelatorio] Container de sequência não encontrado');
            return;
        }
        
        // Verificar se já foi corrigido
        if (sequencia.getAttribute('data-corrigido') === 'true') {
            return;
        }
        
        // Detectar elementos da sequência
        const items = sequencia.querySelectorAll('li, .list-group-item');
        
        if (items.length <= 1) {
            console.log('[CorrigirRelatorio] Sem itens de sequência para corrigir');
            return;
        }
        
        console.log('[CorrigirRelatorio] Corrigindo sequência no relatório');
        
        // Criar HTML corrigido
        let html = '<h5>Sequência da Rota</h5>';
        html += '<ol class="list-group list-group-numbered">';
        
        // Adicionar origem
        html += '<li class="list-group-item">Dois Córregos (Dois Córregos, SP, Brasil) (Origem)</li>';
        
        // Adicionar destinos na ordem capturada do painel
        ordemCorreta.forEach(local => {
            html += `<li class="list-group-item">${local}</li>`;
        });
        
        html += '</ol>';
        
        // Adicionar botão de voltar a otimizar
        html += `
            <div class="text-center mt-3">
                <button class="btn btn-warning" id="recalcular-personalizada">
                    Recalcular com esta ordem
                </button>
            </div>
        `;
        
        // Atualizar o conteúdo
        sequencia.innerHTML = html;
        sequencia.setAttribute('data-corrigido', 'true');
        
        // Configurar botão
        const botao = document.getElementById('recalcular-personalizada');
        if (botao) {
            botao.addEventListener('click', function() {
                console.log('[CorrigirRelatorio] Botão de recálculo clicado');
                
                // Fechar o relatório
                const close = relatorio.querySelector('.btn-close, .close, [data-bs-dismiss="modal"]');
                if (close) {
                    close.click();
                } else {
                    // Alternativa: esconder diretamente
                    relatorio.style.display = 'none';
                    
                    // Se tem backdrop, removê-lo também
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }
                
                // Emular clique na opção de rota personalizada
                setTimeout(function() {
                    const rotaPersonalizada = document.querySelector('.rota-personalizada-card');
                    if (rotaPersonalizada) {
                        rotaPersonalizada.click();
                    } else {
                        // Outra opção: clicar no botão de otimizar
                        const botaoOtimizar = document.getElementById('optimize-route');
                        if (botaoOtimizar) {
                            botaoOtimizar.click();
                        }
                    }
                }, 300);
            });
        }
    }
})();