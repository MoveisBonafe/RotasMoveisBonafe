import React from 'react';

interface RouteOption {
  id: string;
  name: string;
  description: string;
  type: 'optimized' | 'proximity' | 'distant';
  isRecommended?: boolean;
}

interface RouteAlternativesProps {
  routes: RouteOption[];
  selectedRoute?: string;
  onRouteSelect: (routeId: string) => void;
}

export default function RouteAlternatives({ 
  routes, 
  selectedRoute, 
  onRouteSelect 
}: RouteAlternativesProps) {
  const getRouteIcon = (type: string) => {
    switch (type) {
      case 'optimized':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
      case 'proximity':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      case 'distant':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
        );
    }
  };

  const getRouteColor = (type: string, isSelected: boolean) => {
    if (isSelected) {
      switch (type) {
        case 'optimized':
          return 'bg-green-500 text-white border-green-500';
        case 'proximity':
          return 'bg-orange-500 text-white border-orange-500';
        case 'distant':
          return 'bg-blue-500 text-white border-blue-500';
        default:
          return 'bg-gray-500 text-white border-gray-500';
      }
    } else {
      switch (type) {
        case 'optimized':
          return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
        case 'proximity':
          return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
        case 'distant':
          return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      }
    }
  };

  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">Rotas Alternativas</h3>
        <p className="text-sm text-gray-500 mt-1">Escolha a melhor opção para seu trajeto</p>
      </div>

      <div className="space-y-3">
        {routes.map((route) => {
          const isSelected = selectedRoute === route.id;
          const colorClasses = getRouteColor(route.type, isSelected);
          
          return (
            <button
              key={route.id}
              onClick={() => onRouteSelect(route.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${colorClasses} ${
                isSelected ? 'shadow-lg transform scale-[1.02]' : 'shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                    <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                      {getRouteIcon(route.type)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{route.name}</h4>
                      {route.isRecommended && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          Recomendada
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                      {route.description}
                    </p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}