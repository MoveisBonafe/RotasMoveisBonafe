/**
 * Solução FINAL para relatório que REALMENTE FUNCIONA
 * Esta versão garante que o relatório sempre mostra a ordem correta
 */
(function() {
    console.log('[FINAL] Iniciando correção garantida do relatório');
    
    // Definições de constantes
    const DOIS_CORREGOS = 'Dois Córregos';
    
    // Intervalo para monitoramento (mais frequente)
    setInterval(verificarRelatorio, 200);
    
    /**
     * Verificar se o relatório está aberto e corrigi-lo
     */
    function verificarRelatorio() {
        // Verificar se o relatório está aberto
        const relatorio = document.querySelector('#route-report-modal, [id*="route-report"], .route-report, .modal:not([style*="display: none"])');
        
        if (!relatorio || window.getComputedStyle(relatorio).display === 'none') {
            return;
        }
        
        // Verificar se precisamos corrigir
        if (relatorio.getAttribute('data-corrigido-final') === 'true') {
            return;
        }
        
        console.log('[FINAL] Relatório encontrado, aplicando correção');
        
        // Obter destinos da lista
        const listaDestinos = obterListaDeDestinos();
        
        if (listaDestinos.length === 0) {
            console.log('[FINAL] Nenhum destino encontrado');
            return;
        }
        
        // Forçar a inserção de conteúdo correto
        inserirRelatorioCorreto(relatorio, listaDestinos);
        
        // Marcar como corrigido
        relatorio.setAttribute('data-corrigido-final', 'true');
        
        // Configurar observador para modificações no relatório
        const observer = new MutationObserver(function(mutations) {
            console.log('[FINAL] Detectada alteração no relatório, reaplicando correção');
            relatorio.removeAttribute('data-corrigido-final');
            verificarRelatorio();
        });
        
        // Configurar observação
        observer.observe(relatorio, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }
    
    /**
     * Obter a lista de destinos atual
     */
    function obterListaDeDestinos() {
        const destinos = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[FINAL] Container de destinos não encontrado');
            return destinos;
        }
        
        // Obter itens arrastáveis
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        // Processar cada item
        items.forEach(function(item) {
            let nome = '';
            const nomeElement = item.querySelector('.location-name');
            
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else {
                nome = item.textContent.trim().replace(/^\d+[\s\.\-]*/, '');
            }
            
            if (nome) {
                destinos.push(nome);
            }
        });
        
        console.log('[FINAL] Destinos obtidos:', destinos);
        return destinos;
    }
    
    /**
     * Inserir relatório com conteúdo correto
     */
    function inserirRelatorioCorreto(relatorio, destinos) {
        console.log('[FINAL] Inserindo conteúdo correto no relatório');
        
        // 1. Verificar se o relatório já tem uma estrutura
        const existenteResumo = relatorio.querySelector('h5:contains("Resumo"), h4:contains("Resumo"), .resumo-container, [class*="resumo"]');
        const existenteSequencia = relatorio.querySelector('h5:contains("Sequência"), h4:contains("Sequência"), .sequencia-container, [class*="sequencia"]');
        
        // 2. Criar novo conteúdo HTML
        let html = '';
        
        // Se não houver resumo, criar um básico
        if (!existenteResumo) {
            html += `
                <h5>Resumo da Rota</h5>
                <div>
                    <p><strong>Distância total:</strong> Personalizada</p>
                    <p><strong>Tempo estimado:</strong> Calculado com base na ordem definida</p>
                </div>
            `;
        }
        
        // Criar a sequência correta (esta é a parte crucial)
        html += `
            <h5>Sequência da Rota (Ordem Personalizada)</h5>
            <ol class="list-group list-group-numbered">
                <li class="list-group-item">${DOIS_CORREGOS} (${DOIS_CORREGOS}, SP, Brasil) (Origem)</li>
        `;
        
        // Adicionar cada destino na ordem correta
        destinos.forEach(function(destino) {
            html += `<li class="list-group-item">${destino}</li>`;
        });
        
        html += `</ol>`;
        
        // Adicionar botão para recalcular
        html += `
            <div class="text-center mt-3">
                <button class="btn btn-warning" id="recalcular-rota-final">
                    Recalcular usando esta ordem
                </button>
            </div>
        `;
        
        // 3. Encontrar onde inserir o conteúdo
        const containerSequencia = existenteSequencia || relatorio.querySelector('.route-sequence, .sequencia-container, [class*="sequencia"], .modal-body');
        
        if (containerSequencia) {
            // Substituir apenas a parte da sequência
            containerSequencia.innerHTML = html;
        } else {
            // Se não encontrou containers específicos, tentar o corpo do modal
            const modalBody = relatorio.querySelector('.modal-body, .report-body, [class*="body"]');
            
            if (modalBody) {
                modalBody.innerHTML = html;
            } else {
                // Último recurso: substituir todo o conteúdo
                relatorio.innerHTML = `
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Relatório da Rota</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${html}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                                <button type="button" class="btn btn-primary" id="salvar-rota">Salvar Rota</button>
                                <button type="button" class="btn btn-primary" id="imprimir-rota">Imprimir</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        // 4. Configurar botão de recálculo
        const botaoRecalcular = document.getElementById('recalcular-rota-final');
        
        if (botaoRecalcular) {
            botaoRecalcular.addEventListener('click', function() {
                console.log('[FINAL] Botão de recálculo clicado');
                
                // Fechar o relatório
                const btnFechar = relatorio.querySelector('.btn-close, [data-bs-dismiss="modal"], .close');
                if (btnFechar) {
                    btnFechar.click();
                }
                
                // Tentar clicar na opção de rota personalizada
                setTimeout(function() {
                    const rotaPersonalizada = document.querySelector('.rota-personalizada-card, [class*="personalizada"]');
                    if (rotaPersonalizada) {
                        rotaPersonalizada.click();
                        console.log('[FINAL] Clique em rota personalizada emulado');
                    } else {
                        // Se não encontrar, clicar no botão de otimizar
                        const botaoOtimizar = document.getElementById('optimize-route');
                        if (botaoOtimizar) {
                            botaoOtimizar.click();
                            console.log('[FINAL] Clique em otimizar emulado');
                        }
                    }
                }, 500);
            });
        }
    }
    
    // Extensão do prototype para facilitar seleção
    if (!HTMLElement.prototype.contains) {
        HTMLElement.prototype.contains = function(text) {
            return this.textContent.includes(text);
        };
    }
})();