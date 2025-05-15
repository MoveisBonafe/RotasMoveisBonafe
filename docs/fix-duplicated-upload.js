/**
 * Script para corrigir a duplicação de elementos de upload no GitHub Pages
 * O problema parece ser alguns elementos duplicados que aparecem apenas quando hospedado
 * Esta solução detecta e remove elementos duplicados
 */
 
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando correção de duplicação de upload...');
    
    // Esperar um momento para garantir que tudo está carregado
    setTimeout(function() {
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
        }
        
        // Verificar se há múltiplos elementos de texto "Importar CEPs via arquivo"
        const importHeaders = Array.from(document.querySelectorAll('h3')).filter(h => 
            h.textContent.includes('Importar CEPs via arquivo')
        );
        
        console.log(`Encontrados ${importHeaders.length} cabeçalhos de importação`);
        
        // Se houver mais de um, manter apenas o primeiro e remover os outros
        if (importHeaders.length > 1) {
            for (let i = 1; i < importHeaders.length; i++) {
                console.log(`Removendo cabeçalho de importação duplicado #${i}`);
                // Remover o elemento pai inteiro (o container)
                let parent = importHeaders[i].parentNode;
                if (parent && parent.parentNode) {
                    parent.parentNode.removeChild(parent);
                }
            }
        }
        
        // Verificar elementos de animação de upload
        const uploadAnimations = document.querySelectorAll('.upload-animation');
        
        console.log(`Encontrados ${uploadAnimations.length} animações de upload`);
        
        if (uploadAnimations.length > 1) {
            for (let i = 1; i < uploadAnimations.length; i++) {
                console.log(`Removendo animação de upload duplicada #${i}`);
                if (uploadAnimations[i].parentNode) {
                    uploadAnimations[i].parentNode.removeChild(uploadAnimations[i]);
                }
            }
        }
        
        // Verificar inputs de upload duplicados
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        console.log(`Encontrados ${fileInputs.length} inputs de arquivo`);
        
        if (fileInputs.length > 1) {
            // Verificar se há IDs repetidos
            const fileInputIds = {};
            
            fileInputs.forEach((input, index) => {
                const id = input.id;
                if (fileInputIds[id]) {
                    console.log(`Removendo input de arquivo duplicado com ID ${id}`);
                    input.parentNode.removeChild(input);
                } else {
                    fileInputIds[id] = true;
                }
            });
        }
        
        console.log('Correção de duplicação concluída');
    }, 1000);
});
