import { useEffect, useRef, useState } from "react";
import { Location } from "@/lib/types";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
  pointsOfInterest?: any[]; // Adicionar pontos de interesse (pedágios, balanças)
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
  calculatedRoute,
  pointsOfInterest = []
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
      // MUITO IMPORTANTE: suppressMarkers deve ser TRUE para usar nossos próprios marcadores
      const newDirectionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Não mostrar marcadores padrão do Google, vamos adicionar os nossos próprios
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
    // Se não temos o mapa inicializado ou origem, não há nada para fazer
    if (!map || !origin) return;

    console.log("Atualizando marcadores no mapa (useEffect para origin/waypoints)");

    // Limpar marcadores antigos
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    // Posição da origem
    const originPosition = {
      lat: parseFloat(origin.lat),
      lng: parseFloat(origin.lng)
    };

    // IMPORTANTE: Criar marcador para origem com estilo destacado
    const originMarker = new google.maps.Marker({
      position: originPosition,
      map,
      title: origin.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#DB4437", // Vermelho para destacar a origem
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF",
        scale: 12 // Tamanho maior para ser bem visível
      },
      label: {
        text: "0", // SEMPRE usar "0" para a origem (não "A")
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: "14px" // Fonte maior
      },
      zIndex: 1000 // Garantir que fique em cima de outros marcadores
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

  // Renderizar os pontos de interesse (pedágios e balanças)
  const renderPointsOfInterest = (map: any, bounds: any) => {
    // Log detalhado dos pontos de interesse
    console.log("Renderizando pontos de interesse:", pointsOfInterest);
    
    // Verificação explícita para garantir que temos dados
    if (!pointsOfInterest) {
      console.error("Array de POIs é undefined");
      return [];
    }
    
    if (pointsOfInterest.length === 0) {
      console.log("Array de POIs está vazio (length=0)");
      return [];
    }
    
    console.log(`Processando ${pointsOfInterest.length} pontos de interesse para o mapa`);
    
    const google = window.google;
    const poiMarkers: any[] = [];
    
    pointsOfInterest.forEach(poi => {
      try {
        const poiPosition = {
          lat: parseFloat(poi.lat),
          lng: parseFloat(poi.lng)
        };
        
        bounds.extend(poiPosition);
        
        // Determinar o ícone com base no tipo de POI
        let icon;
        
        if (poi.type === 'toll') {
          // Ícone personalizado para pedágio (círculo amarelo com símbolo $)
          icon = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#FFC107", // Amarelo
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#000000",
            scale: 10,
            labelOrigin: new google.maps.Point(0, 0)
          };
        } else if (poi.type === 'weighing_station') {
          // Ícone personalizado para balança (círculo vermelho com símbolo da balança)
          icon = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#F44336", // Vermelho
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#000000",
            scale: 10,
            labelOrigin: new google.maps.Point(0, 0)
          };
        }
        
        // Adicionar rótulo específico para o tipo de POI
        const poiMarker = new google.maps.Marker({
          position: poiPosition,
          map,
          title: poi.name,
          icon: icon,
          label: {
            text: poi.type === 'toll' ? '$' : 'B', // $ para pedágio, B para balança
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '11px'
          }
        });
        
        // Adicionar popup de informação ao clicar no marcador
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px">
              <h3 style="margin: 0 0 5px 0">${poi.name}</h3>
              <p style="margin: 0">${poi.type === 'toll' ? 'Pedágio' : 'Balança'}</p>
              ${poi.type === 'toll' && poi.cost ? `<p style="margin: 5px 0 0 0">Custo: R$ ${poi.cost.toFixed(2)}</p>` : ''}
              ${poi.roadName ? `<p style="margin: 5px 0 0 0">Rodovia: ${poi.roadName}</p>` : ''}
            </div>
          `
        });
        
        poiMarker.addListener('click', () => {
          infoWindow.open(map, poiMarker);
        });
        
        poiMarkers.push(poiMarker);
      } catch (error) {
        console.error('Erro ao renderizar ponto de interesse:', error);
      }
    });
    
    return poiMarkers;
  };

  // Quando uma rota for calculada, usar DirectionsService para calcular rota real nas estradas
  useEffect(() => {
    if (!map || !origin || !calculatedRoute || calculatedRoute.length === 0) return;

    try {
      // Limpar marcadores anteriores
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      
      const google = window.google;
      const newMarkers: any[] = [];
      
      if (calculatedRoute.length >= 2) {
        // Usar DirectionsService para calcular a rota real nas estradas
        // Se tivermos apenas origem e um destino, podemos usar o DirectionsService
        // diretamente sem ter que quebrar em várias chamadas
        
        // Configurar ou criar um novo renderer
        let renderer = directionsRenderer;
        if (!renderer) {
          renderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true, // Vamos adicionar nossos próprios marcadores
            polylineOptions: {
              strokeColor: "#4285F4", 
              strokeWeight: 5,
              strokeOpacity: 0.8
            }
          });
          
          renderer.setMap(map);
          setDirectionsRenderer(renderer);
        } else {
          renderer.setMap(map);
        }
        
        // Limpar direções anteriores
        renderer.setDirections({ routes: [] });
        
        // Criar o serviço de direções
        const directionsService = new google.maps.DirectionsService();
        
        try {
          // Origem e destino
          const originPoint = {
            lat: parseFloat(origin.lat),
            lng: parseFloat(origin.lng)
          };
          
          const destinationPoint = {
            lat: parseFloat(calculatedRoute[calculatedRoute.length - 1].lat),
            lng: parseFloat(calculatedRoute[calculatedRoute.length - 1].lng)
          };
          
          // Waypoints (pontos intermediários)
          const waypoints = calculatedRoute.slice(1, -1).map(point => ({
            location: new google.maps.LatLng(
              parseFloat(point.lat),
              parseFloat(point.lng)
            ),
            stopover: true
          }));
          
          // Criar a request para o serviço de direções
          const request = {
            origin: originPoint,
            destination: destinationPoint,
            waypoints: waypoints,
            optimizeWaypoints: false, // Não otimizar, pois já fizemos isso
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: false,
            avoidTolls: false
          };
          
          // Fazer a requisição para o DirectionsService
          directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              // IMPORTANTE: Configurar o renderer para suprimir os marcadores padrão
              // para podermos usar nossos próprios marcadores personalizados
              renderer.setOptions({
                suppressMarkers: true,
                preserveViewport: false
              });
              
              // Mostrar a rota
              renderer.setDirections(result);
              
              // Criar bounds para ajustar o zoom
              const bounds = new google.maps.LatLngBounds();
              
              // IMPORTANTE: Sempre adicionar marcador da origem com número 0
              const originMarker = new google.maps.Marker({
                position: originPoint,
                map,
                title: origin.name,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: "#4285F4", // Azul Google
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#FFFFFF",
                  scale: 12
                },
                label: {
                  text: "0", // Origem é o ponto 0
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "12px"
                },
                zIndex: 1000 // Maior zIndex para ficar em cima de outros marcadores
              });
              bounds.extend(originPoint);
              newMarkers.push(originMarker);
              bounds.extend(originPoint);
              
              // Adicionar marcadores para cada ponto intermediário e destino
              calculatedRoute.slice(1).forEach((point, index) => {
                const pointPos = {
                  lat: parseFloat(point.lat),
                  lng: parseFloat(point.lng)
                };
                
                bounds.extend(pointPos);
                
                const marker = new google.maps.Marker({
                  position: pointPos,
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
              
              // SUPER IMPORTANTE: Adicionar manualmente os POIs como marcadores separados
              console.log("Adicionando POIs diretamente como marcadores:", pointsOfInterest);
              
              if (pointsOfInterest && pointsOfInterest.length > 0) {
                pointsOfInterest.forEach(poi => {
                  try {
                    const poiPosition = {
                      lat: parseFloat(poi.lat),
                      lng: parseFloat(poi.lng)
                    };
                    
                    bounds.extend(poiPosition);
                    
                    // Criar um marcador para cada POI com ícone e cor específicos
                    const poiMarker = new google.maps.Marker({
                      position: poiPosition,
                      map,
                      title: poi.name,
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: poi.type === 'toll' ? "#FFC107" : "#F44336", // Amarelo ou vermelho
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: "#000000",
                        scale: 10
                      },
                      label: {
                        text: poi.type === 'toll' ? '$' : 'B', // Símbolo $ para pedágio, B para balança
                        color: "#FFFFFF",
                        fontWeight: "bold"
                      },
                      zIndex: 1000 // Prioridade alta para exibição
                    });
                    
                    // Criar info window ao clicar no marcador
                    const infoContent = `
                      <div style="padding: 10px; max-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">${poi.name}</h4>
                        <p style="margin: 0; font-size: 12px;">
                          ${poi.type === 'toll' ? 'Pedágio' : 'Balança de pesagem'}
                        </p>
                        ${poi.roadName ? `<p style="margin: 4px 0 0; font-size: 12px;">Rodovia: ${poi.roadName}</p>` : ''}
                        ${poi.cost ? `<p style="margin: 4px 0 0; font-size: 12px;"><strong>Custo:</strong> R$ ${(poi.cost/100).toFixed(2)}</p>` : ''}
                        ${poi.restrictions ? `<p style="margin: 4px 0 0; font-size: 12px;"><strong>Restrições:</strong> ${poi.restrictions}</p>` : ''}
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
                    console.error("Erro ao adicionar POI ao mapa:", error);
                  }
                });
                
                console.log(`Total de ${pointsOfInterest.length} POIs adicionados ao mapa`);
              } else {
                console.log("Nenhum POI disponível para adicionar ao mapa");
              }
              
              // Ajustar o mapa para mostrar todos os pontos
              map.fitBounds(bounds);
              
              // Salvar marcadores
              setMarkers(newMarkers);
            } else {
              console.error('Erro no DirectionsService:', status);
              // Fallback: mostrar marcadores e linha reta se falhar
              showFallbackRoute();
            }
          });
        } catch (error) {
          console.error('Erro ao configurar DirectionsService:', error);
          // Fallback: mostrar marcadores e linha reta
          showFallbackRoute();
        }
      } else {
        // Se só temos um ponto (origem), mostrar apenas o marcador
        showFallbackRoute();
      }
      
      // Função de fallback para mostrar pontos com linha reta
      function showFallbackRoute() {
        // Criar bounds para ajustar o zoom
        const bounds = new google.maps.LatLngBounds();
        
        // Adicionar marcador para origem - MARCADOR DE FALLBACK 
        const originPoint = {
          lat: parseFloat(origin.lat),
          lng: parseFloat(origin.lng)
        };
        
        bounds.extend(originPoint);
        
        // IMPORTANTE: Marcador para origem no modo de FALLBACK
        const originMarker = new google.maps.Marker({
          position: originPoint,
          map,
          title: origin.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#DB4437", // Vermelho para destacar a origem
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
            scale: 12 // Tamanho maior
          },
          label: {
            text: "0", // Sempre usar 0 para a origem
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: "14px" // Fonte maior
          },
          zIndex: 1000 // Garantir que fique em cima de outros marcadores
        });
        newMarkers.push(originMarker);
        
        // Adicionar marcadores para destinos
        calculatedRoute.slice(1).forEach((point, index) => {
          const pointPos = {
            lat: parseFloat(point.lat),
            lng: parseFloat(point.lng)
          };
          
          bounds.extend(pointPos);
          
          const marker = new google.maps.Marker({
            position: pointPos,
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
        
        // Desenhar linha reta entre os pontos
        const routeCoordinates = [originPoint, ...calculatedRoute.slice(1).map(point => ({
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lng)
        }))];
        
        const routePath = new google.maps.Polyline({
          path: routeCoordinates,
          geodesic: true,
          strokeColor: "#4285F4",
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map
        });
        
        // IMPORTANTE: Adicionar TODOS os pontos de interesse ao mapa no fallback
        console.log("Fallback: Tentando adicionar POIs DIRETAMENTE:", pointsOfInterest);
        
        // Vamos ignorar o renderPointsOfInterest e adicionar diretamente
        if (pointsOfInterest && pointsOfInterest.length > 0) {
          pointsOfInterest.forEach(poi => {
            try {
              const poiPosition = {
                lat: parseFloat(poi.lat),
                lng: parseFloat(poi.lng)
              };
              
              bounds.extend(poiPosition);
              
              // Criar um marcador para cada POI
              const poiMarker = new google.maps.Marker({
                position: poiPosition,
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
                  color: "#FFFFFF",
                  fontWeight: "bold"
                }
              });
              
              newMarkers.push(poiMarker);
              console.log(`POI adicionado diretamente: ${poi.name}`);
            } catch (error) {
              console.error('Erro ao adicionar POI diretamente:', error);
            }
          });
          
          console.log(`Adicionados ${pointsOfInterest.length} POIs diretos no fallback`);
        } else {
          console.log("Fallback: Nenhum POI disponível para adicionar");
        }
        
        // Ajustar o mapa para mostrar todos os pontos
        map.fitBounds(bounds);
        
        // Guardar os marcadores
        setMarkers(newMarkers);
      }
    } catch (e) {
      console.error('Erro ao mostrar rota calculada:', e);
      setError("Não foi possível renderizar o mapa com a rota calculada. Tente novamente.");
    }
  }, [map, origin, calculatedRoute, directionsRenderer]);

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