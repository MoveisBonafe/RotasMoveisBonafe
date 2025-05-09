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
      const { fileContent } = req.body;
      
      if (!fileContent) {
        return res.status(400).json({ message: "Conteúdo do arquivo não fornecido" });
      }
      
      // Log do início do conteúdo para debug
      const contentPreview = fileContent.substring(0, 100);
      console.log(`Conteúdo recebido (preview): ${contentPreview}`);
      console.log(`Tamanho total do conteúdo: ${fileContent.length} caracteres`);
      
      // Normaliza quebras de linha para diferentes sistemas operacionais
      const normalizedContent = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedContent.split('\n').filter(line => line.trim() !== "");
      console.log(`Processando ${lines.length} linhas do arquivo`);
      
      // Array para armazenar as localizações encontradas
      const locations = [];
      
      /**
       * Gera coordenadas únicas para cada CEP baseadas nas coordenadas da cidade
       * com variações sutis para cada CEP diferente
       */
      const getCoordinatesForCep = (cep: string, name: string) => {
        // Remover traços e formatar o CEP para a pesquisa
        const cleanCep = cep.replace(/[^0-9]/g, '');
        const formattedCep = cleanCep.length === 8 ? `${cleanCep.substring(0, 5)}-${cleanCep.substring(5)}` : cleanCep;
        
        // Coordenadas base por cidade/região
        let baseLat = -22.0;
        let baseLng = -48.0;
        let city = "SP";
        
        // Mapeamento de prefixos de CEP para coordenadas e nomes de cidades
        const cityMapping: Record<string, { lat: number, lng: number, name: string }> = {
          "172": { lat: -22.2936, lng: -48.5591, name: "Jaú" },
          "173": { lat: -22.3673, lng: -48.3821, name: "Dois Córregos" },
          "140": { lat: -21.1775, lng: -47.8103, name: "Ribeirão Preto" },
          "148": { lat: -21.7941, lng: -48.1783, name: "Araraquara" },
          "130": { lat: -22.9064, lng: -47.0616, name: "Campinas" },
          "010": { lat: -23.5505, lng: -46.6333, name: "São Paulo" }
        };
        
        // Determinar a cidade com base no prefixo do CEP
        for (const prefix in cityMapping) {
          if (cleanCep.startsWith(prefix)) {
            baseLat = cityMapping[prefix].lat;
            baseLng = cityMapping[prefix].lng;
            city = cityMapping[prefix].name;
            break;
          }
        }
        
        // Extrair dígitos para criar variações determinísticas (sempre iguais para o mesmo CEP)
        const d1 = parseInt(cleanCep.charAt(5)) || 0;
        const d2 = parseInt(cleanCep.charAt(6)) || 0;
        const d3 = parseInt(cleanCep.charAt(7)) || 0;
        
        // Usar os últimos 3 dígitos para criar uma distribuição tipo "rede"
        // Isso posiciona pontos em um grid imaginário ao redor da coordenada central
        
        // Criar um padrão de distribuição que faz sentido visualmente no mapa
        // A variação é de no máximo 0.01 graus (~1km) do centro
        const gridSize = 10; // divisão do quadrante em 10x10
        const maxOffset = 0.01; // aprox. 1km em latitude/longitude
        
        // Calcular posição na grade imaginária
        const xGrid = (d1 * 10 + d2) % gridSize; // posição X (0-9)
        const yGrid = (d2 * 10 + d3) % gridSize; // posição Y (0-9)
        
        // Transformar para coordenadas com distribuição mais natural
        const latVariation = (xGrid / gridSize - 0.5) * maxOffset;
        const lngVariation = (yGrid / gridSize - 0.5) * maxOffset;
        
        // Calcular coordenadas finais com os ajustes
        const lat = (baseLat + latVariation).toFixed(6);
        const lng = (baseLng + lngVariation).toFixed(6);
        
        // Criar um endereço formatado
        let address = `${name} - CEP ${formattedCep}, ${city}, SP`;
        
        console.log(`CEP ${formattedCep} mapeado para: ${lat}, ${lng} (${address})`);
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
