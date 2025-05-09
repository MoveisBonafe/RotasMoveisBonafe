import { useState, useEffect, useRef, useCallback } from "react";
import { Location, PointOfInterest, MapOptions } from "@/lib/types";
import { getMarkerIcon, filterPointsOfInterestAlongRoute, locationToLatLng } from "@/lib/mapUtils";
import { withGoogleMaps } from "@/main";

// Map type constants
const MAP_TYPES = {
  ROADMAP: "roadmap",
  SATELLITE: "satellite", 
  HYBRID: "hybrid",
  TERRAIN: "terrain"
};

// Define types to avoid direct Google Maps references
type MapType = typeof MAP_TYPES[keyof typeof MAP_TYPES];
type LatLngLiteral = { lat: number; lng: number };
type GoogleMap = any;
type DirectionsRenderer = any;
type StreetViewService = any;
type StreetViewPanorama = any;
type Marker = any;
type LatLng = any;

// Default map options centered on Dois Córregos
const defaultMapOptions: MapOptions = {
  center: { lat: -22.3673, lng: -48.3823 }, // Dois Córregos-SP
  zoom: 13,
  mapTypeId: MAP_TYPES.ROADMAP
};

interface UseGoogleMapsProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  initialOptions?: Partial<MapOptions>;
}

export function useGoogleMaps({ mapContainerRef, initialOptions = {} }: UseGoogleMapsProps) {
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<DirectionsRenderer | null>(null);
  const [streetViewService, setStreetViewService] = useState<StreetViewService | null>(null);
  const [streetViewPanorama, setStreetViewPanorama] = useState<StreetViewPanorama | null>(null);
  const [isStreetViewActive, setIsStreetViewActive] = useState(false);
  const [mapType, setMapType] = useState<MapType>(defaultMapOptions.mapTypeId as MapType);
  const markersRef = useRef<Marker[]>([]);
  const routePathRef = useRef<LatLng[]>([]);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    // Wait for Google Maps to load
    withGoogleMaps(() => {
      if (!mapContainerRef.current) return; // Check again in case component unmounted
      if (!window.google || !window.google.maps) return; // Make sure Google Maps is loaded

      const options = {
        ...defaultMapOptions,
        ...initialOptions,
        mapTypeId: mapType,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
      };

      const newMap = new google.maps.Map(mapContainerRef.current, options);
      const newDirectionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: false,
      });
      newDirectionsRenderer.setMap(newMap);

      const newStreetViewService = new google.maps.StreetViewService();
      const newStreetViewPanorama = new google.maps.StreetViewPanorama(
        document.createElement("div"),
        {
          enableCloseButton: true,
          visible: false,
        }
      );
      newMap.setStreetView(newStreetViewPanorama);

      setMap(newMap);
      setDirectionsRenderer(newDirectionsRenderer);
      setStreetViewService(newStreetViewService);
      setStreetViewPanorama(newStreetViewPanorama);
    });

    return () => {
      // Cleanup markers
      clearMarkers();
    };
  }, [mapContainerRef, initialOptions, mapType]);

  // Update map type when it changes
  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

  // Clear all markers from the map
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Add a marker to the map
  const addMarker = useCallback((location: Location | PointOfInterest, type: 'origin' | 'destination' | 'waypoint' | 'toll' | 'weighing_station') => {
    if (!map || !window.google) return null;

    const position = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    };

    const marker = new window.google.maps.Marker({
      position,
      map,
      icon: getMarkerIcon(type),
      title: location.name,
    });

    markersRef.current.push(marker);
    return marker;
  }, [map]);

  // Calculate and display a route
  const displayRoute = useCallback(async (
    origin: Location,
    waypoints: Location[],
    destination: Location,
    pois: PointOfInterest[]
  ) => {
    if (!map || !directionsRenderer || !window.google) return null;

    clearMarkers();

    const originLatLng = { 
      lat: parseFloat(origin.lat), 
      lng: parseFloat(origin.lng) 
    };
    
    const destinationLatLng = { 
      lat: parseFloat(destination.lat), 
      lng: parseFloat(destination.lng) 
    };

    const directionsService = new window.google.maps.DirectionsService();
    const request = {
      origin: originLatLng,
      destination: destinationLatLng,
      waypoints: waypoints.map(wp => ({
        location: { 
          lat: parseFloat(wp.lat), 
          lng: parseFloat(wp.lng) 
        },
        stopover: true
      })),
      optimizeWaypoints: false, // We're already optimizing with our TSP algorithm
      travelMode: 'DRIVING', // Use string instead of enum
    };

    try {
      const result = await directionsService.route(request);
      directionsRenderer.setDirections(result);

      // Extract the route path for filtering POIs
      const routePath: any[] = [];
      const routes = result.routes[0];
      const legs = routes.legs;

      for (const leg of legs) {
        for (const step of leg.steps) {
          for (const point of step.path) {
            routePath.push(point);
          }
        }
      }

      routePathRef.current = routePath;

      // Add markers for origin, waypoints, and destination
      addMarker(origin, 'origin');
      waypoints.forEach(wp => addMarker(wp, 'waypoint'));
      addMarker(destination, 'destination');

      // Add markers for POIs along the route
      const poisAlongRoute = filterPointsOfInterestAlongRoute(pois, routePath);
      poisAlongRoute.forEach(poi => {
        const poiType = poi.type as 'toll' | 'weighing_station';
        addMarker(poi, poiType);
      });

      return {
        route: result.routes[0],
        poisAlongRoute
      };
    } catch (error) {
      console.error("Error displaying route:", error);
      return null;
    }
  }, [map, directionsRenderer, addMarker, clearMarkers]);

  // Change map type
  const changeMapType = useCallback((type: string) => {
    setMapType(type as MapType);
  }, []);

  // Zoom in
  const zoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 0;
      map.setZoom(currentZoom + 1);
    }
  }, [map]);

  // Zoom out
  const zoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 0;
      map.setZoom(Math.max(currentZoom - 1, 1));
    }
  }, [map]);

  // Toggle street view
  const toggleStreetView = useCallback(async (position?: any) => {
    if (!map || !streetViewService || !streetViewPanorama) return;

    if (isStreetViewActive) {
      // Disable street view
      streetViewPanorama.setVisible(false);
      setIsStreetViewActive(false);
      return;
    }

    // Enable street view at the specified position or map center
    const targetPos = position || map.getCenter();
    
    try {
      const result = await streetViewService.getPanorama({
        location: targetPos,
        radius: 50,
        source: 'OUTDOOR' // Using string instead of enum
      });
      
      const panoLocation = result.location?.latLng;
      if (panoLocation) {
        streetViewPanorama.setPosition(panoLocation);
        streetViewPanorama.setVisible(true);
        setIsStreetViewActive(true);
      }
    } catch (error) {
      console.error("No street view available at this location");
    }
  }, [map, streetViewService, streetViewPanorama, isStreetViewActive]);

  return {
    map,
    directionsRenderer,
    streetViewPanorama,
    isStreetViewActive,
    mapType,
    displayRoute,
    clearMarkers,
    addMarker,
    changeMapType,
    zoomIn,
    zoomOut,
    toggleStreetView
  };
}
