#!/bin/bash

# Prepara o build para GitHub Pages

# Copiar o arquivo .env.github para .env
cp .env.github .env

# Instalar dependências
npm install

# Adicionar base path para GitHub Pages no arquivo index.html
# Modificar temporariamente o vite.config.ts sem tocá-lo diretamente
mkdir -p tmp
cat > tmp/prebuild.cjs << 'EOF'
const fs = require('fs');
const path = require('path');
const clientIndexPath = path.resolve('./client/index.html');

// Ler o arquivo index.html existente
let indexContent = fs.readFileSync(clientIndexPath, 'utf8');

// Adicionar a base tag se ainda não existir
if (!indexContent.includes('<base href="./')) {
  // Inserir a base tag logo após a tag head
  indexContent = indexContent.replace(
    '<head>',
    '<head>\n    <base href="./">'
  );
  
  // Escrever de volta o arquivo
  fs.writeFileSync(clientIndexPath, indexContent);
  console.log('Base href adicionada ao index.html');
}
EOF

# Executar o script de pré-build
node tmp/prebuild.cjs

# Construir o projeto com configuração específica para GitHub Pages
MODE=github npm run build

# Criar pasta docs para GitHub Pages
mkdir -p docs
cp -r dist/* docs/

# Corrigir caminhos relativos nos arquivos HTML e CSS
echo "Corrigindo caminhos relativos para GitHub Pages..."

# Encontrar todos os arquivos CSS e JS na pasta de assets
ASSETS_FILES=$(find docs/assets -type f -name "*.css" -o -name "*.js")

# Para cada arquivo CSS/JS, corrigir caminhos internos
for file in $ASSETS_FILES; do
  # Substituir referências a paths absolutos ("/assets/...") para relativos ("./assets/...")
  sed -i 's|"/assets/|"./assets/|g' $file
  # Também corrigir outros patterns
  sed -i "s|url(/assets/|url(./assets/|g" $file
  sed -i "s|@import '/assets/|@import './assets/|g" $file
  sed -i "s|@import \"/assets/|@import \"./assets/|g" $file
  echo "Corrigido $file"
done

# Corrigir index.html e 404.html
for htmlfile in docs/index.html docs/404.html; do
  # Substituir todas as referências possíveis a assets
  sed -i 's|href="/assets/|href="./assets/|g' $htmlfile
  sed -i 's|src="/assets/|src="./assets/|g' $htmlfile
  sed -i 's|url("/assets/|url("./assets/|g' $htmlfile
  sed -i "s|url('/assets/|url('./assets/|g" $htmlfile
  sed -i 's|from "/|from "./|g' $htmlfile
  sed -i "s|from '/|from './|g" $htmlfile
  
  # Também tornar o caminho do script principal relativo
  sed -i 's|src="/src/|src="./src/|g' $htmlfile
  sed -i 's|href="/src/|href="./src/|g' $htmlfile
  
  # Corrigir qualquer outra referência absoluta que comece com barra
  sed -i 's|src="/|src="./|g' $htmlfile
  sed -i 's|href="/|href="./|g' $htmlfile
  
  echo "Corrigido $htmlfile"
done

# Criar um arquivo 404.html para funcionar com rotas do SPA no GitHub Pages
cp docs/index.html docs/404.html

# Criar um arquivo .nojekyll para evitar processamento Jekyll
touch docs/.nojekyll

# Script de verificação para testar localmente a versão do GitHub Pages
cat > docs/test-locally.sh << 'EOF'
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
EOF

# Tornar o script executável
chmod +x docs/test-locally.sh

# Adicionar um arquivo de diagnóstico para verificar se a página está carregando corretamente
cat > docs/diagnostic.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Diagnóstico GitHub Pages</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .result { margin: 20px 0; padding: 15px; border-radius: 5px; }
    .success { background-color: #d4edda; color: #155724; }
    .error { background-color: #f8d7da; color: #721c24; }
    pre { background: #f8f9fa; padding: 10px; overflow: auto; }
  </style>
</head>
<body>
  <h1>Diagnóstico da Aplicação no GitHub Pages</h1>
  <div id="results"></div>

  <script>
    const results = document.getElementById('results');
    
    function addResult(success, message) {
      const div = document.createElement('div');
      div.className = `result ${success ? 'success' : 'error'}`;
      div.innerHTML = message;
      results.appendChild(div);
    }
    
    // Verificar se o index.html existe
    fetch('./index.html')
      .then(response => {
        if (response.ok) {
          addResult(true, '<strong>✓</strong> index.html encontrado');
        } else {
          addResult(false, '<strong>✗</strong> index.html não encontrado');
        }
      })
      .catch(error => {
        addResult(false, `<strong>✗</strong> Erro ao verificar index.html: ${error.message}`);
      });
      
    // Verificar arquivos CSS
    fetch('./index.html')
      .then(response => response.text())
      .then(html => {
        const cssLinks = html.match(/href="[^"]*\.css[^"]*"/g) || [];
        
        if (cssLinks.length === 0) {
          addResult(false, '<strong>✗</strong> Nenhum arquivo CSS encontrado no HTML');
          return;
        }
        
        cssLinks.forEach(link => {
          const cssPath = link.match(/href="([^"]*)"/)[1];
          fetch(cssPath)
            .then(response => {
              if (response.ok) {
                addResult(true, `<strong>✓</strong> CSS carregado com sucesso: ${cssPath}`);
              } else {
                addResult(false, `<strong>✗</strong> Falha ao carregar CSS: ${cssPath}`);
              }
            })
            .catch(error => {
              addResult(false, `<strong>✗</strong> Erro ao verificar CSS ${cssPath}: ${error.message}`);
            });
        });
      });
      
    // Verificar scripts JS
    fetch('./index.html')
      .then(response => response.text())
      .then(html => {
        const jsLinks = html.match(/src="[^"]*\.js[^"]*"/g) || [];
        
        if (jsLinks.length === 0) {
          addResult(false, '<strong>✗</strong> Nenhum arquivo JS encontrado no HTML');
          return;
        }
        
        jsLinks.forEach(link => {
          const jsPath = link.match(/src="([^"]*)"/)[1];
          fetch(jsPath)
            .then(response => {
              if (response.ok) {
                addResult(true, `<strong>✓</strong> JS carregado com sucesso: ${jsPath}`);
              } else {
                addResult(false, `<strong>✗</strong> Falha ao carregar JS: ${jsPath}`);
              }
            })
            .catch(error => {
              addResult(false, `<strong>✗</strong> Erro ao verificar JS ${jsPath}: ${error.message}`);
            });
        });
      });
  </script>
</body>
</html>
EOF

echo "Build para GitHub Pages concluído! Os arquivos estão na pasta 'docs/'"
echo "Agora você pode fazer commit e push desses arquivos para o seu repositório GitHub."
echo "Não se esqueça de configurar o GitHub Pages para servir da pasta 'docs/' nas configurações do repositório."
echo ""
echo "Para testar localmente antes de publicar, execute:"
echo "cd docs && ./test-locally.sh"
echo "E acesse http://localhost:8000"
echo ""
echo "Para diagnosticar problemas com arquivos CSS/JS, acesse:"
echo "http://localhost:8000/diagnostic.html"