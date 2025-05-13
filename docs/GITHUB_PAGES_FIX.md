# Instruções para Correção da Exibição de Datas no GitHub Pages

## Problema
Na versão hospedada no GitHub Pages, as datas de aniversário/fundação das cidades estão sendo exibidas incorretamente na aba de eventos, mostrando valores como "18/06/2025" em vez da data histórica correta de fundação (ex.: "19/06/1856").

## Solução
Foi implementada uma correção através de um script JavaScript adicional (`fix-event-dates.js`) que é carregado na página e corrige automaticamente as datas de fundação, tanto nos dados quanto na exibição da interface.

## Como implementar

1. **Verifique se o script está presente**
   - Confirme que o arquivo `fix-event-dates.js` existe na pasta `docs/`
   - Confirme que o arquivo `standalone.html` inclui uma referência ao script:
   ```html
   <script src="fix-event-dates.js" defer></script>
   ```

2. **Como funciona a correção**
   - O script identifica eventos de aniversário/fundação
   - Preserva a data histórica original de fundação
   - Calcula corretamente a idade da cidade
   - Corrige a exibição na interface, substituindo "DD/MM/2025" pela data histórica
   - Adiciona o número correto de anos desde a fundação

3. **Em caso de problemas persistentes**
   - Verifique o console do navegador para mensagens de erro
   - Certifique-se de que o script `fix-event-dates.js` está sendo carregado corretamente
   - Tente limpar o cache do navegador antes de testar novamente

4. **Após implementação**
   - Execute um deploy completo para o GitHub Pages
   - Teste em diferentes navegadores para garantir que a correção funcione em todos
   - Garanta que as datas exibidas na aba "Eventos" mostrem a data histórica correta, não a data atual

## Observações
- Esta correção é específica para a versão hospedada no GitHub Pages
- O problema ocorre devido à forma como as datas são manipuladas para filtrar eventos por data
- A solução implementada mantém a funcionalidade de filtro, mas corrige a exibição visual

---

### Log de atualizações:
- 13/05/2025: Implementada correção para exibição de datas de fundação
- 13/05/2025: Correção do cálculo de idade das cidades