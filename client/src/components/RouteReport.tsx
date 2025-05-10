import React, { useRef, useState } from 'react';
import { Location, PointOfInterest, CityEvent, TruckRestriction } from '@/lib/types';
import { formatDistance, formatDuration, formatCurrency } from '@/lib/mapUtils';
import { extractCityFromAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { FaWhatsapp } from 'react-icons/fa';

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
  routeName?: string;
  onRouteNameChange?: (name: string) => void;
}

// Componente para relatório detalhado da rota com layout otimizado para a visualização expandida
export default function RouteReport({
  origin,
  calculatedRoute,
  routeInfo,
  vehicleType,
  startDate,
  endDate,
  routeName = "",
  onRouteNameChange = () => {}
}: RouteReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  // Extrair cidades dos destinos para consultas usando a função extractCityFromAddress
  const destinationCityNames = calculatedRoute 
    ? calculatedRoute.map(location => {
        if (location.address) {
          // Usar a função centralizada para extrair nome da cidade
          const cityName = extractCityFromAddress(location.address);
          if (cityName) {
            return cityName;
          }
        }
        
        // Se a função de extração falhar ou não houver endereço, usa o nome do local
        // Mas verifica se é nome de rua primeiro
        if (location.name.startsWith("R.") || location.name.startsWith("Av.")) {
          const cityName = extractCityFromAddress(location.address);
          return cityName || location.name;
        }
        
        return location.name;
      }).filter(Boolean) as string[]
    : [];
    
  // Garante que temos apenas as cidades que estão na rota e não todas
  // 1. Garantir que Dois Córregos (origem) está sempre na lista
  if (!destinationCityNames.includes("Dois Córregos")) {
    destinationCityNames.push("Dois Córregos");
  }
  
  // 2. Verificar se Ribeirão Preto está presente nos endereços
  const hasRibeiraoPreto = calculatedRoute ? calculatedRoute.some(location => 
    location.address && location.address.includes("Ribeirão Preto")
  ) : false;
  
  if (hasRibeiraoPreto && !destinationCityNames.includes("Ribeirão Preto")) {
    destinationCityNames.push("Ribeirão Preto");
  }
  
  console.log("Cidades na rota:", destinationCityNames);

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

  // Buscar eventos das cidades - melhorado para enviar os parâmetros de data
  const { data: cityEvents = [] } = useQuery({ 
    queryKey: ['/api/city-events', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      
      try {
        console.log("Buscando eventos para datas:", startDate, "até", endDate);
        
        // Enviar parâmetros de data para a API
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        
        const response = await fetch(`/api/city-events?${queryParams.toString()}`);
        console.log("Resposta do servidor:", response.status);
        const data = await response.json();
        console.log("Eventos recebidos:", data.length, data);
        return data;
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        return [];
      }
    },
    enabled: !!startDate && !!endDate
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
    document.title = routeName 
      ? `${routeName} - ${origin?.name || 'Dois Córregos'} - ${new Date().toLocaleDateString()}`
      : `Relatório de Rota - ${origin?.name || 'Dois Córregos'} - ${new Date().toLocaleDateString()}`;
    
    // Imprimir
    window.print();
    
    // Restaurar o título original
    document.title = originalTitle;
  };
  
  // Função para compartilhar relatório via WhatsApp
  const handleShareWhatsApp = () => {
    // Verificar se temos os pontos necessários
    if (!origin || !calculatedRoute || calculatedRoute.length === 0) {
      return;
    }
    
    // Criar o link do Google Maps
    let googleMapsUrl = "https://www.google.com/maps/dir/?api=1";
    
    // Adicionar origem
    googleMapsUrl += `&origin=${origin.lat},${origin.lng}`;
    
    // Adicionar último destino
    const finalDestination = calculatedRoute[calculatedRoute.length - 1];
    googleMapsUrl += `&destination=${finalDestination.lat},${finalDestination.lng}`;
    
    // Adicionar pontos intermediários (waypoints)
    if (calculatedRoute.length > 2) {
      const waypoints = calculatedRoute
        .slice(1, calculatedRoute.length - 1) // Excluir o destino final
        .map(loc => `${loc.lat},${loc.lng}`)
        .join('|');
      
      // Adicionar waypoints sem o prefixo "via:"
      googleMapsUrl += `&waypoints=${encodeURIComponent(waypoints)}`;
    }
    
    // Adicionar modo de transporte
    googleMapsUrl += "&travelmode=driving";
    
    // Criar texto do relatório para compartilhar - simplificado
    let text = routeName 
      ? `📍 *${routeName}* 📍\n\n` 
      : "📍 *Rota de Entrega* 📍\n\n";
    
    // Adicionar link para abrir no Google Maps
    text += `${googleMapsUrl}`;
    
    // Compartilhar via WhatsApp
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappURL, '_blank');
  };

  // Log para debug
  console.log('RouteReport - Debug Info:', {
    routeInfo,
    destinationCityNames,
    cityEvents,
    truckRestrictions,
    poisAlongRoute
  });

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
        <div className="flex gap-2">
          <Button 
            onClick={handlePrint} 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs py-0 px-2"
          >
            Imprimir
          </Button>
          <Button 
            onClick={handleShareWhatsApp}
            variant="outline" 
            size="sm"
            className="h-6 text-xs py-0 px-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 flex items-center"
          >
            <FaWhatsapp className="mr-1 text-sm" /> 
            <span className="hidden sm:inline">Compartilhar</span>
            <span className="sm:hidden">WhatsApp</span>
          </Button>
          <Button 
            onClick={() => {
              // Criar e abrir link para o Google Maps
              if (!origin || !calculatedRoute || calculatedRoute.length === 0) return;
              
              // URL base do Google Maps
              let url = "https://www.google.com/maps/dir/?api=1";
              
              // Adicionar origem
              url += `&origin=${origin.lat},${origin.lng}`;
              
              // Adicionar destino final
              const finalDestination = calculatedRoute[calculatedRoute.length - 1];
              url += `&destination=${finalDestination.lat},${finalDestination.lng}`;
              
              // Adicionar waypoints (pontos intermediários)
              if (calculatedRoute.length > 2) {
                const waypoints = calculatedRoute
                  .slice(1, calculatedRoute.length - 1)
                  .map(loc => `${loc.lat},${loc.lng}`)
                  .join('|');
                url += `&waypoints=${encodeURIComponent(waypoints)}`;
              }
              
              // Adicionar modo
              url += "&travelmode=driving";
              
              // Abrir no Google Maps
              window.open(url, '_blank');
            }}
            variant="outline" 
            size="sm"
            className="h-6 text-xs py-0 px-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 flex items-center"
          >
            <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <span className="hidden sm:inline">Abrir no Maps</span>
            <span className="sm:hidden">Maps</span>
          </Button>
        </div>
      </div>
      
      <div ref={reportRef} className="print:p-4 report-container">
        <div className="border border-gray-200 rounded-sm p-2 mb-2">
          <h3 className="text-xs font-semibold mb-1 text-primary">Informações da Rota</h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="text-gray-600">Nome da Rota:</div>
            <div className="font-medium flex items-center gap-1">
              <div className="flex-1">
                {isEditingName ? (
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => onRouteNameChange(e.target.value)}
                    placeholder="Ex: Rota de Entrega Semanal"
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded"
                    autoFocus
                  />
                ) : (
                  <div className="py-0.5 px-1">
                    {routeName || "Sem nome"}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsEditingName(!isEditingName)} 
                className="text-primary hover:text-primary-dark"
                title={isEditingName ? "Salvar" : "Editar"}
              >
                {isEditingName ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="text-gray-600">Origem:</div>
            <div className="font-medium">0. {origin.name}</div>
            
            <div className="text-gray-600">Destinos:</div>
            <div>
              {calculatedRoute.slice(1).map((location, index) => (
                <div key={index} className="font-medium">
                  {index+1}. {location.name.startsWith("R.") || location.name.startsWith("Av.") 
                    ? extractCityFromAddress(location.address) 
                    : location.name}
                </div>
              ))}
            </div>
            
            <div className="text-gray-600">Tipo:</div>
            <div className="font-medium">Caminhão</div>
            
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
          <h3 className="text-xs font-semibold mb-1 text-primary">Sequência de Rota</h3>
          
          {/* Versão animada da rota */}
          <div className="space-y-1 relative">
            {/* Linha de conexão entre os pontos */}
            <div className="absolute left-[9px] top-[12px] w-[2px] h-[calc(100%-24px)] bg-blue-100 z-0"></div>
            
            {[origin, ...calculatedRoute.slice(1)].map((location, index) => (
              <div 
                key={index} 
                className={`flex items-start relative z-10 animate-fadeInUp`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs
                  ${index === 0 
                    ? 'bg-blue-500 text-white' 
                    : index === calculatedRoute.length 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700'}`}
                >
                  {index === 0 ? '0' : index}
                </div>
                <div>
                  <div className="font-medium">
                    {location.name.startsWith("R.") || location.name.startsWith("Av.") 
                      ? extractCityFromAddress(location.address) 
                      : location.name}
                  </div>
                  <div className="text-xs text-gray-500">{location.address}</div>
                </div>
                
                {/* Indicador de direção se não for o último ponto */}
                {index < calculatedRoute.length && (
                  <div className="absolute left-[9px] top-[22px] h-6 flex items-center justify-center">
                    <div className="w-[10px] h-[10px] rotate-45 border-r-2 border-b-2 border-blue-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        

        
        {/* Eventos nas Cidades - Modificado para sempre mostrar */}
        <div className="border border-gray-200 rounded-sm p-2 mb-2">
          <h3 className="text-xs font-semibold mb-1 text-primary">Eventos nas Cidades</h3>
          <div className="space-y-1">
            {cityEvents && cityEvents.length > 0 ? (
              (() => {
                // Extrair o nome exato das cidades da rota usando a nova função de extração
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
                
                // Log para debug
                console.log("Eventos disponíveis:", JSON.stringify(cityEvents));
                console.log("Cidades extraídas da rota:", JSON.stringify(Array.from(citiesInRoute)));
                
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
                  <div key={event.id} className="mb-1 pb-1 border-b border-gray-50 last:border-b-0 last:mb-0 last:pb-0 animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-start">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 mt-1 
                        ${event.eventType === 'holiday' ? 'bg-red-600' : 
                          event.eventType === 'festival' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                      </span>
                      <div>
                        <span className="font-medium">{event.eventName}</span>
                        <span className="text-gray-500 ml-1">
                          ({event.cityName}, {new Date(event.startDate).toLocaleDateString('pt-BR')}
                          {event.startDate !== event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('pt-BR')}`})
                        </span>
                        {event.description && (
                          <div className="text-gray-500 text-xs">{event.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <div className="text-gray-500 text-center py-2">
                Nenhum evento encontrado para esta data/localização
              </div>
            )}
          </div>
        </div>
        
        {/* Restrições para Caminhões */}
        {vehicleType && vehicleType.type.includes('truck') && truckRestrictions && truckRestrictions.length > 0 && (
          <div className="border border-gray-200 rounded-sm p-2 mb-2">
            <h3 className="text-xs font-semibold mb-1 text-primary">Restrições para Caminhões</h3>
            <div className="space-y-1">
              {(() => {
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
                ));
              })()}
            </div>
          </div>
        )}
        
        {vehicleType && vehicleType.type !== 'car' && (
          <div className="text-center text-xxs text-gray-400 mt-2">
            * Valor do pedágio ajustado para caminhão: 
            {vehicleType.type === 'motorcycle' ? ' 50% do valor para carros.' : 
             vehicleType.type === 'truck1' ? ' 200% do valor para carros.' : 
             vehicleType.type === 'truck2' ? ' 300% do valor para carros.' : ''}
          </div>
        )}
        <div className="text-center text-xs text-gray-400 mt-2 print:mt-8">
          Gerado em {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Estilos para impressão já implementados via CSS global */}
    </div>
  );
}