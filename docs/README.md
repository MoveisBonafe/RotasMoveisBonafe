# Versão GitHub Pages do Otimizador de Rotas

Esta é uma versão estática do aplicativo de otimização de rotas, desenvolvida especificamente para hospedar no GitHub Pages.

## Características
- Todos os dados são carregados a partir de dados mock embutidos
- Não é necessário backend
- Google Maps carregado a partir do iframe
- Completamente funcional sem servidor

## Como usar
1. Acesse a aplicação pela URL do GitHub Pages
2. Adicione destinos usando o botão "Adicionar Destino" na barra lateral
3. Clique em "Calcular Rota" para executar o algoritmo TSP
4. Veja as informações da rota, incluindo pedágios e balanças de pesagem

## Testar localmente
Execute o script `test-locally.sh` para iniciar um servidor web local:
```bash
./test-locally.sh
```

## Diagnóstico
Para verificar se a aplicação está funcionando corretamente, acesse a página de diagnóstico:
```
diagnostic.html
```

## Limitações
Esta versão estática não permite:
- Salvar ou exportar rotas
- Sincronizar com banco de dados
- Funcionalidades que dependem do backend

Desenvolvido com ❤️ usando React e Google Maps.