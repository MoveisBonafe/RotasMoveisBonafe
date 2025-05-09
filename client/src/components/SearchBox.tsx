import { useState, useEffect, useRef } from "react";
import { GeocodingResult } from "@/lib/types";

interface SearchBoxProps {
  onSelectLocation: (location: GeocodingResult) => void;
}

export default function SearchBox({ onSelectLocation }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

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

  // Mock geocoding function (in real app, would call an API)
  const geocodeAddress = async (query: string): Promise<GeocodingResult[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock results
    if (!query || query.length < 3) return [];

    // In a real app, this would make an API call to a geocoding service
    return [
      {
        name: "Rua Exemplo, 123",
        address: "Rua Exemplo, 123, Dois Córregos, SP - CEP 17300-000",
        cep: "17300-000",
        lat: "-22.3673",
        lng: "-48.3823"
      },
      {
        name: "Av. Principal, 456",
        address: "Av. Principal, 456, Dois Córregos, SP - CEP 17300-010",
        cep: "17300-010",
        lat: "-22.3690",
        lng: "-48.3850"
      }
    ];
  };

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowAutocomplete(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await geocodeAddress(searchQuery);
      setSuggestions(results);
      setShowAutocomplete(results.length > 0);
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (location: GeocodingResult) => {
    onSelectLocation(location);
    setSearchQuery("");
    setShowAutocomplete(false);
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
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
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowAutocomplete(true);
            }
          }}
        />

        {/* Autocomplete dropdown */}
        {showAutocomplete && (
          <div 
            ref={autocompleteRef}
            className="search-autocomplete absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleSelectLocation(suggestion)}
              >
                <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm font-medium">{suggestion.name}</div>
                  <div className="text-xs text-gray-500">
                    {suggestion.address}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
