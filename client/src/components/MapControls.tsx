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
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 zoom-controls flex flex-col bg-white rounded-md shadow-md overflow-hidden">
        <button 
          className="p-2 hover:bg-gray-100 focus:outline-none"
          onClick={onZoomIn}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="border-t border-gray-200"></div>
        <button 
          className="p-2 hover:bg-gray-100 focus:outline-none"
          onClick={onZoomOut}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Street View Toggle */}
      <div 
        className="absolute top-20 right-4 p-2 bg-white rounded-md shadow-md cursor-pointer hover:bg-gray-50"
        onClick={onToggleStreetView}
        title="Street View"
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Map Type Selector */}
      <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-2">
        <div className="text-sm font-medium mb-1 px-2">Camadas</div>
        <div className="flex flex-col space-y-1">
          <label className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
            <input 
              type="radio" 
              name="map-type" 
              value="roadmap" 
              checked={mapType === MAP_TYPES.ROADMAP}
              onChange={() => onChangeMapType(MAP_TYPES.ROADMAP)}
              className="mr-2" 
            />
            <span className="text-sm">Mapa</span>
          </label>
          <label className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
            <input 
              type="radio" 
              name="map-type" 
              value="satellite" 
              checked={mapType === MAP_TYPES.SATELLITE}
              onChange={() => onChangeMapType(MAP_TYPES.SATELLITE)}
              className="mr-2" 
            />
            <span className="text-sm">Satélite</span>
          </label>
          <label className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
            <input 
              type="radio" 
              name="map-type" 
              value="hybrid" 
              checked={mapType === MAP_TYPES.HYBRID}
              onChange={() => onChangeMapType(MAP_TYPES.HYBRID)}
              className="mr-2" 
            />
            <span className="text-sm">Híbrido</span>
          </label>
          <label className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
            <input 
              type="radio" 
              name="map-type" 
              value="terrain" 
              checked={mapType === MAP_TYPES.TERRAIN}
              onChange={() => onChangeMapType(MAP_TYPES.TERRAIN)}
              className="mr-2" 
            />
            <span className="text-sm">Terreno</span>
          </label>
        </div>
      </div>

      {/* Scale */}
      <div className="absolute bottom-4 right-4 flex items-center bg-white px-2 py-1 rounded-md shadow-md">
        <span className="text-xs text-gray-500 mr-1">100 m</span>
        <div className="w-16 h-1 bg-black"></div>
      </div>
    </>
  );
}
