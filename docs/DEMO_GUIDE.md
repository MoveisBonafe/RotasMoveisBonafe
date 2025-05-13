# Guia para Demonstração e Uso da Aplicação

Este guia explica como utilizar a aplicação de otimização de rotas tanto na versão React (em desenvolvimento) quanto na versão standalone para o GitHub Pages.

## Acesso à Aplicação

### Versão em Desenvolvimento (React)
- Acesse a versão completa em desenvolvimento executando o workflow "Start application" no Replit
- A aplicação estará disponível na aba Webview

### Versão GitHub Pages (Standalone)
- Para testar localmente, execute o script `./docs/test-locally.sh`
- Para acessar online, vá para a URL do GitHub Pages do repositório
- A versão standalone contém todas as funcionalidades principais sem necessidade de backend

## Guia para Demonstração

### 1. Página Inicial
A aplicação está organizada em três abas principais:
- **Locais**: Para adicionar e gerenciar os destinos da rota
- **Eventos**: Para visualizar eventos e restrições nas cidades da rota
- **Relatório**: Para visualizar o resumo detalhado da rota otimizada

### 2. Adicionar Locais
Existem duas maneiras de adicionar locais à rota:

**Método 1: Adição manual**
1. Na aba "Locais", use o campo "Adicionar local" para pesquisar um endereço
2. Selecione o local desejado nas sugestões que aparecerem
3. O local será adicionado à lista e um marcador aparecerá no mapa

**Método 2: Upload de arquivo**
1. Prepare um arquivo de texto no formato `CEP,Nome do Local` (um por linha)
2. Exemplo:
   ```
   14020-260,Ribeirão Preto
   17560-000,Vera Cruz
   17580-000,Pompéia
   ```
3. Clique em "Escolher arquivo" e selecione seu arquivo
4. Os locais serão adicionados automaticamente

### 3. Otimizar Rota
1. Selecione o tipo de veículo (influencia custos e restrições)
2. Clique no botão "Otimizar Rota" na parte inferior da aba "Locais"
3. A aplicação calculará a melhor rota entre todos os pontos
4. O mapa mostrará a rota com uma animação progressiva
5. A aplicação mudará automaticamente para a aba "Relatório"

### 4. Visualizar Relatório
Na aba "Relatório", você verá:
- Distância total da rota
- Tempo estimado de viagem
- Consumo de combustível estimado
- Custo de pedágios
- Custo total estimado da viagem
- Sequência detalhada de cidades na rota

Você também pode:
- Dar um nome à rota e salvá-la (na versão React)
- Imprimir o relatório da rota

### 5. Verificar Eventos e Restrições
Na aba "Eventos", após otimizar uma rota:
- Use o filtro de datas para selecionar um período
- Veja todos os eventos nas cidades da rota (festas, feriados, etc.)
- Veja as restrições para caminhões em cada cidade da rota
- Os eventos e restrições são específicos para as cidades incluídas na rota atual

### 6. Recursos Adicionais no Mapa
O mapa mostra:
- Marcadores numerados para cada local na sequência da rota
- Pedágios ao longo das rodovias da rota (ícones verdes)
- Balanças de pesagem (ícones laranja)
- Eventos nas cidades (ícones vermelhos para feriados, laranjas para eventos)

Botões de controle:
- Zoom para ajustar a visualização a todos os pontos
- Mostrar/ocultar pontos de interesse
- Street View disponível (arraste o Pegman para qualquer ponto da rota)

## Diferenças entre as Versões

### Versão React (Desenvolvimento)
- Conexão com banco de dados para armazenamento persistente
- Funcionalidades completas de backend
- Mais opções de personalização

### Versão Standalone (GitHub Pages)
- Funciona completamente sem servidor
- Dados mockados embutidos no HTML
- Mesma interface e funcionalidades principais
- Melhor desempenho em dispositivos móveis