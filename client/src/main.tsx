import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Get the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

if (!GOOGLE_MAPS_API_KEY) {
  console.error("Google Maps API key não encontrada. Funcionalidade do mapa será limitada.");
}

// Status tracking for Google Maps loading
let googleMapsLoaded = false;
let googleMapsCallbacks: (() => void)[] = [];
let loadAttempted = false;

// Initialize Google Maps API
const loadGoogleMaps = () => {
  // Prevent multiple loading attempts
  if (loadAttempted) return;
  loadAttempted = true;
  
  console.log("Iniciando carregamento da Google Maps API...");

  // Check if Google Maps is already loaded
  if (window.google && window.google.maps) {
    googleMapsLoaded = true;
    executeCallbacks();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMap&v=3.58`;
  script.async = true;
  script.defer = true;
  
  // Add error handling for the script load
  script.onerror = (e) => {
    console.error("Falha ao carregar Google Maps API:", e);
    loadAttempted = false; // Reset para permitir outra tentativa
  };
  
  document.head.appendChild(script);
};

// Configuração de zoom sem Ctrl - Executado após carregamento do mapa
const enableScrollWheelZoom = () => {
  try {
    // Configuração para permitir zoom sem Ctrl (adiciona CSS e configurações)
    setTimeout(() => {
      // Tenta encontrar os containers do mapa
      const gmStyleNodes = document.querySelectorAll('.gm-style');
      
      if (gmStyleNodes.length > 0) {
        gmStyleNodes.forEach((node: Element) => {
          // Adiciona atributos de manipulação para todos os containers
          if (node instanceof HTMLElement) {
            node.style.touchAction = 'manipulation';
            
            // Adiciona um atributo de dados para seleção via CSS
            node.dataset.gestureHandling = 'greedy';
          }
          
          // Tentar aplicar a todos os elementos filhos (camadas do mapa)
          const allElements = node.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.touchAction = 'manipulation';
            }
          });
        });
        
        console.log("Helper de zoom aplicado aos elementos do Google Maps");
      } else {
        console.log("Nenhum elemento .gm-style encontrado para aplicar helper de zoom");
      }
    }, 500);
  } catch (e) {
    console.error("Erro ao aplicar helper de zoom:", e);
  }
};

// Global initialization function for Google Maps
window.initMap = () => {
  console.log("Google Maps API loaded");
  googleMapsLoaded = true;
  executeCallbacks();
  
  // Ativar o scroll de zoom sem precisar do Ctrl
  enableScrollWheelZoom();
  
  // Forçar carregamento das bibliotecas Places API
  if (window.google && window.google.maps) {
    try {
      new window.google.maps.places.AutocompleteService();
      console.log("Google Places API loaded");
      
      // Após carregar Places, aplicar novamente as configurações de zoom
      enableScrollWheelZoom();
    } catch (e) {
      console.error("Erro ao carregar Places API:", e);
    }
  }
};

// Execute callbacks when Google Maps is loaded
function executeCallbacks() {
  while (googleMapsCallbacks.length) {
    const callback = googleMapsCallbacks.shift();
    if (callback) callback();
  }
}

// Export a function to use when components need to wait for Google Maps
export function withGoogleMaps(callback: () => void) {
  if (googleMapsLoaded) {
    callback();
  } else {
    googleMapsCallbacks.push(callback);
    // Ensure we've attempted to load the API
    if (!loadAttempted) {
      loadGoogleMaps();
    }
  }
}

// Load Google Maps API
loadGoogleMaps();

// Render the app
const rootElement = document.getElementById("root");

// Check if root already has a React instance attached to avoid duplicate render
if (!rootElement?.hasChildNodes()) {
  createRoot(rootElement!).render(<App />);
}
