import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Location, VehicleType, GeocodingResult, PointOfInterest } from "@/lib/types";
import MapView from "@/components/MapView";
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
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("car");
  const [vehicleTypeObj, setVehicleTypeObj] = useState<VehicleType | null>(null);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
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
    if (originData) {
      setOrigin(originData);
    }
  }, [originData]);
  
  // Set the vehicle type object when the selected type changes
  useEffect(() => {
    if (vehicleTypes) {
      const selectedVehicle = vehicleTypes.find(
        (vt: VehicleType) => vt.type === selectedVehicleType
      );
      if (selectedVehicle) {
        setVehicleTypeObj(selectedVehicle);
      }
    }
  }, [selectedVehicleType, vehicleTypes]);
  
  // Handle location select from search or file upload
  const handleSelectLocation = (location: GeocodingResult) => {
    const newLocation: Location = {
      id: Date.now(), // Temporary ID for client-side
      name: location.name,
      address: location.address,
      cep: location.cep,
      lat: location.lat,
      lng: location.lng,
      isOrigin: false
    };
    
    setLocations([...locations, newLocation]);
    setCalculatedRoute(null); // Reset calculated route when adding a new location
    
    toast({
      title: "Localização adicionada",
      description: location.name,
    });
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
    
    // Optimize the route locally
    const routeResult = optimizeRouteLocally(origin, locations, vehicleTypeObj, pointsOfInterest || []);
    setCalculatedRoute(routeResult.waypoints);
    setPoisOnRoute(poisAlongRoute);
    
    toast({
      title: "Rota calculada com sucesso",
      description: `${routeResult.waypoints.length - 2} paradas otimizadas`,
    });
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
      <header className="bg-white px-4 py-2 shadow z-10 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="h-10 w-10 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <h1 className="text-lg font-medium text-primary">Otimizador de Rotas</h1>
        </div>
        
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
        />
        
        {/* Map View */}
        <MapView 
          origin={origin}
          waypoints={locations}
          calculatedRoute={calculatedRoute}
          onRouteCalculated={handleRouteCalculated}
        />
      </div>
      
      {/* Route Info Panel */}
      <RouteInfoPanel
        routeInfo={routeInfo}
        vehicleType={vehicleTypeObj}
        startDate={startDate}
        endDate={endDate}
        poisAlongRoute={poisOnRoute}
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
