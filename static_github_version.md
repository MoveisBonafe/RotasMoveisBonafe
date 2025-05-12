# Versão Estática para GitHub Pages

Para resolver os problemas com o GitHub Pages, recomendo seguir as seguintes etapas:

1. Mantenha a versão React no Replit, onde você tem acesso ao ambiente de desenvolvimento completo.

2. Para o GitHub Pages, utilize a versão estática HTML/CSS/JS que foi criada:
   - Os arquivos principais estão em `docs/`
   - O arquivo `docs/index.html` contém toda a aplicação em uma única página
   - O arquivo `docs/tsp.js` contém a implementação do algoritmo do caixeiro viajante
   - Os ícones estão em `docs/event-icons/`
   - O arquivo `docs/404.html` está configurado para redirecionar para a página principal

3. Configurando o GitHub Pages:
   - No repositório GitHub, vá para Settings > Pages
   - Na seção "Build and deployment", selecione:
     - Source: "Deploy from a branch"
     - Branch: "main" (ou a branch principal)
     - Folder: "/docs"
   - Clique em "Save"

4. Soluções para os problemas encontrados:
   - Tamanho do sidebar e mapa: Altere os valores CSS para `width`, `height` e `min-height` no arquivo index.html
   - Pegman: Configure o iframe para ter height:100% e adicione um parâmetro de maptype=roadmap
   - Coordenadas erradas: Adicione um mapeamento de CEPs para coordenadas reais ou use a API de Geocoding
   - Importação de arquivo: Verifique o formato UTF-8 e remova caracteres especiais

5. Exemplo de arquivo CEP para importação:
```
14091-530,Pedro
17302-122,Luis
01415-002,Maria
13083-970,João
```

Lembre-se que a versão estática tem limitações em comparação com a versão React, mas é mais robusta para uso no GitHub Pages, que não suporta backends.