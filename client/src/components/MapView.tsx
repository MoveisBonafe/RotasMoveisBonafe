import { useState, useEffect, useRef } from "react";
import { Location } from "@/lib/types";
import MapLegend from "@/components/MapLegend";
import { withGoogleMaps } from "@/main";

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
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [currentMapType, setCurrentMapType] = useState("roadmap");
  const [showStreetView, setShowStreetView] = useState(false);
  
  // Refs para os objetos do Google Maps
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  
  // Inicializa o mapa quando o componente for montado
  useEffect(() => {
    if (!origin || !mapContainerRef.current) return;
    
    const initializeMap = () => {
      try {
        console.log("Inicializando mapa com Google Maps API");
        
        // Criar mapa centrado na origem
        const mapOptions = {
          center: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          fullscreenControl: false,
          streetViewControl: false
        };
        
        // Criar nova instância do mapa
        const newMap = new google.maps.Map(
          mapContainerRef.current as HTMLElement,
          mapOptions
        );
        
        // Criar info window para os marcadores
        const infoWindow = new google.maps.InfoWindow();
        infoWindowRef.current = infoWindow;
        
        // Criar renderer para as direções
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: newMap,
          suppressMarkers: true // Não mostrar marcadores padrão da rota
        });
        
        // Configurar Street View
        const panorama = newMap.getStreetView();
        panoramaRef.current = panorama;
        
        // Salvar referências para uso posterior
        mapRef.current = newMap;
        directionsRendererRef.current = directionsRenderer;
        
        // Adicionar marcador na origem
        if (origin) {
          addMarker(origin, "origin");
        }
        
        // Adicionar marcadores para os waypoints, se existirem
        if (waypoints && waypoints.length > 0) {
          waypoints.forEach((waypoint, index) => {
            addMarker(waypoint, "waypoint", index + 1);
          });
        }
        
        // Se tiver uma rota calculada, mostrar ela
        if (calculatedRoute && calculatedRoute.length > 0) {
          showCalculatedRoute();
        }
        
        setIsMapReady(true);
        console.log("Mapa inicializado com sucesso");
      } catch (error) {
        console.error("Erro ao inicializar o mapa:", error);
      }
    };
    
    // Usar o utilitário para garantir que o Google Maps API esteja carregado
    withGoogleMaps(initializeMap);
    
    // Cleanup na desmontagem
    return () => {
      // Limpar marcadores
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Limpar renderer
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [origin]);
  
  // Resetar marcadores e adicionar novos quando os waypoints mudarem
  useEffect(() => {
    if (!mapRef.current || !origin) return;
    
    // Não precisa resetar se estivermos no modo de rota calculada
    if (calculatedRoute && calculatedRoute.length > 0) return;
    
    // Limpar marcadores existentes exceto o da origem
    clearMarkers(false);
    
    // Adicionar marcadores para os waypoints
    if (waypoints && waypoints.length > 0) {
      // Ajustar zoom para incluir todos os pontos
      adjustZoom();
      
      waypoints.forEach((waypoint, index) => {
        addMarker(waypoint, "waypoint", index + 1);
      });
      
      console.log(`${waypoints.length} waypoints adicionados ao mapa`);
    }
  }, [waypoints, origin, calculatedRoute]);
  
  // Atualizar a rota quando o calculatedRoute mudar
  useEffect(() => {
    if (!mapRef.current || !origin) return;
    
    if (calculatedRoute && calculatedRoute.length > 0) {
      setIsRoutingMode(true);
      showCalculatedRoute();
    } else {
      setIsRoutingMode(false);
    }
  }, [calculatedRoute, origin]);
  
  // Função para limpar todos os marcadores
  const clearMarkers = (includeOrigin = true) => {
    markersRef.current.forEach((marker, index) => {
      // Se includeOrigin = false, não remover o marcador da origem (primeiro marcador)
      if (includeOrigin || index > 0) {
        marker.setMap(null);
      }
    });
    
    if (includeOrigin) {
      markersRef.current = [];
    } else {
      // Manter apenas o marcador da origem
      markersRef.current = markersRef.current.slice(0, 1);
    }
  };
  
  // Adicionar um marcador no mapa
  const addMarker = (location: Location, type: "origin" | "waypoint" = "waypoint", index?: number) => {
    if (!mapRef.current) return;
    
    try {
      const position = {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      };
      
      // Configurar o ícone baseado no tipo
      let icon: any;
      if (type === "origin") {
        icon = {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 32)
        };
      } else {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#FF3333",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#FFFFFF",
          labelOrigin: new google.maps.Point(0, 0)
        };
      }
      
      // Criar o marcador
      const marker = new google.maps.Marker({
        position,
        map: mapRef.current,
        title: location.name || (type === "origin" ? "Origem" : `Destino ${index}`),
        icon,
        animation: google.maps.Animation.DROP,
        zIndex: type === "origin" ? 100 : 10
      });
      
      // Adicionar label para waypoints
      if (type === "waypoint" && index !== undefined) {
        marker.setLabel({
          text: index.toString(),
          color: "#FFFFFF",
          fontWeight: "bold"
        });
      }
      
      // Adicionar evento de clique para mostrar info window
      marker.addListener("click", () => {
        if (!infoWindowRef.current) return;
        
        const content = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${type === "origin" ? "Origem" : `Destino ${index}`}</h3>
            <p>${location.name || "Sem nome"}</p>
            <p class="text-sm text-gray-600">${location.address || ""}</p>
            ${location.cep ? `<p class="text-xs text-gray-500">CEP: ${location.cep}</p>` : ""}
          </div>
        `;
        
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapRef.current, marker);
      });
      
      // Salvar referência do marcador
      markersRef.current.push(marker);
      
      return marker;
    } catch (error) {
      console.error("Erro ao adicionar marcador:", error);
      return null;
    }
  };
  
  // Mostrar a rota calculada
  const showCalculatedRoute = () => {
    if (!mapRef.current || !directionsRendererRef.current || !calculatedRoute || calculatedRoute.length < 2) {
      return;
    }
    
    try {
      console.log("Exibindo rota calculada com", calculatedRoute.length, "pontos");
      
      // Limpar marcadores existentes
      clearMarkers(true);
      
      // Configurar origem e destino
      const originLatLng = {
        lat: parseFloat(calculatedRoute[0].lat),
        lng: parseFloat(calculatedRoute[0].lng)
      };
      
      const destinationLatLng = {
        lat: parseFloat(calculatedRoute[calculatedRoute.length - 1].lat),
        lng: parseFloat(calculatedRoute[calculatedRoute.length - 1].lng)
      };
      
      // Configurar waypoints
      const waypointsLatLng = calculatedRoute.slice(1, calculatedRoute.length - 1).map(point => ({
        location: { lat: parseFloat(point.lat), lng: parseFloat(point.lng) },
        stopover: true
      }));
      
      // Criar serviço de direções
      const directionsService = new google.maps.DirectionsService();
      
      // Configurar requisição
      const request: google.maps.DirectionsRequest = {
        origin: originLatLng,
        destination: destinationLatLng,
        waypoints: waypointsLatLng,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false // Não otimizar pois já está otimizada
      };
      
      // Requisitar direções
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          // Mostrar rota no mapa
          directionsRendererRef.current?.setDirections(result);
          
          // Adicionar marcadores para cada ponto da rota
          calculatedRoute.forEach((location, index) => {
            const type = index === 0 ? "origin" : "waypoint";
            const waypointIndex = index === 0 ? undefined : index;
            addMarker(location, type, waypointIndex);
          });
          
          console.log("Rota exibida com sucesso");
        } else {
          console.error("Erro ao calcular rota:", status);
        }
      });
    } catch (error) {
      console.error("Erro ao mostrar rota calculada:", error);
    }
  };
  
  // Ajustar o zoom para incluir todos os pontos
  const adjustZoom = () => {
    if (!mapRef.current || !origin || waypoints.length === 0) return;
    
    try {
      // Criar bounds
      const bounds = new google.maps.LatLngBounds();
      
      // Adicionar ponto da origem
      bounds.extend({
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng)
      });
      
      // Adicionar pontos dos waypoints
      waypoints.forEach(waypoint => {
        bounds.extend({
          lat: parseFloat(waypoint.lat),
          lng: parseFloat(waypoint.lng)
        });
      });
      
      // Ajustar mapa para mostrar todos os pontos
      mapRef.current.fitBounds(bounds);
      
      // Se o zoom estiver muito próximo, limitá-lo
      const zoomLevel = mapRef.current.getZoom();
      if (zoomLevel && zoomLevel > 15) {
        mapRef.current.setZoom(15);
      }
      
      console.log("Zoom ajustado para mostrar todos os pontos");
    } catch (error) {
      console.error("Erro ao ajustar zoom:", error);
    }
  };
  
  // Alternar para visualização de Street View
  const toggleStreetView = () => {
    if (!mapRef.current || !panoramaRef.current) return;
    
    try {
      if (showStreetView) {
        // Desativar Street View
        panoramaRef.current.setVisible(false);
        setShowStreetView(false);
      } else {
        // Pegar a posição atual do centro do mapa
        const center = mapRef.current.getCenter();
        if (!center) return;
        
        const position = {
          lat: center.lat(),
          lng: center.lng()
        };
        
        // Configurar Street View
        panoramaRef.current.setPosition(position);
        panoramaRef.current.setPov({
          heading: 270,
          pitch: 0
        });
        
        // Ativar Street View
        panoramaRef.current.setVisible(true);
        setShowStreetView(true);
      }
      
      console.log("Street View " + (showStreetView ? "desativado" : "ativado"));
    } catch (error) {
      console.error("Erro ao alternar Street View:", error);
    }
  };
  
  // Alternar tipo de mapa
  const changeMapType = (mapType: string) => {
    if (!mapRef.current) return;
    
    try {
      // Desativar Street View se estiver ativo
      if (showStreetView && panoramaRef.current) {
        panoramaRef.current.setVisible(false);
        setShowStreetView(false);
      }
      
      // Definir tipo de mapa
      switch (mapType) {
        case "roadmap":
          mapRef.current.setMapTypeId(google.maps.MapTypeId.ROADMAP);
          break;
        case "satellite":
          mapRef.current.setMapTypeId(google.maps.MapTypeId.SATELLITE);
          break;
        case "hybrid":
          mapRef.current.setMapTypeId(google.maps.MapTypeId.HYBRID);
          break;
        case "terrain":
          mapRef.current.setMapTypeId(google.maps.MapTypeId.TERRAIN);
          break;
      }
      
      setCurrentMapType(mapType);
      console.log("Tipo de mapa alterado para", mapType);
    } catch (error) {
      console.error("Erro ao alterar tipo de mapa:", error);
    }
  };
  
  // Controles de zoom
  const zoomIn = () => {
    if (!mapRef.current) return;
    
    const currentZoom = mapRef.current.getZoom() || 0;
    mapRef.current.setZoom(currentZoom + 1);
  };
  
  const zoomOut = () => {
    if (!mapRef.current) return;
    
    const currentZoom = mapRef.current.getZoom() || 0;
    mapRef.current.setZoom(currentZoom - 1);
  };
  
  return (
    <div className="flex-1 relative h-full">
      {/* Contêiner do mapa */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full" 
        style={{ minHeight: '500px' }}
      ></div>
      
      {/* Loader para quando o mapa estiver carregando */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-50">
          <div className="text-center p-4 rounded-lg shadow-md bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Carregando Google Maps...</p>
            <p className="text-xs text-gray-500 mt-2">Aguarde enquanto o mapa é carregado</p>
          </div>
        </div>
      )}
      
      {/* Controles do mapa */}
      {isMapReady && (
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2 z-10">
          {/* Zoom in */}
          <button 
            onClick={zoomIn} 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Aumentar zoom"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
          
          {/* Zoom out */}
          <button 
            onClick={zoomOut} 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Diminuir zoom"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M18 12H6"></path>
            </svg>
          </button>
          
          {/* Street View */}
          <button 
            onClick={toggleStreetView} 
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${showStreetView ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
            title={showStreetView ? "Sair do Street View" : "Ver Street View"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Tipo de mapa: Satélite */}
          <button 
            onClick={() => changeMapType("satellite")} 
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${currentMapType === 'satellite' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
            title="Visualização de satélite"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Tipo de mapa: Mapa */}
          <button 
            onClick={() => changeMapType("roadmap")} 
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${currentMapType === 'roadmap' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
            title="Visualização de mapa"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Legenda de pontos no mapa */}
      {isMapReady && waypoints.length > 0 && (
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
      
      {/* Legenda do mapa */}
      <MapLegend />
    </div>
  );
}