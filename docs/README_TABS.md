# Instruções para Corrigir Problemas nas Abas

Este documento explica como solucionar problemas relacionados ao sistema de abas na versão do GitHub Pages.

## Problema de Sobreposição

Se você encontrar um problema onde o conteúdo de múltiplas abas está aparecendo ao mesmo tempo (sobreposição), a aplicação inclui um script de correção dedicado chamado `fix-tabs-github.js`.

Este script garante que:
1. Apenas uma aba esteja visível por vez
2. A rolagem de cada aba seja independente, no estilo "página de notícias"
3. O conteúdo das abas não afete a visualização do mapa

## Atualização para o GitHub Pages

Para atualizar a versão do GitHub Pages:

1. Certifique-se de que os arquivos `index.html`, `standalone.html` e `fix-tabs-github.js` estejam atualizados na pasta `docs/`.

2. Faça o commit e push das alterações para seu repositório GitHub.

3. Verifique se as configurações do GitHub Pages estão apontando para a pasta `/docs` na branch principal.

## Funcionamento do Sistema de Abas

O sistema de abas funciona da seguinte forma:

1. Cada aba tem um botão na barra de navegação inferior que corresponde a um conteúdo específico.

2. Quando um botão é clicado:
   - Se a aba já estava ativa e expandida, ela é minimizada
   - Se a aba não estava ativa, ela é ativada e expandida
   - Se as abas estavam minimizadas, elas são expandidas

3. A área de conteúdo de cada aba tem rolagem independente, permitindo visualizar todo o conteúdo sem afetar a parte superior da aplicação.

4. O script de correção utiliza um observador de mutações para garantir que as abas permaneçam no estado correto, mesmo quando JavaScript nativo da aplicação tenta modificá-las.

## Teste de Funcionalidades

Para testar se a correção está funcionando:

1. Abra a aplicação no GitHub Pages
2. Clique em cada aba (Eventos, Restrições, Relatório) e verifique se:
   - Apenas o conteúdo da aba selecionada está visível
   - A rolagem funciona de forma independente
   - O mapa na parte superior não é afetado