/**
 * Solução específica para corrigir a sequência de itens no relatório
 * Garantindo que a origem seja sempre 0
 */
(function() {
    console.log('[CorrigirSequencia] Iniciando correção da sequência no relatório');
    
    // Monitorar o relatório continuamente
    setInterval(verificarRelatorio, 100);
    
    /**
     * Verificar se o relatório está aberto e corrigir a sequência
     */
    function verificarRelatorio() {
        // Verificar se o relatório está aberto
        const relatorio = document.querySelector('#route-report-modal, .route-report, [id*="report"], .modal:not([style*="display: none"])');
        
        if (!relatorio || window.getComputedStyle(relatorio).display === 'none') {
            return;
        }
        
        // Procurar a lista numerada
        const listaSequencia = relatorio.querySelector('ol, .list-group-numbered, [class*="sequencia"] ul, [class*="sequencia"] ol');
        
        if (!listaSequencia) {
            return;
        }
        
        // Verificar se já foi processada
        if (listaSequencia.getAttribute('data-sequencia-corrigida') === 'true') {
            return;
        }
        
        console.log('[CorrigirSequencia] Relatório encontrado, corrigindo sequência');
        
        // Método 1: Substituir lista ordenada por não-ordenada com números manuais
        if (listaSequencia.tagName.toLowerCase() === 'ol') {
            // Criar nova lista não ordenada
            const novaLista = document.createElement('ul');
            novaLista.className = listaSequencia.className.replace('list-group-numbered', 'list-group');
            novaLista.setAttribute('data-sequencia-corrigida', 'true');
            
            // Obter itens da lista original
            const itens = listaSequencia.querySelectorAll('li');
            
            // Adicionar itens à nova lista com números corretos
            itens.forEach((item, index) => {
                const novoItem = document.createElement('li');
                novoItem.className = item.className;
                
                // Criar span para o número da sequência
                const spanNumero = document.createElement('span');
                spanNumero.className = 'badge bg-primary me-2';
                spanNumero.textContent = index === 0 ? '0' : (index).toString();
                
                // Adicionar número e conteúdo
                novoItem.appendChild(spanNumero);
                novoItem.appendChild(document.createTextNode(' ' + item.textContent));
                
                // Adicionar à nova lista
                novaLista.appendChild(novoItem);
            });
            
            // Substituir a lista original
            listaSequencia.parentNode.replaceChild(novaLista, listaSequencia);
            
            console.log('[CorrigirSequencia] Lista ordenada substituída por lista com números manuais');
            return;
        }
        
        // Método 2: Injetar CSS personalizado
        const style = document.createElement('style');
        style.textContent = `
            /* Reset contador para começar do 0 */
            .list-group-numbered {
                counter-reset: item -1 !important;
            }
            
            /* Correção forçada: sempre mostre o número correto */
            .list-group-numbered > .list-group-item:first-child::before {
                content: "0" !important;
            }
        `;
        
        document.head.appendChild(style);
        
        // Marcar a lista como processada
        listaSequencia.setAttribute('data-sequencia-corrigida', 'true');
        
        console.log('[CorrigirSequencia] CSS injetado para corrigir a sequência');
        
        // Método 3: Manipulação direta dos itens
        const itens = listaSequencia.querySelectorAll('li');
        
        if (itens.length > 0) {
            // Procurar o primeiro item (origem)
            const primeiroItem = itens[0];
            
            // Verificar se tem o número 1 no início
            if (primeiroItem.textContent.trim().startsWith('1.')) {
                // Substituir o "1." por "0."
                primeiroItem.innerHTML = primeiroItem.innerHTML.replace(/^1\./, '0.');
                console.log('[CorrigirSequencia] Substituição direta de "1." para "0." no primeiro item');
            }
            
            // Verificar se há um pseudo-elemento ::before que podemos modificar
            aplicarCorrecaoDireta(primeiroItem);
        }
        
        // Método 4: Observar mudanças na lista e corrigir continuamente
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Se novos itens foram adicionados, aplicar correção novamente
                    aplicarCorrecaoDireta(itens[0]);
                }
            });
        });
        
        observer.observe(listaSequencia, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Aplicar correção direta no item da origem
     */
    function aplicarCorrecaoDireta(elemento) {
        // Método mais direto: adicionar atributo personalizado
        elemento.setAttribute('data-sequence', '0');
        
        // Método de injeção de estilo inline
        elemento.style.setProperty('--sequence-start', '0');
        
        // Recriar o elemento (estratégia extrema)
        const clone = elemento.cloneNode(true);
        const conteudo = clone.innerHTML;
        
        // Verificar se tem o formato "1. Conteúdo"
        if (/^\s*1\.\s+/.test(conteudo)) {
            // Substituir "1." por "0."
            clone.innerHTML = conteudo.replace(/^\s*1\.\s+/, '0. ');
        } else {
            // Adicionar "0. " no início do conteúdo
            const firstChild = clone.firstChild;
            
            if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
                firstChild.textContent = '0. ' + firstChild.textContent;
            } else {
                clone.innerHTML = '0. ' + clone.innerHTML;
            }
        }
        
        // Substituir o elemento original pelo clone
        if (elemento.parentNode) {
            elemento.parentNode.replaceChild(clone, elemento);
        }
    }
})();