import { useRef, useEffect, useState, useCallback } from "react";
import { Location, PointOfInterest } from "@/lib/types";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import { useQuery } from "@tanstack/react-query";
import { withGoogleMaps } from "@/main";

// Map type constants
const MAP_TYPES = {
  ROADMAP: "roadmap",
  SATELLITE: "satellite", 
  HYBRID: "hybrid",
  TERRAIN: "terrain"
};

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
}

export default function MapView({ 
  origin, 
  waypoints, 
  calculatedRoute,
  onRouteCalculated
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Fetch points of interest from the server
  const { data: pointsOfInterest = [] } = useQuery({
    queryKey: ['/api/points-of-interest'],
    staleTime: Infinity,
  });

  // Initialize Google Maps
  const initGoogleMaps = useCallback(() => {
    if (googleMapsLoaded) return;
    
    withGoogleMaps(() => {
      console.log("Google Maps API successfully loaded");
      setGoogleMapsLoaded(true);
      setIsMapReady(true);
    });
  }, [googleMapsLoaded]);

  useEffect(() => {
    initGoogleMaps();
    
    // Add a fallback in case Google Maps doesn't load
    const timeout = setTimeout(() => {
      if (!googleMapsLoaded) {
        console.warn("Google Maps loading timeout, retrying...");
        initGoogleMaps();
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [initGoogleMaps, googleMapsLoaded]);

  const { 
    map,
    mapType,
    isStreetViewActive,
    displayRoute,
    addMarker,
    clearMarkers,
    changeMapType,
    zoomIn,
    zoomOut,
    toggleStreetView
  } = useGoogleMaps({
    mapContainerRef
  });

  // Display route when calculatedRoute changes
  useEffect(() => {
    if (!map || !calculatedRoute || calculatedRoute.length < 2 || !origin) return;

    // The first and last positions in the calculated route should be the origin
    const firstLocation = calculatedRoute[0];
    const lastLocation = calculatedRoute[calculatedRoute.length - 1];
    
    // The waypoints are all locations between first and last
    const routeWaypoints = calculatedRoute.slice(1, calculatedRoute.length - 1);

    // Ensure we have a valid array of POIs or an empty array as fallback
    const poisArray = Array.isArray(pointsOfInterest) ? pointsOfInterest : [];

    // Display the route on the map
    displayRoute(
      firstLocation,
      routeWaypoints,
      lastLocation,
      poisArray
    ).then(result => {
      if (result && onRouteCalculated) {
        onRouteCalculated(result);
      }
    });
  }, [map, calculatedRoute, origin, pointsOfInterest, displayRoute, onRouteCalculated]);

  // Add markers for waypoints when no route is calculated
  useEffect(() => {
    if (!map || calculatedRoute || !origin) return;

    clearMarkers();
    
    // Add origin marker
    addMarker(origin, 'origin');
    
    // Add waypoint markers
    waypoints.forEach(waypoint => {
      addMarker(waypoint, 'waypoint');
    });
    
  }, [map, calculatedRoute, origin, waypoints, addMarker, clearMarkers]);

  return (
    <div className="flex-1 relative h-full">
      {/* Container do mapa - ocupa a altura completa */}
      <div 
        ref={mapContainerRef} 
        className="h-full w-full bg-gray-200"
        style={{ minHeight: '500px' }} // Garantir altura mínima para o mapa
      >
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
            <div className="text-center p-4 rounded-lg shadow-md bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Carregando Google Maps...</p>
              <p className="text-xs text-gray-500 mt-2">Aguarde enquanto o mapa é carregado</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Controles adicionais que só aparecem quando o mapa estiver pronto */}
      {isMapReady && isStreetViewActive && (
        <div className="absolute top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md">
          <button 
            onClick={() => toggleStreetView()}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Sair do Street View
          </button>
        </div>
      )}
      
      {/* Legenda do mapa sempre visível */}
      <MapLegend />
    </div>
  );
}
