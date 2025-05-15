# Versão GitHub Pages do Planejador de Rotas

Esta é a versão estática do Planejador de Rotas, projetada para funcionar no GitHub Pages.

## Arquivos importantes

- `index.html`: Aplicação principal
- `tsp.js`: Implementação do algoritmo do caixeiro viajante
- `fix-github.js`: Correções específicas para GitHub Pages
- `404.html`: Página de erro personalizada
- `diagnostic.html`: Ferramenta de diagnóstico para encontrar problemas
- `github-pages.md`: Instruções detalhadas de configuração
- `test-locally.sh`: Script para testar localmente

## Instruções

1. Para funcionar corretamente no GitHub Pages, a pasta `docs/` deve ser configurada como a fonte no GitHub Pages.

2. Se encontrar problemas com o GitHub Pages, acesse `diagnostic.html` para verificar o que está errado.

3. Para testar localmente, execute o script `test-locally.sh`:
   ```bash
   chmod +x test-locally.sh
   ./test-locally.sh
   ```

4. Para mais informações sobre configuração e solução de problemas, consulte o arquivo `github-pages.md`.

## Importação de arquivos

Para importar CEPs, use um arquivo de texto no formato:
```
14091-530,Pedro
17302-122,Luis
01415-002,Maria
13083-970,João
```

## Contato

Se encontrar problemas, abra uma issue no GitHub ou entre em contato.