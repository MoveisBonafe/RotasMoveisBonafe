import { useState, useEffect } from "react";
import { Location } from "@/lib/types";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
}

// Recuperar a API key do ambiente
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

export default function MapViewSimple({ 
  origin, 
  waypoints, 
  calculatedRoute 
}: MapViewProps) {
  const [mapSrc, setMapSrc] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Quando origin ou waypoints mudarem, atualizar a URL do mapa
  useEffect(() => {
    if (origin) {
      try {
        const url = createMapUrl();
        setMapSrc(url);
      } catch (e) {
        console.error("Erro ao criar URL do mapa:", e);
        setError("Erro ao carregar mapa. Tente novamente.");
      }
    }
  }, [origin, waypoints]);
  
  // Quando uma rota for calculada, atualizar o iframe para mostrar a rota
  useEffect(() => {
    if (origin && calculatedRoute && calculatedRoute.length > 0) {
      try {
        const url = createMapUrl();
        setMapSrc(url);
      } catch (e) {
        console.error("Erro ao criar URL do mapa para rota:", e);
        setError("Erro ao carregar rota no mapa. Tente novamente.");
      }
    }
  }, [calculatedRoute, origin]);
  
  // Botões para alternar entre visualizações
  const showSatelliteView = () => {
    setMapSrc(createMapUrl("satellite"));
  };
  
  const showRoadmapView = () => {
    setMapSrc(createMapUrl("roadmap"));
  };
  
  return (
    <div className="flex-1 relative h-full">
      <div className="h-full w-full relative rounded-xl overflow-hidden shadow-xl border border-blue-100" style={{ minHeight: '500px' }}>
        {mapSrc ? (
          <iframe
            className="w-full h-full border-0 rounded-xl"
            style={{ 
              minHeight: '500px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
            title="Google Maps"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-gray-500">Carregando mapa...</div>
          </div>
        )}
        
        {/* Controles do mapa */}
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2 z-10">
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
        
        {/* Mostrar erro caso ocorra */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
            <div className="text-center p-4">
              <p className="text-red-600 font-bold mb-2">Erro ao carregar o mapa</p>
              <p className="mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}