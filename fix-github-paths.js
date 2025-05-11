// Script para corrigir os caminhos no GitHub Pages
// Salve este arquivo na pasta docs e execute com node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Garantir que estamos na pasta docs
const currentDir = path.basename(process.cwd());
if (currentDir !== 'docs') {
  console.error('Este script deve ser executado na pasta docs.');
  console.error('Por favor, execute: cd docs && node ../fix-github-paths.js');
  process.exit(1);
}

console.log('Corrigindo caminhos relativos para GitHub Pages...');

// Encontrar todos os arquivos CSS e JS na pasta de assets
console.log('Procurando arquivos CSS e JS...');
const findAssetsCmd = 'find . -type f -name "*.css" -o -name "*.js"';
let assetsFiles = [];
try {
  assetsFiles = execSync(findAssetsCmd).toString().trim().split('\n');
  console.log(`Encontrados ${assetsFiles.length} arquivos para corrigir.`);
} catch (error) {
  console.error('Erro ao buscar arquivos:', error.message);
}

// Para cada arquivo CSS/JS, corrigir caminhos internos
assetsFiles.forEach(file => {
  if (!file) return;
  
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Substituir referências a paths absolutos para relativos
    const originalContent = content;
    content = content.replace(/\/assets\//g, './assets/');
    content = content.replace(/url\(\s*\/assets\//g, 'url(./assets/');
    content = content.replace(/"\/assets\//g, '"./assets/');
    content = content.replace(/from\s+["']\/[^"']+['"]/g, (match) => {
      return match.replace(/["']\//, '"./')
    });
    
    // Salvar apenas se houve mudanças
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Corrigido: ${file}`);
    }
  } catch (error) {
    console.error(`Erro ao processar ${file}:`, error.message);
  }
});

// Corrigir index.html e 404.html
['index.html', '404.html'].forEach(htmlFile => {
  try {
    if (!fs.existsSync(htmlFile)) {
      console.error(`Arquivo ${htmlFile} não encontrado.`);
      return;
    }
    
    let content = fs.readFileSync(htmlFile, 'utf8');
    const originalContent = content;
    
    // Adicionar base tag se ainda não existir
    if (!content.includes('<base href=')) {
      content = content.replace(
        '<head>',
        '<head>\n  <base href="./">'
      );
    }
    
    // Substituir todas as referências possíveis a assets
    content = content.replace(/href="\/assets\//g, 'href="./assets/');
    content = content.replace(/src="\/assets\//g, 'src="./assets/');
    content = content.replace(/src="\/src\//g, 'src="./src/');
    content = content.replace(/href="\/src\//g, 'href="./src/');
    
    // Corrigir qualquer outra referência absoluta que comece com barra
    content = content.replace(/src="\//g, 'src="./');
    content = content.replace(/href="\//g, 'href="./');
    
    // Salvar apenas se houve mudanças
    if (content !== originalContent) {
      fs.writeFileSync(htmlFile, content);
      console.log(`Corrigido: ${htmlFile}`);
    }
  } catch (error) {
    console.error(`Erro ao processar ${htmlFile}:`, error.message);
  }
});

// Criar script de verificação
const testLocallyContent = `#!/bin/bash
echo "Iniciando servidor para testar a versão GitHub Pages localmente..."
echo "Acesse: http://localhost:8000"
echo "Pressione Ctrl+C para encerrar"

# Detectar comando conforme o sistema operacional
if command -v python3 &> /dev/null; then
    python3 -m http.server
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "Python não encontrado. Instale Python para testar localmente."
    exit 1
fi`;

fs.writeFileSync('test-locally.sh', testLocallyContent);
fs.chmodSync('test-locally.sh', 0o755);
console.log('Criado: test-locally.sh');

// Criar arquivo .nojekyll
fs.writeFileSync('.nojekyll', '');
console.log('Criado: .nojekyll');

console.log('\nCorreções concluídas! Para testar localmente, execute:');
console.log('./test-locally.sh');