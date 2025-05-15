#!/bin/bash

# Script para fazer deploy no GitHub Pages com as últimas correções

echo "===== Iniciando processo de deploy para GitHub Pages ====="

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "ERRO: Você precisa estar na branch main para fazer deploy"
  exit 1
fi

# Criar diretório docs caso não exista
mkdir -p docs

# Verificar se existem mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
  echo "Preparando alterações para commit..."
  
  # Adicionar todos os arquivos alterados
  git add docs/* fix-standalone-to-index.sh deploy-github.sh
  
  # Fazer o commit
  git commit -m "Atualização para GitHub Pages: correção de layout e abas fullscreen"
  
  echo "Commit criado com sucesso!"
fi

# Enviar para o GitHub
echo "Enviando alterações para o GitHub..."
git push origin main

echo "===== Deploy concluído com sucesso! ====="
echo "As alterações estarão disponíveis no GitHub Pages em alguns minutos."
echo "URL: https://moveisbonafe.github.io/RotasMoveisBonafe/"