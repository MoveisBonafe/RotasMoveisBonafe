/**
 * Script para corrigir a duplicação de elementos de upload no GitHub Pages
 * O problema parece ser alguns elementos duplicados que aparecem apenas quando hospedado
 * Esta solução detecta e remove elementos duplicados ou adiciona elementos ausentes
 */
 
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando correção de elementos de upload...');
    
    // Esperar um momento para garantir que tudo está carregado
    setTimeout(function() {
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
        
        console.log('Correção de elementos de upload concluída');
    }, 1000);
    
    // Função para criar o elemento de upload caso não exista
    function criarElementoUpload() {
        // Encontrar a sidebar
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            console.error('Sidebar não encontrada');
            return;
        }
        
        // Local para inserir o upload (depois do campo de adicionar local)
        const addLocationSection = Array.from(document.querySelectorAll('h3')).find(h => 
            h.textContent.includes('Adicionar local')
        );
        
        let targetElement = addLocationSection;
        if (targetElement && targetElement.parentNode) {
            // Ir subindo até encontrar um div pai
            while (targetElement && targetElement.parentNode && targetElement.tagName !== 'DIV') {
                targetElement = targetElement.parentNode;
            }
            
            if (targetElement) {
                // Criar o elemento de upload
                const uploadContainer = document.createElement('div');
                uploadContainer.className = 'file-upload-container';
                uploadContainer.id = 'upload-area';
                
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
                
                // Inserir depois do elemento alvo
                targetElement.parentNode.insertBefore(uploadContainer, targetElement.nextSibling);
                
                console.log('Container de upload criado com sucesso');
                
                // Recarregar os scripts de upload
                const scriptUpload = document.createElement('script');
                scriptUpload.src = 'unified-file-upload.js';
                document.head.appendChild(scriptUpload);
                
                console.log('Scripts de upload recarregados');
            }
        }
    }
});
