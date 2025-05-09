import { useState, useEffect, useRef } from "react";
import { Location } from "@/lib/types";
import MapLegend from "@/components/MapLegend";
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
}

export default function MapView({ 
  origin, 
  waypoints,
  calculatedRoute
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
  
  // Quando uma rota for calculada, atualizar o iframe para mostrar a rota
  useEffect(() => {
    if (origin && calculatedRoute && calculatedRoute.length > 0) {
      // URL base para direções
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
        mode: "driving"
      });
      
      // Adicionar os waypoints intermediários
      if (waypointsArray.length > 0) {
        params.append("waypoints", waypointsArray.join("|"));
      }
      
      const routeUrl = `${baseUrl}?${params.toString()}`;
      setMapSrc(routeUrl);
      console.log("Rota otimizada exibida usando a API de directions");
    }
  }, [calculatedRoute, origin, GOOGLE_MAPS_API_KEY]);

  // Quando waypoints mudam, mas não há rota calculada ainda
  useEffect(() => {
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
        
        // Infelizmente, Google Maps Embed API não permite múltiplos marcadores
        // em modo place, então não podemos mostrar todos os waypoints de uma vez
        // Vamos mostrar pelo menos o centro do mapa
        
        setMapSrc(`${baseUrl}?${params.toString()}`);
        console.log("Mapa centralizado para mostrar todos os pontos");
      } catch (error) {
        console.error("Erro ao atualizar mapa:", error);
      }
    }
  }, [waypoints, origin, calculatedRoute, GOOGLE_MAPS_API_KEY]);

  // Estado para controlar a visualização Street View
  const [showStreetView, setShowStreetView] = useState(false);
  
  // Quando o usuário quer ver Street View
  const toggleStreetView = () => {
    // Se já está mostrando Street View e clica no botão, volta para o mapa normal
    if (showStreetView) {
      setShowStreetView(false);
      // Retorna para o modo de mapa normal usando a função que criamos
      setMapSrc(createMapUrl("roadmap"));
      return;
    }
    
    // Se temos uma origem válida, mostrar Street View dessa localização
    if (origin) {
      const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_API_KEY}&location=${origin.lat},${origin.lng}&heading=210&pitch=10&fov=90`;
      setMapSrc(streetViewUrl);
      setShowStreetView(true);
    }
  };
  
  // Função auxiliar para criar a URL do mapa com coordenadas exatas
  const createMapUrl = (mapType = "roadmap") => {
    if (!origin) return "";
    
    let baseUrl;
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      maptype: mapType
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
    // Só inicializa se tivermos origem e o contêiner estiver pronto
    if (origin && mapContainerRef.current && !directMapRef.current) {
      // Inicializar o mapa diretamente usando a função withGoogleMaps para garantir que a API esteja carregada
      withGoogleMaps(() => {
        try {
          console.log("Inicializando mapa interativo com marcadores...");
          
          // Coordenadas da origem
          const originCoords = { 
            lat: parseFloat(origin.lat), 
            lng: parseFloat(origin.lng) 
          };
          
          // Criar nova instância do mapa
          const map = new window.google.maps.Map(mapContainerRef.current!, {
            center: originCoords,
            zoom: 10,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            fullscreenControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            zoomControl: true
          });
          
          // Armazenar referência para uso futuro
          directMapRef.current = map;
          
          // Criar marcador da origem
          const originMarker = new window.google.maps.Marker({
            position: originCoords,
            map: map,
            title: origin.name || "Origem",
            label: "A",
            animation: window.google.maps.Animation.DROP
          });
          
          // Adicionar janela de informações para origem
          const originInfoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>Origem: ${origin.name}</strong><br>${origin.address || ""}<br>Lat: ${origin.lat}, Lng: ${origin.lng}</div>`
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
    if (!directMapRef.current || !origin || !waypoints || waypoints.length === 0) return;
    
    try {
      const map = directMapRef.current;
      
      // Limpar marcadores existentes (exceto origem)
      if (markersRef.current.length > 1) {
        for (let i = 1; i < markersRef.current.length; i++) {
          markersRef.current[i].setMap(null);
        }
        markersRef.current = [markersRef.current[0]]; // Manter apenas o marcador de origem
      }
      
      // Limites para ajustar zoom
      const bounds = new window.google.maps.LatLngBounds();
      
      // Adicionar origem aos limites
      bounds.extend({ 
        lat: parseFloat(origin.lat), 
        lng: parseFloat(origin.lng) 
      });
      
      console.log(`Adicionando ${waypoints.length} marcadores no mapa...`);
      
      // Adicionar cada waypoint ao mapa
      waypoints.forEach((waypoint, index) => {
        // Garantir que temos coordenadas válidas
        if (!waypoint.lat || !waypoint.lng) {
          console.warn(`Waypoint ${index + 1} (${waypoint.name}) não tem coordenadas válidas`);
          return; // Pular este waypoint
        }
        
        // Converter para números e verificar
        const lat = parseFloat(waypoint.lat);
        const lng = parseFloat(waypoint.lng);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Waypoint ${index + 1} tem coordenadas inválidas: lat=${waypoint.lat}, lng=${waypoint.lng}`);
          return; // Pular este waypoint
        }
        
        const position = { lat, lng };
        console.log(`Marcador ${index + 1}: ${waypoint.name} em ${lat},${lng}`);
        
        // Adicionar marcador com número
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: waypoint.name || `Destino ${index + 1}`,
          label: {
            text: (index + 1).toString(),
            color: "white"
          },
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#FF0000",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 12
          }
        });
        
        // Adicionar janela de informações
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div>
                     <strong>${waypoint.name || `Destino ${index + 1}`}</strong>
                     <br>${waypoint.address || ""}
                     <br>Lat: ${lat}, Lng: ${lng}
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
      
      // Apenas ajustar zoom se tivermos pontos no mapa
      if (markersRef.current.length > 1) {
        // Ajustar zoom para mostrar todos os pontos
        map.fitBounds(bounds);
        
        // Adicionar um padding para não ficar muito justo
        const padding = { 
          top: 50, 
          right: 50, 
          bottom: 50, 
          left: 50 
        };
        map.fitBounds(bounds, padding);
        
        console.log("Mapa ajustado para mostrar todos os pontos");
      }
    } catch (error) {
      console.error("Erro ao atualizar marcadores:", error);
    }
  };
  
  // Atualizar marcadores quando waypoints mudarem
  useEffect(() => {
    if (directMapRef.current && waypoints) {
      console.log(`Atualizando ${waypoints.length} waypoints no mapa`);
      updateMarkersOnMap();
    }
  }, [waypoints]);
  
  // Inicializar o mapa quando o componente montar
  useEffect(() => {
    // Iniciar carregamento da API do Google Maps no mount do componente
    withGoogleMaps(() => {
      console.log("API do Google Maps carregada automaticamente durante montagem do componente");
    });
  }, []);

  return (
    <div className="flex-1 relative h-full">
      {!isMapReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
          <div className="text-center p-4 rounded-lg shadow-md bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Carregando Google Maps...</p>
            <p className="text-xs text-gray-500 mt-2">Aguarde enquanto o mapa é carregado</p>
          </div>
        </div>
      ) : (
        // Container do mapa (agora com ambas opções: direto ou iframe)
        <div className="h-full w-full relative" style={{ minHeight: '500px' }}>
          {/* Container para mapa direto do Google Maps JavaScript API */}
          <div 
            ref={mapContainerRef} 
            className="h-full w-full"
            style={{ display: directMapRef.current ? 'block' : 'none', minHeight: '500px' }} 
          />
          
          {/* Fallback para iframe caso a API JavaScript não esteja disponível */}
          {!directMapRef.current && (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '500px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              title="Google Maps"
            ></iframe>
          )}
          
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
              onClick={showSatelliteView} 
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Visualização de satélite"
            >
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Botão de visualização de mapa */}
            <button 
              onClick={showRoadmapView} 
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Visualização de mapa"
            >
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Legenda do mapa */}
      <MapLegend />
    </div>
  );
}