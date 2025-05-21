/**
 * Script para adicionar animações suaves nas abas inferiores
 * Este script melhora a experiência do usuário com transições
 * mais elegantes ao expandir e minimizar as abas
 */
(function() {
    // Aguardar o DOM estar pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Dar um pequeno atraso para garantir que outros scripts já rodaram
        setTimeout(initAnimations, 500);
    });
    
    // Inicializar as animações
    function initAnimations() {
        console.log("[SmoothAnimations] Inicializando animações suaves");
        
        // Adicionar estilos de transição ao container de abas
        const tabsContainer = document.querySelector('.bottom-tabs-container');
        if (tabsContainer) {
            // Definir as transições
            tabsContainer.style.transition = "all 0.35s ease-in-out";
            console.log("[SmoothAnimations] Adicionadas transições ao container de abas");
            
            // Monitorar mudanças de classe para aplicar animações específicas
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class') {
                        handleClassChange(tabsContainer);
                    }
                });
            });
            
            // Configurar observador para mudanças na classe
            observer.observe(tabsContainer, { attributes: true });
            
            // Adicionar animações aos botões das abas
            const tabButtons = document.querySelectorAll('.bottom-tab-btn');
            tabButtons.forEach(function(button) {
                button.style.transition = "all 0.25s ease-out";
                
                // Animação de hover
                button.addEventListener('mouseenter', function() {
                    this.style.transform = "translateY(-2px)";
                });
                
                button.addEventListener('mouseleave', function() {
                    this.style.transform = "translateY(0)";
                });
                
                // Animação de clique
                button.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    const contentElem = document.getElementById(tabId + '-content');
                    
                    if (contentElem) {
                        // Adicionar classe para controlar a exibição
                        document.querySelectorAll('.bottom-tab-content').forEach(function(content) {
                            content.classList.remove('active-content');
                            // Definir opacidade 0 para animação de fade
                            content.style.opacity = '0';
                        });
                        
                        // Aplicar fade-in no conteúdo selecionado
                        contentElem.classList.add('active-content');
                        setTimeout(function() {
                            contentElem.style.opacity = '1';
                        }, 50);
                    }
                });
            });
            
            // Aplicar transições aos conteúdos
            const tabContents = document.querySelectorAll('.bottom-tab-content');
            tabContents.forEach(function(content) {
                content.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-out";
                content.style.opacity = '0';
                content.style.transform = 'translateY(10px)';
            });
            
            console.log("[SmoothAnimations] Configurações de animação aplicadas com sucesso");
        } else {
            console.warn("[SmoothAnimations] Container de abas não encontrado");
            // Tentar novamente após um tempo
            setTimeout(initAnimations, 1000);
        }
    }
    
    // Lidar com mudanças de classe para animar expansão/contração
    function handleClassChange(container) {
        const isExpanded = !container.classList.contains('minimized');
        
        if (isExpanded) {
            // Animação para expansão
            animateExpansion(container);
        } else {
            // Animação para contração
            animateMinimization(container);
        }
    }
    
    // Animar a expansão das abas
    function animateExpansion(container) {
        console.log("[SmoothAnimations] Animando expansão");
        
        // Aplicar animação de entrada nos conteúdos
        const activeContent = container.querySelector('.bottom-tab-content.active-content');
        if (activeContent) {
            // Reset primeiro para que a animação funcione
            activeContent.style.opacity = '0';
            activeContent.style.transform = 'translateY(20px)';
            
            // Aplicar animação com delay para criar efeito sequencial
            setTimeout(function() {
                activeContent.style.opacity = '1';
                activeContent.style.transform = 'translateY(0)';
            }, 150);
        }
    }
    
    // Animar a minimização das abas
    function animateMinimization(container) {
        console.log("[SmoothAnimations] Animando minimização");
        
        // Esconder conteúdos com animação de saída
        const contents = container.querySelectorAll('.bottom-tab-content');
        contents.forEach(function(content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(10px)';
        });
    }
    
    // Exportar funções para o escopo global (para depuração e interoperabilidade)
    window.smoothAnimations = {
        init: initAnimations,
        animateExpansion: animateExpansion,
        animateMinimization: animateMinimization
    };
})();