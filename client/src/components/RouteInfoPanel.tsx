import { useState, useEffect } from "react";
import { RouteInfo, VehicleType, CityEvent, TruckRestriction, PointOfInterest, TabType, Location as LocationType } from "@/lib/types";
import { formatDistance, formatDuration, formatCurrency, formatRouteSequence } from "@/lib/mapUtils";
import { calculateFuelConsumption, getFuelEfficiency } from "@/lib/costCalculator";
import { extractCityFromAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Maximize2, Minimize2, X } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filteredPOIs, setFilteredPOIs] = useState<PointOfInterest[]>([]);
  
  // Função para alternar a tab e expandir/recolher
  const toggleTab = (tab: TabType) => {
    if (activeTab === tab) {
      // Se a mesma tab for clicada, alterna entre expandido e recolhido
      setIsExpanded(!isExpanded);
    } else {
      // Se for uma tab diferente, ativa essa tab e expande
      setActiveTab(tab);
      setIsExpanded(true);
      setIsCollapsed(false);
    }
  };
  
  // Quando a rota é calculada (calculatedRoute muda), ativar a aba de resumo
  // E também atualizar os POIs filtrados
  useEffect(() => {
    if (calculatedRoute && calculatedRoute.length > 0) {
      setActiveTab("summary");
      // Não modificamos o estado de minimização para permitir que a aba permaneça minimizada após o cálculo
      
      // FILTRAR POIs AQUI COM BASE NA ROTA ATUAL
      if (calculatedRoute.length > 0) {
        console.log("Filtrando POIs com base na rota atual:", calculatedRoute.map(loc => loc.name));
        
        // Extrair cidades dos destinos da rota calculada
        const allCitiesInRoute = new Set<string>();
        calculatedRoute.forEach(location => {
          // De cada local, extrair cidade do nome ou endereço
          if (location.name) {
            const cityName = location.name.split(',')[0].trim().toLowerCase();
            allCitiesInRoute.add(cityName);
          }
          
          if (location.address) {
            // Formato: "Cidade - UF, Brasil"
            const cityMatch = location.address.match(/([^,]+?)(?:\s*-\s*[A-Z]{2})/i);
            if (cityMatch && cityMatch[1]) {
              allCitiesInRoute.add(cityMatch[1].trim().toLowerCase());
            }
          }
        });
        
        // Extração de rodovias da rota
        const highwaysInRoute = new Set<string>();
        
        // Adicionar rodovias relevantes com base nas cidades da rota
        const citiesArray = Array.from(allCitiesInRoute);
        if (citiesArray.some(city => city.includes("ribeirão") || city.includes("preto"))) {
          highwaysInRoute.add("SP-255");
        }
        if (citiesArray.some(city => city.includes("bauru") || city.includes("jaú"))) {
          highwaysInRoute.add("SP-225");
        }
        if (citiesArray.some(city => city.includes("araraquara") || city.includes("são carlos"))) {
          highwaysInRoute.add("SP-310");
        }
        
        // Dois Córregos está na SP-225 e próximo da SP-255
        highwaysInRoute.add("SP-225");
        
        console.log("Cidades na rota:", Array.from(allCitiesInRoute));
        console.log("Rodovias na rota:", Array.from(highwaysInRoute));
        
        // Buscar balanças adicionais da API
        const fetchAdditionalWeighingStations = async () => {
          try {
            // Construir URL com parâmetros para buscar balanças
            const params = new URLSearchParams();
            
            // Adicionar cidades à query
            citiesArray.forEach(city => params.append('cities', city));
            
            // Adicionar rodovias à query
            Array.from(highwaysInRoute).forEach(highway => params.append('highways', highway));
            
            // Buscar balanças
            const response = await fetch(`/api/weighing-stations?${params.toString()}`);
            const additionalStations = await response.json();
            
            console.log("API retornou", additionalStations.length, "balanças adicionais");
            
            // Agora vamos filtrar os POIs para incluir apenas os que estão na rota atual
            const filteredPOIs = poisAlongRoute.filter(poi => {
              // Verificar se o POI está em uma rodovia da rota
              if (poi.roadName) {
                const isInHighway = Array.from(highwaysInRoute).some(
                  highway => poi.roadName?.includes(highway)
                );
                
                if (isInHighway) {
                  console.log(`POI "${poi.name}" incluído por rodovia "${poi.roadName}"`);
                  return true;
                } else {
                  console.log(`POI "${poi.name}" EXCLUÍDO por não estar na rota atual`);
                  return false;
                }
              }
              
              // Verificar se o POI está em uma cidade da rota
              const isInCity = Array.from(allCitiesInRoute).some(
                city => poi.name?.toLowerCase().includes(city)
              );
              
              if (isInCity) {
                return true;
              }
              
              return false;
            });
            
            // Adicionar balanças adicionais que estão nas rodovias/cidades da rota
            const additionalPOIs = additionalStations.filter(station => {
              // Verificar por rodovia
              if (station.roadName) {
                const isInHighway = Array.from(highwaysInRoute).some(
                  highway => station.roadName?.includes(highway)
                );
                
                if (isInHighway) {
                  console.log(`POI "${station.name}" incluído por rodovia "${station.roadName}"`);
                  return true;
                }
              }
              
              // Verificar por cidade
              if (station.city) {
                const isInCity = Array.from(allCitiesInRoute).some(
                  city => station.city?.toLowerCase().includes(city) || 
                          city.includes(station.city?.toLowerCase() || '')
                );
                
                if (isInCity) {
                  return true;
                }
              }
              
              return false;
            });
            
            // Combinar POIs filtrados com balanças adicionais
            const combinedPOIs = [...filteredPOIs, ...additionalPOIs];
            console.log("POIs filtrados para a rota atual:", combinedPOIs.map(p => p.name));
            
            // Atualizar estado com POIs filtrados
            setFilteredPOIs(combinedPOIs);
          } catch (error) {
            console.error("Erro ao buscar balanças adicionais:", error);
          }
        };
        
        fetchAdditionalWeighingStations();
      }
    }
  }, [calculatedRoute, poisAlongRoute]);
  
  // Verificar se tem pedágios e balanças
  const tollsOnRoute = filteredPOIs.filter(poi => poi.type === 'toll');
  const weighingStationsOnRoute = filteredPOIs.filter(poi => poi.type === 'weighing_station');
  
  // Buscar eventos da cidade
  const { data: cityEvents } = useQuery<CityEvent[]>({
    queryKey: ['/api/city-events', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      
      // Extrair nomes de cidades para parâmetros
      const citiesParam = new URLSearchParams();
      
      if (calculatedRoute) {
        // Extrair cidade da origem
        if (origin) {
          console.log("Adicionando cidade de origem:", origin.name);
          citiesParam.append('cities', origin.name);
        }
        
        // Extrair cidades dos waypoints
        calculatedRoute.forEach(location => {
          if (location.address) {
            const cityName = extractCityFromAddress(location.address);
            if (cityName) {
              console.log("Cidade detectada:", cityName);
              citiesParam.append('cities', cityName);
            }
          }
        });
      }
      
      // Construir URL
      const apiUrl = `/api/city-events?startDate=${startDate}&endDate=${endDate}&${citiesParam.toString()}`;
      
      // Buscar dados
      const response = await fetch(apiUrl);
      return response.json();
    },
    enabled: !!startDate && !!endDate && !!calculatedRoute
  });
  
  // Buscar restrições para caminhões nas cidades da rota
  const { data: truckRestrictions } = useQuery<TruckRestriction[]>({
    queryKey: ['/api/truck-restrictions'],
    queryFn: async () => {
      const response = await fetch('/api/truck-restrictions');
      return response.json();
    },
    enabled: !!vehicleType && vehicleType.type.includes('truck')
  });
  
  // Função para verificar se é o mesmo POI (para evitar duplicações)
  function isDuplicatePOI(poi1: PointOfInterest, poi2: PointOfInterest): boolean {
    // Verificar por nome
    if (poi1.name === poi2.name) return true;
    
    // Verificar por coordenadas (se estiverem próximas)
    const lat1 = parseFloat(poi1.lat);
    const lng1 = parseFloat(poi1.lng);
    const lat2 = parseFloat(poi2.lat);
    const lng2 = parseFloat(poi2.lng);
    
    // Se as coordenadas estão a menos de 1km de distância, considerar como o mesmo POI
    if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
      const distance = Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
      if (distance < 0.01) return true; // Aproximadamente 1km
    }
    
    return false;
  }
  
  console.log("Cidades detectadas para eventos:", cityEvents?.map(e => e.cityName));
  console.log("Rodovias relevantes para a rota:", Array.from(tollsOnRoute.map(t => t.roadName || '').filter(Boolean)));
  console.log("Depurando: calculatedRoute =", calculatedRoute);
  console.log("Pontos de Atenção filtrados:", filteredPOIs);
  
  return (
    <div className="route-info-panel bg-gray-50 border-t border-gray-200 rounded-t-lg overflow-hidden">
      {/* Tab selector */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => toggleTab("summary")}
          className={`flex-1 py-2 text-xs font-medium px-4 ${
            activeTab === "summary" ? "text-primary border-b-2 border-primary" : "text-gray-600"
          }`}
        >
          Resumo
        </button>
        <button
          onClick={() => toggleTab("events")}
          className={`flex-1 py-2 text-xs font-medium px-4 ${
            activeTab === "events" ? "text-primary border-b-2 border-primary" : "text-gray-600"
          }`}
        >
          Eventos
        </button>
        <button
          onClick={() => toggleTab("report")}
          className={`flex-1 py-2 text-xs font-medium px-4 ${
            activeTab === "report" ? "text-primary border-b-2 border-primary" : "text-gray-600"
          }`}
        >
          Relatório
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className={`p-2 ${isExpanded ? 'expanded-tab' : ''}`}>
          <div className="flex justify-between mb-1">
            <div className="flex items-center">
              {isCollapsed && routeInfo && (
                <span className="text-xs text-gray-700 font-medium">
                  {routeInfo.totalDistance.toLocaleString('pt-BR')} km • {routeInfo.totalDuration} min
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCollapsed && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  {isExpanded ? 
                    <><Minimize2 className="h-3 w-3" /> Compactar</> : 
                    <><Maximize2 className="h-3 w-3" /> Expandir</>
                  }
                </button>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                {isCollapsed ? 
                  <><Maximize2 className="h-3 w-3" /> Mostrar</> : 
                  <><X className="h-3 w-3" /> Minimizar</>
                }
              </button>
            </div>
          </div>

          {!isCollapsed && (
            !routeInfo ? (
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

                {/* Points of Attention - Seção compacta */}
                <div className="bg-white rounded p-2 border border-gray-100 mb-3">
                  <h3 className="text-xs font-medium mb-1 text-primary">Pontos de Atenção</h3>
                  
                  {/* Filtrar POIs, restrições e eventos */}
                  {(() => {
                    // Usar filteredPOIs do state para pedágios e balanças
                    const tollsToShow = filteredPOIs.filter(p => p.type === 'toll');
                    const balancesToShow = filteredPOIs.filter(p => p.type === 'weighing_station');
                    
                    // Filtrar restrições para mostrar apenas as da rota atual
                    const restrictionsToShow = truckRestrictions && calculatedRoute ? 
                      truckRestrictions.filter(r => 
                        calculatedRoute.some(loc => 
                          loc.name?.toLowerCase().includes(r.cityName?.toLowerCase()) || 
                          r.cityName?.toLowerCase().includes(loc.name?.toLowerCase()) || 
                          loc.address?.toLowerCase().includes(r.cityName?.toLowerCase())
                        )
                      ) : [];
                    
                    // Verificar se temos algum ponto de atenção para mostrar
                    const hasAttentionPoints = tollsToShow.length > 0 || 
                                              balancesToShow.length > 0 || 
                                              restrictionsToShow.length > 0;
                    
                    // Mostrar os pontos de atenção (se houver)
                    return hasAttentionPoints ? (
                      <ul className="text-xs space-y-1">
                        {/* 1. Pedágios */}
                        {tollsToShow.length > 0 && (
                          <li className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                            <span>
                              {tollsToShow.length} {tollsToShow.length === 1 ? 'pedágio' : 'pedágios'}: 
                              <span className="text-gray-500 ml-1">
                                {tollsToShow.map(toll => 
                                  toll.name.includes('(') ? toll.name.split('(').pop()?.replace(')', '') || '' : toll.roadName || toll.name
                                ).filter(Boolean).join(', ')}
                              </span>
                            </span>
                          </li>
                        )}
                        
                        {/* 2. Balanças */}
                        {balancesToShow.length > 0 && (
                          <li className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-600 mr-1"></span>
                            <span>
                              {balancesToShow.length} {balancesToShow.length === 1 ? 'balança' : 'balanças'} em operação
                            </span>
                          </li>
                        )}
                        
                        {/* 3. Restrições */}
                        {restrictionsToShow.map((restriction, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>
                            <span>
                              {`Restrição em ${restriction.cityName}: ${restriction.startTime || '00:00'}-${restriction.endTime || '23:59'}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Nenhum ponto de atenção na rota atual
                      </div>
                    );
                  })()}
                </div>
                
                {/* Eventos nas cidades - Nova seção no resumo da rota */}
                <div className="bg-white rounded p-2 border border-gray-100 mb-3">
                  <h3 className="text-xs font-medium mb-1 text-primary">Eventos e Feriados</h3>
                  
                  {(() => {
                    // Verificar se temos datas selecionadas
                    if (!startDate || !endDate) {
                      return (
                        <div className="text-xs text-gray-500">
                          Selecione datas para ver eventos nas cidades do trajeto
                        </div>
                      );
                    }
                    
                    // Extrair cidades da rota
                    const citiesInRoute = new Set<string>();
                    
                    // Adicionar origem (Dois Córregos)
                    citiesInRoute.add("Dois Córregos");
                    
                    // Adicionar cidades dos destinos
                    if (Array.isArray(calculatedRoute)) {
                      calculatedRoute.forEach(location => {
                        if (location.address) {
                          const cityName = extractCityFromAddress(location.address);
                          if (cityName) {
                            citiesInRoute.add(cityName);
                          }
                        }
                        
                        // Adicionar também pelo nome do local
                        if (location.name) {
                          const cityName = location.name.split(',')[0].trim();
                          citiesInRoute.add(cityName);
                        }
                      });
                    }
                    
                    // Filtrar eventos por cidades na rota
                    const relevantEvents = cityEvents && Array.isArray(cityEvents) ? 
                      cityEvents.filter(event => 
                        Array.from(citiesInRoute).some(city => 
                          event.cityName?.toLowerCase().includes(city.toLowerCase()) || 
                          city.toLowerCase().includes(event.cityName?.toLowerCase())
                        )
                      ) : [];
                    
                    // Verificar se tem eventos para mostrar
                    if (relevantEvents.length === 0) {
                      return (
                        <div className="text-xs text-gray-500">
                          Nenhum evento encontrado nas cidades do trajeto no período selecionado
                        </div>
                      );
                    }
                    
                    // Mostrar eventos relevantes
                    return (
                      <ul className="text-xs space-y-1">
                        {relevantEvents.map((event, idx) => {
                          // Processar data para formato mais amigável
                          const eventDate = event.startDate ? new Date(event.startDate) : null;
                          const formattedDate = eventDate ? 
                            eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
                          
                          // Ícone baseado no tipo de evento
                          const getEventIcon = (type) => {
                            switch (type) {
                              case 'anniversary': return '🎂';
                              case 'holiday': return '📅';
                              case 'festival': return '🎭';
                              default: return '📌';
                            }
                          };
                          
                          return (
                            <li key={idx} className="flex items-start">
                              <span className="mr-1">{getEventIcon(event.eventType)}</span>
                              <div>
                                <span className="font-medium">{event.cityName}</span>
                                <span className="mx-1">•</span>
                                <span>{formattedDate}</span>
                                <div className="text-gray-600">{event.eventName}</div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
                
                {/* Restrições de caminhões - Exibição detalhada no resumo da rota */}
                {vehicleType && vehicleType.type.includes('truck') && (
                  <div className="bg-white rounded p-2 border border-gray-100">
                    <h3 className="text-xs font-medium mb-1 text-primary">Restrições de Caminhões</h3>
                    
                    {(() => {
                      // Filtrar restrições para mostrar apenas as da rota atual
                      const restrictionsToShow = truckRestrictions && calculatedRoute ? 
                        truckRestrictions.filter(r => 
                          calculatedRoute.some(loc => 
                            loc.name?.toLowerCase().includes(r.cityName?.toLowerCase()) || 
                            r.cityName?.toLowerCase().includes(loc.name?.toLowerCase()) || 
                            loc.address?.toLowerCase().includes(r.cityName?.toLowerCase())
                          )
                        ) : [];
                      
                      // Verificar se temos restrições para mostrar
                      if (restrictionsToShow.length === 0) {
                        return (
                          <div className="text-xs text-gray-500">
                            Nenhuma restrição de caminhões nas cidades do trajeto
                          </div>
                        );
                      }
                      
                      // Mostrar restrições em formato detalhado
                      return (
                        <ul className="text-xs space-y-2">
                          {restrictionsToShow.map((restriction, idx) => (
                            <li key={idx} className="border-l-2 border-primary pl-2">
                              <div className="font-medium">{restriction.cityName}</div>
                              <div className="text-gray-700">{restriction.description}</div>
                              <div className="flex items-center text-gray-600 mt-1">
                                <span className="bg-gray-100 px-1 rounded">{restriction.startTime}-{restriction.endTime}</span>
                                <span className="mx-1">•</span>
                                <span>{restriction.restriction}</span>
                                <span className="mx-1">•</span>
                                <span>{restriction.applicableVehicles}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* City Events Tab */}
      {activeTab === "events" && (
        <div className={`p-2 ${isExpanded ? 'expanded-tab' : ''}`}>
          <div className="flex justify-end mb-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {isExpanded ? 
                <><Minimize2 className="h-3 w-3" /> Minimizar</> : 
                <><Maximize2 className="h-3 w-3" /> Expandir</>
              }
            </button>
          </div>
          {!startDate || !endDate ? (
            <div className="bg-blue-50 text-blue-700 p-2 rounded-md text-xs">
              Selecione as datas de início e fim para ver os eventos nas cidades do trajeto.
            </div>
          ) : cityEvents && Array.isArray(cityEvents) && cityEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                
                // Filtrar eventos apenas para as cidades na rota
                const filteredEvents = cityEvents.filter(event => 
                  Array.from(citiesInRoute).some(city => 
                    event.cityName?.toLowerCase().includes(city.toLowerCase()) || 
                    city.toLowerCase().includes(event.cityName?.toLowerCase())
                  )
                );
                
                // Se não houver eventos para as cidades do trajeto
                if (filteredEvents.length === 0) {
                  return (
                    <div className="col-span-1 md:col-span-2 bg-gray-50 p-3 rounded-md text-gray-500 text-xs">
                      Nenhum evento encontrado para as cidades do trajeto no período selecionado.
                    </div>
                  );
                }
                
                // Ordenar eventos por data
                const filteredAndSortedEvents = [...filteredEvents].sort((a, b) => {
                  if (!a.startDate || !b.startDate) return 0;
                  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                });
                
                // Renderizar eventos por cidade
                return filteredAndSortedEvents.map((event: CityEvent, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-2 rounded-md border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className={`
                        w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                        ${event.eventType === 'holiday' ? 'bg-red-100 text-red-600' : 
                          event.eventType === 'festival' ? 'bg-purple-100 text-purple-600' : 
                          event.eventType === 'anniversary' ? 'bg-amber-100 text-amber-600' : 
                          'bg-blue-100 text-blue-600'}
                      `}>
                        {event.eventType === 'holiday' ? '📅' : 
                         event.eventType === 'festival' ? '🎭' : 
                         event.eventType === 'anniversary' ? '🎂' : '📌'}
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="font-medium text-sm">{event.eventName}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="font-medium text-gray-700">{event.cityName}</span>
                          <span className="mx-1">•</span>
                          <span>{event.startDate ? new Date(event.startDate).toLocaleDateString('pt-BR') : ''}</span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-md text-gray-500 text-center text-xs">
              Nenhum evento encontrado para o período selecionado.
            </div>
          )}
        </div>
      )}

      {/* Report Tab */}
      {activeTab === "report" && (
        <div className={`p-2 overflow-auto ${isExpanded ? 'expanded-tab' : ''}`}>
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {isExpanded ? 
                <><Minimize2 className="h-3 w-3" /> Minimizar</> : 
                <><Maximize2 className="h-3 w-3" /> Expandir</>
              }
            </button>
          </div>
          
          <RouteReport 
            origin={origin}
            calculatedRoute={calculatedRoute}
            routeInfo={routeInfo}
            vehicleType={vehicleType}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}
    </div>
  );
}