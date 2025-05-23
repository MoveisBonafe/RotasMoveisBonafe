import React, { useState } from "react";
import { Location } from "@/lib/types";
import { extractCityFromAddress } from "@/lib/utils";

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
        className={`group bg-white border-l-4 ${isInRoute ? 'border-l-green-500 bg-green-50/30' : 'border-l-blue-500 bg-blue-50/20'} rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-1`}
      >
        {/* Layout minimalista */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center flex-1 space-x-3">
            {/* Número sequencial moderno */}
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${isInRoute ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} font-bold text-sm shadow-md`}>
              {sequenceNumber}
            </div>
            
            {/* Informações da localização */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {location.name.startsWith("R.") || location.name.startsWith("Av.") 
                  ? extractCityFromAddress(location.address) 
                  : location.name}
              </h3>
              <p className="text-sm text-gray-600 truncate mt-1">
                {location.address}
              </p>
            </div>
          </div>
          
          {/* Botões de ação minimalistas */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Botão de reordenar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLocation(location.id);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Opções"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
            
            {/* Botão remover */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveLocation(originalIndex);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Remover"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Menu expandido minimalista */}
        {expandedLocation === location.id && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
            <div className="flex space-x-2">
              <button
                onClick={() => onMoveLocationUp(originalIndex)}
                disabled={originalIndex === 0}
                className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                  originalIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
              >
                ↑ Subir
              </button>
              
              <button
                onClick={() => onMoveLocationDown(originalIndex)}
                disabled={originalIndex === locations.length - 1}
                className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                  originalIndex === locations.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
              >
                ↓ Descer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Destinos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {locations.length === 0 ? 'Nenhum destino adicionado' : `${locations.length} destino${locations.length !== 1 ? 's' : ''} na rota`}
          </p>
        </div>
        
        <button 
          onClick={onAddLocationClick}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          title="Adicionar destino"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>Adicionar</span>
        </button>
      </div>
      
      {/* Bloco de origem moderno */}
      {origin && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {origin.name}
              </h3>
              <p className="text-blue-100 text-sm">
                Ponto de partida
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de localizações */}
      {locations.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pronto para planejar sua rota</h3>
          <p className="text-gray-500 mb-6 max-w-sm">Adicione destinos para calcular a melhor sequência de entregas</p>
          <button
            onClick={onAddLocationClick}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>Adicionar primeiro destino</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
          
          {/* Botão adicionar mais - design minimalista */}
          <button
            onClick={onAddLocationClick}
            className="w-full py-4 px-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center transition-all duration-200 font-medium group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <span>Adicionar outro destino</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}