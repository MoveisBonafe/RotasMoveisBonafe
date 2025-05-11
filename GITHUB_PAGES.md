# Instruções para Deploy da Aplicação no GitHub Pages

Este documento fornece instruções detalhadas para implantar a aplicação de Planejamento de Rotas no GitHub Pages.

## Visão Geral

A nossa aplicação combina um frontend React com um backend Express. No ambiente de produção do GitHub Pages, não podemos executar um servidor Node.js, então criamos uma versão especial da aplicação que:

1. Usa dados simulados em vez de chamar o backend
2. Mantém todas as funcionalidades principais do frontend
3. Permite a visualização e interação com o mapa e rotas

## Passos para Deploy

### 1. Configurar a Chave de API do Google Maps

Esta aplicação requer uma chave de API do Google Maps para funcionar. Você precisa:

- Criar uma conta no Google Cloud Platform
- Criar um projeto e habilitar a API do Google Maps
- Gerar uma chave de API
- Configurar a restrição HTTP para seu domínio (importante para segurança)

Após obter sua chave, edite o arquivo `.env.github` e substitua `YOUR_GOOGLE_MAPS_API_KEY` pela sua chave real.

### 2. Executar o Script de Build

O script `deploy-github.sh` automatiza todo o processo de build para o GitHub Pages:

```bash
# Torne o script executável
chmod +x deploy-github.sh

# Execute o script
./deploy-github.sh
```

Este script irá:
- Configurar as variáveis de ambiente necessárias
- Construir uma versão otimizada da aplicação
- Copiar os arquivos para uma pasta `docs/`
- Criar arquivos necessários para o GitHub Pages (como o 404.html para roteamento SPA)

### 3. Configurar o Repositório GitHub

Depois de executar o script e fazer commit dos arquivos no repositório:

1. Vá para a página do seu repositório no GitHub
2. Clique em "Settings"
3. Role para baixo até encontrar a seção "GitHub Pages"
4. Na seção "Source", selecione a branch principal (main ou master)
5. Na dropdown ao lado, selecione a pasta `/docs`
6. Clique em "Save"

Após alguns minutos, seu site estará disponível no URL fornecido pelo GitHub (geralmente `https://[seu-usuario].github.io/[nome-do-repositorio]/`).

### 4. Verificar a Implantação

Depois que o GitHub Pages terminar o deploy, visite o URL fornecido e verifique se:

- O mapa carrega corretamente
- Você pode adicionar localizações
- Você pode calcular rotas
- As funcionalidades principais estão operacionais

### Solução de Problemas Comuns

Se encontrar problemas:

1. **Mapa não carrega**:
   - Verifique se a chave API do Google Maps está correta
   - Confirme que a chave não tem restrições que bloqueiam seu domínio
   - A chave já está configurada no arquivo `.env.github`

2. **Erro 404 ao navegar diretamente para uma rota**:
   - Verifique se o arquivo `404.html` foi criado corretamente na pasta `docs/`
   - Este problema é automaticamente resolvido pelo script de deploy

3. **Interface carrega, mas sem dados**:
   - Verifique o console do navegador para erros
   - Confirme que os dados simulados estão sendo carregados corretamente

4. **Erro "Failed to load stylesheet"**:
   - Este erro ocorre porque o Vite cria links absolutos para os arquivos CSS/JS
   - O script de deploy corrige automaticamente todos os caminhos para serem relativos
   - Se o erro persistir, siga estas etapas:
     1. Navegue até a pasta `docs/`
     2. Abra o arquivo `index.html` em um editor
     3. Procure por referências como `href="/assets/..."` e mude para `href="./assets/..."`
     4. Faça o mesmo com os arquivos CSS na pasta `docs/assets/`
     5. Repita o processo para os atributos `src=` em scripts

---

Para qualquer dúvida adicional ou problemas, consulte a documentação completa no arquivo README.md ou abra uma issue no repositório GitHub.