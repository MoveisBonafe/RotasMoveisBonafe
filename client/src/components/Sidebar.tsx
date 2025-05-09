import { useState } from "react";
import SearchBox from "./SearchBox";
import VehicleSelector from "./VehicleSelector";
import LocationsList from "./LocationsList";
import QuickAddForm from "./QuickAddForm";
import { Location, VehicleType, GeocodingResult } from "@/lib/types";
import { useFileUpload } from "@/hooks/useFileUpload";

interface SidebarProps {
  origin: Location | null;
  locations: Location[];
  selectedVehicleType: string;
  onVehicleSelect: (vehicleType: VehicleType) => void;
  onSelectLocation: (location: GeocodingResult) => void;
  onRemoveLocation: (index: number) => void;
  onMoveLocationUp: (index: number) => void;
  onMoveLocationDown: (index: number) => void;
  onAddLocationClick: () => void;
  onCalculateRoute: () => void;
  isCalculating: boolean;
}

export default function Sidebar({
  origin,
  locations,
  selectedVehicleType,
  onVehicleSelect,
  onSelectLocation,
  onRemoveLocation,
  onMoveLocationUp,
  onMoveLocationDown,
  onAddLocationClick,
  onCalculateRoute,
  isCalculating
}: SidebarProps) {
  const { 
    fileInputRef, 
    triggerFileInput, 
    handleFileChange,
    isLoading: isFileLoading,
    error: fileError
  } = useFileUpload();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = await handleFileChange(e);
    if (result && result.locations) {
      // Process the parsed locations from the file
      result.locations.forEach(loc => {
        // Use the CEP for geocoding (in a real app)
        const geocodingResult: GeocodingResult = {
          name: loc.name,
          address: `${loc.name} - CEP: ${loc.cep}`,
          cep: loc.cep,
          // Random coordinates around Dois Córregos-SP for demo
          lat: (-22.3673 + (Math.random() * 0.05)).toString(),
          lng: (-48.3823 + (Math.random() * 0.05)).toString()
        };
        
        onSelectLocation(geocodingResult);
      });
    }
  };

  // Estado para mostrar destinos sugeridos
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Lista de destinos populares/sugeridos
  const suggestedDestinations = [
    { name: "Jaú", cep: "17201-970" },
    { name: "Bauru", cep: "17010-130" },
    { name: "Bariri", cep: "17250-970" },
    { name: "Barra Bonita", cep: "17340-970" },
    { name: "Ribeirão Preto", cep: "14010-000" },
    { name: "São Paulo", cep: "01001-000" }
  ];
  
  // Função para adicionar destino rápido
  const handleQuickAdd = (name: string, cep: string) => {
    // Criar um resultado simulado de geocodificação
    const geocodingResult: GeocodingResult = {
      name: name,
      address: `${name}, SP - CEP: ${cep}`,
      cep: cep,
      // Coordenadas simuladas (seria substituído por geocodificação real)
      lat: (-22.3673 + (Math.random() * 0.5)).toString(),
      lng: (-48.3823 + (Math.random() * 0.5)).toString()
    };
    
    // Usar a função de callback para adicionar o local
    onSelectLocation(geocodingResult);
  };

  return (
    <div className="w-96 bg-white shadow-md z-10 flex flex-col">
      {/* Search Box */}
      <SearchBox onSelectLocation={onSelectLocation} />
      
      {/* Input Options */}
      <div className="p-4 border-b border-gray-200">
        <div className="mb-4">
          <h2 className="text-sm font-medium mb-2">Adicionar endereços</h2>
          <div className="flex space-x-2">
            <button 
              className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={triggerFileInput}
              disabled={isFileLoading}
            >
              {isFileLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-1 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Importar
                </>
              )}
            </button>
            <input 
              type="file" 
              accept=".txt" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              className="flex-1 py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <svg className="h-4 w-4 mr-1 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Destinos rápidos
            </button>
          </div>
          
          {fileError && (
            <div className="mt-2 text-sm text-red-600">
              {fileError}
            </div>
          )}
          
          {/* Lista de destinos sugeridos e formulário rápido */}
          {showSuggestions && (
            <div className="mt-3">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Destinos populares</h3>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedDestinations.map((destination) => (
                    <button
                      key={destination.cep}
                      className="py-2 px-3 text-sm text-left text-gray-700 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                      onClick={() => handleQuickAdd(destination.name, destination.cep)}
                    >
                      <svg className="h-4 w-4 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {destination.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Formulário de adição rápida */}
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Adicionar manualmente</h3>
                <QuickAddForm onAddLocation={handleQuickAdd} />
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Selector */}
        <VehicleSelector 
          selectedVehicleType={selectedVehicleType}
          onVehicleSelect={onVehicleSelect}
        />

        <button 
          className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center ${
            locations.length > 0 && !isCalculating
              ? "bg-primary text-white hover:bg-blue-600 transition"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={onCalculateRoute}
          disabled={locations.length === 0 || isCalculating}
        >
          {isCalculating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculando...
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Calcular melhor rota
            </>
          )}
        </button>
      </div>

      {/* Locations List */}
      <LocationsList
        origin={origin}
        locations={locations}
        onRemoveLocation={onRemoveLocation}
        onMoveLocationUp={onMoveLocationUp}
        onMoveLocationDown={onMoveLocationDown}
        onAddLocationClick={onAddLocationClick}
      />
    </div>
  );
}
