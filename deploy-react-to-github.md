# Instruções para Deploy do Aplicativo React no GitHub Pages

A versão estática HTML não consegue reproduzir todas as funcionalidades da versão React devido às limitações do GitHub Pages. Vamos fazer o deploy diretamente da versão React.

## Passo 1: Modificar o arquivo vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { errorModalPlugin } from '@replit/vite-plugin-runtime-error-modal';
import cartographerPlugin from '@replit/vite-plugin-cartographer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    errorModalPlugin(),
    cartographerPlugin()
  ],
  base: './', // Alteração importante para GitHub Pages
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },
  server: {
    port: 5173, // Porta para desenvolver localmente no Replit
  },
  build: {
    outDir: 'docs', // Saída para pasta docs para GitHub Pages
    emptyOutDir: true, // Limpa a pasta antes de build
  }
});
```

## Passo 2: Modificar o arquivo client/src/main.tsx

Adicione um verificador para lidar com a URL base quando estiver no GitHub Pages:

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Get the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const isGitHubPages = window.location.hostname.includes('github.io') || import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Se estiver no GitHub Pages, adicionar suporte a URL base
if (isGitHubPages) {
  // Extrai o nome do repositório para usar como base URL
  const pathSegments = window.location.pathname.split('/');
  const repoName = pathSegments[1] || '';
  
  // Adiciona base tag para URLs relativas
  const baseTag = document.createElement('base');
  baseTag.href = `/${repoName}/`;
  document.head.appendChild(baseTag);
  
  console.log(`Configurado para GitHub Pages: /${repoName}/`);
}

// Render the app
const rootElement = document.getElementById("root");
if (!rootElement?.hasChildNodes()) {
  createRoot(rootElement!).render(<App />);
}
```

## Passo 3: Criar script para deploy no GitHub Pages

```bash
#!/bin/bash

# Script para compilar e preparar o deploy para GitHub Pages

echo "Iniciando build para GitHub Pages..."

# Configurar variáveis de ambiente para build
export VITE_USE_MOCK_DATA=true
export VITE_GOOGLE_MAPS_API_KEY="AIzaSyCnallnTQ8gT2_F600vt-yAEv2BoH0mj7U"

# Remover build anterior
rm -rf docs

# Criar build de produção para a pasta docs
npm run build

# Corrigir caminhos para GitHub Pages
cp docs/index.html docs/404.html

echo "Build concluído! Arquivos gerados na pasta docs/"
echo "Faça commit e push para o repositório GitHub."
echo "Certifique-se de configurar o GitHub Pages para usar a pasta /docs."
```

## Passo 4: Configurar Mock Data para GitHub Pages

Para fazer o aplicativo funcionar sem o servidor backend no GitHub Pages, precisamos modificar `client/src/lib/queryClient.ts`:

```ts
import { QueryClient } from "@tanstack/react-query";
import mockData from './mockData';

const baseUrl = import.meta.env.DEV ? '' : '.';
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' || window.location.hostname.includes('github.io');

console.log("Using mock data:", useMockData);

// Wrapper for fetch with automatic JSON parsing
export async function apiRequest(method: string, url: string, body?: any) {
  if (useMockData) {
    // Retornar dados simulados quando estiver no GitHub Pages
    return getMockResponse(method, url, body);
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${url}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }
  
  // No content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// Função para simular respostas da API usando mockData
function getMockResponse(method: string, url: string, body?: any) {
  // Simulando delay de rede
  return new Promise((resolve) => {
    setTimeout(() => {
      // Rotear para as funções mock apropriadas baseadas na URL
      if (url === '/api/origin' && method === 'GET') {
        resolve(mockData.getOrigin());
      } else if (url === '/api/locations' && method === 'GET') {
        resolve(mockData.getAllLocations());
      } else if (url === '/api/locations' && method === 'POST') {
        resolve(mockData.addLocation(body));
      } else if (url.match(/\/api\/locations\/\d+/) && method === 'DELETE') {
        const id = parseInt(url.split('/').pop() || '0');
        resolve(mockData.removeLocation(id));
      } else if (url === '/api/vehicle-types' && method === 'GET') {
        resolve(mockData.getAllVehicleTypes());
      } else if (url === '/api/points-of-interest' && method === 'GET') {
        resolve(mockData.getAllPointsOfInterest());
      } else if (url === '/api/weighing-stations' && method === 'GET') {
        resolve(mockData.getWeighingStations());
      } else if (url === '/api/city-events' && method === 'GET') {
        resolve(mockData.getCityEvents());
      } else if (url === '/api/truck-restrictions' && method === 'GET') {
        resolve(mockData.getTruckRestrictions());
      } else if (url === '/api/calculate-route' && method === 'POST') {
        resolve(mockData.calculateRoute(body));
      } else if (url === '/api/parse-cep-file' && method === 'POST') {
        resolve(mockData.parseCepFile(body));
      } else if (url === '/api/seed-data' && method === 'POST') {
        resolve({ message: "Data seeded successfully" });
      } else {
        resolve({ error: "Endpoint not implemented in mock data" });
      }
    }, 300); // 300ms delay para simular rede
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey }: { queryKey: any }) => {
        // Assume a string queryKey is a GET request path
        if (typeof queryKey === 'string') {
          return apiRequest('GET', queryKey);
        }
        
        if (Array.isArray(queryKey) && typeof queryKey[0] === 'string') {
          // For array query keys, use first element as path
          // This is just a simple default implementation
          return apiRequest('GET', queryKey[0]);
        }
        
        throw new Error(`Invalid queryKey: ${queryKey}`);
      },
    },
  },
});
```

## Passo 5: Executar o deploy

1. Torne o script executável:
   ```
   chmod +x deploy-github.sh
   ```

2. Execute o script:
   ```
   ./deploy-github.sh
   ```

3. O script vai gerar os arquivos de produção na pasta `docs/`.

4. Faça commit e push para o repositório GitHub.

5. Configure o GitHub Pages para usar a pasta `/docs` nas configurações do repositório.

## Por que esta abordagem é melhor:

1. Usa o código React original, garantindo comportamento idêntico
2. Mantém todas as funcionalidades incluindo autocomplete e marcadores
3. Usa mockData para simular o backend
4. É uma solução mais robusta e escalável que HTML estático