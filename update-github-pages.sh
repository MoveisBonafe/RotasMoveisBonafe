#!/bin/bash

# Script simplificado para atualizar a versão do GitHub Pages
echo "Atualizando versão do GitHub Pages..."

# Garantir que temos a pasta estática_github_version
mkdir -p static_github_version
mkdir -p static_github_version/js

# Copiar versão standalone para a pasta do GitHub Pages
echo "Copiando arquivos atualizados..."
cp docs/index.html static_github_version/index.html
cp docs/standalone.html static_github_version/standalone.html

# Adicionar uma meta tag para forçar recarregamento
sed -i 's/<head>/<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" \/>\n  <meta http-equiv="Pragma" content="no-cache" \/>\n  <meta http-equiv="Expires" content="0" \/>/' static_github_version/index.html
sed -i 's/<head>/<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" \/>\n  <meta http-equiv="Pragma" content="no-cache" \/>\n  <meta http-equiv="Expires" content="0" \/>/' static_github_version/standalone.html

echo "Atualizando versão do GitHub Pages completada!"
echo "Para publicar, copie os arquivos da pasta static_github_version para seu repositório GitHub."