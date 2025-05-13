# Otimizador de Rotas - GitHub Pages

## Sobre este projeto
Esta é a versão do Otimizador de Rotas adaptada para o GitHub Pages. O aplicativo realiza cálculos de otimização de rotas com base no problema do caixeiro viajante (TSP) e exibe informações relevantes como eventos em cidades, restrições de tráfego e pontos de interesse.

## Arquivos importantes

- `standalone.html` - Versão completa e autônoma do aplicativo
- `fix-event-dates.js` - Script para correção de datas de aniversário de cidades
- `GITHUB_PAGES_FIX.md` - Documentação sobre a correção de datas

## Correções realizadas em 13/05/2025

1. **Problema de Distância TSP Inválida (0km)**
   - Implementadas verificações robustas de coordenadas
   - Adicionados mecanismos de fallback para garantir sempre distâncias válidas
   - Criada uma rota de backup caso o algoritmo TSP falhe

2. **Problema com Datas de Aniversário de Cidades**
   - Implementada correção para exibir a data histórica de fundação das cidades
   - Script dedicado `fix-event-dates.js` que corrige a exibição na interface
   - Correção específica para garantir que Ribeirão Preto mostre "19/06/1856" como sua data de fundação

3. **Problema de Filtro de Datas**
   - Implementada lógica melhorada para comparar apenas mês/dia para eventos de aniversário
   - Adicionada validação de datas para garantir funcionamento correto do filtro

## Como verificar as correções

1. Abra o aplicativo no GitHub Pages
2. Adicione alguns destinos à rota
3. Clique em "Otimizar Rota"
4. Verifique a aba "Eventos" - as datas de aniversário de cidades devem mostrar a data histórica de fundação, não o ano atual
5. Confirme que a idade da cidade (anos desde a fundação) é calculada corretamente

## Manutenção

Se forem necessárias correções adicionais, consulte o arquivo `GITHUB_PAGES_FIX.md` para instruções detalhadas.