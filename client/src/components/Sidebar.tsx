import { useState } from "react";
import SearchBox from "./SearchBox";
import LocationsList from "./LocationsList";
import DateRangeSelector from "./DateRangeSelector";
import { Location, VehicleType, GeocodingResult } from "@/lib/types";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  origin: Location | null;
  locations: Location[];
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
  routeName?: string;
  onRouteNameChange?: (name: string) => void;
}

export default function Sidebar({
  origin,
  locations,
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
  onEndDateChange,
  routeName = "",
  onRouteNameChange = () => {}
}: SidebarProps) {
  // Hook para uploads de arquivo
  const { 
    fileInputRef, 
    triggerFileInput, 
    handleFileChange,
    isLoading: isFileLoading,
    error: fileError
  } = useFileUpload();
  
  // Hook para notificações toast
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Log e limpa mensagens de erro anteriores
    console.log("Iniciando upload de arquivo:", e.target.files?.[0]?.name);
    
    try {
      // Processa o arquivo
      const result = await handleFileChange(e);
      console.log("Resultado do processamento de arquivo:", result);
      
      // Verifica se temos localizações válidas
      if (result && result.locations && result.locations.length > 0) {
        console.log(`Recebidos ${result.locations.length} CEPs para importar`);
        
        // Array para armazenar localizações processadas
        const allGeocodingResults: GeocodingResult[] = [];
        
        // Processa cada localização retornada pelo servidor
        for (const loc of result.locations) {
          try {
            // Verifica se temos coordenadas válidas
            if (loc.lat && loc.lng) {
              // Cria um objeto de resultado geocodificado
              const geocodingResult: GeocodingResult = {
                name: loc.name,
                address: loc.address || `${loc.name} - CEP: ${loc.cep}`,
                cep: loc.cep,
                lat: loc.lat,
                lng: loc.lng
              };
              
              // Adiciona ao array de resultados
              allGeocodingResults.push(geocodingResult);
              console.log(`Processado CEP: ${loc.cep}, Nome: ${loc.name}`);
            } else {
              console.warn(`CEP ${loc.cep} sem coordenadas geográficas.`);
            }
          } catch (err) {
            console.error(`Erro ao processar o CEP ${loc.cep}:`, err);
          }
        }
        
        // Verifica se temos resultados para adicionar
        if (allGeocodingResults.length > 0) {
          console.log(`Adicionando ${allGeocodingResults.length} localizações ao mapa`);
          
          // Envia todos os resultados para serem adicionados
          onSelectLocation(allGeocodingResults);
          
          // Notifica o usuário
          toast({
            title: "Importação concluída",
            description: `${allGeocodingResults.length} localizações importadas com sucesso`,
          });
          
          // Calcular automaticamente a rota após importação
          // Esperar um pouco mais para garantir que as localizações foram processadas
          console.log("Agendando cálculo automático de rota após importação");
          
          // Usar um temporizador mais longo para garantir que todas as atualizações
          // de estado foram processadas antes de acionar o cálculo
          setTimeout(() => {
            // Verificar se ainda é relevante calcular (podem ter removido localizações, etc)
            if (allGeocodingResults.length > 0) {
              console.log("Executando cálculo automático da rota após importação de CEPs");
              onCalculateRoute();
              
              // Notificar o usuário
              toast({
                title: "Calculando rota",
                description: "Calculando a rota otimizada automaticamente",
                duration: 3000
              });
            }
          }, 2000); // Aumentar o delay para garantir que o estado foi atualizado
        } else {
          toast({
            title: "Importação falhou",
            description: "Não foi possível importar nenhuma localização válida",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Arquivo vazio",
          description: "Nenhuma localização válida encontrada no arquivo",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Erro ao processar o arquivo:", err);
      toast({
        title: "Erro ao importar CEPs",
        description: err instanceof Error ? err.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
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

        {/* Campo para nome da rota */}
        <div className="mb-4">
          <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Rota
          </label>
          <input
            id="routeName"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Entrega semanal"
            value={routeName}
            onChange={(e) => onRouteNameChange(e.target.value)}
          />
        </div>


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
      
      {/* Botão de calcular rota após a lista de destinos */}
      <div className="p-4 border-t border-gray-200">
        <button 
          className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center ${
            locations.length > 0 && !isCalculating
              ? "bg-primary text-white hover:bg-blue-600 transition"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={onCalculateRoute}
          disabled={locations.length === 0 || isCalculating}
        >
          {isCalculating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculando a melhor rota...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Calcular melhor rota
            </>
          )}
        </button>
      </div>
    </div>
  );
}
