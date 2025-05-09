import { useState } from "react";
import { GeocodingResult } from "@/lib/types";

interface SearchBoxProps {
  onSelectLocation: (location: GeocodingResult) => void;
}

export default function SearchBox({ onSelectLocation }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Função para buscar endereço usando a API do Google Geocoding
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Obter a chave API do Google Maps
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
      
      // Fazer uma requisição direta para a API de Geocoding do Google
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}&components=country:br`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        
        // Extrair informações do resultado
        const { lat, lng } = result.geometry.location;
        
        // Verificar CEP
        let postalCode = "";
        for (const component of result.address_components) {
          if (component.types.includes("postal_code")) {
            postalCode = component.long_name;
            break;
          }
        }
        
        // Criar objeto de resultado
        const geocodingResult: GeocodingResult = {
          name: result.formatted_address.split(',')[0] || result.formatted_address,
          address: result.formatted_address,
          lat: lat.toString(),
          lng: lng.toString(),
          placeId: result.place_id
        };
        
        if (postalCode) {
          geocodingResult.cep = postalCode;
        }
        
        // Passar o resultado para o componente pai
        onSelectLocation(geocodingResult);
        
        // Limpar o campo de busca
        setSearchQuery("");
      } else {
        console.error("Geocoding error:", data.status);
        alert("Não foi possível encontrar o endereço. Tente novamente.");
      }
    } catch (error) {
      console.error("Error searching for location:", error);
      alert("Erro ao buscar endereço. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="p-4 border-b border-gray-200">
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isSearching ? (
            <div className="animate-spin h-5 w-5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <input
          type="text"
          placeholder="Buscar endereço ou CEP..."
          className="w-full py-3 pl-10 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSearching}
        >
          Buscar
        </button>
      </form>
    </div>
  );
}