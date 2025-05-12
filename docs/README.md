# Otimizador de Rotas - Versão GitHub Pages

Este diretório contém a versão otimizada do Otimizador de Rotas para deploy no GitHub Pages.

## Conteúdo

1. `index.html` - Página inicial com navegação para as versões
2. `standalone.html` - Versão completa da aplicação sem dependências externas
3. `test.html` - Versão simplificada para teste do Google Maps API

## Instruções para teste local

### Opção 1: Servidor Python

```bash
cd docs
python3 -m http.server 8000
```

Acesse em seu navegador: `http://localhost:8000`

### Opção 2: Abrir arquivos diretamente

Você também pode abrir os arquivos HTML diretamente no navegador:

```
docs/index.html
docs/standalone.html
docs/test.html
```

## Recursos da versão standalone

- Implementação completa de todas as funcionalidades sem dependências externas
- Interface idêntica à versão React, mas sem necessidade de servidor
- Suporte total a:
  - Adição de múltiplos destinos manualmente ou via arquivo
  - Cálculo de rota otimizada (algoritmo do caixeiro viajante)
  - Visualização de eventos e restrições em cidades
  - Relatório detalhado com custos e tempos
  - Marcadores sequenciais e animação da rota
  - Street View (Pegman) funcional
  - Zoom com scroll sem precionar CTRL

## Recursos do mapa

- Marcadores numerados para sequência da rota
- Pedágios e balanças de pesagem ao longo da rota
- Eventos em cidades destacados com ícones coloridos
- Relatório detalhado com custos estimados

## Notas técnicas

- A versão standalone utiliza JavaScript puro e Google Maps API
- Dados de exemplo estão incorporados diretamente no HTML
- A página não requer conexão com banco de dados