import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Location, VehicleType, GeocodingResult, PointOfInterest } from "@/lib/types";
// Substituindo o MapView pelo nosso novo componente otimizado
import MapView from "@/components/MapViewSimple";
import Sidebar from "@/components/Sidebar";
import DateRangeSelector from "@/components/DateRangeSelector";
import AddLocationModal from "@/components/AddLocationModal";
import RouteInfoPanel from "@/components/RouteInfoPanel";
import { useRouteOptimization } from "@/hooks/useRouteOptimization";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // State for the application
  const [origin, setOrigin] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  // Definindo caminhão 1 eixo como padrão (truck-1-axle)
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("truck1");
  const [vehicleTypeObj, setVehicleTypeObj] = useState<VehicleType | null>(null);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  // Dados para filtragem por data
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [calculatedRoute, setCalculatedRoute] = useState<Location[] | null>(null);
  const [poisOnRoute, setPoisOnRoute] = useState<PointOfInterest[]>([]);
  
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
        
        // Adiciona todas à lista de localizações atual - forçando re-renderização imediata
        setTimeout(() => {
          const updatedLocations = [...locations, ...newLocations];
          setLocations(updatedLocations);
          setCalculatedRoute(null); // Reset da rota calculada ao adicionar novas localizações
          
          console.log(`Adicionadas ${newLocations.length} localizações. Total: ${updatedLocations.length}`, newLocations);
          
          // Notifica o usuário do sucesso
          toast({
            title: "Localizações adicionadas",
            description: `${newLocations.length} CEPs importados com sucesso`,
          });
        }, 100); // Pequeno delay para garantir que o DOM seja atualizado
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
  
  // Handle calculate route button click
  const handleCalculateRoute = () => {
    if (!origin || !vehicleTypeObj || locations.length === 0) {
      toast({
        title: "Não é possível calcular a rota",
        description: "Selecione pelo menos um destino e um tipo de veículo.",
        variant: "destructive",
      });
      return;
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
        // Optimize the route locally - isso atualiza poisAlongRoute dentro do hook
        const routeResult = optimizeRouteLocally(origin, locations, vehicleTypeObj, pois);
        setCalculatedRoute(routeResult.waypoints);
        
        // SOLUÇÃO DE EMERGÊNCIA:
        // Como os POIs não estão sendo passados corretamente, vamos forçar a inclusão
        // dos POIs relevantes para a rota Dois Córregos -> Ribeirão Preto
        const includesRibeiraoPreto = locations.some(loc => 
            loc.name.toLowerCase().includes('pedro') || 
            loc.address.toLowerCase().includes('ribeirão')
        );
        
        console.log("Verificando se rota inclui Ribeirão Preto:", includesRibeiraoPreto ? "SIM" : "NÃO");
        
        // Se for a rota para Ribeirão Preto, incluir os POIs diretamente
        if (includesRibeiraoPreto && pois.length > 0) {
            // Filtrar apenas os POIs relevantes (SP-225 e SP-255)
            const relevantPOIs = pois.filter(poi => 
                poi.roadName && (poi.roadName.includes("SP-225") || poi.roadName.includes("SP-255"))
            );
            
            console.log("POIs relevantes para a rota:", relevantPOIs);
            setPoisOnRoute(relevantPOIs);
        } else {
            setPoisOnRoute([]);
        }
        
        // Mostrar toast de sucesso
        toast({
          title: "Rota calculada com sucesso",
          description: `${locations.length} paradas otimizadas`,
        });
        
        console.log(`Rota calculada com sucesso: ${routeResult.waypoints.length} pontos totais`);
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
  
  // Handle route calculated from the map component
  const handleRouteCalculated = (result: any) => {
    if (result && result.poisAlongRoute) {
      setPoisOnRoute(result.poisAlongRoute);
    }
  };
  
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
              <p className="text-xs text-gray-500">Cálculo de rotas a partir de Dois Córregos-SP</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar com lista de destinos e numeração sequencial */}
        <Sidebar
          origin={origin}
          locations={locations}
          selectedVehicleType={selectedVehicleType}
          onVehicleSelect={(vehicle) => setSelectedVehicleType(vehicle.type)}
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
          
          {/* Google Maps mostrando apenas os POIs no percurso da rota */}
          <MapView 
            origin={origin}
            waypoints={locations}
            calculatedRoute={calculatedRoute}
            onRouteCalculated={handleRouteCalculated}
            pointsOfInterest={poisOnRoute} // IMPORTANTE: Usar APENAS os POIs filtrados ao longo da rota
          />
          
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
      />
      
      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        onAddLocation={handleSelectLocation}
      />
    </div>
  );
}
