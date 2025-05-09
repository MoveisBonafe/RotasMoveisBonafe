import React, { useState } from "react";
import { Location } from "@/lib/types";

interface LocationsListProps {
  origin: Location | null;
  locations: Location[];
  onRemoveLocation: (index: number) => void;
  onMoveLocationUp: (index: number) => void;
  onMoveLocationDown: (index: number) => void;
  onAddLocationClick: () => void;
  calculatedRoute?: Location[] | null; // Propriedade da rota calculada
}

export default function LocationsList({
  origin,
  locations,
  onRemoveLocation,
  onMoveLocationUp,
  onMoveLocationDown,
  onAddLocationClick,
  calculatedRoute
}: LocationsListProps) {
  const [expandedLocation, setExpandedLocation] = useState<number | null>(null);
  
  // Toggle a localização expandida
  const toggleLocation = (id: number) => {
    if (expandedLocation === id) {
      setExpandedLocation(null);
    } else {
      setExpandedLocation(id);
    }
  };

  // Função auxiliar para renderizar cada localização
  const renderLocationItem = (location: Location, index: number, sequenceNumber: number, isInRoute: boolean) => {
    // Encontra o índice original (para botões de mover para cima/baixo)
    const originalIndex = locations.findIndex(loc => loc.id === location.id);
    
    return (
      <div 
        key={location.id} 
        className={`bg-white border ${isInRoute ? 'border-green-300' : 'border-gray-200'} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}
      >
        {/* Cabeçalho do card */}
        <div 
          className="p-3 cursor-pointer flex items-start justify-between"
          onClick={() => toggleLocation(location.id)}
        >
          <div className="flex items-start flex-1">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${isInRoute ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} mr-3 flex-shrink-0`}>
              <div className="font-bold text-sm">{sequenceNumber}</div>
            </div>
          
            <div>
              <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {location.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                {location.address}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveLocation(originalIndex);
              }}
              className="text-gray-400 hover:text-red-600 p-1"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLocation(location.id);
              }}
              className="ml-1 text-gray-400 hover:text-gray-600 p-1"
            >
              <svg 
                className={`h-5 w-5 transform transition-transform duration-200 ${expandedLocation === location.id ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Detalhes expandidos */}
        {expandedLocation === location.id && (
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Coordenadas</div>
              <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                {location.lat}, {location.lng}
              </div>
            </div>
            
            {location.cep && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">CEP</div>
                <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                  {location.cep}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => onMoveLocationUp(originalIndex)}
                disabled={originalIndex === 0}
                className={`flex-1 py-1 px-2 text-xs rounded ${
                  originalIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="h-3 w-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                </svg>
                Mover acima
              </button>
              
              <button
                onClick={() => onMoveLocationDown(originalIndex)}
                disabled={originalIndex === locations.length - 1}
                className={`flex-1 py-1 px-2 text-xs rounded ${
                  originalIndex === locations.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="h-3 w-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                Mover abaixo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex-1 overflow-auto bg-gray-50 px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Destinos</h2>
        
        <div className="text-sm text-gray-500 flex items-center">
          {locations.length} destino{locations.length !== 1 ? 's' : ''}
          <button 
            onClick={onAddLocationClick}
            className="ml-2 p-1 text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none"
            title="Adicionar destino"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Bloco de origem */}
      {origin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 mr-3 flex-shrink-0">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Origem: {origin.name}
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                {origin.address}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de localizações */}
      {locations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum destino adicionado</h3>
          <p className="text-sm text-gray-500 mb-4">Adicione destinos para calcular a melhor rota</p>
          <button
            onClick={onAddLocationClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Adicionar destino
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Se temos uma rota calculada, exibimos os locais na ordem da rota otimizada */}
          {calculatedRoute && calculatedRoute.length > 1 ? (
            // Exibir locais na ordem da rota calculada (excluindo a origem)
            calculatedRoute.slice(1).map((location, index) => {
              // Numeração sequencial conforme a rota otimizada
              const sequenceNumber = index + 1;
              return renderLocationItem(location, index, sequenceNumber, true);
            })
          ) : (
            // Exibir locais na ordem original
            locations.map((location, index) => {
              const sequenceNumber = index + 1;
              return renderLocationItem(location, index, sequenceNumber, false);
            })
          )}
          
          {/* Botão adicionar mais */}
          <button
            onClick={onAddLocationClick}
            className="w-full py-2 px-3 bg-white border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Adicionar outro destino
          </button>
        </div>
      )}
    </div>
  );
}