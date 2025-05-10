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
  // Tipagem para os estados do Google Maps
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindows, setInfoWindows] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Flag para controlar execuções repetidas
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
        
        // Adicionar marcador de origem se já tiver dados
        if (origin) {
          console.log("Adicionando marcador para origem durante inicialização:", origin);
          const originMarker = new window.google.maps.Marker({
            position: { 
              lat: parseFloat(origin.lat), 
              lng: parseFloat(origin.lng) 
            },
            map: newMap,
            title: origin.name || "Origem",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            },
            label: {
              text: "0",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "bold"
            },
            zIndex: 100
          });
          
          // Criar janela de informação
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div class="info-window"><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
          });
          
          // Adicionar evento para mostrar janela ao clicar
          originMarker.addListener("click", () => {
            infoWindow.open(newMap, originMarker);
          });
          
          // Guardar referências
          setMarkers([originMarker]);
          setInfoWindows([infoWindow]);
          
          // Centralizar mapa na origem
          newMap.setCenter({ 
            lat: parseFloat(origin.lat), 
            lng: parseFloat(origin.lng) 
          });
        }
        
      } catch (e) {
        console.error("Erro ao inicializar mapa:", e);
        setError("Não foi possível carregar o mapa. Por favor, atualize a página.");
      }
    }
  }, [mapRef, origin]);

  // Efeito para atualizar a rota quando os waypoints mudarem
  useEffect(() => {
    if (map && directionsRenderer && origin && waypoints.length > 0) {
      // Evitar execuções repetidas e tremulação
      if (isProcessingRoute.current) return;
      isProcessingRoute.current = true;

      console.log("Calculando nova rota...");
      
      // Desabilitar interações enquanto calcula para prevenir tremulações
      if (map.setOptions) {
        map.setOptions({
          draggable: false,
          zoomControl: false,
          scrollwheel: false,
          disableDoubleClickZoom: true
        });
      }
      
      // Limpar marcadores existentes
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      
      // Fechar janelas de informação
      infoWindows.forEach(infoWindow => infoWindow.close());
      setInfoWindows([]);
      
      // Preparar os waypoints para a API do Google
      const googleWaypoints = waypoints.map(waypoint => ({
        location: new window.google.maps.LatLng(
          parseFloat(waypoint.lat), 
          parseFloat(waypoint.lng)
        ),
        stopover: true
      }));
      
      // Configurar o serviço de rotas
      const directionsService = new window.google.maps.DirectionsService();
      
      // Definir origem e destino
      const originLatLng = new window.google.maps.LatLng(
        parseFloat(origin.lat),
        parseFloat(origin.lng)
      );
      
      // O último ponto da lista será o destino
      const destination = googleWaypoints.pop()?.location || originLatLng;
      
      // Configurar a requisição de rota
      const request = {
        origin: originLatLng,
        destination: destination,
        waypoints: googleWaypoints,
        optimizeWaypoints: true, // Otimizar ordem dos waypoints
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        avoidFerries: true,
        provideRouteAlternatives: false
      };
      
      // Solicitar a rota à API
      directionsService.route(request, function(result, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Exibir a rota no mapa
          directionsRenderer.setDirections(result);
          
          console.log("Rota calculada! Adicionando marcadores...");
          
          // Processar a rota
          const newMarkers = [];
          const newInfoWindows = [];
          
          try {
            // 1. Adicionar marcador para a origem
            if (origin) {
              const originMarker = new window.google.maps.Marker({
                position: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
                map: map,
                title: origin.name || "Origem",
                icon: {
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                },
                label: {
                  text: "0",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "bold"
                },
                zIndex: 100
              });
              
              // Criar janela de informação
              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div class="info-window"><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
              });
              
              // Adicionar evento para mostrar janela ao clicar
              originMarker.addListener("click", () => {
                infoWindow.open(map, originMarker);
              });
              
              newMarkers.push(originMarker);
              newInfoWindows.push(infoWindow);
            }
            
            // 2. Adicionar marcadores para cada waypoint (na ordem da rota calculada)
            if (result.routes && result.routes[0] && result.routes[0].waypoint_order) {
              const waypointOrder = result.routes[0].waypoint_order;
              console.log("Ordem dos waypoints:", waypointOrder);
              
              // Reordenar waypoints conforme a ordem otimizada da rota
              const waypointsInOrder = waypointOrder.map(index => waypoints[index]);
              
              // Adicionar também o destino final (que não está nos waypoints do Google)
              if (waypoints.length > googleWaypoints.length + 1) {
                waypointsInOrder.push(waypoints[waypoints.length - 1]);
              }
              
              // Adicionar marcadores para cada ponto na ordem correta
              waypointsInOrder.forEach((point, index) => {
                const waypointMarker = new window.google.maps.Marker({
                  position: { lat: parseFloat(point.lat), lng: parseFloat(point.lng) },
                  map: map,
                  title: point.name || `Destino ${index + 1}`,
                  icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  },
                  label: {
                    text: (index + 1).toString(),
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: "bold"
                  },
                  zIndex: 100
                });
                
                // Criar janela de informação para o ponto
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `<div class="info-window"><strong>${point.name || `Destino ${index + 1}`}</strong><br>${point.address || ""}</div>`
                });
                
                // Adicionar evento para mostrar janela ao clicar
                waypointMarker.addListener("click", () => {
                  infoWindow.open(map, waypointMarker);
                });
                
                newMarkers.push(waypointMarker);
                newInfoWindows.push(infoWindow);
              });
            }
            
            // 3. Adicionar marcadores de pedágio
            const tollPoints = pointsOfInterest.filter(poi => poi.type === 'toll');
            
            // Adicionar apenas os pedágios que fazem sentido para a rota
            tollPoints.forEach(toll => {
              const position = {
                lat: parseFloat(toll.lat),
                lng: parseFloat(toll.lng)
              };
              
              // Criar marcador para o pedágio
              const tollMarker = new window.google.maps.Marker({
                position,
                map,
                title: toll.name,
                icon: {
                  url: "https://maps.google.com/mapfiles/ms/micons/green-dollar.png",
                  scaledSize: new window.google.maps.Size(32, 32)
                },
                zIndex: 5
              });
              
              // Criar janela de informação
              const infoContent = `
                <div style="min-width: 200px; padding: 10px;">
                  <h3 style="margin: 0; font-size: 16px; color: #d32f2f;">${toll.name}</h3>
                  <p style="margin: 5px 0;"><strong>Tipo:</strong> Pedágio</p>
                  <p style="margin: 5px 0;"><strong>Custo:</strong> R$ ${(toll.cost ? toll.cost / 100 : 0).toFixed(2)}</p>
                  <p style="margin: 5px 0;"><strong>Rodovia:</strong> ${toll.roadName || 'N/A'}</p>
                  <p style="margin: 5px 0;"><strong>Cidade:</strong> ${toll.city || 'N/A'}</p>
                </div>
              `;
              
              const infoWindow = new window.google.maps.InfoWindow({
                content: infoContent
              });
              
              tollMarker.addListener('click', () => {
                newInfoWindows.forEach(iw => iw.close());
                infoWindow.open(map, tollMarker);
              });
              
              // Adicionar metadados ao marcador
              tollMarker.set('isPOI', true);
              tollMarker.set('poiInfo', toll);
              
              // Adicionar às listas
              newMarkers.push(tollMarker);
              newInfoWindows.push(infoWindow);
            });
            
            // 4. Adicionar outros POIs se necessário (ex: balanças)
            const nonTollPOIs = pointsOfInterest.filter(poi => poi.type !== 'toll');
            nonTollPOIs.forEach(poi => {
              if (poi.lat && poi.lng) {
                const position = {
                  lat: parseFloat(poi.lat),
                  lng: parseFloat(poi.lng)
                };
                
                // Criar marcador
                const poiMarker = new window.google.maps.Marker({
                  position,
                  map,
                  title: poi.name,
                  icon: {
                    url: poi.type === 'weighing_station'
                      ? "https://maps.google.com/mapfiles/ms/micons/blue-truck.png"
                      : "https://maps.google.com/mapfiles/ms/icons/info.png",
                    scaledSize: new window.google.maps.Size(32, 32)
                  },
                  zIndex: 4
                });
                
                // Criar janela de informação
                let infoContent = `
                  <div style="min-width: 200px; padding: 10px;">
                    <h3 style="margin: 0; font-size: 16px;">${poi.name}</h3>
                `;
                
                if (poi.type === 'weighing_station') {
                  infoContent += `<p style="margin: 5px 0;"><strong>Tipo:</strong> Balança</p>`;
                  if (poi.roadName) infoContent += `<p style="margin: 5px 0;"><strong>Rodovia:</strong> ${poi.roadName}</p>`;
                  if (poi.city) infoContent += `<p style="margin: 5px 0;"><strong>Cidade:</strong> ${poi.city}</p>`;
                }
                
                infoContent += `</div>`;
                
                const infoWindow = new window.google.maps.InfoWindow({
                  content: infoContent
                });
                
                // Adicionar evento de clique
                poiMarker.addListener('click', () => {
                  newInfoWindows.forEach(iw => iw.close());
                  infoWindow.open(map, poiMarker);
                });
                
                // Adicionar metadados
                poiMarker.set('isPOI', true);
                poiMarker.set('poiInfo', poi);
                
                // Adicionar às listas
                newMarkers.push(poiMarker);
                newInfoWindows.push(infoWindow);
              }
            });
            
            // Atualizar o estado com os novos marcadores
            setMarkers(newMarkers);
            setInfoWindows(newInfoWindows);
            
            // Ajustar o mapa para mostrar todos os pontos
            const bounds = new window.google.maps.LatLngBounds();
            newMarkers.forEach(marker => {
              if (marker.getPosition()) {
                bounds.extend(marker.getPosition());
              }
            });
            
            if (newMarkers.length > 0) {
              map.fitBounds(bounds);
              
              // Evitar zoom muito próximo
              const listener = window.google.maps.event.addListener(map, "idle", () => {
                if (map.getZoom() > 15) map.setZoom(15);
                window.google.maps.event.removeListener(listener);
              });
            }
            
            // Informar o componente pai sobre a rota calculada
            if (onRouteCalculated) {
              onRouteCalculated({
                ...result,
                tollPoints: tollPoints,
                googleSource: true
              });
            }
            
          } catch (error) {
            console.error("Erro ao processar rota:", error);
          } finally {
            // Restaurar interações do mapa
            if (map && map.setOptions) {
              // Pequeno atraso para suavizar a transição
              setTimeout(() => {
                map.setOptions({
                  draggable: true,
                  zoomControl: true,
                  scrollwheel: true,
                  disableDoubleClickZoom: false,
                  gestureHandling: 'greedy'
                });
                
                // Permitir novos cálculos
                isProcessingRoute.current = false;
              }, 200);
            } else {
              isProcessingRoute.current = false;
            }
          }
        } else {
          console.error("Erro ao calcular rota:", status);
          // Em caso de falha, exibir mensagem de erro
          setError("Não foi possível calcular a rota. Tente novamente mais tarde.");
          
          // Restaurar interações do mapa
          if (map && map.setOptions) {
            map.setOptions({
              draggable: true,
              zoomControl: true,
              scrollwheel: true,
              disableDoubleClickZoom: false,
              gestureHandling: 'greedy'
            });
          }
          
          isProcessingRoute.current = false;
        }
      });
    }
  }, [map, directionsRenderer, origin, waypoints, calculatedRoute, onRouteCalculated, pointsOfInterest]);

  // Função para estimar custo de pedágio baseado no tipo de veículo
  function estimateTollCost(vehicleType: string): number {
    switch(vehicleType) {
      case 'car': return 1300; // R$13,00
      case 'motorcycle': return 650; // R$6,50
      case 'truck1': return 2600; // R$26,00
      case 'truck2': return 3900; // R$39,00
      default: return 1300;
    }
  }

  // Renderizar o componente
  return (
    <div className="map-container relative w-full h-full">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center p-2 z-10">
          {error}
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ width: "100%", height: "100%", borderRadius: "8px" }}
      />
      {!window.google && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}