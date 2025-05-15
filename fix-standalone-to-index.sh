#!/bin/bash

# Script para sincronizar standalone.html com index.html
# Este script copia o conteúdo do standalone.html (que funciona) para index.html
# e então faz as modificações necessárias para garantir que funcione na URL raiz

echo "Iniciando sincronização de standalone.html para index.html..."

# 1. Backup do index.html atual
cp docs/index.html docs/index.html.bak.$(date +%Y%m%d%H%M%S)

# 2. Copiar standalone.html para index.html
cp docs/standalone.html docs/index.html

echo "Arquivo standalone.html copiado para index.html com sucesso!"

# 3. Atualizar possíveis caminhos relativos no index.html (se necessário)
# Não parece necessário no momento, pois os caminhos são os mesmos

# 4. Forçar o cache-busting do GitHub Pages
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "// Última atualização: $TIMESTAMP" > docs/cache-buster-$TIMESTAMP.js

# 5. Adicionar o script de cache-busting ao final do index.html
sed -i "s|</body>|<script src=\"cache-buster-$TIMESTAMP.js\"></script></body>|g" docs/index.html

# 6. Aplicar a correção da sidebar para evitar o tremor no carregamento
cat << 'EOF' > docs/sidebar-fix.js
/**
 * Script para corrigir o tremor da sidebar ao carregar a página
 */
(function() {
    // Executar assim que possível
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFixes);
    } else {
        applyFixes();
    }
    
    function applyFixes() {
        // Impedir o tremor da sidebar definindo o estilo imediatamente
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.position = 'absolute';
            sidebar.style.top = '0';
            sidebar.style.left = '0';
            sidebar.style.bottom = '0';
            sidebar.style.width = '380px';
            sidebar.style.maxWidth = '380px';
            sidebar.style.overflowY = 'auto';
            sidebar.style.zIndex = '10';
            sidebar.style.boxSizing = 'border-box';
        }
        
        // Ajustar o container do mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.position = 'absolute';
            mapContainer.style.top = '0';
            mapContainer.style.bottom = '60px';
            mapContainer.style.left = '380px';
            mapContainer.style.right = '0';
            mapContainer.style.overflow = 'hidden';
        }
        
        // Ajustar a barra de abas
        const bottomTabs = document.querySelector('.bottom-tabs-container');
        if (bottomTabs) {
            bottomTabs.style.position = 'absolute';
            bottomTabs.style.bottom = '0';
            bottomTabs.style.left = '380px';
            bottomTabs.style.right = '0';
            bottomTabs.style.height = '60px';
        }
        
        console.log("Layout estabilizado para evitar tremor");
    }
})();
EOF

# 7. Adicionar o script de correção ao index.html
sed -i "s|</body>|<script src=\"sidebar-fix.js\"></script></body>|g" docs/index.html

# 8. Criar script para expansão das abas
cat << 'EOF' > docs/tabs-fullscreen.js
/**
 * Script para garantir que as abas inferiores se expandam em tela cheia
 */
(function() {
    // Executar após o DOM estar carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabs);
    } else {
        initTabs();
    }
    
    function initTabs() {
        // Encontrar todos os botões de aba
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        if (!tabButtons.length) {
            console.warn("Botões de abas não encontrados, tentando novamente em 1s");
            setTimeout(initTabs, 1000);
            return;
        }
        
        console.log("Inicializando sistema de abas em tela cheia");
        
        // Adicionar handlers para cada botão
        tabButtons.forEach(button => {
            // Remover qualquer handler existente para evitar duplicação
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Adicionar novo handler
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId + '-content');
                
                // Verificar se esta aba já está ativa
                const isActive = this.classList.contains('active');
                const tabsContainer = document.querySelector('.bottom-tabs-container');
                const isExpanded = !tabsContainer.classList.contains('minimized');
                
                console.log("Clique na aba:", tabId, "Ativa:", isActive, "Expandida:", isExpanded);
                
                // Se a aba está ativa e expandida, minimizar
                if (isActive && isExpanded) {
                    minimizeTabs();
                    return;
                }
                
                // Desativar todas as abas
                tabButtons.forEach(btn => {
                    const newBtn = btn.cloneNode(false);
                    newBtn.textContent = btn.textContent;
                    newBtn.className = btn.className.replace(' active', '');
                    newBtn.setAttribute('data-tab', btn.getAttribute('data-tab'));
                    newBtn.addEventListener('click', arguments.callee);
                    btn.parentNode.replaceChild(newBtn, btn);
                });
                
                // Ocultar todos os conteúdos
                document.querySelectorAll('.bottom-tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Ativar esta aba
                this.classList.add('active');
                
                // Mostrar o conteúdo
                if (tabContent) {
                    // Expandir as abas se necessário
                    if (!isExpanded) {
                        expandTabs();
                    }
                    
                    tabContent.style.display = 'block';
                }
            });
        });
        
        console.log("Sistema de abas inicializado com sucesso");
    }
    
    function expandTabs() {
        console.log("Expandindo abas para tela cheia");
        
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (!tabsContainer) return;
        
        // Remover classe minimizada
        tabsContainer.classList.remove('minimized');
        
        // Aplicar estilos fullscreen
        tabsContainer.style.position = 'fixed';
        tabsContainer.style.top = '0';
        tabsContainer.style.left = '380px'; // Alinhado com a sidebar
        tabsContainer.style.right = '0';
        tabsContainer.style.bottom = '0';
        tabsContainer.style.width = 'calc(100% - 380px)';
        tabsContainer.style.height = '100%';
        tabsContainer.style.zIndex = '9999';
        tabsContainer.style.backgroundColor = 'white';
        
        // Esconder o mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'hidden';
        }
    }
    
    function minimizeTabs() {
        console.log("Minimizando abas");
        
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (!tabsContainer) return;
        
        // Adicionar classe minimizada
        tabsContainer.classList.add('minimized');
        
        // Restaurar estilos originais
        tabsContainer.style.position = 'absolute';
        tabsContainer.style.top = 'auto';
        tabsContainer.style.bottom = '0';
        tabsContainer.style.left = '380px';
        tabsContainer.style.height = '60px';
        
        // Desativar todas as abas
        document.querySelectorAll('.bottom-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Ocultar todos os conteúdos
        document.querySelectorAll('.bottom-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Mostrar o mapa novamente
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.visibility = 'visible';
        }
    }
})();
EOF

# 9. Adicionar o script de abas ao index.html
sed -i "s|</body>|<script src=\"tabs-fullscreen.js\"></script></body>|g" docs/index.html

# 10. Adicionar os novos arquivos ao Git
git add docs/index.html docs/sidebar-fix.js docs/tabs-fullscreen.js docs/cache-buster-$TIMESTAMP.js

# 11. Fazer o commit
git commit -m "Sincronização do standalone.html para index.html com correções de tremor e abas fullscreen"

# 12. Enviar para o GitHub
git push

echo "✅ Sincronização completa!"
echo "⏳ Aguarde alguns minutos para que o GitHub Pages seja atualizado."
echo "🔄 A versão index.html agora deve funcionar corretamente, sem tremor e com abas em tela cheia."