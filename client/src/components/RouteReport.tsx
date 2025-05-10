import React, { useRef } from 'react';
import { Location, PointOfInterest, CityEvent, TruckRestriction } from '@/lib/types';
import { formatDistance, formatDuration, formatCurrency } from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface RouteReportProps {
  origin: Location | null;
  calculatedRoute: Location[] | null;
  routeInfo: {
    totalDistance: number;
    totalDuration: number;
    tollCost: number;
    fuelCost: number;
    totalCost: number;
    fuelConsumption: number;
  } | null;
  vehicleType: {
    id?: number;
    name: string;
    type: string;
    fuelEfficiency: number;
    tollMultiplier: number;
    fuelCostPerLiter?: number;
  } | null;
  startDate: string | null;
  endDate: string | null;
}

export default function RouteReport({
  origin,
  calculatedRoute,
  routeInfo,
  vehicleType,
  startDate,
  endDate
}: RouteReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Extrair cidades dos destinos para consultas
  const destinationCityNames = calculatedRoute 
    ? calculatedRoute.map(location => {
        // Tenta extrair o nome da cidade do endereço (os padrões de endereço no Brasil geralmente têm a cidade antes do estado)
        if (location.address) {
          const parts = location.address.split(',');
          
          // Procurar cidade antes do estado (SP, MG, RJ, etc.)
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            // Se encontramos um padrão que parece um estado brasileiro (2 letras maiúsculas)
            if (/[A-Z]{2}/.test(part)) {
              // A cidade geralmente está antes do estado
              if (i > 0) {
                return parts[i-1].trim();
              }
            }
          }
          
          // Se não encontrar padrão de estado, use a primeira parte como default
          if (parts.length > 0) {
            return parts[0].trim();
          }
        }
        
        // Se tudo mais falhar, usa o nome do local
        return location.name;
      }).filter(Boolean) as string[]
    : [];
    
  // Adicionando manualmente Dois Córregos, Ribeirão Preto e Jaú para testes
  if (!destinationCityNames.includes("Dois Córregos")) {
    destinationCityNames.push("Dois Córregos");
  }
  if (!destinationCityNames.includes("Ribeirão Preto")) {
    destinationCityNames.push("Ribeirão Preto");
  }
  if (!destinationCityNames.includes("Jaú")) {
    destinationCityNames.push("Jaú");
  }

  // Buscar pontos de interesse
  const { data: poisAlongRoute = [] } = useQuery({ 
    queryKey: ['/api/points-of-interest'],
    queryFn: async () => {
      const response = await fetch('/api/points-of-interest');
      if (!response.ok) {
        throw new Error('Erro ao buscar pontos de interesse');
      }
      return await response.json();
    },
    enabled: !!calculatedRoute && calculatedRoute.length > 1
  });

  // Buscar eventos das cidades
  const { data: cityEvents = [] } = useQuery({ 
    queryKey: ['/api/city-events', startDate, endDate, destinationCityNames],
    queryFn: async () => {
      if (!startDate || !endDate || destinationCityNames.length === 0) return [];
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      destinationCityNames.forEach(city => {
        if (city) queryParams.append('cities', city);
      });
      
      const response = await fetch(`/api/city-events?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar eventos das cidades');
      }
      return await response.json();
    },
    enabled: !!startDate && !!endDate && destinationCityNames.length > 0
  });

  // Buscar restrições de caminhões
  const { data: truckRestrictions = [] } = useQuery({ 
    queryKey: ['/api/truck-restrictions', destinationCityNames],
    queryFn: async () => {
      if (destinationCityNames.length === 0) return [];
      
      const queryParams = new URLSearchParams();
      destinationCityNames.forEach(city => {
        if (city) queryParams.append('cities', city);
      });
      
      const response = await fetch(`/api/truck-restrictions?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar restrições de caminhões');
      }
      
      return await response.json();
    },
    enabled: !!vehicleType && vehicleType.type.includes('truck') && destinationCityNames.length > 0
  });

  const handlePrint = () => {
    // Salvar o título de página atual
    const originalTitle = document.title;
    
    // Mudar o título para o relatório
    document.title = `Relatório de Rota - ${origin?.name || 'Dois Córregos'} - ${new Date().toLocaleDateString()}`;
    
    // Imprimir
    window.print();
    
    // Restaurar o título original
    document.title = originalTitle;
  };

  if (!routeInfo || !origin || !calculatedRoute || !vehicleType) {
    return (
      <div className="text-center p-2 text-xs text-gray-500">
        Informações insuficientes para gerar o relatório.
      </div>
    );
  }

  return (
    <div className="text-xs">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xs font-bold">Relatório de Rota</h2>
        <Button 
          onClick={handlePrint} 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs py-0 px-2"
        >
          Imprimir
        </Button>
      </div>
      
      <div ref={reportRef} className="print:p-4">
        <div className="border border-gray-200 rounded-sm p-2 mb-2">
          <h3 className="text-xs font-semibold mb-1 text-primary">Informações da Rota</h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="text-gray-600">Origem:</div>
            <div className="font-medium">{origin.name}</div>
            
            <div className="text-gray-600">Destinos:</div>
            <div>
              {calculatedRoute.slice(1).map((location, index) => (
                <div key={index} className="font-medium">
                  {index+1}. {location.name}
                </div>
              ))}
            </div>
            
            <div className="text-gray-600">Veículo:</div>
            <div className="font-medium">{vehicleType.name}</div>
            
            <div className="text-gray-600">Distância total:</div>
            <div className="font-medium">{formatDistance(routeInfo.totalDistance)}</div>
            
            <div className="text-gray-600">Tempo estimado:</div>
            <div className="font-medium">{formatDuration(routeInfo.totalDuration)}</div>
            
            {startDate && endDate && (
              <>
                <div className="text-gray-600">Data de viagem:</div>
                <div className="font-medium">
                  {startDate === endDate ? startDate : `${startDate} - ${endDate}`}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-sm p-2 mb-2">
          <h3 className="text-xs font-semibold mb-1 text-primary">Custos Estimados</h3>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-gray-600">Pedágios:</div>
            <div className="font-medium">{formatCurrency(routeInfo.tollCost)}</div>
            
            <div className="text-gray-600">Combustível:</div>
            <div>
              <span className="font-medium">{formatCurrency(routeInfo.fuelCost)}</span>
              <span className="text-xs text-gray-500 ml-1">
                ({routeInfo.fuelConsumption !== undefined ? routeInfo.fuelConsumption.toFixed(1) : '0.0'} L)
              </span>
            </div>
            
            <div className="text-gray-600 font-semibold border-t border-gray-100 pt-1 mt-1">Total:</div>
            <div className="font-bold border-t border-gray-100 pt-1 mt-1 text-primary">
              {formatCurrency(routeInfo.totalCost)}
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-sm p-2 mb-2">
          <h3 className="text-xs font-semibold mb-1 text-primary">Sequência de Rota</h3>
          <div className="space-y-1">
            {[origin, ...calculatedRoute.slice(1)].map((location, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-xs">
                  {index === 0 ? 'A' : index}
                </div>
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-gray-500">{location.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pontos de Atenção */}
        {poisAlongRoute.length > 0 && (
          <div className="border border-gray-200 rounded-sm p-2 mb-2">
            <h3 className="text-xs font-semibold mb-1 text-primary">Pontos de Atenção</h3>
            <div className="space-y-1">
              <ul className="list-disc pl-4 text-xs space-y-1">
                {poisAlongRoute.map((poi: PointOfInterest) => (
                  <li key={poi.id} className="text-gray-700">
                    <span className="font-medium">{poi.name}</span>
                    <span className="text-gray-500 ml-1">({poi.type})</span>
                    {poi.restrictions && (
                      <div className="text-gray-500 text-xs">{poi.restrictions}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Eventos nas Cidades */}
        {startDate && endDate && cityEvents && cityEvents.length > 0 && (
          <div className="border border-gray-200 rounded-sm p-2 mb-2">
            <h3 className="text-xs font-semibold mb-1 text-primary">Eventos nas Cidades</h3>
            <div className="space-y-1">
              {cityEvents.map((event: CityEvent) => (
                <div key={event.id} className="mb-1 pb-1 border-b border-gray-50 last:border-b-0 last:mb-0 last:pb-0">
                  <div className="flex items-start">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 mt-1 
                      ${event.eventType === 'holiday' ? 'bg-red-600' : 
                        event.eventType === 'festival' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                    </span>
                    <div>
                      <span className="font-medium">{event.eventName}</span>
                      <span className="text-gray-500 ml-1">
                        ({event.cityName}, {event.startDate === event.endDate 
                          ? event.startDate 
                          : `${event.startDate} - ${event.endDate}`})
                      </span>
                      {event.description && (
                        <div className="text-gray-500 text-xs">{event.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Restrições para Caminhões */}
        {vehicleType && vehicleType.type.includes('truck') && truckRestrictions && truckRestrictions.length > 0 && (
          <div className="border border-gray-200 rounded-sm p-2 mb-2">
            <h3 className="text-xs font-semibold mb-1 text-primary">Restrições para Caminhões</h3>
            <div className="space-y-1">
              {truckRestrictions.map((restriction: TruckRestriction) => (
                <div key={restriction.id} className="mb-1 pb-1 border-b border-gray-50 last:border-b-0 last:mb-0 last:pb-0">
                  <div className="font-medium">{restriction.cityName} - {restriction.restriction}</div>
                  <div className="text-gray-600 text-xs">
                    Horário: {restriction.startTime || '00:00'} - {restriction.endTime || '23:59'}
                  </div>
                  <div className="text-gray-600 text-xs">
                    Veículos: {restriction.applicableVehicles}
                  </div>
                  {restriction.description && (
                    <div className="text-gray-500 text-xs">{restriction.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center text-xs text-gray-400 mt-4 print:mt-8">
          Gerado em {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Estilos para impressão já implementados via CSS global */}
    </div>
  );
}