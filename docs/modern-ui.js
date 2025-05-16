/**
 * Script para modernizar a interface do usuário
 * Aplica estilos modernos, animações e layout compacto aos elementos da sidebar
 */
(function() {
    // Aguardar o DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[ModernUI] Aplicando estilos modernos...');
        
        // Injetar estilos CSS modernos
        const styles = `
            /* Estilos modernos para a sidebar */
            .sidebar {
                background: linear-gradient(to bottom, #ffffff, #f8f9fa);
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                padding: 15px;
            }
            
            /* Título da aplicação */
            .app-title {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #ffc107;
                animation: fadeIn 0.8s ease;
            }
            
            .app-title .app-title-text {
                font-size: 1.4rem;
                font-weight: 700;
                color: #333;
                letter-spacing: -0.5px;
                margin-bottom: 0;
            }
            
            .app-title .app-title-highlight {
                font-size: 1.6rem;
                color: #ffc107;
                font-weight: 800;
                display: block;
                margin-top: -5px;
                letter-spacing: -0.5px;
            }
            
            /* Campos de data */
            .date-filter-container {
                background-color: #fff;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                animation: slideDown 0.5s ease;
                border: 1px solid #e9ecef;
                transition: all 0.3s ease;
            }
            
            .date-filter-container:hover {
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                transform: translateY(-2px);
            }
            
            .date-filter-container label {
                color: #555;
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 8px;
                display: block;
            }
            
            .date-filter-container .date-inputs {
                display: flex;
                gap: 8px;
            }
            
            .date-filter-container input[type="date"] {
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 0.9rem;
                padding: 8px;
                background-color: #f8f9fa;
                flex: 1;
                transition: all 0.2s ease;
            }
            
            .date-filter-container input[type="date"]:focus {
                border-color: #ffc107;
                box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
                outline: none;
                background-color: #fff;
            }
            
            /* Campo de origem */
            .origin-container {
                background-color: #fff;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                animation: slideDown 0.5s ease;
                animation-delay: 0.1s;
                border: 1px solid #e9ecef;
                transition: all 0.3s ease;
            }
            
            .origin-container:hover {
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            
            .origin-container label {
                color: #555;
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 8px;
                display: block;
            }
            
            .origin-container input[readonly] {
                border: 1px solid #e9ecef;
                border-radius: 6px;
                font-size: 0.9rem;
                padding: 10px;
                background-color: #f0f0f0;
                width: 100%;
                color: #555;
                font-weight: 500;
            }
            
            /* Campo de adicionar local */
            .add-location-container {
                background-color: #fff;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                animation: slideDown 0.5s ease;
                animation-delay: 0.2s;
                border: 1px solid #e9ecef;
                transition: all 0.3s ease;
            }
            
            .add-location-container:hover {
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                transform: translateY(-2px);
            }
            
            .add-location-container label {
                color: #555;
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 8px;
                display: block;
            }
            
            .add-location-container .location-input-group {
                display: flex;
                gap: 5px;
            }
            
            .add-location-container input {
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 0.9rem;
                padding: 10px;
                flex: 1;
                transition: all 0.2s ease;
            }
            
            .add-location-container input:focus {
                border-color: #ffc107;
                box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
                outline: none;
            }
            
            .add-location-container button {
                background-color: #ffc107;
                color: #212529;
                border: none;
                border-radius: 6px;
                font-size: 1rem;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .add-location-container button:hover {
                background-color: #ffca28;
                transform: scale(1.05);
            }
            
            /* Área de upload de arquivos */
            .file-upload-container {
                background-color: #fff;
                border-radius: 10px;
                margin-bottom: 15px;
                animation: slideDown 0.5s ease;
                animation-delay: 0.3s;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .file-upload {
                border: 2px dashed #ffc107;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                background-color: #fffbeb;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .file-upload:hover {
                border-color: #ffab00;
                background-color: #fff8e1;
                transform: scale(1.02);
            }
            
            .file-upload i {
                font-size: 28px;
                color: #ffc107;
                margin-bottom: 10px;
                display: block;
                transition: all 0.3s ease;
            }
            
            .file-upload:hover i {
                transform: translateY(-5px);
            }
            
            .file-upload div {
                color: #666;
                font-weight: 500;
                font-size: 0.95rem;
            }
            
            /* Lista de locais */
            .locations-list-container {
                background-color: #fff;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                animation: slideDown 0.5s ease;
                animation-delay: 0.4s;
                border: 1px solid #e9ecef;
                transition: all 0.3s ease;
            }
            
            .locations-list-container h5 {
                color: #555;
                font-size: 0.9rem;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .locations-list {
                border: 1px solid #ced4da;
                border-radius: 6px;
                max-height: 200px;
                overflow-y: auto;
                background-color: #f9f9f9;
                padding: 0;
            }
            
            .location-item {
                padding: 8px 12px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s ease;
                animation: fadeIn 0.5s ease;
            }
            
            .location-item:hover {
                background-color: #f0f0f0;
            }
            
            .location-item:last-child {
                border-bottom: none;
            }
            
            .location-item .location-name {
                font-size: 0.85rem;
                color: #333;
            }
            
            .location-item button {
                background-color: transparent;
                border: none;
                color: #dc3545;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 5px;
                font-size: 0.8rem;
            }
            
            .location-item button:hover {
                color: #b02a37;
                transform: scale(1.2);
            }
            
            /* Botão de otimizar rota */
            .optimize-button {
                background: linear-gradient(45deg, #ffc107, #ffca28);
                color: #212529;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                padding: 12px 20px;
                width: 100%;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
                animation: pulse 2s infinite;
                margin-top: 5px;
            }
            
            .optimize-button:hover {
                background: linear-gradient(45deg, #ffca28, #ffd54f);
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(255, 193, 7, 0.4);
            }
            
            .optimize-button:active {
                transform: translateY(1px);
                box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
            }
            
            /* Animações */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3); }
                50% { box-shadow: 0 4px 18px rgba(255, 193, 7, 0.5); }
                100% { box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3); }
            }
        `;
        
        // Adicionar o CSS ao documento
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
        
        // Aplicar classes aos elementos existentes
        applyModernClasses();
        
        console.log('[ModernUI] Estilos aplicados com sucesso!');
    });
    
    // Função para aplicar as classes modernas aos elementos existentes
    function applyModernClasses() {
        // Filtro de data
        const dateFilter = document.querySelector('.form-group:has(label:contains("Filtrar eventos por data"))');
        if (dateFilter) {
            dateFilter.classList.add('date-filter-container');
            const dateInputs = dateFilter.querySelector('div[style*="display: flex"]');
            if (dateInputs) {
                dateInputs.classList.add('date-inputs');
            }
        }
        
        // Origem
        const originField = document.querySelector('.form-group:has(label:contains("Origem"))');
        if (originField) {
            originField.classList.add('origin-container');
        }
        
        // Adicionar local
        const addLocationField = document.querySelector('.form-group:has(label:contains("Adicionar local"))');
        if (addLocationField) {
            addLocationField.classList.add('add-location-container');
            const inputGroup = addLocationField.querySelector('div[style*="display: flex"]');
            if (inputGroup) {
                inputGroup.classList.add('location-input-group');
            }
        }
        
        // Upload de arquivo
        const fileUploadArea = document.querySelector('.upload-area');
        if (fileUploadArea) {
            const parent = fileUploadArea.parentNode;
            if (parent) {
                parent.classList.add('file-upload-container');
            }
            fileUploadArea.classList.add('file-upload');
        }
        
        // Lista de locais
        const locationsList = document.querySelector('[id="locations-list"]').parentNode;
        if (locationsList) {
            locationsList.classList.add('locations-list-container');
            const list = document.getElementById('locations-list');
            if (list) {
                list.classList.add('locations-list');
                
                // Adicionar classe a cada item da lista
                const items = list.querySelectorAll('.location-item');
                items.forEach(item => {
                    item.classList.add('location-item');
                });
            }
        }
        
        // Botão de otimizar rota
        const optimizeButton = document.getElementById('optimize-route');
        if (optimizeButton) {
            optimizeButton.classList.add('optimize-button');
        }
    }
    
    // Sobrescrever o querySelector para dar suporte a :contains
    Document.prototype._querySelector = Document.prototype.querySelector;
    Document.prototype.querySelector = function(selector) {
        if (selector.includes(':contains(')) {
            const parts = selector.split(':contains(');
            const baseSelector = parts[0];
            let textToMatch = parts[1].slice(0, -1);
            
            // Remover aspas se presente
            if ((textToMatch.startsWith('"') && textToMatch.endsWith('"')) || 
                (textToMatch.startsWith("'") && textToMatch.endsWith("'"))) {
                textToMatch = textToMatch.slice(1, -1);
            }
            
            const elements = document.querySelectorAll(baseSelector);
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].textContent.includes(textToMatch)) {
                    return elements[i];
                }
            }
            return null;
        }
        return this._querySelector(selector);
    };
    
    // Também sobrescrever o método para elementos
    Element.prototype._querySelector = Element.prototype.querySelector;
    Element.prototype.querySelector = function(selector) {
        if (selector.includes(':contains(')) {
            const parts = selector.split(':contains(');
            const baseSelector = parts[0];
            let textToMatch = parts[1].slice(0, -1);
            
            // Remover aspas se presente
            if ((textToMatch.startsWith('"') && textToMatch.endsWith('"')) || 
                (textToMatch.startsWith("'") && textToMatch.endsWith("'"))) {
                textToMatch = textToMatch.slice(1, -1);
            }
            
            const elements = this.querySelectorAll(baseSelector);
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].textContent.includes(textToMatch)) {
                    return elements[i];
                }
            }
            return null;
        }
        return this._querySelector(selector);
    };
    
    // Observer para aplicar estilos a novos elementos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Reaplica as classes aos elementos quando o DOM é modificado
                setTimeout(applyModernClasses, 100);
            }
        });
    });
    
    // Iniciar o observer depois que o DOM estiver carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();