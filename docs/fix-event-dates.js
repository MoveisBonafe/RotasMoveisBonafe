/**
 * Este script é executado no GitHub Pages para corrigir o problema
 * de datas de aniversário das cidades sendo exibidas com ano errado.
 * 
 * É importante que este script seja carregado depois dos dados, mas
 * antes de qualquer código que exiba esses dados na interface.
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
        
        // Corrigir cada evento de aniversário/fundação
        let contador = 0;
        window.mockData.cityEvents.forEach(evento => {
            // Verificar se é um evento de aniversário ou fundação
            if (evento.name.includes("Aniversário") || evento.name.includes("Fundação")) {
                // Guardar a data original
                const dataOriginal = new Date(evento.startDate);
                const anoOriginal = dataOriginal.getFullYear();
                const mesOriginal = dataOriginal.getMonth();
                const diaOriginal = dataOriginal.getDate();
                
                // Formatar a data original
                const diaStr = diaOriginal.toString().padStart(2, '0');
                const mesStr = (mesOriginal+1).toString().padStart(2, '0');
                const dataFormatada = `${diaStr}/${mesStr}/${anoOriginal}`;
                
                // Calcular idade correta
                const anoAtual = new Date().getFullYear();
                const idade = anoAtual - anoOriginal;
                
                // Adicionar propriedades especiais usadas na exibição
                evento.fundacaoOriginal = true;
                evento.fundacaoAno = anoOriginal;
                evento.fundacaoData = dataFormatada;
                evento.idadeCidade = idade;
                
                console.log(`Corrigido: ${evento.name} (${evento.cityName}) - Fundação: ${dataFormatada}, Idade: ${idade} anos`);
                contador++;
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
    
    // Esta função é chamada após exibição dos eventos para corrigir o HTML
    function corrigirExibicaoEventos() {
        // Selecionar todos os elementos de eventos na lista
        const eventItems = document.querySelectorAll('#events-list .event-item');
        
        eventItems.forEach(item => {
            // Procurar texto do evento para ver se é um aniversário
            const nomeEvento = item.querySelector('.event-name')?.textContent || '';
            const dataEvento = item.querySelector('.event-date')?.textContent || '';
            
            if (nomeEvento.includes('Aniversário') || nomeEvento.includes('Fundação')) {
                // Extrair nome da cidade do texto "Cidade | Data"
                const cidadeParts = dataEvento.split('|');
                const nomeCidade = cidadeParts[0]?.trim() || '';
                
                // Buscar evento original nos dados
                const evento = window.mockData.cityEvents.find(e => 
                    (e.name.includes('Aniversário') || e.name.includes('Fundação')) && 
                    e.cityName === nomeCidade
                );
                
                if (evento && evento.fundacaoData) {
                    // Corrigir a data exibida
                    const dataElemento = item.querySelector('.event-date');
                    if (dataElemento) {
                        dataElemento.innerHTML = `${nomeCidade} | <strong>${evento.fundacaoData}</strong>`;
                    }
                    
                    // Adicionar idade correta na descrição
                    const descElemento = item.querySelector('.event-description');
                    if (descElemento) {
                        let descricao = descElemento.textContent;
                        descricao += ` <span style="font-style:italic;color:#666">(${evento.idadeCidade} anos de fundação)</span>`;
                        descElemento.innerHTML = descricao;
                    }
                    
                    console.log(`Exibição corrigida: ${nomeCidade} - ${evento.fundacaoData} (${evento.idadeCidade} anos)`);
                }
            }
        });
    }
    
    // Iniciar processo de correção
    corrigirDatasAniversario();
    
    // Para garantir que a correção será aplicada quando a página for carregada
    window.addEventListener('load', corrigirDatasAniversario);
    
    // Verificação periódica para garantir que as correções foram aplicadas
    setTimeout(corrigirDatasAniversario, 2000);
})();