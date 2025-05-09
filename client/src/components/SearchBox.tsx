import { useState, useEffect, useRef } from "react";
import { GeocodingResult } from "@/lib/types";
import { withGoogleMaps } from "@/main";

interface SearchBoxProps {
  onSelectLocation: (location: GeocodingResult) => void;
}

// Interface para previsões de autocompletar
interface AutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function SearchBox({ onSelectLocation }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  
  // Referências para serviços Google Maps
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const sessionToken = useRef<any>(null);
  
  // Inicializar serviços do Google Maps
  useEffect(() => {
    withGoogleMaps(() => {
      try {
        // Criar token de sessão para otimizar billing
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        
        // Serviço de autocompletar
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        // Serviço de detalhes de locais
        // Criamos um div oculto para o Places Service
        const placesDiv = document.createElement('div');
        document.body.appendChild(placesDiv);
        placesService.current = new window.google.maps.places.PlacesService(placesDiv);
        
        console.log("Serviços de busca inicializados");
      } catch (error) {
        console.error("Erro ao inicializar serviços Google Maps:", error);
      }
    });
    
    // Limpeza
    return () => {
      document.querySelectorAll('div[style="display: none;"]').forEach(el => {
        if (!el.hasChildNodes()) el.remove();
      });
    };
  }, []);
  
  // Configurar ouvinte de cliques fora da caixa de sugestões
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Função para buscar sugestões diretamente
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Tenta usar autocomplete service do Google se estiver disponível
    if (autocompleteService.current) {
      try {
        setIsLoading(true);
        
        // Verificar se precisamos de um novo token
        if (!sessionToken.current) {
          sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        }
        
        autocompleteService.current.getPlacePredictions(
          {
            input: query,
            sessionToken: sessionToken.current,
            componentRestrictions: { country: "br" },
            types: ["address", "geocode", "establishment"]
          },
          (predictions: AutocompletePrediction[] | null, status: string) => {
            setIsLoading(false);
            
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
              console.warn("Erro ou nenhum resultado de autocompletar:", status);
              setPredictions([]);
              setShowSuggestions(false);
              return;
            }
            
            setPredictions(predictions);
            setShowSuggestions(predictions.length > 0);
          }
        );
      } catch (error) {
        console.error("Erro ao buscar sugestões via Places API:", error);
        setIsLoading(false);
        
        // Fallback para API Geocoding direta
        fetchSuggestionsViaGeocodingAPI(query);
      }
    } else {
      // Fallback para API Geocoding se Places API não estiver disponível
      fetchSuggestionsViaGeocodingAPI(query);
    }
  };
  
  // Fallback usando a API Geocoding para sugestões
  const fetchSuggestionsViaGeocodingAPI = async (query: string) => {
    try {
      setIsLoading(true);
      
      // Usar a API de Geocoding para autocompletar
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&components=country:br`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results.length > 0) {
        // Converter resultados para o formato de sugestões
        const suggestionsFromGeocode = data.results.map((result: any) => ({
          place_id: result.place_id,
          description: result.formatted_address,
          structured_formatting: {
            main_text: result.formatted_address.split(',')[0],
            secondary_text: result.formatted_address.substring(result.formatted_address.indexOf(',') + 1).trim()
          }
        }));
        
        setPredictions(suggestionsFromGeocode);
        setShowSuggestions(suggestionsFromGeocode.length > 0);
      } else {
        setPredictions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões via Geocoding API:", error);
      setPredictions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Debounce para chamar a função de busca quando o usuário digita
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 3) {
        fetchSuggestions(searchQuery);
      } else {
        setPredictions([]);
        setShowSuggestions(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Buscar detalhes do local selecionado
  const getPlaceDetails = async (placeId: string, description: string) => {
    if (!placesService.current || !sessionToken.current) {
      console.error("Serviços não inicializados");
      return null;
    }
    
    return new Promise<GeocodingResult>((resolve, reject) => {
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ["name", "formatted_address", "geometry", "address_component"],
          sessionToken: sessionToken.current
        },
        (place: any, status: string) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
            console.error("Erro ao obter detalhes do lugar:", status);
            reject(new Error("Falha ao obter detalhes"));
            return;
          }
          
          // Extrair CEP se disponível
          let postalCode = "";
          if (place.address_components) {
            for (const component of place.address_components) {
              if (component.types.includes("postal_code")) {
                postalCode = component.long_name;
                break;
              }
            }
          }
          
          // Criar resultado
          const result: GeocodingResult = {
            name: place.name || place.formatted_address.split(',')[0],
            address: place.formatted_address,
            lat: place.geometry.location.lat().toString(),
            lng: place.geometry.location.lng().toString(),
            placeId: placeId
          };
          
          if (postalCode) {
            result.cep = postalCode;
          }
          
          resolve(result);
          
          // Criar um novo token depois de usar este
          sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      );
    });
  };
  
  // Função para selecionar uma sugestão
  const handleSelectPrediction = async (prediction: AutocompletePrediction) => {
    setIsLoading(true);
    
    try {
      const placeDetails = await getPlaceDetails(prediction.place_id, prediction.description);
      
      if (placeDetails) {
        onSelectLocation(placeDetails);
        setSearchQuery("");
        setPredictions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Erro ao selecionar local:", error);
      alert("Não foi possível obter detalhes do endereço selecionado.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manipular a busca manual (sem sugestões)
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Se temos sugestões, use a primeira
    if (predictions.length > 0) {
      await handleSelectPrediction(predictions[0]);
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
    <div className="p-4 border-b border-gray-200" ref={searchBoxRef}>
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
          onFocus={() => setShowSuggestions(predictions.length > 0)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Buscar
        </button>
        
        {/* Sugestões de autocompletar */}
        {showSuggestions && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
            {predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleSelectPrediction(prediction)}
              >
                <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm font-medium">{prediction.structured_formatting.main_text}</div>
                  <div className="text-xs text-gray-500">{prediction.structured_formatting.secondary_text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}