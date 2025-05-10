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
        
      } catch (e) {
        console.error("Erro ao inicializar mapa:", e);
        setError("Não foi possível carregar o mapa. Por favor, atualize a página.");
      }
    }
  }, [mapRef]);

  // Efeito para atualizar a rota quando os waypoints mudarem
  useEffect(() => {
    if (map && directionsRenderer && origin && waypoints.length > 0) {
      // Evitar execuções repetidas
      if (isProcessingRoute.current) return;
      isProcessingRoute.current = true;

      console.log("Calculando nova rota...");
      
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
        optimizeWaypoints: false, // Não otimizar a ordem dos waypoints
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
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: "#4CAF50", // Verde para origem
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#FFFFFF",
                  scale: 12
                },
                label: {
                  text: "O",
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
            
            // 2. Adicionar marcadores para cada waypoint (numerados sequencialmente)
            if (waypoints && waypoints.length > 0) {
              waypoints.forEach((point, index) => {
                const waypointMarker = new window.google.maps.Marker({
                  position: { lat: parseFloat(point.lat), lng: parseFloat(point.lng) },
                  map: map,
                  title: point.name || `Destino ${index + 1}`,
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: "#2196F3", // Azul para destinos
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#FFFFFF",
                    scale: 12
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
            
            // 3. Adicionar marcadores de pedágio pré-definidos
            // Dados simulados para exemplificar
            const tollPoints = [
              {
                id: 1001,
                name: 'Pedágio SP-225 (Jaú)',
                type: 'toll',
                lat: '-22.2729',
                lng: '-48.5569',
                roadName: 'SP-225',
                cost: 1300, // em centavos
                city: 'Jaú'
              },
              {
                id: 1002,
                name: 'Pedágio SP-225 (Brotas)',
                type: 'toll',
                lat: '-22.2490',
                lng: '-48.1236',
                roadName: 'SP-225',
                cost: 1300,
                city: 'Brotas'
              },
              {
                id: 1003,
                name: 'Pedágio SP-310 (Itirapina)',
                type: 'toll',
                lat: '-22.2404',
                lng: '-47.8292',
                roadName: 'SP-310',
                cost: 1300,
                city: 'Itirapina'
              }
            ];
            
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
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: '#f44336', // Vermelho para pedágios
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                  scale: 10
                },
                zIndex: 5
              });
              
              // Criar janela de informação
              const infoContent = `
                <div style="min-width: 200px; padding: 10px;">
                  <h3 style="margin: 0; font-size: 16px; color: #d32f2f;">${toll.name}</h3>
                  <p style="margin: 5px 0;"><strong>Tipo:</strong> Pedágio</p>
                  <p style="margin: 5px 0;"><strong>Custo:</strong> R$ ${(toll.cost / 100).toFixed(2)}</p>
                  <p style="margin: 5px 0;"><strong>Rodovia:</strong> ${toll.roadName}</p>
                  <p style="margin: 5px 0;"><strong>Cidade:</strong> ${toll.city}</p>
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
                
                // Cor do marcador dependendo do tipo
                let fillColor = '#FF9800'; // Laranja (padrão)
                if (poi.type === 'weighing_station') {
                  fillColor = '#FF9800'; // Laranja para balanças
                } else if (poi.type === 'rest_area') {
                  fillColor = '#4CAF50'; // Verde para áreas de descanso
                }
                
                // Criar marcador
                const poiMarker = new window.google.maps.Marker({
                  position,
                  map,
                  title: poi.name,
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor,
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    scale: 10
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
            // Permitir novos cálculos
            isProcessingRoute.current = false;
          }
        } else {
          console.error("Erro ao calcular rota:", status);
          // Em caso de falha, exibir mensagem de erro
          setError("Não foi possível calcular a rota. Tente novamente mais tarde.");
          isProcessingRoute.current = false;
        }
      });
    }
  }, [map, directionsRenderer, origin, waypoints, markers, infoWindows, calculatedRoute, onRouteCalculated, pointsOfInterest]);

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
      
      {/* Adicionar legenda do mapa */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md z-10 text-sm">
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span>Origem</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span>Destino</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <span>Pedágio</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
          <span>Balança</span>
        </div>
      </div>
    </div>
  );
}