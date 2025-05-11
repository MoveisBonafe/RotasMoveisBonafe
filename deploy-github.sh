#!/bin/bash

# Prepara o build para GitHub Pages

# Copiar o arquivo .env.github para .env
cp .env.github .env

# Instalar dependências
npm install

# Adicionar base path para GitHub Pages no arquivo index.html
# Modificar temporariamente o vite.config.ts sem tocá-lo diretamente
mkdir -p tmp
cat > tmp/prebuild.js << 'EOF'
const fs = require('fs');
const path = require('path');
const clientIndexPath = path.resolve('./client/index.html');

// Ler o arquivo index.html existente
let indexContent = fs.readFileSync(clientIndexPath, 'utf8');

// Adicionar a base tag se ainda não existir
if (!indexContent.includes('<base href="./')) {
  // Inserir a base tag logo após a tag head
  indexContent = indexContent.replace(
    '<head>',
    '<head>\n    <base href="./">'
  );
  
  // Escrever de volta o arquivo
  fs.writeFileSync(clientIndexPath, indexContent);
  console.log('Base href adicionada ao index.html');
}
EOF

# Executar o script de pré-build
node tmp/prebuild.js

# Construir o projeto com configuração específica para GitHub Pages
MODE=github npm run build

# Criar pasta docs para GitHub Pages
mkdir -p docs
cp -r dist/* docs/

# Criar um arquivo 404.html para funcionar com rotas do SPA no GitHub Pages
cp docs/index.html docs/404.html

# Criar um arquivo .nojekyll para evitar processamento Jekyll
touch docs/.nojekyll

echo "Build para GitHub Pages concluído! Os arquivos estão na pasta 'docs/'"
echo "Agora você pode fazer commit e push desses arquivos para o seu repositório GitHub."
echo "Não se esqueça de configurar o GitHub Pages para servir da pasta 'docs/' nas configurações do repositório."