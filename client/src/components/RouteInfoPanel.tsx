import { useState } from "react";
import { RouteInfo, VehicleType, CityEvent, TruckRestriction, PointOfInterest, TabType, Location as LocationType } from "@/lib/types";
import { formatDistance, formatDuration, formatCurrency, formatRouteSequence } from "@/lib/mapUtils";
import { calculateFuelConsumption, getFuelEfficiency } from "@/lib/costCalculator";
import { useQuery } from "@tanstack/react-query";

interface RouteInfoPanelProps {
  routeInfo: RouteInfo | null;
  vehicleType: VehicleType | null;
  startDate: string | null;
  endDate: string | null;
  poisAlongRoute: PointOfInterest[];
}

export default function RouteInfoPanel({
  routeInfo,
  vehicleType,
  startDate,
  endDate,
  poisAlongRoute
}: RouteInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // Extrair apenas os nomes das cidades dos destinos escolhidos (não do percurso)
  // Isso atende ao requisito de mostrar eventos apenas das cidades selecionadas como destino
  const destinationCities = routeInfo?.destinations
    ? routeInfo.destinations
        .map((dest: any) => {
          // Tenta extrair o nome da cidade da última parte após a vírgula (formato típico: Nome, Cidade)
          const parts = dest.name ? dest.name.split(",") : [];
          return parts.length > 1 ? parts[parts.length - 1].trim() : dest.name?.trim() || "";
        })
        .filter(Boolean)
        .join(",")
    : "";

  // Get city names from route for restrictions (todas as cidades incluindo as do percurso)
  const routeCityNames = routeInfo?.waypoints 
    ? routeInfo.waypoints
        .map(wp => wp.name?.split(",").pop()?.trim() || "")
        .filter(Boolean)
        .join(",")
    : "";

  // Fetch city events if dates are provided - APENAS para cidades de destino
  const { data: cityEvents = [] } = useQuery({
    queryKey: ['/api/city-events', startDate, endDate, destinationCities],
    enabled: !!(startDate && endDate && destinationCities),
  });

  // Fetch truck restrictions if using a truck vehicle type - para todas as cidades da rota
  const { data: truckRestrictions = [] } = useQuery({
    queryKey: ['/api/truck-restrictions', routeCityNames],
    enabled: !!(vehicleType?.type.includes("truck") && routeCityNames),
  });

  const tollsOnRoute = poisAlongRoute.filter(poi => poi.type === 'toll');
  const balancesOnRoute = poisAlongRoute.filter(poi => poi.type === 'weighing_station');

  // Calculate fuel consumption
  const fuelConsumption = routeInfo && vehicleType ? 
    calculateFuelConsumption(routeInfo.totalDistance, vehicleType) : 0;
  
  const fuelEfficiency = vehicleType ? 
    getFuelEfficiency(vehicleType) : 0;

  return (
    <div className="bg-white shadow-lg border-t border-gray-200 overflow-auto" style={{ maxHeight: "40vh" }}>
      <div className="flex border-b border-gray-200">
        <button 
          className={`flex-1 px-4 py-3 font-medium ${
            activeTab === "summary" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("summary")}
        >
          Resumo da Rota
        </button>
        <button 
          className={`flex-1 px-4 py-3 font-medium ${
            activeTab === "events" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("events")}
        >
          Eventos nas Cidades
        </button>
        <button 
          className={`flex-1 px-4 py-3 font-medium ${
            activeTab === "restrictions" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("restrictions")}
        >
          Restrições de Veículos
        </button>
      </div>

      {/* Route Summary Tab */}
      {activeTab === "summary" && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Best Route Card */}
            <div className="bg-white rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Melhor Rota</h3>
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Otimizada</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <svg className="h-4 w-4 text-primary mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">
                    Tempo estimado: <strong>{routeInfo ? formatDuration(routeInfo.totalDuration) : "-"}</strong>
                  </span>
                </div>
                <div className="flex items-center mb-1">
                  <svg className="h-4 w-4 text-primary mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">
                    Distância total: <strong>{routeInfo ? formatDistance(routeInfo.totalDistance) : "-"}</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-primary mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">
                    Paradas: <strong>{routeInfo ? routeInfo.waypoints.length - 2 : 0}</strong>
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="text-xs text-gray-500">Sequência otimizada:</div>
                <div className="text-sm">
                  {routeInfo ? formatRouteSequence(routeInfo.waypoints) : "Nenhuma rota calculada"}
                </div>
              </div>
            </div>

            {/* Estimated Costs Card */}
            <div className="bg-white rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg">
              <h3 className="font-medium mb-3">Custos Estimados</h3>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-yellow-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Pedágios:</span>
                  </div>
                  <span className="font-medium">
                    {routeInfo ? formatCurrency(routeInfo.tollCost) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-green-600 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Combustível:</span>
                  </div>
                  <span className="font-medium">
                    {routeInfo ? formatCurrency(routeInfo.fuelCost) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span>Total:</span>
                  <span>
                    {routeInfo 
                      ? formatCurrency(routeInfo.tollCost + routeInfo.fuelCost) 
                      : "-"
                    }
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="text-xs text-gray-500">Consumo estimado de combustível:</div>
                <div className="text-sm">
                  {fuelConsumption.toFixed(1)} litros (média de {fuelEfficiency.toFixed(1)} km/l)
                </div>
              </div>
            </div>

            {/* Points of Attention Card */}
            <div className="bg-white rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg">
              <h3 className="font-medium mb-3">Pontos de Atenção</h3>
              <div className="mb-2">
                {tollsOnRoute.length > 0 && (
                  <div className="flex items-start mb-2">
                    <svg className="h-4 w-4 text-yellow-500 mr-1 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium">{tollsOnRoute.length} {tollsOnRoute.length === 1 ? 'pedágio' : 'pedágios'} no trajeto</div>
                      <div className="text-xs text-gray-600">
                        {tollsOnRoute.map(toll => toll.roadName).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
                
                {balancesOnRoute.length > 0 && (
                  <div className="flex items-start mb-2">
                    <svg className="h-4 w-4 text-red-600 mr-1 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium">
                        {balancesOnRoute.length} {balancesOnRoute.length === 1 ? 'balança' : 'balanças'} em operação
                      </div>
                      <div className="text-xs text-gray-600">
                        {balancesOnRoute.map(balance => 
                          `${balance.roadName || ''} ${balance.restrictions ? `(${balance.restrictions})` : ''}`
                        ).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
                
                {(truckRestrictions && Array.isArray(truckRestrictions) && truckRestrictions.length > 0) && (
                  <div className="flex items-start">
                    <svg className="h-4 w-4 text-primary mr-1 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium">Restrições para caminhões</div>
                      <div className="text-xs text-gray-600">
                        {truckRestrictions.length > 0 && truckRestrictions[0] 
                          ? `Em ${truckRestrictions[0].cityName}, das ${truckRestrictions[0].startTime} às ${truckRestrictions[0].endTime}`
                          : "Sem restrições"}
                      </div>
                    </div>
                  </div>
                )}

                {(!tollsOnRoute.length && !balancesOnRoute.length && (!truckRestrictions || !Array.isArray(truckRestrictions) || !truckRestrictions.length)) && (
                  <div className="text-sm text-gray-500">
                    Nenhum ponto de atenção identificado
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* City Events Tab */}
      {activeTab === "events" && (
        <div className="p-4">
          {!startDate || !endDate ? (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
              Selecione as datas de início e fim para ver os eventos nas cidades do trajeto.
            </div>
          ) : cityEvents && Array.isArray(cityEvents) && cityEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cityEvents.map((event: CityEvent) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start mb-3">
                    <svg 
                      className={`h-5 w-5 ${
                        event.eventType === 'holiday' ? 'text-red-600' : 
                        event.eventType === 'festival' ? 'text-yellow-500' : 'text-green-600'
                      } mr-2`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-medium">{event.eventName} - {event.cityName}</h3>
                      <p className="text-sm text-gray-600">
                        {event.startDate === event.endDate 
                          ? event.startDate 
                          : `${event.startDate} - ${event.endDate}`
                        } 
                        {" - "}
                        {event.eventType === 'holiday' ? 'Feriado' : 
                         event.eventType === 'festival' ? 'Festival' : 'Aniversário da cidade'}
                      </p>
                      {event.description && (
                        <p className="text-sm mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              Nenhum evento encontrado nas cidades do trajeto para o período selecionado.
            </div>
          )}
        </div>
      )}

      {/* Vehicle Restrictions Tab */}
      {activeTab === "restrictions" && (
        <div className="p-4">
          {vehicleType?.type.includes("truck") ? (
            truckRestrictions && Array.isArray(truckRestrictions) && truckRestrictions.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h3 className="font-medium mb-2">Restrições para caminhões</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restrição</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículos</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {truckRestrictions.map((restriction: TruckRestriction) => (
                        <tr key={restriction.id}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{restriction.cityName}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{restriction.restriction}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {restriction.startTime} - {restriction.endTime}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{restriction.applicableVehicles}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">
                Nenhuma restrição encontrada para caminhões nas cidades do trajeto.
              </div>
            )
          ) : (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
              Restrições de veículos são aplicáveis apenas para caminhões. Selecione um tipo de caminhão para ver as restrições.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
