import { useState, useEffect } from "react";
import { RouteInfo, VehicleType, CityEvent, TruckRestriction, PointOfInterest, TabType, Location as LocationType } from "@/lib/types";
import { formatDistance, formatDuration, formatCurrency, formatRouteSequence } from "@/lib/mapUtils";
import { calculateFuelConsumption, getFuelEfficiency } from "@/lib/costCalculator";
import { extractCityFromAddress } from "@/lib/utils";
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
  initialTab?: TabType; // Tab inicial a ser mostrada
}

export default function RouteInfoPanel({
  routeInfo,
  vehicleType,
  startDate,
  endDate,
  poisAlongRoute,
  origin,
  calculatedRoute,
  initialTab = "summary"
}: RouteInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // Quando a rota é calculada (calculatedRoute muda), ativar a aba de resumo
  useEffect(() => {
    if (calculatedRoute && calculatedRoute.length > 0) {
      setActiveTab("summary");
    }
  }, [calculatedRoute]);

  // Extrair nomes das cidades dos destinos escolhidos
  const destinationCityNames = calculatedRoute 
    ? calculatedRoute.map(location => 
        location.name || location.address?.split(',')[0].trim() || null
      ).filter(Boolean) as string[]
    : [];
    
  // Garantir que Dois Córregos (origem) está sempre na lista
  if (origin && origin.name && !destinationCityNames.includes(origin.name)) {
    destinationCityNames.push(origin.name);
  }
  
  // Verificar se Ribeirão Preto está presente nos endereços
  const hasRibeiraoPreto = calculatedRoute ? calculatedRoute.some(location => 
    location.address && location.address.includes("Ribeirão Preto")
  ) : false;
  
  if (hasRibeiraoPreto && !destinationCityNames.includes("Ribeirão Preto")) {
    destinationCityNames.push("Ribeirão Preto");
  }
  
  console.log("Cidades detectadas para eventos:", destinationCityNames);
  
  // Consultar eventos para as cidades do trajeto
  const { data: cityEvents } = useQuery({ 
    queryKey: ['/api/city-events', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      
      console.log("Buscando eventos para datas:", startDate, "até", endDate);
      
      // Não enviar o filtro de cidades para obter todos os eventos
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      try {
        const response = await fetch(`/api/city-events?${queryParams.toString()}`);
        console.log("Resposta da API de eventos:", response.status);
        const events = await response.json();
        console.log("Eventos obtidos do servidor:", events.length);
        return events;
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        return [];
      }
    },
    enabled: !!startDate && !!endDate
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
  const balancesOnRoute = poisAlongRoute.filter(poi => poi.type === 'weighing_station');
  // Não temos áreas de descanso implementadas ainda
  const restAreasOnRoute: typeof poisAlongRoute = [];
  
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
              {/* Sequência da Rota */}
              {calculatedRoute && calculatedRoute.length > 0 && (
                <div className="mb-3 bg-white rounded p-2 border border-gray-100">
                  <h3 className="text-xs font-medium mb-1 text-primary">Sequência da Rota</h3>
                  
                  <div className="relative overflow-hidden">
                    <div className="flex flex-wrap items-center text-xs route-sequence-animation">
                      {calculatedRoute.map((location, index) => (
                        <div key={index} className="flex items-center route-point-animation" style={{animationDelay: `${index * 0.2}s`}}>
                          <div className="flex items-center">
                            <span className={`inline-flex justify-center items-center w-5 h-5 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-primary'} text-white text-xs mr-1`}>
                              {index === 0 ? 'O' : index}
                            </span>
                            <span className="font-medium">
                              {location.name.startsWith("R.") || location.name.startsWith("Av.") 
                                ? extractCityFromAddress(location.address) 
                                : location.name}
                            </span>
                          </div>
                          
                          {index < calculatedRoute.length - 1 && (
                            <div className="mx-2 text-gray-400 route-connector-animation" style={{animationDelay: `${index * 0.2 + 0.1}s`}}>
                              →
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
              {/* Filtrar e ordenar eventos: mostrar apenas eventos das cidades na rota, na ordem da rota e por data */}
              {(() => {
                // Definir a sequência de cidades pela ordem em que aparecem na rota
                const routeSequence = Array.isArray(calculatedRoute) 
                  ? calculatedRoute.map(loc => loc.name || "").filter(Boolean)
                  : [];
                
                // Extrair o nome exato das cidades da rota usando a função extractCityFromAddress
                const citiesInRoute = new Set<string>();
                
                // Adicionar a origem (Dois Córregos)
                citiesInRoute.add("Dois Córregos");
                
                // Adicionar cidades dos destinos usando a função extractCityFromAddress
                if (Array.isArray(calculatedRoute)) {
                  calculatedRoute.forEach(location => {
                    if (location.address) {
                      const cityName = extractCityFromAddress(location.address);
                      if (cityName) {
                        citiesInRoute.add(cityName);
                      }
                    }
                  });
                }
                
                // Forçar incluir Ribeirão Preto na lista se estiver no endereço
                const hasRibeiraoPreto = calculatedRoute ? calculatedRoute.some(location => 
                  location.address && location.address.includes("Ribeirão Preto")
                ) : false;
                
                if (hasRibeiraoPreto) {
                  citiesInRoute.add("Ribeirão Preto");
                }
                
                // Criar um mapa para saber a posição de cada cidade na rota
                const cityPositionMap = new Map();
                routeSequence.forEach((city, index) => {
                  if (!cityPositionMap.has(city)) {
                    cityPositionMap.set(city, index);
                  }
                });
                
                // DEBUG: Mostrar informações sobre eventos e cidades
                console.log("RouteInfoPanel - Eventos brutos recebidos:", JSON.stringify(cityEvents));
                console.log("RouteInfoPanel - Cidades na rota:", JSON.stringify(Array.from(citiesInRoute)));
                
                // Forçar incluir Ribeirão Preto na lista de cidades
                citiesInRoute.add("Ribeirão Preto");
                console.log("RouteInfoPanel - Cidades após adicionar Ribeirão Preto:", JSON.stringify(Array.from(citiesInRoute)));
                
                // Filtrar para mostrar APENAS eventos de cidades que estão na rota
                const filteredAndSortedEvents = [...cityEvents]
                  // Primeiro filtramos para manter apenas eventos de cidades na rota
                  .filter(event => {
                    // Verificar se a cidade do evento está na rota
                    return Array.from(citiesInRoute).some(city => 
                      event.cityName.includes(city) || city.includes(event.cityName)
                    );
                  })
                  // Depois ordenamos os eventos filtrados
                  .sort((a, b) => {
                    // Primeiro critério: posição da cidade na rota
                    const cityA = a.cityName;
                    const cityB = b.cityName;
                    
                    // Encontrar posição das cidades na rota
                    let posA = 999;
                    let posB = 999;
                    
                    // Fazer uma busca mais flexível para encontrar a cidade na rota
                    Array.from(cityPositionMap.keys()).forEach((city) => {
                      const position = cityPositionMap.get(city);
                      if (cityA.includes(city) || city.includes(cityA)) {
                        posA = position;
                      }
                      if (cityB.includes(city) || city.includes(cityB)) {
                        posB = position;
                      }
                    });
                    
                    if (posA !== posB) {
                      return posA - posB; // Ordem crescente por posição na rota
                    }
                    
                    // Segundo critério: data do evento
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime(); // Ordem crescente por data
                  });
                
                return filteredAndSortedEvents.map((event: CityEvent) => (
                  <div key={event.id} className="bg-white rounded p-2 border border-gray-100 text-xs">
                    <div className="flex items-start">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 mt-1 
                        ${event.eventType === 'holiday' ? 'bg-red-600' : 
                          event.eventType === 'festival' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                      </span>
                      <div>
                        <h3 className="font-medium text-xs">{event.eventName}</h3>
                        <p className="text-xs text-gray-600">
                          {event.cityName} | {new Date(event.startDate).toLocaleDateString('pt-BR')}
                          {event.startDate !== event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('pt-BR')}`}
                        </p>
                        {event.description && (
                          <p className="text-xs mt-1 text-gray-500">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
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
                      {(() => {
                        // Definir a sequência de cidades pela ordem em que aparecem na rota
                        const routeSequence = Array.isArray(calculatedRoute) 
                          ? calculatedRoute.map(loc => loc.name || "").filter(Boolean)
                          : [];
                        
                        // Extrair o nome exato das cidades da rota usando a função extractCityFromAddress
                        const citiesInRoute = new Set<string>();
                        
                        // Adicionar a origem (Dois Córregos)
                        citiesInRoute.add("Dois Córregos");
                        
                        // Adicionar cidades dos destinos usando a função extractCityFromAddress
                        if (Array.isArray(calculatedRoute)) {
                          calculatedRoute.forEach(location => {
                            if (location.address) {
                              const cityName = extractCityFromAddress(location.address);
                              if (cityName) {
                                citiesInRoute.add(cityName);
                              }
                            }
                          });
                        }
                        
                        // Forçar incluir Ribeirão Preto na lista se estiver no endereço
                        const hasRibeiraoPreto = calculatedRoute ? calculatedRoute.some(location => 
                          location.address && location.address.includes("Ribeirão Preto")
                        ) : false;
                        
                        if (hasRibeiraoPreto) {
                          citiesInRoute.add("Ribeirão Preto");
                        }
                        
                        // Filtrar apenas restrições das cidades que estão na rota
                        const filteredRestrictions = [...truckRestrictions]
                          .filter(restriction => {
                            // Verificar se a cidade da restrição está na rota
                            return Array.from(citiesInRoute).some(city => 
                              restriction.cityName.includes(city) || city.includes(restriction.cityName)
                            );
                          });
                        
                        return filteredRestrictions.map((restriction: TruckRestriction) => (
                          <tr key={restriction.id}>
                            <td className="px-2 py-1 whitespace-nowrap">{restriction.cityName}</td>
                            <td className="px-2 py-1">{restriction.restriction}</td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              {restriction.startTime} - {restriction.endTime}
                            </td>
                          </tr>
                        ));
                      })()}
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