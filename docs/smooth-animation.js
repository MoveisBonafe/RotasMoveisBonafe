/**
 * Script para adicionar animações suaves nas abas inferiores
 * Este script melhora a experiência do usuário com transições
 * mais elegantes ao expandir e minimizar as abas
 * @version 1.2.0
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
            tabsContainer.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
            console.log("[SmoothAnimations] Adicionadas transições ao container de abas");
            
            // Adicionar elemento de progresso para indicar o carregamento
            addProgressIndicator(tabsContainer);
            
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
            enhanceTabButtons();
            
            // Aplicar transições aos conteúdos
            const tabContents = document.querySelectorAll('.bottom-tab-content');
            tabContents.forEach(function(content) {
                content.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-out";
                content.style.opacity = '0';
                content.style.transform = 'translateY(10px)';
                
                // Adicionar animações de entrada para cards e elementos importantes
                enhanceContentElements(content);
            });
            
            console.log("[SmoothAnimations] Configurações de animação aplicadas com sucesso");
        } else {
            console.warn("[SmoothAnimations] Container de abas não encontrado");
            // Tentar novamente após um tempo
            setTimeout(initAnimations, 1000);
        }
    }
    
    // Adicionar indicador de progresso
    function addProgressIndicator(container) {
        // Criar elemento indicador de progresso
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-indicator-container';
        progressContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: rgba(0,0,0,0.05);
            overflow: hidden;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 100;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-indicator-bar';
        progressBar.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #ffc107, #ff9800);
            transition: width 0.3s ease-out;
        `;
        
        progressContainer.appendChild(progressBar);
        container.appendChild(progressContainer);
        
        // Função para mostrar/esconder o indicador de progresso
        window.showProgressIndicator = function() {
            progressContainer.style.opacity = '1';
            progressBar.style.width = '0%';
            
            // Animar o progresso
            let width = 0;
            const interval = setInterval(function() {
                width += 5;
                if (width > 90) {
                    clearInterval(interval);
                    return;
                }
                progressBar.style.width = width + '%';
            }, 100);
            
            // Guardar o intervalo para poder cancelar
            progressContainer.dataset.interval = interval;
        };
        
        window.hideProgressIndicator = function() {
            // Completar o progresso
            progressBar.style.width = '100%';
            
            // Limpar o intervalo anterior
            if (progressContainer.dataset.interval) {
                clearInterval(parseInt(progressContainer.dataset.interval));
            }
            
            // Esconder após a animação
            setTimeout(function() {
                progressContainer.style.opacity = '0';
                setTimeout(function() {
                    progressBar.style.width = '0%';
                }, 300);
            }, 300);
        };
    }
    
    // Melhorar botões das abas com animações
    function enhanceTabButtons() {
        const tabButtons = document.querySelectorAll('.bottom-tab-btn');
        tabButtons.forEach(function(button) {
            button.style.transition = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
            
            // Adicionar efeito de ripple nos botões
            button.addEventListener('click', function(e) {
                // Mostrar indicador de progresso
                if (window.showProgressIndicator) {
                    window.showProgressIndicator();
                }
                
                // Efeito de ripple
                createRippleEffect(e, this);
                
                // Adicionar classe para controlar a exibição do conteúdo
                const tabId = this.getAttribute('data-tab');
                const contentElem = document.getElementById(tabId + '-content');
                
                if (contentElem) {
                    // Esconder todos os conteúdos com animação
                    document.querySelectorAll('.bottom-tab-content').forEach(function(content) {
                        content.classList.remove('active-content');
                        content.style.opacity = '0';
                        content.style.transform = 'translateY(10px)';
                    });
                    
                    // Mostrar apenas o conteúdo selecionado
                    contentElem.classList.add('active-content');
                    
                    // Animar a entrada do conteúdo
                    setTimeout(function() {
                        contentElem.style.opacity = '1';
                        contentElem.style.transform = 'translateY(0)';
                        
                        // Animar os elementos internos sequencialmente
                        animateContentElementsSequentially(contentElem);
                        
                        // Esconder o indicador de progresso
                        if (window.hideProgressIndicator) {
                            window.hideProgressIndicator();
                        }
                    }, 150);
                }
            });
            
            // Melhorar interação com efeitos de hover
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
    }
    
    // Criar efeito ripple ao clicar
    function createRippleEffect(e, element) {
        // Verificar se já existe um ripple
        const ripple = element.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }
        
        // Criar novo elemento ripple
        const circle = document.createElement('span');
        circle.className = 'ripple';
        circle.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            animation: ripple-animation 0.6s ease-out forwards;
        `;
        
        // Criar animação se não existir
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple-animation {
                    0% {
                        width: 0;
                        height: 0;
                        opacity: 0.5;
                    }
                    100% {
                        width: 200px;
                        height: 200px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Posicionar o efeito onde houve o clique
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        
        // Adicionar ao elemento e remover após a animação
        element.appendChild(circle);
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
    
    // Melhorar elementos dentro do conteúdo com animações
    function enhanceContentElements(contentElement) {
        // Adicionar classes e estilos para elementos importantes
        const items = contentElement.querySelectorAll('.list-group-item, .card, .btn, h3, h4, p');
        items.forEach((item, index) => {
            item.classList.add('animated-item');
            item.style.opacity = '0';
            item.style.transform = 'translateY(15px)';
            item.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            item.dataset.animationIndex = index;
        });
    }
    
    // Animar elementos sequencialmente
    function animateContentElementsSequentially(contentElement) {
        const items = contentElement.querySelectorAll('.animated-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 50 + (index * 30)); // 30ms de atraso entre cada item
        });
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
        
        // Mostrar indicador de progresso
        if (window.showProgressIndicator) {
            window.showProgressIndicator();
        }
        
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
                
                // Animar elementos internos sequencialmente
                animateContentElementsSequentially(activeContent);
                
                // Esconder o indicador de progresso
                if (window.hideProgressIndicator) {
                    window.hideProgressIndicator();
                }
            }, 200);
        }
    }
    
    // Animar a minimização das abas
    function animateMinimization(container) {
        console.log("[SmoothAnimations] Animando minimização");
        
        // Mostrar indicador de progresso
        if (window.showProgressIndicator) {
            window.showProgressIndicator();
        }
        
        // Esconder conteúdos com animação de saída
        const contents = container.querySelectorAll('.bottom-tab-content');
        contents.forEach(function(content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(10px)';
        });
        
        // Esconder o indicador de progresso após a animação
        setTimeout(function() {
            if (window.hideProgressIndicator) {
                window.hideProgressIndicator();
            }
        }, 300);
    }
    
    // Exportar funções para o escopo global (para depuração e interoperabilidade)
    window.smoothAnimations = {
        init: initAnimations,
        animateExpansion: animateExpansion,
        animateMinimization: animateMinimization,
        addProgressIndicator: addProgressIndicator,
        showProgress: function() { if (window.showProgressIndicator) window.showProgressIndicator(); },
        hideProgress: function() { if (window.hideProgressIndicator) window.hideProgressIndicator(); }
    };
})();