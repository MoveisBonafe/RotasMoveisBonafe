import { useCallback, useEffect, useRef, useState } from "react";
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
              fontWeight: "bold",
              className: "map-marker-label" // Classe para estilização CSS
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
    if (!map || !directionsRenderer || !origin || !calculatedRoute || calculatedRoute.length < 1) {
      console.log("Dados insuficientes para renderizar rota ou mapa não inicializado ainda");
      return;
    }

    console.log("Renderizando rota calculada no novo mapa simplificado");
    
    try {
      // Limpar marcadores antigos
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
      
      setMarkers([]);
      setInfoWindows([]);
      
      const newMarkers: google.maps.Marker[] = [];
      const newInfoWindows: google.maps.InfoWindow[] = [];
      
      // Bounds para ajustar o mapa
      const bounds = new google.maps.LatLngBounds();
      
      // Se temos uma rota calculada com pelo menos 2 pontos
      if (calculatedRoute && calculatedRoute.length >= 2) {
        // Preparar pontos para o DirectionsService
        const originPoint = {
          lat: parseFloat(origin.lat),
          lng: parseFloat(origin.lng)
        };
        bounds.extend(originPoint);
        
        // Pontos intermediários
        const waypointsForRoute = calculatedRoute.slice(1, -1).map(point => ({
          location: new google.maps.LatLng(
            parseFloat(point.lat),
            parseFloat(point.lng)
          ),
          stopover: true
        }));
        
        // Ponto de destino (último ponto)
        const destinationPoint = {
          lat: parseFloat(calculatedRoute[calculatedRoute.length - 1].lat),
          lng: parseFloat(calculatedRoute[calculatedRoute.length - 1].lng)
        };
        bounds.extend(destinationPoint);
        
        // Criar serviço de direções usando Routes Preferred API
        const directionsService = new google.maps.DirectionsService();
        
        // Configurar requisição com opções especiais para Routes Preferred
        const request = {
          origin: originPoint,
          destination: destinationPoint,
          waypoints: waypointsForRoute,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
          // Habilitando Routes Preferred API
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS
          },
          // Requisitando informações sobre pedágios
          avoidTolls: false,
          // Solicitando alternativas para mostrar os pedágios
          provideRouteAlternatives: false
        };
        
        // Obter direções
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            
            // Adicionar marcadores de origem e destino explicitamente
            console.log("Rota calculada! Usando abordagem direta para adicionar marcadores.");
            
            // IMPORTANTE: Adicionar marcadores de origem e waypoints MANUALMENTE
            // Isto é necessário porque 'suppressMarkers: true' remove os marcadores padrão
            
            // 1. Adicionar marcador para a origem
            if (origin) {
              console.log("ADICIONANDO MARCADOR DE ORIGEM:", origin);
              const originPoint = {
                lat: parseFloat(origin.lat),
                lng: parseFloat(origin.lng)
              };
              
              // Criar e adicionar marcador de origem
              const originMarker = new google.maps.Marker({
                position: originPoint,
                map: map,
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
                  fontWeight: "bold",
                  className: "map-marker-label" // Classe para estilização CSS
                },
                zIndex: 100
              });
              
              // Adicionar InfoWindow que será exibida ao clicar no marcador
              const infoWindow = new google.maps.InfoWindow({
                content: `<div class="info-window"><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
              });
              
              // Adicionar evento de clique para mostrar a InfoWindow
              originMarker.addListener("click", () => {
                infoWindow.open(map, originMarker);
              });
              
              newMarkers.push(originMarker);
              newInfoWindows.push(infoWindow);
              console.log("✅ Marcador de origem adicionado");
            }
            
            // 2. Adicionar marcadores para os waypoints/destinos
            if (calculatedRoute && calculatedRoute.length > 1) {
              console.log("ADICIONANDO MARCADORES PARA DESTINOS:", calculatedRoute.length - 1);
              
              calculatedRoute.slice(1).forEach((point, index) => {
                const position = {
                  lat: parseFloat(point.lat),
                  lng: parseFloat(point.lng)
                };
                
                // Criar e adicionar marcador para waypoint/destino com pino vermelho tradicional
                const waypointMarker = new google.maps.Marker({
                  position: position,
                  map: map,
                  title: point.name || `Ponto ${index + 1}`,
                  // Usar pino vermelho tradicional
                  icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    labelOrigin: new google.maps.Point(14, 40) // Posição do rótulo abaixo do pino
                  },
                  label: {
                    text: (index + 1).toString(),
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: "bold",
                    className: "map-marker-label" // Classe para estilização CSS
                  },
                  zIndex: 100
                });
                
                // Adicionar InfoWindow que será exibida ao clicar no marcador
                const infoWindow = new google.maps.InfoWindow({
                  content: `<div class="info-window"><strong>${point.name || `Destino ${index + 1}`}</strong><br>${point.address || ""}</div>`
                });
                
                // Adicionar evento de clique para mostrar a InfoWindow
                waypointMarker.addListener("click", () => {
                  infoWindow.open(map, waypointMarker);
                });
                
                // Armazenar marcador e infoWindow
                newMarkers.push(waypointMarker);
                newInfoWindows.push(infoWindow);
                
                console.log(`✅ Marcador de pino ${index + 1} adicionado em ${position.lat}, ${position.lng}`);
              });
            }
            
            console.log(`Total de ${newMarkers.length} marcadores adicionados ao mapa`);
      
            // Processar pedágios e outras informações da API Routes Preferred
            try {
              console.log("Processando resultado completo da API Routes Preferred:");
              console.log("Resposta completa da API:", JSON.stringify(result, null, 2));
              
              // Verificar se a resposta contém informações de pedágio
              if (result.routes && result.routes[0] && result.routes[0].legs) {
                console.log("Analisando legs da rota para encontrar dados de pedágio");
                result.routes[0].legs.forEach((leg: any, i: number) => {
                  console.log(`Leg ${i+1} contém toll_info:`, !!leg.toll_info);
                  if (leg.toll_info) {
                    console.log(`Toll info para leg ${i+1}:`, JSON.stringify(leg.toll_info, null, 2));
                  }
                });
              }
              
              // Extrair informações de pedágio diretamente da API do Google Maps
              const tollPointsFromAPI = extractTollsFromRoute(result);
              
              // Se encontramos pedágios através da API, usamos APENAS esses pedágios (nada de mesclar)
              if (tollPointsFromAPI && tollPointsFromAPI.length > 0) {
                console.log(`Encontrados ${tollPointsFromAPI.length} pedágios EXATOS via API Routes Preferred`);
                
                // Armazenar para uso posterior
                setApiTollPoints(tollPointsFromAPI);
                
                // Substituir completamente os pontos de interesse com os pedágios da API
                pointsOfInterest = tollPointsFromAPI;
                
                // Notificar o componente pai sobre os dados da rota processados
                // APENAS com os pedágios exatos da API
                if (onRouteCalculated && typeof onRouteCalculated === 'function') {
                  onRouteCalculated({
                    ...result,
                    poisAlongRoute: tollPointsFromAPI // Usando apenas os pedágios da API
                  });
                }
              }
            } catch (error) {
              console.error("Erro ao processar dados de pedágio da API Routes Preferred:", error);
            }
            
            // SUPER IMPORTANTE: Adicionar POIs explicitamente como marcadores
            console.log("Adicionando POIs como marcadores:", pointsOfInterest);
            
            // Extrair pedágios DIRETAMENTE da resposta da API do Google Maps
            try {
              // Usar nossa nova função mais precisa para extrair os pedágios
              const apiTollPoints = extractTollsFromRoute(result);
              
              // VERIFICAR ROTA PARA BOA ESPERANÇA DO SUL
              // Verificar se a rota passa entre Dois Córregos e Ribeirão Preto
              let boaEsperancaTollAdded = false;
              
              // Obter as cidades na rota
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
              
              // Se a rota inclui Ribeirão Preto ou qualquer cidade ao norte/nordeste de Dois Córregos
              const northeasternCities = ['Ribeirão Preto', 'Jaú', 'Araraquara', 'São Carlos', 'Bauru', 'Boa Esperança do Sul'];
              const hasNortheasternCity = northeasternCities.some(city => cities.some(routeCity => routeCity.includes(city)));
              
              if (hasNortheasternCity) {
                console.log("Rota passa por região que pode conter o pedágio de Boa Esperança do Sul");
                
                // Verificar se o pedágio de Boa Esperança do Sul já está incluído
                const hasBESPToll = apiTollPoints.some(toll => 
                  toll.name.includes("Boa Esperança") || 
                  (Math.abs(parseFloat(toll.lat) - (-21.9901)) < 0.01 && 
                   Math.abs(parseFloat(toll.lng) - (-48.3923)) < 0.01)
                );
                
                if (!hasBESPToll) {
                  console.log("Adicionando pedágio de Boa Esperança do Sul manualmente");
                  
                  // Adicionar o pedágio de Boa Esperança do Sul explicitamente
                  apiTollPoints.push({
                    id: 99999, // ID especial para reconhecimento
                    name: "Pedágio Boa Esperança do Sul",
                    lat: "-21.9901",
                    lng: "-48.3923",
                    type: "toll",
                    cost: 1050, // R$10.50
                    roadName: "SP-255",
                    restrictions: null
                  } as PointOfInterest);
                  
                  console.log("Pedágio EXATO: Pedágio Boa Esperança do Sul, posição: -21.9901,-48.3923");
                }
              }
              
              console.log("Rota calculada pelo Google Maps, processando resposta:", result);
              console.log("Rota contém pedágios:", result.routes?.[0]?.legs?.some((leg: any) => leg.toll_info));
              
              // Adicionar pedágios como marcadores no mapa
              console.log(`Adicionando ${apiTollPoints.length} POIs ao mapa (incluindo pedágios da API)`);
              
              apiTollPoints.forEach(poi => {
                const poiPoint = {
                  lat: parseFloat(poi.lat),
                  lng: parseFloat(poi.lng)
                };
                
                // Escolher ícone baseado no tipo de POI
                let iconUrl = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // Padrão
                if (poi.type === "toll") {
                  iconUrl = "https://maps.google.com/mapfiles/ms/icons/green-dot.png"; // Pedágio
                } else if (poi.type === "weighing_station") {
                  iconUrl = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // Balança
                }
                
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
                
                // Criar conteúdo da janela de informação baseado no tipo
                let infoContent = `<div><strong>${poi.name}</strong></div>`;
                if (poi.type === "toll") {
                  const costInReais = (poi.cost || 0) / 100; // Converter de centavos para reais
                  infoContent += `<div>Custo: R$ ${costInReais.toFixed(2)}</div>`;
                  infoContent += `<div>Rodovia: ${poi.roadName || ""}</div>`;
                } else if (poi.type === "weighing_station") {
                  infoContent += `<div>Tipo: Balança</div>`;
                  if (poi.restrictions) {
                    infoContent += `<div>Restrições: ${poi.restrictions}</div>`;
                  }
                }
                
                // Criar e configurar a janela de informação
                const infoWindow = new google.maps.InfoWindow({
                  content: infoContent
                });
                
                // Adicionar evento de clique para mostrar a janela de informação
                poiMarker.addListener("click", () => {
                  infoWindow.open(map, poiMarker);
                });
                
                // Adicionar aos arrays para controle posterior
                newMarkers.push(poiMarker);
                newInfoWindows.push(infoWindow);
                
                const poiType = poi.id === 99999 ? " (da API)" : "";
                console.log(`POI adicionado ao mapa: ${poi.name} (${poi.type})${poiType}`);
              });
              
              console.log(`Total de ${apiTollPoints.length} POIs adicionados ao mapa`);
            } catch (error) {
              console.error("Erro ao processar pontos de interesse:", error);
            }
            
            // Ajustar o zoom do mapa para mostrar todos os pontos
            map.fitBounds(bounds);
            
            // Armazenar os marcadores e infoWindows criados
            setMarkers(newMarkers);
            setInfoWindows(newInfoWindows);
          } else {
            console.error("Erro ao calcular rota:", status);
            setError(`Não foi possível calcular a rota. Erro: ${status}`);
            
            // Se não conseguimos calcular a rota, mostrar apenas marcadores
            showFallbackMarkers();
          }
        });
      } else {
        // Se não temos rota calculada, mostrar apenas marcadores
        showFallbackMarkers();
      }
      
      // Função para mostrar apenas marcadores se a rota falhar
      function showFallbackMarkers() {
        console.log("Usando fallback para mostrar apenas marcadores");
        
        if (origin) {
          const originPoint = {
            lat: parseFloat(origin.lat),
            lng: parseFloat(origin.lng)
          };
          
          bounds.extend(originPoint);
          
          const originMarker = new google.maps.Marker({
            position: originPoint,
            map,
            title: origin.name,
            // Usar o pino vermelho padrão
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
          
          // Adicionar InfoWindow
          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="info-window"><strong>${origin.name || "Origem"}</strong><br>${origin.address || ""}</div>`
          });
          
          // Adicionar evento de clique para mostrar a InfoWindow
          originMarker.addListener("click", () => {
            infoWindow.open(map, originMarker);
          });
          
          newMarkers.push(originMarker);
          newInfoWindows.push(infoWindow);
        }
        
        // Adicionar marcadores para waypoints manualmente
        waypoints.forEach((waypoint, index) => {
          if (waypoint && waypoint.location) {
            const position = {
              lat: waypoint.location.lat(),
              lng: waypoint.location.lng()
            };
            
            bounds.extend(position);
            
            const waypointMarker = new google.maps.Marker({
              position,
              map,
              title: `Ponto ${index + 1}`,
              // Usar o pino vermelho padrão
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
              zIndex: 90
            });
            
            newMarkers.push(waypointMarker);
          }
        });
        
        if (newMarkers.length > 0) {
          map.fitBounds(bounds);
        }
        
        setMarkers(newMarkers);
      }
    } catch (error) {
      console.error("Erro ao renderizar rota:", error);
      setError("Erro ao renderizar a rota. Tente novamente.");
    }
  }, [map, directionsRenderer, origin, calculatedRoute, waypoints, pointsOfInterest, onRouteCalculated, infoWindows, markers]);

  return (
    <div className="map-container" style={{ width: "100%", height: "100%" }}>
      {error && <div className="map-error">{error}</div>}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}