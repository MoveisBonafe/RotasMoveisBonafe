import { useState, useEffect, useRef, useCallback } from "react";
import { GeocodingResult } from "@/lib/types";
import { withGoogleMaps } from "@/main";

interface SearchBoxProps {
  onSelectLocation: (location: GeocodingResult) => void;
}

// Tipo para resultados do autocomplete do Google Maps Places
interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function SearchBox({ onSelectLocation }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  // Serviços do Google Maps Places
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  
  // Inicializar APIs do Google Maps
  useEffect(() => {
    withGoogleMaps(() => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API não está disponível");
        return;
      }
      
      try {
        // Criação do div necessário para o PlacesService
        const placesDiv = document.createElement('div');
        document.body.appendChild(placesDiv);
        
        // Inicializar serviços
        placesServiceRef.current = new window.google.maps.places.PlacesService(placesDiv);
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        
        console.log("✓ Google Maps Places API inicializada com sucesso");
      } catch (error) {
        console.error("Erro ao inicializar Google Maps Places API:", error);
      }
    });
    
    // Cleanup
    return () => {
      const placesDiv = document.querySelector('div[style="display: none;"]');
      if (placesDiv) placesDiv.remove();
    };
  }, []);

  // Set up click outside handler to close the autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        autocompleteRef.current && 
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Buscar detalhes do local a partir do place_id
  const fetchPlaceDetails = useCallback(async (placeId: string): Promise<GeocodingResult | null> => {
    if (!placesServiceRef.current || !sessionTokenRef.current) {
      console.error("Places Service não inicializado");
      return null;
    }
    
    return new Promise((resolve) => {
      placesServiceRef.current!.getDetails(
        {
          placeId: placeId,
          fields: ['name', 'formatted_address', 'geometry', 'address_component'],
          sessionToken: sessionTokenRef.current
        },
        (place, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
            console.error("Erro ao buscar detalhes do local:", status);
            resolve(null);
            return;
          }
          
          // Extrair o CEP (se disponível)
          let postalCode = '';
          if (place.address_components) {
            const postalCodeComponent = place.address_components.find(
              component => component.types.includes('postal_code')
            );
            if (postalCodeComponent) {
              postalCode = postalCodeComponent.long_name;
            }
          }
          
          const result: GeocodingResult = {
            name: place.name || '',
            address: place.formatted_address || '',
            lat: place.geometry?.location?.lat().toString() || '',
            lng: place.geometry?.location?.lng().toString() || '',
            placeId: placeId
          };
          
          if (postalCode) {
            result.cep = postalCode;
          }
          
          resolve(result);
        }
      );
    });
  }, []);

  // Buscar sugestões de endereços usando Places API
  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !autocompleteServiceRef.current) {
      setPredictions([]);
      setShowAutocomplete(false);
      return;
    }
    
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
    
    setIsLoading(true);
    
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'br' },
        sessionToken: sessionTokenRef.current,
        types: ['address', 'geocode', 'establishment']
      },
      (results, status) => {
        setIsLoading(false);
        
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
          console.error("Erro na pesquisa de lugares:", status);
          setPredictions([]);
          setShowAutocomplete(false);
          return;
        }
        
        setPredictions(results);
        setShowAutocomplete(results.length > 0);
      }
    );
  }, []);

  // Debounce para a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  // Selecionar um local da lista de sugestões
  const handleSelectLocation = async (prediction: PlacePrediction) => {
    setIsLoading(true);
    try {
      const placeDetails = await fetchPlaceDetails(prediction.place_id);
      
      if (placeDetails) {
        onSelectLocation(placeDetails);
        setSearchQuery(prediction.description);
        setShowAutocomplete(false);
        
        // Novo token para próxima busca
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do local:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (predictions.length > 0) {
      handleSelectLocation(predictions[0]);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <form onSubmit={handleSubmit} className="relative">
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
          ref={searchInputRef}
          type="text"
          placeholder="Buscar endereço ou CEP..."
          className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowAutocomplete(true);
            }
          }}
          autoComplete="off"
        />

        {/* Autocomplete dropdown */}
        {showAutocomplete && (
          <div 
            ref={autocompleteRef}
            className="search-autocomplete absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {predictions.map((prediction) => (
              <div 
                key={prediction.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleSelectLocation(prediction)}
              >
                <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm font-medium">{prediction.structured_formatting.main_text}</div>
                  <div className="text-xs text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
