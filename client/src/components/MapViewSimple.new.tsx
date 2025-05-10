import { useEffect, useRef, useState } from "react";
import { Location, PointOfInterest } from "@/lib/types";
import { useRoutesPreferred } from "@/hooks/useRoutesPreferred";
import { fetchTollsFromAilog } from "@/lib/ailogApi";
import { 
  formatCurrency, 
  formatDistance, 
  formatDuration, 
  findTollsUsingGooglePlaces,
  findTollsFromKnownHighways
} from "@/lib/mapUtils";

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
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindows, setInfoWindows] = useState<any[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRoute = useRef(false);
  
  // Referência para o DirectionsService
  const directionsService = useRef<any>(null);
  
  // Inicialização do mapa
  useEffect(() => {
    if (!window.google || !mapRef.current) return;
    
    // Inicializar o mapa
    const mapOptions = {
      zoom: 7,
      center: { lat: -22.36, lng: -48.38 }, // Dois Córregos-SP
      mapTypeId: 'roadmap',
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      }
    };
    
    const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(mapInstance);
    
    // Inicializar serviços
    directionsService.current = new window.google.maps.DirectionsService();
    const rendererInstance = new window.google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true, // Não mostrar marcadores padrão
      polylineOptions: {
        strokeColor: '#2563eb', // Blue-600
        strokeWeight: 5,
        strokeOpacity: 0.7
      }
    });
    setDirectionsRenderer(rendererInstance);
    
    // Limpar ao desmontar
    return () => {
      // Limpar os marcadores
      markers.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      
      // Limpar janelas de informação
      infoWindows.forEach(infoWindow => {
        if (infoWindow) infoWindow.close();
      });
      
      // Limpar renderer
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, []);
  
  // Efeito para calcular e renderizar a rota
  useEffect(() => {
    if (!map || !directionsRenderer || !directionsService.current) return;
    if (!origin || waypoints.length === 0) return;
    if (isProcessingRoute.current) return;
    
    isProcessingRoute.current = true;
    setError(null);
    
    // Limpar marcadores existentes
    markers.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    
    // Limpar janelas de informação
    infoWindows.forEach(infoWindow => {
      if (infoWindow) infoWindow.close();
    });
    
    setMarkers([]);
    setInfoWindows([]);
    
    // Preparar origem e waypoints
    const originLatLng = { 
      lat: parseFloat(origin.lat), 
      lng: parseFloat(origin.lng) 
    };
    
    const destinationLatLng = { 
      lat: parseFloat(waypoints[waypoints.length - 1].lat), 
      lng: parseFloat(waypoints[waypoints.length - 1].lng) 
    };
    
    const waypointsLatLng = waypoints.slice(0, -1).map(wp => ({
      location: new window.google.maps.LatLng(parseFloat(wp.lat), parseFloat(wp.lng)),
      stopover: true
    }));
    
    // Configurar parâmetros da rota
    const request = {
      origin: originLatLng,
      destination: destinationLatLng,
      waypoints: waypointsLatLng,
      optimizeWaypoints: false,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidTolls: false,
      avoidHighways: false,
    };
    
    // Calcular rota usando o DirectionsService do Google Maps
    directionsService.current.route(request, (result: any, status: any) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        // Renderizar rota
        directionsRenderer.setDirections(result);
        
        // Extrair cidades da rota
        const cities: string[] = [];
        if (result.routes && result.routes[0] && result.routes[0].legs) {
          result.routes[0].legs.forEach((leg: any) => {
            // Extrair cidade de origem
            const startCity = leg.start_address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
            if (startCity && startCity[1]) {
              cities.push(startCity[1]);
            }
            
            // Extrair cidade de destino
            const endCity = leg.end_address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
            if (endCity && endCity[1]) {
              cities.push(endCity[1]);
            }
          });
        }
        
        // Informações da rota para a UI
        const distance = result.routes[0].legs.reduce((acc: number, leg: any) => acc + leg.distance.value, 0);
        const duration = result.routes[0].legs.reduce((acc: number, leg: any) => acc + leg.duration.value, 0);
        
        console.log("Rota calculada com sucesso!");
        console.log(`Distância total: ${formatDistance(distance)}`);
        console.log(`Tempo estimado: ${formatDuration(duration)}`);
        
        // Adicionar marcadores personalizados com números sequenciais
        const bounds = new window.google.maps.LatLngBounds();
        const newMarkers: any[] = [];
        const newInfoWindows: any[] = [];
        
        // Adicionar marcador na origem
        const originPosition = originLatLng;
        bounds.extend(originPosition);
        
        // Sequência completa inclui origem + todos os waypoints
        const sequence = [originLatLng, ...waypoints.map(wp => ({ 
          lat: parseFloat(wp.lat), 
          lng: parseFloat(wp.lng) 
        }))];
        
        // Criar marcadores para cada ponto da sequência
        sequence.forEach((position, index) => {
          // Pular o último ponto se for idêntico ao penúltimo (bug do TSP solver)
          if (index > 0 && 
              index === sequence.length - 1 && 
              position.lat === sequence[index-1].lat && 
              position.lng === sequence[index-1].lng) {
            return;
          }
          
          // Obter informações do local
          const locationInfo = index === 0 ? origin : waypoints[index - 1];
          const title = locationInfo?.name || `Ponto ${index + 1}`;
          const address = locationInfo?.address || '';
          
          // Criar marcador com número sequencial
          const marker = new window.google.maps.Marker({
            position,
            map,
            title,
            label: {
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold'
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: index === 0 ? '#10b981' : '#2563eb', // Verde para origem, azul para destinos
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 14
            },
            zIndex: 100 - index // Garantir que a origem fique acima
          });
          
          bounds.extend(position);
          
          // Criar janela de informação
          const infoContent = `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 5px; color: #333; font-size: 16px;">${title}</h3>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">${address}</p>
              ${index === 0 ? '<p style="margin: 5px 0; font-weight: bold; color: #10b981;">Origem</p>' : ''}
              <p style="margin: 5px 0; color: #666;">Sequência: ${index + 1}</p>
            </div>
          `;
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent
          });
          
          // Adicionar evento de clique
          marker.addListener('click', () => {
            // Fechar todas as janelas de informação abertas
            newInfoWindows.forEach(iw => iw.close());
            infoWindow.open(map, marker);
          });
          
          newMarkers.push(marker);
          newInfoWindows.push(infoWindow);
        });
        
        // Implementação simplificada: Adicionar os pontos de interesse
        const allPOIs: PointOfInterest[] = [...pointsOfInterest];
        
        // PASSO 1: Buscar pedágios via API AILOG (principal fonte)
        fetchTollsFromAilog(origin, waypoints, localStorage.getItem('selectedVehicleType') || 'car')
          .then(ailogTolls => {
            console.log("Resultado AILOG:", ailogTolls ? ailogTolls.length : 0, "pedágios encontrados");
            
            if (ailogTolls && ailogTolls.length > 0) {
              // Adicionar pedágios da AILOG
              ailogTolls.forEach(toll => {
                allPOIs.push({
                  ...toll,
                  source: 'ailog' // Marcar a origem
                });
              });
            } else {
              console.log("Nenhum pedágio encontrado via AILOG, buscando alternativas...");
              
              // PASSO 2: Se AILOG falhar, buscar com Google Places
              findTollsUsingGooglePlaces(map, result)
                .then(googleTolls => {
                  console.log("Google Places encontrou:", googleTolls.length, "pedágios");
                  
                  if (googleTolls && googleTolls.length > 0) {
                    // Adicionar pedágios do Google
                    googleTolls.forEach(toll => {
                      allPOIs.push({
                        ...toll,
                        source: 'google' // Marcar a origem
                      });
                    });
                  } else {
                    console.log("Google Places também não encontrou pedágios, usando banco de rodovias conhecidas");
                    
                    // PASSO 3: Último recurso - usar banco de dados de rodovias conhecidas
                    const knownTolls = findTollsFromKnownHighways(result);
                    console.log("Pedágios de rodovias conhecidas:", knownTolls.length);
                    
                    knownTolls.forEach(toll => {
                      allPOIs.push({
                        ...toll,
                        source: 'known_highway' // Marcar a origem
                      });
                    });
                  }
                  
                  // Adicionar os POIs ao mapa
                  addPOIsToMap();
                })
                .catch(error => {
                  console.error("Erro ao buscar pedágios via Google Places:", error);
                  
                  // Usar banco de rodovias conhecidas como fallback
                  const knownTolls = findTollsFromKnownHighways(result);
                  knownTolls.forEach(toll => {
                    allPOIs.push({
                      ...toll,
                      source: 'known_highway' // Marcar a origem
                    });
                  });
                  
                  // Adicionar os POIs ao mapa
                  addPOIsToMap();
                });
            }
          })
          .catch(error => {
            console.error("Erro ao buscar pedágios via AILOG:", error);
            
            // PASSO 2: Se AILOG falhar, buscar com Google Places
            findTollsUsingGooglePlaces(map, result)
              .then(googleTolls => {
                if (googleTolls && googleTolls.length > 0) {
                  googleTolls.forEach(toll => {
                    allPOIs.push({
                      ...toll,
                      source: 'google'
                    });
                  });
                } else {
                  // PASSO 3: Último recurso
                  const knownTolls = findTollsFromKnownHighways(result);
                  knownTolls.forEach(toll => {
                    allPOIs.push({
                      ...toll,
                      source: 'known_highway'
                    });
                  });
                }
                
                // Adicionar os POIs ao mapa
                addPOIsToMap();
              })
              .catch(err => {
                console.error("Erro ao buscar pedágios via Google Places:", err);
                
                // Usar banco de rodovias conhecidas como fallback
                const knownTolls = findTollsFromKnownHighways(result);
                knownTolls.forEach(toll => {
                  allPOIs.push({
                    ...toll,
                    source: 'known_highway'
                  });
                });
                
                // Adicionar os POIs ao mapa
                addPOIsToMap();
              });
          });
          
        // Função para adicionar os POIs ao mapa
        function addPOIsToMap() {
          console.log(`Adicionando ${allPOIs.length} POIs ao mapa`);
          
          // Adicionar POIs ao mapa (pedágios, balanças)
          allPOIs.forEach(poi => {
            const poiPosition = {
              lat: parseFloat(poi.lat),
              lng: parseFloat(poi.lng)
            };
            
            // Determinar a cor do ícone com base no tipo e fonte
            let fillColor = '#FF0000'; // Vermelho default
            
            if (poi.type === 'toll') {
              if (poi.source === 'ailog') {
                fillColor = '#FF5722'; // Laranja para AILOG (principal)
              } else if (poi.source === 'google') {
                fillColor = '#9C27B0'; // Roxo para Google Places
              } else if (poi.source === 'known_highway') {
                fillColor = '#795548'; // Marrom para banco de rodovias
              } else {
                fillColor = '#F44336'; // Vermelho para outros
              }
            } else if (poi.type === 'weighing_station') {
              fillColor = '#4CAF50'; // Verde para balanças
            }
            
            // Criar e adicionar marcador
            const poiMarker = new window.google.maps.Marker({
              position: poiPosition,
              map,
              title: poi.name,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: fillColor,
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                scale: 12
              },
              zIndex: 10
            });
            
            console.log(`Adicionado marcador para ${poi.name} em ${poiPosition.lat}, ${poiPosition.lng}`);
            
            // Criar janela de informação
            let infoContent = `
              <div style="padding: 10px; max-width: 300px;">
                <h3 style="margin: 0 0 5px; color: #333; font-size: 16px;">${poi.name}</h3>
            `;
            
            if (poi.type === 'toll') {
              infoContent += `
                <div>Tipo: Pedágio</div>
                <div>Valor: ${poi.cost ? formatCurrency(poi.cost) : 'Não disponível'}</div>
                <div>Fonte: ${poi.source === 'ailog' ? 'AILOG' : 
                              poi.source === 'google' ? 'Google Maps' : 
                              poi.source === 'known_highway' ? 'Rodovia conhecida' : 
                              'Desconhecida'}</div>
              `;
              
              if (poi.roadName) {
                infoContent += `<div>Rodovia: ${poi.roadName}</div>`;
              }
            } else if (poi.type === 'weighing_station') {
              infoContent += `<div>Tipo: Balança</div>`;
              if (poi.restrictions) {
                infoContent += `<div>Restrições: ${poi.restrictions}</div>`;
              }
            }
            
            infoContent += `</div>`;
            
            const infoWindow = new window.google.maps.InfoWindow({
              content: infoContent
            });
            
            // Adicionar evento de clique
            poiMarker.addListener('click', () => {
              // Fechar todas as janelas de informação abertas
              newInfoWindows.forEach(iw => iw.close());
              infoWindow.open(map, poiMarker);
            });
            
            // Adicionar às listas
            newMarkers.push(poiMarker);
            newInfoWindows.push(infoWindow);
            
            // Estender os bounds para incluir o POI
            bounds.extend(poiPosition);
          });
          
          // Ajustar visualização para mostrar todos os pontos
          map.fitBounds(bounds);
          
          // Definir um zoom máximo para evitar aproximação excessiva
          const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom() > 15) map.setZoom(15);
            window.google.maps.event.removeListener(listener);
          });
          
          // Armazenar todos os marcadores e infoWindows
          setMarkers(newMarkers);
          setInfoWindows(newInfoWindows);
          
          console.log(`Total de ${newMarkers.length} marcadores adicionados ao mapa`);
          
          // Chamar o callback com as informações da rota
          if (onRouteCalculated) {
            onRouteCalculated({
              ...result,
              poisAlongRoute: allPOIs
            });
          }
        }
        
        // Se API AILOG falhar completamente, ainda assim mostrar POIs padrão
        setTimeout(() => {
          if (newMarkers.length <= sequence.length) {
            console.log("Timeout: adicionando POIs básicos do banco de dados");
            addPOIsToMap();
          }
        }, 5000);
        
      } else {
        console.error("Erro ao calcular rota:", status);
        setError(`Não foi possível calcular a rota. Erro: ${status}`);
      }
      
      // Sempre resetar a flag ao final
      isProcessingRoute.current = false;
    });
  }, [origin, waypoints, map, directionsRenderer, markers, infoWindows]);
  
  return (
    <div className="h-full w-full flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Erro!</p>
          <p>{error}</p>
        </div>
      )}
      <div ref={mapRef} className="flex-1 w-full rounded-md shadow-md" />
    </div>
  );
}