# Configuração do GitHub Pages

Para configurar corretamente o aplicativo no GitHub Pages, siga estas instruções:

## 1. Configurar o repositório

1. No seu repositório GitHub, vá para **Settings** (Configurações)
2. Role para baixo até a seção **GitHub Pages**
3. Em **Source**, selecione a branch principal (main/master)
4. Em **Folder**, selecione `/docs`
5. Clique em **Save**

## 2. Problemas Comuns e Soluções

### Problema: Layout pequeno (sidebar e mapa)
- Os tamanhos foram ajustados automaticamente pelo script fix-github.js
- A sidebar agora tem altura fixa e overflow-y: auto
- O mapa agora ocupa todo o espaço disponível no iframe

### Problema: Função Pegman desapareceu
- O parâmetro maptype=roadmap foi adicionado à URL do mapa
- O iframe agora tem tamanho suficiente para exibir todos os controles

### Problema: Campo de busca não funciona
- A função de busca foi reescrita para usar coordenadas precisas
- Agora verifica nomes de cidades no texto inserido
- Usa uma lista de cidades e suas coordenadas reais

### Problema: Coordenadas erradas ao importar arquivo
- Um mapeamento de CEPs para coordenadas reais foi implementado
- Os CEPs agora são vinculados a cidades específicas
- O formato do arquivo deve ser: CEP,nome (um por linha)

### Problema: GitHub Pages retorna 404
- Um arquivo 404.html foi adicionado para redirecionar automaticamente
- Certifique-se de que a configuração do GitHub Pages aponta para a pasta /docs

## 3. Exemplo de arquivo CEP para importação
```
14091-530,Pedro
17302-122,Luis
01415-002,Maria
13083-970,João
```

## 4. URL do GitHub Pages
Após a configuração, seu site estará disponível em:
https://[seu-usuario-github].github.io/[nome-do-repositorio]/