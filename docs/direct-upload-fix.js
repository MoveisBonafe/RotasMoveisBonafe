/**
 * Script simples para resolver o problema do upload de arquivo
 * Esta versão usa o loop de eventos padrão e uma abordagem mais direta
 */
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Identificar o elemento de upload de arquivo
        var fileUpload = document.getElementById('file-upload');
        var uploadArea = document.getElementById('upload-area');
        
        if (!fileUpload) {
            console.error("🔴 ERROR: Elemento de upload file-upload não encontrado");
            return;
        }
        
        if (!uploadArea) {
            console.error("🔴 ERROR: Elemento upload-area não encontrado");
            return;
        }
        
        console.log("✅ Elementos de upload encontrados, aplicando correção");
        
        // Criar elemento de status se não existir
        var statusElement = document.getElementById('upload-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'upload-status';
            statusElement.style.display = 'none';
            statusElement.style.marginTop = '10px';
            statusElement.style.padding = '8px';
            statusElement.style.borderRadius = '4px';
            statusElement.style.textAlign = 'center';
            uploadArea.appendChild(statusElement);
            console.log("✅ Elemento de status criado");
        }
        
        // Garantir que o clique no container ative o input de arquivo
        uploadArea.addEventListener('click', function(e) {
            if (e.target !== fileUpload) {
                fileUpload.click();
            }
        });
        
        // Adicionar handlers de drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
            uploadArea.addEventListener(eventName, function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        uploadArea.addEventListener('dragenter', function() {
            uploadArea.classList.add('drag-active');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('drag-active');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            uploadArea.classList.remove('drag-active');
            var files = e.dataTransfer.files;
            if (files.length) {
                fileUpload.files = files;
                handleFiles(files);
            }
        });
        
        // Adicionar o handler para o input de arquivo diretamente
        fileUpload.addEventListener('change', function(e) {
            handleFiles(this.files);
        });
        
        // Função para processar arquivos
        function handleFiles(files) {
            if (!files.length) return;
            
            var file = files[0];
            console.log("📂 Arquivo selecionado:", file.name);
            
            // Mostrar status de processamento
            statusElement.style.display = 'block';
            statusElement.style.backgroundColor = '#ffc107';
            statusElement.style.color = '#000';
            statusElement.textContent = 'Processando arquivo...';
            
            var reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    var content = e.target.result;
                    console.log("Conteúdo do arquivo carregado");
                    
                    // Definir nossa própria função de processamento que protege contra erros
                    function processarArquivo(conteudo) {
                        try {
                            // Separar o conteúdo em linhas
                            const linhas = conteudo.split('\n');
                            let locaisAdicionados = 0;
                            
                            // Encontrar o elemento da lista de locais
                            const locationsList = document.getElementById('locations-list');
                            if (!locationsList) {
                                throw new Error("Elemento locations-list não encontrado");
                            }
                            
                            // Processar cada linha
                            for (let i = 0; i < linhas.length; i++) {
                                const linha = linhas[i].trim();
                                if (!linha) continue; // Ignorar linhas vazias
                                
                                // Dividir a linha em CEP e nome
                                const partes = linha.split(',');
                                if (partes.length < 2) continue;
                                
                                const cep = partes[0].trim();
                                const nome = partes.slice(1).join(',').trim();
                                
                                // Criar elemento da localização
                                const locationItem = document.createElement('div');
                                locationItem.className = 'location-card card mb-2';
                                locationItem.setAttribute('data-location-id', 'local_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
                                
                                // Adicionar conteúdo da localização
                                locationItem.innerHTML = `
                                    <div class="card-body p-2">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div class="location-name">${nome}</div>
                                                <div class="location-address small text-muted">${cep}</div>
                                            </div>
                                            <button class="btn btn-sm btn-outline-danger remove-location" 
                                                    onclick="removeLocation('${locationItem.getAttribute('data-location-id')}')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                                
                                // Adicionar à lista
                                locationsList.appendChild(locationItem);
                                locaisAdicionados++;
                            }
                            
                            // Habilitar o botão de otimização se houver locais
                            const optimizeButton = document.getElementById('optimize-route');
                            if (optimizeButton) {
                                optimizeButton.disabled = false;
                            }
                            
                            console.log("Locais adicionados:", locaisAdicionados);
                            return locaisAdicionados > 0;
                        } catch (error) {
                            console.error("Erro ao processar arquivo:", error);
                            return false;
                        }
                    }
                    
                    // Tentar usar funções de processamento existentes ou nossa função segura
                    if (typeof processCepFile === 'function') {
                        try {
                            processCepFile(content);
                            statusElement.style.backgroundColor = '#4CAF50';
                            statusElement.style.color = 'white';
                            statusElement.textContent = 'Arquivo processado com sucesso!';
                        } catch (e) {
                            console.error("Erro na função processCepFile:", e);
                            // Tentar nossa função
                            const resultadoSeguro = processarArquivo(content);
                            if (resultadoSeguro) {
                                statusElement.style.backgroundColor = '#4CAF50';
                                statusElement.style.color = 'white';
                                statusElement.textContent = 'Arquivo processado com sucesso!';
                            } else {
                                statusElement.style.backgroundColor = '#f44336';
                                statusElement.style.color = 'white';
                                statusElement.textContent = 'Erro ao processar arquivo. Verifique o formato.';
                            }
                        }
                    } else {
                        console.log("Função processCepFile não encontrada, usando processamento seguro");
                        const resultadoSeguro = processarArquivo(content);
                        if (resultadoSeguro) {
                            statusElement.style.backgroundColor = '#4CAF50';
                            statusElement.style.color = 'white';
                            statusElement.textContent = 'Arquivo processado com sucesso!';
                        } else {
                            statusElement.style.backgroundColor = '#f44336';
                            statusElement.style.color = 'white';
                            statusElement.textContent = 'Erro ao processar arquivo. Verifique o formato.';
                        }
                    }
                } catch (error) {
                    console.error("Erro ao processar arquivo:", error);
                    statusElement.style.backgroundColor = '#f44336';
                    statusElement.style.color = 'white';
                    statusElement.textContent = 'Erro: ' + error.message;
                }
                
                // Ocultar mensagem após 3 segundos
                setTimeout(function() {
                    statusElement.style.opacity = '0';
                    setTimeout(function() {
                        statusElement.style.display = 'none';
                        statusElement.style.opacity = '1';
                    }, 300);
                }, 3000);
            };
            
            reader.onerror = function() {
                statusElement.style.backgroundColor = '#f44336';
                statusElement.style.color = 'white';
                statusElement.textContent = 'Erro ao ler o arquivo';
            };
            
            reader.readAsText(file);
        }
        
        console.log("✅ Upload de arquivo configurado com sucesso");
    }, 1000); // Aguardar 1 segundo para garantir que os elementos estejam disponíveis
});