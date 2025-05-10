import { useCallback, useEffect, useRef, useState } from "react";
import { Location, PointOfInterest } from "@/lib/types";

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
    google: any;
    initMap: () => void;
  }
}

// Recuperar a API key do ambiente
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

export default function MapViewSimple({ 
  origin, 
  waypoints,
  calculatedRoute,
  pointsOfInterest = []
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
        
        // Criar serviço de direções
        const directionsService = new google.maps.DirectionsService();
        
        // Configurar requisição
        const request = {
          origin: originPoint,
          destination: destinationPoint,
          waypoints: waypoints,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING
        };
        
        // Obter direções
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            
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
            
            // Verificar se temos POIs para mostrar
            if (pointsOfInterest && pointsOfInterest.length > 0) {
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
                  const poiMarker = new google.maps.Marker({
                    position: poiPosition,
                    map,
                    title: poi.name,
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: poi.type === 'toll' ? "#FFC107" : "#F44336", // Amarelo para pedágio, vermelho para balança
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: "#000000",
                      scale: 12
                    },
                    label: {
                      text: poi.type === 'toll' ? '$' : 'B', // Símbolo $ para pedágio, B para balança
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      fontSize: "11px"
                    },
                    zIndex: 110 // Prioridade maior que os outros marcadores
                  });
                  
                  // Informações detalhadas ao clicar no POI
                  const infoContent = `
                    <div style="padding: 8px; max-width: 240px; font-family: Arial, sans-serif;">
                      <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${poi.name}</h3>
                      <p style="margin: 5px 0; font-size: 12px; color: #666;">
                        ${poi.type === 'toll' ? '🚧 Pedágio' : '⚖️ Balança de pesagem'}
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
                  console.log(`POI adicionado ao mapa: ${poi.name} (${poi.type})`);
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
            infoWindows.forEach(iw => iw.close());
            originInfoWindow.open(map, originMarker);
          });
          
          infoWindows.push(originInfoWindow);
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