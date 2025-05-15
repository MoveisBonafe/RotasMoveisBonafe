#!/bin/bash

# Script para fazer commit e push das alterações no layout
# Execute este script para enviar as alterações para o GitHub

echo "Iniciando processo de deploy para correção de layout..."

# Criando um arquivo para timestamp para forçar o GitHub a reprocessar
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "// Última atualização: $TIMESTAMP" > docs/cache-buster-$TIMESTAMP.js
echo "<script src=\"cache-buster-$TIMESTAMP.js\"></script>" > docs/cache-fragment.html

# Adicionando referência ao cache-buster no index.html
sed -i "s|<script src=\"layout-fix.js\"></script>|<script src=\"layout-fix.js?v=$TIMESTAMP\"></script>|g" docs/index.html

# Adiciona os arquivos modificados
git add docs/index.html docs/layout-fix.js docs/cache-buster-$TIMESTAMP.js docs/cache-fragment.html

# Faz o commit com uma mensagem descritiva
git commit -m "Fix sidebar layout with automatic layout correction script (cache-busting: $TIMESTAMP)"

# Envia as alterações para o GitHub
git push

echo "✅ Alterações enviadas para o GitHub!"
echo "⏳ Aguarde alguns minutos para que o GitHub Pages seja atualizado."
echo "🔄 A correção de layout será aplicada automaticamente quando a página carregar."