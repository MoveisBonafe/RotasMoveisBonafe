#!/bin/bash
# Script para implantar arquivos no GitHub Pages
# Este script copia os arquivos atualizados para o diretório docs

# Verificar se está no diretório correto
if [ ! -d "docs" ]; then
  echo "Erro: O diretório docs não foi encontrado."
  echo "Execute este script no diretório raiz do projeto."
  exit 1
fi

# Copiar os arquivos CSS e JavaScript
echo "Copiando arquivos CSS e JavaScript..."
cp styles-fix.css docs/
cp smooth-animation.js docs/
cp fullscreen-tabs.js docs/

# Atualizar o index.html
echo "Atualizando index.html..."
cp index.html docs/

echo "Implantação concluída com sucesso!"
echo "Os seguintes arquivos foram atualizados:"
echo "- styles-fix.css"
echo "- smooth-animation.js"
echo "- fullscreen-tabs.js"
echo "- index.html"

echo "Agora você pode fazer commit das alterações no GitHub:"
echo "git add docs"
echo "git commit -m \"Implementada animação suave nas abas inferiores\""
echo "git push origin main"