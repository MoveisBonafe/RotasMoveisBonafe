// Script para enviar alterações diretamente para o GitHub via API
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Obter o diretório atual do ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do repositório
const owner = 'MoveisBonafe';
const repo = 'RotasMoveisBonafe';
const branch = 'main'; // ou 'master', dependendo da sua branch principal
const githubToken = process.env.GITHUB_TOKEN;

// Função para ler um arquivo e codificá-lo em base64
function encodeFileToBase64(filePath) {
  const content = fs.readFileSync(filePath);
  return Buffer.from(content).toString('base64');
}

// Função para obter o SHA do arquivo atual (se existir)
async function getFileSha(filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js GitHub API Client',
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json.sha);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else if (res.statusCode === 404) {
          // Arquivo não existe ainda
          resolve(null);
        } else {
          reject(new Error(`Failed to get file SHA: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Função para enviar um arquivo para o GitHub
async function updateFileOnGitHub(localPath, repoPath) {
  try {
    console.log(`Atualizando arquivo: ${repoPath}`);
    
    // Obter SHA do arquivo atual (se existir)
    const sha = await getFileSha(repoPath);
    
    // Ler e codificar o arquivo
    const content = encodeFileToBase64(localPath);
    
    // Preparar o corpo da requisição
    const requestBody = {
      message: `Atualizar ${repoPath} - Correção de layout`,
      content: content,
      branch: branch
    };
    
    // Adicionar SHA se o arquivo já existir
    if (sha) {
      requestBody.sha = sha;
    }
    
    const requestData = JSON.stringify(requestBody);
    
    // Configurar a requisição
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/contents/${repoPath}`,
      method: 'PUT',
      headers: {
        'User-Agent': 'Node.js GitHub API Client',
        'Content-Type': 'application/json',
        'Content-Length': requestData.length,
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    // Fazer a requisição
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(`Arquivo ${repoPath} atualizado com sucesso`);
          } else {
            reject(new Error(`Falha ao atualizar ${repoPath}: ${res.statusCode} ${responseData}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(requestData);
      req.end();
    });
  } catch (error) {
    console.error(`Erro ao atualizar ${repoPath}:`, error.message);
    throw error;
  }
}

// Função para processar uma pasta recursivamente
async function processDirectory(localDir, repoDir) {
  try {
    // Garantir que o caminho é absoluto se for relativo
    const fullLocalDir = path.isAbsolute(localDir) ? localDir : path.join(__dirname, localDir);
    const entries = fs.readdirSync(fullLocalDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const localPath = path.join(fullLocalDir, entry.name);
      const repoPath = repoDir ? path.join(repoDir, entry.name) : entry.name;
      
      if (entry.isDirectory()) {
        // Processar subdiretório recursivamente
        await processDirectory(localPath, repoPath);
      } else {
        // Atualizar arquivo no GitHub
        await updateFileOnGitHub(localPath, repoPath);
      }
    }
    
    console.log(`Diretório ${localDir} processado com sucesso`);
  } catch (error) {
    console.error(`Erro ao processar diretório ${localDir}:`, error.message);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN não encontrado. Configure a variável de ambiente GITHUB_TOKEN.');
    }
    
    console.log('Iniciando atualização dos arquivos no GitHub...');
    
    // Atualizar arquivos na pasta docs
    await processDirectory('./docs', 'docs');
    
    console.log('Atualização concluída com sucesso!');
    console.log('O GitHub Pages será atualizado automaticamente em alguns minutos.');
  } catch (error) {
    console.error('Erro durante a atualização:', error.message);
    process.exit(1);
  }
}

// Executar o script
main();