import { 
  users, type User, type InsertUser,
  Location, InsertLocation,
  VehicleType, InsertVehicleType,
  PointOfInterest, InsertPointOfInterest,
  CityEvent, InsertCityEvent,
  TruckRestriction, InsertTruckRestriction
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Location methods
  getOrigin(): Promise<Location | null>;
  getAllLocations(): Promise<Location[]>;
  getLocationsByIds(ids: number[]): Promise<Location[]>;
  addLocation(location: InsertLocation): Promise<Location>;
  removeLocation(id: number): Promise<void>;
  seedOrigin(): Promise<Location>;
  
  // Vehicle type methods
  getAllVehicleTypes(): Promise<VehicleType[]>;
  getVehicleTypeByType(type: string): Promise<VehicleType | null>;
  seedVehicleTypes(): Promise<VehicleType[]>;
  
  // Points of interest methods
  getAllPointsOfInterest(): Promise<PointOfInterest[]>;
  getPointsOfInterestByType(type: string): Promise<PointOfInterest[]>;
  seedPointsOfInterest(): Promise<PointOfInterest[]>;
  
  // City events methods
  getCityEvents(startDate?: string, endDate?: string, cities?: string[]): Promise<CityEvent[]>;
  seedCityEvents(): Promise<CityEvent[]>;
  
  // Truck restrictions methods
  getTruckRestrictionsByCities(cities: string[]): Promise<TruckRestriction[]>;
  seedTruckRestrictions(): Promise<TruckRestriction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private vehicleTypes: Map<number, VehicleType>;
  private pointsOfInterest: Map<number, PointOfInterest>;
  private cityEvents: Map<number, CityEvent>;
  private truckRestrictions: Map<number, TruckRestriction>;
  
  currentId: number;
  locationsId: number;
  vehicleTypesId: number;
  poiId: number;
  eventId: number;
  restrictionId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.vehicleTypes = new Map();
    this.pointsOfInterest = new Map();
    this.cityEvents = new Map();
    this.truckRestrictions = new Map();
    
    this.currentId = 1;
    this.locationsId = 1;
    this.vehicleTypesId = 1;
    this.poiId = 1;
    this.eventId = 1;
    this.restrictionId = 1;
    
    // Inicializar dados base imediatamente para garantir disponibilidade
    this.initializeBaseData();
  }
  
  // Método para inicialização automática dos dados base
  private async initializeBaseData() {
    console.log("Inicializando dados base...");
    this.seedOrigin();
    this.seedVehicleTypes();
    this.seedPointsOfInterest();
    this.seedTruckRestrictions();
    console.log("Dados base inicializados com sucesso");
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Location methods
  async getOrigin(): Promise<Location | null> {
    const origins = Array.from(this.locations.values()).filter(
      (location) => location.isOrigin
    );
    
    return origins.length > 0 ? origins[0] : null;
  }
  
  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocationsByIds(ids: number[]): Promise<Location[]> {
    return ids.map(id => this.locations.get(id)).filter(Boolean) as Location[];
  }
  
  async addLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationsId++;
    const newLocation: Location = { ...location, id, isOrigin: false };
    this.locations.set(id, newLocation);
    return newLocation;
  }
  
  async removeLocation(id: number): Promise<void> {
    this.locations.delete(id);
  }
  
  async seedOrigin(): Promise<Location> {
    // Check if origin already exists
    const existingOrigin = await this.getOrigin();
    
    if (existingOrigin) {
      return existingOrigin;
    }
    
    // Create origin for Dois Córregos-SP
    const originId = this.locationsId++;
    const origin: Location = {
      id: originId,
      name: "Dois Córregos",
      address: "Dois Córregos, SP, Brasil",
      cep: "17300-000",
      lat: "-22.3673",
      lng: "-48.3823",
      isOrigin: true
    };
    
    this.locations.set(originId, origin);
    return origin;
  }
  
  // Vehicle type methods
  async getAllVehicleTypes(): Promise<VehicleType[]> {
    return Array.from(this.vehicleTypes.values());
  }
  
  async getVehicleTypeByType(type: string): Promise<VehicleType | null> {
    const found = Array.from(this.vehicleTypes.values()).find(
      (vt) => vt.type === type
    );
    
    return found || null;
  }
  
  async seedVehicleTypes(): Promise<VehicleType[]> {
    if (this.vehicleTypes.size > 0) {
      return Array.from(this.vehicleTypes.values());
    }
    
    const types: Omit<VehicleType, 'id'>[] = [
      { name: "Carro", type: "car", fuelEfficiency: 116, tollMultiplier: 100 },
      { name: "Moto", type: "motorcycle", fuelEfficiency: 250, tollMultiplier: 50 },
      { name: "Caminhão 1 eixo", type: "truck1", fuelEfficiency: 60, tollMultiplier: 200 },
      { name: "Caminhão 2 eixos", type: "truck2", fuelEfficiency: 40, tollMultiplier: 300 }
    ];
    
    types.forEach(type => {
      const id = this.vehicleTypesId++;
      const vehicleType: VehicleType = { ...type, id };
      this.vehicleTypes.set(id, vehicleType);
    });
    
    return Array.from(this.vehicleTypes.values());
  }
  
  // Points of interest methods
  async getAllPointsOfInterest(): Promise<PointOfInterest[]> {
    return Array.from(this.pointsOfInterest.values());
  }
  
  async getPointsOfInterestByType(type: string): Promise<PointOfInterest[]> {
    return Array.from(this.pointsOfInterest.values()).filter(
      (poi) => poi.type === type
    );
  }
  
  async seedPointsOfInterest(): Promise<PointOfInterest[]> {
    if (this.pointsOfInterest.size > 0) {
      return Array.from(this.pointsOfInterest.values());
    }
    
    const pois: Omit<PointOfInterest, 'id'>[] = [
      {
        name: "Pedágio SP-255 (Brotas)",
        type: "toll",
        lat: "-22.2982",
        lng: "-48.1157",
        cost: 1100, // R$11.00 (preço base para carros)
        roadName: "SP-255",
        restrictions: null
      },
      {
        name: "Pedágio SP-255 (Ribeirão Preto)",
        type: "toll",
        lat: "-21.2112",
        lng: "-47.7875",
        cost: 950, // R$9.50 (preço base para carros)
        roadName: "SP-255",
        restrictions: null
      },
      {
        name: "Pedágio SP-300 (Botucatu)",
        type: "toll",
        lat: "-22.8837",
        lng: "-48.4436",
        cost: 1290, // R$12.90 (preço base para carros)
        roadName: "SP-300",
        restrictions: null
      },
      {
        name: "Pedágio SP-300 (Jaú)",
        type: "toll",
        lat: "-22.2891",
        lng: "-48.5327",
        cost: 1050, // R$10.50 (preço base para carros)
        roadName: "SP-300",
        restrictions: null
      },
      {
        name: "Balança SP-300 (km 45)",
        type: "weighing_station",
        lat: "-22.8765",
        lng: "-48.5123",
        cost: null,
        restrictions: "Veículos acima de 2 eixos",
        roadName: "SP-300"
      },
      {
        name: "Balança SP-255 (km 122)",
        type: "weighing_station",
        lat: "-22.2153",
        lng: "-48.1887",
        cost: null,
        restrictions: "Veículos acima de 1 eixo",
        roadName: "SP-255"
      },
      {
        name: "Balança SP-255 (km 150)",
        type: "weighing_station",
        lat: "-21.5872",
        lng: "-48.0748",
        cost: null,
        restrictions: "Todos os veículos de carga",
        roadName: "SP-255"
      },
      {
        name: "Pedágio SP-255 (Guatapará)", 
        type: "toll",
        lat: "-21.4955",
        lng: "-48.0355",
        cost: 1050, // R$10.50 (preço base para carros)
        roadName: "SP-255",
        restrictions: null
      }
    ];
    
    pois.forEach(poi => {
      const id = this.poiId++;
      const pointOfInterest: PointOfInterest = { ...poi, id };
      this.pointsOfInterest.set(id, pointOfInterest);
    });
    
    return Array.from(this.pointsOfInterest.values());
  }
  
  // City events methods
  async getCityEvents(startDate?: string, endDate?: string, cities?: string[]): Promise<CityEvent[]> {
    // Esse método foi desabilitado para evitar conflitos entre dados do storage.ts e dados do routes.ts
    // Todos os eventos são definidos diretamente no routes.ts para garantir consistência
    return [];
  }
  
  async seedCityEvents(): Promise<CityEvent[]> {
    // Esse método foi desabilitado para evitar conflitos entre dados do storage.ts e dados do routes.ts
    // Todos os eventos são definidos diretamente no routes.ts para garantir consistência
    return [];
  }
  
  // Truck restrictions methods
  async getTruckRestrictionsByCities(cities: string[]): Promise<TruckRestriction[]> {
    if (cities.length === 0) {
      return Array.from(this.truckRestrictions.values());
    }
    
    return Array.from(this.truckRestrictions.values()).filter(restriction =>
      cities.some(city => restriction.cityName.toLowerCase().includes(city.toLowerCase()))
    );
  }
  
  async seedTruckRestrictions(): Promise<TruckRestriction[]> {
    if (this.truckRestrictions.size > 0) {
      return Array.from(this.truckRestrictions.values());
    }
    
    const restrictions: Omit<TruckRestriction, 'id'>[] = [
      {
        cityName: "Barra Bonita",
        restriction: "Centro da cidade",
        startTime: "07:00",
        endTime: "09:00",
        applicableVehicles: "Acima de 1 eixo",
        description: "Restrição nos horários de pico da manhã"
      },
      {
        cityName: "Barra Bonita",
        restriction: "Centro da cidade",
        startTime: "17:00",
        endTime: "19:00",
        applicableVehicles: "Acima de 1 eixo",
        description: "Restrição nos horários de pico da tarde"
      },
      {
        cityName: "Jaú",
        restriction: "Perímetro urbano",
        startTime: "08:00",
        endTime: "10:00",
        applicableVehicles: "Acima de 2 eixos",
        description: "Restrição de circulação pela manhã"
      },
      {
        cityName: "Jaú",
        restriction: "Perímetro urbano",
        startTime: "16:00",
        endTime: "19:00",
        applicableVehicles: "Acima de 2 eixos",
        description: "Restrição de circulação à tarde"
      },
      {
        cityName: "Dois Córregos",
        restriction: "Centro histórico",
        startTime: "07:00",
        endTime: "20:00",
        applicableVehicles: "Acima de 1 eixo",
        description: "Restrição de circulação durante o dia todo na área histórica"
      }
    ];
    
    restrictions.forEach(restriction => {
      const id = this.restrictionId++;
      const truckRestriction: TruckRestriction = { ...restriction, id };
      this.truckRestrictions.set(id, truckRestriction);
    });
    
    return Array.from(this.truckRestrictions.values());
  }
}

export const storage = new MemStorage();
