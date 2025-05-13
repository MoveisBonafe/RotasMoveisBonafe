#!/bin/bash

# Script para testar a versão GitHub Pages localmente
# Isso permite verificar se as páginas estão funcionando corretamente
# antes de fazer o deploy para o GitHub Pages

echo "Iniciando servidor local para testar a versão GitHub Pages..."

# Verificar se Python está instalado
if command -v python3 &>/dev/null; then
    echo "Usando Python 3 para servir os arquivos..."
    cd docs && python3 -m http.server 8000
elif command -v python &>/dev/null; then
    echo "Usando Python para servir os arquivos..."
    cd docs && python -m SimpleHTTPServer 8000
else
    echo "ERRO: Python não encontrado. Instale Python para testar localmente."
    exit 1
fi

# Este comando nunca será alcançado enquanto o servidor estiver rodando
echo "Servidor encerrado."