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

  // Quando uma rota for calculada, mostrar no mapa
  useEffect(() => {
    if (!map || !directionsRenderer || !origin || !calculatedRoute || calculatedRoute.length === 0) return;

    // Limpar marcadores quando mostrar a rota
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // Configurar o serviço de direções
    const directionsService = new google.maps.DirectionsService();

    // Preparar origem e destino
    const originLocation = {
      lat: parseFloat(origin.lat),
      lng: parseFloat(origin.lng)
    };

    const destination = calculatedRoute[calculatedRoute.length - 1];
    const destinationLocation = {
      lat: parseFloat(destination.lat),
      lng: parseFloat(destination.lng)
    };

    // Preparar waypoints
    const waypointsArr = calculatedRoute
      .slice(1, calculatedRoute.length - 1)
      .map(point => ({
        location: new google.maps.LatLng(
          parseFloat(point.lat),
          parseFloat(point.lng)
        ),
        stopover: true
      }));

    // Configurar a requisição de direções
    const request = {
      origin: originLocation,
      destination: destinationLocation,
      waypoints: waypointsArr,
      optimizeWaypoints: false,
      travelMode: 'DRIVING' // Modo de viagem: carro
    };

    // Fazer a requisição
    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Erro ao calcular rota:', status);
        // Se falhar, mostrar os marcadores
        const newMarkers: any[] = [];
        
        // Origem
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
        
        // Pontos da rota calculada
        calculatedRoute.slice(1).forEach((point, index) => {
          const marker = new google.maps.Marker({
            position: {
              lat: parseFloat(point.lat),
              lng: parseFloat(point.lng)
            },
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
        
        setMarkers(newMarkers);
        
        // Ajustar o mapa para mostrar todos os pontos
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(originLocation);
        calculatedRoute.forEach(point => {
          bounds.extend({
            lat: parseFloat(point.lat),
            lng: parseFloat(point.lng)
          });
        });
        map.fitBounds(bounds);
      }
    });
  }, [map, directionsRenderer, origin, calculatedRoute]);

  return (
    <div className="flex-1 relative h-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-xl overflow-hidden shadow-xl border border-blue-100" 
        style={{ minHeight: '500px' }}
      ></div>
    </div>
  );
}