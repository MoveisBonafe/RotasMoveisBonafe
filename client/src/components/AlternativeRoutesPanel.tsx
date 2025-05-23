import { useState } from 'react';
import { Location } from '@/lib/types';
import { formatDistance, formatDuration } from '@/lib/mapUtils';

interface AlternativeRoute {
  route: Location[];
  strategy: string;
  totalDistance: number;
  estimatedTime: number;
}

interface AlternativeRoutesPanelProps {
  alternatives: AlternativeRoute[];
  onRouteSelect: (route: Location[]) => void;
  selectedRouteIndex?: number;
}

export default function AlternativeRoutesPanel({ 
  alternatives, 
  onRouteSelect, 
  selectedRouteIndex = 0 
}: AlternativeRoutesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  const getStrategyIcon = (strategy: string) => {
    if (strategy.includes("Eficiente")) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (strategy.includes("Distância")) {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    } else if (strategy.includes("Geográfica")) {
      return (
        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
      </svg>
    );
  };

  const getStrategyColor = (strategy: string, isSelected: boolean) => {
    const baseColor = strategy.includes("Eficiente") ? "green" : 
                     strategy.includes("Distância") ? "blue" : 
                     strategy.includes("Geográfica") ? "purple" : "gray";
    
    if (isSelected) {
      return `bg-${baseColor}-100 border-${baseColor}-500 text-${baseColor}-800`;
    }
    return `bg-white border-gray-200 text-gray-700 hover:bg-${baseColor}-50`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900">
            Rotas Alternativas ({alternatives.length})
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {alternatives.map((alternative, index) => (
            <div
              key={index}
              onClick={() => onRouteSelect(alternative.route)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${getStrategyColor(alternative.strategy, index === selectedRouteIndex)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStrategyIcon(alternative.strategy)}
                  <span className="font-medium text-sm">{alternative.strategy}</span>
                  {index === selectedRouteIndex && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Ativa
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatDistance(alternative.totalDistance)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ~{Math.round(alternative.estimatedTime)} min
                  </div>
                </div>
              </div>
              
              {/* Route sequence preview */}
              <div className="mt-2 text-xs text-gray-600">
                <span className="font-medium">Sequência:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {alternative.route.slice(0, 4).map((location, locIndex) => (
                    <span key={locIndex} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {locIndex + 1}. {location.name?.slice(0, 15)}
                      {location.name && location.name.length > 15 ? '...' : ''}
                    </span>
                  ))}
                  {alternative.route.length > 4 && (
                    <span className="text-gray-400 px-2 py-1">
                      +{alternative.route.length - 4} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary when collapsed */}
      {!isExpanded && (
        <div className="p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Rota ativa: {alternatives[selectedRouteIndex]?.strategy || 'Nenhuma'}
            </span>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{formatDistance(alternatives[selectedRouteIndex]?.totalDistance || 0)}</span>
              <span>~{Math.round(alternatives[selectedRouteIndex]?.estimatedTime || 0)} min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}