/**
 * Script para modernizar a interface do usuário - Versão simplificada
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
            .app-title-text {
                font-size: 1.4rem !important;
                font-weight: 700 !important;
                color: #333 !important;
                letter-spacing: -0.5px !important;
                margin-bottom: 0 !important;
                animation: fadeIn 0.8s ease !important;
            }
            
            .app-title-highlight {
                font-size: 1.6rem !important;
                color: #ffc107 !important;
                font-weight: 800 !important;
                display: block !important;
                margin-top: -5px !important;
                letter-spacing: -0.5px !important;
                animation: fadeIn 0.8s ease !important;
            }
            
            /* Campos de formulário */
            .form-group {
                background-color: #fff !important;
                border-radius: 10px !important;
                padding: 12px !important;
                margin-bottom: 15px !important;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05) !important;
                animation: slideDown 0.5s ease !important;
                border: 1px solid #e9ecef !important;
                transition: all 0.3s ease !important;
            }
            
            .form-group:hover {
                box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
                transform: translateY(-2px) !important;
            }
            
            .form-group label {
                color: #555 !important;
                font-size: 0.85rem !important;
                font-weight: 600 !important;
                margin-bottom: 8px !important;
                display: block !important;
            }
            
            /* Inputs de data */
            input[type="date"] {
                border: 1px solid #ced4da !important;
                border-radius: 6px !important;
                font-size: 0.9rem !important;
                padding: 8px !important;
                background-color: #f8f9fa !important;
                transition: all 0.2s ease !important;
            }
            
            input[type="date"]:focus {
                border-color: #ffc107 !important;
                box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2) !important;
                outline: none !important;
                background-color: #fff !important;
            }
            
            /* Campo de origem */
            input[readonly] {
                border: 1px solid #e9ecef !important;
                border-radius: 6px !important;
                font-size: 0.9rem !important;
                padding: 10px !important;
                background-color: #f0f0f0 !important;
                color: #555 !important;
                font-weight: 500 !important;
            }
            
            /* Campos de texto */
            input[type="text"] {
                border: 1px solid #ced4da !important;
                border-radius: 6px !important;
                font-size: 0.9rem !important;
                padding: 10px !important;
                transition: all 0.2s ease !important;
            }
            
            input[type="text"]:focus {
                border-color: #ffc107 !important;
                box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2) !important;
                outline: none !important;
            }
            
            /* Botões normais */
            button:not(#optimize-route) {
                background-color: #ffc107 !important;
                color: #212529 !important;
                border: none !important;
                border-radius: 6px !important;
                font-size: 1rem !important;
                padding: 8px 12px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            button:not(#optimize-route):hover {
                background-color: #ffca28 !important;
                transform: scale(1.05) !important;
            }
            
            /* Área de upload de arquivo */
            .upload-area {
                border: 2px dashed #ffc107 !important;
                padding: 20px !important;
                text-align: center !important;
                border-radius: 8px !important;
                background-color: #fffbeb !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
                margin: 15px 0 !important;
            }
            
            .upload-area:hover {
                border-color: #ffab00 !important;
                background-color: #fff8e1 !important;
                transform: scale(1.02) !important;
            }
            
            .upload-area i {
                font-size: 28px !important;
                color: #ffc107 !important;
                margin-bottom: 10px !important;
                display: block !important;
                transition: all 0.3s ease !important;
            }
            
            .upload-area:hover i {
                transform: translateY(-5px) !important;
            }
            
            /* Lista de locais */
            #locations-list {
                border: 1px solid #ced4da !important;
                border-radius: 6px !important;
                max-height: 200px !important;
                overflow-y: auto !important;
                background-color: #f9f9f9 !important;
                padding: 10px !important;
            }
            
            /* Botão de otimizar rota */
            #optimize-route {
                background: linear-gradient(45deg, #ffc107, #ffca28) !important;
                color: #212529 !important;
                border: none !important;
                border-radius: 8px !important;
                font-size: 1rem !important;
                font-weight: 600 !important;
                padding: 12px 20px !important;
                width: 100% !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3) !important;
                animation: pulse 2s infinite !important;
                margin-top: 5px !important;
            }
            
            #optimize-route:hover {
                background: linear-gradient(45deg, #ffca28, #ffd54f) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 15px rgba(255, 193, 7, 0.4) !important;
            }
            
            #optimize-route:active {
                transform: translateY(1px) !important;
                box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3) !important;
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
        
        console.log('[ModernUI] Estilos aplicados com sucesso!');
    });
})();