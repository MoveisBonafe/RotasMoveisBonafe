/**
 * Solução específica para o relatório de rota
 * Esta solução foca exclusivamente na funcionalidade do relatório
 */
(function() {
    console.log('[Relatorio] Inicializando solução para relatório...');
    
    // Constantes
    const DOIS_CORREGOS = { lat: -22.3731, lng: -48.3796, nome: 'Dois Córregos' };
    
    // Variáveis globais
    let destinosOriginais = [];
    let rotaPersonalizadaAtiva = false;
    let ultimaSequenciaHtml = '';
    
    // Inicialização
    document.addEventListener('DOMContentLoaded', inicializar);
    window.addEventListener('load', inicializar);
    setTimeout(inicializar, 1000);
    setTimeout(inicializar, 2000);
    
    /**
     * Função principal de inicialização
     */
    function inicializar() {
        console.log('[Relatorio] Inicializando...');
        
        // Adicionar estilos CSS
        adicionarEstilos();
        
        // Configurar monitoramento de relatório
        configurarMonitoramentoRelatorio();
        
        // Monitorar o botão que abre o relatório
        monitorarBotaoRelatorio();
        
        // Monitorar rotas alternativas
        monitorarRotasAlternativas();
    }
    
    /**
     * Adicionar estilos CSS
     */
    function adicionarEstilos() {
        if (document.getElementById('relatorio-styles')) {
            return;
        }
        
        console.log('[Relatorio] Adicionando estilos');
        
        const style = document.createElement('style');
        style.id = 'relatorio-styles';
        style.textContent = `
            /* Estilos para rota personalizada */
            .rota-personalizada-card {
                background-color: #fff8e1 !important;
                border: 2px solid #ffc107 !important;
            }
            
            .rota-personalizada-card.selected {
                background-color: #ffe082 !important;
                border: 2px solid #ffb300 !important;
            }
            
            /* Destaque para sequência personalizada */
            .sequencia-personalizada {
                background-color: #fff8e1 !important;
                border-left: 3px solid #ffc107 !important;
                padding: 5px 10px;
                margin-top: 5px;
            }
            
            /* Botão para gerar relatório personalizado */
            .btn-relatorio-personalizado {
                background-color: #ffc107 !important;
                color: #000 !important;
                font-weight: bold;
                margin-top: 10px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Configurar monitoramento do relatório
     */
    function configurarMonitoramentoRelatorio() {
        console.log('[Relatorio] Configurando monitoramento do relatório');
        
        // Verificar periodicamente por mudanças
        setInterval(() => {
            // Verificar se o relatório está aberto
            const relatorio = document.querySelector('#route-report-modal') || 
                             document.querySelector('.route-report') ||
                             document.querySelector('[id*="route-report"]');
            
            if (relatorio && 
                window.getComputedStyle(relatorio).display !== 'none' && 
                rotaPersonalizadaAtiva) {
                
                console.log('[Relatorio] Relatório detectado com rota personalizada ativa');
                atualizarRelatorioPersonalizado();
            }
        }, 500);
    }
    
    /**
     * Monitorar o botão que abre o relatório
     */
    function monitorarBotaoRelatorio() {
        console.log('[Relatorio] Monitorando botão do relatório');
        
        // Verificar periodicamente por novos botões
        setInterval(() => {
            const botoes = document.querySelectorAll('[data-bs-target="#route-report-modal"], #show-report, .show-report, [id*="report"], [class*="report-button"]');
            
            botoes.forEach(botao => {
                if (!botao.getAttribute('data-monitored')) {
                    botao.setAttribute('data-monitored', 'true');
                    
                    // Adicionar evento de clique
                    botao.addEventListener('click', function() {
                        console.log('[Relatorio] Botão de relatório clicado');
                        
                        // Se a rota personalizada está ativa, preparar relatório personalizado
                        if (rotaPersonalizadaAtiva) {
                            setTimeout(atualizarRelatorioPersonalizado, 300);
                        }
                    });
                    
                    console.log('[Relatorio] Botão de relatório configurado');
                }
            });
        }, 1000);
    }
    
    /**
     * Monitorar as opções de rotas alternativas
     */
    function monitorarRotasAlternativas() {
        console.log('[Relatorio] Monitorando rotas alternativas');
        
        // Verificar periodicamente por novas opções
        setInterval(() => {
            const container = document.querySelector('.alternative-routes-section') || 
                             document.querySelector('[class*="alternative-routes"]');
            
            if (container) {
                // Verificar por opções de rota personalizada
                const opcoes = container.querySelectorAll('.rota-personalizada-card');
                
                opcoes.forEach(opcao => {
                    if (!opcao.getAttribute('data-monitored')) {
                        opcao.setAttribute('data-monitored', 'true');
                        
                        // Adicionar evento de clique
                        opcao.addEventListener('click', function() {
                            console.log('[Relatorio] Opção de rota personalizada clicada');
                            
                            // Marcar que a rota personalizada está ativa
                            rotaPersonalizadaAtiva = true;
                            
                            // Capturar destinos originais
                            capturarDestinosOriginais();
                        });
                        
                        console.log('[Relatorio] Opção de rota personalizada configurada');
                    }
                });
                
                // Verificar outras opções para desativar a rota personalizada
                const outrasOpcoes = container.querySelectorAll('.route-option-card:not(.rota-personalizada-card)');
                
                outrasOpcoes.forEach(opcao => {
                    if (!opcao.getAttribute('data-monitored')) {
                        opcao.setAttribute('data-monitored', 'true');
                        
                        // Adicionar evento de clique
                        opcao.addEventListener('click', function() {
                            console.log('[Relatorio] Outra opção de rota clicada');
                            
                            // Desativar a rota personalizada
                            rotaPersonalizadaAtiva = false;
                        });
                    }
                });
            }
        }, 1000);
    }
    
    /**
     * Capturar destinos na ordem original
     */
    function capturarDestinosOriginais() {
        destinosOriginais = [];
        
        // Encontrar o container de destinos
        const container = document.getElementById('locations-list') || 
                         document.querySelector('.location-list') ||
                         document.querySelector('[class*="location-container"]');
        
        if (!container) {
            console.log('[Relatorio] Container de destinos não encontrado');
            return;
        }
        
        // Obter todos os itens - IMPORTANTE: Usando apenas os elementos que estão sendo exibidos
        const itens = container.querySelectorAll('li:not(.origin-point), .location-item:not(.origin-point), div[class*="location"]:not(.origin-point)');
        
        console.log('[Relatorio] Encontrados', itens.length, 'destinos');
        
        // Verificar a ordem dos itens
        itens.forEach((item, index) => {
            // Extrair texto
            let nome = '';
            const nomeElement = item.querySelector('.location-name');
            
            if (nomeElement) {
                nome = nomeElement.textContent.trim();
            } else {
                nome = item.textContent.trim().replace(/^\d+[\s\.\-]*/, '');
            }
            
            if (nome) {
                destinosOriginais.push({
                    id: `destino-${index}`,
                    nome: nome,
                    ordem: index + 1 // Origem é 0
                });
                
                console.log('[Relatorio] Destino original salvo:', nome);
            }
        });
        
        // Verificar se é uma ordem lógica e corrigir se necessário
        if (destinosOriginais.length >= 2) {
            // Verificar se os primeiros dois elementos correspondem à ordem do painel
            const primeirosLocaisPanel = [];
            const locaisText = document.querySelectorAll('.location-name');
            locaisText.forEach(local => {
                primeirosLocaisPanel.push(local.textContent.trim());
            });
            
            // Se os primeiros dois locais não coincidem com o painel, verificar se é preciso inverter
            if (primeirosLocaisPanel.length >= 2 && 
                primeirosLocaisPanel[0] !== destinosOriginais[0].nome) {
                console.log('[Relatorio] Ordem detectada não corresponde ao painel, corrigindo...');
                
                // Se temos locais diferentes no painel, vamos reconstruir a ordem
                const novaOrdem = [];
                
                // Adicionar os locais na ordem do painel
                for (let i = 0; i < primeirosLocaisPanel.length; i++) {
                    const localNome = primeirosLocaisPanel[i];
                    if (localNome) {
                        novaOrdem.push({
                            id: `destino-${i}`,
                            nome: localNome,
                            ordem: i + 1
                        });
                    }
                }
                
                // Substituir completamente
                if (novaOrdem.length > 0) {
                    destinosOriginais = novaOrdem;
                    console.log('[Relatorio] Ordem corrigida para corresponder ao painel');
                }
            }
        }
    }
    
    /**
     * Atualizar relatório com a rota personalizada
     */
    function atualizarRelatorioPersonalizado() {
        console.log('[Relatorio] Atualizando relatório com rota personalizada');
        
        // Verificar se temos destinos
        if (destinosOriginais.length === 0) {
            capturarDestinosOriginais();
            
            if (destinosOriginais.length === 0) {
                console.log('[Relatorio] Sem destinos para atualizar relatório');
                return;
            }
        }
        
        // Encontrar container de sequência
        const sequenciaContainer = document.querySelector('.route-sequence') || 
                                 document.querySelector('.sequencia-container') ||
                                 document.querySelector('[id*="route-sequence"]');
        
        if (!sequenciaContainer) {
            console.log('[Relatorio] Container de sequência não encontrado');
            return;
        }
        
        // Criar HTML da sequência
        let html = '<h5>Sequência da Rota (Personalizada)</h5>';
        html += '<ol class="list-group list-group-numbered sequencia-personalizada">';
        
        // Adicionar origem (Dois Córregos)
        html += '<li class="list-group-item">Dois Córregos (Dois Córregos, SP, Brasil) (Origem)</li>';
        
        // Adicionar destinos na ordem atual
        destinosOriginais.forEach(destino => {
            html += `<li class="list-group-item">${destino.nome}</li>`;
        });
        
        html += '</ol>';
        
        // Adicionar botão para recalcular
        html += `
            <div class="text-center mt-3">
                <button class="btn btn-relatorio-personalizado">
                    Recalcular com ordem personalizada
                </button>
            </div>
        `;
        
        // Salvar HTML para verificar se houve mudança
        if (ultimaSequenciaHtml === html) {
            console.log('[Relatorio] Conteúdo da sequência já está atualizado');
            return;
        }
        
        ultimaSequenciaHtml = html;
        
        // Atualizar conteúdo
        sequenciaContainer.innerHTML = html;
        
        // Configurar botão
        const botao = sequenciaContainer.querySelector('.btn-relatorio-personalizado');
        if (botao) {
            botao.addEventListener('click', function() {
                console.log('[Relatorio] Botão de recálculo clicado');
                calcularRotaPersonalizada();
            });
        }
        
        console.log('[Relatorio] Relatório atualizado com sucesso');
    }
    
    /**
     * Recalcular rota com a ordem personalizada
     */
    function calcularRotaPersonalizada() {
        // Emular clique na opção de rota personalizada
        const opcao = document.querySelector('.rota-personalizada-card');
        
        if (opcao) {
            console.log('[Relatorio] Emulando clique na opção de rota personalizada');
            opcao.click();
        } else {
            console.log('[Relatorio] Opção de rota personalizada não encontrada');
            alert('Não foi possível encontrar a opção de rota personalizada. Por favor, tente novamente.');
        }
    }
})();