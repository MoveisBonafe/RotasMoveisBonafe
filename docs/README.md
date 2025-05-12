# Otimizador de Rotas - Versão GitHub Pages

Este diretório contém a versão do Otimizador de Rotas otimizada para hospedagem no GitHub Pages.

## Arquivos principais

- `index.html` - Página principal com menu de seleção de versões
- `minimal-map.html` - Versão simplificada com apenas o mapa básico e ponto de origem
- `github_pages_map.html` - Versão completa com todas as funcionalidades
- `maps_test.html` - Arquivo de teste para diagnóstico da API do Google Maps

## Solucionando problemas com o GitHub Pages

Devido às restrições do GitHub Pages ao trabalhar com APIs externas como o Google Maps, criamos diferentes versões do aplicativo para garantir compatibilidade:

1. A versão `minimal-map.html` é altamente simplificada e possui apenas o carregamento do mapa básico, o que a torna mais robusta para ambientes com restrições.

2. A versão `github_pages_map.html` contém a funcionalidade completa, mas foi adaptada especificamente para o GitHub Pages com:
   - Carregamento otimizado de scripts
   - Tratamento robusto de erros
   - Feedback visual do status de carregamento

Se o mapa não estiver carregando em nenhuma versão, pode ser devido a:
- Restrições da chave da API do Google Maps
- Bloqueio de acesso à API por parte do navegador
- Configurações de segurança específicas do GitHub Pages

## Dicas para desenvolvedores

Ao modificar este código:
- Mantenha o carregamento assíncrono dos scripts (async, defer)
- Sempre inclua tratamento de erros para APIs externas
- Use o arquivo `maps_test.html` para testar mudanças no carregamento do mapa antes de implementá-las

## Recursos utilizados

- Google Maps JavaScript API
- Google Places API
- Bootstrap 5.3.0