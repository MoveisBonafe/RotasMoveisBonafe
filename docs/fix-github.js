function processCepFile(content) {
  if (!content) {
    console.error('Conteúdo vazio');
    return;
  }

  // Verificar se já está processando
  if (window.isProcessingFile) {
    console.log('Já existe um arquivo sendo processado');
    return;
  }

  window.isProcessingFile = true;

  try {
    // Processar o conteúdo do arquivo
    const lines = content.split(/\r?\n/);
    let addedLocations = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const [cep, ...nameParts] = line.split(',');
      const name = nameParts.join(',').trim();

      if (cep && name) {
        // Adicionar localização usando a função global
        if (typeof window.createLocationItem === 'function') {
          window.createLocationItem(name, `CEP: ${cep}`, Date.now());
          addedLocations++;
        }
      }
    }

    // Mostrar feedback
    if (addedLocations > 0) {
      alert(`${addedLocations} locais adicionados com sucesso!`);
    } else {
      alert('Nenhum local válido encontrado no arquivo.');
    }

    // Limpar input de arquivo
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }

  } catch (err) {
    console.error('Erro ao processar arquivo:', err);
    alert('Erro ao processar o arquivo. Verifique o formato.');
  } finally {
    // Sempre liberar o processamento
    window.isProcessingFile = false;
  }
}