import { useState, useEffect } from "react";
import { Location } from "@/lib/types";
import MapLegend from "@/components/MapLegend";

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
  
  // Obter a chave API do Google Maps
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  // Quando a origem for carregada, construir o iframe URL
  useEffect(() => {
    if (origin) {
      // Construir o iframe URL com a origem (coordenadas exatas)
      const baseUrl = `https://www.google.com/maps/embed/v1/place`;
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        q: `${origin.lat},${origin.lng}`, // Usando coordenadas em vez do endereço de texto
        zoom: "12",
        maptype: "roadmap"
      });
      
      setMapSrc(`${baseUrl}?${params.toString()}`);
      setIsMapReady(true);
      console.log("Mapa inicial carregado com coordenadas exatas");
    }
  }, [origin, GOOGLE_MAPS_API_KEY]);
  
  // Quando uma rota for calculada, atualizar o iframe para mostrar a rota
  useEffect(() => {
    if (origin && calculatedRoute && calculatedRoute.length > 0) {
      // URL base para direções
      const baseUrl = `https://www.google.com/maps/embed/v1/directions`;
      
      // Obter origem e destino com coordenadas exatas
      const originParam = `${origin.lat},${origin.lng}`;
      const destination = calculatedRoute[calculatedRoute.length - 1];
      const destinationParam = `${destination.lat},${destination.lng}`;
      
      // Construir waypoints string (máximo 8 pontos de parada devido a limitações da API)
      let waypointsArray = [];
      const maxWaypoints = Math.min(calculatedRoute.length - 2, 8); // -2 porque origem e destino já estão incluídos
      
      for (let i = 1; i < maxWaypoints + 1; i++) {
        const waypoint = calculatedRoute[i];
        if (waypoint && waypoint.lat && waypoint.lng) {
          waypointsArray.push(`${waypoint.lat},${waypoint.lng}`);
        }
      }
      
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        origin: originParam,
        destination: destinationParam,
        mode: "driving"
      });
      
      if (waypointsArray.length > 0) {
        params.append("waypoints", waypointsArray.join("|"));
      }
      
      const routeUrl = `${baseUrl}?${params.toString()}`;
      setMapSrc(routeUrl);
      console.log("Rota calculada atualizada com coordenadas exatas");
    }
  }, [calculatedRoute, origin, GOOGLE_MAPS_API_KEY]);

  // Quando waypoints mudam, mas não há rota calculada ainda
  useEffect(() => {
    if (origin && waypoints.length > 0 && !calculatedRoute) {
      // Usar o formato de search para exibir múltiplos pontos no mapa
      const baseUrl = `https://www.google.com/maps/embed/v1/search`;
      
      // Criar string de busca com coordenadas exatas
      const searchList = [];
      
      // Adicionar origem
      searchList.push(`${origin.lat},${origin.lng}`);
      
      // Adicionar waypoints
      waypoints.forEach(waypoint => {
        if (waypoint && waypoint.lat && waypoint.lng) {
          searchList.push(`${waypoint.lat},${waypoint.lng}`);
        }
      });
      
      // Centralizar no primeiro local (origem)
      const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        q: searchList.join(' | '), // Usar pipe para separar múltiplos locais
        zoom: "10",
        maptype: "roadmap",
        center: `${origin.lat},${origin.lng}`
      });
      
      setMapSrc(`${baseUrl}?${params.toString()}`);
      console.log("Atualizando mapa com coordenadas exatas para waypoints");
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
    
    let baseUrl, params;
    
    // Se tivermos waypoints, usamos search para mostrar todos os pontos
    if (waypoints && waypoints.length > 0) {
      baseUrl = `https://www.google.com/maps/embed/v1/search`;
      
      // Criar array com todos os pontos
      const searchList = [];
      searchList.push(`${origin.lat},${origin.lng}`);
      
      waypoints.forEach(waypoint => {
        if (waypoint && waypoint.lat && waypoint.lng) {
          searchList.push(`${waypoint.lat},${waypoint.lng}`);
        }
      });
      
      // Calcular zoom baseado no número de pontos
      let zoom = "14";
      if (waypoints.length > 5) {
        zoom = "10";
      } else if (waypoints.length > 0) {
        zoom = "12";
      }
      
      params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        q: searchList.join(' | '),
        zoom,
        maptype: mapType,
        center: `${origin.lat},${origin.lng}`
      });
    } 
    // Se não tivermos waypoints, usamos place para mostrar apenas a origem
    else {
      baseUrl = `https://www.google.com/maps/embed/v1/place`;
      params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        q: `${origin.lat},${origin.lng}`,
        zoom: "14",
        maptype: mapType
      });
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
        // Container do mapa com iframe do Google Maps Embed API
        <div className="h-full w-full" style={{ minHeight: '500px' }}>
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