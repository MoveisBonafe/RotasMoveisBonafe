# Instruções para Atualizar o Repositório GitHub

Para corrigir o problema de layout da sidebar no seu aplicativo GitHub Pages, siga estas instruções:

## Opção 1: Atualização Completa (Recomendado)

1. Baixe o arquivo `github_deploy_files.zip` do Replit
2. Descompacte o arquivo em seu computador
3. Copie todo o conteúdo da pasta descompactada
4. No seu repositório GitHub, navegue até a pasta `docs`
5. Substitua todos os arquivos pelos novos (você pode fazer upload pela interface web do GitHub)
6. Faça commit das alterações com a mensagem: "Correção de layout para sidebar e mapa"
7. Aguarde alguns minutos para que o GitHub Pages atualize

## Opção 2: Atualização Apenas dos Arquivos Modificados

Se preferir fazer alterações mínimas, você pode atualizar apenas:

1. `docs/index.html` - Página inicial com links para todas as versões
2. `docs/standalone.html` - Versão principal com layout corrigido
3. `docs/css/css_a_inserir.css` - Novo arquivo CSS com as correções
4. `docs/solucao_alternativa.html` e `docs/solucao_sidebar.html` - Demos de layout
5. `docs/standalone-1747323195.html` - Versão com timestamp para evitar cache

## O que foi corrigido

- Layout da sidebar para preencher toda a altura disponível até a barra inferior
- Alinhamento correto entre sidebar e mapa (sem sobreposição)
- Posicionamento correto da barra inferior de tabs
- Responsividade melhorada para telas menores
- Meta tags para evitar cache do navegador

## Como testar as mudanças

Após o deploy, acesse o site do GitHub Pages e você verá vários links na página inicial:

- **Versão Original**: O arquivo standalone.html sem modificações
- **Versão Corrigida**: O arquivo standalone.html com as correções aplicadas
- **Demo Layout**: Uma versão simplificada mostrando como deveria ficar o layout
- **Versão Simplificada**: A versão de teste existente anteriormente

Clique em "Versão Corrigida" para ver o layout atualizado que deve resolver o problema da sidebar.

## Se ainda houver problemas

Se você ainda encontrar problemas depois de atualizar o GitHub Pages, pode tentar:

1. Limpar o cache do navegador (Ctrl+F5 ou Cmd+Shift+R)
2. Usar o modo anônimo/privado do navegador
3. Acessar diretamente a URL do arquivo com timestamp: `standalone-1747323195.html`

Se nada funcionar, você pode implementar manualmente as correções CSS do arquivo `css_a_inserir.css` diretamente no `standalone.html`.