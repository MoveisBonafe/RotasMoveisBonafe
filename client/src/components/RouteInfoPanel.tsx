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
  const [isMinimized, setIsMinimized] = useState(true); // Estado para controlar minimização completa
  const [filteredPOIs, setFilteredPOIs] = useState<PointOfInterest[]>([]);
  
  // Função para alternar a tab e expandir/recolher
  const toggleTab = (tab: TabType) => {
    if (activeTab === tab) {
      // Se a mesma tab for clicada, alterna entre expandido e recolhido
      if (isMinimized) {
        // Se estiver completamente minimizado, mostrar conteúdo expandido para resumo e relatório
        setIsMinimized(false);
        
        // Para aba resumo e relatório, expandir automaticamente ao clicar
        if (tab === "summary" || tab === "report") {
          setIsExpanded(true);
        } else {
          setIsExpanded(false);
        }
      } else if (!isExpanded) {
        // Se estiver mostrando conteúdo recolhido, expandir para resumo e relatório, minimizar para outros
        if (tab === "summary" || tab === "report") {
          setIsExpanded(true);
        } else {
          setIsMinimized(true);
        }
      } else {
        // Se estiver expandido, recolher (resumo minimiza completamente, relatório apenas recolhe)
        if (tab === "summary") {
          setIsMinimized(true);
          setIsExpanded(false);
        } else {
          setIsExpanded(false);
        }
      }
    } else {
      // Se for uma tab diferente, ativa essa tab e mostra conteúdo de acordo com o tipo
      setActiveTab(tab);
      setIsMinimized(false);
      
      // Expandir automaticamente para resumo e relatório
      if (tab === "summary" || tab === "report") {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    }
  };
  
  // Função para expandir completamente a aba ativa
  const expandTab = () => {
    setIsExpanded(true);
    setIsMinimized(false);
  };
  
  // Função para recolher parcialmente a aba ativa (mostra cabeçalho)
  const collapseTab = () => {
    setIsExpanded(false);
    setIsMinimized(false);
  };
  
  // Função para minimizar completamente a aba ativa
  const minimizeTab = () => {
    setIsMinimized(true);
    setIsExpanded(false);
  };
  
  // Efeito de inicialização - garante que todas as abas comecem minimizadas
  useEffect(() => {
    // Configuração inicial: todas as abas minimizadas por padrão
    setIsMinimized(true);
    setIsExpanded(false);
  }, []);
  
  // Quando a rota é calculada (calculatedRoute muda), ativar a aba de resumo
  // E também atualizar os POIs filtrados
  useEffect(() => {
    if (calculatedRoute && calculatedRoute.length > 0) {
      // Ativar a aba de resumo, mas manter o estado minimizado
      setActiveTab("summary");
      
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
            if (allCitiesInRoute.size > 0) {
              params.set('cities', Array.from(allCitiesInRoute).join(','));
            }
            if (highwaysInRoute.size > 0) {
              params.set('highways', Array.from(highwaysInRoute).join(','));
            }
            
            // Chamar API do backend
            const response = await fetch(`/api/weighing-stations?${params.toString()}`);
            
            if (!response.ok) {
              throw new Error(`Erro ao buscar balanças: ${response.status}`);
            }
            
            const additionalStations = await response.json();
            console.log(`API retornou ${additionalStations.length} balanças adicionais`);
            
            // Combinar com os POIs existentes
            const updatedPOIs = [...poisAlongRoute];
            
            // Adicionar apenas novas balanças que não existem na lista atual
            additionalStations.forEach((station: any) => {
              const isDuplicate = updatedPOIs.some(existingPoi => 
                existingPoi.id === station.id || 
                (existingPoi.name === station.name && 
                 existingPoi.type === station.type)
              );
              
              if (!isDuplicate) {
                updatedPOIs.push(station);
              }
            });
            
            // Filtragem baseada em cidade - verificação mais estrita
            const newFilteredPOIs = updatedPOIs.filter(poi => {
              // 1. Verificar pelo campo city do POI
              if (poi.city) {
                const poiCity = poi.city.toLowerCase();
                const cityMatch = Array.from(allCitiesInRoute).some(city => 
                  poiCity.includes(city) || city.includes(poiCity)
                );
                
                if (cityMatch) {
                  console.log(`POI "${poi.name}" incluído por cidade "${poi.city}"`);
                  return true;
                }
              }
              
              // 2. Verificar pelo campo roadName do POI (comparar com rodovias na rota)
              if (poi.roadName) {
                const poiRoad = poi.roadName.toUpperCase();
                const roadMatch = Array.from(highwaysInRoute).some(road => 
                  poiRoad.includes(road) || road.includes(poiRoad)
                );
                
                if (roadMatch) {
                  console.log(`POI "${poi.name}" incluído por rodovia "${poi.roadName}"`);
                  return true;
                }
              }
              
              // 3. Verificar pelo nome do POI (pode conter nome da cidade)
              if (poi.name) {
                const poiName = poi.name.toLowerCase();
                const nameMatch = Array.from(allCitiesInRoute).some(city => 
                  poiName.includes(city) || city.includes(poiName)
                );
                
                if (nameMatch) {
                  console.log(`POI "${poi.name}" incluído por nome`);
                  return true;
                }
              }
              
              // 4. Se chegou aqui, este POI não está na rota atual
              console.log(`POI "${poi.name}" EXCLUÍDO por não estar na rota atual`);
              return false;
            });
            
            console.log("POIs filtrados para a rota atual:", newFilteredPOIs.map(p => p.name));
            setFilteredPOIs(newFilteredPOIs);
            
          } catch (error) {
            console.error("Erro ao buscar balanças adicionais:", error);
            
            // Em caso de erro, continuar com a filtragem normal
            // Filtragem baseada em cidade - verificação mais estrita
            const newFilteredPOIs = poisAlongRoute.filter(poi => {
              // 1. Verificar pelo campo city do POI
              if (poi.city) {
                const poiCity = poi.city.toLowerCase();
                const cityMatch = Array.from(allCitiesInRoute).some(city => 
                  poiCity.includes(city) || city.includes(poiCity)
                );
                
                if (cityMatch) {
                  console.log(`POI "${poi.name}" incluído por cidade "${poi.city}"`);
                  return true;
                }
              }
              
              // 2. Verificar pelo nome do POI (pode conter nome da cidade)
              if (poi.name) {
                const poiName = poi.name.toLowerCase();
                const nameMatch = Array.from(allCitiesInRoute).some(city => 
                  poiName.includes(city) || city.includes(poiName)
                );
                
                if (nameMatch) {
                  console.log(`POI "${poi.name}" incluído por nome`);
                  return true;
                }
              }
              
              // 3. Se chegou aqui, este POI não está na rota atual
              console.log(`POI "${poi.name}" EXCLUÍDO por não estar na rota atual`);
              return false;
            });
            
            console.log("POIs filtrados para a rota atual:", newFilteredPOIs.map(p => p.name));
            setFilteredPOIs(newFilteredPOIs);
          }
        };
        
        // Executar a função assíncrona
        fetchAdditionalWeighingStations();
        
      } else {
        // Sem rota, não mostrar nenhum POI
        setFilteredPOIs([]);
      }
    }
  }, [calculatedRoute, poisAlongRoute]);

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
  
  // Função auxiliar para detectar POIs duplicados
  function isDuplicatePOI(poi1: PointOfInterest, poi2: PointOfInterest): boolean {
    // Se for o mesmo ID, é duplicado
    if (poi1.id === poi2.id) return true;
    
    // Verificar duplicação específica para balanças (km 150 e Luís Antônio são a mesma)
    if ((poi1.name.includes("Luís Antônio") && poi2.name.includes("km 150")) ||
        (poi1.name.includes("km 150") && poi2.name.includes("Luís Antônio"))) {
      return true;
    }
    
    return false;
  }
  
  // Verificar se estamos com a rota para Ribeirão Preto
  const isRibeiraoPretoRoute = calculatedRoute ? calculatedRoute.some(
    location => location.address && location.address.includes("Ribeirão Preto")
  ) : false;
  
  // Contagem dos tipos de POI para mostrar no resumo
  const tollsOnRoute = filteredPOIs.filter(poi => poi.type === 'toll');
  const balancesOnRoute = filteredPOIs.filter(poi => poi.type === 'weighing_station');
  
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
          onClick={() => toggleTab("summary")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "summary"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Resumo da Rota
        </button>
        <button
          onClick={() => toggleTab("report")}
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
      {activeTab === "summary" && !isMinimized && (
        <div className={`p-4 ${isExpanded ? 'h-[80vh] overflow-y-auto' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold">Resumo da Rota</h2>
            <div className="flex space-x-2">
              <button
                onClick={minimizeTab}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Ocultar
              </button>
              <button
                onClick={isExpanded ? collapseTab : expandTab}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                {isExpanded ? 
                  <><Minimize2 className="h-3 w-3" /> Recolher</> : 
                  <><Maximize2 className="h-3 w-3" /> Expandir</>
                }
              </button>
            </div>
          </div>
          
          {routeInfo ? (
            <div className="space-y-3">
              {/* Sequência de Rota - Visualização Ultra Minimalista e Fluida */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-3 border border-blue-100 col-span-1 sm:col-span-2 mb-2 route-sequence-container">
                <h3 className="text-xs font-medium mb-3 text-blue-600">Sequência da Rota</h3>
                <div className="flex items-center justify-start overflow-x-auto py-2 pr-4 max-w-full">
                  {calculatedRoute && calculatedRoute.map((location, index) => (
                    <div key={index} className="flex items-center min-w-max">
                      {/* Local atual */}
                      <div className="flex flex-col items-center z-10">
                        <div 
                          className={`rounded-full w-7 h-7 flex items-center justify-center text-xs font-medium text-white route-point
                            ${index === 0 ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}
                          style={{ 
                            animationDelay: `${index * 0.15}s`,
                            boxShadow: index === 0 ? '0 3px 6px rgba(244, 63, 94, 0.2)' : '0 3px 6px rgba(37, 99, 235, 0.2)'
                          }}
                        >
                          {index}
                        </div>
                        <div 
                          className="text-xs font-medium mt-2 max-w-[85px] truncate text-center route-label"
                          style={{ animationDelay: `${index * 0.15 + 0.1}s` }}
                        >
                          {location.name || extractCityFromAddress(location.address || '')}
                        </div>
                      </div>
                      
                      {/* Linha conectora com seta animada (se não for o último) */}
                      {index < calculatedRoute.length - 1 && (
                        <div 
                          className="route-connector mx-1 relative"
                          style={{ 
                            width: '5rem', 
                            animationDelay: `${index * 0.15 + 0.2}s`,
                          }}
                        >
                          {/* Seta animada */}
                          <svg 
                            className="route-arrow" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ 
                              animationDelay: `${index * 0.15 + 0.7}s`,
                              animationDuration: `${3 - (index * 0.2)}s` 
                            }}
                          >
                            <path 
                              d="M13 5L20 12L13 19M4 12H20" 
                              stroke="currentColor" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Distância e Duração */}
                <div className="bg-white rounded p-2 border border-gray-100">
                  <h3 className="text-xs font-medium mb-1 text-primary">Distância e Duração</h3>
                  <div className="text-sm font-medium">
                    {formatDistance(routeInfo.totalDistance)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDuration(routeInfo.totalDuration)}
                  </div>
                </div>
                
                {/* Custos */}
                <div className="bg-white rounded p-2 border border-gray-100">
                  <h3 className="text-xs font-medium mb-1 text-primary">Custos Estimados</h3>
                  <div className="text-sm font-medium">
                    {formatCurrency(routeInfo.totalCost)} Total
                  </div>
                  <div className="text-xs text-gray-500">
                    Pedágios: {formatCurrency(routeInfo.tollCost)}
                    {vehicleType && (
                      <span className="ml-1">
                        (para {vehicleType.name.toLowerCase()})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Combustível: {formatCurrency(routeInfo.fuelCost)}
                    {fuelConsumption > 0 && (
                      <span className="ml-1">
                        ({fuelConsumption.toFixed(1)}L · {fuelEfficiency} km/L)
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Eventos e Restrições - Nova Versão Combinada */}
                <div className="bg-white rounded p-2 border border-gray-100">
                  <h3 className="text-xs font-medium mb-1 text-primary">Eventos nas Cidades da Rota</h3>
                  
                  {(() => {
                    // Extrair o nome exato das cidades da rota usando a função extractCityFromAddress
                    const citiesInRoute = new Set<string>();
                    
                    // Adicionar a origem (Dois Córregos)
                    citiesInRoute.add("Dois Córregos");
                    
                    // Adicionar todas as cidades da rota
                    if (calculatedRoute) {
                      calculatedRoute.forEach(location => {
                        if (location.name) {
                          citiesInRoute.add(location.name.split(',')[0].trim());
                        }
                        if (location.address) {
                          const cityMatch = location.address.match(/([^,]+?)(?:\s*-\s*[A-Z]{2})/i);
                          if (cityMatch && cityMatch[1]) {
                            citiesInRoute.add(cityMatch[1].trim());
                          }
                        }
                        // Adicionar manualmente cidades importantes
                        const address = location.address?.toLowerCase() || '';
                        if (address.includes('ribeirao') || address.includes('ribeirão')) {
                          citiesInRoute.add('Ribeirão Preto');
                        }
                        if (address.includes('campinas')) {
                          citiesInRoute.add('Campinas');
                        }
                      });
                    }
                    
                    // Criar um mapa para saber a posição de cada cidade na rota
                    const cityPositionMap = new Map();
                    
                    // Preencher o mapa com posições de cidades
                    Array.isArray(calculatedRoute) && calculatedRoute.forEach((location, index) => {
                      const cityName = extractCityFromAddress(location.address);
                      if (cityName && !cityPositionMap.has(cityName)) {
                        cityPositionMap.set(cityName, index);
                      }
                    });
                    
                    // Filtrar e ordenar eventos das cidades na rota
                    const filteredAndSortedEvents = cityEvents && Array.isArray(cityEvents) ? [...cityEvents]
                      // Primeiro filtramos para manter apenas eventos de cidades na rota
                      .filter(event => {
                        // Verificar se a cidade do evento está na rota
                        return Array.from(citiesInRoute).some(city => 
                          event.cityName.includes(city) || city.includes(event.cityName)
                        );
                      })
                      // Depois ordenamos os eventos filtrados
                      .sort((a, b) => {
                        // Ordem crescente por data
                        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                      }) : [];
                    
                    // Verificar se temos eventos para mostrar
                    if (!startDate || !endDate) {
                      return (
                        <div className="text-xs text-gray-500">
                          Selecione datas para ver eventos na rota
                        </div>
                      );
                    } else if (filteredAndSortedEvents.length === 0) {
                      return (
                        <div className="text-xs text-gray-500">
                          Nenhum evento no período selecionado
                        </div>
                      );
                    }
                    
                    // Mostrar até 3 eventos mais próximos
                    const eventsToShow = filteredAndSortedEvents.slice(0, 3);
                    return (
                      <ul className="text-xs space-y-1">
                        {eventsToShow.map((event, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className={`inline-block w-2 h-2 rounded-full mt-1 mr-1 
                              ${event.eventType === 'holiday' ? 'bg-red-600' : 
                                event.eventType === 'festival' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                            </span>
                            <span>
                              <span className="font-medium">{event.cityName}:</span> {event.eventName}
                              <span className="block text-gray-500">
                                {new Date(event.startDate).toLocaleDateString('pt-BR')}
                                {event.startDate !== event.endDate ? 
                                  ` até ${new Date(event.endDate).toLocaleDateString('pt-BR')}` : ''}
                              </span>
                            </span>
                          </li>
                        ))}
                        {filteredAndSortedEvents.length > 3 && (
                          <li className="text-xxs text-gray-500 italic">
                            + {filteredAndSortedEvents.length - 3} outros eventos
                          </li>
                        )}
                      </ul>
                    );
                  })()}
                </div>
                
                {/* Restrições para Caminhões */}
                <div className="bg-white rounded p-2 border border-gray-100 mt-2">
                  <h3 className="text-xs font-medium mb-1 text-primary">Restrições para Caminhões</h3>
                  
                  {(() => {
                    // Identificar as cidades na rota para filtrar restrições
                    const citiesInRoute = new Set<string>();
                    
                    // Adicionar a origem (Dois Córregos)
                    citiesInRoute.add("Dois Córregos");
                    
                    // Adicionar todas as cidades da rota
                    if (calculatedRoute) {
                      calculatedRoute.forEach(location => {
                        if (location.name) {
                          citiesInRoute.add(location.name.split(',')[0].trim());
                        }
                        if (location.address) {
                          const cityMatch = location.address.match(/([^,]+?)(?:\s*-\s*[A-Z]{2})/i);
                          if (cityMatch && cityMatch[1]) {
                            citiesInRoute.add(cityMatch[1].trim());
                          }
                        }
                        // Adicionar manualmente cidades importantes
                        const address = location.address?.toLowerCase() || '';
                        if (address.includes('ribeirao') || address.includes('ribeirão')) {
                          citiesInRoute.add('Ribeirão Preto');
                        }
                        if (address.includes('campinas')) {
                          citiesInRoute.add('Campinas');
                        }
                      });
                    }
                    
                    // Filtrar as restrições para mostrar apenas as da rota atual
                    const restrictionsToShow = truckRestrictions && calculatedRoute ? 
                      truckRestrictions.filter(r => {
                        const cityName = r.cityName.toLowerCase();
                        return Array.from(citiesInRoute).some(city => {
                          const normalizedCity = city.toLowerCase();
                          return cityName.includes(normalizedCity) || normalizedCity.includes(cityName);
                        });
                      }) : [];
                    
                    // Verificar se temos restrições para mostrar
                    if (restrictionsToShow.length === 0) {
                      return (
                        <div className="text-xs text-gray-500">
                          Nenhuma restrição nas cidades da rota
                        </div>
                      );
                    }
                    
                    // Mostrar todas as restrições
                    return (
                      <ul className="text-xs space-y-1">
                        {restrictionsToShow.map((restriction, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary mt-1 mr-1"></span>
                            <span>
                              <span className="font-medium">{restriction.cityName}:</span> {restriction.restriction}
                              <span className="block text-gray-500">
                                {restriction.startTime}-{restriction.endTime} | {restriction.applicableVehicles}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Nenhuma rota calculada
            </div>
          )}
        </div>
      )}

      {/* Detailed Report Tab */}
      {activeTab === "report" && !isMinimized && (
        <div className={`p-4 ${isExpanded ? 'h-[80vh] overflow-y-auto' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold">Relatório Detalhado</h2>
            <div className="flex space-x-2">
              <button
                onClick={minimizeTab}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Ocultar
              </button>
              <button
                onClick={isExpanded ? collapseTab : expandTab}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                {isExpanded ? 
                  <><Minimize2 className="h-3 w-3" /> Recolher</> : 
                  <><Maximize2 className="h-3 w-3" /> Expandir</>
                }
              </button>
            </div>
          </div>
          
          {routeInfo ? (
            <RouteReport 
              origin={origin}
              calculatedRoute={calculatedRoute}
              routeInfo={routeInfo}
              vehicleType={vehicleType}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <div className="text-center text-gray-500 py-4">
              Nenhuma rota calculada ainda
            </div>
          )}
        </div>
      )}
    </div>
  );
}