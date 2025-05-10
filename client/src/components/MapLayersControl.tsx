import { useState, useEffect } from 'react';

interface MapLayersControlProps {
  map: google.maps.Map | null;
}

const MAP_TYPES = {
  ROADMAP: "roadmap",
  SATELLITE: "satellite",
  HYBRID: "hybrid",
  TERRAIN: "terrain"
};

export default function MapLayersControl({ map }: MapLayersControlProps) {
  const [currentMapType, setCurrentMapType] = useState(MAP_TYPES.ROADMAP);
  const [showLabels, setShowLabels] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Atualizar o tipo de mapa quando o estado mudar
  useEffect(() => {
    if (map) {
      if (currentMapType === MAP_TYPES.SATELLITE && !showLabels) {
        map.setMapTypeId(MAP_TYPES.SATELLITE);
      } else if (currentMapType === MAP_TYPES.SATELLITE && showLabels) {
        map.setMapTypeId(MAP_TYPES.HYBRID);
      } else {
        map.setMapTypeId(currentMapType);
      }
    }
  }, [map, currentMapType, showLabels]);

  return (
    <div className="absolute bottom-6 left-6 z-50" style={{ pointerEvents: 'auto' }}>
      {/* Botão principal de camadas */}
      <div 
        className="bg-white rounded-md shadow-md p-3 cursor-pointer flex items-center hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
        style={{ border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>

      {/* Menu de opções */}
      {isOpen && (
        <div className="absolute left-0 bottom-16 bg-white rounded shadow-lg overflow-hidden w-56" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-gray-700 font-medium text-sm">Estilo do Mapa</h3>
          </div>

          {/* Opção de Mapa Padrão */}
          <div 
            className={`p-3 flex items-center cursor-pointer hover:bg-gray-100 ${currentMapType === MAP_TYPES.ROADMAP ? 'bg-blue-50' : ''}`}
            onClick={() => {
              setCurrentMapType(MAP_TYPES.ROADMAP);
              setIsOpen(false);
            }}
          >
            <div className="w-6 h-6 mr-3 rounded border border-gray-300 overflow-hidden bg-blue-100">
              <div className="w-full h-1/2 bg-blue-200"></div>
              <div className="w-full h-1/2 bg-green-200"></div>
            </div>
            <span className={`text-sm ${currentMapType === MAP_TYPES.ROADMAP ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
              Padrão
            </span>
            {currentMapType === MAP_TYPES.ROADMAP && (
              <svg className="h-5 w-5 ml-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Opção de Satélite */}
          <div 
            className={`p-3 flex items-center cursor-pointer hover:bg-gray-100 ${currentMapType === MAP_TYPES.SATELLITE ? 'bg-blue-50' : ''}`}
            onClick={() => {
              setCurrentMapType(MAP_TYPES.SATELLITE);
              setIsOpen(false);
            }}
          >
            <div className="w-6 h-6 mr-3 rounded border border-gray-300 overflow-hidden bg-gray-800">
              <div className="w-full h-full bg-cover bg-center opacity-70" style={{background: "linear-gradient(45deg, #2c3e50, #4a5568)"}}></div>
            </div>
            <span className={`text-sm ${currentMapType === MAP_TYPES.SATELLITE ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
              Satélite
            </span>
            {currentMapType === MAP_TYPES.SATELLITE && (
              <svg className="h-5 w-5 ml-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Opção de Terreno */}
          <div 
            className={`p-3 flex items-center cursor-pointer hover:bg-gray-100 ${currentMapType === MAP_TYPES.TERRAIN ? 'bg-blue-50' : ''}`}
            onClick={() => {
              setCurrentMapType(MAP_TYPES.TERRAIN);
              setIsOpen(false);
            }}
          >
            <div className="w-6 h-6 mr-3 rounded border border-gray-300 overflow-hidden">
              <div className="w-full h-1/2 bg-green-300"></div>
              <div className="w-full h-1/2 bg-yellow-200"></div>
            </div>
            <span className={`text-sm ${currentMapType === MAP_TYPES.TERRAIN ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
              Terreno
            </span>
            {currentMapType === MAP_TYPES.TERRAIN && (
              <svg className="h-5 w-5 ml-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Opção de Labels para o modo satélite */}
          {currentMapType === MAP_TYPES.SATELLITE && (
            <div className="p-3 border-t border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-700">Mostrar nomes de ruas</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}