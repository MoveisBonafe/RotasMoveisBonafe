/**
 * Este script corrige os caminhos dos arquivos para funcionamento no GitHub Pages
 * - Verifica o ambiente de execução e ajusta as referências conforme necessário
 * - Deve ser o primeiro script a ser carregado após os frameworks básicos
 */

(function() {
    // Detectar se estamos no GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Base path para GitHub Pages
    const basePath = isGitHubPages ? '/RotasMoveisBonafe/docs/' : './';
    
    // Função para carregar um script dinamicamente com o caminho correto
    function loadScript(scriptName) {
        const script = document.createElement('script');
        script.src = basePath + 'js/' + scriptName;
        script.async = false; // Manter ordem de execução
        document.head.appendChild(script);
        console.log('Carregando script: ' + basePath + 'js/' + scriptName);
    }
    
    // Lista de scripts a serem carregados na ordem correta
    const scripts = [
        'tsp.js',
        'geocode-fix.js',
        'map-controls.js',
        'route-optimizer.js',
        'fix-github.js',
        'fix-map-controls.js',
        'cep-database.js'
    ];
    
    // Carregar scripts em sequência
    scripts.forEach(script => loadScript(script));
    
    // Função para corrigir outros recursos
    function fixResourcePaths() {
        // Corrigir manifest.json
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            manifestLink.href = basePath + 'assets/manifest.json';
        }
        
        // Corrigir ícone
        const iconLink = document.querySelector('link[href$="generated-icon.png"]');
        if (iconLink) {
            iconLink.href = basePath + 'generated-icon.png';
        }
    }
    
    // Aplicar correções quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', fixResourcePaths);
})();