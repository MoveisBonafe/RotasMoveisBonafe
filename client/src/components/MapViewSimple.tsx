import { useRef, useEffect, useState } from "react";
import { Location } from "@/lib/types";

interface MapViewProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (result: any) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapViewSimple({
  origin,
  waypoints,
  calculatedRoute
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar mapa
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;
      
      try {
        // Coordenadas padrão de Dois Córregos-SP
        const defaultPosition = { lat: -22.36752, lng: -48.38016 };
        
        // Posição inicial ou de origem
        const position = origin 
          ? { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) }
          : defaultPosition;

        // Criar mapa
        const mapOptions = {
          zoom: 12,
          center: position,
          mapTypeId: 'roadmap',
          scrollwheel: true, // Habilitar zoom com roda do mouse
          gestureHandling: "greedy" // Permitir gestos (zoom) sem Ctrl
        };
        
        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        
        // Se temos origem, mostrar marcador
        if (origin) {
          new window.google.maps.Marker({
            position: { 
              lat: parseFloat(origin.lat), 
              lng: parseFloat(origin.lng) 
            },
            map,
            title: origin.name,
            label: {
              text: "A",
              color: "#FFFFFF"
            }
          });
        }
        
        // Se temos waypoints, mostrar marcadores
        if (waypoints && waypoints.length > 0) {
          // Criar bounds para ajustar o zoom
          const bounds = new window.google.maps.LatLngBounds();
          
          // Adicionar origem às bounds
          if (origin) {
            bounds.extend({ 
              lat: parseFloat(origin.lat), 
              lng: parseFloat(origin.lng) 
            });
          }
          
          // Adicionar marcadores para cada waypoint
          waypoints.forEach((waypoint, index) => {
            const position = { 
              lat: parseFloat(waypoint.lat), 
              lng: parseFloat(waypoint.lng) 
            };
            
            // Adicionar ao bounds
            bounds.extend(position);
            
            // Criar marcador
            new window.google.maps.Marker({
              position,
              map,
              title: waypoint.name,
              label: {
                text: `${index + 1}`,
                color: "#FFFFFF"
              }
            });
          });
          
          // Ajustar o mapa para mostrar todos os pontos
          map.fitBounds(bounds);
        }
        
        // Se temos uma rota calculada, mostrar
        if (calculatedRoute && calculatedRoute.length > 0) {
          // Limpar marcadores anteriores
          map.setMap(null);
          
          // Criar bounds para ajustar o zoom
          const bounds = new window.google.maps.LatLngBounds();
          
          // Criar linha entre os pontos (polyline)
          const path = calculatedRoute.map(point => ({
            lat: parseFloat(point.lat),
            lng: parseFloat(point.lng)
          }));
          
          // Adicionar cada ponto ao bounds
          path.forEach(point => {
            bounds.extend(point);
          });
          
          // Criar e mostrar a linha no mapa
          new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#4285F4",
            strokeOpacity: 1.0,
            strokeWeight: 3,
            map
          });
          
          // Adicionar marcadores para cada ponto da rota
          calculatedRoute.forEach((point, index) => {
            const position = { 
              lat: parseFloat(point.lat), 
              lng: parseFloat(point.lng) 
            };
            
            // Criar marcador com número sequencial
            new window.google.maps.Marker({
              position,
              map,
              title: point.name,
              label: {
                text: index === 0 ? "A" : `${index}`,
                color: "#FFFFFF"
              }
            });
          });
          
          // Ajustar o mapa para mostrar a rota completa
          map.fitBounds(bounds);
        }
        
        setMapLoaded(true);
      } catch (e) {
        console.error("Erro ao inicializar mapa:", e);
        setError("Não foi possível renderizar o mapa. Verifique a conexão com a internet.");
      }
    };

    // Tentar inicializar o mapa se o Google Maps já estiver carregado
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      // Adicionar um listener para quando o mapa for carregado
      const scriptLoaded = () => {
        if (window.google && window.google.maps) {
          initializeMap();
        }
      };
      
      // Verificar a cada 500ms se o Google Maps foi carregado
      const checkMapLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkMapLoaded);
          scriptLoaded();
        }
      }, 500);
      
      // Limpar o intervalo quando o componente for desmontado
      return () => clearInterval(checkMapLoaded);
    }
  }, [origin, waypoints, calculatedRoute]);
  
  // Verificar se o mapa não carregou após um tempo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapLoaded && !error) {
        setError("Mapa não carregado após 5 segundos. Tente recarregar a página.");
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [mapLoaded, error]);

  return (
    <div className="flex-1 relative h-full">
      <div 
        ref={mapRef}
        className="h-full w-full rounded-xl overflow-hidden shadow-xl border border-blue-100" 
        style={{ minHeight: '500px' }}
      >
        {/* Mostrar erro se o mapa não carregar */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-white bg-opacity-90 z-50">
            <div className="text-center">
              <p className="text-red-600 font-bold mb-2">Erro ao carregar o mapa</p>
              <p className="mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Recarregar página
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}