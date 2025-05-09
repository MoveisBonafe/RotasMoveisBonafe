import { useState, useEffect, useRef } from "react";
import { Location } from "@/lib/types";
import { withGoogleMaps } from "@/main";
import { getMarkerIcon } from "@/lib/mapUtils";

// Declaração para o objeto global do Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

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
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Carregar o mapa quando o componente montar
  useEffect(() => {
    withGoogleMaps(() => {
      if (!origin) return;
      initializeMap();
    });
  }, [origin]);

  // Atualizar marcadores e rota quando os waypoints ou a rota calculada mudar
  useEffect(() => {
    if (mapRef.current) {
      updateMapMarkers();
    }
  }, [waypoints, calculatedRoute]);

  // Inicializar o mapa
  const initializeMap = () => {
    if (!mapContainerRef.current || !origin) return;

    try {
      console.log("Inicializando mapa...");
      
      // Converter coordenadas para números
      const originCoords = { 
        lat: parseFloat(origin.lat), 
        lng: parseFloat(origin.lng) 
      };
      
      // Criar o mapa
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: originCoords,
        zoom: 10,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        zoomControl: true,
        gestureHandling: 'greedy', // Esta configuração é importante para o zoom sem Ctrl
        scrollwheel: true
      });
      
      // Salvar referência do mapa
      mapRef.current = map;
      
      // Atualizar marcadores e rota
      updateMapMarkers();
      
      // Mapa carregado
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao inicializar mapa:", error);
    }
  };

  // Atualizar marcadores e rota no mapa
  const updateMapMarkers = () => {
    if (!mapRef.current || !origin) return;
    
    try {
      const map = mapRef.current;
      
      // Limpar marcadores anteriores
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Definir limites para ajustar o zoom
      const bounds = new window.google.maps.LatLngBounds();
      
      // Decidir quais pontos mostrar (rota calculada ou waypoints)
      const pointsToShow = calculatedRoute || (waypoints.length > 0 ? [origin, ...waypoints] : [origin]);
      console.log(`Exibindo ${pointsToShow.length} pontos no mapa`);
      
      // Adicionar marcadores para cada ponto
      pointsToShow.forEach((point, index) => {
        // Verificar coordenadas
        if (!point.lat || !point.lng) return;
        
        const lat = parseFloat(point.lat);
        const lng = parseFloat(point.lng);
        if (isNaN(lat) || isNaN(lng)) return;
        
        const position = { lat, lng };
        console.log(`Marcador ${index}: ${point.name} em ${lat},${lng}`);
        
        // Determinar tipo de marcador
        const isOrigin = index === 0;
        const isDestination = calculatedRoute && index === pointsToShow.length - 1;
        let markerLabel, markerURL;
        
        if (isOrigin) {
          // Origem (A) - AZUL
          markerLabel = "A";
          markerURL = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        } else if (isDestination) {
          // Destino final (B) - VERDE
          markerLabel = "B";
          markerURL = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        } else {
          // Waypoints numerados - LARANJA
          const waypointIndex = index - 1;
          markerLabel = (waypointIndex + 1).toString();
          markerURL = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        }
        
        // Criar marcador
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: point.name || `Ponto ${index}`,
          label: {
            text: markerLabel,
            color: "#FFFFFF",
            fontWeight: "bold"
          },
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: markerURL,
            labelOrigin: new window.google.maps.Point(14, 15)
          },
          zIndex: isOrigin || isDestination ? 100 : 10
        });
        
        // Janela de informações
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="min-width: 200px; padding: 10px; font-family: Arial, sans-serif;">
              <strong>${point.name || `Ponto ${index}`}</strong>
              <p style="margin: 8px 0;">${point.address || ""}</p>
              <div style="font-size: 12px; color: #666;">
                CEP: ${point.cep || "N/A"}<br>
                Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}
              </div>
            </div>
          `
        });
        
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
        
        // Salvar marcador
        markersRef.current.push(marker);
        
        // Adicionar às coordenadas para cálculo de limites
        bounds.extend(position);
      });
      
      // Desenhar linha da rota se tivermos 2+ pontos
      if (pointsToShow.length >= 2) {
        const routeCoordinates = pointsToShow.map(point => ({
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lng)
        }));
        
        const routePath = new window.google.maps.Polyline({
          path: routeCoordinates,
          geodesic: true,
          strokeColor: "#4285F4",
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map: map
        });
      }
      
      // Ajustar zoom para mostrar todos os pontos
      if (pointsToShow.length > 0) {
        map.fitBounds(bounds);
        
        // Adicionar padding
        const padding = { top: 60, right: 60, bottom: 60, left: 60 };
        map.fitBounds(bounds, padding);
      }
    } catch (error) {
      console.error("Erro ao atualizar marcadores:", error);
    }
  };

  // Mudar tipo de mapa para Satélite
  const setMapTypeSatellite = () => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
    }
  };

  // Mudar tipo de mapa para Roadmap
  const setMapTypeRoadmap = () => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
    }
  };

  return (
    <div className="flex-1 relative h-full">
      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
          <div className="text-center p-4 rounded-lg shadow-md bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Carregando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Container do mapa */}
      <div className="h-full w-full relative" style={{ minHeight: '500px' }}>
        <div 
          id="map-container"
          ref={mapContainerRef} 
          className="h-full w-full touch-manipulation"
          style={{ minHeight: '500px' }}
        ></div>
        
        {/* Legenda */}
        {(waypoints.length > 0 && !isLoading) && (
          <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-2 z-10 max-w-xs">
            <h3 className="text-sm font-semibold mb-2">Pontos no mapa:</h3>
            <div className="flex flex-col space-y-1 text-xs">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 mr-2">A</span>
                <span>Origem: {origin?.name || 'Dois Córregos'}</span>
              </div>
              {waypoints.map((waypoint, index) => (
                <div key={index} className="flex items-center">
                  <span className="inline-flex items-center justify-center bg-orange-500 text-white rounded-full w-5 h-5 mr-2">{index + 1}</span>
                  <span>{waypoint.name || `Destino ${index + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Controles do mapa */}
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2 z-10">
          {/* Botão de satélite */}
          <button 
            onClick={setMapTypeSatellite} 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Visualização de satélite"
          >
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Botão de mapa */}
          <button 
            onClick={setMapTypeRoadmap} 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Visualização de mapa"
          >
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}