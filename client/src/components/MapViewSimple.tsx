import { useEffect, useRef, useState } from "react";
import { Location, PointOfInterest } from "@/lib/types";
import { useRoutesPreferred } from "@/hooks/useRoutesPreferred";
import { extractTollsFromRoute } from "@/lib/mapUtils";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
  pointsOfInterest?: PointOfInterest[]; // Pontos de interesse (pedágios, balanças)
}

// Definições para TypeScript
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
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
  // Tipagem mais precisa para os estados do Google Maps
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiTollPoints, setApiTollPoints] = useState<PointOfInterest[]>([]);
  
  // Usar o hook para trabalhar com a API Routes Preferred
  const { calculateRouteSegments } = useRoutesPreferred();

  // Flag para controlar execuções repetidas
  const isProcessingRoute = useRef(false);

  // Inicializar o mapa quando o componente montar
  useEffect(() => {
    if (mapRef.current && window.google && window.google.maps) {
      try {
        console.log("Inicializando mapa simplificado...");
        
        // Configurações iniciais do mapa
        const mapOptions = {
          center: { lat: -22.36752, lng: -48.38016 }, // Dois Córregos-SP
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          fullscreenControl: true,
          scrollwheel: true,
          gestureHandling: "greedy",
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          zoomControl: true,
          streetViewControl: true
        };

        // Criar a instância do mapa
        const newMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);
        
        // Configurar o renderizador de direções
        const newDirectionsRenderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true, // Importante: suprimir marcadores para usar os nossos customizados
          polylineOptions: {
            strokeColor: "#4285F4",
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        });
        newDirectionsRenderer.setMap(newMap);
        setDirectionsRenderer(newDirectionsRenderer);
        
        // Verificar se temos a origem para adicionar o marcador inicial
        if (origin) {
          console.log("ADICIONANDO MARCADOR DE ORIGEM NA INICIALIZAÇÃO:", origin);
          const originPoint = {
            lat: parseFloat(origin.lat),
            lng: parseFloat(origin.lng)
          };
          
          // Usar marcador de pino tradicional para a origem
          const originMarker = new google.maps.Marker({
            position: originPoint,
            map: newMap,
            title: origin.name || "Origem",
            // Usar o pino vermelho padrão
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Pino vermelho tradicional
              labelOrigin: new google.maps.Point(14, 40) // Posição do rótulo abaixo do pino
            },
            label: {
              text: "0",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: "bold"
            },
            zIndex: 100
          });
          
          // Adicionar InfoWindow que será exibida ao clicar no marcador
          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="info-window"><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
          });
          
          // Adicionar evento de clique para mostrar a InfoWindow
          originMarker.addListener("click", () => {
            infoWindow.open(newMap, originMarker);
          });
          
          // Armazenar marcador e infoWindow em arrays para limpar depois
          setMarkers(prev => [...prev, originMarker]);
          setInfoWindows(prev => [...prev, infoWindow]);
          
          console.log("✅ Marcador de origem com pino vermelho adicionado na inicialização do mapa");
        }
        
        console.log("Mapa inicializado com sucesso");
      } catch (e) {
        console.error("Erro ao inicializar mapa:", e);
        setError("Erro ao inicializar o mapa. Tente recarregar a página.");
      }
    }
  }, [origin]);

  // Renderizar a rota calculada
  useEffect(() => {
    // Verificar se temos todos os dados necessários
    if (!map || !directionsRenderer || !origin || !calculatedRoute || calculatedRoute.length < 1) {
      console.log("Dados insuficientes para renderizar rota ou mapa não inicializado ainda");
      return;
    }
    
    // Evitar dupla execução e loop infinito
    if (isProcessingRoute.current) {
      console.log("Ignorando recálculo - processamento em andamento");
      return;
    }
    
    // Definir flag de processamento
    isProcessingRoute.current = true;
    
    console.log("Renderizando rota calculada no mapa");
    
    try {
      // Limpar marcadores existentes
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
      
      // Resetar arrays de marcadores
      setMarkers([]);
      setInfoWindows([]);
      
      const newMarkers: google.maps.Marker[] = [];
      const newInfoWindows: google.maps.InfoWindow[] = [];
      
      // Bounds para ajustar o mapa
      const bounds = new google.maps.LatLngBounds();
      
      // Preparar pontos para a requisição
      const originPoint = {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng)
      };
      bounds.extend(originPoint);
      
      // Preparar waypoints (pontos intermediários)
      const waypointsForRoute = calculatedRoute.slice(1, -1).map(point => ({
        location: new google.maps.LatLng(
          parseFloat(point.lat),
          parseFloat(point.lng)
        ),
        stopover: true
      }));
      
      // Ponto de destino (último ponto)
      const destinationPoint = calculatedRoute.length > 1 ? {
        lat: parseFloat(calculatedRoute[calculatedRoute.length - 1].lat),
        lng: parseFloat(calculatedRoute[calculatedRoute.length - 1].lng)
      } : originPoint;
      bounds.extend(destinationPoint);
      
      // Configurar requisição do serviço de direções
      const directionsService = new google.maps.DirectionsService();
      const request = {
        origin: originPoint,
        destination: destinationPoint,
        waypoints: waypointsForRoute,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        },
        avoidTolls: false,
        provideRouteAlternatives: false
      };
      
      // Obter rota do Google Maps
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          // Exibir a rota no mapa
          directionsRenderer.setDirections(result);
          
          console.log("Rota calculada! Adicionando marcadores...");
          
          // 1. Adicionar marcador para a origem
          const originMarker = new google.maps.Marker({
            position: originPoint,
            map: map,
            title: origin.name || "Origem",
            // Usar pino vermelho tradicional
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              labelOrigin: new google.maps.Point(14, 40)
            },
            label: {
              text: "0",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: "bold"
            },
            zIndex: 100
          });
          
          // Criar janela de informação para origem
          const originInfoWindow = new google.maps.InfoWindow({
            content: `<div class="info-window"><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
          });
          
          // Adicionar evento para mostrar janela ao clicar
          originMarker.addListener("click", () => {
            originInfoWindow.open(map, originMarker);
          });
          
          newMarkers.push(originMarker);
          newInfoWindows.push(originInfoWindow);
          
          // 2. Adicionar marcadores para os destinos/pontos intermediários
          if (calculatedRoute.length > 1) {
            calculatedRoute.slice(1).forEach((point, index) => {
              const position = {
                lat: parseFloat(point.lat),
                lng: parseFloat(point.lng)
              };
              
              // Criar marcador com pino e numeração sequencial
              const waypointMarker = new google.maps.Marker({
                position,
                map: map,
                title: point.name || `Ponto ${index + 1}`,
                // Usar pino vermelho tradicional
                icon: {
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  labelOrigin: new google.maps.Point(14, 40)
                },
                label: {
                  text: (index + 1).toString(),
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: "bold"
                },
                zIndex: 100
              });
              
              // Criar janela de informação para o ponto
              const infoWindow = new google.maps.InfoWindow({
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
          
          // 3. Processar pontos de interesse e pedágios
          try {
            // Extrair pedágios da resposta
            const tollPointsFromAPI = extractTollsFromRoute(result);
            
            // Verificar se a rota passa por regiões específicas
            let northeasternCities = ['Ribeirão Preto', 'Jaú', 'Araraquara', 'São Carlos', 'Bauru'];
            
            // Extrair cidades da rota
            const cities: string[] = [];
            if (result.routes && result.routes[0] && result.routes[0].legs) {
              result.routes[0].legs.forEach((leg: any) => {
                if (leg.start_address) {
                  const cityMatch = leg.start_address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
                  if (cityMatch && cityMatch[1]) cities.push(cityMatch[1]);
                }
                if (leg.end_address) {
                  const cityMatch = leg.end_address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
                  if (cityMatch && cityMatch[1]) cities.push(cityMatch[1]);
                }
              });
            }
            
            console.log("Cidades na rota:", cities);
            
            // Verificar se a rota passa por regiões específicas
            const hasNortheasternCity = northeasternCities.some(city => 
              cities.some(routeCity => routeCity.includes(city))
            );
            
            // Adicionar o pedágio de Boa Esperança do Sul se necessário
            if (hasNortheasternCity) {
              console.log("Rota passa por região que pode conter o pedágio de Boa Esperança do Sul");
              
              // Verificar se o pedágio já está incluído
              const hasBESPToll = tollPointsFromAPI.some(toll => 
                toll.name.includes("Boa Esperança") || 
                (Math.abs(parseFloat(toll.lat) - (-21.9901)) < 0.01 && 
                Math.abs(parseFloat(toll.lng) - (-48.3923)) < 0.01)
              );
              
              if (!hasBESPToll) {
                console.log("Adicionando pedágio de Boa Esperança do Sul manualmente");
                
                // Adicionar o pedágio explicitamente
                const boaEsperancaToll = {
                  id: 99999,
                  name: "Pedágio Boa Esperança do Sul",
                  lat: "-21.9901",
                  lng: "-48.3923",
                  type: "toll" as "toll", // Type assertion para garantir compatibilidade
                  cost: 1050, // R$ 10.50
                  roadName: "SP-255",
                  restrictions: null
                };
                
                tollPointsFromAPI.push(boaEsperancaToll as PointOfInterest);
              }
            }
            
            // Notificar sobre os pontos calculados
            if (onRouteCalculated && typeof onRouteCalculated === 'function') {
              onRouteCalculated({
                ...result,
                poisAlongRoute: tollPointsFromAPI
              });
            }
            
            // Adicionar pedágios e POIs como marcadores no mapa
            console.log(`Adicionando ${tollPointsFromAPI.length} POIs ao mapa`);
            
            tollPointsFromAPI.forEach(poi => {
              const poiPoint = {
                lat: parseFloat(poi.lat),
                lng: parseFloat(poi.lng)
              };
              
              // Definir ícone baseado no tipo de POI
              let iconUrl = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // Padrão
              if (poi.type === "toll") {
                iconUrl = "https://maps.google.com/mapfiles/ms/icons/green-dot.png"; // Pedágio
              } else if (poi.type === "weighing_station") {
                iconUrl = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // Balança
              }
              
              // Criar marcador para o POI
              const poiMarker = new google.maps.Marker({
                position: poiPoint,
                map: map,
                title: poi.name,
                icon: {
                  url: iconUrl,
                  scaledSize: new google.maps.Size(30, 30)
                },
                zIndex: 50 // Abaixo dos marcadores de rota
              });
              
              // Criar conteúdo da janela de informação
              let infoContent = `<div><strong>${poi.name}</strong></div>`;
              if (poi.type === "toll") {
                const costInReais = (poi.cost || 0) / 100;
                infoContent += `<div>Custo: R$ ${costInReais.toFixed(2)}</div>`;
                infoContent += `<div>Rodovia: ${poi.roadName || ""}</div>`;
              } else if (poi.type === "weighing_station") {
                infoContent += `<div>Tipo: Balança</div>`;
                if (poi.restrictions) {
                  infoContent += `<div>Restrições: ${poi.restrictions}</div>`;
                }
              }
              
              // Criar e configurar janela de informação
              const infoWindow = new google.maps.InfoWindow({
                content: infoContent
              });
              
              // Adicionar evento de clique
              poiMarker.addListener("click", () => {
                infoWindow.open(map, poiMarker);
              });
              
              // Guardar referências
              newMarkers.push(poiMarker);
              newInfoWindows.push(infoWindow);
              
              console.log(`POI adicionado: ${poi.name} (${poi.type})`);
            });
          } catch (error) {
            console.error("Erro ao processar dados de pedágio:", error);
          }
          
          // Ajustar o zoom para mostrar todos os pontos
          map.fitBounds(bounds);
          
          // Armazenar todos os marcadores e infoWindows
          setMarkers(newMarkers);
          setInfoWindows(newInfoWindows);
          
          console.log(`Total de ${newMarkers.length} marcadores adicionados ao mapa`);
        } else {
          console.error("Erro ao calcular rota:", status);
          setError(`Não foi possível calcular a rota. Erro: ${status}`);
        }
        
        // Sempre reseta a flag ao final
        isProcessingRoute.current = false;
      });
    } catch (error) {
      console.error("Erro ao renderizar rota:", error);
      setError("Erro ao renderizar a rota. Tente novamente.");
      
      // Resetar a flag em caso de erro
      isProcessingRoute.current = false;
    }
  }, [map, directionsRenderer, origin, calculatedRoute, waypoints, pointsOfInterest, onRouteCalculated, markers, infoWindows]);

  return (
    <div className="map-container" style={{ width: "100%", height: "100%" }}>
      {error && <div className="map-error">{error}</div>}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}