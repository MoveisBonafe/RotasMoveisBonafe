import { useState } from "react";
import { GeocodingResult } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocation: (location: GeocodingResult) => void;
}

export default function AddLocationModal({
  isOpen,
  onClose,
  onAddLocation
}: AddLocationModalProps) {
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError("Por favor, informe um endereço");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would call an API to geocode the address
      // For this demo, we'll simulate a geocoding response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result: GeocodingResult = {
        name: address,
        address: address + (cep ? ` - CEP: ${cep}` : ""),
        cep: cep || undefined,
        // Random coordinates around Dois Córregos-SP for demo
        lat: (-22.3673 + (Math.random() * 0.05)).toString(),
        lng: (-48.3823 + (Math.random() * 0.05)).toString()
      };
      
      onAddLocation(result);
      resetForm();
      onClose();
    } catch (err) {
      setError("Falha ao geocodificar o endereço");
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setAddress("");
    setCep("");
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-medium">Adicionar endereço</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={onClose}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Endereço completo</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Rua, número, cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition focus:outline-none"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Cancelar
              </button>
              
              <button 
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition focus:outline-none flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  'Adicionar'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
