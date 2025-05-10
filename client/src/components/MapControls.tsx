import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Layers,
  X
} from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleStreetView: () => void;
  onChangeMapType: (type: string) => void;
  mapType: string;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onToggleStreetView,
  onChangeMapType,
  mapType
}: MapControlsProps) {
  const [layersOpen, setLayersOpen] = useState(false);
  const layersRef = useRef<HTMLDivElement>(null);
  
  const toggleLayers = () => {
    setLayersOpen(!layersOpen);
  };

  // Fechar o painel de camadas quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (layersRef.current && !layersRef.current.contains(event.target as Node)) {
        setLayersOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
      {/* Controles principais */}
      <div className="bg-white rounded-lg shadow-lg p-1 border border-gray-200">
        <button 
          onClick={onZoomIn} 
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title="Aumentar zoom"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={onZoomOut}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
          title="Diminuir zoom"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={() => window.google?.maps?.StreetViewService && onToggleStreetView()}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
          title="Street View"
        >
          <MapPin size={18} />
        </button>
        <button 
          onClick={toggleLayers}
          className={`p-2 rounded-md transition-colors ${layersOpen ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          title="Camadas do Mapa"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* Widget de minimapa para tipos de mapa - exibido apenas quando layersOpen é true */}
      {layersOpen && (
        <div 
          ref={layersRef}
          className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-60"
        >
          <div className="flex justify-between items-center mb-2 border-b pb-1">
            <h3 className="text-sm font-medium">Estilo do mapa</h3>
            <button 
              onClick={() => setLayersOpen(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeMapType('roadmap')}
              className={`flex flex-col items-center rounded p-1 transition-all ${
                mapType === 'roadmap' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100'
              }`}
              title="Mapa"
            >
              <div className="h-12 w-full rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#e5e3df] flex items-center justify-center">
                  <div className="w-8 h-1 bg-white"></div>
                </div>
              </div>
              <span className="text-xs mt-1">Mapa</span>
            </button>
            
            <button
              onClick={() => onChangeMapType('satellite')}
              className={`flex flex-col items-center rounded p-1 transition-all ${
                mapType === 'satellite' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100'
              }`}
              title="Satélite"
            >
              <div className="h-12 w-full rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#143d6b] flex items-center justify-center">
                  <div className="w-full h-full bg-[#1f5c99] opacity-70"></div>
                </div>
              </div>
              <span className="text-xs mt-1">Satélite</span>
            </button>
            
            <button
              onClick={() => onChangeMapType('hybrid')}
              className={`flex flex-col items-center rounded p-1 transition-all ${
                mapType === 'hybrid' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100'
              }`}
              title="Híbrido"
            >
              <div className="h-12 w-full rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#143d6b] flex items-center justify-center">
                  <div className="w-8 h-1 bg-white"></div>
                </div>
              </div>
              <span className="text-xs mt-1">Híbrido</span>
            </button>
            
            <button
              onClick={() => onChangeMapType('terrain')}
              className={`flex flex-col items-center rounded p-1 transition-all ${
                mapType === 'terrain' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100'
              }`}
              title="Relevo"
            >
              <div className="h-12 w-full rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#e5e3df] flex items-center justify-center">
                  <div className="w-8 h-3 bg-[#c4deb3]"></div>
                </div>
              </div>
              <span className="text-xs mt-1">Relevo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}