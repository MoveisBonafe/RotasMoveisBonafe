/**
 * Script para corrigir a duplicação de elementos de upload no GitHub Pages
 * O problema parece ser alguns elementos duplicados que aparecem apenas quando hospedado
 * ou elementos que são removidos após o carregamento
 * Esta solução detecta e corrige ambos os problemas
 */
 
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando correção de elementos de upload...');
    
    // Primeiro verificar após um pequeno atraso
    verificarElementos();
    
    // Em seguida, verificar novamente após um atraso maior
    setTimeout(verificarElementos, 1500);
    
    // E finalmente, monitorar continuamente por alguns segundos
    let contador = 0;
    const intervalo = setInterval(function() {
        verificarElementos();
        contador++;
        
        // Parar de monitorar após 10 verificações (5 segundos)
        if (contador >= 10) {
            clearInterval(intervalo);
            console.log('Monitoramento de elementos de upload concluído');
        }
    }, 500);
    
    // Função para verificar e corrigir os elementos
    function verificarElementos() {
        // CORREÇÃO DE DUPLICAÇÃO
        // Verificar se há múltiplos elementos de upload
        const uploadContainers = document.querySelectorAll('.file-upload-container');
        
        console.log(`Encontrados ${uploadContainers.length} containers de upload`);
        
        // Se houver mais de um, manter apenas o primeiro e remover os outros
        if (uploadContainers.length > 1) {
            for (let i = 1; i < uploadContainers.length; i++) {
                console.log(`Removendo container de upload duplicado #${i}`);
                if (uploadContainers[i].parentNode) {
                    uploadContainers[i].parentNode.removeChild(uploadContainers[i]);
                }
            }
            console.log('Duplicações removidas');
        } 
        // Se não houver nenhum, vamos criar
        else if (uploadContainers.length === 0) {
            console.log('Nenhum container de upload encontrado. Criando um novo...');
            criarElementoUpload();
        }
    }
    
    // Função para criar o elemento de upload caso não exista
    function criarElementoUpload() {
        try {
            // Primeiro tentar encontrar o campo "Adicionar local"
            const addLocationSection = Array.from(document.querySelectorAll('h3')).find(h => 
                h.textContent.includes('Adicionar local')
            );
            
            // Se encontrarmos a seção de adicionar local, inserir após ela
            if (addLocationSection) {
                let targetElement = addLocationSection;
                
                // Ir subindo até encontrar um div pai adequado
                while (targetElement && targetElement.parentNode && targetElement.tagName !== 'DIV') {
                    targetElement = targetElement.parentNode;
                }
                
                if (targetElement && targetElement.parentNode) {
                    // Criar elemento de upload
                    inserirUploadApósElemento(targetElement);
                    return;
                }
            }
            
            // Se não encontramos a seção de adicionar local, tentar encontrar qualquer item na sidebar
            const campoEndereco = document.querySelector('input[placeholder="Digite um endereço"]');
            if (campoEndereco) {
                // Ir subindo até encontrar um container adequado
                let targetElement = campoEndereco;
                while (targetElement && targetElement.parentNode && !targetElement.classList.contains('location-form')) {
                    targetElement = targetElement.parentNode;
                }
                
                if (targetElement && targetElement.parentNode) {
                    // Inserir após o formulário de localização
                    inserirUploadApósElemento(targetElement);
                    return;
                }
            }
            
            // Terceira tentativa: inserir diretamente na sidebar se existir
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                // Criar o elemento e adicionar à sidebar
                const uploadContainer = criarContainerUpload();
                sidebar.appendChild(uploadContainer);
                console.log('Container de upload adicionado diretamente à sidebar');
                recarregarScriptsUpload();
                return;
            }
            
            // Se chegamos aqui, não conseguimos encontrar um lugar adequado
            console.error('Não foi possível encontrar um local adequado para inserir o upload');
            
        } catch (error) {
            console.error('Erro ao criar elemento de upload:', error);
        }
    }
    
    // Função auxiliar para criar o container de upload
    function criarContainerUpload() {
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'file-upload-container';
        uploadContainer.id = 'upload-area';
        uploadContainer.style.marginTop = '20px';
        uploadContainer.style.marginBottom = '20px';
        
        uploadContainer.innerHTML = `
            <div class="upload-icon">📂</div>
            <h3>Importar CEPs via arquivo</h3>
            <div class="file-format-example">Formato: CEP,Nome</div>
            <div class="upload-animation">
                <span class="upload-text">Arraste arquivo ou clique aqui</span>
                <span class="upload-pulse"></span>
            </div>
            <input type="file" id="file-upload" accept=".txt,.csv">
            <div id="upload-status" style="display: none;"></div>
        `;
        
        return uploadContainer;
    }
    
    // Função auxiliar para inserir o upload após um elemento
    function inserirUploadApósElemento(elemento) {
        const uploadContainer = criarContainerUpload();
        elemento.parentNode.insertBefore(uploadContainer, elemento.nextSibling);
        console.log('Container de upload inserido com sucesso');
        recarregarScriptsUpload();
    }
    
    // Função auxiliar para recarregar os scripts de upload
    function recarregarScriptsUpload() {
        // Verificar se o script já existe
        const existingScript = document.querySelector('script[src="unified-file-upload.js"]');
        if (!existingScript) {
            const scriptUpload = document.createElement('script');
            scriptUpload.src = 'unified-file-upload.js';
            document.head.appendChild(scriptUpload);
            console.log('Script de upload carregado');
        } else {
            console.log('Script de upload já existe, reativando...');
            // Reativar o script executando uma cópia dele
            const scriptTemp = document.createElement('script');
            scriptTemp.textContent = `
                (function() {
                    console.log("Reativando handlers de upload...");
                    const oldScript = document.querySelector('script[src="unified-file-upload.js"]');
                    if (oldScript) {
                        const newScript = document.createElement('script');
                        newScript.src = 'unified-file-upload.js';
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    }
                })();
            `;
            document.head.appendChild(scriptTemp);
        }
    }
});
