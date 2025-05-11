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
