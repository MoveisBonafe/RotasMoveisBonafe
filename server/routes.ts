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
      const { content } = parseCepFileSchema.parse(req.body);
      
      // Parse the file content (format: cep,name)
      // Normalize line breaks para lidar com arquivos de diferentes sistemas operacionais
      const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedContent.split('\n').filter(line => line.trim() !== "");
      console.log(`Processando ${lines.length} linhas do arquivo`);
      console.log(`Conteúdo do arquivo: ${normalizedContent}`);
      
      const locations = [];
      
      // Processar linha por linha
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Verificar se a linha contém vírgula (formato: cep,nome)
        if (line.includes(',')) {
          // Separamos por vírgula e removemos espaços extras
          const [cep, ...nameParts] = line.split(",").map(part => part.trim());
          // Juntamos todas as partes do nome caso haja vírgulas no nome
          const name = nameParts.join(", ");
          
          if (cep && name && cepRegex.test(cep)) {
            // Adicionar dados geográficos básicos para os CEPs brasileiros mais comuns
            // Isso é uma solução temporária que garante que os CEPs são exibidos no mapa
            // Em uma implementação de produção, usaríamos um serviço de geocodificação real
            
            let lat = "", lng = "", address = "";
            
            // Mapeamento básico de CEPs para coordenadas aproximadas
            // Apenas como exemplo - em produção usaríamos API de geocodificação
            if (cep.startsWith("17")) { // Região de Dois Córregos/Jaú
              if (cep === "17302122") { // Dois Córregos
                lat = "-22.3673";
                lng = "-48.3823";
                address = "Dois Córregos, SP, Brasil";
              } else if (cep === "17201010") { // Jaú
                lat = "-22.2936";
                lng = "-48.5591";
                address = "Jaú, SP, Brasil";
              } else {
                lat = "-22.3000";
                lng = "-48.4000";
                address = "Região de Jaú, SP, Brasil";
              }
            } else if (cep.startsWith("14")) { // Região de Ribeirão Preto
              if (cep === "14091530") { // Ribeirão Preto
                lat = "-21.1775";
                lng = "-47.8103";
                address = "Ribeirão Preto, SP, Brasil";
              } else if (cep === "14800022") { // Araraquara
                lat = "-21.7845";
                lng = "-48.1752";
                address = "Araraquara, SP, Brasil";
              } else {
                lat = "-21.2000";
                lng = "-47.8000";
                address = "Região de Ribeirão Preto, SP, Brasil";
              }
            } else if (cep.startsWith("13")) { // Região de Campinas
              if (cep === "13010002") { // Campinas
                lat = "-22.9064";
                lng = "-47.0616";
                address = "Campinas, SP, Brasil";
              } else {
                lat = "-22.9000";
                lng = "-47.0000";
                address = "Região de Campinas, SP, Brasil";
              }
            } else {
              // Um ponto padrão em São Paulo para CEPs desconhecidos
              lat = "-23.5500";
              lng = "-46.6300";
              address = "São Paulo, SP, Brasil";
            }
            
            locations.push({ cep, name, lat, lng, address });
            console.log(`Adicionado CEP: ${cep}, Nome: ${name}, Coord: ${lat},${lng}`);
          }
        }
      }
      
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
