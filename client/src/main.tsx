import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Get the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

if (!GOOGLE_MAPS_API_KEY) {
  console.warn("No Google Maps API key found. Maps functionality will be limited.");
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

  // Check if Google Maps is already loaded
  if (window.google && window.google.maps) {
    googleMapsLoaded = true;
    executeCallbacks();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMap`;
  script.async = true;
  script.defer = true;
  
  // Add error handling for the script load
  script.onerror = () => {
    console.error("Failed to load Google Maps API");
  };
  
  document.head.appendChild(script);
};

// Global initialization function for Google Maps
window.initMap = () => {
  console.log("Google Maps API loaded");
  googleMapsLoaded = true;
  executeCallbacks();
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
createRoot(document.getElementById("root")!).render(<App />);
