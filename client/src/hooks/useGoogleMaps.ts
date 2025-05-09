import { useState, useEffect, useRef, useCallback } from "react";
import { Location, PointOfInterest, MapOptions } from "@/lib/types";
import { getMarkerIcon, filterPointsOfInterestAlongRoute, locationToLatLng } from "@/lib/mapUtils";
import { withGoogleMaps } from "@/main";

// Default map options centered on Dois Córregos
const defaultMapOptions: MapOptions = {
  center: { lat: -22.3673, lng: -48.3823 }, // Dois Córregos-SP
  zoom: 13,
  mapTypeId: "roadmap" as google.maps.MapTypeId
};

interface UseGoogleMapsProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  initialOptions?: Partial<MapOptions>;
}

export function useGoogleMaps({ mapContainerRef, initialOptions = {} }: UseGoogleMapsProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [streetViewService, setStreetViewService] = useState<google.maps.StreetViewService | null>(null);
  const [streetViewPanorama, setStreetViewPanorama] = useState<google.maps.StreetViewPanorama | null>(null);
  const [isStreetViewActive, setIsStreetViewActive] = useState(false);
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(defaultMapOptions.mapTypeId);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const routePathRef = useRef<google.maps.LatLng[]>([]);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    // Wait for Google Maps to load
    withGoogleMaps(() => {
      if (!mapContainerRef.current) return; // Check again in case component unmounted

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
    if (!map) return null;

    const position = new google.maps.LatLng(
      parseFloat(location.lat),
      parseFloat(location.lng)
    );

    const marker = new google.maps.Marker({
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
    if (!map || !directionsRenderer) return null;

    clearMarkers();

    const originLatLng = locationToLatLng(origin);
    const destinationLatLng = locationToLatLng(destination);

    const directionsService = new google.maps.DirectionsService();
    const request: google.maps.DirectionsRequest = {
      origin: originLatLng,
      destination: destinationLatLng,
      waypoints: waypoints.map(wp => ({
        location: locationToLatLng(wp),
        stopover: true
      })),
      optimizeWaypoints: false, // We're already optimizing with our TSP algorithm
      travelMode: google.maps.TravelMode.DRIVING,
    };

    try {
      const result = await directionsService.route(request);
      directionsRenderer.setDirections(result);

      // Extract the route path for filtering POIs
      const routePath: google.maps.LatLng[] = [];
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
        addMarker(poi, poi.type as 'toll' | 'weighing_station');
      });

      return {
        route: result.routes[0],
        poisAlongRoute
      };
    } catch (error) {
      console.error("Error displaying route:", error);
      return null;
    }
  }, [map, directionsRenderer, addMarker]);

  // Change map type
  const changeMapType = useCallback((type: google.maps.MapTypeId) => {
    setMapType(type);
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
  const toggleStreetView = useCallback(async (position?: google.maps.LatLng) => {
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
        source: google.maps.StreetViewSource.OUTDOOR
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
