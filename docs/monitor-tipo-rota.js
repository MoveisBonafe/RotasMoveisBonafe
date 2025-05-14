/**
 * Monitor de TODOS os tipos de rota para atualizar o relatório
 * Esta solução garante que sempre teremos a sequência certa
 */
(function() {
    console.log('[MonitorRota] Iniciando monitoramento contínuo de todos os tipos de rota');
    
    // Variáveis de controle
    let ultimoTipoRotaSelecionado = ''; // Guarda o último tipo de rota clicado
    let intervalMonitoramento = null;   // Para armazenar o intervalo de monitoramento
    
    // Constantes
    const INTERVALO_CHECAGEM = 300; // ms
    const DOIS_CORREGOS = 'Dois Córregos';
    
    // Iniciar o monitoramento
    iniciarMonitoramento();
    
    /**
     * Iniciar o monitoramento contínuo
     */
    function iniciarMonitoramento() {
        if (intervalMonitoramento) {
            clearInterval(intervalMonitoramento);
        }
        
        // Configurar monitoramento constante de cards de rota
        intervalMonitoramento = setInterval(monitorarTiposRota, INTERVALO_CHECAGEM);
        
        // Também monitorar o relatório
        setInterval(verificarRelatorio, INTERVALO_CHECAGEM);
        
        console.log('[MonitorRota] Monitoramento iniciado');
    }
    
    /**
     * Monitorar tipos de rota disponíveis e detectar mudanças
     */
    function monitorarTiposRota() {
        // Encontrar container de rotas alternativas
        const container = document.querySelector('.alternative-routes-section') || 
                         document.querySelector('[class*="alternative-routes"]');
        
        if (!container) {
            return;
        }
        
        // Encontrar cards de rota
        const cards = container.querySelectorAll('.route-option-card');
        let rotaAtual = '';
        
        // Verificar qual está selecionado
        cards.forEach(card => {
            // Configurar monitoramento se ainda não foi feito
            if (!card.getAttribute('data-monitored')) {
                card.setAttribute('data-monitored', 'true');
                
                // Adicionar evento de clique para monitorar mudanças
                card.addEventListener('click', function() {
                    console.log('[MonitorRota] Card de rota clicado');
                    
                    // Obter identificação deste tipo de rota
                    const tipoRota = identificarTipoRota(card);
                    
                    // Se mudou o tipo, atualizar
                    if (tipoRota !== ultimoTipoRotaSelecionado) {
                        console.log('[MonitorRota] Tipo de rota alterado para:', tipoRota);
                        ultimoTipoRotaSelecionado = tipoRota;
                        
                        // Dar tempo para o sistema processar a rota e depois verificar o relatório
                        setTimeout(function() {
                            verificarRelatorio(true);
                        }, 1000);
                    }
                });
            }
            
            // Verificar se está selecionado
            if (card.classList.contains('selected')) {
                rotaAtual = identificarTipoRota(card);
            }
        });
        
        // Se o tipo mudou, atualizar referência
        if (rotaAtual && rotaAtual !== ultimoTipoRotaSelecionado) {
            console.log('[MonitorRota] Tipo de rota detectado como:', rotaAtual);
            ultimoTipoRotaSelecionado = rotaAtual;
            
            // Verificar relatório na próxima vez que for aberto
            verificarRelatorio(true);
        }
    }
    
    /**
     * Identificar o tipo de rota baseado no card
     */
    function identificarTipoRota(card) {
        // Verificar texto do card
        const texto = card.textContent.toLowerCase();
        
        if (texto.includes('personalizada')) {
            return 'personalizada';
        } else if (texto.includes('otimizada')) {
            return 'otimizada';
        } else if (texto.includes('proximidade')) {
            return 'proximidade';
        } else {
            // Tentar extrair algo único
            const matches = texto.match(/rota\s+(\w+)/i);
            return matches ? matches[1].toLowerCase() : 'desconhecida';
        }
    }
    
    /**
     * Verificar e atualizar o relatório quando necessário
     */
    function verificarRelatorio(forcarAtualizacao = false) {
        // Verificar se o relatório está aberto
        const relatorio = document.querySelector('#route-report-modal, .route-report, [id*="route-report"], .modal:not([style*="display: none"])');
        
        if (!relatorio || window.getComputedStyle(relatorio).display === 'none') {
            return;
        }
        
        // Verificar se precisamos atualizar (se mudou o tipo ou forçar)
        const ultimoTipoAtualizado = relatorio.getAttribute('data-tipo-rota-atualizado');
        
        if (!forcarAtualizacao && ultimoTipoAtualizado === ultimoTipoRotaSelecionado) {
            return;
        }
        
        console.log('[MonitorRota] Atualizando relatório para tipo de rota:', ultimoTipoRotaSelecionado);
        
        // Obter a sequência correta
        const sequencia = obterSequenciaCorreta();
        
        if (sequencia.length === 0) {
            console.log('[MonitorRota] Sem dados de sequência para atualizar relatório');
            return;
        }
        
        // Atualizar o relatório
        atualizarRelatorio(relatorio, sequencia);
        
        // Marcar como atualizado
        relatorio.setAttribute('data-tipo-rota-atualizado', ultimoTipoRotaSelecionado);
    }
    
    /**
     * Obter a sequência correta dos destinos com base no tipo de rota
     */
    function obterSequenciaCorreta() {
        const sequencia = [];
        
        // Iniciar sempre com Dois Córregos como origem
        sequencia.push({
            nome: DOIS_CORREGOS,
            info: '(Dois Córregos, SP, Brasil) (Origem)'
        });
        
        // Se for rota personalizada, pegar destinos na ordem do painel
        if (ultimoTipoRotaSelecionado === 'personalizada') {
            // Capturar destinos na ordem do painel
            const destinosPanel = capturarDestinosPainel();
            sequencia.push(...destinosPanel);
        } else {
            // Para outros tipos, tentar obter do mapa/rota calculada
            const destinosRota = obterDestinosRotaAtual();
            
            if (destinosRota.length > 0) {
                sequencia.push(...destinosRota);
            } else {
                // Fallback: usar destinos do painel
                const destinosPanel = capturarDestinosPainel();
                sequencia.push(...destinosPanel);
            }
        }
        
        return sequencia;
    }
    
    /**
     * Capturar destinos na ordem atual do painel
     */
    function capturarDestinosPainel() {
        const destinos = [];
        
        // Encontrar container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[MonitorRota] Container de destinos não encontrado');
            return destinos;
        }
        
        // Obter itens não-origem
        const items = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        // Processar cada item
        items.forEach(function(item, index) {
            let nome = '';
            const nomeElement = item.querySelector('.location-name');
            
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else {
                nome = item.textContent.trim().replace(/^\d+[\s\.\-]*/, '');
            }
            
            if (nome) {
                destinos.push({
                    nome: nome,
                    info: obterInfoAdicional(nome, index + 1)
                });
            }
        });
        
        return destinos;
    }
    
    /**
     * Obter informação adicional para um destino
     */
    function obterInfoAdicional(nome, sequencia) {
        // Tentar extrair o máximo de informação possível
        
        // Verificar por padrões comuns de cidades brasileiras
        const regexCidade = /([A-Za-zÀ-ÖØ-öø-ÿ\s]+)(?:,\s*([A-Z]{2}))?(?:,\s*Brasil)?/i;
        const matches = nome.match(regexCidade);
        
        if (matches) {
            const cidade = matches[1].trim();
            const estado = matches[2] || 'SP'; // Default para SP se não especificado
            
            return `(${cidade}, ${estado}, Brasil)`;
        }
        
        // Caso não encontre padrão, retornar só o nome
        return `(${nome})`;
    }
    
    /**
     * Tentar obter a sequência de destinos da rota atual no mapa
     */
    function obterDestinosRotaAtual() {
        const destinos = [];
        
        // Tentar obter do container de informações da rota
        const routeSequence = document.getElementById('route-sequence');
        
        if (routeSequence) {
            const items = routeSequence.querySelectorAll('.sequence-item');
            
            // Pular o primeiro item (origem)
            for (let i = 1; i < items.length; i++) {
                const item = items[i];
                const nomeElement = item.querySelector('.sequence-name');
                
                if (nomeElement) {
                    const nome = nomeElement.textContent.trim();
                    
                    destinos.push({
                        nome: nome,
                        info: obterInfoAdicional(nome, i)
                    });
                }
            }
        }
        
        return destinos;
    }
    
    /**
     * Atualizar o relatório com a sequência correta
     */
    function atualizarRelatorio(relatorio, sequencia) {
        console.log('[MonitorRota] Atualizando relatório com', sequencia.length, 'pontos');
        
        // Encontrar a seção de sequência
        const sequenciaContainer = relatorio.querySelector('.route-sequence, .sequencia-container, [class*="sequencia"]');
        
        if (!sequenciaContainer) {
            console.log('[MonitorRota] Container de sequência não encontrado no relatório');
            return;
        }
        
        // Criar HTML da sequência
        let html = '<h5>Sequência da Rota';
        
        // Adicionar informação sobre o tipo de rota
        if (ultimoTipoRotaSelecionado) {
            html += ` (${ultimoTipoRotaSelecionado === 'personalizada' ? 'Personalizada' : 'Otimizada'})`;
        }
        
        html += '</h5>';
        html += '<ol class="list-group list-group-numbered">';
        
        // Adicionar cada ponto na sequência
        sequencia.forEach(function(ponto) {
            html += `<li class="list-group-item">${ponto.nome} ${ponto.info}</li>`;
        });
        
        html += '</ol>';
        
        // Adicionar botão para recalcular (se for necessário)
        if (ultimoTipoRotaSelecionado !== 'personalizada') {
            html += `
                <div class="text-center mt-3">
                    <button class="btn btn-warning" id="recalcular-personalizada">
                        Recalcular com rota personalizada
                    </button>
                </div>
            `;
        }
        
        // Atualizar o conteúdo
        sequenciaContainer.innerHTML = html;
        
        // Configurar botão se existir
        const botao = document.getElementById('recalcular-personalizada');
        if (botao) {
            botao.addEventListener('click', function() {
                console.log('[MonitorRota] Botão de recálculo clicado');
                
                // Fechar o relatório
                const botaoFechar = relatorio.querySelector('.btn-close, .close, [data-bs-dismiss="modal"]');
                if (botaoFechar) {
                    botaoFechar.click();
                }
                
                // Procurar e clicar na opção de rota personalizada
                setTimeout(function() {
                    const cards = document.querySelectorAll('.route-option-card');
                    
                    cards.forEach(function(card) {
                        if (card.textContent.toLowerCase().includes('personalizada')) {
                            card.click();
                            console.log('[MonitorRota] Clique em rota personalizada emulado');
                        }
                    });
                }, 500);
            });
        }
    }
})();