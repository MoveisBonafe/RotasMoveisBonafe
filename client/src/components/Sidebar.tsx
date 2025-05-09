import { useState } from "react";
import SearchBox from "./SearchBox";
import VehicleSelector from "./VehicleSelector";
import LocationsList from "./LocationsList";
import DateRangeSelector from "./DateRangeSelector";
import { Location, VehicleType, GeocodingResult } from "@/lib/types";
import { useFileUpload } from "@/hooks/useFileUpload";

interface SidebarProps {
  origin: Location | null;
  locations: Location[];
  selectedVehicleType: string;
  onVehicleSelect: (vehicleType: VehicleType) => void;
  onSelectLocation: (location: GeocodingResult | GeocodingResult[]) => void;
  onRemoveLocation: (index: number) => void;
  onMoveLocationUp: (index: number) => void;
  onMoveLocationDown: (index: number) => void;
  onAddLocationClick: () => void;
  onCalculateRoute: () => void;
  isCalculating: boolean;
  calculatedRoute?: Location[] | null; // Adicionando propriedade para rota calculada
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
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
  isCalculating,
  calculatedRoute,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
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
    if (result && result.locations && result.locations.length > 0) {
      console.log(`Recebidos ${result.locations.length} CEPs para importar`);
      
      // Array para armazenar todos os resultados do geocoding
      const allGeocodingResults: GeocodingResult[] = [];
      
      // Primeiro, preparamos todos os resultados
      for (const loc of result.locations) {
        try {
          // Use the CEP for geocoding (in a real app)
          const geocodingResult: GeocodingResult = {
            name: loc.name,
            address: `${loc.name} - CEP: ${loc.cep}`,
            cep: loc.cep,
            // Random coordinates around Dois Córregos-SP for demo
            lat: (-22.3673 + (Math.random() * 0.05)).toString(),
            lng: (-48.3823 + (Math.random() * 0.05)).toString()
          };
          
          // Adicionamos ao array em vez de chamar onSelectLocation diretamente
          allGeocodingResults.push(geocodingResult);
          console.log(`Preparado resultado para CEP: ${loc.cep}, Nome: ${loc.name}`);
        } catch (err) {
          console.error(`Erro ao processar o CEP ${loc.cep}:`, err);
        }
      }
      
      // Passamos todos os resultados de uma vez, em vez de adicionar um a um
      if (allGeocodingResults.length > 0) {
        // Notificamos que estamos processando múltiplos CEPs
        console.log(`Processando ${allGeocodingResults.length} CEPs de uma vez`);
        onSelectLocation(allGeocodingResults);
      }
    }
  };

  return (
    <div className="w-96 bg-white shadow-md z-10 flex flex-col">
      {/* Data Range Selector - Movido para cima do campo de busca */}
      <div className="p-4 border-b border-gray-200">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>
      
      {/* Search Box */}
      <SearchBox onSelectLocation={onSelectLocation} />
      
      {/* Input Options */}
      <div className="p-4 border-b border-gray-200">
        {/* Upload e adicionar botões */}
        <div className="mb-4">
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
                  Importar CEP
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
          </div>
          
          {fileError && (
            <div className="mt-2 text-sm text-red-600">
              {fileError}
            </div>
          )}
        </div>

        {/* Vehicle Selector */}
        <VehicleSelector 
          selectedVehicleType={selectedVehicleType}
          onVehicleSelect={onVehicleSelect}
        />

        {/* Botão de calcular rota */}
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

      {/* Locations List - agora com visual aprimorado e numeração por sequência */}
      <LocationsList
        origin={origin}
        locations={locations}
        onRemoveLocation={onRemoveLocation}
        onMoveLocationUp={onMoveLocationUp}
        onMoveLocationDown={onMoveLocationDown}
        onAddLocationClick={onAddLocationClick}
        calculatedRoute={calculatedRoute}
      />
    </div>
  );
}
