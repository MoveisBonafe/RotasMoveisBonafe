import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Location, VehicleType, GeocodingResult, PointOfInterest } from "@/lib/types";
import MapView from "@/components/MapView";
import Sidebar from "@/components/Sidebar";
import DateRangeSelector from "@/components/DateRangeSelector";
import AddLocationModal from "@/components/AddLocationModal";
import RouteInfoPanel from "@/components/RouteInfoPanel";
import FuelSettingsDialog from "@/components/FuelSettingsDialog";
import { useRouteOptimization } from "@/hooks/useRouteOptimization";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // State for the application
  const [origin, setOrigin] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  // Definindo caminhão 1 eixo como padrão (truck-1-axle)
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("truck1");
  const [vehicleTypeObj, setVehicleTypeObj] = useState<VehicleType | null>(null);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  // Estado para o diálogo de configurações de combustível
  const [isFuelSettingsOpen, setIsFuelSettingsOpen] = useState(false);

  // Verify Google Maps initialization
  useEffect(() => {
    if (!window.google?.maps) {
      setMapError("Erro ao carregar Google Maps. Aguarde ou recarregue a página.");
      toast({
        title: "Erro ao carregar o mapa",
        description: "Recarregue a página se o problema persistir.",
        variant: "destructive",
      });
    }
  }, []);
  // Dados para filtragem por data
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [calculatedRoute, setCalculatedRoute] = useState<Location[] | null>(null);
  const [poisOnRoute, setPoisOnRoute] = useState<PointOfInterest[]>([]);
  // Estado para o nome da rota
  const [routeName, setRouteName] = useState<string>("");
  const [routeMetrics, setRouteMetrics] = useState<{totalDistance: number, totalDuration: number}>({
    totalDistance: 0,
    totalDuration: 0
  });

  const { toast } = useToast();

  // Fetch the origin (Dois Córregos) from the server
  const { data: originData, isLoading: isOriginLoading } = useQuery({
    queryKey: ['/api/origin'],
    staleTime: Infinity,
  });

  // Fetch vehicle types from the server
  const { data: vehicleTypes, isLoading: isVehicleTypesLoading } = useQuery({
    queryKey: ['/api/vehicle-types'],
    staleTime: Infinity,
  });

  // Fetch points of interest from the server
  const { data: pointsOfInterest, isLoading: isPoisLoading } = useQuery({
    queryKey: ['/api/points-of-interest'],
    staleTime: Infinity,
  });

  // Setup route optimization hook
  const { 
    routeInfo, 
    optimizeRouteLocally, 
    poisAlongRoute,
    isCalculating 
  } = useRouteOptimization();

  // Set the origin when data is loaded
  useEffect(() => {
    // Garante que originData seja um objeto válido com todas as propriedades necessárias
    if (originData && 
        typeof originData === 'object' && 
        'id' in originData && 
        'name' in originData && 
        'address' in originData &&
        'lat' in originData &&
        'lng' in originData) {
      setOrigin(originData as Location);
    }
  }, [originData]);

  // Set the vehicle type object when the selected type changes or when vehicle types are loaded
  useEffect(() => {
    // Verifica se vehicleTypes é um array válido
    if (vehicleTypes && Array.isArray(vehicleTypes) && vehicleTypes.length > 0) {
      // Busca pelo veículo selecionado atualmente
      const selectedVehicle = vehicleTypes.find(
        (vt: VehicleType) => vt.type === selectedVehicleType
      );

      if (selectedVehicle) {
        // Se encontrou o veículo, atualiza o objeto
        setVehicleTypeObj(selectedVehicle);
      } else {
        // Se não encontrou (por exemplo, na primeira carga), procura o caminhão 1 eixo
        const defaultTruck = vehicleTypes.find(
          (vt: VehicleType) => vt.type === "truck1"
        );

        if (defaultTruck) {
          // Atualiza o tipo selecionado e o objeto
          setSelectedVehicleType(defaultTruck.type);
          setVehicleTypeObj(defaultTruck);
        }
      }
    }
  }, [selectedVehicleType, vehicleTypes]);

  // Handler para adicionar localizações (de busca ou importação de arquivo)
  const handleSelectLocation = (locationOrLocations: GeocodingResult | GeocodingResult[]) => {
    try {
      // Verifica se recebemos um array de localizações (importação de arquivo)
      if (Array.isArray(locationOrLocations)) {
        console.log(`Recebido um array com ${locationOrLocations.length} localizações para adicionar`);

        if (locationOrLocations.length === 0) {
          toast({
            title: "Nenhuma localização encontrada",
            description: "O arquivo não contém localizações válidas",
            variant: "destructive",
          });
          return;
        }

        // Mostrar toast de carregamento para feedback imediato
        toast({
          title: "Processando localizações",
          description: "Adicionando pontos ao mapa...",
        });

        // Cria um timestamp base para usar nos IDs, garantindo que sejam únicos e sequenciais
        const baseTimestamp = Date.now();

        // Processa todas as localizações recebidas
        const newLocations: Location[] = locationOrLocations.map((location, index) => ({
          id: baseTimestamp + index, // Cada localização ganha um ID único e sequencial
          name: location.name,
          address: location.address,
          cep: location.cep,
          lat: location.lat,
          lng: location.lng,
          isOrigin: false
        }));
        
        // Força uma atualização completa para garantir que os marcadores sejam atualizados corretamente
        setLocations([]);

        // Adiciona as localizações diretamente sem usar setTimeout que pode causar problemas
        const updatedLocations = [...locations, ...newLocations];
        setLocations(updatedLocations);
        setCalculatedRoute(null); // Reset da rota calculada ao adicionar novas localizações

        console.log(`Adicionadas ${newLocations.length} localizações. Total: ${updatedLocations.length}`, newLocations);

        // Notifica o usuário do sucesso
        toast({
          title: "Localizações adicionadas",
          description: `${newLocations.length} CEPs importados com sucesso`,
        });
        
        // Agenda o cálculo automático da rota após a importação
        if (updatedLocations.length > 0) {
          console.log("Agendando cálculo automático de rota após importação");
          // Esperar um pouco para os pontos serem atualizados corretamente no mapa
          setTimeout(() => {
            console.log("Executando cálculo automático da rota após importação de CEPs");
            handleCalculateRoute();
          }, 2000);
        }
      } else {
        // Processamento de uma única localização (busca individual)
        console.log("Adicionando localização individual:", locationOrLocations);

        // Verifica se recebemos dados válidos
        if (!locationOrLocations.name || !locationOrLocations.lat || !locationOrLocations.lng) {
          console.error("Dados de localização inválidos:", locationOrLocations);

          toast({
            title: "Erro ao adicionar localização",
            description: "Os dados da localização são inválidos ou incompletos",
            variant: "destructive",
          });

          return;
        }

        // Cria um novo objeto de localização
        const newLocation: Location = {
          id: Date.now(), // ID com timestamp atual
          name: locationOrLocations.name,
          address: locationOrLocations.address,
          cep: locationOrLocations.cep,
          lat: locationOrLocations.lat,
          lng: locationOrLocations.lng,
          isOrigin: false
        };

        // Adiciona à lista de localizações
        const updatedLocations = [...locations, newLocation];
        setLocations(updatedLocations);
        setCalculatedRoute(null); // Reset calculated route when adding a new location

        console.log("Localização adicionada:", newLocation);

        // Notifica o usuário
        toast({
          title: "Localização adicionada",
          description: locationOrLocations.name,
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar localização(ões):", error);
      toast({
        title: "Erro ao adicionar localização",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle location removal
  const handleRemoveLocation = (index: number) => {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
    setCalculatedRoute(null);
  };

  // Handle moving a location up in the list
  const handleMoveLocationUp = (index: number) => {
    if (index === 0) return;
    const newLocations = [...locations];
    const temp = newLocations[index];
    newLocations[index] = newLocations[index - 1];
    newLocations[index - 1] = temp;
    setLocations(newLocations);
    setCalculatedRoute(null);
  };

  // Handle moving a location down in the list
  const handleMoveLocationDown = (index: number) => {
    if (index === locations.length - 1) return;
    const newLocations = [...locations];
    const temp = newLocations[index];
    newLocations[index] = newLocations[index + 1];
    newLocations[index + 1] = temp;
    setLocations(newLocations);
    setCalculatedRoute(null);
  };

  // Handle opening fuel settings dialog
  const handleOpenFuelSettings = () => {
    setIsFuelSettingsOpen(true);
  };

  // Update vehicle fuel efficiency
  const handleUpdateVehicleEfficiency = (vehicleType: VehicleType, newEfficiency: number) => {
    if (!vehicleTypes || !Array.isArray(vehicleTypes)) return;

    // Create a copy of the vehicle types array
    const updatedVehicleTypes = vehicleTypes.map((vt: VehicleType) => {
      if (vt.id === vehicleType.id) {
        // Update the fuel efficiency for the specified vehicle
        return { ...vt, fuelEfficiency: newEfficiency };
      }
      return vt;
    });

    // Update the vehicle type object if currently selected
    if (vehicleTypeObj && vehicleTypeObj.id === vehicleType.id) {
      setVehicleTypeObj({ ...vehicleTypeObj, fuelEfficiency: newEfficiency });
    }

    // Recalculate the route if needed
    if (calculatedRoute && calculatedRoute.length > 0) {
      setCalculatedRoute(null);
      setTimeout(() => handleCalculateRoute(), 100);
    }

    toast({
      title: "Configurações atualizadas",
      description: "Os novos valores serão usados para os cálculos de rota.",
    });
  };

  // Callback para processar os dados de rota retornados pelo Google Maps API
  const handleRouteCalculated = (routeResponse: any) => {
    console.log("Rota calculada pelo Google Maps, processando resposta:", routeResponse);

    // Extrair a distância total e duração da rota a partir da resposta do Google Maps
    if (routeResponse && routeResponse.routes && routeResponse.routes.length > 0) {
      // A resposta contém dados úteis que podemos usar para mostrar informações adicionais
      console.log("Rota contém pedágios:", routeResponse.routes[0].legs.some((leg: any) => leg.toll_info));

      // Extrair distância e duração total da rota
      let totalDistance = 0;
      let totalDuration = 0;

      routeResponse.routes[0].legs.forEach((leg: any) => {
        if (leg.distance && leg.distance.value) {
          totalDistance += leg.distance.value; // em metros
        }
        if (leg.duration && leg.duration.value) {
          totalDuration += leg.duration.value; // em segundos
        }
      });

      console.log(`Distância real da rota: ${totalDistance}m, Duração: ${totalDuration}s`);

      // Atualizar o estado com os valores reais
      setRouteMetrics({
        totalDistance,
        totalDuration
      });
    }
  };

  // Handle calculate route button click
  const handleCalculateRoute = () => {
    if (!origin || locations.length === 0) {
      toast({
        title: "Não é possível calcular a rota",
        description: "Selecione pelo menos um destino para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    // Garantir que um tipo de veículo padrão (caminhão 1 eixo) seja sempre usado
    if (!vehicleTypeObj && vehicleTypes && Array.isArray(vehicleTypes) && vehicleTypes.length > 0) {
      // Selecionar automaticamente o primeiro caminhão
      const defaultTruck = vehicleTypes.find((vt: VehicleType) => vt.type === "truck1") || vehicleTypes[0];
      setVehicleTypeObj(defaultTruck);
    }

    // Mostrar toast de carregamento para feedback imediato
    toast({
      title: "Calculando rota otimizada",
      description: "Por favor, aguarde enquanto calculamos a melhor rota...",
    });

    // Garante que pointsOfInterest seja um array válido
    const pois = Array.isArray(pointsOfInterest) ? pointsOfInterest : [];

    // Verificar os dados recebidos da API
    console.log("Dados de POI recebidos da API:", pointsOfInterest);
    console.log("POIs processados para a rota:", pois);

    // Adicionar um pequeno atraso para simular o processamento e mostrar o efeito visual
    setTimeout(() => {
      try {
        // Usar as métricas reais da rota (distância e duração) obtidas do Google Maps
        console.log("Usando métricas reais da rota:", routeMetrics);

        // Optimize the route locally com os valores reais de distância e duração
        // Garantir que temos um tipo de veículo mesmo que seja null
        const safeVehicleTypeObj = vehicleTypeObj || {
          id: 1,
          name: "Caminhão 1 eixo",
          type: "truck1",
          fuelEfficiency: 3.5,
          tollMultiplier: 1.0,
          fuelCostPerLiter: 5.0
        };
        
        const routeResult = optimizeRouteLocally(
          origin, 
          locations, 
          safeVehicleTypeObj, 
          pois, 
          routeMetrics.totalDistance > 0 ? routeMetrics : undefined // Usar métricas reais se disponíveis
        );

        setCalculatedRoute(routeResult.waypoints);

        // SOLUÇÃO APRIMORADA:
        // Vamos detectar a rota e mostrar apenas os POIs realmente relevantes

        // 1. Detectar cidades importantes na rota para determinar quais rodovias são relevantes
        const includesDoisCorregosOrigin = origin && origin.name && origin.name.toLowerCase().includes('dois córregos');

        const includesRibeiraoPreto = locations.some(loc => 
            (loc.name && (
                loc.name.toLowerCase().includes('pedro') || 
                loc.name.toLowerCase().includes('ribeir')
            )) || 
            (loc.address && loc.address.toLowerCase().includes('ribeir'))
        );

        // Verificar se estamos na rota especial Dois Córregos -> Ribeirão Preto
        const isSpecialRoute = includesDoisCorregosOrigin && includesRibeiraoPreto;

        if (isSpecialRoute) {
            console.log("ROTA ESPECIAL DETECTADA: Dois Córregos -> Ribeirão Preto");
            console.log("Incluindo todos os pedágios e balanças relevantes para esta rota");
        }

        // 2. Forçar a limpeza dos POIs antes de calcular os novos
        setPoisOnRoute([]);

        // 3. Filtrar os POIs com base nas rodovias relevantes
        if (pois.length > 0) {
            let relevantPOIs = [];

            if (isSpecialRoute) {
                // Para a rota Dois Córregos -> Ribeirão Preto, 
                // mostrar apenas os pedágios das rodovias SP-225 e SP-255
                relevantPOIs = pois.filter(poi => {
                    const isRelevant = poi.roadName && 
                        (poi.roadName.includes("SP-225") || poi.roadName.includes("SP-255"));

                    console.log(`POI ${poi.name}: ${isRelevant ? "INCLUÍDO (rodovia relevante)" : "EXCLUÍDO (rodovia não relevante)"}`);
                    return isRelevant;
                });
            } else {
                // Para outras rotas, mostrar todos os POIs (pedágios e balanças)
                relevantPOIs = [...pois];
                console.log("Rota padrão: incluindo todos os pontos de interesse disponíveis");
            }

            console.log(`Total de POIs filtrados para a rota: ${relevantPOIs.length} de ${pois.length}`);
            console.log("POIs relevantes para a rota:", relevantPOIs);

            // 4. Atualizar a lista de POIs filtrados
            setPoisOnRoute(relevantPOIs);
        }

        // Mostrar toast de sucesso com a distância real
        const distanciaEmKm = Math.round(routeMetrics.totalDistance / 100) / 10;
        toast({
          title: "Rota calculada com sucesso",
          description: `${locations.length} paradas (${distanciaEmKm}km total)`,
        });

        console.log(`Rota calculada com sucesso: ${routeResult.waypoints.length} pontos totais, distância: ${distanciaEmKm}km`);
      } catch (error) {
        console.error("Erro ao calcular rota:", error);

        // Exibir mensagem de erro
        toast({
          title: "Erro ao calcular rota",
          description: "Ocorreu um erro ao calcular a rota otimizada",
          variant: "destructive",
        });
      }
    }, 800); // Delay para um efeito visual melhor
  };

  // Função antiga substituída pela implementação acima

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white px-4 py-3 shadow-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-10 w-10 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-blue-700">Otimizador de Rotas</h1>
              <p className="text-xs text-gray-500">Planejamento de entregas a partir de Dois Córregos-SP</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar com lista de destinos e numeração sequencial */}
        <Sidebar
          origin={origin}
          locations={locations}
          onSelectLocation={handleSelectLocation}
          onRemoveLocation={handleRemoveLocation}
          onMoveLocationUp={handleMoveLocationUp}
          onMoveLocationDown={handleMoveLocationDown}
          onAddLocationClick={() => setIsAddLocationModalOpen(true)}
          onCalculateRoute={handleCalculateRoute}
          isCalculating={isCalculating}
          calculatedRoute={calculatedRoute}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {/* Área principal com o mapa */}
        <div className="flex flex-col flex-1">
          {/* Status do carregamento */}
          {(isOriginLoading || isVehicleTypesLoading || isPoisLoading) && (
            <div className="bg-blue-50 text-blue-700 px-4 py-2 text-sm flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Carregando dados...
            </div>
          )}

          {mapError ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-4">
                <p className="text-red-600 mb-2">{mapError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Recarregar página
                </button>
              </div>
            </div>
          ) : (
            <MapView 
              key={`map-${locations.length}-${Date.now()}`} // Força recriação do componente após importação
              origin={origin}
              waypoints={locations}
              calculatedRoute={calculatedRoute}
              onRouteCalculated={handleRouteCalculated}
              pointsOfInterest={poisOnRoute}
            />
          )}

          {/* Removidos logs de debug que não eram mais necessários */}
        </div>
      </div>

      {/* Route Info Panel */}
      <RouteInfoPanel
        routeInfo={routeInfo}
        vehicleType={vehicleTypeObj}
        startDate={startDate}
        endDate={endDate}
        poisAlongRoute={poisOnRoute}
        origin={origin}
        calculatedRoute={calculatedRoute}
        routeName={routeName}
        onRouteNameChange={setRouteName}
      />

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        onAddLocation={handleSelectLocation}
      />

      {/* Fuel Settings Dialog */}
      <FuelSettingsDialog
        open={isFuelSettingsOpen}
        onOpenChange={setIsFuelSettingsOpen}
        selectedVehicleType={vehicleTypeObj}
        onVehicleEfficiencyChange={handleUpdateVehicleEfficiency}
        onSettingsChanged={() => {
          // Recalcular rota se necessário
          if (calculatedRoute && calculatedRoute.length > 0) {
            handleCalculateRoute();
          }
        }}
      />

<button 
            className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center ${
              locations.length > 0 && !isCalculating
                ? "bg-primary text-white hover:bg-blue-600 transition"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleCalculateRoute}
            disabled={locations.length === 0 || isCalculating}
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculando melhor rota...
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
  );
}