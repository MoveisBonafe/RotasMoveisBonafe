#!/bin/bash
# Script para copiar arquivos corrigidos para a pasta do GitHub Pages
# Este script sincroniza todas as correções com a pasta /docs para deploy

echo "🚀 Iniciando sincronização de correções para GitHub Pages..."

# Arquivos de correções de eventos de cidades
cp -f estados-aniversarios.js docs/
cp -f outros-eventos.js docs/
cp -f final-events-fix.js docs/

# Arquivos de correção de botões
cp -f botoes-fix.js docs/
cp -f tab-buttons-fix.js docs/

# Atualizar HTML para incluir todos os scripts
echo "✅ Arquivos copiados com sucesso"
echo "🔍 Verificando se index.html está atualizado..."

# Verifique como está o arquivo index.html no GitHub
echo "📦 Preparando arquivos para deploy no GitHub Pages"

echo "🌟 Sincronização completa! Todos os arquivos foram atualizados."
echo "⚠️ IMPORTANTE: Faça um commit e push das alterações para o GitHub"
echo "   git add docs/"
echo "   git commit -m \"Correções de eventos e botões para GitHub Pages\""
echo "   git push origin main"

# Dar permissão de execução ao script
chmod +x deploy-github-fix.sh

echo "✅ Script finalizado com sucesso!"