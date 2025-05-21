/**
 * Script para atualizar os eventos de aniversários das cidades no GitHub Pages
 * Este script extrai os dados de eventos das cidades e 
 * gera um arquivo JavaScript separado para ser incluído no GitHub Pages
 */

const fs = require('fs');

// Lê o arquivo JSON com os dados das cidades
try {
  // Se o arquivo estiver no formato correto de JSON
  const rawData = fs.readFileSync('./city-data.json', 'utf8');
  const cityData = JSON.parse(rawData);
  processCityData(cityData);
} catch (error) {
  console.error('Erro ao ler/processar o arquivo JSON original:', error);
  console.log('Tentando processar arquivo no formato alternativo...');
  
  try {
    // Se o arquivo estiver no formato de texto com objetos JSON separados por vírgulas
    const rawText = fs.readFileSync('./attached_assets/Pasted--municipio-Pitangui-data-09-06-estado-MG--1747795024173.txt', 'utf8');
    const processedText = '[' + rawText.replace(/\}\s*,\s*\{/g, '},{') + ']';
    const cityData = JSON.parse(processedText);
    processCityData(cityData);
  } catch (err) {
    console.error('Erro ao processar arquivo no formato alternativo:', err);
    console.log('Usando dados pré-definidos para aniversários de cidades importantes...');
    
    // Lista predefinida das cidades mais importantes
    const predefinedData = [
      { municipio: "Piedade", data: "20/05", estado: "SP" },
      { municipio: "Barra do Chapéu", data: "19/05", estado: "SP" },
      { municipio: "Ribeirão Branco", data: "05/09", estado: "SP" },
      { municipio: "Itaporanga", data: "06/03", estado: "SP" },
      { municipio: "Batatais", data: "14/03", estado: "SP" },
      { municipio: "Dois Córregos", data: "04/02", estado: "SP" },
      { municipio: "São Paulo", data: "25/01", estado: "SP" },
      { municipio: "Campinas", data: "14/07", estado: "SP" },
      { municipio: "Ribeirão Preto", data: "19/06", estado: "SP" },
      { municipio: "Belo Horizonte", data: "12/12", estado: "MG" }
    ];
    
    processCityData(predefinedData);
  }
}

function processCityData(cityData) {
  // Array para armazenar os eventos de aniversário de cidade formatados
  const cityEvents = [];
  let id = 10001;
  
  // Converter cada item do array em um evento de aniversário
  cityData.forEach(city => {
    if (!city.municipio || !city.data) return;
    
    // Extrair dia e mês da data (formato DD/MM)
    const [day, month] = city.data.split('/');
    
    // Criar data para 2025 (ano usado nos eventos do mockData)
    const dateStr = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Criar objeto de evento
    const event = {
      id: id++,
      cityName: city.municipio,
      name: "Aniversário da Cidade",
      startDate: dateStr,
      endDate: dateStr,
      isHoliday: true,
      description: `Aniversário de fundação de ${city.municipio} em ${day}/${month}`,
      restrictionLevel: city.municipio === "São Paulo" || city.municipio === "Belo Horizonte" ? "high" : 
                       (city.municipio === "Campinas" || city.municipio === "Santos" || 
                        city.municipio === "Ribeirão Preto" || city.municipio === "Sorocaba") ? "medium" : "low"
    };
    
    cityEvents.push(event);
  });
  
  // Gerar o conteúdo do arquivo JavaScript
  const jsContent = `/**
 * Script com aniversários das cidades para o GitHub Pages
 * Esse arquivo será carregado diretamente na página do GitHub Pages
 * e seus dados serão mesclados com os eventos existentes
 * Gerado automaticamente em ${new Date().toISOString()}
 */

// Executar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("Carregando aniversários das cidades para o GitHub Pages...");
    
    // Função para adicionar aniversários das cidades
    function addCityBirthdays() {
        // Verificar se mockData existe
        if (!window.mockData) {
            console.error("mockData não encontrado! Criando objeto...");
            window.mockData = {
                cityEvents: []
            };
        }
        
        // Verificar se cityEvents existe
        if (!window.mockData.cityEvents) {
            console.log("cityEvents não encontrado! Criando array...");
            window.mockData.cityEvents = [];
        }
        
        // Aniversários de todas as cidades
        const cityBirthdays = ${JSON.stringify(cityEvents, null, 4)};
        
        // Adicionar os aniversários ao mockData.cityEvents
        window.mockData.cityEvents = window.mockData.cityEvents.concat(cityBirthdays);
        
        console.log("Aniversários de cidades adicionados com sucesso:", cityBirthdays.length);
        console.log("Total de eventos agora:", window.mockData.cityEvents.length);
    }
    
    // Tentar várias vezes, pode ser que a página ainda não tenha carregado completamente
    let attempts = 0;
    const maxAttempts = 5;
    
    function tryAddBirthdays() {
        attempts++;
        
        if (window.mockData) {
            addCityBirthdays();
        } else if (attempts < maxAttempts) {
            console.log(\`Tentativa \${attempts}/\${maxAttempts} - mockData ainda não disponível. Tentando novamente em 1s...\`);
            setTimeout(tryAddBirthdays, 1000);
        } else {
            console.error("Falha ao adicionar aniversários: mockData não disponível após várias tentativas");
        }
    }
    
    // Iniciar as tentativas
    tryAddBirthdays();
});`;
  
  // Escrever o arquivo JS
  fs.writeFileSync('./docs/city-birthdays.js', jsContent);
  
  console.log(`Arquivo city-birthdays.js gerado com sucesso! Total de eventos: ${cityEvents.length}`);
}