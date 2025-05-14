/**
 * Script para forçar a resolução de CEPs com coordenadas corretas
 * Este script usa um banco de dados embutido de CEPs comuns para resolver
 * o problema de geocodificação no GitHub Pages
 */
(function() {
  console.log('[CEP-Force] Inicializando banco de dados de CEPs');
  
  // CEPs comuns com coordenadas pré-definidas
  var CEP_DATABASE = {
    "14010000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14020000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14030000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14040000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14050000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14060000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14070000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14080000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    "14090000": { city: "Ribeirão Preto", lat: -21.1704, lng: -47.8103 },
    
    "13010000": { city: "Campinas", lat: -22.9071, lng: -47.0632 },
    "13020000": { city: "Campinas", lat: -22.9071, lng: -47.0632 },
    "13030000": { city: "Campinas", lat: -22.9071, lng: -47.0632 },
    "13040000": { city: "Campinas", lat: -22.9071, lng: -47.0632 },
    "13050000": { city: "Campinas", lat: -22.9071, lng: -47.0632 },
    
    "17010000": { city: "Bauru", lat: -22.3147, lng: -49.0606 },
    "17020000": { city: "Bauru", lat: -22.3147, lng: -49.0606 },
    "17030000": { city: "Bauru", lat: -22.3147, lng: -49.0606 },
    
    "17210000": { city: "Jaú", lat: -22.2967, lng: -48.5578 },
    "17220000": { city: "Jaú", lat: -22.2967, lng: -48.5578 },
    
    "13400000": { city: "Piracicaba", lat: -22.7338, lng: -47.6477 },
    "13410000": { city: "Piracicaba", lat: -22.7338, lng: -47.6477 },
    
    "13560000": { city: "São Carlos", lat: -22.0087, lng: -47.8909 },
    "13570000": { city: "São Carlos", lat: -22.0087, lng: -47.8909 },
    
    "17300000": { city: "Dois Córregos", lat: -22.3731, lng: -48.3796 },
    "17301000": { city: "Dois Córregos", lat: -22.3731, lng: -48.3796 },
    
    "17380000": { city: "Mineiros do Tietê", lat: -22.4119, lng: -48.4501 }
  };
  
  // CEPs por cidade (busca aproximada)
  var CITY_CEPS = {
    "ribeirao": ["14010000"],
    "campinas": ["13010000"],
    "bauru": ["17010000"],
    "jau": ["17210000"],
    "piracicaba": ["13400000"],
    "sao carlos": ["13560000"],
    "dois corregos": ["17300000"],
    "mineiros": ["17380000"]
  };
  
  // Inicializar após carregamento da página
  document.addEventListener('DOMContentLoaded', inicializar);
  window.addEventListener('load', inicializar);
  
  // Tentar iniciar mais tarde também
  setTimeout(inicializar, 1000);
  setTimeout(inicializar, 2000);
  
  // Flag de controle
  var instalado = false;
  
  /**
   * Inicializar o script e instalar o banco de dados de CEPs
   */
  function inicializar() {
    if (instalado) return;
    
    console.log('[CEP-Force] Instalando banco de dados de CEPs...');
    
    // Expor função global de busca de CEPs
    window.getCepCoordinates = getCepCoordinates;
    window.CEP_DATABASE = CEP_DATABASE;
    window.CITY_CEPS = CITY_CEPS;
    
    // Interceptar funções existentes se necessário
    if (typeof window.geocodeCEP === 'function') {
      var originalGeocodeCEP = window.geocodeCEP;
      
      window.geocodeCEP = function(cep) {
        console.log('[CEP-Force] Interceptando geocodeCEP para:', cep);
        
        // Tentar primeiro nosso banco de dados
        var result = getCepCoordinates(cep);
        
        if (result) {
          console.log('[CEP-Force] CEP encontrado no banco de dados local:', result);
          
          // Formato esperado pela aplicação
          return {
            then: function(callback) {
              callback({
                lat: result.lat,
                lng: result.lng,
                city: result.city,
                formatted_address: result.city + ", SP"
              });
              
              // Compatibilidade com promises
              return {
                catch: function() { return this; }
              };
            }
          };
        }
        
        // Se não encontrou, delegar para a função original
        console.log('[CEP-Force] CEP não encontrado no banco local, usando função original');
        return originalGeocodeCEP(cep);
      };
      
      console.log('[CEP-Force] Função geocodeCEP substituída com sucesso');
    }
    
    // Instalar interceptador de upload de arquivo
    interceptarFileUpload();
    
    instalado = true;
    console.log('[CEP-Force] Banco de dados de CEPs instalado com sucesso');
  }
  
  /**
   * Obter coordenadas de um CEP (sem formatação, apenas números)
   */
  function getCepCoordinates(cep) {
    // Remover formatação
    cep = cep.replace(/\D/g, '');
    
    // Verificar se temos o CEP exato
    if (CEP_DATABASE[cep]) {
      return CEP_DATABASE[cep];
    }
    
    // Se não, tentar CEP com final 000
    var cepBase = cep.substring(0, 5) + '000';
    if (CEP_DATABASE[cepBase]) {
      return CEP_DATABASE[cepBase];
    }
    
    // Por último, verificar se temos o nome da cidade
    if (cep.length <= 3) {
      // Pesquisa por parte do nome da cidade
      for (var cidade in CITY_CEPS) {
        if (cidade.includes(cep.toLowerCase())) {
          var cepCidade = CITY_CEPS[cidade][0];
          return CEP_DATABASE[cepCidade];
        }
      }
    }
    
    return null;
  }
  
  /**
   * Instala um interceptador no upload de arquivo
   */
  function interceptarFileUpload() {
    // Monitorar mudanças no DOM
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Verificar novos nós
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return; // Não é um elemento
          
          // Procurar elementos input type=file
          var fileInputs = node.querySelectorAll ? 
                           node.querySelectorAll('input[type="file"]') : [];
          
          if (node.tagName === 'INPUT' && node.type === 'file') {
            fileInputs = [node];
          }
          
          // Aplicar interceptador a cada input
          fileInputs.forEach(function(input) {
            aplicarInterceptadorArquivo(input);
          });
        });
      });
    });
    
    // Verificar elementos já existentes
    var fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(function(input) {
      aplicarInterceptadorArquivo(input);
    });
    
    // Observar mudanças no DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Aplica interceptação no input de arquivo
   */
  function aplicarInterceptadorArquivo(input) {
    if (input.dataset.cepForceInstalled) return;
    
    // Marcar como instalado
    input.dataset.cepForceInstalled = "true";
    
    console.log('[CEP-Force] Instalando interceptador em input de arquivo:', input);
    
    // Clonar para remover listeners
    var clone = input.cloneNode(true);
    if (input.parentNode) {
      input.parentNode.replaceChild(clone, input);
    }
    
    // Adicionar nosso listener
    clone.addEventListener('change', function(e) {
      console.log('[CEP-Force] Arquivo selecionado:', e.target.files[0]);
      
      var file = e.target.files[0];
      if (!file) return;
      
      // Ler o arquivo
      var reader = new FileReader();
      
      reader.onload = function(event) {
        var conteudo = event.target.result;
        console.log('[CEP-Force] Conteúdo do arquivo:', conteudo);
        
        // Processar o conteúdo
        var novoConteudo = processarArquivoCEP(conteudo);
        
        // Substituir o arquivo original
        if (novoConteudo !== conteudo) {
          console.log('[CEP-Force] Conteúdo do arquivo modificado:', novoConteudo);
          
          // Criar arquivo modificado
          var novoArquivo = new File([novoConteudo], file.name, {
            type: file.type,
            lastModified: file.lastModified
          });
          
          // Criar DataTransfer para simular novo arquivo
          var dataTransfer = new DataTransfer();
          dataTransfer.items.add(novoArquivo);
          
          // Substituir arquivos no input
          clone.files = dataTransfer.files;
          
          // Disparar evento de mudança
          var evento = new Event('change', { bubbles: true });
          clone.dispatchEvent(evento);
        }
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Processa o conteúdo do arquivo de CEPs
   */
  function processarArquivoCEP(conteudo) {
    var linhas = conteudo.split('\n');
    var linhasAlteradas = [];
    
    for (var i = 0; i < linhas.length; i++) {
      var linha = linhas[i];
      
      // Procurar por CEPs no formato 00000-000,Nome ou 00000000,Nome
      var match = linha.match(/^(\d{5}-?\d{3}),(.*)$/);
      
      if (match) {
        var cep = match[1].replace('-', '');
        var nome = match[2].trim();
        
        var coords = getCepCoordinates(cep);
        
        if (coords) {
          // Adicionar comentário indicando que foi resolvido localmente
          linhasAlteradas.push(linha + ' /* Resolvido localmente: ' + coords.city + ' */');
          console.log('[CEP-Force] CEP resolvido localmente:', cep, coords);
        } else {
          linhasAlteradas.push(linha);
        }
      } else {
        linhasAlteradas.push(linha);
      }
    }
    
    return linhasAlteradas.join('\n');
  }
})();