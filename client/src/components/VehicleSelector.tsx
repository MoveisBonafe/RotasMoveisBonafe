import { VehicleType } from "@/lib/types";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface VehicleSelectorProps {
  selectedVehicleType: string;
  onVehicleSelect: (vehicleType: VehicleType) => void;
}

export default function VehicleSelector({ selectedVehicleType, onVehicleSelect }: VehicleSelectorProps) {
  // Fetch vehicle types from the server
  const { data: vehicleTypes, isLoading } = useQuery({
    queryKey: ['/api/vehicle-types'],
    staleTime: Infinity,
  });

  const handleSelectVehicle = (vehicle: VehicleType) => {
    onVehicleSelect(vehicle);
  };

  // Fallback vehicle types if the API hasn't loaded yet
  const defaultVehicleTypes: VehicleType[] = [
    { id: 1, name: "Carro", type: "car", fuelEfficiency: 116, tollMultiplier: 100 },
    { id: 2, name: "Moto", type: "motorcycle", fuelEfficiency: 250, tollMultiplier: 50 },
    { id: 3, name: "Caminhão 1 eixo", type: "truck1", fuelEfficiency: 60, tollMultiplier: 200 },
    { id: 4, name: "Caminhão 2 eixos", type: "truck2", fuelEfficiency: 40, tollMultiplier: 300 }
  ];

  const vehiclesToDisplay = vehicleTypes || defaultVehicleTypes;

  // Icons for the different vehicle types
  const vehicleIcons = {
    car: "https://img.icons8.com/ios-filled/50/000000/car.png",
    motorcycle: "https://img.icons8.com/ios-filled/50/000000/motorcycle.png",
    truck1: "https://img.icons8.com/ios-filled/50/000000/truck.png",
    truck2: "https://img.icons8.com/ios-filled/50/000000/truck-weight.png"
  };

  return (
    <div className="mb-4">
      <h2 className="text-sm font-medium mb-2">Tipo de veículo</h2>
      <div className="grid grid-cols-2 gap-2">
        {vehiclesToDisplay.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`vehicle-option border rounded-md p-2 cursor-pointer hover:bg-gray-50 transition flex flex-col items-center ${
              selectedVehicleType === vehicle.type ? "bg-blue-50 border-primary" : ""
            }`}
            onClick={() => handleSelectVehicle(vehicle)}
          >
            <img 
              src={vehicleIcons[vehicle.type as keyof typeof vehicleIcons]} 
              alt={vehicle.name} 
              className="h-8 w-8 mb-1"
            />
            <span className="text-xs">{vehicle.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
