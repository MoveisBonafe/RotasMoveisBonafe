INSTRUÇÕES PARA ATUALIZAÇÃO DO GITHUB PAGES
===========================================

ATENÇÃO! DUAS VERSÕES DE ARQUIVOS ESTÃO INCLUÍDAS:

1. standalone.html - Usa caminhos absolutos (/RotasMoveisBonafe/docs/js/...)
2. standalone-relative.html - Usa caminhos relativos (./js/...)

PRIMEIRO TENTE USAR A VERSÃO COM CAMINHOS ABSOLUTOS:
- Faça upload de todos os arquivos como estão
- Teste standalone.html no seu GitHub Pages

SE NÃO FUNCIONAR, TENTE:
- Renomear standalone-relative.html para standalone.html
- Fazer upload e testar novamente

ESTRUTURA CORRETA DOS ARQUIVOS:
- docs/
  - js/
    - tsp.js
    - geocode-fix.js
    - map-controls.js
    - route-optimizer.js
    - fix-github.js
    - fix-map-controls.js
    - cep-database.js
  - assets/
    - manifest.json
  - generated-icon.png
  - standalone.html

IMPORTANTE: Verifique se a estrutura de pastas no GitHub está exatamente como acima.
