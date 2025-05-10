import { useEffect, useRef, useState } from "react";
import { Location, PointOfInterest } from "@/lib/types";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
  pointsOfInterest?: PointOfInterest[];
}

export default function MapViewBasic({ 
  origin, 
  waypoints,
  calculatedRoute,
  onRouteCalculated,
  pointsOfInterest = []
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Flag para controlar processamento de rota
  const isProcessingRoute = useRef(false);
  
  // Inicializar o mapa
  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return;
    
    try {
      // Configurar mapa
      const mapOptions = {
        center: { lat: -22.3250, lng: -48.9280 }, // Dois Córregos-SP
        zoom: 10,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy'
      };
      
      // Criar mapa
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      // Configurar renderer de direções
      const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true, // Não mostrar marcadores padrão
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeOpacity: 0.8,
          strokeWeight: 5
        }
      });
      
      setDirectionsRenderer(newDirectionsRenderer);
    } catch (e) {
      console.error("Erro ao inicializar mapa:", e);
      setError("Erro ao carregar o mapa. Por favor, atualize a página.");
    }
  }, [mapRef.current]);
  
  // Função para limpar marcadores existentes
  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };
  
  // Efeito para atualizar marcadores quando waypoints mudam
  useEffect(() => {
    if (!map || !origin) return;
    
    // Se já temos uma rota calculada, não mostrar apenas os marcadores simples
    const hasCalculatedRoute = calculatedRoute && calculatedRoute.length > 0;
    if (hasCalculatedRoute) return;
    
    console.log("Exibindo marcadores simples (sem números sequenciais)");
    
    // Limpar marcadores anteriores
    clearMarkers();
    
    // Limpar direções
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
    
    // Array para novos marcadores
    const newMarkers = [];
    
    // Adicionar marcador para origem
    if (origin) {
      const originMarker = new window.google.maps.Marker({
        position: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
        map: map,
        title: origin.name || "Origem",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
      });
      
      newMarkers.push(originMarker);
    }
    
    // Adicionar marcadores para destinos
    if (waypoints && waypoints.length > 0) {
      waypoints.forEach(waypoint => {
        const waypointMarker = new window.google.maps.Marker({
          position: { lat: parseFloat(waypoint.lat), lng: parseFloat(waypoint.lng) },
          map: map,
          title: waypoint.name,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          }
        });
        
        newMarkers.push(waypointMarker);
      });
    }
    
    // Atualizar estado
    setMarkers(newMarkers);
    
    // Ajustar visualização para mostrar todos os marcadores
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
    }
  }, [map, origin, waypoints, directionsRenderer, calculatedRoute]);
  
  // Efeito para calcular rota quando o usuário clicar em "Calcular Melhor Rota"
  useEffect(() => {
    if (!map || !directionsRenderer || !origin || !waypoints.length) return;
    
    // Só processar rota quando temos calculatedRoute (usuário clicou no botão)
    if (!calculatedRoute || calculatedRoute.length === 0) return;
    
    // Evitar processamento repetido
    if (isProcessingRoute.current) return;
    isProcessingRoute.current = true;
    
    console.log("Calculando rota otimizada e adicionando marcadores numerados");
    
    try {
      // Limpar marcadores existentes
      clearMarkers();
      
      // Preparar waypoints para Google
      const googleWaypoints = waypoints.map(waypoint => ({
        location: new window.google.maps.LatLng(
          parseFloat(waypoint.lat),
          parseFloat(waypoint.lng)
        ),
        stopover: true
      }));
      
      // Origem
      const originLatLng = new window.google.maps.LatLng(
        parseFloat(origin.lat),
        parseFloat(origin.lng)
      );
      
      // Destino (último waypoint)
      const destination = googleWaypoints.pop()?.location || originLatLng;
      
      // Configurar requisição
      const directionsService = new window.google.maps.DirectionsService();
      const request = {
        origin: originLatLng,
        destination: destination,
        waypoints: googleWaypoints,
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC
      };
      
      // Solicitar rota
      directionsService.route(request, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Mostrar rota no mapa
          directionsRenderer.setDirections(result);
          
          // Obter ordem dos waypoints
          let waypointOrder: number[] = [];
          if (result.routes && result.routes[0] && result.routes[0].waypoint_order) {
            waypointOrder = result.routes[0].waypoint_order;
          }
          
          // Criar novos marcadores numerados
          const newMarkers = [];
          
          // Adicionar marcador para origem (número 1)
          const originMarker = new window.google.maps.Marker({
            position: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
            map: map,
            title: origin.name || "Origem",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            },
            label: {
              text: "1",
              color: "#FFFFFF",
              fontWeight: "bold"
            }
          });
          
          newMarkers.push(originMarker);
          
          // Preparar waypoints na ordem correta
          let orderedWaypoints = [...waypoints];
          
          // Se temos ordem de waypoints da API, reorganizar
          if (waypointOrder.length > 0) {
            const tempWaypoints = [...waypoints];
            const lastWaypoint = tempWaypoints.pop(); // Guardar último
            
            // Reordenar waypoints intermediários
            const reorderedWaypoints: Location[] = [];
            waypointOrder.forEach(index => {
              reorderedWaypoints.push(tempWaypoints[index]);
            });
            
            // Adicionar último waypoint
            if (lastWaypoint) {
              reorderedWaypoints.push(lastWaypoint);
            }
            
            orderedWaypoints = reorderedWaypoints;
          }
          
          // Adicionar marcadores para waypoints
          orderedWaypoints.forEach((waypoint, index) => {
            const waypointMarker = new window.google.maps.Marker({
              position: { lat: parseFloat(waypoint.lat), lng: parseFloat(waypoint.lng) },
              map: map,
              title: waypoint.name,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
              },
              label: {
                text: (index + 2).toString(), // +2 porque origem é 1
                color: "#FFFFFF",
                fontWeight: "bold"
              }
            });
            
            newMarkers.push(waypointMarker);
          });
          
          // Atualizar estado
          setMarkers(newMarkers);
          
          // Informar componente pai sobre rota calculada
          if (onRouteCalculated) {
            const finalSequence = [origin, ...orderedWaypoints];
            onRouteCalculated({
              routes: result.routes,
              orderedSequence: finalSequence
            });
          }
          
          isProcessingRoute.current = false;
        } else {
          console.error("Erro ao calcular rota:", status);
          isProcessingRoute.current = false;
        }
      });
    } catch (error) {
      console.error("Erro ao processar rota:", error);
      isProcessingRoute.current = false;
    }
  }, [map, directionsRenderer, origin, waypoints, calculatedRoute, onRouteCalculated]);
  
  return (
    <div className="h-full w-full relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 z-50 text-center">
          {error}
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}