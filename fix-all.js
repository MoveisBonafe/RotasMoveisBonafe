/**
 * CORREÇÃO COMPLETA PARA O SITE MÓVEIS BONAFÉ
 * Este script corrige:
 * 1. Problema das abas inferiores (todas visíveis ao mesmo tempo)
 * 2. Datas incorretas de cidades (Piedade e Ribeirão Preto)
 * 3. Problemas de conteúdo cruzado entre cidades
 */

// Função auto-executável
(function() {
  console.log("[AutoFix] Iniciando correções automáticas...");
  
  // Executar quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarCorrecoes);
  } else {
    iniciarCorrecoes();
  }
  
  // Função principal que inicia todas as correções
  function iniciarCorrecoes() {
    // Injetar CSS crítico
    injetarCSS();
    
    // Aplicar correções imediatamente e depois periodicamente
    aplicarCorrecoes();
    setInterval(aplicarCorrecoes, 2000);
    
    // Monitorar cliques para garantir correções após interações
    document.addEventListener("click", function() {
      setTimeout(aplicarCorrecoes, 200);
    });
    
    // Monitorar mudanças no DOM
    observarMudancasDOM();
  }
  
  // Injeta CSS necessário para as correções
  function injetarCSS() {
    const css = `
      /* Correção das abas inferiores */
      .bottom-tab-content {
        display: none !important;
      }
      
      .bottom-tab-content.active-content {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        height: calc(100vh - 60px) !important;
        overflow-y: auto !important;
        padding: 20px !important;
        box-sizing: border-box !important;
      }
      
      /* Estilo para descrições de eventos */
      .event-description.corrigido {
        font-size: 1.1em !important;
        font-weight: bold !important;
        color: #e91e63 !important;
        margin-top: 10px !important;
      }
    `;
    
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    console.log("[AutoFix] CSS crítico injetado.");
  }
  
  // Monitora mudanças no DOM para correções dinâmicas
  function observarMudancasDOM() {
    // Criação do observador de mutações
    const observer = new MutationObserver(function(mutations) {
      aplicarCorrecoes();
    });
    
    // Configuração do observador
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("[AutoFix] Observador de mutações DOM ativado.");
  }
  
  // Aplica todas as correções necessárias
  function aplicarCorrecoes() {
    corrigirAbas();
    corrigirDatasEventos();
  }
  
  // Corrige o problema das abas inferiores
  function corrigirAbas() {
    // Apenas processar se as abas estiverem expandidas
    const container = document.querySelector(".bottom-tabs-container");
    if (!container || container.classList.contains("minimized")) return;
    
    // Esconder todas as abas
    const abas = document.querySelectorAll(".bottom-tab-content");
    abas.forEach(function(aba) {
      aba.classList.remove("active-content");
    });
    
    // Determinar qual aba deve estar ativa
    const botaoAtivo = document.querySelector(".bottom-tab-btn.active");
    if (botaoAtivo) {
      const alvoId = botaoAtivo.getAttribute("data-target");
      const abaAtiva = document.getElementById(alvoId);
      if (abaAtiva) {
        abaAtiva.classList.add("active-content");
      }
    } else {
      // Se nenhum botão estiver ativo, ativar o primeiro
      const primeiroBotao = document.querySelector(".bottom-tab-btn");
      if (primeiroBotao) {
        primeiroBotao.classList.add("active");
        const primeiraAbaId = primeiroBotao.getAttribute("data-target");
        const primeiraAba = document.getElementById(primeiraAbaId);
        if (primeiraAba) {
          primeiraAba.classList.add("active-content");
        }
      }
    }
  }
  
  // Corrige datas de eventos e problemas de cruzamento
  function corrigirDatasEventos() {
    // Mapeamento das correções para cidades específicas
    const corrcoesEspecificas = {
      "Piedade": {
        dataCorreta: "20/05/1840",
        descricaoCorreta: "Aniversário de fundação de Piedade em 20/05/1840"
      },
      "Ribeirão Preto": {
        dataCorreta: "19/06/1856",
        descricaoCorreta: "Aniversário de fundação de Ribeirão Preto em 19/06/1856"
      }
    };
    
    // Encontrar todos os elementos de evento
    const todosEventos = document.querySelectorAll(".event-item, .city-event");
    
    todosEventos.forEach(function(evento) {
      const texto = evento.textContent || evento.innerText;
      
      // Processar para cada cidade que precisa de correção
      Object.keys(corrcoesEspecificas).forEach(function(cidade) {
        if (texto.includes(cidade)) {
          // Obter elementos importantes do evento
          const elementoData = evento.querySelector(".event-date");
          const elementoDescricao = evento.querySelector(".event-description");
          
          // Ocultar o elemento de data se existir
          if (elementoData) {
            elementoData.style.display = "none";
          }
          
          // Atualizar a descrição com a data correta
          if (elementoDescricao) {
            // Verificar se a correção já foi aplicada para evitar múltiplas aplicações
            if (!elementoDescricao.classList.contains("corrigido")) {
              elementoDescricao.textContent = corrcoesEspecificas[cidade].descricaoCorreta;
              elementoDescricao.classList.add("corrigido");
            }
          }
          
          // Verificar e corrigir problemas de cruzamento
          corrigirCruzamentosEventos(evento, cidade);
        }
      });
    });
  }
  
  // Corrige problemas onde eventos de uma cidade aparecem em outra
  function corrigirCruzamentosEventos(evento, cidadeCorreta) {
    const texto = evento.textContent || evento.innerText;
    const descricao = evento.querySelector(".event-description");
    
    // Se for evento de Piedade mas tem menção a Ribeirão Preto
    if (cidadeCorreta === "Piedade" && texto.includes("Ribeirão Preto") && descricao) {
      descricao.textContent = "Aniversário de fundação de Piedade em 20/05/1840";
      descricao.classList.add("corrigido");
    }
    
    // Se for evento de Ribeirão Preto mas tem menção a Piedade
    if (cidadeCorreta === "Ribeirão Preto" && texto.includes("Piedade") && descricao) {
      descricao.textContent = "Aniversário de fundação de Ribeirão Preto em 19/06/1856";
      descricao.classList.add("corrigido");
    }
  }
})();