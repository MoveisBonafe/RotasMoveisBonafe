interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleStreetView: () => void;
  onChangeMapType: (type: string) => void;
  mapType: string;
}

// Define map type constants to avoid direct references to google.maps
const MAP_TYPES = {
  ROADMAP: "roadmap",
  SATELLITE: "satellite", 
  HYBRID: "hybrid",
  TERRAIN: "terrain"
};

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onToggleStreetView,
  onChangeMapType,
  mapType
}: MapControlsProps) {
  return (
    <>
      {/* Zoom Controls - Design Moderno */}
      <div className="absolute top-4 right-4 zoom-controls flex flex-col rounded-md shadow-md overflow-hidden">
        <button 
          className="p-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
          onClick={onZoomIn}
          aria-label="Aumentar zoom"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="border-t border-gray-200"></div>
        <button 
          className="p-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
          onClick={onZoomOut}
          aria-label="Diminuir zoom"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Street View Toggle - Design Moderno */}
      <div className="absolute top-20 right-4">
        <button
          className="p-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none rounded-full shadow-md transition-all transform hover:scale-105"
          onClick={onToggleStreetView}
          title="Street View"
          aria-label="Ativar Street View"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Map Type Selector - Estilo Google Maps */}
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center bg-white rounded-md shadow-md overflow-hidden">
          <button 
            onClick={() => onChangeMapType(MAP_TYPES.ROADMAP)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              mapType === MAP_TYPES.ROADMAP 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Mapa
          </button>
          <button 
            onClick={() => onChangeMapType(MAP_TYPES.SATELLITE)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              mapType === MAP_TYPES.SATELLITE || mapType === MAP_TYPES.HYBRID
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Satélite
          </button>
        </div>
        
        {/* Opções adicionais - reveladas apenas quando em modo satélite */}
        {(mapType === MAP_TYPES.SATELLITE || mapType === MAP_TYPES.HYBRID) && (
          <div className="mt-2 bg-white rounded-md shadow-md p-2">
            <label className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
              <input 
                type="checkbox" 
                checked={mapType === MAP_TYPES.HYBRID}
                onChange={() => onChangeMapType(
                  mapType === MAP_TYPES.HYBRID ? MAP_TYPES.SATELLITE : MAP_TYPES.HYBRID
                )}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <span className="text-sm">Nomes de ruas</span>
            </label>
          </div>
        )}
      </div>

      {/* Scale - Design Moderno */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center">
        <div className="flex items-center bg-white px-3 py-1.5 rounded-md shadow-md">
          <span className="text-xs font-medium text-gray-700 mr-2">100 m</span>
          <div className="h-0.5 w-16 bg-gradient-to-r from-gray-800 to-gray-400 rounded-full"></div>
        </div>
      </div>
    </>
  );
}
