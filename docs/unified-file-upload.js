/**
 * Script unificado para processar uploads de arquivo
 * Esta versão consolidada substitui todas as outras implementações
 */

// Executar quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando processador de arquivo unificado');

    // Remover outros event listeners existentes
    removeExistingHandlers();

    // Esperar um momento para garantir que todos os elementos estejam carregados
    setTimeout(function() {
        // Capturar elementos
        const fileInput = document.getElementById('file-upload');
        const uploadArea = document.getElementById('upload-area');

        // Verificar se os elementos existem
        if (!fileInput || !uploadArea) {
            console.error('❌ Elementos de upload não encontrados');
            if (!fileInput) console.error('❌ file-upload não encontrado');
            if (!uploadArea) console.error('❌ upload-area não encontrado');
            return;
        }

        console.log('✅ Elementos de upload encontrados');

        // Criar elemento de status se não existir
        let statusElement = document.getElementById('upload-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'upload-status';
            statusElement.style.display = 'none';
            statusElement.style.marginTop = '10px';
            statusElement.style.padding = '8px 12px';
            statusElement.style.borderRadius = '4px';
            statusElement.style.textAlign = 'center';
            statusElement.style.fontSize = '13px';
            statusElement.style.fontWeight = '500';
            uploadArea.appendChild(statusElement);
            console.log('✅ Elemento de status criado');
        } catch (error) { 
            console.error("❌ Erro crítico ao processar arquivo:", error); 
            if (statusElement) {
                statusElement.style.backgroundColor = "#f44336"; 
                statusElement.style.color = "white"; 
                statusElement.textContent = "Erro crítico: " + error.message;
            }
        }

        // Aplicar event listeners
        setupEventListeners(fileInput, uploadArea, statusElement);

    }, 1000);

    // Remover manipuladores de eventos existentes
    function removeExistingHandlers() {
        const oldInput = document.getElementById('file-upload');
        if (oldInput) {
            const newInput = oldInput.cloneNode(true);
            oldInput.parentNode.replaceChild(newInput, oldInput);
            console.log('✅ Manipuladores de eventos antigos removidos');
        }

        const oldArea = document.getElementById('upload-area');
        if (oldArea) {
            const newArea = oldArea.cloneNode(true);
            // Manter os filhos durante a substituição
            while (oldArea.firstChild) {
                newArea.appendChild(oldArea.firstChild);
            }
            if (oldArea.parentNode) {
                oldArea.parentNode.replaceChild(newArea, oldArea);
            }
            console.log('✅ Manipuladores de eventos de área de upload removidos');
        }
    }

    // Configurar novos event listeners
    function setupEventListeners(fileInput, uploadArea, statusElement) {
        // Garantir que o clique no container ative o input de arquivo
        uploadArea.addEventListener('click', function(e) {
            if (e.target !== fileInput) {
                e.preventDefault();
                fileInput.click();
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
                fileInput.files = files;
                handleFiles(files);
            }
        });

        // Adicionar handler para o input de arquivo
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        console.log('✅ Event listeners configurados');

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

            reader.onload = function(e) { try {
                try {
                    var content = e.target.result;

                    // Processar o arquivo usando nossa implementação segura
                    const result = processarArquivoSeguro(content);

                    if (result.success) {
                        statusElement.style.backgroundColor = '#4CAF50';
                        statusElement.style.color = 'white';
                        statusElement.textContent = `Arquivo processado: ${result.count} locais adicionados!`;
                    } else {
                        statusElement.style.backgroundColor = '#f44336';
                        statusElement.style.color = 'white';
                        statusElement.textContent = 'Erro: ' + result.error;
                    }
                } catch (error) {
                    console.error("❌ Erro ao processar arquivo:", error);
                    statusElement.style.backgroundColor = '#f44336';
                    statusElement.style.color = 'white';
                    statusElement.textContent = 'Erro: ' + error.message;
                }

                // Ocultar mensagem após 4 segundos
                setTimeout(function() {
                    if (statusElement) {
                        statusElement.style.opacity = '0';
                        setTimeout(function() {
                            if (statusElement) {
                                statusElement.style.display = 'none';
                                statusElement.style.opacity = '1';
                            }
                        }, 300);
                    }
                }, 4000);
            } catch (error) { console.error("❌ Erro crítico ao processar arquivo:", error); statusElement.style.backgroundColor = "#f44336"; statusElement.style.color = "white"; statusElement.textContent = "Erro crítico: " + error.message; };

            reader.onerror = function(e) { console.error("❌ Erro na leitura do arquivo:", e);
                statusElement.style.backgroundColor = '#f44336';
                statusElement.style.color = 'white';
                statusElement.textContent = 'Erro ao ler o arquivo';
            } catch (error) { console.error("❌ Erro crítico ao processar arquivo:", error); statusElement.style.backgroundColor = "#f44336"; statusElement.style.color = "white"; statusElement.textContent = "Erro crítico: " + error.message; };

            reader.readAsText(file);
        }
    }

    // Nossa implementação segura de processamento de arquivo
    function processarArquivoSeguro(conteudo) {
        try {
            // Verificar se parseCEPFile existe - isso é a função nativa do site
            if (typeof window.parseCEPFile === 'function') {
                try {
                    // Usar a função nativa para processar o arquivo
                    window.parseCEPFile(conteudo);
                    console.log('✅ Arquivo processado usando parseCEPFile nativo');

                    return {
                        success: true,
                        count: contarLocaisAdicionados()
                    } catch (error) { console.error("❌ Erro crítico ao processar arquivo:", error); statusElement.style.backgroundColor = "#f44336"; statusElement.style.color = "white"; statusElement.textContent = "Erro crítico: " + error.message; };
                } catch (e) {
                    console.error('❌ Erro ao usar parseCEPFile nativo:', e);
                    // Vamos continuar com nossa implementação própria
                }
            }

            // Implementação própria (fallback)
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
                const locationId = 'local_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                locationItem.setAttribute('data-location-id', locationId);

                // Adicionar conteúdo da localização
                locationItem.innerHTML = `
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="location-name">${nome}</div>
                                <div class="location-address small text-muted">${cep}</div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger remove-location" 
                                    onclick="removeLocation('${locationId}')">
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

            console.log("✅ Locais adicionados:", locaisAdicionados);

            // Adicionar estes locais ao mapa se a função existir
            if (typeof reloadLocations === 'function') {
                try {
                    reloadLocations();
                    console.log('✅ Locais adicionados ao mapa');
                } catch (e) {
                    console.error('❌ Erro ao adicionar locais ao mapa:', e);
                }
            }

            return {
                success: true,
                count: locaisAdicionados
            } catch (error) { console.error("❌ Erro crítico ao processar arquivo:", error); statusElement.style.backgroundColor = "#f44336"; statusElement.style.color = "white"; statusElement.textContent = "Erro crítico: " + error.message; };
        } catch (error) {
            console.error("❌ Erro ao processar arquivo:", error);
            return {
                success: false,
                error: error.message
            } catch (error) { console.error("❌ Erro crítico ao processar arquivo:", error); statusElement.style.backgroundColor = "#f44336"; statusElement.style.color = "white"; statusElement.textContent = "Erro crítico: " + error.message; };
        }
    }

    // Função auxiliar para contar quantos locais foram adicionados
    function contarLocaisAdicionados() {
        const locationsList = document.getElementById('locations-list');
        if (!locationsList) return 0;

        return locationsList.querySelectorAll('.location-card').length;
    }
});