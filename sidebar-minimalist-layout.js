/**
 * Script para aplicar layout minimalista à sidebar de rotas alternativas
 * Remove informações de tempo e distância e moderniza o design
 */

(function() {
  'use strict';
  
  console.log('🎨 [SidebarMinimalist] Iniciando aplicação do layout minimalista...');
  
  // Função para aplicar estilos minimalistas
  function applyMinimalistStyles() {
    const style = document.createElement('style');
    style.id = 'minimalist-sidebar-styles';
    style.textContent = `
      /* Ocultar informações de tempo e distância */
      .sidebar .route-option .time-info,
      .sidebar .route-option .distance-info,
      .sidebar [class*="route"] .time-info,
      .sidebar [class*="route"] .distance-info,
      .sidebar .route-option span:contains("km"),
      .sidebar .route-option span:contains("min"),
      .sidebar .route-option span:contains("h ") {
        display: none !important;
      }
      
      /* Ocultar textos de tempo e distância específicos */
      .sidebar .route-option *:not(.route-title) {
        font-size: 0 !important;
      }
      
      .sidebar .route-option .route-title {
        font-size: 14px !important;
      }
      
      /* Layout minimalista para opções de rota */
      .sidebar .route-option,
      .sidebar [class*="route-option"] {
        background: linear-gradient(135deg, #f8f9fa, #ffffff) !important;
        border: none !important;
        border-left: 4px solid #007bff !important;
        border-radius: 12px !important;
        padding: 16px !important;
        margin-bottom: 12px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
      }
      
      /* Cores específicas para cada tipo de rota */
      .sidebar .route-option:nth-child(1),
      .sidebar [class*="otimizada"] {
        border-left-color: #28a745 !important;
        background: linear-gradient(135deg, #f0fff4, #ffffff) !important;
      }
      
      .sidebar .route-option:nth-child(2),
      .sidebar [class*="proximidade"] {
        border-left-color: #fd7e14 !important;
        background: linear-gradient(135deg, #fff8f0, #ffffff) !important;
      }
      
      .sidebar .route-option:nth-child(3),
      .sidebar [class*="distante"] {
        border-left-color: #6f42c1 !important;
        background: linear-gradient(135deg, #f8f4ff, #ffffff) !important;
      }
      
      /* Hover effects */
      .sidebar .route-option:hover,
      .sidebar [class*="route-option"]:hover {
        transform: translateX(4px) !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
      }
      
      /* Estado selecionado */
      .sidebar .route-option.selected,
      .sidebar .route-option.active {
        transform: translateX(4px) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
      }
      
      .sidebar [class*="otimizada"].selected,
      .sidebar [class*="otimizada"].active {
        background: linear-gradient(135deg, #28a745, #20c997) !important;
        color: white !important;
      }
      
      .sidebar [class*="proximidade"].selected,
      .sidebar [class*="proximidade"].active {
        background: linear-gradient(135deg, #fd7e14, #ffc107) !important;
        color: white !important;
      }
      
      .sidebar [class*="distante"].selected,
      .sidebar [class*="distante"].active {
        background: linear-gradient(135deg, #6f42c1, #e83e8c) !important;
        color: white !important;
      }
      
      /* Badges de recomendação */
      .sidebar .route-option .badge,
      .sidebar .route-option .tag {
        background: rgba(0,123,255,0.1) !important;
        color: #007bff !important;
        border-radius: 20px !important;
        padding: 4px 12px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        margin-left: 8px !important;
      }
      
      /* Ícones modernos */
      .sidebar .route-option::before {
        content: '' !important;
        width: 12px !important;
        height: 12px !important;
        border-radius: 50% !important;
        display: inline-block !important;
        margin-right: 12px !important;
      }
      
      .sidebar [class*="otimizada"]::before {
        background: #28a745 !important;
      }
      
      .sidebar [class*="proximidade"]::before {
        background: #fd7e14 !important;
      }
      
      .sidebar [class*="distante"]::before {
        background: #6f42c1 !important;
      }
      
      /* Seção de rotas alternativas */
      .sidebar .alternative-routes-section,
      .sidebar #route-alternatives-sidebar {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
        border-radius: 16px !important;
        padding: 20px !important;
        margin: 16px 0 !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
      }
      
      .sidebar .alternative-routes-section h5,
      .sidebar .alternative-routes-section h3 {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: #495057 !important;
        margin-bottom: 8px !important;
      }
      
      .sidebar .alternative-routes-section p {
        color: #6c757d !important;
        font-size: 14px !important;
        margin-bottom: 16px !important;
      }
    `;
    
    // Remover estilo anterior se existir
    const existingStyle = document.getElementById('minimalist-sidebar-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    console.log('🎨 [SidebarMinimalist] Estilos minimalistas aplicados');
  }
  
  // Função para remover informações de tempo e distância do DOM
  function removeTimeDistanceInfo() {
    // Selecionar todos os elementos que contêm km, min, h
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      const text = element.textContent || '';
      const isRouteOption = element.closest('.route-option') || 
                           element.closest('[class*="route"]') ||
                           element.closest('.alternative-routes-section');
      
      if (isRouteOption) {
        // Se o elemento contém informações de tempo ou distância
        if (text.match(/\d+[\.,]?\d*\s*km/) || 
            text.match(/\d+\s*min/) || 
            text.match(/\d+h\s*\d*min?/) ||
            text.match(/\d+h\s+\d+min/)) {
          
          // Se é um elemento pequeno (span, small, etc), ocultar completamente
          if (['SPAN', 'SMALL', 'DIV'].includes(element.tagName) && 
              element.children.length === 0) {
            element.style.display = 'none';
            console.log('🎨 [SidebarMinimalist] Ocultado elemento:', text.trim());
          }
          // Se é um elemento maior, remover apenas o texto de tempo/distância
          else if (element.children.length === 0) {
            const cleanText = text.replace(/\d+[\.,]?\d*\s*km/g, '')
                                 .replace(/\d+\s*min/g, '')
                                 .replace(/\d+h\s*\d*min?/g, '')
                                 .replace(/\d+h\s+\d+min/g, '')
                                 .trim();
            if (cleanText !== text.trim()) {
              element.textContent = cleanText;
              console.log('🎨 [SidebarMinimalist] Texto limpo:', cleanText);
            }
          }
        }
      }
    });
  }
  
  // Função para adicionar ícones modernos
  function addModernIcons() {
    const routeOptions = document.querySelectorAll('.route-option, [class*="route-option"]');
    
    routeOptions.forEach((option, index) => {
      const text = option.textContent || '';
      let iconType = '';
      
      if (text.includes('Otimizada') || text.includes('Recomendada')) {
        iconType = 'optimized';
      } else if (text.includes('Proximidade')) {
        iconType = 'proximity';
      } else if (text.includes('Distante')) {
        iconType = 'distant';
      }
      
      // Adicionar classe para identificação
      if (iconType) {
        option.classList.add(`route-${iconType}`);
      }
    });
  }
  
  // Função principal de aplicação
  function applyMinimalistLayout() {
    console.log('🎨 [SidebarMinimalist] Aplicando layout minimalista...');
    
    // Aplicar estilos
    applyMinimalistStyles();
    
    // Aguardar um pouco para o DOM carregar
    setTimeout(() => {
      removeTimeDistanceInfo();
      addModernIcons();
      
      console.log('🎨 [SidebarMinimalist] Layout minimalista aplicado com sucesso!');
    }, 500);
  }
  
  // Observar mudanças no DOM para reaplicar quando necessário
  function observeChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const hasRouteOptions = node.querySelector && 
                                    (node.querySelector('.route-option') ||
                                     node.querySelector('[class*="route"]') ||
                                     node.classList.contains('route-option'));
              if (hasRouteOptions) {
                shouldReapply = true;
              }
            }
          });
        }
      });
      
      if (shouldReapply) {
        console.log('🎨 [SidebarMinimalist] Detectadas mudanças, reaplicando layout...');
        setTimeout(applyMinimalistLayout, 300);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('🎨 [SidebarMinimalist] Observer configurado');
  }
  
  // Executar quando a página carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(applyMinimalistLayout, 1000);
      observeChanges();
    });
  } else {
    setTimeout(applyMinimalistLayout, 1000);
    observeChanges();
  }
  
  // Executar periodicamente para garantir que seja aplicado
  setInterval(() => {
    const routeOptions = document.querySelectorAll('.route-option, [class*="route"]');
    if (routeOptions.length > 0) {
      // Verificar se ainda há informações de tempo/distância visíveis
      let hasTimeDistance = false;
      routeOptions.forEach(option => {
        const text = option.textContent || '';
        if (text.match(/\d+[\.,]?\d*\s*km/) || text.match(/\d+\s*min/) || text.match(/\d+h\s*\d*min?/)) {
          hasTimeDistance = true;
        }
      });
      
      if (hasTimeDistance) {
        console.log('🎨 [SidebarMinimalist] Detectado tempo/distância, reaplicando...');
        applyMinimalistLayout();
      }
    }
  }, 3000);
  
})();