import { useState, useEffect } from "react";
import { RouteInfo, VehicleType, TruckRestriction, PointOfInterest, TabType, Location as LocationType } from "@/lib/types";
import { formatDistance, formatDuration, formatCurrency, formatRouteSequence } from "@/lib/mapUtils";
import { calculateFuelConsumption, getFuelEfficiency } from "@/lib/costCalculator";
import { extractCityFromAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Maximize2, Minimize2, X, Truck, Clock } from "lucide-react";
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
  
  // Função para alternar a tab e expandir/recolher
  const toggleTab = (tab: TabType) => {
    if (activeTab === tab) {
      // Se a mesma tab for clicada, alterna entre expandido e recolhido
      if (isMinimized) {
        // Se estiver completamente minimizado, mostrar conteúdo expandido
        setIsMinimized(false);
        setIsExpanded(true);
      } else if (!isExpanded) {
        // Se estiver mostrando conteúdo recolhido, expandir
        setIsExpanded(true);
      } else {
        // Se estiver expandido, minimizar completamente
        setIsMinimized(true);
        setIsExpanded(false);
      }
    } else {
      // Se for uma tab diferente, ativa essa tab e expande
      setActiveTab(tab);
      setIsMinimized(false);
      setIsExpanded(true);
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
  useEffect(() => {
    if (calculatedRoute && calculatedRoute.length > 0) {
      // Ativar a aba de resumo, mas manter o estado minimizado
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
  
  // Calcular consumo de combustível
  const fuelConsumption = routeInfo && vehicleType ? 
    calculateFuelConsumption(
      routeInfo.totalDistance, 
      vehicleType.fuelEfficiency
    ) : 0;
    
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
        <div className={`p-2 ${isExpanded ? 'expanded-tab' : 'collapsed-tab'}`}>
          <div className="flex justify-between mb-1">
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
          {!routeInfo ? (
            <div className="text-center p-3 text-gray-500 text-xs">
              Calcule uma rota para ver o resumo.
            </div>
          ) : (
            <div>
              {/* Sequência da Rota */}
              {calculatedRoute && calculatedRoute.length > 0 && (
                <div className="mb-3 bg-white rounded p-2 border border-gray-100">
                  <h3 className="text-xs font-medium mb-1 text-primary">Sequência da Rota Otimizada</h3>
                  <div className="text-xs text-gray-600">
                    {formatRouteSequence(calculatedRoute)}
                  </div>
                </div>
              )}
              
              <div className={`grid grid-cols-1 ${isExpanded ? 'lg:grid-cols-3 gap-4' : 'md:grid-cols-2 gap-2'}`}>
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

                {/* Restrições para Caminhões - Quando o veículo for caminhão */}
                {vehicleType?.type.includes("truck") && (
                  <div className="bg-white rounded p-2 border border-gray-100">
                    <div className="flex items-center gap-1 mb-2 border-b border-gray-100 pb-1">
                      <Truck className="h-3 w-3 text-red-600" />
                      <h3 className="text-xs font-medium text-primary">Restrições para Caminhões</h3>
                    </div>
                    
                    {(() => {
                      // Se não tiver dados ou se não estiver expandido, mostrar resumo
                      if (!truckRestrictions || !Array.isArray(truckRestrictions) || truckRestrictions.length === 0) {
                        return (
                          <div className="text-xs text-gray-500">
                            Nenhuma restrição para caminhões encontrada para as cidades do trajeto.
                          </div>
                        );
                      }
                      
                      // Extrair cidades dos destinos para mostrar apenas restrições relevantes
                      const routeCities = new Set<string>();
                      if (calculatedRoute) {
                        calculatedRoute.forEach(location => {
                          const addressParts = location.address.split(',');
                          if (addressParts.length > 1) {
                            const cityPart = addressParts[1].trim().split(' - ');
                            if (cityPart.length > 0) {
                              routeCities.add(cityPart[0].trim());
                            }
                          }
                          // Também extrair do nome da cidade do nome do local
                          const cityFromName = extractCityFromAddress(location.name);
                          if (cityFromName) {
                            routeCities.add(cityFromName);
                          }
                        });
                      }
                      
                      // Função para verificar se uma cidade está na rota
                      const isCityInRoute = (cityName: string): boolean => {
                        // Verificar correspondência exata
                        if (routeCities.has(cityName)) return true;
                        
                        // Verificar correspondência parcial
                        for (const routeCity of routeCities) {
                          if (routeCity.includes(cityName) || cityName.includes(routeCity)) {
                            return true;
                          }
                        }
                        
                        return false;
                      };
                      
                      // Filtrar as restrições apenas para as cidades da rota
                      const relevantRestrictions = truckRestrictions.filter(
                        r => isCityInRoute(r.cityName)
                      );
                      
                      return (
                        <div className="space-y-2 text-xs">
                          {relevantRestrictions.length === 0 ? (
                            <div className="text-gray-500">
                              Nenhuma restrição específica para as cidades do trajeto.
                            </div>
                          ) : (
                            relevantRestrictions.map((restriction, idx) => (
                              <div key={idx} className="border-b border-gray-50 pb-1 last:border-0">
                                <div className="font-medium">{restriction.cityName}</div>
                                <div className="text-2xs text-gray-600">{restriction.restriction}</div>
                                {restriction.startTime && restriction.endTime && (
                                  <div className="text-2xs text-gray-500">
                                    Horário: {restriction.startTime} - {restriction.endTime}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Route Details Report Tab */}
      {activeTab === "report" && !isMinimized && (
        <div className={`p-2 ${isExpanded ? 'expanded-tab' : 'collapsed-tab'}`}>
          <div className="flex justify-between mb-1">
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
          {!routeInfo ? (
            <div className="text-center p-3 text-gray-500 text-xs">
              Calcule uma rota para ver o relatório detalhado.
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

      {/* Minimized state for all tabs */}
      {isMinimized && (
        <div 
          className="cursor-pointer p-2 text-center text-xs text-gray-500 hover:text-gray-700"
          onClick={() => {
            setIsMinimized(false);
            setIsExpanded(true);
          }}
        >
          <div className="flex items-center justify-center gap-0.5">
            <Clock className="h-3 w-3" />
            <span>
              Clique para ver detalhes da rota
              {routeInfo && (
                <span className="ml-1">
                  ({formatDistance(routeInfo.totalDistance)}, {formatCurrency(routeInfo.totalCost)})
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}