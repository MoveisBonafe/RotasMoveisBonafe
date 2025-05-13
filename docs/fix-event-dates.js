/**
 * CORREÇÃO CRÍTICA - GITHUB PAGES
 * 
 * Este script é executado no GitHub Pages para corrigir o problema
 * de datas de aniversário das cidades sendo exibidas com ano errado.
 * 
 * Problema: na versão do GitHub Pages, as datas de aniversário estão sendo 
 * exibidas como "DD/MM/2025" em vez da data histórica real de fundação.
 * 
 * Este script:
 * 1. Localiza todos os eventos de aniversário/fundação
 * 2. Extrai a data CORRETA de fundação do objeto original
 * 3. Calcula a idade CORRETA da cidade (anos desde a fundação)
 * 4. Sobrescreve a exibição na interface com os dados corretos
 */

// Executar imediatamente após carregamento
(function() {
    console.log("### CORREÇÃO DE DATAS DE ANIVERSÁRIO - GITHUB PAGES ESPECIAL ###");
    
    // A função será executada quando os dados estiverem disponíveis
    function corrigirDatasAniversario() {
        // Verificar se os dados de eventos existem
        if (!window.mockData || !window.mockData.cityEvents) {
            console.log("Dados de eventos não disponíveis. Tentando novamente em 500ms...");
            setTimeout(corrigirDatasAniversario, 500);
            return;
        }
        
        console.log("Iniciando correção de datas de fundação...");
        
        // Obter os dados históricos do arquivo externo
        const dadosHistoricos = window.dadosFundacao ? window.dadosFundacao.DATAS_FUNDACAO : null;
        
        // Se não conseguirmos carregar os dados históricos, exibir um erro
        if (!dadosHistoricos) {
            console.error("Não foi possível carregar os dados históricos de fundação das cidades!");
        } else {
            console.log("Dados históricos carregados:", Object.keys(dadosHistoricos).length, "cidades");
        }
    
        // Corrigir cada evento de aniversário/fundação
        let contador = 0;
        window.mockData.cityEvents.forEach(evento => {
            // Verificar se é um evento de aniversário ou fundação
            if (evento.name.includes("Aniversário") || evento.name.includes("Fundação")) {
                // Procurar dados históricos para esta cidade específica
                const dadosCidade = dadosHistoricos && dadosHistoricos[evento.cityName];
                
                if (dadosCidade) {
                    // SUBSTITUIÇÃO COMPLETA - usar os dados históricos conhecidos
                    console.log(`Usando dados históricos para ${evento.cityName}: ${dadosCidade.data}`);
                    
                    // Atualizar o objeto de evento com os dados corretos
                    evento.startDate = new Date(dadosCidade.ano, dadosCidade.mes-1, dadosCidade.dia);
                    evento.endDate = new Date(dadosCidade.ano, dadosCidade.mes-1, dadosCidade.dia);
                    evento.fundacaoData = dadosCidade.data;
                    evento.fundacaoAno = dadosCidade.ano;
                    evento.idadeCidade = new Date().getFullYear() - dadosCidade.ano;
                    evento.dataHistorica = true; // Marcar como dado histórico verificado
                    
                    console.log(`${evento.cityName} corrigida: ${dadosCidade.data} (${evento.idadeCidade} anos)`);
                } else {
                    // Caso a cidade não esteja no catálogo, usar os dados do evento
                    const dataOriginal = new Date(evento.startDate);
                    const anoOriginal = dataOriginal.getFullYear();
                    const mesOriginal = dataOriginal.getMonth();
                    const diaOriginal = dataOriginal.getDate();
                    
                    // Formatar a data original no formato brasileiro DD/MM/AAAA
                    const diaStr = diaOriginal.toString().padStart(2, '0');
                    const mesStr = (mesOriginal+1).toString().padStart(2, '0');
                    const dataFormatada = `${diaStr}/${mesStr}/${anoOriginal}`;
                    
                    // Calcular idade sem dados históricos
                    const anoAtual = new Date().getFullYear();
                    const idade = anoAtual - anoOriginal;
                    
                    // Adicionar informação ao evento
                    evento.fundacaoData = dataFormatada;
                    evento.idadeCidade = idade;
                    
                    console.log(`Sem dados históricos para ${evento.cityName}, usando: ${dataFormatada}`);
                }
                
                contador++;
                
                // Agora atualizar a interface direta para cada evento
                setTimeout(() => {
                    atualizarInterfaceEvento(evento.cityName, evento.fundacaoData, evento.idadeCidade);
                }, 1000);
            }
        });
        
        // Hook para substituir a exibição de eventos por versão corrigida
        const exibirEventosOriginal = window.showEventsForCitiesOnRoute;
        
        if (exibirEventosOriginal) {
            window.showEventsForCitiesOnRoute = function(pathIds, startDateStr, endDateStr) {
                // Executar função original para filtrar os eventos
                exibirEventosOriginal(pathIds, startDateStr, endDateStr);
                
                // Mas logo depois verificar se há algum evento de fundação na lista e corrigir sua exibição
                setTimeout(() => {
                    corrigirExibicaoEventos();
                }, 100);
            };
        }
        
        console.log(`Correção concluída: ${contador} eventos de aniversário/fundação foram corrigidos.`);
    }
    
    /**
     * Esta função atualiza a exibição de um evento de aniversário específico
     * @param {string} nomeCidade - Nome da cidade (ex: "Ribeirão Preto")
     * @param {string} dataFundacao - Data de fundação formatada (ex: "19/06/1856")
     * @param {number} idade - Idade da cidade em anos
     */
    function atualizarInterfaceEvento(nomeCidade, dataFundacao, idade) {
        console.log(`TENTANDO ATUALIZAR INTERFACE PARA: ${nomeCidade} - ${dataFundacao} (${idade} anos)`);

        try {
            // Selecionar todos os elementos de eventos na lista
            const eventItems = document.querySelectorAll('#events-list .event-item');
            
            // Se não encontramos, tentar novamente mais tarde
            if (!eventItems || eventItems.length === 0) {
                console.log("Elementos de evento não encontrados. Tentando novamente em 1s...");
                setTimeout(() => {
                    atualizarInterfaceEvento(nomeCidade, dataFundacao, idade);
                }, 1000);
                return;
            }
            
            let encontrado = false;
            
            // Procurar nos eventos da interface
            eventItems.forEach(item => {
                // Obter o texto completo
                const fullText = item.textContent || '';
                
                // Se contém o nome da cidade e é um evento de aniversário
                if (fullText.includes(nomeCidade) && 
                    (fullText.includes('Aniversário') || fullText.includes('Fundação'))) {
                    
                    encontrado = true;
                    console.log(`SUCESSO: Encontrado elemento para ${nomeCidade}`);
                    
                    // 1. Corrigir a data
                    const dataElemento = item.querySelector('.event-date');
                    if (dataElemento) {
                        // Forçar a substituição completa do elemento
                        dataElemento.innerHTML = `${nomeCidade} | <strong style="color:#d9534f">${dataFundacao}</strong>`;
                    }
                    
                    // 2. Corrigir a descrição/idade
                    const descElemento = item.querySelector('.event-description');
                    if (descElemento) {
                        // Preservar a descrição original até "anos de fundação" se existir
                        let descricao = descElemento.textContent || '';
                        const idadeIndex = descricao.indexOf('anos de fundação');
                        
                        if (idadeIndex > 0) {
                            // Manter só a parte antes da idade
                            descricao = descricao.substring(0, idadeIndex).trim();
                        }
                        
                        // Adicionar a idade correta com destaque
                        descElemento.innerHTML = `${descricao} <span style="font-style:italic;color:#666;font-weight:bold">(${idade} anos de fundação)</span>`;
                    }
                }
            });
            
            if (!encontrado) {
                console.log(`FALHA: Não encontrado elemento para ${nomeCidade}`);
            }
        } catch (error) {
            console.error("Erro ao atualizar interface:", error);
        }
    }
    
    // Função principal para corrigir a exibição de todos eventos
    function corrigirExibicaoEventos() {
        // Verifica se os dados históricos estão disponíveis
        const dadosHistoricos = window.dadosFundacao?.DATAS_FUNDACAO;
        if (!dadosHistoricos) {
            console.error("Dados históricos não disponíveis para correção!");
            return;
        }
        
        // Para cada cidade nos dados históricos, tentar atualizar a interface
        Object.keys(dadosHistoricos).forEach(cidade => {
            const dados = dadosHistoricos[cidade];
            const idade = new Date().getFullYear() - dados.ano;
            
            // CORREÇÃO URGENTE - direto na interface
            atualizarInterfaceEvento(cidade, dados.data, idade);
        });
    }
    
    // Iniciar processo de correção
    corrigirDatasAniversario();
    
    // Para garantir que a correção será aplicada quando a página for carregada
    window.addEventListener('load', corrigirDatasAniversario);
    
    // Verificação periódica para garantir que as correções foram aplicadas
    setTimeout(corrigirDatasAniversario, 2000);
})();