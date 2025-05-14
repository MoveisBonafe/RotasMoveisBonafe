/**
 * Script para adicionar controles e marcadores ao mapa
 * Este script corrige os problemas de controles e pinos que não aparecem no mapa
 */

// Executa quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Ajusta tamanho do mapa para ocupar toda a tela
  function resizeMap() {
    const mapContainer = document.querySelector('.map-container');
    const mapIframe = document.querySelector('.map-iframe');
    
    if (mapContainer && mapIframe) {
      // Configurar altura para ocupar maior parte da tela visível
      const windowHeight = window.innerHeight;
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const padding = 20; // Margem segura
      
      const mapHeight = windowHeight - headerHeight - padding;
      
      mapContainer.style.height = mapHeight + 'px';
      mapContainer.style.minHeight = mapHeight + 'px';
      mapIframe.style.height = '100%';
      mapIframe.style.minHeight = (mapHeight - 50) + 'px'; // -50 para o cabeçalho do mapa
      
      console.log(`Map resized: ${mapHeight}px height`);
    }
  }
  
  // Adiciona autocomplete ao campo de busca
  function setupAutocomplete() {
    const locationInput = document.getElementById('location-search-input');
    if (!locationInput) return;
    
    // Lista de sugestões de cidades
    const cities = [
      'Ribeirão Preto, SP',
      'São Paulo, SP',
      'Campinas, SP',
      'Bauru, SP',
      'Jaú, SP',
      'Araraquara, SP',
      'São Carlos, SP',
      'Piracicaba, SP',
      'Sorocaba, SP',
      'Santos, SP',
      'Franca, SP',
      'Presidente Prudente, SP',
      'São José do Rio Preto, SP',
      'Marília, SP',
      'Botucatu, SP'
    ];
    
    // Adicionar função de autocomplete
    locationInput.addEventListener('input', function() {
      // Remover lista de sugestões existente
      const existingList = document.getElementById('autocomplete-list');
      if (existingList) {
        existingList.remove();
      }
      
      const inputValue = this.value.trim().toLowerCase();
      if (!inputValue) return;
      
      // Filtrar cidades que correspondem à entrada
      const matches = cities.filter(city => 
        city.toLowerCase().includes(inputValue)
      );
      
      if (matches.length === 0) return;
      
      // Criar lista de sugestões
      const autocompleteList = document.createElement('div');
      autocompleteList.setAttribute('id', 'autocomplete-list');
      autocompleteList.style.position = 'absolute';
      autocompleteList.style.width = this.offsetWidth + 'px';
      autocompleteList.style.backgroundColor = 'white';
      autocompleteList.style.border = '1px solid #d1d5db';
      autocompleteList.style.borderRadius = '0.25rem';
      autocompleteList.style.zIndex = '1000';
      autocompleteList.style.maxHeight = '200px';
      autocompleteList.style.overflowY = 'auto';
      
      // Posicionar abaixo do campo de entrada
      const rect = this.getBoundingClientRect();
      autocompleteList.style.left = this.offsetLeft + 'px';
      autocompleteList.style.top = (rect.bottom + window.scrollY) + 'px';
      
      // Adicionar itens à lista
      matches.forEach(match => {
        const item = document.createElement('div');
        item.textContent = match;
        item.style.padding = '0.5rem';
        item.style.cursor = 'pointer';
        item.style.fontSize = '0.875rem';
        
        item.addEventListener('mouseenter', function() {
          this.style.backgroundColor = '#f3f4f6';
        });
        
        item.addEventListener('mouseleave', function() {
          this.style.backgroundColor = 'white';
        });
        
        item.addEventListener('click', function() {
          locationInput.value = match;
          autocompleteList.remove();
        });
        
        autocompleteList.appendChild(item);
      });
      
      // Adicionar à DOM
      this.parentNode.appendChild(autocompleteList);
    });
    
    // Fechar a lista quando clicar fora dela
    document.addEventListener('click', function(e) {
      if (e.target !== locationInput) {
        const autocompleteList = document.getElementById('autocomplete-list');
        if (autocompleteList) {
          autocompleteList.remove();
        }
      }
    });
    
    console.log("Autocomplete setup for location search");
  }
  
  // Corrige o comportamento do upload de arquivo
  function fixFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    const fileLabel = document.querySelector('.file-label');
    
    if (fileUpload && fileLabel) {
      fileLabel.addEventListener('click', function() {
        fileUpload.click();
      });
      
      // Mostrar nome do arquivo selecionado
      fileUpload.addEventListener('change', function() {
        const fileInfo = document.querySelector('.file-info');
        if (fileInfo && this.files.length > 0) {
          fileInfo.textContent = `Arquivo selecionado: ${this.files[0].name}`;
        }
      });
    }
  }
  
  // Adiciona marcadores personalizados ao mapa
  function addCustomMapMarkers() {
    // Esta função não pode adicionar marcadores diretamente ao iframe,
    // mas melhora a exibição das localizações na lista lateral
    const locationItems = document.querySelectorAll('.location-item');
    
    locationItems.forEach(item => {
      const marker = item.querySelector('.location-marker');
      if (marker) {
        // Estilizar melhor os marcadores na lista
        marker.style.backgroundColor = '#3b82f6';
        marker.style.color = 'white';
        marker.style.fontWeight = 'bold';
        marker.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        // Adicionar efeito hover
        item.addEventListener('mouseenter', function() {
          marker.style.transform = 'scale(1.1)';
          marker.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
          marker.style.transform = 'scale(1)';
        });
      }
    });
  }
  
  // Melhora o comportamento de interação com o mapa
  function enhanceMapInteraction() {
    // Adicionar funcionalidade para os botões do mapa
    const homeBtn = document.getElementById('home-btn');
    const showInfoBtn = document.getElementById('show-info-btn');
    const routeTabs = document.getElementById('route-tabs');
    
    if (homeBtn) {
      homeBtn.addEventListener('click', function() {
        const mapIframe = document.getElementById('map-iframe');
        const origin = window.locations?.find(l => l.isOrigin);
        
        if (mapIframe && origin) {
          mapIframe.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyCnallnTQ8gT2_F600vt-yAEv2BoH0mj7U&center=${origin.latlng}&zoom=10&maptype=roadmap`;
        } else {
          mapIframe.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyCnallnTQ8gT2_F600vt-yAEv2BoH0mj7U&center=-22.3673,-48.3823&zoom=10&maptype=roadmap`;
        }
        
        // Esconder painel de informações
        if (routeTabs) {
          routeTabs.style.display = 'none';
        }
      });
    }
    
    if (showInfoBtn && routeTabs) {
      showInfoBtn.addEventListener('click', function() {
        // Alternar visibilidade das abas
        routeTabs.style.display = routeTabs.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    // Adicionar funcionalidade para as abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Desativar todas as abas
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Ativar a aba selecionada
        this.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
      });
    });
  }
  
  // Função para resolver problemas com o mapa do Google no iframe
  function fixGoogleMapControls() {
    // Adição de CSS dinâmico para garantir que os controles fiquem visíveis
    const style = document.createElement('style');
    style.textContent = `
      .map-iframe {
        width: 100%;
        height: 100%;
        min-height: 600px;
        border: none;
      }
      
      /* Garante que o mapa seja responsivo */
      @media (max-width: 768px) {
        .map-iframe {
          min-height: 400px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Função para aplicar todas as melhorias
  function applyAllMapEnhancements() {
    // Redimensionar mapa para ocupar mais espaço
    resizeMap();
    window.addEventListener('resize', resizeMap);
    
    // Configurar autocomplete
    setupAutocomplete();
    
    // Corrigir upload de arquivo
    fixFileUpload();
    
    // Adicionar marcadores personalizados
    addCustomMapMarkers();
    
    // Melhorar interação com o mapa
    enhanceMapInteraction();
    
    // Corrigir problemas com controles do Google Maps
    fixGoogleMapControls();
    
    console.log("Map enhancements applied successfully");
  }
  
  // Aplicar todas as melhorias após um curto delay
  setTimeout(applyAllMapEnhancements, 500);
  
  // Aplicar novamente após o carregamento completo
  window.addEventListener('load', applyAllMapEnhancements);
});