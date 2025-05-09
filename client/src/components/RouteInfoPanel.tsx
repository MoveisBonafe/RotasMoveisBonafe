import { useState } from "react";
import { RouteInfo, VehicleType, CityEvent, TruckRestriction, PointOfInterest, TabType, Location as LocationType } from "@/lib/types";
import { formatDistance, formatDuration, formatCurrency, formatRouteSequence } from "@/lib/mapUtils";
import { calculateFuelConsumption, getFuelEfficiency } from "@/lib/costCalculator";
import { useQuery } from "@tanstack/react-query";
import RouteReport from "./RouteReport";

interface RouteInfoPanelProps {
  routeInfo: RouteInfo | null;
  vehicleType: VehicleType | null;
  startDate: string | null;
  endDate: string | null;
  poisAlongRoute: PointOfInterest[];
  origin: LocationType | null;
  calculatedRoute: LocationType[] | null;
}

export default function RouteInfoPanel({
  routeInfo,
  vehicleType,
  startDate,
  endDate,
  poisAlongRoute,
  origin,
  calculatedRoute
}: RouteInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // Extrair apenas os nomes das cidades dos destinos escolhidos (não do percurso)
  // Isso atende ao requisito de mostrar eventos apenas das cidades selecionadas como destino
  const destinationCityNames = calculatedRoute 
    ? calculatedRoute.map(location => 
        location.city || location.address?.split(',')[0].trim() || null
      ).filter(Boolean)
    : [];
  
  // Consultar eventos para as cidades do trajeto
  const { data: cityEvents } = useQuery({ 
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
      return response.json();
    },
    enabled: !!startDate && !!endDate && destinationCityNames.length > 0
  });
  
  // Consultar restrições de caminhões para as cidades do trajeto
  const { data: truckRestrictions } = useQuery({
    queryKey: ['/api/truck-restrictions', destinationCityNames],
    queryFn: async () => {
      if (destinationCityNames.length === 0) return [];
      
      const queryParams = new URLSearchParams();
      destinationCityNames.forEach(city => {
        if (city) queryParams.append('cities', city);
      });
      
      const response = await fetch(`/api/truck-restrictions?${queryParams.toString()}`);
      return response.json();
    },
    enabled: destinationCityNames.length > 0 
      && vehicleType?.type.includes('truck') // Só buscar restrições para caminhões
  });
  
  // Separar os pontos de interesse por tipo
  const tollsOnRoute = poisAlongRoute.filter(poi => poi.type === 'toll');
  const balancesOnRoute = poisAlongRoute.filter(poi => poi.type === 'weight_station');
  const restAreasOnRoute = poisAlongRoute.filter(poi => poi.type === 'rest_area');
  
  // Calcular consumo de combustível
  const fuelConsumption = routeInfo && vehicleType
    ? calculateFuelConsumption(routeInfo.totalDistance, vehicleType)
    : 0;
    
  // Obter eficiência de combustível
  const fuelEfficiency = vehicleType ? getFuelEfficiency(vehicleType) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "summary"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Resumo da Rota
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "events"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Eventos
        </button>
        <button
          onClick={() => setActiveTab("restrictions")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "restrictions"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Restrições
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "report"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Relatório
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="p-2">
          {!routeInfo ? (
            <div className="text-center p-3 text-gray-500 text-xs">
              Calcule uma rota para ver o resumo.
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Route Info Card - Version compacta */}
                <div className="bg-white rounded p-2 border border-gray-100">
                  <h3 className="text-xs font-medium mb-1 text-primary">{vehicleType?.name || "Veículo"}</h3>
                  
                  <div className="text-xs mb-1">
                    <span className="text-gray-500">Distância:</span> {formatDistance(routeInfo.totalDistance)} • 
                    <span className="text-gray-500 ml-1">Tempo:</span> {formatDuration(routeInfo.totalDuration)}
                  </div>
                  
                  <div className="text-xs mb-1">
                    <span className="text-gray-500">Consumo:</span> {fuelConsumption.toFixed(1)}L ({fuelEfficiency.toFixed(1)} km/L)
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 text-xs border-t border-gray-100 pt-1">
                    <div>
                      <div>Pedágios: <span className="font-medium">{formatCurrency(routeInfo.tollCost)}</span></div>
                      <div>Combustível: <span className="font-medium">{formatCurrency(routeInfo.fuelCost)}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500">Total:</div>
                      <div className="font-bold text-primary">{formatCurrency(routeInfo.tollCost + routeInfo.fuelCost)}</div>
                    </div>
                  </div>
                </div>

                {/* Points of Attention - Versão compacta */}
                <div className="bg-white rounded p-2 border border-gray-100">
                  <h3 className="text-xs font-medium mb-1 text-primary">Pontos de Atenção</h3>
                  
                  {(tollsOnRoute.length > 0 || balancesOnRoute.length > 0 || (truckRestrictions && truckRestrictions.length > 0)) ? (
                    <ul className="text-xs space-y-1">
                      {tollsOnRoute.length > 0 && (
                        <li className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                          <span>
                            {tollsOnRoute.length} {tollsOnRoute.length === 1 ? 'pedágio' : 'pedágios'}: 
                            <span className="text-gray-500 ml-1">{tollsOnRoute.map(toll => toll.roadName).join(', ')}</span>
                          </span>
                        </li>
                      )}
                      
                      {balancesOnRoute.length > 0 && (
                        <li className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-red-600 mr-1"></span>
                          <span>
                            {balancesOnRoute.length} {balancesOnRoute.length === 1 ? 'balança' : 'balanças'} em operação
                          </span>
                        </li>
                      )}
                      
                      {(truckRestrictions && truckRestrictions.length > 0) && (
                        <li className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>
                          <span>
                            {(() => {
                              const restriction = truckRestrictions[0] as TruckRestriction;
                              return restriction && restriction.cityName 
                                ? `Restrição em ${restriction.cityName}: ${restriction.startTime || '00:00'}-${restriction.endTime || '23:59'}`
                                : "Restrições para caminhões"
                            })()}
                          </span>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-500">
                      Nenhum ponto de atenção identificado
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* City Events Tab */}
      {activeTab === "events" && (
        <div className="p-2">
          {!startDate || !endDate ? (
            <div className="bg-blue-50 text-blue-700 p-2 rounded-md text-xs">
              Selecione as datas de início e fim para ver os eventos nas cidades do trajeto.
            </div>
          ) : cityEvents && Array.isArray(cityEvents) && cityEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {cityEvents.map((event: CityEvent) => (
                <div key={event.id} className="bg-white rounded p-2 border border-gray-100 text-xs">
                  <div className="flex items-start">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 mt-1 
                      ${event.eventType === 'holiday' ? 'bg-red-600' : 
                        event.eventType === 'festival' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                    </span>
                    <div>
                      <h3 className="font-medium text-xs">{event.eventName}</h3>
                      <p className="text-xs text-gray-600">
                        {event.cityName} | {event.startDate === event.endDate 
                          ? event.startDate 
                          : `${event.startDate} - ${event.endDate}`}
                      </p>
                      {event.description && (
                        <p className="text-xs mt-1 text-gray-500">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-2 text-gray-500 text-xs">
              Nenhum evento encontrado nas cidades do trajeto para o período selecionado.
            </div>
          )}
        </div>
      )}

      {/* Vehicle Restrictions Tab */}
      {activeTab === "restrictions" && (
        <div className="p-2">
          {vehicleType?.type.includes("truck") ? (
            truckRestrictions && Array.isArray(truckRestrictions) && truckRestrictions.length > 0 ? (
              <div className="bg-white rounded p-2 border border-gray-100">
                <h3 className="text-xs font-medium mb-1 text-primary">Restrições para caminhões</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Cidade</th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Restrição</th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Horário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {truckRestrictions.map((restriction: TruckRestriction) => (
                        <tr key={restriction.id}>
                          <td className="px-2 py-1 whitespace-nowrap">{restriction.cityName}</td>
                          <td className="px-2 py-1">{restriction.restriction}</td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {restriction.startTime} - {restriction.endTime}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center p-2 text-gray-500 text-xs">
                Nenhuma restrição encontrada para caminhões nas cidades do trajeto.
              </div>
            )
          ) : (
            <div className="bg-blue-50 text-blue-700 p-2 rounded-md text-xs">
              Restrições aplicáveis apenas para caminhões. Selecione um tipo de caminhão para ver as restrições.
            </div>
          )}
        </div>
      )}

      {/* Detailed Report Tab */}
      {activeTab === "report" && (
        <div className="p-2">
          {!routeInfo ? (
            <div className="text-center p-3 text-gray-500 text-xs">
              Calcule uma rota para gerar o relatório detalhado.
            </div>
          ) : (
            <RouteReport 
              origin={origin} 
              calculatedRoute={calculatedRoute}
              routeInfo={routeInfo}
              vehicleType={vehicleType}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </div>
      )}
    </div>
  );
}