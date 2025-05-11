# Versão Estática para GitHub Pages

Esta é uma versão estática e simplificada do Planejador de Rotas especificamente criada para funcionar no GitHub Pages sem problemas de compatibilidade ou caminhos de arquivos.

## Como usar esta versão

1. **Para disponibilizar no GitHub Pages:**
   - Copie a pasta `static_github_version` para seu repositório.
   - Renomeie-a para `docs` e faça o commit.
   - Configure o GitHub Pages para usar a branch principal e pasta `/docs`.

2. **Funcionalidade disponível:**
   - Visualização de mapa com rota predefinida entre Dois Córregos e destinos
   - Botão para otimizar a rota (simulado)
   - Versão completamente autônoma com tudo embutido em um único arquivo HTML

## Por que usar esta versão

A versão completa da aplicação usa Vite, React e outras tecnologias que podem encontrar problemas ao serem publicadas no GitHub Pages. Esta versão estática resolve todos esses problemas, garantindo compatibilidade máxima.

## Diferenças da versão completa

- Não requer API backend
- Rotas e localizações são fixas (não é possível adicionar novas)
- Todo o código está em um único arquivo HTML
- Design responsivo e similar ao da aplicação completa