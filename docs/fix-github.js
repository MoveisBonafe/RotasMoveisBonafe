
// Variável global para controlar o processamento
let isProcessingFile = false;

function processCepFile(content) {
  if (!content || isProcessingFile) {
    console.log('Arquivo já está sendo processado ou conteúdo vazio');
    return;
  }

  isProcessingFile = true;
  console.log('Iniciando processamento do arquivo');

  try {
    const lines = content.split(/\r?\n/);
    let addedLocations = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const [cep, ...nameParts] = line.split(',');
      const name = nameParts.join(',').trim();

      if (cep && name) {
        if (typeof window.createLocationItem === 'function') {
          window.createLocationItem(name, `CEP: ${cep}`, Date.now());
          addedLocations++;
        }
      }
    }

    if (addedLocations > 0) {
      console.log(`${addedLocations} locais adicionados com sucesso`);
    } else {
      console.log('Nenhum local válido encontrado no arquivo');
    }

  } catch (err) {
    console.error('Erro ao processar arquivo:', err);
  } finally {
    // Limpar input de arquivo
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Resetar flag de processamento
    setTimeout(() => {
      isProcessingFile = false;
    }, 1000);
  }
}

// Adicionar listener único ao input de arquivo
document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('file-upload');
  if (fileInput) {
    // Remover listeners anteriores
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);

    // Adicionar novo listener
    newFileInput.addEventListener('change', function(e) {
      if (this.files && this.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
          processCepFile(e.target.result);
        };
        reader.readAsText(this.files[0]);
      }
    });
  }
});
