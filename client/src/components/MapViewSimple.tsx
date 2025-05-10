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
  const { calculateRouteSegments } = useRoutesPreferred(); // Não usamos mais extractTollPoints

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
        
        console.log("Mapa inicializado com sucesso");
      } catch (e) {
        console.error("Erro ao inicializar mapa:", e);
        setError("Erro ao inicializar o mapa. Tente recarregar a página.");
      }
    }
  }, []);

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
      const newMarkers: any[] = [];
      
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
        const waypoints = calculatedRoute.slice(1, -1).map(point => ({
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
          waypoints: waypoints,
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
            // Isso é necessário porque suprimimos os marcadores padrão do DirectionsRenderer
            addRouteMarkers(calculatedRoute || [origin, ...waypoints.map(w => ({ 
              id: 0,
              name: w.location.toString(),
              address: "",
              lat: w.location.lat().toString(),
              lng: w.location.lng().toString(),
              isOrigin: false,
              cep: null
            }))]);
            
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
            
            // IMPORTANTE: Adicionar marcadores personalizados para cada ponto da rota
            // Origem (0)
            const originMarker = new google.maps.Marker({
              position: originPoint,
              map,
              title: origin.name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#4285F4", // Azul Google
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#FFFFFF",
                scale: 10
              },
              label: {
                text: "0", // "Origem" é o ponto 0
                color: "#FFFFFF",
                fontWeight: "bold"
              },
              zIndex: 100
            });
            newMarkers.push(originMarker);
            
            // Destinos com números sequenciais
            calculatedRoute.slice(1).forEach((point, index) => {
              const position = {
                lat: parseFloat(point.lat),
                lng: parseFloat(point.lng)
              };
              
              bounds.extend(position);
              
              const marker = new google.maps.Marker({
                position,
                map,
                title: point.name,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: "#DB4437", // Vermelho Google
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#FFFFFF",
                  scale: 10
                },
                label: {
                  text: `${index + 1}`, // Numeração sequencial
                  color: "#FFFFFF",
                  fontWeight: "bold"
                },
                zIndex: 90
              });
              
              newMarkers.push(marker);
            });
            
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
                  });
                  
                  boaEsperancaTollAdded = true;
                }
              }
              
              if (apiTollPoints && apiTollPoints.length > 0) {
                console.log(`Encontrados ${apiTollPoints.length} pedágios diretamente da API do Google Maps:`, apiTollPoints);
                
                // Usar EXCLUSIVAMENTE os pedágios encontrados pela API do Google Maps
                // Não misturar com outros dados exceto se adicionamos o de Boa Esperança
                pointsOfInterest = apiTollPoints;
                
                // Armazenar os pontos de pedágio para referência
                setApiTollPoints(apiTollPoints);
                
                // Log detalhado dos pedágios para debug
                apiTollPoints.forEach(toll => {
                  console.log(`Pedágio EXATO: ${toll.name}, posição: ${toll.lat},${toll.lng}`);
                });
                
                // Notificar o componente pai sobre os pedágios encontrados
                if (onRouteCalculated) {
                  onRouteCalculated({
                    ...result,
                    poisAlongRoute: apiTollPoints
                  });
                }
              } else {
                console.log("Nenhum pedágio encontrado na API do Google Maps para esta rota");
                
                // Se não temos pedágios mas a rota é para região nordeste de SP
                if (hasNortheasternCity) {
                  console.log("Adicionando pedágio de Boa Esperança do Sul como fallback");
                  
                  // Criar um array de pedágios com o de Boa Esperança
                  const fallbackTolls = [{
                    id: 99999,
                    name: "Pedágio Boa Esperança do Sul",
                    lat: "-21.9901",
                    lng: "-48.3923",
                    type: "toll",
                    cost: 1050,
                    roadName: "SP-255",
                    restrictions: null
                  }];
                  
                  // Atualizar os points of interest
                  pointsOfInterest = fallbackTolls;
                  
                  // Notificar o componente pai
                  if (onRouteCalculated) {
                    onRouteCalculated({
                      ...result,
                      poisAlongRoute: fallbackTolls
                    });
                  }
                }
              }
            } catch (error) {
              console.error("Erro ao extrair pedágios diretamente da API:", error);
            }
            
            // Agora mostrar todos os pontos de interesse, incluindo os extraídos da API
            if (pointsOfInterest && pointsOfInterest.length > 0) {
              console.log(`Adicionando ${pointsOfInterest.length} POIs ao mapa (incluindo pedágios da API)`);
              
              pointsOfInterest.forEach(poi => {
                try {
                  if (!poi.lat || !poi.lng) {
                    console.warn(`POI ${poi.name} possui coordenadas inválidas`);
                    return;
                  }
                  
                  const poiPosition = {
                    lat: parseFloat(poi.lat),
                    lng: parseFloat(poi.lng)
                  };
                  
                  // Não estender bounds com POIs para manter o zoom adequado na rota
                  
                  // Criar marcador com estilo apropriado para pedágios/balanças
                  const isFromAPI = apiTollPoints.some(t => t.id === poi.id);
                  const poiMarker = new google.maps.Marker({
                    position: poiPosition,
                    map,
                    title: poi.name,
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: poi.type === 'toll' ? (isFromAPI ? "#FF9800" : "#FFC107") : "#F44336", // Cores diferentes para pedágios da API vs. predefinidos
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: "#000000",
                      scale: isFromAPI ? 14 : 12 // Pedágios da API um pouco maiores
                    },
                    label: {
                      text: poi.type === 'toll' ? '$' : 'B', // Símbolo $ para pedágio, B para balança
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      fontSize: "11px"
                    },
                    zIndex: isFromAPI ? 120 : 110 // Prioridade maior para pedágios da API
                  });
                  
                  // Informações detalhadas ao clicar no POI
                  const infoContent = `
                    <div style="padding: 8px; max-width: 240px; font-family: Arial, sans-serif;">
                      <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${poi.name}</h3>
                      <p style="margin: 5px 0; font-size: 12px; color: #666;">
                        ${poi.type === 'toll' ? '🚧 Pedágio' : '⚖️ Balança de pesagem'}
                        ${isFromAPI ? ' <span style="color:#FF5722;font-weight:bold;">(API)</span>' : ''}
                      </p>
                      ${poi.roadName ? `<p style="margin: 5px 0; font-size: 12px;">🛣️ Rodovia: ${poi.roadName}</p>` : ''}
                      ${poi.cost ? `<p style="margin: 5px 0; font-size: 12px;">💰 Custo: <strong>R$ ${(poi.cost/100).toFixed(2)}</strong></p>` : ''}
                      ${poi.restrictions ? `<p style="margin: 5px 0; font-size: 12px;">⚠️ <strong>Restrições:</strong> ${poi.restrictions}</p>` : ''}
                    </div>
                  `;
                  
                  const infoWindow = new google.maps.InfoWindow({
                    content: infoContent
                  });
                  
                  poiMarker.addListener('click', () => {
                    infoWindow.open(map, poiMarker);
                  });
                  
                  newMarkers.push(poiMarker);
                  console.log(`POI adicionado ao mapa: ${poi.name} (${poi.type})${isFromAPI ? ' (da API)' : ''}`);
                } catch (error) {
                  console.error(`Erro ao adicionar POI ${poi.name}:`, error);
                }
              });
              
              console.log(`Total de ${pointsOfInterest.length} POIs adicionados ao mapa`);
            } else {
              console.log("Nenhum POI disponível para adicionar ao mapa");
            }
            
            // Ajustar o mapa para mostrar todos os pontos
            map.fitBounds(bounds);
            
            // Guardar os marcadores
            setMarkers(newMarkers);
          } else {
            console.error(`Erro no serviço de direções: ${status}`);
            setError(`Não foi possível calcular a rota. Erro: ${status}`);
            
            // Mostrar pelo menos os marcadores dos pontos
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
          
          const originMarker = new google.maps.Marker({
            position: originPoint,
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
              color: "#FFFFFF"
            }
          });
          
          // Adicionar info window para o ponto de origem
          const originInfoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2">
              <div class="font-bold">${origin.name}</div>
              <div class="text-xs text-gray-500">Origem</div>
              <div class="text-xs">${origin.address}</div>
            </div>`
          });
          
          originMarker.addListener("click", () => {
            // Fechar outras info windows abertas
            const currentInfoWindows = infoWindows || [];
            currentInfoWindows.forEach((iw: google.maps.InfoWindow) => iw.close());
            originInfoWindow.open(map, originMarker);
          });
          
          const newInfoWindows = [...(infoWindows || [])];
          newInfoWindows.push(originInfoWindow);
          setInfoWindows(newInfoWindows);
          
          bounds.extend(originPoint);
          newMarkers.push(originMarker);
        }
        
        // Marcadores para os waypoints
        waypoints.forEach((point, index) => {
          const position = {
            lat: parseFloat(point.lat),
            lng: parseFloat(point.lng)
          };
          
          bounds.extend(position);
          
          const marker = new google.maps.Marker({
            position,
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
              color: "#FFFFFF"
            }
          });
          
          // Adicionar info window para cada waypoint
          const waypointInfoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2">
              <div class="font-bold">${point.name}</div>
              <div class="text-xs text-gray-500">Destino ${index + 1}</div>
              <div class="text-xs">${point.address}</div>
            </div>`
          });
          
          marker.addListener("click", () => {
            // Fechar outras info windows abertas
            const currentInfoWindows = infoWindows || [];
            currentInfoWindows.forEach((iw: google.maps.InfoWindow) => iw.close());
            waypointInfoWindow.open(map, marker);
          });
          
          const newInfoWindows = [...(infoWindows || [])];
          newInfoWindows.push(waypointInfoWindow);
          setInfoWindows(newInfoWindows);
          
          newMarkers.push(marker);
        });
        
        // Adicionar POIs no fallback também
        if (pointsOfInterest && pointsOfInterest.length > 0) {
          pointsOfInterest.forEach(poi => {
            try {
              const position = {
                lat: parseFloat(poi.lat),
                lng: parseFloat(poi.lng)
              };
              
              // Criar marcador para o POI
              const poiMarker = new google.maps.Marker({
                position,
                map,
                title: poi.name,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: poi.type === 'toll' ? "#FFC107" : "#F44336",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#000000",
                  scale: 10
                },
                label: {
                  text: poi.type === 'toll' ? '$' : 'B',
                  color: "#FFFFFF"
                }
              });
              
              // Adicionar info window para o POI
              const poiContent = `<div class="p-2">
                <div class="font-bold">${poi.name}</div>
                <div class="text-xs text-gray-500">${poi.type === 'toll' ? 'Pedágio' : 'Balança de Pesagem'}</div>
                ${poi.roadName ? `<div class="text-xs">Rodovia: ${poi.roadName}</div>` : ''}
                ${poi.cost ? `<div class="text-xs">Custo: R$ ${(poi.cost/100).toFixed(2)}</div>` : ''}
              </div>`;
              
              const poiInfoWindow = new google.maps.InfoWindow({
                content: poiContent
              });
              
              poiMarker.addListener("click", () => {
                // Fechar outras info windows abertas
                const currentInfoWindows = infoWindows || [];
                currentInfoWindows.forEach((iw: google.maps.InfoWindow) => iw.close());
                poiInfoWindow.open(map, poiMarker);
              });
              
              const newInfoWindows = [...(infoWindows || [])];
              newInfoWindows.push(poiInfoWindow);
              setInfoWindows(newInfoWindows);
              
              newMarkers.push(poiMarker);
            } catch (error) {
              console.error(`Erro ao adicionar POI ${poi.name} no fallback:`, error);
            }
          });
        }
        
        // Ajustar o mapa para mostrar todos os pontos
        if (newMarkers.length > 0) {
          map.fitBounds(bounds);
        } else {
          map.setCenter({ lat: -22.36752, lng: -48.38016 });
          map.setZoom(10);
        }
        
        // Guardar os marcadores
        setMarkers(newMarkers);
      }
    } catch (e) {
      console.error("Erro ao renderizar rota:", e);
      setError("Ocorreu um erro ao mostrar a rota no mapa.");
    }
  }, [map, directionsRenderer, origin, calculatedRoute, pointsOfInterest]);

  return (
    <div className="flex-1 relative h-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-xl overflow-hidden shadow-xl border border-blue-100" 
        style={{ minHeight: '500px' }}
      >
        {/* Mostrar mensagem de erro se necessário */}
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