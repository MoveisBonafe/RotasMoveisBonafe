#!/bin/bash

# Script para compilar e preparar o deploy para GitHub Pages

echo "Iniciando build para GitHub Pages..."

# Configurar variáveis de ambiente para build
export VITE_USE_MOCK_DATA=true
export VITE_GOOGLE_MAPS_API_KEY="AIzaSyCnallnTQ8gT2_F600vt-yAEv2BoH0mj7U"

# Criar pasta temporária para build
mkdir -p github_build
cd github_build

# Criar estrutura inicial para a página estática
mkdir -p assets css js

# Gerar arquivo de eventos de cidades
node ../update-city-events.js

# Copiar arquivos existentes da pasta docs
cp -r ../docs/event-icons ./
cp -r ../docs/tsp.js ./
cp ../docs/404.html ./
cp ../docs/fix-github.js ./
cp ../docs/route-optimizer.js ./
cp ../docs/map-controls.js ./
cp ../docs/geocode-fix.js ./
cp ../docs/city-events-data.js ./
cp ../docs/city-birthdays.js ./

# Copiar index.html otimizado
cp ../docs/index.html ./

# Adicionar uma meta tag para forçar recarregamento
sed -i 's/<head>/<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" \/>\n  <meta http-equiv="Pragma" content="no-cache" \/>\n  <meta http-equiv="Expires" content="0" \/>/' index.html

# Verificar se o script de aniversários das cidades foi copiado corretamente
if [ ! -f ./city-birthdays.js ]; then
  echo "ALERTA: city-birthdays.js não foi copiado! Copiando novamente..."
  cp ../docs/city-birthdays.js ./
fi

echo "Verificando arquivos de eventos..."
ls -la | grep -i birth

# Verificar se precisamos corrigir caminhos
if [[ -f ../fix-github-paths.js ]]; then
  echo "Executando correção de caminhos..."
  node ../fix-github-paths.js
fi

# Mover tudo para a pasta docs
cd ..
rm -rf docs
mv github_build docs

echo "Build concluído! Arquivos gerados na pasta docs/"
echo "Faça commit e push para o repositório GitHub."
echo "Certifique-se de configurar o GitHub Pages para usar a pasta /docs."