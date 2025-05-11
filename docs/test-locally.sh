#!/bin/bash
echo "Iniciando servidor para testar a versão GitHub Pages localmente..."
echo "Acesse: http://localhost:8000"
echo "Pressione Ctrl+C para encerrar"

# Detectar comando conforme o sistema operacional
if command -v python3 &> /dev/null; then
    python3 -m http.server
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "Python não encontrado. Instale Python para testar localmente."
    exit 1
fi