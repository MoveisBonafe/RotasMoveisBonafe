#!/bin/bash

# Script para compilar e preparar o deploy para GitHub Pages com correções de layout

echo "Iniciando build para GitHub Pages com correções de layout..."

# Configurar variáveis de ambiente para build
export VITE_USE_MOCK_DATA=true
export VITE_GOOGLE_MAPS_API_KEY="AIzaSyCnallnTQ8gT2_F600vt-yAEv2BoH0mj7U"

# Criar pasta temporária para build
mkdir -p github_build
cd github_build

# Criar estrutura inicial para a página estática
mkdir -p assets css js

# Copiar arquivos existentes da pasta docs
cp -r ../docs/event-icons ./
cp -r ../docs/tsp.js ./js/
cp ../docs/404.html ./
cp ../docs/fix-github.js ./js/
cp ../docs/route-optimizer.js ./js/
cp ../docs/map-controls.js ./js/
cp ../docs/geocode-fix.js ./js/

# Copiar standalone.html atualizado com layout corrigido
cp ../docs/standalone.html ./
cp ../solucao_alternativa.html ./
cp ../solucao_sidebar.html ./
cp ../css_a_inserir.css ./css/

# Criar versão adicional com timestamp para evitar cache
TIMESTAMP=$(date +%s)
cp ../docs/standalone.html ./standalone-${TIMESTAMP}.html
echo "Criada versão sem cache: standalone-${TIMESTAMP}.html"

# Copiar index.html otimizado
cp ../docs/index.html ./

# Atualizar index.html para incluir os novos arquivos
sed -i "s#<a href=\"standalone.html\" class=\"btn\">Versão Standalone</a>#<a href=\"standalone.html\" class=\"btn\">Versão Standalone</a>\n<a href=\"standalone-${TIMESTAMP}.html\" class=\"btn\">Versão Atualizada</a>\n<a href=\"solucao_alternativa.html\" class=\"btn\">Demo Layout</a>#" index.html

# Adicionar meta tags para forçar recarregamento
sed -i 's/<head>/<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" \/>\n  <meta http-equiv="Pragma" content="no-cache" \/>\n  <meta http-equiv="Expires" content="0" \/>/' index.html
sed -i 's/<head>/<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" \/>\n  <meta http-equiv="Pragma" content="no-cache" \/>\n  <meta http-equiv="Expires" content="0" \/>/' standalone.html
sed -i 's/<head>/<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" \/>\n  <meta http-equiv="Pragma" content="no-cache" \/>\n  <meta http-equiv="Expires" content="0" \/>/' standalone-${TIMESTAMP}.html

# Verificar se precisamos corrigir caminhos
if [[ -f ../fix-github-paths.js ]]; then
  echo "Executando correção de caminhos..."
  node ../fix-github-paths.js
fi

# Mover tudo para a pasta docs
cd ..
echo "Fazendo backup da pasta docs atual..."
if [ -d "docs_backup" ]; then
  rm -rf docs_backup
fi
mv docs docs_backup
mv github_build docs

echo "Build concluído! Arquivos gerados na pasta docs/"
echo "A pasta docs anterior foi salva como docs_backup"
echo "Faça commit e push para o repositório GitHub."
echo "Certifique-se de configurar o GitHub Pages para usar a pasta /docs."