/**
 * Script para corrigir o problema de upload de arquivo
 * Corrigido para usar o ID correto do campo de upload
 */
(function() {
    // Executar quando o DOM estiver completamente carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM carregado, inicializando correção de upload...");
        
        // Verificar se o elemento existe com intervalos até encontrá-lo
        let checkCount = 0;
        const maxChecks = 10;
        
        function checkFileUpload() {
            console.log("Verificando elemento de upload...");
            // ID correto no HTML é "file-upload"
            const fileInput = document.getElementById('file-upload');
            
            if (fileInput) {
                console.log("Elemento de upload encontrado!", fileInput);
                initFileUpload(fileInput);
            } else {
                checkCount++;
                console.log("Elemento de upload não encontrado, tentativa " + checkCount + " de " + maxChecks);
                
                if (checkCount < maxChecks) {
                    setTimeout(checkFileUpload, 1000);
                } else {
                    console.error("Não foi possível encontrar o elemento de upload após várias tentativas");
                }
            }
        }
        
        // Iniciar verificação após um curto atraso
        setTimeout(checkFileUpload, 500);
    });
    
    function initFileUpload(fileInput) {
        // Criar status element (caso não exista)
        let statusElement = document.getElementById('upload-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'upload-status';
            statusElement.style.display = 'none';
            
            // Inserir após o input de arquivo no container
            const uploadContainer = fileInput.closest('.file-upload-container');
            if (uploadContainer) {
                uploadContainer.appendChild(statusElement);
            } else {
                // Fallback: inserir após o próprio input
                fileInput.parentNode.insertBefore(statusElement, fileInput.nextSibling);
            }
            
            console.log("Elemento de status criado");
        }
        
        // Sobrescrever o evento change para usar o statusElement
        fileInput.addEventListener('change', function(event) {
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
                        statusElement.style.backgroundColor = '#4CAF50';
                        statusElement.style.color = 'white';
                        statusElement.textContent = 'Arquivo processado com sucesso!';
                    } else if (typeof processCepFile === 'function') {
                        processCepFile(content);
                        statusElement.style.backgroundColor = '#4CAF50';
                        statusElement.style.color = 'white';
                        statusElement.textContent = 'Arquivo processado com sucesso!';
                    } else {
                        console.error("Nenhuma função de processamento encontrada");
                        statusElement.style.backgroundColor = '#f44336';
                        statusElement.style.color = 'white';
                        statusElement.textContent = 'Erro: função de processamento não encontrada';
                    }
                } catch (error) {
                    console.error("Erro ao processar arquivo:", error);
                    statusElement.style.backgroundColor = '#f44336';
                    statusElement.style.color = 'white';
                    statusElement.textContent = 'Erro: ' + error.message;
                }
                
                // Ocultar a mensagem após 3 segundos
                setTimeout(function() {
                    statusElement.style.opacity = '0';
                    setTimeout(function() {
                        statusElement.style.display = 'none';
                        statusElement.style.opacity = '1';
                    }, 300);
                }, 3000);
            };
            
            reader.onerror = function(error) {
                console.error("Erro ao ler o arquivo:", error);
                statusElement.style.backgroundColor = '#f44336';
                statusElement.style.color = 'white';
                statusElement.textContent = 'Erro ao ler o arquivo';
            };
            
            reader.readAsText(file);
        });
        
        console.log("Correção de upload de arquivo aplicada com sucesso");
    }
})();