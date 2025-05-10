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
  initialTab?: TabType;
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
  
  // Toggle tab and expand/collapse
  const toggleTab = (tab: TabType) => {
    if (activeTab === tab) {
      setIsExpanded(!isExpanded);
    } else {
      setActiveTab(tab);
      setIsExpanded(false);
      setIsCollapsed(false);
    }
  };
  
  // When route is calculated
  useEffect(() => {
    if (calculatedRoute && calculatedRoute.length > 0) {
      setActiveTab("summary");
      setIsCollapsed(false);
      setIsExpanded(false);
      
      // Filter POIs
      const relevantPOIs = poisAlongRoute.filter(poi => {
        return true; // Simplified for now
      });
      
      setFilteredPOIs(relevantPOIs);
    }
  }, [calculatedRoute, poisAlongRoute]);
  
  return (
    <div className={`route-info-panel w-full bg-white border rounded-md shadow-sm flex flex-col ${isCollapsed ? 'route-tab-collapsed' : ''}`}>
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-3 py-2 text-xs font-medium transition-colors
            ${activeTab === "summary" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => toggleTab("summary")}
        >
          Resumo
        </button>
        <button
          className={`px-3 py-2 text-xs font-medium transition-colors
            ${activeTab === "events" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => toggleTab("events")}
        >
          Eventos
        </button>
        <button
          className={`px-3 py-2 text-xs font-medium transition-colors
            ${activeTab === "restrictions" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => toggleTab("restrictions")}
        >
          Restrições
        </button>
        <button
          className={`px-3 py-2 text-xs font-medium transition-colors
            ${activeTab === "report" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => toggleTab("report")}
        >
          Relatório
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className={`${isCollapsed ? 'route-tab-collapsed p-1' : 'p-2'} ${isExpanded ? 'expanded-tab' : ''}`}>
          {/* Header with minimize/expand buttons */}
          <div className="flex justify-between items-center w-full px-2">
            <div className="flex items-center">
              {isCollapsed && routeInfo && (
                <span className="text-xs text-gray-700 font-medium">
                  {routeInfo.totalDistance.toLocaleString('pt-BR')} km • {routeInfo.totalDuration} min
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
                aria-label={isCollapsed ? "Mostrar conteúdo" : "Ocultar conteúdo"}
              >
                {isCollapsed ? 
                  <><Maximize2 className="h-3 w-3" /> Mostrar</> : 
                  <><X className="h-3 w-3" /> Minimizar</>
                }
              </button>
            </div>
          </div>

          {/* Summary content - only visible if not collapsed */}
          {!isCollapsed && (
            <div className="route-info-summary mt-2">
              {!routeInfo ? (
                <div className="text-center p-3 text-gray-500 text-xs">
                  Calcule uma rota para ver o resumo.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Route sequence */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Sequência da Rota</h3>
                    <div className="text-xs">
                      {formatRouteSequence(origin, calculatedRoute)}
                    </div>
                  </div>

                  {/* Distance, time and cost info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Distância total</p>
                      <p className="text-sm font-semibold">
                        {formatDistance(routeInfo.totalDistance)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Tempo estimado</p>
                      <p className="text-sm font-semibold">
                        {formatDuration(routeInfo.totalDuration)}
                      </p>
                    </div>
                  </div>

                  {/* Total cost information */}
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-xs text-blue-600">Custo total estimado</p>
                    <p className="text-base font-semibold text-blue-700">
                      {formatCurrency(routeInfo.totalCost)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {vehicleType?.name || ""} • {routeInfo.fuelConsumption.toFixed(1)} litros
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className={`p-2 ${isExpanded ? 'expanded-tab' : ''}`}>
          <div className="text-center p-3 text-gray-500 text-xs">
            Selecione datas para ver eventos nas cidades do percurso.
          </div>
        </div>
      )}

      {/* Restrictions Tab */}
      {activeTab === "restrictions" && (
        <div className={`p-2 ${isExpanded ? 'expanded-tab' : ''}`}>
          <div className="text-center p-3 text-gray-500 text-xs">
            Calcule uma rota para ver restrições para caminhões.
          </div>
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