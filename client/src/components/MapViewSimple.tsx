import { useRef, useEffect, useState } from 'react';
import { Location, PointOfInterest } from '@/lib/types';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface MapViewSimpleProps {
  origin: Location | null;
  waypoints: Location[];
  calculatedRoute: Location[] | null;
  onRouteCalculated?: (routeResponse: any) => void;
  pointsOfInterest?: PointOfInterest[];
}

export default function MapViewSimple({
  origin,
  waypoints,
  calculatedRoute,
  onRouteCalculated,
  pointsOfInterest = []
}: MapViewSimpleProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    map,
    displayRoute,
    addMarker,
    clearMarkers
  } = useGoogleMaps({
    mapContainerRef,
    initialOptions: {
      zoom: 12,
      center: { lat: -22.3673, lng: -48.3823 },
      mapTypeId: 'roadmap'
    }
  });

  useEffect(() => {
    if (!map || !origin) {
      console.log("Aguardando inicialização do mapa ou origem...");
      return;
    }

    const renderRoute = async () => {
      try {
        clearMarkers();

        if (calculatedRoute && calculatedRoute.length > 0) {
          const destination = calculatedRoute[calculatedRoute.length - 1];
          const intermediatePoints = calculatedRoute.slice(1, -1);

          const result = await displayRoute(
            origin,
            intermediatePoints,
            destination,
            pointsOfInterest || []
          );

          if (result && onRouteCalculated) {
            onRouteCalculated(result.route);
          }
        } else {
          // Se não houver rota, apenas mostrar o marcador de origem
          addMarker(origin, 'origin');

          // Centralizar o mapa na origem
          map.setCenter({
            lat: parseFloat(origin.lat),
            lng: parseFloat(origin.lng)
          });
        }
      } catch (err) {
        console.error('Erro ao renderizar rota:', err);
        setError('Erro ao renderizar a rota. Por favor, tente novamente.');
      }
    };

    renderRoute();
  }, [map, origin, calculatedRoute, pointsOfInterest]);

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-3 z-50">
          {error}
        </div>
      )}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}