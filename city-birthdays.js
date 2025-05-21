/**
 * Dados atualizados de aniversários de cidades
 * Este arquivo contém as datas corretas de fundação das cidades
 * para exibição nos eventos da rota
 */

// Base de dados de aniversários de cidades
const cityBirthdayDatabase = [
    // ===== SÃO PAULO =====
    // Janeiro
    { city: "Uru", date: "01/01" },
    { city: "Morro Agudo", date: "06/01" },
    { city: "Dirce Reis", date: "06/01" },
    { city: "Teodoro Sampaio", date: "07/01" },
    { city: "Iaras", date: "09/01" },
    { city: "Motuca", date: "09/01" },
    { city: "Borebi", date: "09/01" },
    { city: "Embaúba", date: "09/01" },
    { city: "Iporanga", date: "12/01" },
    { city: "Miguelópolis", date: "14/01" },
    { city: "Quatá", date: "16/01" },
    { city: "Praia Grande", date: "19/01" },
    { city: "Braúna", date: "20/01" },
    { city: "Cardoso", date: "20/01" },
    { city: "Itaju", date: "20/01" },
    { city: "Parisi", date: "20/01" },
    { city: "Piraju", date: "20/01" },
    { city: "Sabino", date: "20/01" },
    { city: "Santa Cruz do Rio Pardo", date: "20/01" },
    { city: "São Vicente", date: "22/01" },
    { city: "São Paulo", date: "25/01", year: "1554" },
    { city: "Buri", date: "25/01" },
    { city: "Estrela D'Oeste", date: "25/01" },
    { city: "Vera Cruz", date: "25/01" },
    { city: "Santos", date: "26/01", year: "1546" },
    { city: "Santo Antônio do Pinhal", date: "26/01" },
    { city: "Barbosa", date: "30/01" },
    
    // Fevereiro
    { city: "Itu", date: "02/02" },
    { city: "Dois Córregos", date: "04/02" },
    { city: "Cajamar", date: "18/02" },
    { city: "Cândido Rodrigues", date: "18/02" },
    { city: "Cássia dos Coqueiros", date: "18/02" },
    { city: "Colômbia", date: "18/02" },
    { city: "Embu", date: "18/02" },
    { city: "Itapevi", date: "18/02" },
    { city: "Luís Antônio", date: "18/02" },
    { city: "Luiziânia", date: "18/02" },
    { city: "Pardinho", date: "18/02" },
    { city: "Peruíbe", date: "18/02" },
    { city: "Salmorão", date: "18/02" },
    { city: "Sarutaiá", date: "18/02" },
    { city: "Taguaí", date: "18/02" },
    { city: "Bady Bassitt", date: "18/02" },
    { city: "Osasco", date: "19/02" },
    { city: "Severínia", date: "19/02" },
    { city: "Taboão da Serra", date: "19/02" },
    { city: "Tapiraí", date: "19/02" },
    { city: "São Pedro", date: "20/02" },
    { city: "Mira Estrela", date: "21/02" },
    { city: "Restinga", date: "22/02" },
    { city: "Salesópolis", date: "22/02" },
    { city: "Sebastianópolis do Sul", date: "22/02" },
    { city: "Silveiras", date: "22/02" },
    { city: "Paulínia", date: "28/02" },
    
    // Março
    { city: "Olímpia", date: "02/03" },
    { city: "Queluz", date: "04/03" },
    { city: "Ilha Comprida", date: "05/03" },
    { city: "Lourdes", date: "05/03" },
    { city: "Itaporanga", date: "06/03" },
    { city: "Pirangi", date: "07/03" },
    { city: "Tietê", date: "08/03" },
    { city: "Altinópolis", date: "09/03" },
    { city: "São José do Barreiro", date: "09/03" },
    { city: "Campos Novos Paulista", date: "10/03" },
    { city: "Eldorado", date: "10/03" },
    { city: "Monte Aprazível", date: "10/03" },
    { city: "Patrocínio Paulista", date: "10/03" },
    { city: "Angatuba", date: "11/03" },
    { city: "Itapirapuã Paulista", date: "12/03" },
    { city: "Nova Campinas", date: "12/03" },
    { city: "Sarapuí", date: "13/03" },
    { city: "Batatais", date: "14/03" },
    { city: "Guareí", date: "16/03" },
    { city: "São Sebastião", date: "16/03" },
    { city: "Indiana", date: "17/03" },
    { city: "Jaborandi", date: "18/03" },
    { city: "Arandu", date: "19/03" },
    { city: "Aspásia", date: "19/03" },
    { city: "Barra Bonita", date: "19/03" },
    { city: "Caiuá", date: "19/03" },
    { city: "Corumbataí", date: "19/03" },
    { city: "Cravinhos", date: "19/03" },
    { city: "Flora Rica", date: "19/03" },
    { city: "João Ramalho", date: "19/03" },
    { city: "Meridiano", date: "19/03" },
    { city: "Panorama", date: "19/03" },
    { city: "Ribeirão Pires", date: "19/03" },
    { city: "São José do Rio Pardo", date: "19/03" },
    { city: "São José do Rio Preto", date: "19/03" },
    { city: "Taiaçu", date: "19/03" },
    { city: "Piquerobi", date: "20/03" },
    
    // Abril
    { city: "Mococa", date: "05/04" },
    { city: "Amparo", date: "08/04" },
    { city: "Santo André", date: "08/04" },
    
    // Maio
    { city: "Piedade", date: "20/05" },
    
    // Junho
    { city: "Pitangui", date: "09/06" },
    { city: "Ribeirão Preto", date: "19/06", year: "1856" },
    
    // Julho
    { city: "Campinas", date: "14/07" },
    
    // Agosto
    { city: "Bauru", date: "01/08" },
    { city: "Piracicaba", date: "01/08" },
    { city: "Jaú", date: "15/08" },
    
    // Setembro
    { city: "Mogi das Cruzes", date: "01/09" },
    
    // Outubro
    { city: "Cruzeiro", date: "02/10" },
    
    // Novembro
    { city: "Franca", date: "28/11" },
    
    // Dezembro
    { city: "Barrinha", date: "30/12" },
    
    // ===== MINAS GERAIS =====
    { city: "Belo Horizonte", date: "12/12" },
    { city: "Divinópolis", date: "01/06" }, // Nota: A data era 10/01 mas foi corrigida para 01/06
    { city: "Juiz de Fora", date: "31/05" }
];

/**
 * Atualiza os eventos de aniversário de cidades no sistema
 * Assegura que todas as cidades usem a data de fundação como referência
 */
function updateCityBirthdays() {
    console.log('[CityBirthdays] Iniciando atualização de aniversários das cidades...');
    
    // Verificar se a variável global de eventos existe
    if (typeof window.allCityEvents === 'undefined') {
        console.warn('[CityBirthdays] Variável global de eventos não encontrada');
        return;
    }
    
    // Remover eventos antigos de aniversário para evitar duplicação
    window.allCityEvents = window.allCityEvents.filter(event => 
        !(event.event === "Aniversário da Cidade" && event.eventType === "Feriado")
    );
    
    console.log('[CityBirthdays] Eventos antigos de aniversário removidos');
    
    // Ano atual para os aniversários
    const currentYear = new Date().getFullYear() + 1; // Próximo ano para exibição futura
    
    // Adicionar eventos atualizados
    cityBirthdayDatabase.forEach(cityData => {
        const [day, month] = cityData.date.split('/');
        const year = cityData.year || '';
        const foundationInfo = year ? ` em ${cityData.date}/${year}` : ` em ${cityData.date}`;
        
        const newEvent = {
            city: cityData.city,
            event: "Aniversário da Cidade",
            eventType: "Feriado",
            importance: cityData.importance || "Baixo",
            startDate: `${day}/${month}/${currentYear}`,
            endDate: `${day}/${month}/${currentYear}`,
            description: `Aniversário de fundação de ${cityData.city}${foundationInfo}`
        };
        
        // Ajustar importância com base no tamanho da cidade
        if (["São Paulo", "Belo Horizonte"].includes(cityData.city)) {
            newEvent.importance = "Alto";
        } else if (["Campinas", "Ribeirão Preto", "Bauru", "Santos", "São José dos Campos", "Osasco"].includes(cityData.city)) {
            newEvent.importance = "Médio";
        }
        
        // Adicionar à base global
        window.allCityEvents.push(newEvent);
    });
    
    console.log(`[CityBirthdays] ${cityBirthdayDatabase.length} eventos de aniversário de cidades atualizados`);
}

// Executar quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Esperar um pouco para que outros scripts carreguem primeiro
    setTimeout(updateCityBirthdays, 1000);
});

// Verificar se o documento já foi carregado
if (document.readyState !== 'loading') {
    setTimeout(updateCityBirthdays, 1000);
}