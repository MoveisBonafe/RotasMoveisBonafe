#!/bin/bash

# Prepara o build para GitHub Pages

# Copiar o arquivo .env.github para .env
cp .env.github .env

# Instalar dependências
npm install

# Construir o projeto
MODE=github npm run build

# Criar pasta docs para GitHub Pages
mkdir -p docs
cp -r dist/public/* docs/

# Criar um arquivo 404.html para funcionar com rotas do SPA no GitHub Pages
cp docs/index.html docs/404.html

# Criar um arquivo .nojekyll para evitar processamento Jekyll
touch docs/.nojekyll

echo "Build para GitHub Pages concluído! Os arquivos estão na pasta 'docs/'"
echo "Agora você pode fazer commit e push desses arquivos para o seu repositório GitHub."
echo "Não se esqueça de configurar o GitHub Pages para servir da pasta 'docs/' nas configurações do repositório."