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
    }
  };
  
  // Quando a rota é calculada (calculatedRoute muda), ativar a aba de resumo
  // E também atualizar os POIs filtrados
  useEffect(() => {
    if (calculatedRoute && calculatedRoute.length > 0) {
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
            additionalStations.forEach(station => {
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
  
  // Função auxiliar para detectar POIs duplicados - algoritmo aprimorado
  function isDuplicatePOI(poi1: PointOfInterest, poi2: PointOfInterest): boolean {
    // Se for o mesmo ID, é duplicado
    if (poi1.id === poi2.id) return true;
    
    // Verificar duplicação específica para balanças (km 150 e Luís Antônio são a mesma)
    if ((poi1.name.includes("Luís Antônio") && poi2.name.includes("km 150")) ||
        (poi1.name.includes("km 150") && poi2.name.includes("Luís Antônio"))) {
      return true;
    }
    
    // Para a rota Ribeirão Preto, preservar todos os pedágios importantes
    if (isRibeiraoPretoRoute && poi1.type === "toll" && poi2.type === "toll") {
      // Lista de pedágios críticos na SP-255, cada um deve aparecer apenas uma vez
      const criticalTolls = ["Guatapará", "Boa Esperança", "Ribeirão Preto"];
      
      // Para cada pedágio crítico, verificar se ambos os POIs são o mesmo pedágio crítico
      for (const criticalName of criticalTolls) {
        if (poi1.name.includes(criticalName) && poi2.name.includes(criticalName)) {
          // Encontramos um par de duplicatas do mesmo pedágio crítico 
          console.log(`Pedágio crítico duplicado detectado: ${criticalName}`);
          return true;
        }
      }
      
      // Se chegou aqui, são pedágios de nomes diferentes - não são duplicatas
      // mesmo que estejam próximos geograficamente
      if (criticalTolls.some(name => poi1.name.includes(name)) && 
          criticalTolls.some(name => poi2.name.includes(name))) {
        return false;
      }
    }
    
    // Verificação específica para o pedágio de Boa Esperança do Sul (duas formas de nomeá-lo)
    if ((poi1.type === 'toll' && poi1.name.includes("Boa Esperança")) &&
        (poi2.type === 'toll' && poi2.name.includes("Boa Esperança"))) {
      console.log("Removendo duplicata de pedágio de Boa Esperança do Sul", poi1.name, poi2.name);
      return true;
    }
    
    // Verificar duplicação específica para pedágios de SP-255 por coordenadas próximas
    if (poi1.type === 'toll' && poi2.type === 'toll' &&
        poi1.roadName === poi2.roadName &&
        Math.abs(Number(poi1.lat) - Number(poi2.lat)) < 0.005 &&
        Math.abs(Number(poi1.lng) - Number(poi2.lng)) < 0.005) {
      return true;
    }
    
    return false;
  }
  
  // Vamos filtrar os POIs para incluir apenas os que realmente estão na rota
  // Utilizando um algoritmo universal que funciona para qualquer rota
  
  // Extrair cidades da rota atual
  const citiesInRoute = new Set<string>();
  
  // Identificar origem 
  if (origin) {
    const cityMatch = origin.address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
    if (cityMatch && cityMatch[1]) {
      citiesInRoute.add(cityMatch[1]);
    }
    if (origin.name) citiesInRoute.add(origin.name.split(',')[0].trim());
  }
  
  // Identificar cidades de destino na rota
  if (calculatedRoute && calculatedRoute.length > 0) {
    calculatedRoute.forEach(loc => {
      // Extrair do endereço, formato "Cidade - UF, Brasil"
      if (loc.address) {
        const cityMatch = loc.address.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*([A-Z]{2})/);
        if (cityMatch && cityMatch[1]) {
          citiesInRoute.add(cityMatch[1]);
        }
      }
      
      // Extrair do nome, que pode conter cidade
      if (loc.name) {
        // Tentar extrair o nome da cidade da primeira parte antes da vírgula
        const cityName = loc.name.split(',')[0].trim();
        citiesInRoute.add(cityName);
      }
    });
  }
  
  console.log("Cidades detectadas para eventos:", Array.from(citiesInRoute));
  
  // Determinar automaticamente as rodovias com base nas cidades
  const roadsInRoute = new Set<string>();
  
  // Detectar as principais rotas
  const isRibeiraoPretoRoute = Array.from(citiesInRoute).some(city => 
    city.includes("Ribeirão") || city.includes("Preto"));
  const isBauruRoute = Array.from(citiesInRoute).some(city => 
    city.includes("Bauru") || city.includes("Jaú") || city.includes("Botucatu"));
    
  // Inferir as rodovias baseado nas cidades detectadas
  if (isRibeiraoPretoRoute) {
    roadsInRoute.add("SP-255");
  }
  
  if (isBauruRoute) {
    roadsInRoute.add("SP-225");
    roadsInRoute.add("SP-300");
  }
  
  // Se não detectamos nenhuma rodovia específica, adicionar a rodovia padrão
  if (roadsInRoute.size === 0) {
    roadsInRoute.add("SP-255"); // Rodovia padrão de Dois Córregos
  }
  
  console.log("Rodovias relevantes para a rota:", Array.from(roadsInRoute));
  
  // ALGORITMO UNIVERSAL: Filtrar baseado nos POIs que já foram adicionados no mapa
  // Assumir que o componente de mapa já fez a filtragem precisa
  
  // Algoritmo unificado e simplificado para exibição de POIs no painel de informações
  // Usa as mesmas regras do mapa, mas com lógica específica para o relatório
  
  // USAR EXCLUSIVAMENTE os POIs que vieram da API AILOG através do mapa
  // Estes já foram filtrados corretamente com base na rota
  // A filtragem é feita no useEffect e armazenada no estado filteredPOIs
  
  // Verificar se temos pedágios da AILOG na lista
  const hasAilogTolls = poisAlongRoute.some(poi => poi.type === 'toll' && (poi as any).ailogSource === true);
  
  // Algoritmo otimizado para garantir inclusão dos pedágios corretos
  
  // A filtragem de POIs é feita no useEffect no topo deste componente
  // O resultado está armazenado no estado filteredPOIs
  
  // Para debugging
  console.log("Depurando: calculatedRoute =", calculatedRoute);
  console.log("Pontos de Atenção filtrados:", filteredPOIs.map(p => p.name));
  
  // Separar os pontos de interesse por tipo (usando o filteredPOIs definido no state)
  const tollsOnRoute = filteredPOIs.filter(poi => poi.type === 'toll');
  const balancesOnRoute = filteredPOIs.filter(poi => poi.type === 'weighing_station');
  // Não temos áreas de descanso implementadas ainda
  const restAreasOnRoute: typeof poisAlongRoute = [];
  
  // NÃO forçamos mais a inclusão de pedágios - confiamos exclusivamente nos dados da API AILOG
  
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
          onClick={() => toggleTab("events")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "events"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Eventos
        </button>
        <button
          onClick={() => toggleTab("restrictions")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "restrictions"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Restrições
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
      {activeTab === "summary" && (
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
                  
                  <div className="mt-2 text-xs border-t border-gray-100 pt-1">
                    <div className="grid grid-cols-2">
                      <div>
                        <div>
                          Pedágios ({vehicleType?.name}): 
                          <span className="font-medium ml-1">{formatCurrency(routeInfo.tollCost)}</span>
                          <span className="text-gray-500 text-xs ml-1">
                            ({(vehicleType?.tollMultiplier || 100)/100}x)
                          </span>
                        </div>
                        <div>Combustível: <span className="font-medium">{formatCurrency(routeInfo.fuelCost)}</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500">Total:</div>
                        <div className="font-bold text-primary">{formatCurrency(routeInfo.totalCost)}</div>
                      </div>
                    </div>
                    {vehicleType && vehicleType.type !== 'car' && (
                      <div className="mt-1 text-xxs text-gray-500 italic">
                        * Valor do pedágio ajustado para {vehicleType.name.toLowerCase()}: 
                        {vehicleType.type === 'motorcycle' ? ' 50% do valor para carros.' : 
                         vehicleType.type === 'truck1' ? ' 200% do valor para carros.' : 
                         vehicleType.type === 'truck2' ? ' 300% do valor para carros.' : ''}
                      </div>
                    )}
                  </div>
                </div>

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
            </div>
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
                
                return filteredAndSortedEvents.map((event: CityEvent, index) => (
                  <div key={event.id} className="bg-white rounded p-2 border border-gray-100 mb-1 animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-start">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 mt-1 
                        ${event.eventType === 'holiday' ? 'bg-red-600' : 
                          event.eventType === 'festival' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                      </span>
                      <div>
                        <span className="font-medium text-xs">{event.eventName}</span>
                        <div className="text-gray-500 text-xs">
                          {event.cityName}, {new Date(event.startDate).toLocaleDateString('pt-BR')}
                          {event.startDate !== event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('pt-BR')}`}
                        </div>
                        {event.description && (
                          <div className="text-gray-500 text-xs mt-1">{event.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="text-center p-2 text-gray-500 text-xs">
              Nenhum evento encontrado para este período nas cidades do trajeto.
            </div>
          )}
        </div>
      )}

      {/* Vehicle Restrictions Tab */}
      {activeTab === "restrictions" && (
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
          {vehicleType?.type.includes("truck") ? (
            truckRestrictions && Array.isArray(truckRestrictions) && truckRestrictions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
        <div className={`tab-panel ${isExpanded ? 'report-expanded' : 'p-2'}`}>
          {isExpanded && (
            <div className="report-header">
              <h2 className="text-lg font-semibold">Relatório Completo de Rota</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-3 py-1 rounded text-sm transition-colors"
              >
                <span>Fechar</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
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