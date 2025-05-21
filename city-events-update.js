/**
 * Script para atualizar datas de aniversários das cidades
 * Corrige a data de Ribeirão Preto (19/06) e utiliza a data de fundação para todas as cidades
 */

(function() {
    // Executar quando o documento estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCityEvents);
    } else {
        updateCityEvents();
    }
    
    // Função principal para atualizar eventos
    function updateCityEvents() {
        console.log('[CityEvents] Atualizando datas de aniversários...');
        
        // Verificar se a variável global existe
        if (typeof window.allCityEvents === 'undefined') {
            console.warn('[CityEvents] Base de eventos não encontrada');
            return;
        }
        
        // Dados corretos de cidades importantes
        const cityCorrections = [
            { city: "Ribeirão Preto", date: "19/06", year: "1856" },
            { city: "Piedade", date: "20/05" },
            { city: "Pitangui", date: "09/06" },
            { city: "São Paulo", date: "25/01", year: "1554" },
            { city: "Santos", date: "26/01", year: "1546" },
            { city: "Bauru", date: "01/08" },
            { city: "Barrinha", date: "30/12" },
            { city: "Batatais", date: "14/03" },
            { city: "Altinópolis", date: "09/03" },
            { city: "Franca", date: "28/11" },
            { city: "Campinas", date: "14/07" },
            { city: "Jaú", date: "15/08" },
            { city: "Belo Horizonte", date: "12/12" }
        ];
        
        // Ano atual para os aniversários
        const currentYear = new Date().getFullYear() + 1; // Próximo ano para exibição futura
        
        // Atualizar eventos existentes
        cityCorrections.forEach(correction => {
            // Encontrar eventos existentes para esta cidade
            const events = window.allCityEvents.filter(event => 
                event.city === correction.city && 
                event.event === "Aniversário da Cidade"
            );
            
            if (events.length > 0) {
                // Atualizar eventos existentes
                events.forEach(event => {
                    const [day, month] = correction.date.split('/');
                    event.startDate = `${day}/${month}/${currentYear}`;
                    event.endDate = `${day}/${month}/${currentYear}`;
                    
                    // Incluir o ano de fundação na descrição se disponível
                    if (correction.year) {
                        event.description = `Aniversário de fundação de ${correction.city} em ${correction.date}/${correction.year}`;
                    } else {
                        event.description = `Aniversário de fundação de ${correction.city} em ${correction.date}`;
                    }
                    
                    console.log(`[CityEvents] Atualizada data de ${correction.city} para ${correction.date}`);
                });
            } else {
                // Criar novo evento se não existir
                const [day, month] = correction.date.split('/');
                const newEvent = {
                    city: correction.city,
                    event: "Aniversário da Cidade",
                    eventType: "Feriado",
                    importance: correction.city === "São Paulo" || correction.city === "Belo Horizonte" ? "Alto" : 
                               ["Ribeirão Preto", "Santos", "Campinas", "Bauru"].includes(correction.city) ? "Médio" : "Baixo",
                    startDate: `${day}/${month}/${currentYear}`,
                    endDate: `${day}/${month}/${currentYear}`,
                    description: correction.year ? 
                        `Aniversário de fundação de ${correction.city} em ${correction.date}/${correction.year}` : 
                        `Aniversário de fundação de ${correction.city} em ${correction.date}`
                };
                
                window.allCityEvents.push(newEvent);
                console.log(`[CityEvents] Adicionado evento para ${correction.city} (${correction.date})`);
            }
        });
        
        console.log('[CityEvents] Atualização de datas concluída');
    }
})();