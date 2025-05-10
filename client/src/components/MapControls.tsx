import React from 'react';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Map as MapIcon,
  Layers
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
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
      {/* Controles principais */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1 border border-gray-200">
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
          onClick={onToggleStreetView}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
          title="Street View"
        >
          <MapIcon size={18} />
        </button>
      </div>

      {/* Widget de minimapa para tipos de mapa */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1 border border-gray-200">
        <div className="p-1 flex flex-col gap-1">
          <div className="flex items-center justify-between px-2">
            <Layers size={16} className="text-gray-700" />
            <span className="text-xs font-medium text-gray-700">Camadas</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => onChangeMapType('roadmap')}
              className={`flex flex-col items-center rounded p-1 ${
                mapType === 'roadmap' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'
              }`}
              title="Mapa"
            >
              <div className="h-10 w-14 rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#e5e3df] flex items-center justify-center">
                  <div className="w-8 h-1 bg-white"></div>
                </div>
              </div>
              <span className="text-[10px] mt-1">Mapa</span>
            </button>
            
            <button
              onClick={() => onChangeMapType('satellite')}
              className={`flex flex-col items-center rounded p-1 ${
                mapType === 'satellite' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'
              }`}
              title="Satélite"
            >
              <div className="h-10 w-14 rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#143d6b] flex items-center justify-center">
                  <div className="w-8 h-6 bg-[#1f5c99] opacity-70"></div>
                </div>
              </div>
              <span className="text-[10px] mt-1">Satélite</span>
            </button>
            
            <button
              onClick={() => onChangeMapType('hybrid')}
              className={`flex flex-col items-center rounded p-1 ${
                mapType === 'hybrid' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'
              }`}
              title="Híbrido"
            >
              <div className="h-10 w-14 rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#143d6b] flex items-center justify-center">
                  <div className="w-8 h-1 bg-white"></div>
                </div>
              </div>
              <span className="text-[10px] mt-1">Híbrido</span>
            </button>
            
            <button
              onClick={() => onChangeMapType('terrain')}
              className={`flex flex-col items-center rounded p-1 ${
                mapType === 'terrain' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'
              }`}
              title="Relevo"
            >
              <div className="h-10 w-14 rounded overflow-hidden border border-gray-300">
                <div className="h-full w-full bg-[#e5e3df] flex items-center justify-center">
                  <div className="w-8 h-3 bg-[#c4deb3]"></div>
                </div>
              </div>
              <span className="text-[10px] mt-1">Relevo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}