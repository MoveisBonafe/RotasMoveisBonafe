#!/bin/bash

# Script para fazer deploy dos arquivos para o GitHub Pages
# Deve ser executado na raiz do projeto

echo "Copiando arquivos atualizados para o GitHub..."

# Garantir que a pasta docs/deployaveis exista
mkdir -p docs/deployaveis

# Copiar os scripts de correção para a pasta deployaveis
cp docs/emergencia.js docs/deployaveis/
cp docs/solucao-final.js docs/deployaveis/
cp docs/fix-direto-final.js docs/deployaveis/

echo "Arquivos copiados com sucesso!"
echo "Para fazer o deploy no GitHub Pages:"
echo "1. Faça commit dos arquivos da pasta docs/deployaveis"
echo "2. Acesse o repositório no GitHub"
echo "3. Substitua os arquivos equivalentes na pasta docs"
echo "4. Após alguns minutos as alterações estarão visíveis no site"

echo "IMPORTANTE: Inclua emergencia.js no HTML e certifique-se de que ele é o último script a ser carregado"