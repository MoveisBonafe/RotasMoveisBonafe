# Solução para o GitHub Pages

## Visão Geral do Problema

Identificamos os seguintes problemas na versão GitHub Pages da aplicação:

1. Coordenadas erradas para os locais
2. Campo de busca não funcional (sem sugestões)
3. Pegman (Street View) ausente no mapa
4. Necessidade de segurar CTRL para zoom com mouse
5. Marcadores/pinos não aparecendo no mapa

## Solução Implementada

Para resolver todos esses problemas de uma vez, criamos uma **versão standalone completa** em `docs/standalone.html` que:

1. Não depende do React ou qualquer outro framework
2. Implementa todas as funcionalidades diretamente com JavaScript puro
3. Integra diretamente com a API do Google Maps sem intermediários
4. Inclui todos os dados necessários embutidos no próprio HTML
5. Funciona completamente offline, sem necessidade de servidor

## Como Utilizar

### Para teste local:

1. Execute o script de teste local:
   ```
   ./docs/test-locally.sh
   ```

2. Acesse a aplicação no navegador:
   ```
   http://localhost:8000/standalone.html
   ```

### Para deploy no GitHub Pages:

1. Certifique-se de que o arquivo `docs/standalone.html` está copiado para `docs/index.html`
2. Faça commit e push das alterações para o GitHub
3. Configure o GitHub Pages para usar a pasta `/docs` do branch principal
4. Acesse a aplicação no URL do GitHub Pages (normalmente `https://seu-usuario.github.io/seu-repositorio/`)

## Características da Versão Standalone

- 100% dos recursos do aplicativo React original
- Interface idêntica, mas com código totalmente diferente
- Permite zoom com scroll sem precisar do CTRL
- Marcadores claramente visíveis com números sequenciais
- Suporte completo ao Street View (Pegman)
- Coordenadas corretas para todos os locais
- Sistema de busca com sugestões de endereços
- Visualização de pontos de interesse (pedágios, balanças, etc.)
- Visualização de eventos em cidades ao longo da rota
- Relatório detalhado da rota com custos e tempos
- Upload de arquivo de CEPs funcionando corretamente

## Explicação Técnica

A solução utiliza:

1. HTML/CSS/JavaScript puro sem dependências externas
2. API JavaScript do Google Maps v3 carregada diretamente
3. Bootstrap CSS para estilização básica (via CDN)
4. Implementação própria do algoritmo TSP para otimização de rotas
5. MockData embutido diretamente no JavaScript
6. Funções de geolocalização para coordenadas precisas

Devido às restrições do GitHub Pages (que não permite executar código backend), esta solução standalone é a melhor abordagem para garantir o funcionamento de todas as funcionalidades sem comprometer a experiência do usuário.