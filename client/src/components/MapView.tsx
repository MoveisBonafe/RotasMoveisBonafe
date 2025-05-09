import { useState, useEffect } from "react";
import { Location } from "@/lib/types";
import MapLegend from "@/components/MapLegend";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
}

export default function MapView({ 
  origin, 
  waypoints,
  calculatedRoute
}: MapViewProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapSrc, setMapSrc] = useState("");
  
  // Obter a chave API do Google Maps
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  // Quando a origem for carregada, construir o iframe URL
  useEffect(() => {
    if (origin) {
      // Construir o iframe URL com a origem
      const baseUrl = `https://www.google.com/maps/embed/v1/place`;
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        q: `${origin.name}, ${origin.address}`,
        zoom: "12",
        maptype: "roadmap"
      });
      
      setMapSrc(`${baseUrl}?${params.toString()}`);
      setIsMapReady(true);
    }
  }, [origin, GOOGLE_MAPS_API_KEY]);
  
  // Quando uma rota for calculada, atualizar o iframe para mostrar a rota
  useEffect(() => {
    if (origin && calculatedRoute && calculatedRoute.length > 0) {
      // URL base para direções
      const baseUrl = `https://www.google.com/maps/embed/v1/directions`;
      
      // Obter origem e destino
      const originParam = `${origin.lat},${origin.lng}`;
      const destination = calculatedRoute[calculatedRoute.length - 1];
      const destinationParam = `${destination.lat},${destination.lng}`;
      
      // Construir waypoints string (máximo 10 pontos de parada)
      let waypointsArray = [];
      const maxWaypoints = Math.min(calculatedRoute.length - 2, 8); // -2 porque origem e destino já estão incluídos
      
      for (let i = 1; i < maxWaypoints + 1; i++) {
        const waypoint = calculatedRoute[i];
        waypointsArray.push(`${waypoint.lat},${waypoint.lng}`);
      }
      
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        origin: originParam,
        destination: destinationParam,
        mode: "driving"
      });
      
      if (waypointsArray.length > 0) {
        params.append("waypoints", waypointsArray.join("|"));
      }
      
      setMapSrc(`${baseUrl}?${params.toString()}`);
    }
  }, [calculatedRoute, origin, GOOGLE_MAPS_API_KEY]);

  // Quando waypoints mudam, mas não há rota calculada ainda
  useEffect(() => {
    if (origin && waypoints.length > 0 && !calculatedRoute) {
      // Mostrar o mapa com marcadores
      const baseUrl = `https://www.google.com/maps/embed/v1/search`;
      const searchParams = [`${origin.name}, ${origin.address}`];
      
      waypoints.forEach(waypoint => {
        searchParams.push(`${waypoint.name}, ${waypoint.address}`);
      });
      
      // Centralizar no primeiro local
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        q: searchParams.join(" | "),
        zoom: "10",
        maptype: "roadmap",
        center: `${origin.lat},${origin.lng}`
      });
      
      setMapSrc(`${baseUrl}?${params.toString()}`);
    }
  }, [waypoints, origin, calculatedRoute, GOOGLE_MAPS_API_KEY]);

  return (
    <div className="flex-1 relative h-full">
      {!isMapReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
          <div className="text-center p-4 rounded-lg shadow-md bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Carregando Google Maps...</p>
            <p className="text-xs text-gray-500 mt-2">Aguarde enquanto o mapa é carregado</p>
          </div>
        </div>
      ) : (
        // Container do mapa com iframe do Google Maps Embed API
        <div className="h-full w-full" style={{ minHeight: '500px' }}>
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '500px' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
            title="Google Maps"
          ></iframe>
        </div>
      )}
      
      {/* Legenda do mapa */}
      <MapLegend />
    </div>
  );
}