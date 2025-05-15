/**
 * Script para corrigir o problema de upload de arquivo
 * Resolve o erro "ReferenceError: statusElement is not defined"
 */
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixFileUpload);
    } else {
        fixFileUpload();
    }
    
    function fixFileUpload() {
        // Encontra o elemento de input de arquivo
        const fileInput = document.getElementById('file-input');
        if (!fileInput) {
            console.warn("Elemento de upload não encontrado, tentando novamente em 1s");
            setTimeout(fixFileUpload, 1000);
            return;
        }
        
        console.log("Encontrado elemento de upload, aplicando correção...");
        
        // Criar novo elemento de status caso não exista
        let statusElement = document.getElementById('upload-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'upload-status';
            statusElement.style.marginTop = '10px';
            statusElement.style.display = 'none';
            statusElement.style.padding = '8px 12px';
            statusElement.style.borderRadius = '4px';
            statusElement.style.transition = 'all 0.3s ease';
            
            // Inserir após o input de arquivo
            if (fileInput.parentNode) {
                fileInput.parentNode.insertBefore(statusElement, fileInput.nextSibling);
            }
        }

        // Sobrescrever o manipulador de eventos do input de arquivo
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            console.log("Arquivo selecionado:", file.name);
            
            // Exibir status de carregamento
            statusElement.style.display = 'block';
            statusElement.style.backgroundColor = '#ffc107';
            statusElement.style.color = '#000';
            statusElement.textContent = 'Processando arquivo...';
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    console.log("Conteúdo do arquivo carregado, processando...");
                    
                    // Processar o conteúdo do arquivo (dependendo da função existente)
                    if (typeof processImportedFile === 'function') {
                        const result = processImportedFile(content);
                        if (result) {
                            statusElement.style.backgroundColor = '#4CAF50';
                            statusElement.style.color = 'white';
                            statusElement.textContent = 'Arquivo processado com sucesso!';
                        } else {
                            statusElement.style.backgroundColor = '#f44336';
                            statusElement.style.color = 'white';
                            statusElement.textContent = 'Erro ao processar arquivo. Verifique o formato.';
                        }
                    } else if (typeof processCepFile === 'function') {
                        processCepFile(content);
                        statusElement.style.backgroundColor = '#4CAF50';
                        statusElement.style.color = 'white';
                        statusElement.textContent = 'Arquivo processado com sucesso!';
                    } else {
                        console.error("Nenhuma função de processamento encontrada");
                        statusElement.style.backgroundColor = '#f44336';
                        statusElement.style.color = 'white';
                        statusElement.textContent = 'Erro ao processar arquivo: função não encontrada.';
                    }
                } catch (error) {
                    console.error("Erro ao processar arquivo:", error);
                    statusElement.style.backgroundColor = '#f44336';
                    statusElement.style.color = 'white';
                    statusElement.textContent = 'Erro ao processar arquivo: ' + error.message;
                }
                
                // Ocultar a mensagem após 3 segundos
                setTimeout(() => {
                    statusElement.style.opacity = '0';
                    setTimeout(() => {
                        statusElement.style.display = 'none';
                        statusElement.style.opacity = '1';
                    }, 300);
                }, 3000);
            };
            
            reader.onerror = function() {
                console.error("Erro ao ler o arquivo");
                statusElement.style.backgroundColor = '#f44336';
                statusElement.style.color = 'white';
                statusElement.textContent = 'Erro ao ler o arquivo';
            };
            
            reader.readAsText(file);
        };
        
        console.log("Correção de upload de arquivo aplicada");
    }
})();