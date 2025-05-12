import { 
  Location, 
  VehicleType, 
  PointOfInterest,
  CityEvent,
  TruckRestriction
} from '@shared/schema';

// Dados completos mockados para o deploy estático no GitHub Pages
class MockDataManager {
  private locations: Location[] = [];
  private originLocation: Location | null = null;
  private vehicleTypes: VehicleType[] = [];
  private pointsOfInterest: PointOfInterest[] = [];
  private cityEvents: CityEvent[] = [];
  private truckRestrictions: TruckRestriction[] = [];
  private locationsId = 1;

  constructor() {
    // Inicializa os dados mockados
    this.initMockData();
  }

  private initMockData() {
    // Definir origem (Dois Córregos)
    this.originLocation = {
      id: 1,
      name: "Dois Córregos",
      address: "Dois Córregos, SP, Brasil",
      zipCode: "17300-000",
      latitude: -22.3673,
      longitude: -48.3822,
      isOrigin: true
    };

    // Adicionar origem aos locais
    this.locations.push(this.originLocation);
    this.locationsId = 2; // Próximo ID

    // Definir tipos de veículo
    this.vehicleTypes = [
      { id: 1, name: "Caminhão 1 eixo", type: "truck1", costPerKm: 3.5, fuelConsumption: 4.5, averageSpeed: 75 },
      { id: 2, name: "Caminhão 2 eixos", type: "truck2", costPerKm: 4.2, fuelConsumption: 5.2, averageSpeed: 70 },
      { id: 3, name: "Caminhão 3 eixos", type: "truck3", costPerKm: 5.0, fuelConsumption: 6.0, averageSpeed: 65 },
      { id: 4, name: "Caminhão 4 eixos", type: "truck4", costPerKm: 5.8, fuelConsumption: 7.0, averageSpeed: 60 },
      { id: 5, name: "Caminhão 5 eixos", type: "truck5", costPerKm: 6.5, fuelConsumption: 8.0, averageSpeed: 55 },
      { id: 6, name: "Caminhão 6 eixos", type: "truck6", costPerKm: 7.2, fuelConsumption: 8.5, averageSpeed: 50 },
      { id: 7, name: "Caminhão 7 eixos", type: "truck7", costPerKm: 8.0, fuelConsumption: 9.0, averageSpeed: 50 },
      { id: 8, name: "Caminhão 9 eixos", type: "truck9", costPerKm: 9.5, fuelConsumption: 10.0, averageSpeed: 45 }
    ];

    // Definir pontos de interesse
    this.pointsOfInterest = [
      { id: 1, name: "Pedágio SP-225 (Brotas)", type: "toll", latitude: -22.2544, longitude: -48.1247, highway: "SP-225", cityName: "Brotas", cost: 11.30 },
      { id: 2, name: "Pedágio SP-225 (Jaú)", type: "toll", latitude: -22.2877, longitude: -48.5325, highway: "SP-225", cityName: "Jaú", cost: 7.90 },
      { id: 3, name: "Pedágio SP-300 (Botucatu)", type: "toll", latitude: -22.8932, longitude: -48.4521, highway: "SP-300", cityName: "Botucatu", cost: 9.50 },
      { id: 4, name: "Balança SP-225 (Dois Córregos)", type: "weighStation", latitude: -22.3532, longitude: -48.3301, highway: "SP-225", cityName: "Dois Córregos", isActive: true },
      { id: 5, name: "Balança SP-300 (Botucatu)", type: "weighStation", latitude: -22.9011, longitude: -48.4402, highway: "SP-300", cityName: "Botucatu", isActive: true },
      { id: 6, name: "Posto de combustível Shell (Dois Córregos)", type: "gasStation", latitude: -22.3673, longitude: -48.3900, highway: "SP-225", cityName: "Dois Córregos", services: ["food", "rest", "shower"] },
      { id: 7, name: "Posto de combustível BR (Jaú)", type: "gasStation", latitude: -22.2870, longitude: -48.5400, highway: "SP-225", cityName: "Jaú", services: ["food", "mechanic"] },
      { id: 8, name: "Borracharia 24h (Botucatu)", type: "mechanic", latitude: -22.8900, longitude: -48.4500, highway: "SP-300", cityName: "Botucatu", services: ["tire"] }
    ];

    // Eventos de cidade
    this.cityEvents = [
      { id: 1, cityName: "Dois Córregos", name: "Aniversário da Cidade", startDate: new Date("2023-05-24"), endDate: new Date("2023-05-24"), isHoliday: true, description: "Feriado municipal do aniversário de Dois Córregos", restrictionLevel: "low" },
      { id: 2, cityName: "Jaú", name: "Festa do Rodeio", startDate: new Date("2023-06-10"), endDate: new Date("2023-06-20"), isHoliday: false, description: "Evento com grande circulação de veículos", restrictionLevel: "medium" },
      { id: 3, cityName: "Botucatu", name: "Festival de Inverno", startDate: new Date("2023-07-15"), endDate: new Date("2023-07-30"), isHoliday: false, description: "Evento cultural e gastronômico", restrictionLevel: "low" },
      { id: 4, cityName: "Bauru", name: "Exposição Agropecuária", startDate: new Date("2023-08-05"), endDate: new Date("2023-08-15"), isHoliday: false, description: "Feira agropecuária com shows", restrictionLevel: "high" }
    ];

    // Restrições para caminhões
    this.truckRestrictions = [
      { id: 1, cityName: "Dois Córregos", dayType: "weekday", startTime: "07:00", endTime: "09:00", restrictionType: "partial", description: "Restrição parcial para caminhões de grande porte no centro", affectedVehicles: ["truck5", "truck6", "truck7", "truck9"] },
      { id: 2, cityName: "Jaú", dayType: "weekday", startTime: "17:00", endTime: "20:00", restrictionType: "partial", description: "Restrição parcial para todos os caminhões no centro", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] },
      { id: 3, cityName: "Botucatu", dayType: "weekend", startTime: "08:00", endTime: "18:00", restrictionType: "total", description: "Proibição total para caminhões na área central", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] },
      { id: 4, cityName: "Bauru", dayType: "all", startTime: "07:00", endTime: "22:00", restrictionType: "rodizio", description: "Sistema de rodízio para todos os caminhões", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] }
    ];
  }

  // Métodos mockados para simular as APIs do backend
  getOrigin(): Location | null {
    return this.originLocation;
  }

  getAllLocations(): Location[] {
    return this.locations;
  }

  addLocation(location: Partial<Location>): Location {
    const newLocation: Location = {
      id: this.locationsId++,
      name: location.name || "",
      address: location.address || "",
      zipCode: location.zipCode || "",
      latitude: location.latitude || 0,
      longitude: location.longitude || 0,
      isOrigin: false
    };
    this.locations.push(newLocation);
    return newLocation;
  }

  removeLocation(id: number): void {
    this.locations = this.locations.filter(loc => loc.id !== id || loc.isOrigin);
  }

  getAllVehicleTypes(): VehicleType[] {
    return this.vehicleTypes;
  }

  getAllPointsOfInterest(): PointOfInterest[] {
    return this.pointsOfInterest;
  }

  getWeighingStations(): PointOfInterest[] {
    return this.pointsOfInterest.filter(poi => poi.type === "weighStation");
  }

  getCityEvents(startDate?: string, endDate?: string, cities?: string[]): CityEvent[] {
    let events = this.cityEvents;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      events = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return (eventStart <= end && eventEnd >= start);
      });
    }
    
    if (cities && cities.length > 0) {
      events = events.filter(event => cities.includes(event.cityName));
    }
    
    return events;
  }

  getTruckRestrictions(cities?: string[]): TruckRestriction[] {
    if (cities && cities.length > 0) {
      return this.truckRestrictions.filter(r => cities.includes(r.cityName));
    }
    return this.truckRestrictions;
  }

  calculateRoute(body: any): any {
    // Simulação de cálculo de rota
    const { locationIds, vehicleType, includeOriginReturn } = body;
    
    // Buscar localizações pelo ID
    const locations = locationIds.map((id: number) => 
      this.locations.find(loc => loc.id === id)
    ).filter(Boolean);
    
    // Adicionar origem ao início
    if (this.originLocation && !locations.some(loc => loc.id === this.originLocation?.id)) {
      locations.unshift(this.originLocation);
    }
    
    // Simular resultado do TSP (usando distância simples entre pontos)
    const result = this.calculateTSPMock(locations, includeOriginReturn);
    
    // Retornar resultado formatado similar ao backend
    return {
      route: result.path.map(loc => ({ id: loc.id, name: loc.name })),
      totalDistance: result.distance,
      estimatedTime: result.distance / 60, // Simulação simples
      fuelConsumption: result.distance * 0.5,
      totalCost: result.distance * 5,
      tollCost: 35.50,
      pointsOfInterest: this.getPointsOnRoute(result.path.map(loc => loc.name))
    };
  }

  parseCepFile(body: any): any {
    // Simulação de parse de CEP de um arquivo
    const { fileContent } = body;
    const lines = fileContent.split('\n');
    const parsedLocations = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [cep, name] = line.split(',');
      
      if (cep && name) {
        // Gerar coordenadas fictícias na região de São Paulo
        const randomLat = -22.3 - Math.random() * 1.5;
        const randomLng = -48.3 - Math.random() * 1.5;
        
        parsedLocations.push({
          name: name.trim(),
          zipCode: cep.trim(),
          address: `${name.trim()}, SP, Brasil`,
          latitude: randomLat,
          longitude: randomLng
        });
      }
    }
    
    return parsedLocations;
  }

  // Método auxiliar para simular cálculo de TSP
  private calculateTSPMock(locations: Location[], includeReturn: boolean): { path: Location[], distance: number } {
    if (locations.length <= 1) {
      return { path: locations, distance: 0 };
    }
    
    // Consideramos a primeira localização como origem
    const origin = locations[0];
    const destinations = locations.slice(1);
    
    // Simular um caminho ordenado baseado na distância da origem
    destinations.sort((a, b) => {
      const distA = this.calculateDistance(origin.latitude, origin.longitude, a.latitude, a.longitude);
      const distB = this.calculateDistance(origin.latitude, origin.longitude, b.latitude, b.longitude);
      return distA - distB;
    });
    
    // Calcular a distância total
    let totalDistance = 0;
    let path = [origin, ...destinations];
    
    // Se incluir retorno, adicionar origem ao final
    if (includeReturn) {
      path.push(origin);
    }
    
    // Calcular distância entre todos os pontos da rota
    for (let i = 0; i < path.length - 1; i++) {
      const dist = this.calculateDistance(
        path[i].latitude, path[i].longitude,
        path[i+1].latitude, path[i+1].longitude
      );
      totalDistance += dist;
    }
    
    return { path, distance: totalDistance };
  }

  // Método para calcular distância entre dois pontos (em km)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distância em km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Método para encontrar pontos de interesse ao longo da rota
  private getPointsOnRoute(cityNames: string[]): PointOfInterest[] {
    // Filtrar pontos de interesse próximos às cidades da rota
    return this.pointsOfInterest.filter(poi => 
      cityNames.includes(poi.cityName)
    );
  }
}

// Exportar funções específicas para o queryClient
export const mockOrigin = {
  id: 1,
  name: "Dois Córregos",
  address: "Dois Córregos, SP, Brasil",
  zipCode: "17300-000",
  latitude: -22.3673,
  longitude: -48.3822,
  isOrigin: true
};

export const mockVehicleTypes = [
  { id: 1, name: "Caminhão 1 eixo", type: "truck1", costPerKm: 3.5, fuelConsumption: 4.5, averageSpeed: 75 },
  { id: 2, name: "Caminhão 2 eixos", type: "truck2", costPerKm: 4.2, fuelConsumption: 5.2, averageSpeed: 70 },
  { id: 3, name: "Caminhão 3 eixos", type: "truck3", costPerKm: 5.0, fuelConsumption: 6.0, averageSpeed: 65 },
  { id: 4, name: "Caminhão 4 eixos", type: "truck4", costPerKm: 5.8, fuelConsumption: 7.0, averageSpeed: 60 },
  { id: 5, name: "Caminhão 5 eixos", type: "truck5", costPerKm: 6.5, fuelConsumption: 8.0, averageSpeed: 55 },
  { id: 6, name: "Caminhão 6 eixos", type: "truck6", costPerKm: 7.2, fuelConsumption: 8.5, averageSpeed: 50 },
  { id: 7, name: "Caminhão 7 eixos", type: "truck7", costPerKm: 8.0, fuelConsumption: 9.0, averageSpeed: 50 },
  { id: 8, name: "Caminhão 9 eixos", type: "truck9", costPerKm: 9.5, fuelConsumption: 10.0, averageSpeed: 45 }
];

export const mockPointsOfInterest = [
  { id: 1, name: "Pedágio SP-225 (Brotas)", type: "toll", latitude: -22.2544, longitude: -48.1247, highway: "SP-225", cityName: "Brotas", cost: 11.30 },
  { id: 2, name: "Pedágio SP-225 (Jaú)", type: "toll", latitude: -22.2877, longitude: -48.5325, highway: "SP-225", cityName: "Jaú", cost: 7.90 },
  { id: 3, name: "Pedágio SP-300 (Botucatu)", type: "toll", latitude: -22.8932, longitude: -48.4521, highway: "SP-300", cityName: "Botucatu", cost: 9.50 },
  { id: 4, name: "Balança SP-225 (Dois Córregos)", type: "weighStation", latitude: -22.3532, longitude: -48.3301, highway: "SP-225", cityName: "Dois Córregos", isActive: true },
  { id: 5, name: "Balança SP-300 (Botucatu)", type: "weighStation", latitude: -22.9011, longitude: -48.4402, highway: "SP-300", cityName: "Botucatu", isActive: true }
];

export const mockCityEvents = [
  { id: 1, cityName: "Dois Córregos", name: "Aniversário da Cidade", startDate: new Date("2023-05-24"), endDate: new Date("2023-05-24"), isHoliday: true, description: "Feriado municipal do aniversário de Dois Córregos", restrictionLevel: "low" },
  { id: 2, cityName: "Jaú", name: "Festa do Rodeio", startDate: new Date("2023-06-10"), endDate: new Date("2023-06-20"), isHoliday: false, description: "Evento com grande circulação de veículos", restrictionLevel: "medium" },
  { id: 3, cityName: "Botucatu", name: "Festival de Inverno", startDate: new Date("2023-07-15"), endDate: new Date("2023-07-30"), isHoliday: false, description: "Evento cultural e gastronômico", restrictionLevel: "low" },
  { id: 4, cityName: "Bauru", name: "Exposição Agropecuária", startDate: new Date("2023-08-05"), endDate: new Date("2023-08-15"), isHoliday: false, description: "Feira agropecuária com shows", restrictionLevel: "high" }
];

export const mockTruckRestrictions = [
  { id: 1, cityName: "Dois Córregos", dayType: "weekday", startTime: "07:00", endTime: "09:00", restrictionType: "partial", description: "Restrição parcial para caminhões de grande porte no centro", affectedVehicles: ["truck5", "truck6", "truck7", "truck9"] },
  { id: 2, cityName: "Jaú", dayType: "weekday", startTime: "17:00", endTime: "20:00", restrictionType: "partial", description: "Restrição parcial para todos os caminhões no centro", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] },
  { id: 3, cityName: "Botucatu", dayType: "weekend", startTime: "08:00", endTime: "18:00", restrictionType: "total", description: "Proibição total para caminhões na área central", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] },
  { id: 4, cityName: "Bauru", dayType: "all", startTime: "07:00", endTime: "22:00", restrictionType: "rodizio", description: "Sistema de rodízio para todos os caminhões", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] }
];

export function getMockWeighingStations() {
  return mockPointsOfInterest.filter(poi => poi.type === "weighStation");
}

export function filterMockCityEvents(startDate?: string, endDate?: string, cities?: string[]) {
  const mockCityEvents = [
    { id: 1, cityName: "Dois Córregos", name: "Aniversário da Cidade", startDate: new Date("2023-05-24"), endDate: new Date("2023-05-24"), isHoliday: true, description: "Feriado municipal do aniversário de Dois Córregos", restrictionLevel: "low" },
    { id: 2, cityName: "Jaú", name: "Festa do Rodeio", startDate: new Date("2023-06-10"), endDate: new Date("2023-06-20"), isHoliday: false, description: "Evento com grande circulação de veículos", restrictionLevel: "medium" },
    { id: 3, cityName: "Botucatu", name: "Festival de Inverno", startDate: new Date("2023-07-15"), endDate: new Date("2023-07-30"), isHoliday: false, description: "Evento cultural e gastronômico", restrictionLevel: "low" },
    { id: 4, cityName: "Bauru", name: "Exposição Agropecuária", startDate: new Date("2023-08-05"), endDate: new Date("2023-08-15"), isHoliday: false, description: "Feira agropecuária com shows", restrictionLevel: "high" }
  ];

  let events = mockCityEvents;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    events = events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return (eventStart <= end && eventEnd >= start);
    });
  }
  
  if (cities && cities.length > 0) {
    events = events.filter(event => cities.includes(event.cityName));
  }
  
  return events;
}

export function filterMockTruckRestrictions(cities?: string[]) {
  const mockTruckRestrictions = [
    { id: 1, cityName: "Dois Córregos", dayType: "weekday", startTime: "07:00", endTime: "09:00", restrictionType: "partial", description: "Restrição parcial para caminhões de grande porte no centro", affectedVehicles: ["truck5", "truck6", "truck7", "truck9"] },
    { id: 2, cityName: "Jaú", dayType: "weekday", startTime: "17:00", endTime: "20:00", restrictionType: "partial", description: "Restrição parcial para todos os caminhões no centro", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] },
    { id: 3, cityName: "Botucatu", dayType: "weekend", startTime: "08:00", endTime: "18:00", restrictionType: "total", description: "Proibição total para caminhões na área central", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] },
    { id: 4, cityName: "Bauru", dayType: "all", startTime: "07:00", endTime: "22:00", restrictionType: "rodizio", description: "Sistema de rodízio para todos os caminhões", affectedVehicles: ["truck1", "truck2", "truck3", "truck4", "truck5", "truck6", "truck7", "truck9"] }
  ];

  if (cities && cities.length > 0) {
    return mockTruckRestrictions.filter(r => cities.includes(r.cityName));
  }
  return mockTruckRestrictions;
}

// Exportar a instância singleton também para backward compatibility
const mockData = new MockDataManager();
export default mockData;