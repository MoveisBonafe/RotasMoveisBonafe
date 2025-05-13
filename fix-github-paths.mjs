/**
 * Script para corrigir os caminhos relativos dos arquivos para o GitHub Pages
 * Versão compatível com ES Modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Obter o diretório atual do módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, 'docs');

console.log('Corrigindo caminhos relativos para GitHub Pages...');
console.log(`Diretório de trabalho: ${docsDir}`);

// Verificar se a pasta docs existe
if (!fs.existsSync(docsDir)) {
  console.error(`Erro: pasta docs não encontrada em ${__dirname}`);
  process.exit(1);
}

// Processar os arquivos HTML principais
const htmlFiles = ['index.html', 'standalone.html', 'tabs-demo.html'];

htmlFiles.forEach(filename => {
  const filePath = path.join(docsDir, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`Processando ${filename}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Adicionar base tag se ainda não existir
    if (!content.includes('<base href=')) {
      content = content.replace(
        '<head>',
        '<head>\n  <base href="./">'
      );
    }
    
    // Substituir todas as referências possíveis a assets e recursos
    content = content.replace(/href="\/assets\//g, 'href="./assets/');
    content = content.replace(/src="\/assets\//g, 'src="./assets/');
    content = content.replace(/src="\/src\//g, 'src="./src/');
    content = content.replace(/href="\/src\//g, 'href="./src/');
    
    // Corrigir qualquer outra referência absoluta que comece com barra
    content = content.replace(/src="\//g, 'src="./');
    content = content.replace(/href="\//g, 'href="./');
    
    // Salvar apenas se houve mudanças
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✓ Caminhos corrigidos em ${filename}`);
    } else {
      console.log(`  ✓ Nenhuma mudança necessária em ${filename}`);
    }
  } else {
    console.log(`  ✗ Arquivo ${filename} não encontrado em ${docsDir}`);
  }
});

// Encontrar e processar todos os arquivos JS e CSS na pasta docs
try {
  // Mudar para o diretório docs para o comando find funcionar corretamente
  process.chdir(docsDir);
  console.log('Buscando arquivos JS e CSS em docs/...');
  
  // Usar find diretamente na pasta atual (agora estamos em docs/)
  const findCommand = 'find . -type f -name "*.js" -o -name "*.css"';
  const files = execSync(findCommand).toString().trim().split('\n');
  
  if (files && files.length > 0 && files[0] !== '') {
    console.log(`Encontrados ${files.length} arquivos JS/CSS para processar`);
    
    files.forEach(relativeFilePath => {
      if (!relativeFilePath) return;
      
      // O caminho já é relativo à pasta docs onde estamos agora
      try {
        let content = fs.readFileSync(relativeFilePath, 'utf8');
        const originalContent = content;
        
        // Corrigir referências a recursos
        content = content.replace(/\/assets\//g, './assets/');
        content = content.replace(/url\(\s*\/assets\//g, 'url(./assets/');
        content = content.replace(/"\/assets\//g, '"./assets/');
        
        // Corrigir imports relativos
        content = content.replace(/from\s+["']\/[^"']+['"]/g, (match) => {
          return match.replace(/["']\//, '"./');
        });
        
        // Salvar apenas se houve mudanças
        if (content !== originalContent) {
          fs.writeFileSync(relativeFilePath, content);
          console.log(`  ✓ Corrigido: ${relativeFilePath}`);
        }
      } catch (error) {
        console.error(`  ✗ Erro ao processar ${relativeFilePath}:`, error.message);
      }
    });
  } else {
    console.log('Nenhum arquivo JS/CSS encontrado');
  }
} catch (error) {
  console.error('Erro ao buscar arquivos JS/CSS:', error.message);
}

// Criar arquivo .nojekyll para desativar processamento Jekyll
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
console.log('Criado arquivo .nojekyll para desativar processamento Jekyll');

// Criar script para testar localmente
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

fs.writeFileSync(path.join(docsDir, 'test-locally.sh'), testLocallyContent);
fs.chmodSync(path.join(docsDir, 'test-locally.sh'), 0o755);
console.log('Criado script test-locally.sh para testes locais');

console.log('\nCorreção de caminhos para GitHub Pages concluída com sucesso!');
console.log('Para testar localmente, execute: cd docs && ./test-locally.sh');