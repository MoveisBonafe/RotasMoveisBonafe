// Estabilizar e estilizar a sidebar imediatamente
function stabilizeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    // Estilos base da sidebar
    sidebar.style.position = 'absolute';
    sidebar.style.top = '0';
    sidebar.style.left = '0';
    sidebar.style.bottom = '60px';
    sidebar.style.width = '380px';
    sidebar.style.backgroundColor = '#f8f9fa';
    sidebar.style.overflowY = 'auto';
    sidebar.style.zIndex = '10';
    sidebar.style.transition = 'all 0.3s ease';
    sidebar.style.boxShadow = '2px 0 15px rgba(0,0,0,0.08)';
    sidebar.style.padding = '20px';

    // Estilizar campos de data
    const dateInputs = sidebar.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.style.width = '100%';
      input.style.padding = '12px';
      input.style.border = '1px solid #ffe082';
      input.style.borderRadius = '8px';
      input.style.marginBottom = '10px';
      input.style.transition = 'all 0.3s ease';
      input.style.backgroundColor = '#fff';
      input.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
    });

    // Estilizar campo de origem
    const originInput = document.getElementById('origin');
    if (originInput) {
      originInput.style.backgroundColor = '#fff8e1';
      originInput.style.border = '1px solid #ffe082';
      originInput.style.borderRadius = '8px';
      originInput.style.padding = '12px';
      originInput.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
      originInput.style.transition = 'all 0.3s ease';
    }

    // Estilizar campo de busca de local
    const locationSearch = document.getElementById('location-search');
    if (locationSearch) {
      locationSearch.style.width = '100%';
      locationSearch.style.padding = '12px';
      locationSearch.style.border = '1px solid #ffe082';
      locationSearch.style.borderRadius = '8px';
      locationSearch.style.transition = 'all 0.3s ease';
      locationSearch.style.backgroundColor = '#fff';
      locationSearch.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
    }

    // Estilizar área de upload de arquivo
    const fileUpload = document.querySelector('.file-upload');
    if (fileUpload) {
      fileUpload.style.border = '2px dashed #ffc107';
      fileUpload.style.borderRadius = '8px';
      fileUpload.style.padding = '20px';
      fileUpload.style.textAlign = 'center';
      fileUpload.style.backgroundColor = '#fffbeb';
      fileUpload.style.transition = 'all 0.3s ease';
      fileUpload.style.cursor = 'pointer';
      fileUpload.style.marginTop = '20px';
      fileUpload.style.marginBottom = '20px';
    }

    const toggleIcon = document.getElementById('toggle-icon');
    if (toggleIcon) {
        toggleIcon.textContent = '▲ Expandir';
    }

    // Ajustar dimensões dos botões principais
    const viewButton = document.getElementById('view-current-route');
    const optimizeButton = document.getElementById('optimize-route');

    if (viewButton && optimizeButton) {
        // Configurar dimensões iguais para ambos os botões
        const buttonStyles = {
            height: '48px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            borderRadius: '24px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        };

        // Aplicar estilos ao botão Visualizar
        const commonStyles = {
            backgroundColor: '#ffab00',
            color: '#000000',
            border: 'none',
            height: '48px',
            lineHeight: '48px',
            textTransform: 'none',
            fontVariant: 'normal',
            fontFeatureSettings: 'normal'
        };

        Object.assign(viewButton.style, buttonStyles, commonStyles);
        Object.assign(optimizeButton.style, buttonStyles, commonStyles);
        // Forçar texto no formato correto
        if (optimizeButton.innerHTML.includes('OTIMIZAR')) {
            optimizeButton.innerHTML = optimizeButton.innerHTML.replace(/OTIMIZAR ROTA/i, 'Otimizar Rota');
        }
    }

    // Adicionar hover effects
    addHoverEffects();
  }
}

// Adicionar efeitos de hover
function addHoverEffects() {
  const inputs = document.querySelectorAll('input[type="date"], input[type="text"], .file-upload');
  inputs.forEach(input => {
    input.addEventListener('mouseover', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 8px rgba(255, 193, 7, 0.15)';
    });

    input.addEventListener('mouseout', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
    });
  });

  const optimizeBtn = document.getElementById('optimize-route');
  if (optimizeBtn) {
    optimizeBtn.addEventListener('mouseover', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
      this.style.backgroundColor = '#ffb300';
    });

    optimizeBtn.addEventListener('mouseout', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      this.style.backgroundColor = '#ffc107';
    });
  }
}

// Executar estabilização imediatamente e após carregamento
stabilizeSidebar();
document.addEventListener('DOMContentLoaded', function() {
  stabilizeSidebar();
});

// Script para corrigir problemas com a versão GitHub Pages
window.locationOrder = []; // Array para armazenar a ordem das localizações
document.addEventListener('DOMContentLoaded', function() {
  // Ajustar tamanho do mapa e da sidebar
  const fixLayout = function() {
    const sidebar = document.querySelector('.sidebar');
    const mapContainer = document.querySelector('.map-container');
    const mapIframe = document.querySelector('.map-iframe');

    if (sidebar && mapContainer) {
      // Ajustes de tamanho para sidebar
      sidebar.style.width = '400px';
      sidebar.style.height = 'calc(100vh - 200px)';
      sidebar.style.minHeight = '600px';
      sidebar.style.overflowY = 'auto';

      // Ajustes para o container do mapa
      mapContainer.style.flex = '1';
      mapContainer.style.height = 'calc(100vh - 200px)';
      mapContainer.style.minHeight = '600px';

      console.log("Layout ajustado - sidebar e mapa aumentados");
    }

    if (mapIframe) {
      // Certificar que o iframe ocupa toda a área disponível
      mapIframe.style.width = '100%';
      mapIframe.style.height = '100%';
      mapIframe.style.minHeight = '550px';

      // Verificar se o iframe já tem o parâmetro de mapa correto
      const src = mapIframe.src;
      if (!src.includes('&maptype=roadmap')) {
        mapIframe.src = src + '&maptype=roadmap';
      }

      console.log("Iframe do mapa ajustado para exibir Pegman");
    }
  };

  // Melhorar função de geocodificação para CEPs
  window.cepCoordinates = {
    // Interior SP
    "14000": { city: "Ribeirão Preto", lat: -21.1775, lng: -47.8103 },
    "14010": { city: "Ribeirão Preto", lat: -21.1790, lng: -47.8153 },
    "14050": { city: "Ribeirão Preto", lat: -21.1750, lng: -47.8203 },
    "14100": { city: "Ribeirão Preto", lat: -21.1755, lng: -47.8253 },
    "14400": { city: "Franca", lat: -20.5390, lng: -47.4013 },
    "17300": { city: "Dois Córregos", lat: -22.3673, lng: -48.3823 },
    "17350": { city: "Jaú", lat: -22.2936, lng: -48.5592 },
    "17380": { city: "Brotas", lat: -22.2792, lng: -48.1250 },
    "17900": { city: "Dracena", lat: -21.4843, lng: -51.5352 },
    "18000": { city: "Sorocaba", lat: -23.5015, lng: -47.4526 },
    "18300": { city: "Piedade", lat: -23.7111, lng: -47.4256 },
    "19000": { city: "Presidente Prudente", lat: -22.1208, lng: -51.3882 },
    // Capital
    "01000": { city: "São Paulo", lat: -23.5505, lng: -46.6333 },
    "01020": { city: "São Paulo", lat: -23.5515, lng: -46.6343 },
    "04000": { city: "São Paulo", lat: -23.6216, lng: -46.6388 },
    "05000": { city: "São Paulo", lat: -23.5329, lng: -46.7108 },
    // Outras cidades
    "13000": { city: "Campinas", lat: -22.9071, lng: -47.0628 },
    "13300": { city: "Itu", lat: -23.2636, lng: -47.2992 },
    "13500": { city: "Rio Claro", lat: -22.4065, lng: -47.5613 },
    "13600": { city: "Araras", lat: -22.3572, lng: -47.3839 },
    "15000": { city: "São José do Rio Preto", lat: -20.8113, lng: -49.3758 }
  };

  // Iniciar as correções
  fixLayout();
  
  // Aplicar outras correções específicas
  if (typeof patchCepImport === 'function') patchCepImport();
  if (typeof enhanceAddressSearch === 'function') enhanceAddressSearch();
  if (typeof setupPiedadeFix === 'function') setupPiedadeFix();
});

// Funções de utilidade para o fix-github.js

// Função para verificar se uma cidade está no percurso atual
function isCityInRoute(cityName) {
  // Normalizar o nome da cidade para fazer a comparação
  cityName = cityName.trim().toLowerCase();
  
  // Verificar no título do percurso
  const percursoElement = document.querySelector('.restrictions-list div[style*="background-color: rgb(255, 193, 7)"] span');
  if (percursoElement) {
    const textoPecurso = percursoElement.textContent || '';
    if (textoPecurso.toLowerCase().includes(cityName)) {
      return true;
    }
  }
  
  // Verificar nas cidades listadas com marcação "Esta cidade está no seu percurso"
  const cidadesNoPercurso = document.querySelectorAll('.city-in-route');
  for (let i = 0; i < cidadesNoPercurso.length; i++) {
    const elemento = cidadesNoPercurso[i];
    const elementoCidade = elemento.previousElementSibling?.previousElementSibling?.querySelector('span');
    if (elementoCidade && elementoCidade.textContent && elementoCidade.textContent.toLowerCase().includes(cityName)) {
      return true;
    }
  }
  
  return false;
}

// Configuração específica para corrigir problema de Piedade
function setupPiedadeFix() {
  console.log("Iniciando correção para eventos de Piedade...");
  
  // Função para corrigir a exibição dos eventos de Piedade
  function corrigirEventosPiedade() {
    // Corrigir a data de Piedade em todos os elementos visuais
    document.querySelectorAll('.event-date, .event-title, .event-description').forEach(elemento => {
      const texto = elemento.textContent || '';
      
      // Verificar se é um elemento relacionado a Piedade
      if (texto.toLowerCase().includes('piedade')) {
        // Corrigir data se estiver incorreta
        if (texto.includes('19/05') || texto.includes('18/03')) {
          // Se for um elemento com o formato "Piedade | DATA"
          if (texto.includes('|')) {
            const partes = texto.split('|');
            elemento.textContent = `${partes[0].trim()} | 20/05/2025`;
            console.log("Corrigida data de Piedade para 20/05/2025");
          } 
          // Se for um elemento com descrição completa
          else if (texto.includes('Aniversário de fundação')) {
            elemento.textContent = texto.replace(/em \d{2}\/\d{2}(\/\d{4})?/, "em 20/05/1842");
            console.log("Corrigida descrição de Piedade");
          }
        }
      }
    });
    
    // Verificar se Piedade está no percurso atual
    const piedadeNoPercurso = isCityInRoute('piedade');
    
    // Ocultar ou mostrar eventos de Piedade conforme necessário
    document.querySelectorAll('.event-item').forEach(eventoElement => {
      const textoEvento = eventoElement.textContent || '';
      
      // Verificar se é um evento de Piedade
      if (textoEvento.toLowerCase().includes('piedade')) {
        if (piedadeNoPercurso) {
          eventoElement.style.display = '';
          console.log("Mostrando evento de Piedade (cidade no percurso)");
        } else {
          eventoElement.style.display = 'none';
          console.log("Ocultando evento de Piedade (cidade fora do percurso)");
        }
      }
    });
  }
  
  // Executar a correção após um curto período de tempo
  setTimeout(corrigirEventosPiedade, 1000);
  setTimeout(corrigirEventosPiedade, 3000);
  
  // Adicionar observador para mudanças na lista de eventos
  const observer = new MutationObserver(function(mutations) {
    setTimeout(corrigirEventosPiedade, 300);
  });
  
  // Observar mudanças em todo o documento
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Também corrigir quando o usuário interage com a página
  document.addEventListener('click', function() {
    setTimeout(corrigirEventosPiedade, 300);
  });
}