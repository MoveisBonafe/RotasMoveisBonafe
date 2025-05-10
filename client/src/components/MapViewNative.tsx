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

  // Renderizar os pontos de interesse (pedágios e balanças)
  const renderPointsOfInterest = (map: any, bounds: any) => {
    if (!pointsOfInterest || pointsOfInterest.length === 0) return [];
    
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
        let icon = {
          url: '',
          scaledSize: new google.maps.Size(30, 30)
        };
        
        if (poi.type === 'toll') {
          // Ícone para pedágio
          icon.url = "https://maps.google.com/mapfiles/ms/icons/dollar.png";
        } else if (poi.type === 'weighing_station') {
          // Ícone para balança
          icon.url = "https://maps.google.com/mapfiles/ms/icons/truck.png";
        }
        
        const poiMarker = new google.maps.Marker({
          position: poiPosition,
          map,
          title: poi.name,
          icon: icon
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
              // Mostrar a rota
              renderer.setDirections(result);
              
              // Criar bounds para ajustar o zoom
              const bounds = new google.maps.LatLngBounds();
              
              // Adicionar marcadores para cada ponto
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
                  text: "0",
                  color: "#FFFFFF",
                  fontWeight: "bold"
                }
              });
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
              
              // Adicionar os pontos de interesse ao mapa
              const poiMarkers = renderPointsOfInterest(map, bounds);
              newMarkers.push(...poiMarkers);
              
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
        
        // Adicionar marcador para origem
        const originPoint = {
          lat: parseFloat(origin.lat),
          lng: parseFloat(origin.lng)
        };
        
        bounds.extend(originPoint);
        
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
            color: "#FFFFFF",
            fontWeight: "bold"
          }
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
        
        // Adicionar os pontos de interesse ao mapa
        const poiMarkers = renderPointsOfInterest(map, bounds);
        newMarkers.push(...poiMarkers);
        
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