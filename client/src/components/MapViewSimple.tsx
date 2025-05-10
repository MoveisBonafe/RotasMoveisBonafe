import { useEffect, useRef, useState } from "react";
import { Location, PointOfInterest } from "@/lib/types";
import { useRoutesPreferred } from "@/hooks/useRoutesPreferred";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
  pointsOfInterest?: PointOfInterest[]; // Pontos de interesse (pedágios, balanças)
}

// Recuperar a API key do ambiente
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

export default function MapViewSimple({ 
  origin, 
  waypoints,
  calculatedRoute,
  pointsOfInterest = [],
  onRouteCalculated
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindows, setInfoWindows] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Flag para evitar processamentos repetidos
  const isProcessingRoute = useRef(false);

  // Inicializar o mapa quando o componente montar
  useEffect(() => {
    if (mapRef.current && window.google && window.google.maps) {
      try {
        console.log("Inicializando mapa...");
        
        // Configurar o mapa
        const mapOptions = {
          center: { lat: -22.3250, lng: -48.9280 }, // Centro inicial em Dois Córregos-SP
          zoom: 10,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_RIGHT
          },
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER
          },
          scaleControl: true,
          streetViewControl: true,
          streetViewControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP
          },
          gestureHandling: 'greedy', // Permite dar zoom com scroll sem precisar segurar Ctrl
          scrollwheel: true // Habilitar zoom com scroll do mouse
        };
        
        // Criar mapa e guardar referência
        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);
        
        // Inicializar o DirectionsRenderer
        const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
          map: newMap,
          draggable: false,
          hideRouteList: true,
          markerOptions: {
            visible: false // Esconder marcadores padrão
          },
          polylineOptions: {
            strokeColor: "#4285F4", // Azul Google
            strokeOpacity: 0.8,
            strokeWeight: 5
          }
        });
        
        setDirectionsRenderer(newDirectionsRenderer);
        console.log("Mapa inicializado com sucesso");
      } catch (e) {
        console.error("Erro ao inicializar mapa:", e);
        setError("Não foi possível carregar o mapa. Por favor, atualize a página.");
      }
    }
  }, [mapRef]);

  // Efeito para mostrar os marcadores iniciais (sem números)
  useEffect(() => {
    if (!map || !origin) return;
    
    // Verificamos se já temos calculatedRoute
    const isRouteCalculated = calculatedRoute && calculatedRoute.length > 0;
    
    // Não mostrar os marcadores iniciais se já tivermos uma rota calculada
    if (isRouteCalculated) return;
    
    console.log("Atualizando marcadores iniciais (sem rota calculada)");
    
    // Limpar marcadores e polylines
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());
    
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
    
    const newMarkers = [];
    const newInfoWindows = [];
    
    // Adicionar marcador da origem
    const originMarker = new window.google.maps.Marker({
      position: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
      map: map,
      title: origin.name || "Origem",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
      },
      zIndex: 100
    });
    
    const originInfoWindow = new window.google.maps.InfoWindow({
      content: `<div><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
    });
    
    originMarker.addListener("click", () => {
      originInfoWindow.open(map, originMarker);
    });
    
    newMarkers.push(originMarker);
    newInfoWindows.push(originInfoWindow);
    
    // Adicionar marcadores dos waypoints (sem números)
    if (waypoints && waypoints.length > 0) {
      waypoints.forEach((waypoint, index) => {
        const waypointMarker = new window.google.maps.Marker({
          position: { lat: parseFloat(waypoint.lat), lng: parseFloat(waypoint.lng) },
          map: map,
          title: waypoint.name || `Destino ${index + 1}`,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          },
          zIndex: 100
        });
        
        const waypointInfoWindow = new window.google.maps.InfoWindow({
          content: `<div><strong>${waypoint.name || `Destino ${index + 1}`}</strong><br>${waypoint.address || ""}</div>`
        });
        
        waypointMarker.addListener("click", () => {
          waypointInfoWindow.open(map, waypointMarker);
        });
        
        newMarkers.push(waypointMarker);
        newInfoWindows.push(waypointInfoWindow);
      });
    }
    
    // Atualizar o estado
    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);
    
    // Ajustar a visualização para mostrar todos os marcadores
    const bounds = new window.google.maps.LatLngBounds();
    newMarkers.forEach(marker => {
      if (marker.getPosition()) {
        bounds.extend(marker.getPosition());
      }
    });
    
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, origin, waypoints, calculatedRoute, directionsRenderer, markers, infoWindows]);
  
  // Efeito para calcular e mostrar a rota (com números)
  // Só executa quando calculatedRoute está definido (o usuário clicou em "Calcular Melhor Rota")
  useEffect(() => {
    if (!map || !directionsRenderer || !origin || !waypoints.length || !calculatedRoute || !calculatedRoute.length) {
      return;
    }
    
    // Evitar execuções repetidas
    if (isProcessingRoute.current) return;
    isProcessingRoute.current = true;
    
    console.log("Calculando rota otimizada com waypoints numerados");
    
    try {
      // Limpar marcadores existentes
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
      
      // Preparar waypoints para a API Google Maps
      const googleWaypoints = waypoints.map(waypoint => ({
        location: new window.google.maps.LatLng(
          parseFloat(waypoint.lat),
          parseFloat(waypoint.lng)
        ),
        stopover: true
      }));
      
      // Configurar origem e destino
      const originLatLng = new window.google.maps.LatLng(
        parseFloat(origin.lat),
        parseFloat(origin.lng)
      );
      
      // O último waypoint é o destino final
      const destination = googleWaypoints.pop()?.location || originLatLng;
      
      // Configurar a requisição
      const directionsService = new window.google.maps.DirectionsService();
      const request = {
        origin: originLatLng,
        destination: destination,
        waypoints: googleWaypoints,
        optimizeWaypoints: false, // Não otimizar (já foi otimizado pelo algoritmo TSP)
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        avoidFerries: true,
        provideRouteAlternatives: false
      };
      
      directionsService.route(request, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Mostrar a rota no mapa
          directionsRenderer.setDirections(result);
          
          // Obter ordem otimizada dos waypoints
          let waypointOrder: number[] = [];
          if (result.routes && result.routes[0] && result.routes[0].waypoint_order) {
            waypointOrder = result.routes[0].waypoint_order;
          }
          
          // Criar novos marcadores com numeração sequencial
          const newMarkers = [];
          const newInfoWindows = [];
          
          // Adicionar marcador para a origem com número 1
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
              fontSize: "14px",
              fontWeight: "bold"
            },
            zIndex: 100
          });
          
          const originInfoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
          });
          
          originMarker.addListener("click", () => {
            originInfoWindow.open(map, originMarker);
          });
          
          newMarkers.push(originMarker);
          newInfoWindows.push(originInfoWindow);
          
          // Preparar os waypoints na ordem correta
          let orderedWaypoints = [...waypoints];
          
          // Se temos ordem de waypoints da API do Google, reorganizar
          if (waypointOrder.length > 0 && waypointOrder.length === waypoints.length - 1) {
            const tempWaypoints = [...waypoints];
            const lastWaypoint = tempWaypoints.pop(); // Guardar o último
            
            // Reordenar os waypoints intermediários
            const reorderedWaypoints: Location[] = [];
            for (let i = 0; i < waypointOrder.length; i++) {
              reorderedWaypoints.push(tempWaypoints[waypointOrder[i]]);
            }
            
            // Adicionar o último waypoint (destino)
            if (lastWaypoint) {
              reorderedWaypoints.push(lastWaypoint);
            }
            
            orderedWaypoints = reorderedWaypoints;
          }
          
          // Adicionar marcadores numerados para cada waypoint
          orderedWaypoints.forEach((waypoint, index) => {
            const waypointMarker = new window.google.maps.Marker({
              position: { lat: parseFloat(waypoint.lat), lng: parseFloat(waypoint.lng) },
              map: map,
              title: waypoint.name || `Destino ${index + 1}`,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
              },
              label: {
                text: (index + 2).toString(), // +2 porque a origem é 1
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "bold"
              },
              zIndex: 100
            });
            
            const waypointInfoWindow = new window.google.maps.InfoWindow({
              content: `<div><strong>${waypoint.name || `Destino ${index + 1}`}</strong><br>${waypoint.address || ""}</div>`
            });
            
            waypointMarker.addListener("click", () => {
              waypointInfoWindow.open(map, waypointMarker);
            });
            
            newMarkers.push(waypointMarker);
            newInfoWindows.push(waypointInfoWindow);
          });
          
          // Atualizar o estado
          setMarkers(newMarkers);
          setInfoWindows(newInfoWindows);
          
          // Processar pontos de interesse ao longo da rota
          const tollPoints: any[] = [];
          
          // Se temos resultado do DirectionsService
          if (result && result.routes && result.routes[0]) {
            // Extrair informações de pedágio
            if (result.routes[0].legs) {
              result.routes[0].legs.forEach((leg: any) => {
                if (leg.steps) {
                  leg.steps.forEach((step: any) => {
                    if (step.toll_info && step.toll_info.has_toll) {
                      tollPoints.push(step.toll_info);
                    }
                  });
                }
              });
            }
          }
          
          // Informar o componente pai sobre a rota calculada
          if (onRouteCalculated) {
            const sequenceWithOrigin = [origin, ...orderedWaypoints];
            
            onRouteCalculated({
              ...result,
              tollPoints: tollPoints,
              googleSource: true,
              orderedSequence: sequenceWithOrigin
            });
          }
          
          // Habilitar interações do mapa novamente
          map.setOptions({
            draggable: true,
            zoomControl: true,
            scrollwheel: true,
            disableDoubleClickZoom: false
          });
          
          // Limpar flag de processamento
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
  }, [map, directionsRenderer, origin, waypoints, calculatedRoute, onRouteCalculated, markers, infoWindows]);
  
  // Componente do mapa
  return (
    <div className="h-full w-full relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 z-50 text-center">
          {error}
        </div>
      )}
      <div ref={mapRef} className="h-full w-full">
        {/* O mapa será renderizado aqui */}
      </div>
    </div>
  );
}