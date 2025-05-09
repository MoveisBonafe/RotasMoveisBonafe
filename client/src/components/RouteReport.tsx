import React, { useRef } from 'react';
import { Location } from '@/lib/types';
import { formatDistance, formatDuration, formatCurrency } from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';

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
                ({routeInfo.fuelConsumption.toFixed(1)} L)
              </span>
            </div>
            
            <div className="text-gray-600 font-semibold border-t border-gray-100 pt-1 mt-1">Total:</div>
            <div className="font-bold border-t border-gray-100 pt-1 mt-1 text-primary">
              {formatCurrency(routeInfo.totalCost)}
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-sm p-2">
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
        
        <div className="text-center text-xs text-gray-400 mt-4 print:mt-8">
          Gerado em {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Estilos para impressão já implementados via CSS global */}
    </div>
  );
}