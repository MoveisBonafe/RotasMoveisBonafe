# Guia de Demonstração do Otimizador de Rotas Móveis Bonafé

Este guia descreve como realizar uma demonstração completa da aplicação, incluindo todas as funcionalidades principais, para apresentação a clientes ou usuários.

## Preparação

1. **Acesse a Aplicação**:
   - Via website: [Otimizador de Rotas (versão GitHub Pages)](https://seuusuario.github.io/otimizador-de-rotas/)
   - OU localmente: `http://localhost:5000`

2. **Verifique a Conexão**:
   - Certifique-se que o Google Maps API está funcionando corretamente
   - O mapa deve ser exibido na área principal

## Roteiro de Demonstração

### 1. Origem Pré-definida

**Demonstre**: A aplicação sempre utiliza Dois Córregos-SP como ponto de origem para todas as rotas.

- Aponte para o marcador de origem no mapa e o item de origem na barra lateral
- Explique que todas as rotas começam deste ponto fixo
- Mencione que este é o ponto onde se encontra a empresa

### 2. Adicionar Destinos

**Demonstre**: Várias formas de adicionar locais:

#### A. Entrada Manual:
- Clique no campo "Digite o endereço"
- Comece a digitar um endereço (ex: "Jaú, SP")
- Selecione uma sugestão do Google Places
- Clique em "Adicionar Local"

#### B. Upload de Arquivo:
- Clique em "Enviar arquivo de CEPs"
- Selecione um arquivo de texto no formato "CEP,Nome" (um por linha)
- Mostre como os endereços são adicionados automaticamente

### 3. Otimizar Rota

**Demonstre**: O cálculo de melhor rota (algoritmo TSP):

- Adicione pelo menos 3-4 locais
- Clique em "Otimizar Rota"
- Aponte para a animação da rota no mapa
- Explique que o algoritmo calcula a sequência ideal para percorrer todos os pontos

### 4. Informações de Rota

**Demonstre**: O resumo de informações da rota:

- Aponte para o painel "Resumo da Rota"
- Mostre a distância total e tempo estimado
- Destaque a sequência de visitas na ordem otimizada
- Explique o cálculo de tempo com base na velocidade média de 80km/h

### 5. Filtro de Datas

**Demonstre**: Filtro de eventos por data:

- Clique nos campos de data para abrir o seletor de datas
- Selecione um intervalo de datas (ex: próxima semana)
- Explique que os eventos são filtrados para mostrar apenas os que ocorrem nesse período
- Destaque que as datas padrão são do dia atual até 7 dias depois

### 6. Abas de Informação

**Demonstre**: As diferentes categorias de informação disponíveis:

#### A. Eventos:
- Clique na aba "Eventos"
- Mostre os eventos que ocorrem nas cidades ao longo da rota
- Destaque aniversários de cidades e outros eventos importantes

#### B. Restrições:
- Clique na aba "Restrições"
- Explique as restrições de circulação para caminhões nas cidades da rota
- Mostre como isso pode afetar o planejamento logístico

#### C. Pedágios e Balanças:
- Clique na aba "Pedágios/Balanças"
- Aponte para os pedágios e postos de pesagem ao longo da rota
- Explique como essas informações são úteis para planejamento de custos

### 7. Rota Personalizada (Nova Funcionalidade)

**Demonstre**: Como reordenar manualmente os pontos da rota:

- Clique no botão "Rota Personalizada"
- Mostre os botões de seta (↑ e ↓) que aparecem ao lado de cada destino
- Use as setas para reordenar alguns pontos
- Explique que a rota é recalculada automaticamente seguindo a ordem manual
- Destaque a flexibilidade que isso dá ao usuário para planejar rotas específicas

### 8. Responsividade (opcional)

**Demonstre**: A aplicação se adaptando a diferentes dispositivos:

- Redimensione a janela do navegador
- Mostre como a interface se ajusta para telas menores
- Destaque a usabilidade em dispositivos móveis

## Benefícios para Destacar

Ao longo da demonstração, reforce estes benefícios:

1. **Economia de tempo e combustível** através de rotas otimizadas
2. **Melhor planejamento logístico** com informações sobre eventos nas cidades
3. **Evitar problemas** por conhecer antecipadamente restrições de tráfego
4. **Previsibilidade de custos** com informações sobre pedágios
5. **Flexibilidade** na criação de rotas personalizadas
6. **Facilidade de uso** com interface intuitiva
7. **Aumento de produtividade** na operação de entrega/coleta

## Fechamento

Conclua enfatizando como o Otimizador de Rotas foi desenvolvido especificamente para a realidade brasileira e as necessidades específicas da Móveis Bonafé, permitindo operações mais eficientes e econômicas.