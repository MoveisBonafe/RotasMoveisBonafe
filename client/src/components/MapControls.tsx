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

      {/* Minimapa Widget para seleção de tipo de mapa */}
      <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md overflow-hidden">
        <div className="flex flex-col">
          {/* Miniatura do mapa - ícone do minimapa */}
          <div className="relative w-32 h-24 border-b border-gray-200">
            {/* Preview do tipo de mapa atual */}
            <div 
              className={`absolute inset-0 bg-cover bg-center`}
              style={{
                backgroundImage: mapType === MAP_TYPES.ROADMAP 
                  ? "url('data:image/jpeg;base64,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')" 
                  : "url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyAEADASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUDBAYCB//EADIQAAEDAwIEBAMHBQAAAAAAAAECAwQABREhMQYSQVETImFxFIHwFTJCkaGxwQcjUnLh/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAIDAQT/xAAfEQACAgMAAwEBAAAAAAAAAAAAAQIRAxIhMUFRYRP/2gAMAwEAAhEDEQA/APrL4SPj+634edO9MGm9hsMeMkOuJDjh3Jqja/7sBrrgACrKNABSzm5cLLCoiRHXYj4djspKtCQDgmkUiQUkgimjxygjNJX8LUr1NVXOx5FEpxAK1HzGrPDrXMsqAxqaWPODmODqKf8ADifIojcVLK9UdnClWpE9pbOXE60t+yY0y6MRlrwHAM59jVuS+lpsuKUABuSdKoR77GkKUhoknTJGMVxVbVl/ZAD3iLxtupJ8qSc5Oc9q+g4mCgE1hbVwizIuxukxK0PLKW2C4ArzHIxk7DGcmtza3A5GbVgg6b9axyo58mKUpVsVYhgLt0lA1AB/Y1UW4QodqslnD7nugnNVJK2w34KufA0xvVIK0ZdZ2Hih9a2lKIOVqSk4+eKfcF3CzuLfjvJejuLA5VJaKmFE7jPQ+lJr68i8tIfbdbT+FXMUuJGgOQRnGhBpZao6oFxc5mXwjnKgVL1znGSPMdQN99tK0mTbZdrHCvNldZnxGpLRJSpSAcj1B3B7g5plw5ELMRZWeZS1FRx0AwBSLiP4e2uPCSgx3FJXyrTqgnvjUj16Uzcey2kJIUcDFLNbO/wqlUaETCGgACelFS+0ZUu3suuKUtfNuk6lI3P5DFFQaE0QtHmCdqoS/vpJ3qUOciiSdQRVeQvKdNDXJVHnKioWFhfhdW8RnYHcZ96qXFxoXKI2h9sqcJ5G1q5ebIJwPn0q3JSVrOMnl0HfrUt3scZm3NfYkvxDGdU4UIZ8j6QoBW2xOc4O4wDpmi7NjCmCLHFl2Fw/ELktuJJDZG/qD6VFcbO7eLOuK0+rmdTykH8QOiknsdPY1FcLi3aGkquXEMaCylvyoS40ASOhPXOQdhSDiD+ocyxLRbmlwbtLcHIlSiWkJ6Zzt8ifYimUKdFviCXxBHDcxJcuLIBCHCcoURuFdFZxjtUce0i93hNymA/Dx84YOziujh/gdPnXmTOQhwOvqLji2kr+7klR8pONtQO3v3raQ5TWAhSgBgDU7VrTqqHdx5R6E52QrA8QEgdBtRUSuUkYGg9qKVQQr2MCYEsKSvU43plCHK0n5UUVRrqHg/JJcB5QmqyvKg57UUVwZ/vGaWmQORg4QCm3tcyxkjLqzqSdST3JPWqapXiPL5sYQOUexoopyKjtD4flIOVKCew3opVcL3FgHlcVzL/wAU6n5nsKyjkPpEqLbB/wA2JQU8sfd1IBPrjT51EbmzIMZ5S86jmQdcY+uteI162SrQfMU/iHtRTqIKY8j3jxG0tjTAzzHrRRRTaImf/9k=')"
              }}
            >
              {/* Layer do tipo de mapa atual */}
            </div>
            
            {/* Ícone do minimapa */}
            <div className="absolute top-0 right-0 m-1 bg-white rounded p-0.5 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
          
          {/* Opções de tipo de mapa */}
          <div className="flex">
            <button 
              className={`flex-1 py-2 px-4 text-xs ${mapType === MAP_TYPES.ROADMAP ? 'bg-blue-50 text-blue-600 font-semibold' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => onChangeMapType(MAP_TYPES.ROADMAP)}
            >
              Mapa
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-xs ${mapType === MAP_TYPES.SATELLITE ? 'bg-blue-50 text-blue-600 font-semibold' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => onChangeMapType(MAP_TYPES.SATELLITE)}
            >
              Satélite
            </button>
          </div>
          
          {/* Camadas adicionais - opções expandíveis */}
          <div className="overflow-hidden">
            <button 
              className={`w-full py-2 px-4 text-xs text-left ${mapType === MAP_TYPES.HYBRID ? 'bg-blue-50 text-blue-600 font-semibold' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => onChangeMapType(MAP_TYPES.HYBRID)}
            >
              Híbrido
            </button>
            <button 
              className={`w-full py-2 px-4 text-xs text-left ${mapType === MAP_TYPES.TERRAIN ? 'bg-blue-50 text-blue-600 font-semibold' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => onChangeMapType(MAP_TYPES.TERRAIN)}
            >
              Terreno
            </button>
          </div>
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
