# Guia de Demonstração do Otimizador de Rotas

Este guia oferece um passo a passo para demonstrar as funcionalidades principais do Otimizador de Rotas.

## 1. Acessando a Aplicação

- Acesse a versão GitHub Pages através da URL: https://seu-usuario.github.io/otimizador-rotas/
- Ou clique em "Versão Standalone" na página inicial

## 2. Demonstração de Funcionalidades Básicas

### 2.1 Configurar as Datas
- Na barra lateral, localize o seletor de datas no topo
- Selecione um intervalo de datas para sua viagem (por exemplo, próxima semana)
- O sistema filtrará eventos que ocorrem neste período

### 2.2 Adicionar Locais Manualmente
- Abaixo do campo "Origem: Dois Córregos-SP", localize o campo de pesquisa
- Digite um endereço como "Ribeirão Preto" e clique em "Adicionar Local"
- Repita o processo para adicionar mais 3-4 locais (sugestões: "Jaú", "São Carlos", "Bauru")
- Observe que cada local é adicionado com um marcador numerado no mapa

### 2.3 Importar Locais via Arquivo
- Prepare um arquivo de texto no formato:
```
14400-000,Franca-SP
13560-000,São Carlos-SP
```
- Clique em "Importar Locais" e selecione o arquivo
- Observe que os locais são adicionados automaticamente

### 2.4 Otimizar Rota
- Após adicionar 4-5 locais, clique no botão "Otimizar Rota"
- Observe a animação no mapa mostrando a rota otimizada
- Note que o sistema calcula a rota mais eficiente partindo sempre de Dois Córregos-SP

## 3. Demonstração de Recursos Avançados

### 3.1 Visualizar Relatório de Rota
- Após a otimização, note o relatório detalhado abaixo do botão "Otimizar Rota"
- Observe informações como:
  - Distância total da rota
  - Tempo estimado de viagem
  - Custo estimado (combustível)
  - Sequência otimizada de locais

### 3.2 Explorar Eventos das Cidades
- Clique na aba "Eventos" no menu inferior
- Observe a lista de eventos existentes nas cidades da sua rota
- Note especialmente os eventos de aniversário de fundação das cidades, que mostram a data histórica correta e a idade atual

### 3.3 Verificar Pontos de Interesse 
- Clique na aba "Pontos de Interesse" no menu inferior
- Observe os pedágios e balanças de pesagem ao longo da rota
- Clique em um pedágio para ver mais informações

### 3.4 Explorar Restrições de Caminhões
- Clique na aba "Restrições" no menu inferior
- Observe as restrições de circulação de caminhões nas cidades da rota
- Filtre por tipo específico de caminhão para ver restrições aplicáveis

## 4. Recursos Interativos do Mapa

### 4.1 Street View
- Clique e arraste o ícone do "Pegman" (bonequinho) no mapa
- Solte sobre um trecho da rota para ver o Street View daquela área

### 4.2 Zoom e Navegação
- Use os botões +/- ou scroll do mouse para ajustar o zoom
- Clique e arraste para navegar pelo mapa

### 4.3 Alternar Visualizações
- Clique no botão de camadas no canto superior direito do mapa
- Alterne entre visualizações de mapa, satélite e híbrido

## 5. Demonstração de Casos Especiais

### 5.1 Rotas Alternativas
- Na seção abaixo de "Otimizar Rota", observe as rotas alternativas sugeridas
- Clique em uma rota alternativa para visualizá-la no mapa
- Compare distâncias e tempos estimados entre as opções

### 5.2 Feriados e Eventos Especiais
- Utilize as datas próximas a feriados nacionais ou eventos importantes
- Veja como o sistema destaca eventos relevantes ao longo da rota

## 6. Dicas para uma Demonstração Eficaz

1. **Prepare com antecedência** alguns endereços para adicionar rapidamente
2. **Escolha uma rota interessante** que passe por cidades com eventos conhecidos
3. **Destaque as melhorias recentes** como a correção das datas históricas de fundação
4. **Explique o algoritmo** de otimização (problema do caixeiro viajante) de forma simplificada
5. **Mostre a responsividade** testando em diferentes tamanhos de tela