/**
 * Script para fix completo das abas inferiores - solução definitiva
 * Este script reescreve completamente o comportamento das abas
 * para garantir que apenas uma aba seja mostrada por vez
 */
(function() {
    // Executar quando o DOM estiver pronto
    document.addEventListener("DOMContentLoaded", function() {
        // Dar tempo para outros scripts carregarem
        setTimeout(initTabsFix, 300);
    });
    
    // Função principal de inicialização
    function initTabsFix() {
        console.log("[TabsFix] Aplicando correção definitiva para abas");
        
        // Capturar elementos
        const tabsContainer = document.querySelector(".bottom-tabs-container");
        const tabButtons = document.querySelectorAll(".bottom-tab-btn");
        const tabContents = document.querySelectorAll(".bottom-tab-content");
        
        if (!tabsContainer || tabButtons.length === 0) {
            console.warn("[TabsFix] Elementos não encontrados, tentando novamente em 500ms");
            setTimeout(initTabsFix, 500);
            return;
        }
        
        // Forçar ocultação de todos os conteúdos de abas
        hideTabs();
        
        // Remover handlers antigos substituindo os botões
        tabButtons.forEach(function(button) {
            // Clone para remover handlers existentes
            const clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);
            
            // Adicionar novo handler
            clone.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleTabClick(this);
            });
        });
        
        // Adicionar estilo inline para garantir o comportamento correto
        addOverrideStyles();
        
        console.log("[TabsFix] Correção aplicada com sucesso");
    }
    
    // Manipular clique nas abas
    function handleTabClick(button) {
        console.log("[TabsFix] Clique em aba detectado");
        
        // Obter referências
        const tabsContainer = document.querySelector(".bottom-tabs-container");
        const tabId = button.getAttribute("data-tab");
        const allButtons = document.querySelectorAll(".bottom-tab-btn");
        const allContents = document.querySelectorAll(".bottom-tab-content");
        const targetContent = document.getElementById(tabId + "-content");
        
        // Verificar se a aba está ativa
        const isAlreadyActive = button.classList.contains("active");
        const isExpanded = !tabsContainer.classList.contains("minimized");
        
        // Se a aba estiver ativa e expandida, minimizar
        if (isAlreadyActive && isExpanded) {
            console.log("[TabsFix] Minimizando aba ativa");
            minimizeTabs();
            return;
        }
        
        // Remover classe ativa de todos os botões
        allButtons.forEach(btn => {
            btn.classList.remove("active");
        });
        
        // Adicionar classe ativa ao botão clicado
        button.classList.add("active");
        
        // Forçar esconder todos os conteúdos primeiro
        hideTabs();
        
        // Se a aba estiver minimizada, expandir
        if (!isExpanded) {
            expandTabs();
        }
        
        // Mostrar apenas o conteúdo alvo
        if (targetContent) {
            targetContent.style.display = "block";
            targetContent.classList.add("active-content");
            
            // Aplicar altura e scroll para o conteúdo
            targetContent.style.height = "calc(100vh - 60px)";
            targetContent.style.overflowY = "auto";
            targetContent.style.padding = "15px";
            
            console.log("[TabsFix] Exibindo conteúdo: " + tabId);
        }
    }
    
    // Forçar esconder todos os conteúdos das abas
    function hideTabs() {
        console.log("[TabsFix] Ocultando todos os conteúdos de abas");
        const tabContents = document.querySelectorAll(".bottom-tab-content");
        
        tabContents.forEach(content => {
            content.style.display = "none";
            content.classList.remove("active-content");
        });
    }
    
    // Expandir o container de abas
    function expandTabs() {
        console.log("[TabsFix] Expandindo container de abas");
        const tabsContainer = document.querySelector(".bottom-tabs-container");
        
        if (!tabsContainer) return;
        
        // Remover classe para minimizado
        tabsContainer.classList.remove("minimized");
        
        // Aplicar estilos de tela cheia
        Object.assign(tabsContainer.style, {
            position: "fixed",
            top: "0",
            left: "380px",
            right: "0",
            bottom: "0",
            width: "calc(100% - 380px)",
            height: "100vh",
            zIndex: "9999",
            backgroundColor: "white",
            borderLeft: "3px solid #ffc107",
            boxShadow: "0 0 20px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column"
        });
        
        // Ajustar para telas menores
        if (window.innerWidth <= 768) {
            tabsContainer.style.left = "320px";
            tabsContainer.style.width = "calc(100% - 320px)";
        }
        
        // Esconder o mapa
        const mapContainer = document.querySelector(".map-container");
        if (mapContainer) {
            mapContainer.style.visibility = "hidden";
        }
    }
    
    // Minimizar o container de abas
    function minimizeTabs() {
        console.log("[TabsFix] Minimizando container de abas");
        const tabsContainer = document.querySelector(".bottom-tabs-container");
        
        if (!tabsContainer) return;
        
        // Adicionar classe para minimizado
        tabsContainer.classList.add("minimized");
        
        // Restaurar estilos originais
        Object.assign(tabsContainer.style, {
            position: "absolute",
            top: "auto",
            left: "380px",
            right: "0",
            bottom: "0",
            height: "60px",
            width: "calc(100% - 380px)",
            zIndex: "100",
            backgroundColor: "#f9f9f9",
            borderLeft: "none",
            boxShadow: "none",
            display: "block"
        });
        
        // Ajustar para telas menores
        if (window.innerWidth <= 768) {
            tabsContainer.style.left = "320px";
            tabsContainer.style.width = "calc(100% - 320px)";
        }
        
        // Esconder todos os conteúdos
        hideTabs();
        
        // Remover classe ativa de todos os botões
        const allButtons = document.querySelectorAll(".bottom-tab-btn");
        allButtons.forEach(btn => {
            btn.classList.remove("active");
        });
        
        // Mostrar o mapa novamente
        const mapContainer = document.querySelector(".map-container");
        if (mapContainer) {
            mapContainer.style.visibility = "visible";
        }
        
        // Forçar o redesenho do mapa
        if (window.google && window.google.maps && window.map) {
            setTimeout(function() {
                google.maps.event.trigger(window.map, "resize");
            }, 100);
        }
    }
    
    // Adicionar estilos inline para garantir comportamento
    function addOverrideStyles() {
        const style = document.createElement("style");
        style.id = "tabs-fix-style";
        style.textContent = `
            /* Garantir que as abas não apareçam todas juntas */
            .bottom-tab-content {
                display: none !important;
            }
            
            /* Mostrar apenas a aba ativa */
            .bottom-tab-content.active-content {
                display: block !important;
            }
            
            /* Forçar layout correto para o container quando expandido */
            .bottom-tabs-container:not(.minimized) {
                display: flex !important;
                flex-direction: column !important;
            }
            
            /* Garantir que botões ficam no topo */
            .bottom-tabs-nav {
                flex-shrink: 0;
            }
            
            /* Garantir que o conteúdo ocupa o espaço disponível */
            .bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content {
                flex: 1;
                overflow-y: auto;
                width: 100% !important;
                height: calc(100vh - 60px) !important;
            }
            
            /* Impedir que a classe active sozinha faça elementos aparecerem */
            .bottom-tab-content.active:not(.active-content) {
                display: none !important;
            }
        `;
        
        // Remover versão anterior se existir
        const oldStyle = document.getElementById("tabs-fix-style");
        if (oldStyle) {
            oldStyle.parentNode.removeChild(oldStyle);
        }
        
        // Adicionar a nova versão
        document.head.appendChild(style);
    }
    
    // Executar a cada 2 segundos para garantir que a correção se mantenha
    // mesmo se outros scripts tentarem modificar o comportamento
    setInterval(function() {
        const tabsContainer = document.querySelector(".bottom-tabs-container");
        if (tabsContainer && !tabsContainer.classList.contains("minimized")) {
            // Checar se há mais de um conteúdo visível
            const visibleContents = Array.from(
                document.querySelectorAll(".bottom-tab-content")
            ).filter(content => {
                return content.style.display === "block" || 
                       window.getComputedStyle(content).display !== "none";
            });
            
            if (visibleContents.length > 1) {
                console.warn("[TabsFix] Detectados múltiplos conteúdos visíveis, corrigindo...");
                
                // Manter apenas o conteúdo ativo
                const activeButton = document.querySelector(".bottom-tab-btn.active");
                if (activeButton) {
                    const tabId = activeButton.getAttribute("data-tab");
                    const targetContent = document.getElementById(tabId + "-content");
                    
                    // Esconder todos e mostrar apenas o alvo
                    hideTabs();
                    if (targetContent) {
                        targetContent.style.display = "block";
                        targetContent.classList.add("active-content");
                    }
                } else {
                    // Se nenhum botão estiver ativo, minimizar tudo
                    minimizeTabs();
                }
            }
        }
    }, 2000);
})();
