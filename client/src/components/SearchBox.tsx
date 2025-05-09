import { useState, useEffect, useRef } from "react";
import { GeocodingResult } from "@/lib/types";

interface SearchBoxProps {
  onSelectLocation: (location: GeocodingResult) => void;
}

export default function SearchBox({ onSelectLocation }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Efeito para ouvir cliques fora da caixa de sugestões
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Buscar sugestões quando o usuário digita
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        
        // Usar a API Geocoding para buscar sugestões
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}&components=country:br`
        );
        
        const data = await response.json();
        
        if (data.status === "OK" && data.results && data.results.length > 0) {
          // Formatar resultados como sugestões
          const formattedSuggestions = data.results.map((result: any) => ({
            place_id: result.place_id,
            description: result.formatted_address,
            main_text: result.formatted_address.split(',')[0],
            secondary_text: result.formatted_address.substring(result.formatted_address.indexOf(',') + 1).trim(),
            geometry: result.geometry,
            address_components: result.address_components
          }));
          
          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Função para selecionar uma sugestão
  const handleSelectSuggestion = (suggestion: any) => {
    try {
      // Extrair informações
      const { lat, lng } = suggestion.geometry.location;
      
      // Verificar CEP
      let postalCode = "";
      for (const component of suggestion.address_components) {
        if (component.types.includes("postal_code")) {
          postalCode = component.long_name;
          break;
        }
      }
      
      // Criar resultado
      const geocodingResult: GeocodingResult = {
        name: suggestion.main_text,
        address: suggestion.description,
        lat: lat.toString(),
        lng: lng.toString(),
        placeId: suggestion.place_id
      };
      
      if (postalCode) {
        geocodingResult.cep = postalCode;
      }
      
      // Adicionar localização
      onSelectLocation(geocodingResult);
      
      // Limpar o campo de busca
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      
      console.log("Localização adicionada:", geocodingResult);
    } catch (error) {
      console.error("Erro ao processar localização selecionada:", error);
      alert("Erro ao processar o endereço selecionado. Por favor, tente novamente.");
    }
  };

  // Manipular a busca manual (sem sugestões)
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Se temos sugestões, use a primeira
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Usar a API Geocoding para buscar o endereço
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}&components=country:br`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        
        // Extrair informações
        const { lat, lng } = result.geometry.location;
        
        // Verificar CEP
        let postalCode = "";
        for (const component of result.address_components) {
          if (component.types.includes("postal_code")) {
            postalCode = component.long_name;
            break;
          }
        }
        
        // Criar resultado
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
        
        onSelectLocation(geocodingResult);
        setSearchQuery("");
        console.log("Localização adicionada:", geocodingResult);
      } else {
        console.error("Geocoding error:", data.status);
        alert("Não foi possível encontrar o endereço. Tente novamente.");
      }
    } catch (error) {
      console.error("Error searching for location:", error);
      alert("Erro ao buscar endereço. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200" ref={searchRef}>
      <form onSubmit={handleManualSearch} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isLoading ? (
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
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
        
        {/* Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm font-medium">{suggestion.main_text}</div>
                  <div className="text-xs text-gray-500">{suggestion.secondary_text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}