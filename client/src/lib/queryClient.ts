import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { 
  mockOrigin, 
  mockVehicleTypes, 
  mockPointsOfInterest, 
  filterMockCityEvents, 
  filterMockTruckRestrictions,
  getMockWeighingStations
} from './mockData';

// Check if running on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io') || 
                       import.meta.env.VITE_USE_MOCK_DATA === 'true';

if (isGitHubPages) {
  console.log('Inicializando modo GitHub Pages com dados simulados');
}

console.log("Using mock data:", isGitHubPages);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // If running on GitHub Pages, mock the response
  if (isGitHubPages) {
    let mockResponse: any = null;
    
    if (url === '/api/parse-cep-file' && method === 'POST') {
      // Mock the CEP file parsing response
      const fileContent = data as { fileContent: string };
      const lines = fileContent.fileContent.split('\n');
      const locations = lines
        .filter(line => line.trim())
        .map((line, index) => {
          const [cep, name] = line.split(',');
          return {
            id: Date.now() + index,
            cep,
            name,
            address: `${name}, ${cep}, Brasil`,
            lat: (-22.3 - Math.random() * 0.1).toString(),
            lng: (-48.3 - Math.random() * 0.1).toString(),
            isOrigin: false
          };
        });
      
      mockResponse = { locations };
    } 
    
    // Create a mock Response object
    return new Response(JSON.stringify(mockResponse || {}), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // If not on GitHub Pages, use the actual API
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // If running on GitHub Pages, return mock data
    if (isGitHubPages) {
      const endpoint = queryKey[0] as string;
      
      // Check which endpoint is being called and return the appropriate mock data
      if (endpoint === '/api/origin') {
        return mockOrigin;
      } else if (endpoint === '/api/vehicle-types') {
        return mockVehicleTypes;
      } else if (endpoint === '/api/points-of-interest') {
        return mockPointsOfInterest;
      } else if (endpoint === '/api/weighing-stations') {
        return getMockWeighingStations();
      } else if (endpoint.startsWith('/api/city-events')) {
        // Parse query parameters if any
        const url = new URL(endpoint, window.location.origin);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const citiesParam = url.searchParams.get('cities');
        const cities = citiesParam ? citiesParam.split(',') : undefined;
        
        return filterMockCityEvents(startDate || undefined, endDate || undefined, cities);
      } else if (endpoint === '/api/truck-restrictions') {
        // For simplicity, return all restrictions when on GitHub Pages
        return filterMockTruckRestrictions(['Dois Córregos', 'Ribeirão Preto', 'Bauru']);
      } else if (endpoint === '/api/locations') {
        // Return empty array for locations by default
        return [];
      }
      
      // Default response for unhandled endpoints
      console.warn('Unhandled mock endpoint:', endpoint);
      return null;
    }
    
    // If not on GitHub Pages, use the actual API
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
