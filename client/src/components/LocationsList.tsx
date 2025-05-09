import { Location } from "@/lib/types";

interface LocationsListProps {
  origin: Location | null;
  locations: Location[];
  onRemoveLocation: (index: number) => void;
  onMoveLocationUp: (index: number) => void;
  onMoveLocationDown: (index: number) => void;
  onAddLocationClick: () => void;
}

export default function LocationsList({
  origin,
  locations,
  onRemoveLocation,
  onMoveLocationUp,
  onMoveLocationDown,
  onAddLocationClick
}: LocationsListProps) {
  return (
    <div className="flex-grow overflow-auto custom-scrollbar p-4">
      <h2 className="text-sm font-medium mb-2">Locais selecionados</h2>
      
      {/* Origin (Dois Córregos) */}
      {origin && (
        <div className="border rounded-md mb-2 bg-blue-50 p-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-primary mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium">Ponto de origem</h3>
                <p className="text-xs text-gray-600">{origin.name}</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Selected locations */}
      {locations.map((location, index) => (
        <div key={location.id || index} className="border rounded-md mb-2 p-3 hover:shadow-sm transition">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold mr-2 mt-0.5">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-medium">{location.name}</h3>
                <p className="text-xs text-gray-600">
                  {location.cep ? `CEP: ${location.cep}` : location.address}
                </p>
              </div>
            </div>
            <div className="flex">
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => onMoveLocationUp(index)}
                disabled={index === 0}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                className="text-gray-400 hover:text-gray-600 ml-1"
                onClick={() => onMoveLocationDown(index)}
                disabled={index === locations.length - 1}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                className="text-gray-400 hover:text-red-600 ml-1"
                onClick={() => onRemoveLocation(index)}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add location button */}
      <div 
        className="border border-dashed rounded-md p-3 flex justify-center items-center cursor-pointer hover:bg-gray-50 transition"
        onClick={onAddLocationClick}
      >
        <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm text-gray-500">Adicionar endereço</span>
      </div>
    </div>
  );
}
