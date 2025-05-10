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
  
  // Usar o hook para trabalhar com a API Routes Preferred
  const { calculateRouteSegments } = useRoutesPreferred();

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
          }
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
      directionsService.route(request, function(result: any, status: any) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Exibir a rota no mapa
          directionsRenderer.setDirections(result);
          
          console.log("Rota calculada! Adicionando marcadores...");
          
          // Processo assíncrono para adicionar marcadores e detectar pedágios
          (async () => {
            try {
              console.log('Detectando pedágios na rota via Google Maps API...');
              
              // Limpar marcadores existentes
              const newMarkers: any[] = [];
              const newInfoWindows: any[] = [];
              
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
              
              // 3. Detectar pedágios usando a API do Google Maps
              try {
                // Obter dados da rota
                const route = result.routes[0];
                const bounds = new window.google.maps.LatLngBounds();
                const tollPoints: any[] = [];
                
                // Criar uma lista de todos os pontos da rota
                const routePoints: any[] = [];
                route.legs.forEach((leg: any) => {
                  leg.steps.forEach((step: any) => {
                    if (step.path) {
                      step.path.forEach((point: any) => {
                        routePoints.push(point);
                        bounds.extend(point);
                      });
                    }
                  });
                });
                
                // Identificar rodovias na rota atual
                const highways = new Set<string>();
                route.legs.forEach((leg: any) => {
                  leg.steps.forEach((step: any) => {
                    const instructions = step.instructions?.toLowerCase() || '';
                    // Regex para identificar rodovias brasileiras (SP-XXX, BR-XXX, etc)
                    const highwayMatch = instructions.match(/\b([a-z]{2}-\d{3})\b/g);
                    if (highwayMatch) {
                      highwayMatch.forEach((hw: string) => highways.add(hw.toUpperCase()));
                    }
                  });
                });
                
                console.log("Rodovias identificadas na rota:", Array.from(highways).join(', '));
                
                // Identificar cidades na rota
                const citiesInRoute = new Set<string>();
                if (origin && origin.address) {
                  const cityMatch = origin.address.match(/([A-Za-zÀ-ú\s]+)(?:\s*-\s*[A-Z]{2})/);
                  if (cityMatch && cityMatch[1]) {
                    citiesInRoute.add(cityMatch[1].trim().toLowerCase());
                  }
                }
                
                waypoints.forEach(point => {
                  if (point.address) {
                    const cityMatch = point.address.match(/([A-Za-zÀ-ú\s]+)(?:\s*-\s*[A-Z]{2})/);
                    if (cityMatch && cityMatch[1]) {
                      citiesInRoute.add(cityMatch[1].trim().toLowerCase());
                    }
                  }
                });
                
                console.log("Cidades na rota:", Array.from(citiesInRoute).join(', '));
                
                // Usar o Places Service para encontrar pedágios próximos à rota
                const placesService = new window.google.maps.places.PlacesService(map);
                
                // Calcular o centro e o raio da rota
                const center = bounds.getCenter();
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                const radiusInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
                  center, 
                  new window.google.maps.LatLng(ne.lat(), center.lng())
                );
                
                // Buscar pedágios próximos
                placesService.nearbySearch({
                  location: center,
                  radius: radiusInMeters,
                  type: 'point_of_interest',
                  keyword: 'pedágio toll'
                }, (places: any, status: any) => {
                  if (status === window.google.maps.places.PlacesServiceStatus.OK && places) {
                    console.log(`Encontrados ${places.length} potenciais pedágios`);
                    
                    // Filtrar pedágios que estão realmente na rota
                    const tollsOnRoute = places.filter((place: any) => {
                      if (!place.geometry || !place.geometry.location) return false;
                      
                      // Verificar proximidade com algum ponto da rota
                      for (const routePoint of routePoints) {
                        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                          place.geometry.location,
                          routePoint
                        );
                        
                        // Considerar pedágios até 300 metros da rota
                        if (distance < 300) {
                          return true;
                        }
                      }
                      return false;
                    });
                    
                    console.log(`${tollsOnRoute.length} pedágios estão realmente na rota`);
                    
                    // Obter tipo de veículo para calcular custo
                    const vehicleType = localStorage.getItem('selectedVehicleType') || 'car';
                    
                    // Adicionar marcadores para os pedágios
                    tollsOnRoute.forEach((toll: any, index: number) => {
                      if (!toll.geometry || !toll.geometry.location) return;
                      
                      // Obter posição do pedágio
                      const position = {
                        lat: toll.geometry.location.lat(),
                        lng: toll.geometry.location.lng()
                      };
                      
                      // Estimar informações do pedágio
                      const roadName = Array.from(highways).length > 0 
                        ? Array.from(highways)[0] 
                        : 'Rodovia';
                      
                      const tollCost = estimateTollCost(vehicleType);
                      
                      // Criar objeto com dados do pedágio
                      const tollInfo = {
                        id: 1000 + index,
                        name: toll.name || `Pedágio ${index + 1}`,
                        type: 'toll',
                        lat: position.lat.toString(),
                        lng: position.lng.toString(),
                        roadName: roadName,
                        cost: tollCost
                      };
                      
                      // Adicionar ao array de pedágios
                      tollPoints.push(tollInfo);
                      
                      // Criar marcador para o pedágio
                      const tollMarker = new window.google.maps.Marker({
                        position,
                        map,
                        title: toll.name || `Pedágio ${index + 1}`,
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
                        <div style="min-width: 220px; padding: 10px;">
                          <h3 style="margin: 0; font-size: 16px; color: #d32f2f;">${toll.name || `Pedágio ${index + 1}`}</h3>
                          <p style="margin: 5px 0;"><strong>Tipo:</strong> Pedágio</p>
                          <p style="margin: 5px 0;"><strong>Custo estimado:</strong> R$ ${(tollCost / 100).toFixed(2)}</p>
                          <p style="margin: 5px 0;"><strong>Rodovia:</strong> ${roadName}</p>
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
                      tollMarker.set('poiInfo', tollInfo);
                      tollMarker.set('googleSource', true);
                      
                      // Adicionar às listas
                      newMarkers.push(tollMarker);
                      newInfoWindows.push(infoWindow);
                      
                      console.log(`Pedágio adicionado: ${toll.name || `Pedágio ${index + 1}`}`);
                    });
                    
                    // Adicionar também outros pontos de interesse (por exemplo, balanças)
                    if (pointsOfInterest && pointsOfInterest.length > 0) {
                      const nonTollPOIs = pointsOfInterest.filter(poi => poi.type !== 'toll');
                      
                      nonTollPOIs.forEach(poi => {
                        // Verificar se o POI está relacionado a alguma cidade na rota
                        let isRelevant = false;
                        if (poi.city) {
                          const poiCity = poi.city.toLowerCase();
                          isRelevant = Array.from(citiesInRoute).some(city => 
                            poiCity.includes(city) || city.includes(poiCity)
                          );
                        }
                        
                        if (isRelevant) {
                          const position = {
                            lat: parseFloat(poi.lat),
                            lng: parseFloat(poi.lng)
                          };
                          
                          // Ícone dependendo do tipo
                          let fillColor = '#FF9800'; // Padrão: laranja
                          if (poi.type === 'weighing_station') {
                            fillColor = '#FF9800'; // Laranja para balanças
                          } else if (poi.type === 'rest_area') {
                            fillColor = '#4CAF50'; // Verde para áreas de descanso
                          }
                          
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
                          
                          // Janela de informação
                          let infoContent = `
                            <div style="min-width: 200px; padding: 10px;">
                              <h3 style="margin: 0; font-size: 16px;">${poi.name}</h3>
                          `;
                          
                          if (poi.type === 'weighing_station') {
                            infoContent += `<p style="margin: 5px 0;"><strong>Tipo:</strong> Balança</p>`;
                            if (poi.roadName) infoContent += `<p style="margin: 5px 0;"><strong>Rodovia:</strong> ${poi.roadName}</p>`;
                            if (poi.city) infoContent += `<p style="margin: 5px 0;"><strong>Cidade:</strong> ${poi.city}</p>`;
                            if (poi.restrictions) infoContent += `<p style="margin: 5px 0;"><strong>Restrições:</strong> ${poi.restrictions}</p>`;
                          }
                          
                          infoContent += `</div>`;
                          
                          const infoWindow = new window.google.maps.InfoWindow({
                            content: infoContent
                          });
                          
                          poiMarker.addListener('click', () => {
                            newInfoWindows.forEach(iw => iw.close());
                            infoWindow.open(map, poiMarker);
                          });
                          
                          poiMarker.set('isPOI', true);
                          poiMarker.set('poiInfo', poi);
                          
                          newMarkers.push(poiMarker);
                          newInfoWindows.push(infoWindow);
                          
                          console.log(`POI adicionado: ${poi.name} (${poi.type})`);
                        }
                      });
                    }
                    
                    // Atualizar o estado com os novos marcadores
                    setMarkers(prevMarkers => {
                      prevMarkers.forEach(marker => marker.setMap(null));
                      return newMarkers;
                    });
                    
                    setInfoWindows(prevInfoWindows => {
                      prevInfoWindows.forEach(iw => iw.close());
                      return newInfoWindows;
                    });
                    
                    // Ajustar o mapa para mostrar todos os pontos
                    map.fitBounds(bounds);
                    const listener = window.google.maps.event.addListener(map, "idle", () => {
                      if (map.getZoom() > 15) map.setZoom(15);
                      window.google.maps.event.removeListener(listener);
                    });
                    
                    // Passar os pedágios para o callback
                    if (onRouteCalculated) {
                      const resultWithTolls = {
                        ...result,
                        tollPoints,
                        googleSource: true
                      };
                      onRouteCalculated(resultWithTolls);
                    }
                  } else {
                    console.log("Nenhum pedágio encontrado ou erro:", status);
                    
                    // Em caso de falha, retornar resultado sem pedágios
                    if (onRouteCalculated) {
                      onRouteCalculated({
                        ...result,
                        tollPoints: []
                      });
                    }
                  }
                });
              } catch (error) {
                console.error("Erro ao processar pedágios:", error);
                
                // Em caso de erro, retornar resultado sem pedágios
                if (onRouteCalculated) {
                  onRouteCalculated({
                    ...result,
                    tollPoints: []
                  });
                }
              }
              
            } catch (error) {
              console.error("Erro ao adicionar pontos:", error);
            } finally {
              // Permitir novos cálculos
              isProcessingRoute.current = false;
            }
          })();
          
        } else {
          console.error("Erro ao calcular rota:", status);
          showFallbackRoute();
          isProcessingRoute.current = false;
        }
      });
      
      // Função de fallback para quando a API falha
      function showFallbackRoute() {
        setError("Não foi possível calcular a rota. Usando mapa simplificado.");
        console.log("Usando visualização de fallback (linha reta)");
        
        // Limpar marcadores existentes
        markers.forEach(marker => marker.setMap(null));
        
        // Criar marcadores para origem e destinos em linha reta
        const newMarkers: any[] = [];
        const allPoints = [origin, ...waypoints];
        
        // Criar um limite para ajustar o mapa
        const bounds = new window.google.maps.LatLngBounds();
        
        // Adicionar marcadores para cada ponto
        allPoints.forEach((point, index) => {
          if (!point) return;
          
          const position = {
            lat: parseFloat(point.lat),
            lng: parseFloat(point.lng)
          };
          
          // Estender os limites
          bounds.extend(position);
          
          // Criar marcador
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: point.name || (index === 0 ? "Origem" : `Destino ${index}`),
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: index === 0 ? "#4CAF50" : "#2196F3",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#FFFFFF",
              scale: 12
            },
            label: {
              text: index === 0 ? "O" : index.toString(),
              color: "#FFFFFF",
              fontWeight: "bold"
            }
          });
          
          newMarkers.push(marker);
        });
        
        // Criar linhas retas entre os pontos
        for (let i = 0; i < allPoints.length - 1; i++) {
          if (!allPoints[i] || !allPoints[i+1]) continue;
          
          const start = {
            lat: parseFloat(allPoints[i].lat),
            lng: parseFloat(allPoints[i].lng)
          };
          
          const end = {
            lat: parseFloat(allPoints[i+1].lat),
            lng: parseFloat(allPoints[i+1].lng)
          };
          
          // Desenhar uma linha reta
          const line = new window.google.maps.Polyline({
            path: [start, end],
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map
          });
        }
        
        // Ajustar o mapa para mostrar todos os pontos
        map.fitBounds(bounds);
        
        // Atualizar os marcadores
        setMarkers(newMarkers);
      }
    }
  }, [map, directionsRenderer, origin, waypoints, markers, infoWindows, calculatedRoute, onRouteCalculated, pointsOfInterest]);

  // Função utilitária para estimar custo de pedágio
  function estimateTollCost(vehicleType: string): number {
    // Valores em centavos
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