# Sistema de Planejamento de Rotas

Aplicação para planejamento e otimização de rotas para transportadoras, utilizando o algoritmo do caixeiro viajante para calcular a rota mais curta entre vários destinos a partir de um ponto de origem em Dois Córregos-SP.

## Características

- Interface intuitiva para adicionar locais através de CEPs ou busca de endereços
- Algoritmo de otimização de rotas calculando o melhor percurso
- Exibição de pedágios e balanças de pesagem no caminho da rota
- Filtro de eventos e restrições por data e cidades
- Informações detalhadas da rota com relatório compartilhável
- Compatibilidade com todos os recursos do Google Maps (Street View, types de mapa, etc)
- Possibilidade de nomear rotas para melhor organização

## Tecnologias

- React com TypeScript
- Google Maps API (v3.58)
- Express.js para o backend
- Armazenamento em memória para demonstração

## Executando o projeto localmente

1. Clone este repositório
2. Instale as dependências com `npm install`
3. Configure a chave API do Google Maps em `.env`
4. Execute o servidor com `npm run dev`
5. Acesse a aplicação em `http://localhost:5000`

## Deploy no GitHub Pages

A aplicação pode ser implantada no GitHub Pages usando o script de deploy fornecido, que criará uma versão estática usando dados simulados em vez de depender do backend Express.

### Pré-requisitos para o Deploy

- Chave de API do Google Maps. Você pode obtê-la no [Google Cloud Console](https://console.cloud.google.com/) com o seguinte serviço ativado:
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Directions API

### Passos para Deploy

1. Edite o arquivo `.env.github` e substitua `YOUR_GOOGLE_MAPS_API_KEY` pela sua chave de API do Google Maps.

2. Torne o script de deploy executável:
   ```bash
   chmod +x deploy-github.sh
   ```

3. Execute o script de deploy:
   ```bash
   ./deploy-github.sh
   ```

4. O script criará uma pasta `docs/` com todos os arquivos necessários para o GitHub Pages.

5. Faça commit das mudanças e envie para o seu repositório GitHub:
   ```bash
   git add docs/ .env.github
   git commit -m "Add GitHub Pages deployment"
   git push
   ```

6. Vá para as configurações do seu repositório no GitHub, navegue até a seção "GitHub Pages" e selecione a pasta "docs" como fonte:
   - Settings > Pages > Source > "Deploy from a branch" > Branch: main, Folder: /docs

7. Após alguns minutos, seu site estará disponível em `https://seu-usuario.github.io/seu-repositorio/`.

## Limitações da versão GitHub Pages

A versão publicada no GitHub Pages usa dados simulados e tem as seguintes limitações:

- Não há persistência de dados entre sessões
- Não é possível adicionar novos pontos de interesse ou veículos
- A otimização de rota é simplificada comparada à versão completa
- Algumas funcionalidades avançadas podem não estar disponíveis

Para obter a experiência completa, execute o projeto localmente conforme as instruções acima.

## Licença

Este projeto está licenciado sob a Licença MIT.