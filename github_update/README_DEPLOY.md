# Instruções para Deploy no GitHub Pages

Para ajustar a URL e corrigir o layout da aplicação, siga os passos abaixo:

## 1. Substituir o index.html atual

O arquivo `index.html` atual serve apenas como uma página de entrada para a aplicação. Para ter a aplicação carregada diretamente na URL base, você precisa substituir o atual `index.html` pelo conteúdo do `standalone.html`.

### Passos:
1. Faça backup do arquivo `index.html` atual (renomeie para `entrada.html` se quiser manter)
2. Renomeie `standalone.html` para `index.html`
3. Faça commit e push dessas alterações para o GitHub

## 2. Atualizar links internos

Certifique-se de que todos os links internos no novo `index.html` estejam apontando para os caminhos corretos:

- Verifique se importações de CSS e JavaScript usam caminhos relativos (`./js/`, `./css/`)
- Se houver links para o próprio arquivo (`standalone.html`), atualize para `index.html` ou `./`

## 3. Corrigir o layout da sidebar

Para corrigir o problema da sidebar e garantir que ela ocupe toda a altura disponível até a barra inferior:

1. Certifique-se de que o CSS a seguir esteja incluído no arquivo `index.html`:

```css
/* Container global para absoluto */
.app-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

/* Área de conteúdo principal com posicionamento absoluto */
.main-content-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 60px; /* Altura fixa para barra inferior */
    display: flex;
    overflow: hidden;
}

/* Sidebar com posicionamento absoluto e altura fixa */
.sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 380px;
    padding: 20px;
    background-color: #f8f9fa;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

/* Área do mapa alinhada à sidebar */
.map-container {
    position: absolute;
    top: 0;
    left: 380px; /* Largura da sidebar */
    right: 0;
    bottom: 0;
    overflow: hidden;
}

/* Elemento do mapa preenchendo container */
#map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* Barra inferior com abas */
.bottom-tabs-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px; /* Altura fixa */
    background-color: #f1f3f5;
    border-top: 1px solid #dee2e6;
    z-index: 20;
    overflow: hidden;
}

/* Ajuste para telas menores */
@media (max-width: 768px) {
    .sidebar {
        width: 320px;
    }
    
    .map-container {
        left: 320px;
    }
    
    .bottom-tabs-container {
        left: 320px;
        width: calc(100% - 320px);
    }
}
```

## 4. Configuração do repositório no GitHub

Verifique se as configurações do GitHub Pages estão corretas:

1. No repositório GitHub, vá para **Settings** > **Pages**
2. Em **Source**, certifique-se de que está selecionada a branch `main` (ou `master`) e o diretório `/docs`
3. Clique em **Save** se precisar fazer alterações

Após essas alterações, a aplicação será carregada diretamente na URL `https://moveisbonafe.github.io/RotasMoveisBonafe/` sem a necessidade de adicionar `standalone.html` no final.