import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Since we're using Vite, we need to use import.meta.env instead of process.env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Create a loader for Google Maps
let googleMapsLoaded = false;
let googleMapsCallbacks: (() => void)[] = [];

// Initialize Google Maps API
const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    googleMapsLoaded = true;
    executeCallbacks();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMap`;
  script.async = true;
  script.defer = true;
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
  }
}

// Load Google Maps API
loadGoogleMaps();

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
