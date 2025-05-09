import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertLocationSchema,
  insertPointOfInterestSchema,
  insertVehicleTypeSchema,
  insertCityEventSchema,
  insertTruckRestrictionSchema,
} from "@shared/schema";

const cepRegex = /^\d{5}-?\d{3}$/;

const parseCepFileSchema = z.object({
  content: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // Get default origin (Dois Córregos)
  app.get("/api/origin", async (req: Request, res: Response) => {
    try {
      const origin = await storage.getOrigin();
      res.json(origin);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve origin point" });
    }
  });

  // Get all locations
  app.get("/api/locations", async (req: Request, res: Response) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve locations" });
    }
  });

  // Add a location
  app.post("/api/locations", async (req: Request, res: Response) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const newLocation = await storage.addLocation(locationData);
      res.status(201).json(newLocation);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  // Delete a location
  app.delete("/api/locations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      await storage.removeLocation(id);
      res.status(200).json({ message: "Location deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Parse CEP file
  app.post("/api/parse-cep-file", async (req: Request, res: Response) => {
    try {
      console.log("Recebendo requisição para processar arquivo CEP");
      const { content } = parseCepFileSchema.parse(req.body);
      
      // Log do início do conteúdo para debug
      const contentPreview = content.length > 100 ? content.substring(0, 100) + "..." : content;
      console.log(`Conteúdo recebido (preview): ${contentPreview}`);
      console.log(`Tamanho total do conteúdo: ${content.length} caracteres`);
      
      // Normaliza quebras de linha para diferentes sistemas operacionais
      const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedContent.split('\n').filter(line => line.trim() !== "");
      console.log(`Processando ${lines.length} linhas do arquivo`);
      
      // Array para armazenar as localizações encontradas
      const locations = [];
      
      // Mapeia CEPs para coordenadas específicas usando um sistema mais preciso
      const getCoordinatesForCep = (cep: string, name: string) => {
        let lat: string, lng: string, address: string;
        
        // Removemos a variação para ter pontos exatos baseados no CEP
        // Utiliza o cálculo matemático baseado nos dígitos do CEP para fornecer coordenadas únicas
        // para cada CEP, mas dentro da mesma cidade/região
        
        // Remove traços e formata o CEP para cálculos
        const cleanCep = cep.replace(/[^0-9]/g, '');
        
        // Converte os últimos 3 dígitos do CEP para coordenadas internas da cidade
        // Cada dígito contribui para uma variação calculada, não aleatória
        const lastThreeDigits = cleanCep.slice(-3);
        const d1 = parseInt(lastThreeDigits[0]) || 0;
        const d2 = parseInt(lastThreeDigits[1]) || 0;
        const d3 = parseInt(lastThreeDigits[2]) || 0;
        
        // Cálculo de variação que usa os dígitos do CEP para determinar uma posição única
        // mas mantendo-os próximos dentro da mesma cidade
        const latVariation = ((d1 * 0.001) + (d2 * 0.0001) + (d3 * 0.00001)).toFixed(6);
        const lngVariation = ((d3 * 0.001) + (d1 * 0.0001) + (d2 * 0.00001)).toFixed(6);
        
        // Coordenadas base para cada prefixo de CEP (centros das cidades)
        if (cleanCep.startsWith("17201")) { // Jaú
          lat = (-22.2936 + parseFloat(latVariation)).toString();
          lng = (-48.5591 + parseFloat(lngVariation)).toString();
          address = `${name} - CEP ${cep} - Jaú, SP`;
        }
        else if (cleanCep.startsWith("17302")) { // Dois Córregos
          lat = (-22.3673 + parseFloat(latVariation)).toString();
          lng = (-48.3821 + parseFloat(lngVariation)).toString();
          address = `${name} - CEP ${cep} - Dois Córregos, SP`;
        }
        else if (cleanCep.startsWith("14091")) { // Ribeirão Preto
          lat = (-21.1775 + parseFloat(latVariation)).toString();
          lng = (-47.8103 + parseFloat(lngVariation)).toString();
          address = `${name} - CEP ${cep} - Ribeirão Preto, SP`;
        }
        else if (cleanCep.startsWith("14800")) { // Araraquara
          lat = (-21.7941 + parseFloat(latVariation)).toString();
          lng = (-48.1783 + parseFloat(lngVariation)).toString();
          address = `${name} - CEP ${cep} - Araraquara, SP`;
        }
        else if (cleanCep.startsWith("13010")) { // Campinas
          lat = (-22.9064 + parseFloat(latVariation)).toString();
          lng = (-47.0616 + parseFloat(lngVariation)).toString();
          address = `${name} - CEP ${cep} - Campinas, SP`;
        }
        else if (cleanCep.startsWith("01")) { // São Paulo - Centro
          lat = (-23.5505 + parseFloat(latVariation)).toString();
          lng = (-46.6333 + parseFloat(lngVariation)).toString();
          address = `${name} - CEP ${cep} - São Paulo (Centro), SP`;
        }
        else { // Outras regiões
          console.log(`CEP não mapeado específicamente: ${cep}, usando aproximação baseada no CEP`);
          
          // Use os próprios dígitos do CEP para criar coordenadas únicas
          // Dividimos o CEP em grupos para calcular lat/lng
          const prefix = cleanCep.substring(0, 5);
          const suffix = cleanCep.substring(5);
          
          // Calcula latitude/longitude baseado nos dígitos do CEP
          const prefixNum = parseInt(prefix) || 10000;
          const suffixNum = parseInt(suffix) || 100;
          
          // Coordenadas de referência para o centro de SP
          const spLat = -22.0;
          const spLng = -48.0;
          
          // Calcula variações determinísticas (não aleatórias) baseadas no CEP
          lat = (spLat - (prefixNum % 100) / 1000 - (suffixNum % 10) / 10000).toString();
          lng = (spLng - (prefixNum % 100) / 1000 - (suffixNum % 10) / 10000).toString();
          
          address = `${name} - CEP ${cep} (Localização com base no CEP)`;
        }
        
        console.log(`CEP ${cep} mapeado para: ${lat}, ${lng} (${address})`);
        return { lat, lng, address };
      };
      
      // Processa cada linha do arquivo
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Verifica se a linha tem o formato CEP,Nome
        if (line.includes(',')) {
          try {
            // Extrai CEP e nome
            const [rawCep, ...nameParts] = line.split(",").map(part => part.trim());
            const name = nameParts.join(", ");
            
            // Formata e valida o CEP
            const cep = rawCep.replace(/[^0-9]/g, '');
            const formattedCep = cep.length === 8 ? `${cep.substring(0, 5)}-${cep.substring(5)}` : rawCep;
            
            if (cep && cep.length === 8 && name) {
              // Obtém coordenadas para este CEP
              const { lat, lng, address } = getCoordinatesForCep(cep, name);
              
              // Adiciona à lista de localizações
              locations.push({ 
                cep: formattedCep, 
                name, 
                lat, 
                lng, 
                address 
              });
              
              console.log(`Processado CEP ${i+1}/${lines.length}: ${formattedCep}, Nome: ${name}`);
            } else {
              console.warn(`Linha ${i+1}: CEP inválido ou nome ausente - ${line}`);
            }
          } catch (err) {
            console.error(`Erro ao processar linha ${i+1}: ${line}`, err);
          }
        } else {
          console.warn(`Linha ${i+1}: Formato inválido (sem vírgula) - ${line}`);
        }
      }
      
      console.log(`Processamento concluído. ${locations.length} localizações válidas encontradas.`);
      res.json({ locations });
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      res.status(400).json({ message: "Invalid file content" });
    }
  });

  // Get all vehicle types
  app.get("/api/vehicle-types", async (req: Request, res: Response) => {
    try {
      const vehicleTypes = await storage.getAllVehicleTypes();
      res.json(vehicleTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve vehicle types" });
    }
  });

  // Get points of interest (tolls, weighing stations)
  app.get("/api/points-of-interest", async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string;
      let pointsOfInterest;
      
      if (type) {
        pointsOfInterest = await storage.getPointsOfInterestByType(type);
      } else {
        pointsOfInterest = await storage.getAllPointsOfInterest();
      }
      
      res.json(pointsOfInterest);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve points of interest" });
    }
  });

  // Get city events
  app.get("/api/city-events", async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const cities = req.query.cities as string;
      
      let cityList: string[] = [];
      if (cities) {
        cityList = cities.split(",");
      }
      
      const events = await storage.getCityEvents(startDate, endDate, cityList);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve city events" });
    }
  });

  // Get truck restrictions
  app.get("/api/truck-restrictions", async (req: Request, res: Response) => {
    try {
      const cities = req.query.cities as string;
      
      let cityList: string[] = [];
      if (cities) {
        cityList = cities.split(",");
      }
      
      const restrictions = await storage.getTruckRestrictionsByCities(cityList);
      res.json(restrictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve truck restrictions" });
    }
  });

  // Calculate optimal route (TSP)
  app.post("/api/calculate-route", async (req: Request, res: Response) => {
    try {
      const { locationIds, vehicleType } = req.body;
      
      if (!Array.isArray(locationIds) || locationIds.length < 2) {
        return res.status(400).json({ message: "At least 2 locations are required" });
      }
      
      if (!vehicleType) {
        return res.status(400).json({ message: "Vehicle type is required" });
      }
      
      // In a real implementation, we would call a TSP algorithm here
      // and return the optimized route
      
      const origin = await storage.getOrigin();
      const locations = await storage.getLocationsByIds(locationIds);
      
      if (locations.length !== locationIds.length) {
        return res.status(400).json({ message: "One or more invalid location IDs" });
      }
      
      // For demo purposes, just return the locations in order with the origin at start/end
      const route = {
        waypoints: [origin, ...locations, origin],
        totalDistance: 145000, // 145km in meters
        totalDuration: 8100, // 2h 15min in seconds
        tollCost: 3240, // R$32.40 in cents
        fuelCost: 12050, // R$120.50 in cents
      };
      
      res.json(route);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate route" });
    }
  });

  // Initialize with seed data (only in development)
  if (process.env.NODE_ENV === "development") {
    app.post("/api/seed-data", async (req: Request, res: Response) => {
      try {
        // Seed the origin (Dois Córregos)
        await storage.seedOrigin();
        
        // Seed vehicle types
        await storage.seedVehicleTypes();
        
        // Seed points of interest
        await storage.seedPointsOfInterest();
        
        // Seed city events
        await storage.seedCityEvents();
        
        // Seed truck restrictions
        await storage.seedTruckRestrictions();
        
        res.json({ message: "Data seeded successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to seed data" });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
