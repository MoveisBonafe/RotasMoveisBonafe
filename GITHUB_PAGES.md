# Implantação no GitHub Pages

Este projeto está configurado para ser implantado no GitHub Pages, fornecendo uma versão estática funcional do aplicativo de otimização de rotas.

## Conteúdo da Pasta `docs`

A pasta `docs` contém uma versão estática completa do aplicativo, incluindo:

- `index.html` - Página principal com a interface completa
- `404.html` - Página de erro para rotas não encontradas
- `assets/` - Arquivos CSS e JavaScript compilados
- `README.md` - Documentação da versão estática
- `.nojekyll` - Arquivo para evitar processamento Jekyll
- `test-locally.sh` - Script para testar a implantação localmente
- `diagnostic.html` - Página de diagnóstico para verificar a implantação

## Como funciona

A versão estática usa:

1. **Google Maps Embed API** (via iframe) para exibir mapas e rotas
2. **JavaScript puro** para interações básicas
3. **Dados mockados** para simular a funcionalidade do backend
4. **CSS inline** para estilização sem dependências externas

## Configuração do GitHub Pages

Para configurar o GitHub Pages:

1. No seu repositório GitHub, vá para **Settings > Pages**
2. Em **Source**, selecione a branch `main` (ou `master`) e a pasta `/docs`
3. Clique em **Save**

O site será publicado em `https://seu-usuario.github.io/nome-do-repo/`

## Diferenças da Versão Completa

A versão estática:

- Não requer servidor backend
- Não permite persistência de dados (salvar rotas)
- Usa rotas e dados pré-definidos
- Não permite personalização avançada
- Não tem dependência do React ou outras bibliotecas

## Testes e Diagnóstico

Para verificar se a implantação está funcionando corretamente:

1. Acesse a URL do GitHub Pages
2. Verifique se o mapa é carregado corretamente
3. Teste os botões "Inicio" e "Otimizar Rota"
4. Acesse a página `diagnostic.html` para relatórios detalhados

## Solução de Problemas

Se encontrar problemas com a implantação:

1. **Erro 404 nos assets**: Verifique se os caminhos em `index.html` e `404.html` estão usando `./assets/` em vez de `/assets/`
2. **Mapa não carrega**: Verifique se a chave da API do Google Maps está válida
3. **Problema de navegação**: Certifique-se de que a tag `<base href="./">` está presente no cabeçalho

## Atualizando a Versão Estática

Para atualizar a versão estática:

1. Modifique os arquivos na pasta `docs` diretamente
2. Ou execute o script de deploy (`deploy-github.sh`) para reconstruir tudo

## Versão Local vs. GitHub Pages

A versão local do aplicativo oferece funcionalidade completa com backend Express, enquanto a versão GitHub Pages é uma demonstração limitada com dados mockados.

---

Desenvolvido com ❤️ - 2025