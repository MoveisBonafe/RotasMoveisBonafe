import React, { useState, useEffect } from 'react';
import { Location } from '@/lib/types';
import { ChevronRight, MapPin } from 'lucide-react';

interface AnimatedRouteSequenceProps {
  calculatedRoute: Location[];
  isExpanded: boolean;
}

const AnimatedRouteSequence: React.FC<AnimatedRouteSequenceProps> = ({ 
  calculatedRoute,
  isExpanded
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Efeito para animação automática quando o componente é montado ou a rota muda
  useEffect(() => {
    if (!isAnimating || showAll) return;

    // Resetar para o início se a rota mudar
    setCurrentIndex(0);
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        // Quando chegar ao fim, para a animação
        if (prev >= calculatedRoute.length - 1) {
          setIsAnimating(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800); // Intervalo entre cada ponto da rota

    return () => clearInterval(interval);
  }, [calculatedRoute, isAnimating, showAll]);

  // Reiniciar a animação
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsAnimating(true);
    setShowAll(false);
  };

  // Mostrar todos os pontos de uma vez
  const handleShowAll = () => {
    setShowAll(true);
    setIsAnimating(false);
  };

  // Função para obter o nome simplificado do local
  const getSimplifiedName = (location: Location) => {
    // Remover parte do CEP se estiver no nome
    let name = location.name;
    if (name.includes(',')) {
      name = name.split(',')[0];
    }
    return name;
  };

  return (
    <div className="bg-white rounded p-2 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-primary">Sequência da Rota Otimizada</h3>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleRestart}
            className="text-2xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            Reiniciar
          </button>
          
          <button 
            onClick={handleShowAll}
            className="text-2xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
          >
            Mostrar Tudo
          </button>
        </div>
      </div>

      <div className={`${isExpanded ? 'p-2' : ''} border rounded bg-gray-50 transition-all`}>
        <div className="flex flex-col space-y-1">
          {calculatedRoute.map((location, index) => {
            // Determinar se este ponto deve ser mostrado na animação
            const isVisible = showAll || index <= currentIndex;
            
            return (
              <div 
                key={`route-${index}`} 
                className={`
                  flex items-center transition-all duration-500 ease-in-out 
                  ${isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                  }
                  ${index === currentIndex && isAnimating ? 'bg-blue-50 rounded' : ''}
                `}
              >
                <div className={`
                  flex items-center justify-center rounded-full w-5 h-5 text-xs font-bold
                  ${index === 0 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-500 text-white'
                  }
                  ${index === currentIndex && isAnimating ? 'animate-pulse' : ''}
                `}>
                  {index + 1}
                </div>
                
                <div className="text-xs ml-2 font-medium">
                  {getSimplifiedName(location)}
                </div>
                
                {index < calculatedRoute.length - 1 && (
                  <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {calculatedRoute.map((location, index) => (
                <div 
                  key={`location-${index}`}
                  className={`
                    text-2xs bg-white p-2 rounded border border-gray-100
                    transition-all duration-500 ease-in-out
                    ${showAll || index <= currentIndex
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                    }
                  `}
                >
                  <div className="flex items-start">
                    <div className={`
                      flex-shrink-0 flex items-center justify-center rounded-full w-4 h-4 mt-0.5
                      ${index === 0 
                        ? 'bg-red-500 text-white text-2xs font-bold' 
                        : 'bg-blue-500 text-white text-2xs font-bold'
                      }
                    `}>
                      {index + 1}
                    </div>
                    <div className="ml-1.5">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-gray-500 truncate w-full">{location.address}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedRouteSequence;