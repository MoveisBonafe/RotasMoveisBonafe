import { useState } from "react";
import { VehicleType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface VehicleSelectorProps {
  selectedVehicleType: string;
  onVehicleSelect: (vehicleType: VehicleType) => void;
}

export default function VehicleSelector({ selectedVehicleType, onVehicleSelect }: VehicleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Buscar todos os tipos de veículos disponíveis
  const { data: vehicleTypes = [] as VehicleType[] } = useQuery<VehicleType[]>({
    queryKey: ['/api/vehicle-types'],
    staleTime: Infinity,
  });
  
  // Obter o veículo atualmente selecionado
  const selectedVehicle = vehicleTypes.find(
    (vehicle) => vehicle.type === selectedVehicleType
  );
  
  // Função para obter o ícone do veículo com base no tipo
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
          </svg>
        );
      case 'motorcycle':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.44 9.03 15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h1.65l2.77-2.77c-.21.54-.32 1.14-.32 1.77 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.65-1.97-4.77-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.63 0-3-1.37-3-3s1.37-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zM19 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
          </svg>
        );
      case 'truck-1-axle':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM6 18.5c.83 0 1.5-.67 1.5-1.5S6.83 15.5 6 15.5 4.5 16.17 4.5 17s.67 1.5 1.5 1.5zM20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 19.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V11h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        );
      case 'truck-2-axle':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h8c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5 1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
          </svg>
        );
    }
  };
  
  const handleSelectVehicle = (vehicle: VehicleType) => {
    onVehicleSelect(vehicle);
    setIsOpen(false);
  };
  
  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between items-center">
        <label className="block text-xs font-medium text-gray-700">Tipo de veículo</label>
        <div className="text-xs text-gray-500">
          {selectedVehicle?.name || 'Selecione um veículo'}
        </div>
      </div>
      
      <div className="relative">
        <button
          type="button"
          className="bg-white border border-gray-300 rounded-md w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">
              {selectedVehicle ? getVehicleIcon(selectedVehicle.type) : 'Selecione'}
            </span>
            <span>{selectedVehicle?.name || 'Selecione um veículo'}</span>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        {/* Dropdown */}
        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {vehicleTypes.map((vehicle) => (
              <li
                key={vehicle.id}
                className={`cursor-pointer select-none relative py-1 pl-3 pr-9 hover:bg-blue-50 ${
                  vehicle.type === selectedVehicleType ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectVehicle(vehicle)}
              >
                <div className="flex items-center">
                  <span className="text-gray-600 mr-3">
                    {getVehicleIcon(vehicle.type)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{vehicle.name}</span>
                    <span className="text-xs text-gray-500">
                      {vehicle.type === 'car' && 'Automóvel comum'}
                      {vehicle.type === 'motorcycle' && 'Motocicleta'}
                      {vehicle.type === 'truck-1-axle' && 'Caminhão de 1 eixo'}
                      {vehicle.type === 'truck-2-axle' && 'Caminhão de 2 eixos'}
                      {vehicle.type === 'truck1' && 'Caminhão de 1 eixo (Compatibilidade)'}
                      {vehicle.type === 'truck2' && 'Caminhão de 2 eixos (Compatibilidade)'}
                    </span>
                  </div>
                </div>
                
                {/* Check icon para o item selecionado */}
                {vehicle.type === selectedVehicleType && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}