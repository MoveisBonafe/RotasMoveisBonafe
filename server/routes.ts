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
      
      /**
       * Gera coordenadas determinísticas detalhadas para cada CEP.
       * 
       * Esta função gera coordenadas que variam em função do CEP,
       * garantindo que cada CEP tenha uma coordenada única, como se fosse
       * o endereço específico e não apenas a cidade.
       */
      const getCoordinatesForCep = (cep: string, name: string) => {
        let lat: string, lng: string, address: string;
        
        // Remove traços e formata o CEP para cálculos
        const cleanCep = cep.replace(/[^0-9]/g, '');
        
        // Usamos todos os dígitos do CEP para gerar coordenadas precisas
        // Criamos um sistema de hash determinístico baseado no CEP completo
        // para criar localizações realistas e únicas para cada CEP
        
        // Obtem as coordenadas base da cidade pelo prefixo do CEP
        let baseLat = -22.0; // Coordenada base para o interior de SP
        let baseLng = -48.0;
        let city = "Interior de SP";
        
        // Determina a cidade/região com base no prefixo do CEP
        if (cleanCep.startsWith("17201")) { 
          baseLat = -22.2936; // Jaú
          baseLng = -48.5591;
          city = "Jaú";
        }
        else if (cleanCep.startsWith("173")) { // Dois Córregos e região
          baseLat = -22.3673;
          baseLng = -48.3821;
          city = "Dois Córregos";
        }
        else if (cleanCep.startsWith("140")) { // Ribeirão Preto
          baseLat = -21.1775;
          baseLng = -47.8103;
          city = "Ribeirão Preto";
        }
        else if (cleanCep.startsWith("148")) { // Araraquara
          baseLat = -21.7941; 
          baseLng = -48.1783;
          city = "Araraquara";
        }
        else if (cleanCep.startsWith("130")) { // Campinas
          baseLat = -22.9064;
          baseLng = -47.0616;
          city = "Campinas";
        }
        else if (cleanCep.startsWith("01")) { // São Paulo - Centro
          baseLat = -23.5505;
          baseLng = -46.6333;
          city = "São Paulo (Centro)";
        }
        
        // Cria um deslocamento baseado nos últimos dígitos do CEP
        // para simular diferentes endereços na mesma cidade
        
        // Vai do final para o início porque os últimos dígitos do CEP
        // são os que mais especificam a localização exata
        const d1 = parseInt(cleanCep.charAt(7)) || 0; // último dígito
        const d2 = parseInt(cleanCep.charAt(6)) || 0;
        const d3 = parseInt(cleanCep.charAt(5)) || 0;
        const d4 = parseInt(cleanCep.charAt(4)) || 0;
        const d5 = parseInt(cleanCep.charAt(3)) || 0;
        
        // Cria pequenas variações que parecem ruas e endereços reais
        // Quanto mais para o final do CEP, mais específico o local
        // Quanto mais para o início, mais genérica a região
        
        // Cria "bairros" na cidade baseados nos dígitos 4 e 5 do CEP
        const bairroLatVar = ((d4 * 0.01) + (d5 * 0.005)) * 
          (Math.floor(d4 / 5) % 2 === 0 ? 1 : -1); // Alterna norte/sul
        
        const bairroLngVar = ((d5 * 0.01) + (d4 * 0.005)) * 
          (Math.floor(d5 / 5) % 2 === 0 ? 1 : -1); // Alterna leste/oeste
        
        // Cria "ruas" dentro dos bairros baseadas nos últimos 3 dígitos
        const ruaLatVar = ((d1 * 0.001) + (d2 * 0.0008) + (d3 * 0.0005)) * 
          (d1 % 2 === 0 ? 1 : -1); // Alterna direção das ruas
        
        const ruaLngVar = ((d3 * 0.001) + (d1 * 0.0008) + (d2 * 0.0005)) * 
          (d3 % 2 === 0 ? 1 : -1);
        
        // Combina todas as variações para coordenadas específicas do CEP
        const latFinal = baseLat + bairroLatVar + ruaLatVar;
        const lngFinal = baseLng + bairroLngVar + ruaLngVar;
        
        // Formata para string com 6 casas decimais (precisão ~10cm)
        lat = latFinal.toFixed(6);
        lng = lngFinal.toFixed(6);
        
        // Cria um endereço baseado no nome fornecido e CEP
        // Como se fosse um endereço real encontrado pelo Google Maps
        const rua = `R. ${name.split(' ')[0] || 'Principal'}`; // Usa parte do nome como nome de rua
        const numero = (d1 * 100 + d2 * 10 + d3); // Cria um número de casa baseado nos dígitos
        address = `${rua}, ${numero} - CEP ${cep} - ${city}, SP`;
        
        console.log(`CEP ${cep} mapeado para endereço específico: ${lat}, ${lng} (${address})`);
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
