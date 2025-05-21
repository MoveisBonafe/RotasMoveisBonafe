/**
 * Script para atualizar os eventos de aniversários das cidades no GitHub Pages
 * Este script extrai os dados de eventos das cidades do arquivo index.html e 
 * gera um arquivo JavaScript separado para ser incluído no GitHub Pages
 */

const fs = require('fs');
const path = require('path');

console.log('Iniciando extração de eventos de aniversários de cidades...');

// Ler o arquivo index.html para extrair os eventos
const indexHtmlPath = path.join(__dirname, 'docs', 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Usar regex para extrair a seção de eventos de cidades
const cityEventsRegex = /cityEvents:\s*\[([\s\S]*?)\],\s*\/\/\s*Restrições/;
const match = indexHtml.match(cityEventsRegex);

if (!match || !match[1]) {
  console.error('Não foi possível encontrar a seção de eventos de cidades no arquivo index.html');
  process.exit(1);
}

// Extrair o conteúdo dos eventos
const cityEventsContent = match[1].trim();

// Criar o arquivo JavaScript com os eventos
const outputPath = path.join(__dirname, 'docs', 'city-events.js');
const jsContent = `/**
 * Dados de aniversários de cidades para o Otimizador de Rotas
 * Gerado automaticamente em ${new Date().toLocaleString()}
 */

// Eventos de aniversários de cidades
const cityEvents = [
${cityEventsContent}
];

// Exportar para uso no GitHub Pages
if (typeof window !== 'undefined') {
  window.cityEvents = cityEvents;
}

console.log("Dados de aniversários de cidades carregados: " + cityEvents.length + " eventos");
`;

// Escrever o arquivo
fs.writeFileSync(outputPath, jsContent);
console.log(`Arquivo de eventos de cidades gerado em: ${outputPath}`);
console.log(`Total de eventos: ${cityEventsContent.split('},').length}`);

// Modificar o script de deploy para incluir este novo arquivo
console.log('Certifique-se de incluir city-events.js no seu deploy para GitHub Pages.');