import { useEffect, useRef, useState } from "react";
import { Location, PointOfInterest } from "@/lib/types";
import { useRoutesPreferred } from "@/hooks/useRoutesPreferred";
import { fetchTollsFromAilog } from "@/lib/ailogApi";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
  pointsOfInterest?: PointOfInterest[]; // Pontos de interesse como balanças
}

// Precisamos extender a interface Window para incluir o objeto google
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export default function MapViewSimple({ 
  origin, 
  waypoints, 
  calculatedRoute,
  onRouteCalculated,
  pointsOfInterest = []
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);
  const routesPreferred = useRoutesPreferred();
  
  // Inicializar o mapa
  useEffect(() => {
    // Verificar se o elemento do mapa e a API do Google Maps estão disponíveis
    if (!mapRef.current || !window.google) return;
    
    console.log("Inicializando mapa simplificado...");
    
    // Criar o mapa centrado na origem
    const initialMap = new window.google.maps.Map(mapRef.current, {
      center: origin ? 
        { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) } : 
        { lat: -22.3673, lng: -48.3823 }, // Dois Córregos - SP como padrão
      zoom: 8,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      fullscreenControl: false,
      mapTypeControl: true,
      streetViewControl: true,
      zoomControl: true
    });
    
    // Inicializar serviços de direções
    const dirService = new window.google.maps.DirectionsService();
    const dirRenderer = new window.google.maps.DirectionsRenderer({
      map: initialMap,
      suppressMarkers: true, // Não mostrar marcadores padrão
      polylineOptions: {
        strokeColor: '#3B82F6', // Azul para a rota
        strokeOpacity: 0.8,
        strokeWeight: 6
      }
    });
    
    setMap(initialMap);
    setDirectionsService(dirService);
    setDirectionsRenderer(dirRenderer);
    
    // Adicionar marcador de origem se existir
    if (origin) {
      console.log("ADICIONANDO MARCADOR DE ORIGEM NA INICIALIZAÇÃO:", origin);
      
      const position = {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng)
      };
      
      const originMarker = new window.google.maps.Marker({
        position,
        map: initialMap,
        title: origin.name,
        label: {
          text: "O",
          color: "#FFFFFF"
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 10
        },
        zIndex: 10
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="min-width: 200px;">
            <h3 style="margin: 0; font-size: 16px;">${origin.name}</h3>
            <p style="margin: 5px 0;">Origem</p>
            <p style="margin: 5px 0;">${origin.address || ''}</p>
          </div>
        `
      });
      
      originMarker.addListener('click', () => {
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(initialMap, originMarker);
      });
      
      setMarkers(prev => [...prev, originMarker]);
      setInfoWindows(prev => [...prev, infoWindow]);
      
      console.log("✅ Marcador de origem com pino vermelho adicionado na inicialização do mapa");
    }
    
    console.log("Mapa inicializado com sucesso");
    
    return () => {
      // Limpar marcadores e infowindows ao desmontar
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
    };
  }, []);
  
  // Renderizar a rota quando os waypoints mudarem
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderer || !origin) {
      console.log("Dados insuficientes para renderizar rota ou mapa não inicializado ainda");
      return;
    }
    
    if (waypoints.length === 0 && !calculatedRoute) {
      // Sem destinos, limpar rota
      directionsRenderer.setDirections({ routes: [] });
      return;
    }
    
    console.log("Renderizando rota calculada no mapa");
    
    // Definir origem e destinos
    const request: google.maps.DirectionsRequest = {
      origin: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
      destination: calculatedRoute && calculatedRoute.length > 0 
        ? { lat: parseFloat(calculatedRoute[calculatedRoute.length - 1].lat), lng: parseFloat(calculatedRoute[calculatedRoute.length - 1].lng) }
        : { lat: parseFloat(waypoints[waypoints.length - 1].lat), lng: parseFloat(waypoints[waypoints.length - 1].lng) },
      waypoints: [],
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
      drivingOptions: {
        departureTime: new Date()
      }
    };
    
    // Adicionar waypoints intermediários se houver rota calculada
    if (calculatedRoute && calculatedRoute.length > 2) { // Se a rota tem mais de 2 pontos (origem e destino)
      // Adicionar todos os pontos intermediários como waypoints no formato do Google
      request.waypoints = calculatedRoute.slice(1, -1).map(point => ({
        location: { lat: parseFloat(point.lat), lng: parseFloat(point.lng) },
        stopover: true
      }));
    } else if (waypoints.length > 1) {
      // Se não temos rota calculada, usar os waypoints brutos
      request.waypoints = waypoints.slice(0, -1).map(point => ({
        location: { lat: parseFloat(point.lat), lng: parseFloat(point.lng) },
        stopover: true
      }));
    }
    
    // Calcular a rota
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        console.log("Rota calculada! Adicionando marcadores...");
        
        // Limpar marcadores antigos
        markers.forEach(marker => {
          // Manter apenas o marcador de origem
          if (marker.getTitle() !== origin.name) {
            marker.setMap(null);
          }
        });
        
        // Fechar InfoWindows abertas
        infoWindows.forEach(infoWindow => infoWindow.close());
        
        // Limpar arrays
        const newMarkers = markers.filter(marker => marker.getTitle() === origin.name);
        const newInfoWindows = infoWindows.filter((_, i) => markers[i].getTitle() === origin.name);
        
        // Definir a rota no mapa
        directionsRenderer.setDirections(result);
        
        // 1. Marcador de origem já foi adicionado
        const originMarker = newMarkers[0];
        const originInfoWindow = newInfoWindows[0];
        
        // 2. Adicionar marcadores para os destinos/pontos intermediários
        if (calculatedRoute && calculatedRoute.length > 1) {
          calculatedRoute.slice(1).forEach((point, index) => {
            const position = {
              lat: parseFloat(point.lat),
              lng: parseFloat(point.lng)
            };
            
            // Criar um marcador com número de sequência
            const waypointMarker = new window.google.maps.Marker({
              position,
              map,
              title: point.name,
              label: {
                text: (index + 1).toString(),
                color: "#FFFFFF"
              },
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#3B82F6', // Azul para destinos
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                scale: 10
              },
              zIndex: 5
            });
            
            // Criar uma janela de informações
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="min-width: 200px;">
                  <h3 style="margin: 0; font-size: 16px;">${point.name}</h3>
                  <p style="margin: 5px 0;">Parada ${index + 1}</p>
                  <p style="margin: 5px 0;">${point.address || ''}</p>
                </div>
              `
            });
            
            // Adicionar evento de clique
            waypointMarker.addListener('click', () => {
              infoWindows.forEach(iw => iw.close());
              infoWindow.open(map, waypointMarker);
            });
            
            newMarkers.push(waypointMarker);
            newInfoWindows.push(infoWindow);
          });
        }
        
        // 3. Processar EXCLUSIVAMENTE pedágios da API AILOG
        try {
          // Obter pedágios precisos da rota utilizando API especializada
          const selectedVehicleType = localStorage.getItem('selectedVehicleType') || 'car';
          
          // Limpar todos os pedágios existentes do mapa
          markers.forEach(marker => {
            if (marker.get('isPOI') && marker.get('poiInfo')?.type === 'toll') {
              marker.setMap(null);
            }
          });
          
          // Chamar a API AILOG (única fonte de pedágios)
          fetchTollsFromAilog(origin, waypoints, selectedVehicleType)
            .then(ailogTolls => {
              console.log("API AILOG retornou", ailogTolls.length, "pedágios precisos para esta rota");
              
              // Adicionar os pedágios precisos da AILOG ao mapa
              ailogTolls.forEach(toll => {
                const position = {
                  lat: parseFloat(toll.lat),
                  lng: parseFloat(toll.lng)
                };
                
                // Criar marcador com visual mais preciso
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
                  zIndex: 2
                });
                
                // Criar janela de informações detalhada
                const infoContent = `
                  <div style="min-width: 200px;">
                    <h3 style="margin: 0; font-size: 16px;">${toll.name}</h3>
                    <p style="margin: 5px 0;">Tipo: Pedágio (AILOG)</p>
                    ${toll.cost ? `<p style="margin: 5px 0;">Custo: R$ ${(toll.cost / 100).toFixed(2)}</p>` : ''}
                    ${toll.roadName ? `<p style="margin: 5px 0;">Rodovia: ${toll.roadName}</p>` : ''}
                    ${toll.city ? `<p style="margin: 5px 0;">Cidade: ${toll.city}</p>` : ''}
                    ${toll.restrictions ? `<p style="margin: 5px 0;">Pagamentos: ${toll.restrictions}</p>` : ''}
                  </div>
                `;
                
                const infoWindow = new window.google.maps.InfoWindow({
                  content: infoContent
                });
                
                // Adicionar evento de clique
                tollMarker.addListener('click', () => {
                  infoWindows.forEach(iw => iw.close());
                  infoWindow.open(map, tollMarker);
                });
                
                tollMarker.set('isPOI', true);
                tollMarker.set('poiInfo', toll);
                tollMarker.set('ailogSource', true); // Marcar fonte como AILOG
                
                // Adicionar às listas
                newMarkers.push(tollMarker);
                newInfoWindows.push(infoWindow);
                
                console.log(`Pedágio AILOG adicionado: ${toll.name}`);
              });
              
              // Informar o componente pai APENAS sobre os pedágios da AILOG
              if (onRouteCalculated) {
                const resultWithPreciseTolls = {
                  ...result,
                  tollPoints: ailogTolls,
                  ailogSource: true
                };
                onRouteCalculated(resultWithPreciseTolls);
              }
              
              console.log("Pedágios identificados pela API AILOG:", ailogTolls);
            })
            .catch(error => {
              console.error("Erro ao obter pedágios da API AILOG:", error);
              // Em caso de falha na API AILOG, informar o componente pai com lista vazia de pedágios
              if (onRouteCalculated) {
                onRouteCalculated({
                  ...result,
                  tollPoints: [],
                  ailogSource: false
                });
              }
            });
          
          // Extrair informações das cidades na rota (apenas para logging)
          const extractCitiesFromRoute = (routeResult: any): string[] => {
            const extractedCities: string[] = [];
            
            if (routeResult.routes && routeResult.routes[0] && routeResult.routes[0].legs) {
              routeResult.routes[0].legs.forEach((leg: any) => {
                if (leg.start_address) {
                  const cityMatch = leg.start_address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
                  if (cityMatch && cityMatch[1]) extractedCities.push(cityMatch[1]);
                }
                if (leg.end_address) {
                  const cityMatch = leg.end_address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
                  if (cityMatch && cityMatch[1]) extractedCities.push(cityMatch[1]);
                }
              });
            }
            
            return extractedCities;
          };
          
          // Extrair rodovias da rota (apenas para logging)
          const extractRoadsFromRoute = (routeResult: any): Set<string> => {
            const roads = new Set<string>();
            
            if (routeResult.routes && routeResult.routes[0] && routeResult.routes[0].legs) {
              routeResult.routes[0].legs.forEach((leg: any) => {
                if (leg.steps) {
                  leg.steps.forEach((step: any) => {
                    if (step.instructions) {
                      // Procurar padrões de rodovias (SP-XXX, BR-XXX, etc)
                      const rodoviaMatches = step.instructions.match(/(SP|BR|MG|PR|RS|SC|GO|MT|MS)[-\s](\d{3})/gi);
                      if (rodoviaMatches) {
                        rodoviaMatches.forEach((rod: string) => {
                          roads.add(rod.replace(/\s+/g, '-').toUpperCase());
                        });
                      }
                      
                      // Detectar rodovias por nome
                      const instructionText = step.instructions.toLowerCase();
                      if (instructionText.includes("anhanguera")) {
                        roads.add("SP-330");
                      } else if (instructionText.includes("bandeirantes")) {
                        roads.add("SP-348");
                      } else if (instructionText.includes("washington luis")) {
                        roads.add("SP-310");
                      }
                    }
                  });
                }
              });
            }
            
            // Adicionar SP-255 se a rota tem algo relacionado a Ribeirão Preto
            const cities = extractCitiesFromRoute(routeResult);
            const hasRibeiraoPreto = cities.some(city => 
              city.includes("Ribeirão") || city.includes("Preto")
            );
            
            if (hasRibeiraoPreto) {
              roads.add("SP-255");
            }
            
            return roads;
          };
          
          // Extrair informações para logging
          const citiesInRoute = extractCitiesFromRoute(result);
          const roadsDetected = extractRoadsFromRoute(result);
          
          console.log("Cidades na rota:", citiesInRoute);
          console.log("Rodovias detectadas na rota:", Array.from(roadsDetected));
          
        } catch (error) {
          console.error("Erro ao processar dados de pedágio:", error);
        }
        
        // Atualizar as listas de marcadores e infowindows
        setMarkers(newMarkers);
        setInfoWindows(newInfoWindows);
        
        // Ajustar o mapa para mostrar todos os marcadores
        if (newMarkers.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          newMarkers.forEach(marker => {
            bounds.extend(marker.getPosition()!);
          });
          map.fitBounds(bounds);
        }
        
        console.log("Total de", newMarkers.length, "marcadores adicionados ao mapa");
        
        // Informar o chamador sobre a rota calculada (se não informamos antes com os pedágios AILOG)
        if (onRouteCalculated && !result.tollPoints) {
          // Se já enviamos com pedágios, não precisamos enviar novamente
          const hasTolls = result.routes?.[0]?.legs?.some((leg: any) => leg.tolls === true);
          console.log("Rota contém pedágios:", hasTolls);
          onRouteCalculated(result);
        }
      } else {
        console.error("Erro ao calcular rota:", status);
      }
    });
  }, [calculatedRoute, directionsRenderer, directionsService, infoWindows, map, markers, origin, waypoints, onRouteCalculated]);
  
  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}