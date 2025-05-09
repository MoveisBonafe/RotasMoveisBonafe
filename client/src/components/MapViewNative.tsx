import { useEffect, useRef, useState } from "react";
import { Location } from "@/lib/types";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
}

// Definições simplificadas para TypeScript
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Recuperar a API key do ambiente
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

export default function MapViewNative({
  origin,
  waypoints,
  calculatedRoute
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);

  // Inicializar o mapa quando o componente montar
  useEffect(() => {
    // Só inicializar se o elemento do mapa existir e o Google Maps API estiver disponível
    if (mapRef.current && window.google && window.google.maps) {
      // Configurações iniciais do mapa
      const mapOptions = {
        center: { lat: -22.36752, lng: -48.38016 }, // Dois Córregos-SP
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        scrollwheel: true, // Permitir zoom com roda do mouse
        gestureHandling: "greedy", // Permitir gestos sem a tecla Ctrl
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        }
      };

      // Criar a instância do mapa
      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      // Configurar o renderizador de direções
      const newDirectionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        preserveViewport: false,
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
      newDirectionsRenderer.setMap(newMap);
      setDirectionsRenderer(newDirectionsRenderer);
    }
  }, []);

  // Quando origin ou waypoints mudarem, atualizar os marcadores
  useEffect(() => {
    if (!map || !origin) return;

    // Limpar marcadores antigos
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    // Posição da origem
    const originPosition = {
      lat: parseFloat(origin.lat),
      lng: parseFloat(origin.lng)
    };

    // Criar marcador para origem
    const originMarker = new google.maps.Marker({
      position: originPosition,
      map,
      title: origin.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#FFFFFF",
        scale: 10
      },
      label: {
        text: "A",
        color: "#FFFFFF",
        fontWeight: "bold"
      }
    });
    newMarkers.push(originMarker);

    // Adicionar marcadores para cada waypoint
    waypoints.forEach((waypoint, index) => {
      const position = {
        lat: parseFloat(waypoint.lat),
        lng: parseFloat(waypoint.lng)
      };

      const marker = new google.maps.Marker({
        position,
        map,
        title: waypoint.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#DB4437",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#FFFFFF",
          scale: 10
        },
        label: {
          text: `${index + 1}`,
          color: "#FFFFFF",
          fontWeight: "bold"
        }
      });
      newMarkers.push(marker);
    });

    // Atualizar os marcadores
    setMarkers(newMarkers);

    // Se não tiver calculado uma rota, ajustar o mapa para mostrar todos os pontos
    if (!calculatedRoute || calculatedRoute.length === 0) {
      if (waypoints.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(originPosition);
        
        waypoints.forEach(waypoint => {
          bounds.extend({
            lat: parseFloat(waypoint.lat),
            lng: parseFloat(waypoint.lng)
          });
        });
        
        map.fitBounds(bounds);
      } else {
        // Se só tiver a origem, centralizar nela
        map.setCenter(originPosition);
        map.setZoom(14);
      }
    }
  }, [map, origin, waypoints]);

  // Quando uma rota for calculada, mostrar no mapa (implementação simples sem DirectionsService)
  useEffect(() => {
    if (!map || !origin || !calculatedRoute || calculatedRoute.length === 0) return;

    try {
      // Limpar marcadores anteriores
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      
      // Limpar direções anteriores se existirem
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
      
      const google = window.google;
      const newMarkers: any[] = [];
      
      // Criar bounds para ajustar o zoom
      const bounds = new google.maps.LatLngBounds();
      
      // Preparar origem
      const originLocation = {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng)
      };
      
      // Adicionar origem ao bounds
      bounds.extend(originLocation);
      
      // Criar marcador para a origem
      const originMarker = new google.maps.Marker({
        position: originLocation,
        map,
        title: origin.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#FFFFFF",
          scale: 10
        },
        label: {
          text: "A",
          color: "#FFFFFF",
          fontWeight: "bold"
        }
      });
      newMarkers.push(originMarker);
      
      // Criar um array de coordenadas para a polyline
      const routeCoordinates = calculatedRoute.map(point => ({
        lat: parseFloat(point.lat),
        lng: parseFloat(point.lng)
      }));
      
      // Adicionar cada ponto ao bounds
      routeCoordinates.forEach(latLng => bounds.extend(latLng));
      
      // Criar polyline para mostrar a rota
      const routePath = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map
      });
      
      // Adicionar marcadores para cada ponto da rota (exceto origem)
      calculatedRoute.slice(1).forEach((point, index) => {
        const pointLocation = {
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lng)
        };
        
        const marker = new google.maps.Marker({
          position: pointLocation,
          map,
          title: point.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#DB4437",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#FFFFFF",
            scale: 10
          },
          label: {
            text: `${index + 1}`,
            color: "#FFFFFF",
            fontWeight: "bold"
          }
        });
        
        newMarkers.push(marker);
      });
      
      // Guardar os marcadores para remover depois
      setMarkers(newMarkers);
      
      // Ajustar o mapa para mostrar todos os pontos
      map.fitBounds(bounds);
    } catch (e) {
      console.error('Erro ao mostrar rota calculada:', e);
      setError("Não foi possível renderizar o mapa com a rota calculada. Tente novamente.");
    }
  }, [map, origin, calculatedRoute]);

  const [error, setError] = useState<string | null>(null);

  // Verificar se o mapa foi carregado
  useEffect(() => {
    // Adicionar um timer para verificar se o mapa foi inicializado
    const timer = setTimeout(() => {
      if (!map && mapRef.current) {
        console.error("Mapa não inicializado após 5 segundos");
        setError("Não foi possível carregar o mapa. Verifique a conexão com a internet e as restrições da API Key.");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [map]);

  return (
    <div className="flex-1 relative h-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-xl overflow-hidden shadow-xl border border-blue-100" 
        style={{ minHeight: '500px' }}
      >
        {/* Mostrar mensagem de erro se o mapa não carregar */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center flex-col bg-white bg-opacity-90 p-4 z-50">
            <div className="text-red-600 font-bold mb-2">Erro ao carregar o mapa</div>
            <div className="text-center text-sm mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}