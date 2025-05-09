import { Location } from "@/lib/types";

interface MapRedirectProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
}

export default function MapRedirect({
  origin,
  waypoints,
  calculatedRoute
}: MapRedirectProps) {
  // Gerar URL para o Google Maps
  const generateGoogleMapsUrl = () => {
    if (!origin) return "";

    // Se temos uma rota calculada
    if (calculatedRoute && calculatedRoute.length > 0) {
      // URL base do Google Maps (versão web)
      const baseUrl = "https://www.google.com/maps/dir/";
      
      // Origem
      const originParam = `${origin.lat},${origin.lng}`;
      
      // Destino (último ponto da rota)
      const destination = calculatedRoute[calculatedRoute.length - 1];
      const destinationParam = `${destination.lat},${destination.lng}`;
      
      // Waypoints (pontos intermediários)
      let waypointsParam = "";
      if (calculatedRoute.length > 2) {
        waypointsParam = calculatedRoute
          .slice(1, calculatedRoute.length - 1)
          .map(wp => `${wp.lat},${wp.lng}`)
          .join('/');
      }
      
      // Construir a URL completa
      return waypointsParam 
        ? `${baseUrl}${originParam}/${waypointsParam}/${destinationParam}`
        : `${baseUrl}${originParam}/${destinationParam}`;
    }
    // Se temos apenas waypoints, mas sem rota calculada
    else if (waypoints && waypoints.length > 0) {
      // URL base para busca
      const baseUrl = "https://www.google.com/maps/search/";
      
      // Criar um array com origem e todos os destinos
      const allPoints = [origin, ...waypoints];
      
      // Criar uma string com todas as coordenadas
      const coordsString = allPoints
        .map(point => `${point.name}@${point.lat},${point.lng}`)
        .join(' ');
      
      return `${baseUrl}${encodeURIComponent(coordsString)}`;
    }
    // Se temos apenas a origem
    else {
      // URL base para um único local
      const baseUrl = "https://www.google.com/maps/place/";
      return `${baseUrl}${encodeURIComponent(origin.name)}/@${origin.lat},${origin.lng},14z`;
    }
  };

  const handleOpenGoogleMaps = () => {
    const url = generateGoogleMapsUrl();
    if (url) {
      // Abrir em uma nova aba
      window.open(url, '_blank');
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <button
        onClick={handleOpenGoogleMaps}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md flex items-center"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
          />
        </svg>
        Abrir no Google Maps
      </button>
    </div>
  );
}