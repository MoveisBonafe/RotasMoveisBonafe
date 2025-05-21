#!/bin/bash
# Script para copiar arquivos do Replit para o repositório GitHub local

echo "=== Script para atualizar arquivos no GitHub Pages ==="
echo "Execute este script no diretório raiz do seu repositório GitHub clone local"

# Destino onde os arquivos serão copiados (ajuste conforme necessário)
DEST_DIR="docs"

# Criar o diretório de destino se não existir
mkdir -p "$DEST_DIR"

echo "Copiando arquivos para o diretório $DEST_DIR..."

# Lista de arquivos para copiar
echo "# Copiando tabs-fix.js"
echo '/**
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
            
            /* Impedir que a classe 'active' sozinha faça elementos aparecerem */
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
})();' > "$DEST_DIR/tabs-fix.js"


echo "# Copiando styles-fix.css"
echo '/**
 * Correção de estilos para as abas inferiores no GitHub Pages
 * Garante que apenas o conteúdo da aba selecionada seja mostrado
 * Adiciona animações suaves para melhorar a experiência do usuário
 * @version 1.2.0
 */

/* Ocultar todas as abas por padrão */
.bottom-tab-content {
  display: none !important;
}

/* Mostrar apenas a aba que possui a classe "active-content" */
.bottom-tab-content.active-content {
  display: block !important;
}

/* Remover qualquer estilo que possa fazer as abas aparecerem lado a lado */
.bottom-tabs-container:not(.minimized) {
  display: flex !important;
  flex-direction: column !important;
  
  /* Animação de expansão e contração */
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
  
  /* Adicionar efeito de elevação para destacar do fundo */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15) !important;
  
  /* Adicionar borda com estilo moderno */
  border-left: 3px solid #ffc107 !important;
  border-radius: 0 0 0 5px !important;
}

.bottom-tabs-container.minimized {
  /* Também aplicar transição quando minimizar */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  
  /* Garantir que não tenha sombra em estado minimizado */
  box-shadow: none !important;
  
  /* Remover borda quando minimizado */
  border-left: none !important;
}

.bottom-tabs-nav {
  flex-shrink: 0;
  z-index: 10;
  /* Adicionando efeito de elevação */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  /* Adicionando transição suave */
  transition: all 0.25s ease-out;
  /* Adicionar um leve gradiente de fundo */
  background: linear-gradient(to bottom, #ffffff, #f9f9f9) !important;
  /* Adicionar borda sutil */
  border-bottom: 1px solid rgba(0, 0, 0, 0.07) !important;
}

/* Garantir que o conteúdo active ocupe todo o espaço disponível */
.bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content {
  flex: 1;
  overflow-y: auto;
  width: 100% !important;
  height: calc(100vh - 60px) !important;
  
  /* Animações de entrada */
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-out !important;
  
  /* Adicionar padding para separar do topo */
  padding-top: 10px !important;
  
  /* Estilizar scrollbar para ficar mais moderna */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 193, 7, 0.5) #f5f5f5;
}

/* Personalização da scrollbar para Webkit (Chrome, Safari) */
.bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content::-webkit-scrollbar {
  width: 8px;
}

.bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.bottom-tabs-container:not(.minimized) .bottom-tab-content.active-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 193, 7, 0.5);
  border-radius: 10px;
}

/* Estilizar botões das abas para animações mais atraentes */
.bottom-tab-btn {
  transition: all 0.25s ease-out !important;
  position: relative;
  overflow: hidden;
  /* Melhorar a aparência dos botões */
  border-radius: 0 !important;
  margin: 0 4px !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  /* Adicionar efeito vidro para parecer mais moderno */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.bottom-tab-btn:hover {
  transform: translateY(-2px);
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.bottom-tab-btn:active {
  transform: translateY(1px);
}

.bottom-tab-btn.active {
  position: relative;
  background-color: rgba(255, 193, 7, 0.15) !important;
  color: #000 !important;
  font-weight: 600 !important;
}

/* Adicionar uma linha indicadora animada abaixo do botão ativo */
.bottom-tab-btn.active:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #ffc107;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease-out;
  animation: slideIn 0.3s forwards;
}

@keyframes slideIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Animação de ripple quando clica nos botões */
.bottom-tab-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: rgba(255, 193, 7, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out;
  opacity: 0;
  pointer-events: none;
}

.bottom-tab-btn:active::before {
  width: 200px;
  height: 200px;
  opacity: 1;
  transition: width 0.6s ease-out, height 0.6s ease-out, opacity 0s;
}

/* Animação para itens dentro das abas */
.animated-item {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* Melhorar a aparência dos cards dentro do conteúdo */
.bottom-tab-content .card {
  border-radius: 8px !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  overflow: hidden !important;
}

.bottom-tab-content .card:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Adicionar efeito nos botões dentro do conteúdo */
.bottom-tab-content .btn {
  transition: all 0.25s ease !important;
  position: relative !important;
  overflow: hidden !important;
  transform: translateZ(0) !important;
}

.bottom-tab-content .btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Adicionar efeito de pulsação nos botões importantes */
.bottom-tab-content .btn-primary, 
.bottom-tab-content .btn-success {
  animation: subtle-pulse 2s infinite;
}

@keyframes subtle-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
}' > "$DEST_DIR/styles-fix.css"

# Modificação no index.html para incluir o novo script e estilo
echo "# Verificando se index.html existe para modificar"
if [ -f "$DEST_DIR/index.html" ]; then
    # Fazer backup do arquivo original
    cp "$DEST_DIR/index.html" "$DEST_DIR/index.html.bak"
    
    echo "# Modificando index.html para incluir scripts e estilos"
    
    # Adicionar o link para o CSS
    sed -i '/<\/head>/i \    <!-- Estilos para correção das abas e animações -->\n    <link rel="stylesheet" href="styles-fix.css">' "$DEST_DIR/index.html"
    
    # Adicionar os scripts no final
    sed -i '/<\/body>/i \    <!-- Scripts para animações e correções das abas -->\n    <script src="tabs-fix.js"></script>' "$DEST_DIR/index.html"
    
    echo "# index.html modificado com sucesso!"
else
    echo "! ERRO: Arquivo index.html não encontrado em $DEST_DIR"
    echo "! Você precisa copiar manualmente os scripts para o seu index.html"
fi

echo ""
echo "=== Arquivos copiados com sucesso! ==="
echo "Os seguintes arquivos foram criados/modificados:"
echo "- $DEST_DIR/tabs-fix.js"
echo "- $DEST_DIR/styles-fix.css"
if [ -f "$DEST_DIR/index.html" ]; then
    echo "- $DEST_DIR/index.html (modificado)"
fi
echo ""
echo "O que fazer agora:"
echo "1. Verifique se os arquivos foram criados corretamente"
echo "2. Para enviar ao GitHub, execute:"
echo "   git add $DEST_DIR"
echo "   git commit -m \"Corrigido comportamento das abas inferiores\""
echo "   git push origin main"
echo ""
echo "Pronto! As alterações estarão disponíveis no GitHub Pages em alguns minutos."