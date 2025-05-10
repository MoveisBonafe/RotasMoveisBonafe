// Dados mockados para substituir as chamadas de API quando publicado no GitHub Pages
import { Location, PointOfInterest, VehicleType, CityEvent, TruckRestriction } from '@shared/schema';

// Origem padrão em Dois Córregos
export const mockOrigin: Location = {
  id: 1,
  name: "Dois Córregos",
  address: "Dois Córregos, SP, Brasil",
  cep: "17300-000",
  lat: "-22.387068452814354",
  lng: "-48.386156060395095",
  isOrigin: true
};

// Veículos disponíveis
export const mockVehicleTypes: VehicleType[] = [
  {
    id: 1,
    name: "Caminhão 1 eixo",
    type: "truck1",
    fuelEfficiency: 2.5,
    tollMultiplier: 2.0,
    fuelCostPerLiter: 6.75
  },
  {
    id: 2,
    name: "Caminhão 2 eixos",
    type: "truck2",
    fuelEfficiency: 1.8,
    tollMultiplier: 3.0,
    fuelCostPerLiter: 6.75
  },
  {
    id: 3,
    name: "Caminhão 3 eixos",
    type: "truck3",
    fuelEfficiency: 1.6,
    tollMultiplier: 4.0,
    fuelCostPerLiter: 6.75
  },
  {
    id: 4,
    name: "Carro",
    type: "car",
    fuelEfficiency: 9.0,
    tollMultiplier: 1.0,
    fuelCostPerLiter: 5.95
  },
  {
    id: 5,
    name: "Moto",
    type: "motorcycle",
    fuelEfficiency: 25.0,
    tollMultiplier: 0.5,
    fuelCostPerLiter: 5.95
  }
];

// Pontos de interesse (pedágios e balanças)
export const mockPointsOfInterest: PointOfInterest[] = [
  {
    id: 1,
    name: "Pedágio SP-225 (Brotas)",
    type: "toll",
    location: "SP-225, km 127, Brotas-SP",
    lat: "-22.2598",
    lng: "-48.1325",
    value: 12.5,
    direction: "both",
    roadName: "SP-225"
  },
  {
    id: 2,
    name: "Pedágio SP-225 (Jaú)",
    type: "toll",
    location: "SP-225, km 177, Jaú-SP",
    lat: "-22.3001",
    lng: "-48.5123",
    value: 11.8,
    direction: "north",
    roadName: "SP-225"
  },
  {
    id: 3,
    name: "Pedágio SP-300 (Bauru)",
    type: "toll",
    location: "SP-300, km 343, Bauru-SP",
    lat: "-22.3345",
    lng: "-49.0123",
    value: 14.2,
    direction: "both",
    roadName: "SP-300"
  },
  {
    id: 4,
    name: "Balança SP-225 (Itirapina)",
    type: "weighing_station",
    location: "SP-225, km 95, Itirapina-SP",
    lat: "-22.2156",
    lng: "-47.8912",
    roadName: "SP-225"
  },
  {
    id: 5,
    name: "Balança SP-225 (Dois Córregos)",
    type: "weighing_station",
    location: "SP-225, km 144, Dois Córregos-SP",
    lat: "-22.3456",
    lng: "-48.3821",
    roadName: "SP-225"
  },
  {
    id: 6,
    name: "Balança SP-300 (km 45)",
    type: "weighing_station",
    location: "SP-300, km 45",
    lat: "-22.4567",
    lng: "-48.4509",
    roadName: "SP-300"
  },
  {
    id: 7,
    name: "Balança SP-294 (km 398)",
    type: "weighing_station",
    location: "SP-294, km 398, Marília-SP",
    lat: "-22.1789",
    lng: "-49.9345",
    roadName: "SP-294"
  }
];

// Eventos em cidades
export const mockCityEvents: CityEvent[] = [
  {
    id: 1,
    cityName: "Dois Córregos",
    eventName: "Festa de São Sebastião",
    eventType: "religious",
    startDate: "2025-02-05",
    endDate: "2025-02-05",
    description: "Evento religioso em honra ao padroeiro da cidade"
  },
  {
    id: 2,
    cityName: "Jaú",
    eventName: "Festa do Peão",
    eventType: "festival",
    startDate: "2025-05-10",
    endDate: "2025-05-15",
    description: "Tradicional festa com rodeio e shows"
  },
  {
    id: 3,
    cityName: "Bauru",
    eventName: "Expo Auto",
    eventType: "fair",
    startDate: "2025-08-15",
    endDate: "2025-08-15",
    description: "Exposição de automóveis antigos no centro da cidade"
  },
  {
    id: 4,
    cityName: "Ribeirão Preto",
    eventName: "Aniversário da Cidade",
    eventType: "anniversary",
    startDate: "2025-06-19",
    endDate: "2025-06-19",
    description: "Comemoração dos 169 anos da cidade (fundada em 19 de junho de 1856)"
  },
  {
    id: 5,
    cityName: "Ribeirão Preto",
    eventName: "Feira Agropecuária",
    eventType: "festival",
    startDate: "2025-05-10",
    endDate: "2025-05-20",
    description: "Evento de agronegócio com exposições e leilões"
  }
];

// Restrições de caminhões
export const mockTruckRestrictions: TruckRestriction[] = [
  {
    id: 1,
    cityName: "Dois Córregos",
    restrictionType: "weight",
    restrictionDescription: "Proibida circulação de veículos acima de 10 toneladas no centro",
    restrictedArea: "Centro",
    startTime: "08:00",
    endTime: "18:00",
    restrictedDays: "segunda a sexta"
  },
  {
    id: 2,
    cityName: "Ribeirão Preto",
    restrictionType: "zone",
    restrictionDescription: "Zona de restrição para veículos de carga na região central",
    restrictedArea: "Centro e zona norte",
    startTime: "07:00",
    endTime: "19:00",
    restrictedDays: "todos os dias"
  },
  {
    id: 3,
    cityName: "Bauru",
    restrictionType: "time",
    restrictionDescription: "Restrição de horário para caminhões acima de 2 eixos",
    restrictedArea: "Toda a cidade",
    startTime: "07:00",
    endTime: "10:00",
    restrictedDays: "dias úteis"
  }
];

// Função para retornar dados mockados de balanças de pesagem
export const getMockWeighingStations = (): PointOfInterest[] => {
  return mockPointsOfInterest.filter(poi => poi.type === 'weighing_station');
};

// Função para filtrar eventos por data e cidades
export const filterMockCityEvents = (
  startDate?: string,
  endDate?: string,
  cities?: string[]
): CityEvent[] => {
  let filteredEvents = [...mockCityEvents];
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    filteredEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= start && eventDate <= end;
    });
  }
  
  if (cities && cities.length > 0) {
    const normalizedCities = cities.map(city => city.toLowerCase());
    filteredEvents = filteredEvents.filter(event => 
      normalizedCities.includes(event.cityName.toLowerCase())
    );
  }
  
  return filteredEvents;
};

// Função para filtrar restrições por cidades
export const filterMockTruckRestrictions = (cities: string[]): TruckRestriction[] => {
  if (!cities || cities.length === 0) return [];
  
  const normalizedCities = cities.map(city => city.toLowerCase());
  return mockTruckRestrictions.filter(restriction => 
    normalizedCities.includes(restriction.cityName.toLowerCase())
  );
};