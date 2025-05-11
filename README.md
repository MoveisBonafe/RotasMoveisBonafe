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

A aplicação pode ser implantada no GitHub Pages de duas maneiras diferentes:

### Opção 1: Usando o Script de Deploy (Recomendado para implantação completa)

#### Pré-requisitos para o Deploy

- Chave de API do Google Maps. Você pode obtê-la no [Google Cloud Console](https://console.cloud.google.com/) com o seguinte serviço ativado:
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Directions API

#### Passos para Deploy

1. A chave API já está configurada no arquivo `.env.github`. Caso precise atualizar, substitua o valor existente pela sua chave.

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

### Opção 2: Usando a Versão Estática Simplificada (Garantidamente funcional)

Se encontrar problemas com a versão completa no GitHub Pages (como erros 404 para arquivos CSS), use a versão simplificada:

1. Uma versão estática HTML totalmente funcional já está preparada na pasta `static_github_version`.

2. Para usar esta versão no GitHub Pages:
   ```bash
   # Copie a versão estática para a pasta docs
   rm -rf docs
   cp -r static_github_version docs
   
   # Faça commit e envie para o GitHub
   git add docs/
   git commit -m "Add static GitHub Pages version"
   git push
   ```

3. Configure o GitHub Pages para usar a pasta `/docs` conforme o passo 6 acima.

Esta versão estática é um único arquivo HTML com todo o necessário embutido e garante compatibilidade máxima com GitHub Pages.

## Limitações da versão GitHub Pages

A versão publicada no GitHub Pages usa dados simulados e tem as seguintes limitações:

- Não há persistência de dados entre sessões
- Não é possível adicionar novos pontos de interesse ou veículos
- A otimização de rota é simplificada comparada à versão completa
- Algumas funcionalidades avançadas podem não estar disponíveis

Para obter a experiência completa, execute o projeto localmente conforme as instruções acima.

## Licença

Este projeto está licenciado sob a Licença MIT.