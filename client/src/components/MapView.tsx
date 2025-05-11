import { useState, useEffect, useRef } from "react";
import { Location } from "@/lib/types";
import { getMarkerIcon } from "@/lib/mapUtils";
import { withGoogleMaps } from "@/main";

// Declaração para o objeto global do Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
  pointsOfInterest?: any[]; // Pontos de interesse (pedágios e balanças)
}

export default function MapView({ 
  origin, 
  waypoints,
  calculatedRoute,
  onRouteCalculated,
  pointsOfInterest = []
}: MapViewProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapSrc, setMapSrc] = useState("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const directMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // Obter a chave API do Google Maps
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  // Quando a origem for carregada, inicializar o mapa
  useEffect(() => {
    if (origin) {
      // Iniciar carregamento da API do Google Maps
      withGoogleMaps(() => {
        console.log("Google Maps API está pronta para uso");
      });
      
      // Configurar fallback para iframe se necessário
      const baseUrl = `https://www.google.com/maps/embed/v1/place`;
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        q: `${origin.lat},${origin.lng}`, // Usando coordenadas em vez do endereço de texto
        zoom: "12",
        maptype: "roadmap"
      });
      
      setMapSrc(`${baseUrl}?${params.toString()}`);
      setIsMapReady(true);
      console.log("Fallback para iframe configurado se necessário");
    }
  }, [origin, GOOGLE_MAPS_API_KEY]);
  
  // Quando uma rota for calculada, acionar o cálculo e exibição no mapa
  useEffect(() => {
    if (origin && calculatedRoute && calculatedRoute.length > 0 && directMapRef.current) {
      try {
        console.log("Rota calculada recebida, atualizando mapa...");
        
        // Verificar se temos waypoints para a rota
        if (calculatedRoute.length <= 1) {
          console.warn("Rota calculada não tem waypoints suficientes");
          return;
        }
        
        // Usar a rota calculada para criar waypoints
        // O primeiro ponto é a origem, o último é o destino
        // Os intermediários são waypoints
        const waypointsForAPI = calculatedRoute.slice(1, -1).map(location => ({
          location: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
          stopover: true
        }));
        
        // Configurar a solicitação para a API Directions
        const directionsService = new window.google.maps.DirectionsService();
        
        // Criar um renderer se não existir
        if (!directMapRef.current.directionsRenderer) {
          const renderer = new window.google.maps.DirectionsRenderer({
            map: directMapRef.current,
            suppressMarkers: true, // Usamos nossos próprios marcadores
            polylineOptions: {
              strokeColor: '#2563eb', // azul
              strokeOpacity: 0.8,
              strokeWeight: 5
            }
          });
          directMapRef.current.directionsRenderer = renderer;
        }
        
        // Preparar origem e destino
        const originLatLng = { 
          lat: parseFloat(origin.lat), 
          lng: parseFloat(origin.lng) 
        };
        
        const destination = calculatedRoute[calculatedRoute.length - 1];
        const destinationLatLng = {
          lat: parseFloat(destination.lat),
          lng: parseFloat(destination.lng)
        };
        
        // Fazer a requisição
        directionsService.route({
          origin: originLatLng,
          destination: destinationLatLng,
          waypoints: waypointsForAPI,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false // A rota já está otimizada
        }, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            // Exibir a rota no mapa
            directMapRef.current.directionsRenderer.setDirections(result);
            
            // Atualizar marcadores
            updateMarkersOnMap();
            
            // Chamar o callback com a resposta
            if (onRouteCalculated) {
              onRouteCalculated(result);
            }
            
            console.log("✓ Rota exibida com sucesso via Google Maps Directions");
          } else {
            console.error("Erro ao exibir rota:", status);
            
            // Fallback para iframe se a API JavaScript falhar
            fallbackToIframe();
          }
        });
      } catch (error) {
        console.error("Erro ao processar rota calculada:", error);
        
        // Fallback para iframe se tivermos qualquer erro
        fallbackToIframe();
      }
    }
  }, [calculatedRoute, origin]);
  
  // Função para fallback para iframe se necessário
  const fallbackToIframe = () => {
    if (origin && calculatedRoute && calculatedRoute.length > 0) {
      // URL base para direções com versão específica
      const baseUrl = `https://www.google.com/maps/embed/v1/directions`;
      
      // Obter origem e destino com coordenadas exatas para a rota
      const originParam = `${origin.lat},${origin.lng}`;
      const destination = calculatedRoute[calculatedRoute.length - 1];
      const destinationParam = `${destination.lat},${destination.lng}`;
      
      // Construir waypoints string
      let waypointsArray = [];
      // Ajustar para calcular corretamente os waypoints intermediários
      const maxWaypoints = Math.min(calculatedRoute.length - 2, 8); // -2 porque origem e destino já estão incluídos
      
      for (let i = 1; i < maxWaypoints + 1; i++) {
        const waypoint = calculatedRoute[i];
        if (waypoint && waypoint.lat && waypoint.lng) {
          waypointsArray.push(`${waypoint.lat},${waypoint.lng}`);
        }
      }
      
      // Criar os parâmetros para a URL do mapa
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        origin: originParam,
        destination: destinationParam,
        mode: "driving",
        // Permitir zoom sem Ctrl também no iframe
        zoom: "10",
        // Garantir que podemos fazer zoom sem Ctrl
        gestureHandling: "greedy"
      });
      
      // Adicionar os waypoints intermediários
      if (waypointsArray.length > 0) {
        params.append("waypoints", waypointsArray.join("|"));
      }
      
      const routeUrl = `${baseUrl}?${params.toString()}`;
      setMapSrc(routeUrl);
      console.log("Fallback: Rota exibida usando iframe");
    }
  };

  // Função para calcular rota usando Google Directions API
  const displayRoute = () => {
    if (!origin || waypoints.length === 0 || !directMapRef.current) {
      console.warn("Não é possível calcular rota: origem, destinos ou mapa não disponíveis");
      return;
    }

    try {
      // Criar um novo serviço de Directions
      const directionsService = new window.google.maps.DirectionsService();
      
      // Criar um DirectionsRenderer se não existir
      if (!directMapRef.current.directionsRenderer) {
        const renderer = new window.google.maps.DirectionsRenderer({
          map: directMapRef.current,
          suppressMarkers: true, // Vamos usar nossos próprios marcadores customizados
          polylineOptions: {
            strokeColor: '#2563eb', // cor da linha da rota (azul)
            strokeOpacity: 0.8,
            strokeWeight: 5
          }
        });
        directMapRef.current.directionsRenderer = renderer;
      }
      
      // Preparar origem
      const originLatLng = { 
        lat: parseFloat(origin.lat), 
        lng: parseFloat(origin.lng) 
      };
      
      // Usar o último waypoint como destino
      const destination = waypoints[waypoints.length - 1];
      const destinationLatLng = {
        lat: parseFloat(destination.lat),
        lng: parseFloat(destination.lng)
      };
      
      // Preparar waypoints intermediários (excluindo o último, que é destino)
      const waypointsForAPI = waypoints.slice(0, -1).map(wp => ({
        location: { lat: parseFloat(wp.lat), lng: parseFloat(wp.lng) },
        stopover: true
      }));
      
      // Configuração da requisição para o Google Directions API
      const request = {
        origin: originLatLng,
        destination: destinationLatLng,
        waypoints: waypointsForAPI,
        optimizeWaypoints: false, // Não otimizamos aqui, já que nossa rota já vem otimizada
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false
      };
      
      console.log("Calculando rota via Google Directions API...");
      
      // Fazer a requisição para calcular a rota
      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Exibir a rota no mapa
          directMapRef.current.directionsRenderer.setDirections(result);
          
          // Atualizar marcadores no mapa
          updateMarkersOnMap();
          
          // Se temos um callback de rota calculada, chamá-lo com o resultado
          if (onRouteCalculated) {
            onRouteCalculated(result);
          }
          
          console.log("✓ Rota calculada e exibida com sucesso");
        } else {
          console.error("Erro ao calcular rota:", status);
        }
      });
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    }
  };

  // Quando waypoints mudam, atualizar o mapa e marcadores
  useEffect(() => {
    if (origin) {
      if (waypoints.length > 0) {
        // Se o mapa JavaScript já estiver inicializado, atualize os marcadores
        if (directMapRef.current) {
          console.log("Waypoints mudaram, atualizando marcadores no mapa...");
          updateMarkersOnMap();
          
          // Ajustar visualização para incluir todos os pontos
          try {
            const bounds = new window.google.maps.LatLngBounds();
            
            // Adicionar origem e todos os waypoints aos limites
            bounds.extend({lat: parseFloat(origin.lat), lng: parseFloat(origin.lng)});
            
            waypoints.forEach(wp => {
              bounds.extend({lat: parseFloat(wp.lat), lng: parseFloat(wp.lng)});
            });
            
            // Aplicar limites para ajustar visualização
            directMapRef.current.fitBounds(bounds);
            
            // Verificar se estamos com zoom muito próximo (caso de pontos muito próximos)
            const currentZoom = directMapRef.current.getZoom();
            if (currentZoom && currentZoom > 15) {
              directMapRef.current.setZoom(14);
            }
          } catch (err) {
            console.error("Erro ao ajustar visualização do mapa:", err);
          }
          
          return;
        }
        
        // Fallback para iframe se o mapa JavaScript não estiver disponível
        if (origin && waypoints.length > 0 && !calculatedRoute) {
          try {
            // Centralizar o mapa para incluir todos os pontos
            let sumLat = parseFloat(origin.lat);
            let sumLng = parseFloat(origin.lng);
            let minLat = parseFloat(origin.lat);
            let maxLat = parseFloat(origin.lat);
            let minLng = parseFloat(origin.lng);
            let maxLng = parseFloat(origin.lng);
            
            // Calcular centro e limites
            waypoints.forEach(wp => {
              const lat = parseFloat(wp.lat);
              const lng = parseFloat(wp.lng);
              
              sumLat += lat;
              sumLng += lng;
              
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
            });
            
            // Calcular o centro médio
            const centerLat = sumLat / (waypoints.length + 1);
            const centerLng = sumLng / (waypoints.length + 1);
            
            // Calcular zoom baseado na diferença
            const latDiff = maxLat - minLat;
            const lngDiff = maxLng - minLng;
            const maxDiff = Math.max(latDiff, lngDiff);
            
            // Ajustar zoom conforme a distância
            let zoom = 12;
            if (maxDiff > 0.5) zoom = 10;
            if (maxDiff > 1) zoom = 9;
            if (maxDiff > 2) zoom = 8;
            if (maxDiff > 4) zoom = 7;
            
            // Criar URL para o mapa
            const baseUrl = "https://www.google.com/maps/embed/v1/place";
            const params = new URLSearchParams({
              key: GOOGLE_MAPS_API_KEY,
              q: `${centerLat},${centerLng}`,
              zoom: zoom.toString(),
              maptype: "roadmap"
            });
            
            setMapSrc(`${baseUrl}?${params.toString()}`);
            console.log("Mapa centralizado para mostrar todos os pontos (iframe fallback)");
          } catch (error) {
            console.error("Erro ao atualizar mapa iframe:", error);
          }
        }
      }
    }
  }, [waypoints, origin, calculatedRoute]);

  // Estado para controlar a visualização Street View
  const [showStreetView, setShowStreetView] = useState(false);
  
  // Quando o usuário quer ver Street View
  const toggleStreetView = () => {
    // Se já está mostrando Street View e clica no botão, volta para o mapa normal
    if (showStreetView) {
      setShowStreetView(false);
      
      // Retorna para o modo de mapa normal
      if (directMapRef.current) {
        directMapRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      }
      return;
    }
    
    // Usar street view do Google Maps JavaScript API
    if (origin && directMapRef.current) {
      try {
        // Posição para o Street View
        const position = {
          lat: parseFloat(origin.lat),
          lng: parseFloat(origin.lng)
        };
        
        // Criar o panorama do Street View diretamente no mapa
        const panorama = new window.google.maps.StreetViewPanorama(
          mapContainerRef.current!,
          {
            position: position,
            pov: {
              heading: 210, // Orientação inicial (ângulo horizontal)
              pitch: 10     // Inclinação inicial (ângulo vertical)
            },
            zoom: 1,
            // Configurações para permitir zoom sem Ctrl
            gestureHandling: 'greedy',
            scrollwheel: true,
            // StreetView precisa desse controle
            enableCloseButton: true
          }
        );
        
        // Aplicar o panorama ao mapa
        directMapRef.current.setStreetView(panorama);
        setShowStreetView(true);
        
        console.log("Street View ativado via API JavaScript");
      } catch (e) {
        console.error("Erro ao ativar Street View:", e);
      }
    }
  };
  
  // Função auxiliar para criar a URL do mapa com coordenadas exatas
  const createMapUrl = (mapType = "roadmap") => {
    if (!origin) return "";
    
    let baseUrl;
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      maptype: mapType,
      // Configuração para permitir zoom sem Ctrl
      gestureHandling: "greedy"
    });
    
    // Se temos uma rota calculada, mostramos ela usando o modo directions
    if (calculatedRoute && calculatedRoute.length > 0) {
      baseUrl = `https://www.google.com/maps/embed/v1/directions`;
      
      const originParam = `${origin.lat},${origin.lng}`;
      // O último ponto da rota otimizada é o destino final
      const destination = calculatedRoute[calculatedRoute.length - 1];
      const destinationParam = `${destination.lat},${destination.lng}`;
      
      // Adicionar origem e destino
      params.append("origin", originParam);
      params.append("destination", destinationParam);
      params.append("mode", "driving");
      
      // Extrair waypoints da rota (excluindo origem e destino)
      if (calculatedRoute.length > 2) {
        const waypointsParam = calculatedRoute
          .slice(1, calculatedRoute.length - 1)
          .map(wp => `${wp.lat},${wp.lng}`)
          .join('|');
        
        if (waypointsParam) {
          params.append("waypoints", waypointsParam);
        }
      }
    }
    // Se tivermos waypoints, mas não a rota calculada ainda
    else if (waypoints && waypoints.length > 0) {
      baseUrl = `https://www.google.com/maps/embed/v1/place`;
      
      // Calcular centro do mapa
      let sumLat = parseFloat(origin.lat);
      let sumLng = parseFloat(origin.lng);
      
      waypoints.forEach(wp => {
        sumLat += parseFloat(wp.lat);
        sumLng += parseFloat(wp.lng);
      });
      
      const centerLat = sumLat / (waypoints.length + 1);
      const centerLng = sumLng / (waypoints.length + 1);
      
      // Usar o centro calculado como ponto central
      const centerLocation = `${centerLat},${centerLng}`;
      
      params.append("q", centerLocation);
      params.append("center", centerLocation);
      params.append("zoom", "10");
    } 
    // Se não tivermos waypoints, usamos place para mostrar apenas a origem
    else {
      baseUrl = `https://www.google.com/maps/embed/v1/place`;
      params.append("q", `${origin.lat},${origin.lng}`);
      params.append("zoom", "14");
    }
    
    return `${baseUrl}?${params.toString()}`;
  };
  
  // Mudar para visualização de satélite
  const showSatelliteView = () => {
    setMapSrc(createMapUrl("satellite"));
    setShowStreetView(false);
  };
  
  // Voltar para visualização de mapa normal
  const showRoadmapView = () => {
    setMapSrc(createMapUrl("roadmap"));
    setShowStreetView(false);
  };

  // Efeito para carregar o mapa diretamente usando a Google Maps JavaScript API
  useEffect(() => {
    // Verifica se a origem está definida e se temos um container para o mapa
    if (origin && mapContainerRef.current) {
      console.log("Inicializando/atualizando mapa com origem:", origin.name);
      
      // Se o mapa já existir, apenas centralize na origem sem recriar todo o mapa
      if (directMapRef.current) {
        try {
          // Atualizar o centro do mapa para a origem
          directMapRef.current.setCenter({
            lat: parseFloat(origin.lat),
            lng: parseFloat(origin.lng)
          });
          
          // Atualizar os marcadores sem recriar o mapa
          updateMarkersOnMap();
          return;
        } catch (err) {
          console.error("Erro ao atualizar mapa existente:", err);
          // Continuar para recriar o mapa em caso de erro
        }
      }
      
      // Limpar mapa anterior se existir, mas algo deu errado na atualização
      if (directMapRef.current) {
        // Remover todos os marcadores
        if (markersRef.current.length > 0) {
          for (let i = 0; i < markersRef.current.length; i++) {
            markersRef.current[i].setMap(null);
          }
          markersRef.current = [];
        }
        // Limpar referência para forçar recriação
        directMapRef.current = null;
      }
      
      // Inicializar o mapa diretamente usando a função withGoogleMaps para garantir que a API esteja carregada
      withGoogleMaps(() => {
        try {
          console.log("Inicializando mapa interativo com marcadores...");
          
          // Coordenadas da origem
          const originCoords = { 
            lat: parseFloat(origin.lat), 
            lng: parseFloat(origin.lng) 
          };
          
          // Criar nova instância do mapa com estilo personalizado
          const map = new window.google.maps.Map(mapContainerRef.current!, {
            center: originCoords,
            zoom: 10,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            fullscreenControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            zoomControl: true,
            // Permitir zoom sem precisar segurar Ctrl
            gestureHandling: 'cooperative',
            scrollwheel: true,
            // Estilo visual personalizado para o mapa
            styles: [
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                  { "color": "#e9e9e9" },
                  { "lightness": 17 }
                ]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                  { "color": "#f5f5f5" },
                  { "lightness": 20 }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                  { "color": "#ffffff" },
                  { "lightness": 17 }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                  { "color": "#ffffff" },
                  { "lightness": 29 },
                  { "weight": 0.2 }
                ]
              },
              {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                  { "color": "#ffffff" },
                  { "lightness": 18 }
                ]
              },
              {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                  { "color": "#ffffff" },
                  { "lightness": 16 }
                ]
              },
              {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                  { "color": "#f5f5f5" },
                  { "lightness": 21 }
                ]
              },
              {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                  { "color": "#f2f2f2" },
                  { "lightness": 19 }
                ]
              }
            ]
          });
          
          // Armazenar referência para uso futuro
          directMapRef.current = map;
          
          // Criar marcador da origem com estilo moderno
          const originMarker = new window.google.maps.Marker({
            position: originCoords,
            map: map,
            title: origin.name || "Origem",
            label: {
              text: "A",
              color: "#FFFFFF",
              fontWeight: "bold"
            },
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              labelOrigin: new window.google.maps.Point(14, 15),
              size: new window.google.maps.Size(32, 32),
              scaledSize: new window.google.maps.Size(32, 32)
            },
            animation: window.google.maps.Animation.DROP
          });
          
          // Adicionar janela de informações para origem
          const originInfoWindow = new window.google.maps.InfoWindow({
            content: `<div style="min-width: 200px; padding: 8px;">
                        <strong>Origem: ${origin.name}</strong>
                        <br>${origin.address || ""}
                        <br>CEP: ${origin.cep || "N/A"}
                        <br>Coordenadas: ${parseFloat(origin.lat).toFixed(6)}, ${parseFloat(origin.lng).toFixed(6)}
                      </div>`
          });
          
          // Abrir ao clicar no marcador de origem
          originMarker.addListener("click", () => {
            originInfoWindow.open(map, originMarker);
          });
          
          // Armazenar marcadores para limpeza futura
          markersRef.current = [originMarker];
          
          // Adicionar marcadores para waypoints
          if (waypoints && waypoints.length > 0) {
            updateMarkersOnMap();
          }
          
          // Marcar mapa como carregado
          setIsMapReady(true);
          console.log("Mapa interativo inicializado com marcadores visíveis");
        } catch (error) {
          console.error("Erro ao inicializar mapa interativo:", error);
          // Em caso de erro, utilizar o iframe como fallback
          setIsMapReady(true);
        }
      });
    }
  }, [origin]);
  
  // Função para adicionar marcadores ao mapa
  const updateMarkersOnMap = () => {
    if (!directMapRef.current || !origin) {
      console.warn("Não é possível atualizar marcadores: mapa ou origem não disponíveis");
      return;
    }
    
    try {
      console.log("Atualizando marcadores no mapa com origem:", origin.name);
      const map = directMapRef.current;
      
      // Limpar todos os marcadores existentes
      if (markersRef.current.length > 0) {
        console.log(`Removendo ${markersRef.current.length} marcadores existentes`);
        for (let i = 0; i < markersRef.current.length; i++) {
          markersRef.current[i].setMap(null);
        }
        markersRef.current = []; // Limpar completamente o array
      }
      
      // Limites para ajustar zoom
      const bounds = new window.google.maps.LatLngBounds();
      
      // Decidir quais pontos mostrar (rota calculada tem prioridade se existir)
      const pointsToShow = calculatedRoute || (waypoints.length > 0 ? [origin, ...waypoints] : [origin]);
      console.log(`Exibindo ${pointsToShow.length} pontos no mapa: origem + ${pointsToShow.length - 1} waypoints`);
      
      // Adicionar cada ponto ao mapa com marcadores sequenciais
      pointsToShow.forEach((point, index) => {
        // Garantir que temos coordenadas válidas
        if (!point.lat || !point.lng) {
          console.warn(`Ponto ${index} (${point.name}) não tem coordenadas válidas`);
          return; // Pular este ponto
        }
        
        // Converter para números e verificar
        const lat = parseFloat(point.lat);
        const lng = parseFloat(point.lng);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Ponto ${index} tem coordenadas inválidas: lat=${point.lat}, lng=${point.lng}`);
          return; // Pular este ponto
        }
        
        const position = { lat, lng };
        console.log(`Marcador ${index}: ${point.name} em ${lat},${lng}`);
        
        // Determinar se é origem, destino ou ponto intermediário
        const isOrigin = index === 0;
        const isDestination = calculatedRoute && index === pointsToShow.length - 1;
        let markerLabel, markerURL;
        
        // Usar ícones personalizados em vez de símbolos para maior compatibilidade
        if (isOrigin) {
          // Marcador de origem (A) - AZUL
          markerLabel = "A";
          markerURL = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        } else if (isDestination) {
          // Marcador de destino final (B) - VERDE
          markerLabel = "B";
          markerURL = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        } else {
          // Marcadores de waypoints numerados (sequenciais) - LARANJA
          // Para os pontos intermediários, a numeração deve começar em 1 (não em 0)
          
          // Se não é origem nem destino, é um ponto intermediário, numere de 1 a N
          const waypointIndex = index - 1; // índice - 1, pois índice 0 é a origem
          markerLabel = (waypointIndex + 1).toString(); // +1 para começar em 1, não em 0
          
          // Usar ícone laranja para os pontos intermediários e garantir visibilidade
          markerURL = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
          
          // Log para debug
          console.log(`Criando marcador intermediário #${markerLabel} em (${lat},${lng}) para ${point.name || 'ponto sem nome'}`);
          
          // Verificar se todos os marcadores intermediários estão presentes
          if (calculatedRoute) {
            const totalIntermediatePoints = calculatedRoute.length - 2; // -2 para excluir origem e destino
            console.log(`Total de pontos intermediários na rota: ${totalIntermediatePoints}`);
          }
          
          console.log(`Criando marcador intermediário #${markerLabel} para ponto ${point.name}`);
        }
        
        // Criar marcador com estilo apropriado usando ícones padrão do Google que sempre funcionam
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: point.name || `Ponto ${index}`,
          label: {
            text: markerLabel,
            color: "#FFFFFF",
            fontWeight: "bold"
          },
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: markerURL,
            labelOrigin: new window.google.maps.Point(14, 15)
          },
          zIndex: isOrigin || isDestination ? 100 : 10 // Origem e destino ficam acima dos outros
        });
        
        // Conteúdo mais detalhado para janela de informações
        const getPointTypeText = () => {
          if (isOrigin) return "Origem";
          if (isDestination) return "Destino Final";
          // Cálculo correto do número da parada
          const waypointIndex = index - 1;
          return `Parada ${waypointIndex + 1}`;
        };
        
        // Definir cor baseada no tipo de marcador
        const infoColor = isOrigin ? "#0066FF" : isDestination ? "#00AA00" : "#FF4500";
        
        // Criar janela de informações mais detalhada
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="min-width: 220px; padding: 10px; font-family: Arial, sans-serif;">
                     <h3 style="margin: 0 0 8px 0; color: ${infoColor};">${getPointTypeText()}</h3>
                     <strong>${point.name || `Ponto ${index}`}</strong>
                     <p style="margin: 8px 0;">${point.address || ""}</p>
                     <div style="font-size: 12px; color: #666;">
                       CEP: ${point.cep || "N/A"}<br>
                       Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}
                     </div>
                    </div>`
        });
        
        // Abrir ao clicar
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
        
        // Salvar marcador na referência
        markersRef.current.push(marker);
        
        // Adicionar ponto aos limites
        bounds.extend(position);
      });
      
      // Desenhar linhas conectando os pontos se temos pelo menos 2 pontos
      if (pointsToShow.length >= 2) {
        // Extrair coordenadas de cada ponto
        const routeCoordinates = pointsToShow.map(point => ({
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lng)
        }));
        
        // Configurar estilo mais moderno para a linha
        const routePath = new window.google.maps.Polyline({
          path: routeCoordinates,
          geodesic: true,
          strokeColor: "#4285F4", // Azul Google Maps
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map: map
        });
        
        // Adicionar efeito de animação na linha da rota
        routePath.addListener("click", () => {
          // Aumentar temporariamente a largura da linha quando clicada
          routePath.setOptions({ strokeWeight: 8 });
          setTimeout(() => {
            routePath.setOptions({ strokeWeight: 5 });
          }, 300);
        });
      }
      
      // Apenas ajustar zoom se tivermos pontos no mapa
      if (pointsToShow.length > 0) {
        // Ajustar zoom para mostrar todos os pontos
        map.fitBounds(bounds);
        
        // Adicionar um padding adequado
        const padding = { 
          top: 60, 
          right: 60, 
          bottom: 60, 
          left: 60 
        };
        map.fitBounds(bounds, padding);
        
        console.log("Mapa ajustado para mostrar todos os pontos");
      }
    } catch (error) {
      console.error("Erro ao atualizar marcadores:", error);
    }
  };
  
  // Atualizar marcadores quando waypoints ou calculatedRoute mudarem
  useEffect(() => {
    if (directMapRef.current) {
      console.log(`Atualizando marcadores no mapa. Waypoints: ${waypoints.length}, Rota calculada: ${calculatedRoute ? calculatedRoute.length : 0}`);
      updateMarkersOnMap();
    }
  }, [waypoints, calculatedRoute]);
  
  // Inicializar o mapa quando o componente montar
  useEffect(() => {
    // Iniciar carregamento da API do Google Maps no mount do componente
    withGoogleMaps(() => {
      console.log("API do Google Maps carregada automaticamente durante montagem do componente");
    });
  }, []);

  return (
    <div className="flex-1 relative h-full">
      {/* Interface simplificada apenas com iframe */}
      <div className="h-full w-full relative rounded-xl overflow-hidden shadow-xl border border-blue-100" style={{ minHeight: '500px' }}>
        {/* Usando apenas iframe para garantir compatibilidade */}
        <iframe
          className="w-full h-full border-0 rounded-xl"
          style={{ 
            minHeight: '500px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapSrc || createMapUrl("roadmap")}
          title="Google Maps"
        ></iframe>
          
        {/* Legenda para os pontos no mapa */}
        {(waypoints && waypoints.length > 0 && !showStreetView) && (
          <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-2 z-10 max-w-xs">
            <h3 className="text-sm font-semibold mb-2">Pontos no mapa:</h3>
            <div className="flex flex-col space-y-1 text-xs">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 mr-2">A</span>
                <span>Origem: {origin?.name || 'Dois Córregos'}</span>
              </div>
              {waypoints.map((waypoint, index) => (
                <div key={index} className="flex items-center">
                  <span className="inline-flex items-center justify-center bg-red-500 text-white rounded-full w-5 h-5 mr-2">{index + 1}</span>
                  <span>{waypoint.name || `Destino ${index + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
          
        {/* Controles do mapa */}
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2 z-10">
          {/* Botão de Street View */}
          <button 
            onClick={toggleStreetView} 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title={showStreetView ? "Sair do Street View" : "Ver Street View"}
          >
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Botão de visualização de satélite */}
          <button 
            onClick={() => {
              if (directMapRef.current) {
                directMapRef.current.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
              } else {
                setMapSrc(createMapUrl("satellite"));
              }
            }} 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Visualização de satélite"
          >
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Botão de visualização de mapa */}
          <button 
            onClick={() => {
              if (directMapRef.current) {
                directMapRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
              } else {
                setMapSrc(createMapUrl("roadmap"));
              }
            }} 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Visualização de mapa"
          >
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Legenda do mapa removida conforme solicitado */}
    </div>
  );
}