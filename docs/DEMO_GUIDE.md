# Guia de Demonstração - Otimizador de Rotas

Este guia detalha como utilizar o Otimizador de Rotas para planejamento e visualização de rotas no Brasil.

## Como Acessar a Demonstração

A demonstração está disponível em: [https://seu-usuario.github.io/seu-repositorio](https://seu-usuario.github.io/seu-repositorio)

## Funcionalidades Principais

### 1. Planejamento de Rotas
- **Origem fixa em Dois Córregos-SP**: Todas as rotas começam neste ponto
- **Adição de destinos**: Adicione manualmente ou via arquivo de CEPs
- **Visualização no mapa**: Rotas são mostradas em tempo real

### 2. Upload de Arquivo
- Formato aceito: arquivo de texto com formato `CEP,Nome`
- Cada linha representa um destino a ser incluído na rota
- Exemplo de conteúdo:
  ```
  13560-970,Destino 1
  17800-000,Destino 2
  13566-590,Destino 3
  ```

### 3. Otimização de Rota
- Implementação do algoritmo do Caixeiro Viajante
- Calcula a sequência mais eficiente para visitar todos os pontos
- Exibe distância total e tempo estimado

### 4. Informações Adicionais
- **Pedágios**: Visualize pedágios ao longo da rota
- **Balanças**: Localize postos de pesagem na rota
- **Restrições**: Verifique horários de restrição de caminhões
- **Eventos**: Visualize eventos nas cidades ao longo da rota

## Guia Passo a Passo

### Planejando uma Rota Simples
1. Acesse a demonstração
2. Utilize o campo de busca para adicionar um destino (endereço ou CEP)
3. Clique em "Adicionar ao Roteiro"
4. Adicione mais destinos conforme necessário
5. Clique em "Calcular Rota"
6. O mapa mostrará a rota otimizada com marcadores numerados

### Carregando Destinos via Arquivo
1. Prepare um arquivo de texto com o formato `CEP,Nome` (um por linha)
2. Clique em "Importar" na interface
3. Selecione seu arquivo
4. Os destinos serão adicionados automaticamente
5. Clique em "Calcular Rota"

### Visualizando Informações Adicionais
1. Com uma rota calculada, explore as abas inferiores:
   - **Pedágios**: Mostra pedágios no trajeto
   - **Eventos**: Exibe eventos nas cidades da rota
   - **Restrições**: Indica horários de restrição para caminhões
   - **Balanças**: Mostra postos de pesagem no trajeto

## Opções Avançadas

### Seleção de Veículos
- Escolha entre diferentes tipos de caminhões
- Cada tipo tem seu próprio custo por km e consumo
- Influencia o cálculo do custo total da rota

### Filtragem de Datas
- Selecione um período específico
- Filtra eventos e restrições relevantes apenas para o período escolhido

## Solução de Problemas

### Se o mapa não carregar:
1. Verifique sua conexão com a internet
2. Certifique-se que JavaScript está habilitado
3. Tente recarregar a página
4. Limpe o cache do navegador

### Se a importação de arquivo falhar:
1. Verifique o formato do arquivo (deve ser `.txt`)
2. Confirme que cada linha segue o formato `CEP,Nome`
3. Certifique-se que os CEPs são válidos