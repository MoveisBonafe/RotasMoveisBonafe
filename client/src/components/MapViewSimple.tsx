import { useEffect, useRef, useState } from "react";
import { Location, PointOfInterest } from "@/lib/types";
import { useRoutesPreferred } from "@/hooks/useRoutesPreferred";
import { fetchTollsFromAilog } from "@/lib/ailogApi";

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
          
          // Usar marcador circular com número dentro para a origem
          const originMarker = new google.maps.Marker({
            position: originPoint,
            map: newMap,
            title: origin.name || "Origem",
            // Usar círculo azul para origem
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#3772FF', // Azul para origem
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 15, // Tamanho do círculo
            },
            label: {
              text: "0",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "bold", 
              className: "marker-label-centered" // Classe para centralizar
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
      // Limpar marcadores existentes do mapa
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
      
      // Arrays temporários para novos marcadores
      const newMarkers: google.maps.Marker[] = [];
      const newInfoWindows: google.maps.InfoWindow[] = [];
      
      // Criar bounds apenas uma vez (evita problemas com zoom excessivo)
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
          
          // ===== NOVO: Integração com API AILOG para obter pedágios precisos na rota =====
          // Usar a API AILOG para obter pedágios preciso ao invés de estimá-los por proximidade
          const vehicleType = localStorage.getItem('selectedVehicleType') || 'car';
          
          // Para garantir que a função assíncrona não bloqueie a renderização da rota
          (async () => {
            try {
              // Chamar a API AILOG para obter pedágios precisos desta rota
              const ailogTolls = await fetchTollsFromAilog(origin, waypoints, vehicleType);
              console.log('Pedágios identificados pela API AILOG:', ailogTolls);
              
              // Limpar marcadores existentes de POIs
              markers.forEach(marker => {
                if (marker.get('isPOI')) {
                  marker.setMap(null);
                }
              });
              
              // Função para adicionar um POI ao mapa
              function addPOIMarker(poi: PointOfInterest) {
                const position = {
                  lat: parseFloat(poi.lat),
                  lng: parseFloat(poi.lng)
                };
                
                // Criar marcador
                const poiMarker = new google.maps.Marker({
                  position,
                  map,
                  title: poi.name,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: poi.type === 'toll' ? '#f44336' : '#ff9800', // Vermelho para pedágios, laranja para balanças
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    scale: 10
                  },
                  zIndex: 2
                });
                
                // Criar janela de informações
                const infoContent = `
                  <div style="min-width: 200px;">
                    <h3 style="margin: 0; font-size: 16px;">${poi.name}</h3>
                    <p style="margin: 5px 0;">Tipo: ${poi.type === 'toll' ? 'Pedágio' : 'Balança'}</p>
                    ${poi.cost ? `<p style="margin: 5px 0;">Custo: R$ ${(poi.cost / 100).toFixed(2)}</p>` : ''}
                    ${poi.roadName ? `<p style="margin: 5px 0;">Rodovia: ${poi.roadName}</p>` : ''}
                    ${poi.city ? `<p style="margin: 5px 0;">Cidade: ${poi.city}</p>` : ''}
                    ${poi.restrictions ? `<p style="margin: 5px 0;">Pagamentos: ${poi.restrictions}</p>` : ''}
                  </div>
                `;
                
                const infoWindow = new google.maps.InfoWindow({
                  content: infoContent
                });
                
                // Adicionar evento de clique
                poiMarker.addListener('click', () => {
                  // Fechar todas as janelas de informações abertas
                  infoWindows.forEach(iw => iw.close());
                  // Abrir esta janela
                  infoWindow.open(map, poiMarker);
                });
                
                poiMarker.set('isPOI', true);
                poiMarker.set('poiInfo', poi);
                
                // Adicionar às listas
                markers.push(poiMarker);
                infoWindows.push(infoWindow);
                
                console.log(`POI adicionado: ${poi.name} (${poi.type})`);
                return poiMarker;
              }
              
              // Adicionar os novos marcadores de pedágio com base nos dados PRECISOS da API
              ailogTolls.forEach(poi => {
                addPOIMarker(poi);
              });
              
              // Atualizar o callback de rota calculada para informar pedágios precisos
              if (onRouteCalculated) {
                // Adicionar os pedágios ao resultado
                const resultWithTolls = {
                  ...result,
                  tollPoints: ailogTolls
                };
                onRouteCalculated(resultWithTolls);
              }
            } catch (error) {
              console.error('Erro ao obter pedágios da API AILOG:', error);
              // Em caso de falha, continuar com a detecção tradicional por proximidade
            }
          })();
          
          // 1. Adicionar marcador para a origem - também mais destacado
          const originMarker = new google.maps.Marker({
            position: originPoint,
            map: map,
            title: origin.name || "Origem",
            // Usar marcador personalizado com número dentro
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#3772FF', // Azul para se diferenciar (é a origem)
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 15, // Tamanho do círculo
            },
            label: {
              text: "0",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "bold",
              className: "marker-label-centered" // Classe para centralizar
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
              
              // Criar marcador com pino e numeração sequencial mais destacada
              const waypointMarker = new google.maps.Marker({
                position,
                map: map,
                title: point.name || `Ponto ${index + 1}`,
                // Usar marcador personalizado com número dentro
                icon: {
                  // SVG com número dentro do pino
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#E71D36', // Vermelho mais vivo
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                  scale: 15, // Tamanho do círculo
                },
                label: {
                  text: (index + 1).toString(),
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "bold",
                  className: "marker-label-centered" // Classe para centralizar
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
          
          // 3. Processar EXCLUSIVAMENTE pedágios da API AILOG
          try {
            // ============ INTEGRAÇÃO COM API AILOG ============
            // Obter pedágios precisos da rota utilizando API especializada
            const selectedVehicleType = localStorage.getItem('selectedVehicleType') || 'car';
            
            // Limpar todos os pedágios existentes do mapa
            markers.forEach(marker => {
              if (marker.get('isPOI') && marker.get('poiInfo')?.type === 'toll') {
                marker.setMap(null);
              }
            });
            
            // Filtrar marcadores para manter apenas os que não são pedágios
            const nonTollMarkers = markers.filter(marker => {
              return !marker.get('isPOI') || marker.get('poiInfo')?.type !== 'toll';
            });
            setMarkers(nonTollMarkers);
            
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
                  setMarkers(prev => [...prev, tollMarker]);
                  setInfoWindows(prev => [...prev, infoWindow]);
                  
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
            
            // Extrair cidades da rota apenas para fins de informação
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
            
            // REMOVIDO: Não fazemos mais adição manual de pedágios
            // AILOG é a única fonte autorizada de pedágios no sistema
            console.log("APENAS pedágios da API AILOG estão sendo utilizados");
            
            // Notificar sobre os pontos calculados - agendar para depois
            // do resto do processamento (para evitar loop infinito)
            if (onRouteCalculated && typeof onRouteCalculated === 'function') {
              setTimeout(() => {
                // Verificar se a função ainda existe
                if (onRouteCalculated) {
                  onRouteCalculated({
                    ...result,
                    poisAlongRoute: allPOIs
                  });
                }
              }, 200);
            }
            
            // Inicializar array para armazenar todos os POIs relevantes
            const allPOIs: PointOfInterest[] = [];
            
            // Função para verificar coordenadas duplicadas (considerar até 0.01 grau de diferença, ~1km)
            function isDuplicateLocation(poi1: PointOfInterest, poi2: PointOfInterest): boolean {
              const lat1 = parseFloat(poi1.lat);
              const lng1 = parseFloat(poi1.lng);
              const lat2 = parseFloat(poi2.lat);
              const lng2 = parseFloat(poi2.lng);
              
              const latDiff = Math.abs(lat1 - lat2);
              const lngDiff = Math.abs(lng1 - lng2);
              
              // Se as coordenadas estiverem muito próximas (< ~1km), considerar duplicado
              return latDiff < 0.01 && lngDiff < 0.01;
            }
            
            // Adicionar os POIs do backend que são relevantes para a rota
            if (pointsOfInterest && pointsOfInterest.length > 0) {
              console.log(`ANALISANDO ROTA: ${origin?.name} -> ${calculatedRoute?.[calculatedRoute.length-1]?.name || 'Destino'}`);
              
              // Identificar as rodovias presentes na rota
              const roadsInRoute = new Set<string>();
              const citiesInRoute = new Set<string>(cities);
              let destinationCity = "";
              
              // Extrair nome da cidade de destino
              if (calculatedRoute && calculatedRoute.length > 0) {
                const lastLocation = calculatedRoute[calculatedRoute.length - 1];
                if (lastLocation.address) {
                  const match = lastLocation.address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
                  if (match && match[1]) {
                    destinationCity = match[1];
                    citiesInRoute.add(destinationCity);
                  }
                }
                
                if (lastLocation.name) {
                  // Extrair cidade do nome também
                  const cityNameParts = lastLocation.name.split(",");
                  if (cityNameParts.length > 0) {
                    const cityName = cityNameParts[0].trim();
                    citiesInRoute.add(cityName);
                  }
                }
              }
              
              console.log("Analisando cidades na rota:", Array.from(citiesInRoute));
              
              // Detectar rodovias com base nos destinos e cidades na rota
              const hasRibeiraoPreto = Array.from(citiesInRoute).some(city => 
                city.includes("Ribeirão") || city.includes("Preto"));
              const hasBauru = Array.from(citiesInRoute).some(city => 
                city.includes("Bauru") || city.includes("Jaú") || city.includes("Botucatu"));
              
              // Inferir as rodovias baseado nas cidades detectadas
              if (hasRibeiraoPreto) {
                roadsInRoute.add("SP-255");
              }
              
              if (hasBauru) {
                roadsInRoute.add("SP-225");
                roadsInRoute.add("SP-300");
              }
              
              // Adicionar logicamente todas as rodovias que conectam Dois Córregos ao destino
              console.log("Rodovias detectadas na rota:", Array.from(roadsInRoute));
              
              // ALGORITMO UNIVERSAL: Filtrar POIs baseado na proximidade real com a rota
              const relevantPOIs = [];
              
              // Extrair todos os pontos da rota para análise de proximidade
              const routePoints: {lat: number, lng: number}[] = [];
              
              if (result.routes && result.routes[0] && result.routes[0].legs) {
                // Extrair todos os pontos do percurso
                result.routes[0].legs.forEach(leg => {
                  if (leg.steps) {
                    leg.steps.forEach(step => {
                      if (step.path) {
                        step.path.forEach(point => {
                          routePoints.push({
                            lat: point.lat(),
                            lng: point.lng()
                          });
                        });
                      } else if (step.lat_lngs) {
                        step.lat_lngs.forEach(point => {
                          routePoints.push({
                            lat: point.lat(),
                            lng: point.lng()
                          });
                        });
                      }
                    });
                  }
                });
              }
              
              // Extrair pontos de início e fim da rota
              const startPoint = {
                lat: parseFloat(origin.lat),
                lng: parseFloat(origin.lng)
              };
              let endPoint = startPoint;
              
              if (calculatedRoute && calculatedRoute.length > 0) {
                const lastPoint = calculatedRoute[calculatedRoute.length - 1];
                endPoint = {
                  lat: parseFloat(lastPoint.lat),
                  lng: parseFloat(lastPoint.lng)
                };
              }
              
              // Adicionar pontos de início e fim explicitamente
              routePoints.push(startPoint);
              routePoints.push(endPoint);
              
              console.log(`Analisando ${pointsOfInterest.length} POIs contra ${routePoints.length} pontos da rota`);
              
              // Filtragem baseada em distância real da rota e regras de negócio específicas
              pointsOfInterest.forEach(poi => {
                const poiPoint = {
                  lat: parseFloat(poi.lat),
                  lng: parseFloat(poi.lng)
                };
                
                // Verificar se o POI está próximo da rota (dentro de um raio máximo)
                // Distância máxima varia conforme o tipo de POI e rodovia
                let MAX_DISTANCE_KM = poi.type === "toll" ? 2 : 1; // Mais restritivo para balanças
                
                // Pedágios na SP-255 (rota para Ribeirão Preto) podem ter um raio maior
                if (poi.type === "toll" && poi.roadName === "SP-255" && hasRibeiraoPreto) {
                  MAX_DISTANCE_KM = 3; // Aumentar raio para capturar pedágios importantes na rota SP-255
                }
                
                // Para a rota Dois Córregos -> Ribeirão Preto, SEMPRE incluir os pedágios obrigatórios
                // antes mesmo de analisar a distância
                if (hasRibeiraoPreto && poi.type === "toll" && poi.roadName === "SP-255") {
                  const mandatoryTolls = ["Guatapará", "Boa Esperança", "Ribeirão Preto"];
                  
                  // Se o POI é um dos pedágios obrigatórios na SP-255
                  if (mandatoryTolls.some(name => poi.name.includes(name))) {
                    console.log(`POI INCLUÍDO (regra especial): ${poi.name} - Pedágio obrigatório na SP-255`);
                    return true; // Adicionar ao mapa
                  }
                }
                
                // Função para calcular distância entre dois pontos em km
                function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
                  const R = 6371; // Raio da terra em km
                  const dLat = deg2rad(lat2 - lat1);
                  const dLon = deg2rad(lon2 - lon1);
                  const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2); 
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                  const d = R * c;
                  return d;
                }
                
                function deg2rad(deg) {
                  return deg * (Math.PI/180);
                }
                
                // Encontrar o ponto mais próximo na rota
                let minDistance = Infinity;
                for (const routePoint of routePoints) {
                  const distance = getDistanceFromLatLonInKm(
                    poiPoint.lat, poiPoint.lng,
                    routePoint.lat, routePoint.lng
                  );
                  
                  if (distance < minDistance) {
                    minDistance = distance;
                  }
                  
                  // Otimização: sair do loop ao encontrar um ponto próximo o suficiente
                  if (minDistance <= 0.5) break; // 500m é próximo o suficiente
                }
                
                const isNearRoute = minDistance <= MAX_DISTANCE_KM;
                
                // ALGORITMO APRIMORADO: Sistema inteligente para detecção de POIs relevantes
                
                // 1. Se o POI está dentro da distância limite padrão, sempre inclua
                if (isNearRoute) {
                  console.log(`POI INCLUÍDO: ${poi.name} - Motivo: Próximo da rota (distância: ${minDistance.toFixed(2)}km)`);
                  return true; // Adicionar ao mapa imediatamente
                }
                
                // 2. Lógica específica para rotas com destino a Ribeirão Preto
                if (hasRibeiraoPreto) {
                  // REGRA FORÇADA: Para a rota SP-255 (Dois Córregos -> Ribeirão Preto), SEMPRE incluir estes 3 pedágios
                  if (poi.type === "toll" && poi.roadName === "SP-255") {
                    // Pedágios OBRIGATÓRIOS - estes 3 sempre são incluídos para esta rota específica
                    if (poi.name.includes("Guatapará") || 
                        poi.name.includes("Boa Esperança") || 
                        poi.name.includes("Ribeirão Preto")) {
                        
                      // Pedágios garantidos na rota Ribeirão Preto
                      console.log(`POI INCLUÍDO: ${poi.name} - Motivo: Pedágio obrigatório na rota SP-255 (distância: ${minDistance.toFixed(2)}km)`);
                      return true;
                    }
                  }
                  
                  // Balanças na rota SP-255 - incluir apenas quando estiverem realmente próximas
                  if (poi.type === "weighing_station" && poi.roadName === "SP-255") {
                    // Balança de Luís Antônio - critério mais restritivo
                    if (poi.name.includes("Luís Antônio") || poi.name.includes("km 150")) {
                      // Só incluir se a distância for menor que 3km
                      const isRelevant = minDistance <= 3;
                      if (isRelevant) {
                        console.log(`POI INCLUÍDO: ${poi.name} - Motivo: Balança relevante (distância: ${minDistance.toFixed(2)}km)`);
                        return true;
                      }
                    }
                  }
                }
                
                // Caso não atenda nenhum critério acima
                console.log(`POI EXCLUÍDO: ${poi.name} - Não relevante para esta rota (distância: ${minDistance.toFixed(2)}km)`);
                return false;
                
                // Não usar return, pois já adicionamos ao array relevantPOIs manualmente
              });
              
              // Adicionar os POIs relevantes à lista evitando duplicados
              // Especialmente para balança do km 150 que pode aparecer duplicada
              relevantPOIs.forEach(newPoi => {
                // Verificar se já existe um POI com localização muito próxima
                // Considerar Balança Luís Antônio e Balança km 150 como o mesmo ponto
                const isDuplicate = allPOIs.some(existingPoi => 
                  isDuplicateLocation(existingPoi, newPoi) || 
                  existingPoi.name === newPoi.name ||
                  // Checagem específica para as balanças duplicadas
                  (newPoi.name.includes("Luís Antônio") && existingPoi.name.includes("km 150")) ||
                  (newPoi.name.includes("km 150") && existingPoi.name.includes("Luís Antônio"))
                );
                
                if (!isDuplicate) {
                  allPOIs.push(newPoi);
                } else {
                  console.log(`POI duplicado ignorado: ${newPoi.name} (${newPoi.lat}, ${newPoi.lng})`);
                }
              });
              
              console.log(`Total de POIs filtrados para a rota: ${relevantPOIs.length} de ${pointsOfInterest.length}`);
            }
            
            // Adicionar pedágios e POIs como marcadores no mapa
            console.log(`Adicionando ${allPOIs.length} POIs ao mapa`);
            
            allPOIs.forEach(poi => {
              console.log(`POI adicionado: ${poi.name} (${poi.type})`);
              const poiPoint = {
                lat: parseFloat(poi.lat),
                lng: parseFloat(poi.lng)
              };
              
              // Criar ícones personalizados para POIs
              let poiIcon = {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#0466C8', // Azul para POIs genéricos
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: '#FFFFFF',
                scale: 12
              };
              
              let labelText = "";
              
              // Personalizar baseado no tipo
              if (poi.type === "toll") {
                // Pedágio - Símbolo $
                poiIcon.fillColor = '#38B000'; // Verde
                labelText = "$";
              } else if (poi.type === "weighing_station") {
                // Balança - Símbolo ⚖
                poiIcon.fillColor = '#FFBA08'; // Amarelo
                labelText = "⚖";
              }
              
              // Criar marcador para o POI
              const poiMarker = new google.maps.Marker({
                position: poiPoint,
                map: map,
                title: poi.name,
                icon: poiIcon,
                label: labelText ? {
                  text: labelText,
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: "bold",
                  className: "marker-label-centered"
                } : null,
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
          
          // Ajustar o zoom para mostrar todos os pontos, mas com um pequeno atraso
          // para evitar problemas de zoom excessivo/recursivo
          if (newMarkers.length > 0) {
            setTimeout(() => {
              map.fitBounds(bounds);
              // Definir um zoom máximo para evitar aproximação excessiva
              const listener = google.maps.event.addListener(map, 'idle', () => {
                if (map.getZoom() > 15) map.setZoom(15);
                google.maps.event.removeListener(listener);
              });
            }, 100);
          }
          
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
    
    // Limpar ao desmontar
    return () => {
      isProcessingRoute.current = false;
    };
    
  // Reduzir dependências para evitar atualizações excessivas
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [map, directionsRenderer, origin, calculatedRoute]);

  return (
    <div className="map-container" style={{ width: "100%", height: "100%" }}>
      {error && <div className="map-error">{error}</div>}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}