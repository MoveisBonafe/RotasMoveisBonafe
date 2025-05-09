import { useRef, useEffect, useState } from "react";
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

  // Fetch points of interest from the server
  const { data: pointsOfInterest } = useQuery({
    queryKey: ['/api/points-of-interest'],
    staleTime: Infinity,
  });

  // Initialize Google Maps
  useEffect(() => {
    // Check if Google Maps is already loaded
    withGoogleMaps(() => {
      setIsMapReady(true);
    });
  }, []);

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
    <div className="flex-1 relative">
      <div ref={mapContainerRef} className="h-full w-full bg-gray-200">
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>
      
      {isMapReady && (
        <>
          <MapControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onToggleStreetView={toggleStreetView}
            onChangeMapType={changeMapType}
            mapType={mapType}
          />
          
          <MapLegend />
        </>
      )}
    </div>
  );
}
