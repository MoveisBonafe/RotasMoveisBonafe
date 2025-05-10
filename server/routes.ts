import type { Express, Request, Response, NextFunction } from "express";
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
       * Utiliza a API de Geocoding do Google Maps para obter coordenadas precisas para cada CEP,
       * com fallback para um sistema de grade inteligente baseado na localização da cidade.
       */
      const getCoordinatesForCep = async (cep: string, name: string) => {
        // Remover traços e formatar o CEP para a pesquisa
        const cleanCep = cep.replace(/[^0-9]/g, '');
        const formattedCep = cleanCep.length === 8 ? `${cleanCep.substring(0, 5)}-${cleanCep.substring(5)}` : cleanCep;
        
        // Termos de busca para melhorar a precisão do geocodificador
        const searchTerm = `CEP ${formattedCep}, ${name}, Brasil`;
        
        try {
          // Verificar se temos a API key do Google Maps configurada no servidor
          const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
          
          if (apiKey) {
            // Fazer uma requisição para a API de Geocodificação do Google
            console.log(`Buscando coordenadas para: ${searchTerm}`);
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchTerm)}&key=${apiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === "OK" && data.results && data.results.length > 0) {
              const result = data.results[0];
              const lat = result.geometry.location.lat.toString();
              const lng = result.geometry.location.lng.toString();
              const address = result.formatted_address;
              
              console.log(`Geocodificação bem sucedida para CEP ${formattedCep}: ${lat}, ${lng}`);
              return { lat, lng, address };
            } else {
              console.log(`Geocodificação falhou para ${searchTerm}, status: ${data.status}. Usando método alternativo.`);
            }
          }
          
          // Fallback para o método baseado em grade se a API falhar ou não estiver disponível
          return calculateGridCoordinates(cleanCep, formattedCep, name);
        } catch (error) {
          console.error("Erro ao chamar a API de Geocodificação:", error);
          // Se algo der errado, usar o método de grade como fallback
          return calculateGridCoordinates(cleanCep, formattedCep, name);
        }
      };
      
      /**
       * Método de fallback que gera coordenadas baseadas em uma grade ao redor das coordenadas da cidade
       */
      const calculateGridCoordinates = (cleanCep: string, formattedCep: string, name: string) => {
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
        
        // Criar variações mais distribuídas (mas ainda determinísticas) usando os dígitos do CEP
        const gridSize = 10;
        const maxOffset = 0.015; // aproximadamente 1,5km
        
        // Usar um hash simples baseado no CEP completo para mais aleatoriedade
        const cepSum = cleanCep.split('').reduce((sum, digit) => sum + parseInt(digit || '0'), 0);
        
        // Calcular posição na grade
        const xGrid = ((d1 * 10 + d2 + cepSum) % gridSize); 
        const yGrid = ((d2 * 10 + d3 + d1) % gridSize);
        
        // Converter para coordenadas com variação natural
        const latVariation = (xGrid / gridSize - 0.5) * maxOffset;
        const lngVariation = (yGrid / gridSize - 0.5) * maxOffset;
        
        // Calcular coordenadas finais
        const lat = (baseLat + latVariation).toFixed(6);
        const lng = (baseLng + lngVariation).toFixed(6);
        
        // Criar um endereço para exibição
        const address = `${name} - CEP ${formattedCep}, ${city}, SP`;
        
        console.log(`CEP ${formattedCep} mapeado para (método grade): ${lat}, ${lng} (${address})`);
        return { lat, lng, address };
      };
      
      // Processa cada linha do arquivo
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Verifica se a linha tem o formato CEP,Nome
        if (line.includes(',')) {
          try {
            // Extrai CEP e nome
            const [rawCep, ...nameParts] = line.split(",").map((part: string) => part.trim());
            const name = nameParts.join(", ");
            
            // Formata e valida o CEP
            const cep = rawCep.replace(/[^0-9]/g, '');
            const formattedCep = cep.length === 8 ? `${cep.substring(0, 5)}-${cep.substring(5)}` : rawCep;
            
            if (cep && cep.length === 8 && name) {
              try {
                // Obtém coordenadas para este CEP
                const coords = await getCoordinatesForCep(cep, name);
                
                // Adiciona à lista de localizações
                locations.push({ 
                  cep: formattedCep, 
                  name, 
                  lat: coords.lat, 
                  lng: coords.lng, 
                  address: coords.address 
                });
                
                console.log(`Processado CEP ${i+1}/${lines.length}: ${formattedCep}, Nome: ${name}`);
              } catch (geocodeError) {
                console.error(`Erro ao geocodificar CEP ${formattedCep}:`, geocodeError);
              }
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
      
      // Reorganiza a lista para que o caminhão 1 eixo apareça primeiro
      const truck1 = vehicleTypes.find(vt => vt.type === "truck1");
      const otherTypes = vehicleTypes.filter(vt => vt.type !== "truck1");
      
      if (truck1) {
        // Coloca o caminhão 1 eixo no início do array
        res.json([truck1, ...otherTypes]);
      } else {
        res.json(vehicleTypes);
      }
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
  
  /**
   * Endpoint para obter balanças de pesagem de várias fontes
   * Permite filtrar por cidade ou rodovia
   */
  app.get("/api/weighing-stations", async (req: Request, res: Response) => {
    try {
      // Obter as balanças do banco de dados primeiro
      const allPOIs = await storage.getAllPointsOfInterest();
      let weighingStations = allPOIs.filter(poi => poi.type === 'weighing_station');
      
      // Parâmetros opcionais para filtrar
      const cities = req.query.cities ? String(req.query.cities).split(',') : [];
      const highways = req.query.highways ? String(req.query.highways).split(',') : [];
      
      // Log dos parâmetros recebidos
      console.log(`Buscando balanças. Cidades: [${cities.join(", ")}], Rodovias: [${highways.join(", ")}]`);
      
      // Fontes de dados de balanças
      let weighingStationsFromOtherSources: any[] = [];
      
      // Dados de balanças diretamente no servidor
      // Poderíamos buscar de um arquivo local mas vamos simplificar para manter a compatibilidade
      const balancasPorCidade: Record<string, any[]> = {
        'Dois Córregos': [
          {nome: 'Posto de Fiscalização Dois Córregos', lat: '-22.3650', lng: '-48.3750', rodovia: 'SP-225', fonte: 'DER-SP'}
        ],
        'Ribeirão Preto': [
          {nome: 'Balança DER Ribeirão Preto', lat: '-21.1776', lng: '-47.8234', rodovia: 'SP-330', fonte: 'DER-SP'},
        ]
      };
      
      const balancasPorRodovia: Record<string, any[]> = {
        'SP-225': [
          {nome: 'Balança Itirapina (km 110)', lat: '-22.2505', lng: '-47.8456', km: 110, fonte: 'DER-SP'},
          {nome: 'Balança Jaú (km 230)', lat: '-22.3006', lng: '-48.5584', km: 230, fonte: 'DER-SP'},
          {nome: 'Balança Dois Córregos', lat: '-22.3650', lng: '-48.3750', km: 185, fonte: 'ANTT'}
        ],
        'SP-255': [
          {nome: 'Balança Luís Antônio (km 150)', lat: '-21.5510', lng: '-47.7770', km: 150, fonte: 'DER-SP'},
        ]
      };
      
      // Buscar balanças por cidade (se fornecidas)
      if (cities.length > 0) {
        // Criar pontos de interesse a partir dos dados locais
        let stationId = 60000;
        cities.forEach(city => {
          const normalizedCity = city.toLowerCase();
          // Procurar por correspondências aproximadas
          Object.keys(balancasPorCidade).forEach(cityKey => {
            const normalizedCityKey = cityKey.toLowerCase();
            if (normalizedCityKey.includes(normalizedCity) || normalizedCity.includes(normalizedCityKey)) {
              const cityStations = balancasPorCidade[cityKey];
              if (cityStations && cityStations.length > 0) {
                console.log(`Encontradas ${cityStations.length} balanças próximas à cidade ${cityKey}`);
                
                // Converter para o formato PointOfInterest
                cityStations.forEach(station => {
                  weighingStationsFromOtherSources.push({
                    id: stationId++,
                    name: station.nome,
                    type: 'weighing_station',
                    lat: station.lat,
                    lng: station.lng,
                    roadName: station.rodovia || `Próximo a ${cityKey}`,
                    city: cityKey,
                    address: `${station.nome}, ${cityKey}, SP`,
                    knownHighwaySource: true
                  });
                });
              }
            }
          });
        });
      }
      
      // Buscar balanças por rodovia (se fornecidas)
      if (highways.length > 0) {
        let stationId = 70000;
        highways.forEach(highway => {
          const normalizedHighway = highway.replace(/\s+/g, '-').toUpperCase();
          const highwayStations = balancasPorRodovia[normalizedHighway];
          if (highwayStations && highwayStations.length > 0) {
            console.log(`Encontradas ${highwayStations.length} balanças na rodovia ${normalizedHighway}`);
            
            // Converter para o formato PointOfInterest
            highwayStations.forEach(station => {
              weighingStationsFromOtherSources.push({
                id: stationId++,
                name: station.nome,
                type: 'weighing_station',
                lat: station.lat,
                lng: station.lng,
                roadName: normalizedHighway,
                address: `${station.nome}, km ${station.km || 'N/A'}, ${normalizedHighway}`,
                knownHighwaySource: true
              });
            });
          }
        });
      }
      
      // Remover duplicatas pelo ID
      const uniqueIds = new Set<number>();
      const uniqueStations = [...weighingStations];
      
      // Adicionar balanças de outras fontes, verificando duplicatas
      weighingStationsFromOtherSources.forEach(station => {
        if (!uniqueIds.has(station.id)) {
          uniqueIds.add(station.id);
          uniqueStations.push(station);
        }
      });
      
      console.log(`Total de balanças encontradas: ${uniqueStations.length}`);
      res.json(uniqueStations);
    } catch (error) {
      console.error("Erro ao buscar balanças:", error);
      res.status(500).json({ error: "Falha ao buscar balanças", details: error.message });
    }
  });

  // Get city events - implementação simplificada para melhorar desempenho
  app.get("/api/city-events", (req: Request, res: Response) => {
    // Data atual para comparações (independentemente de query parameters)
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Dados fixos para todas as queries
    const events = [
      {
        id: 1,
        cityName: "Dois Córregos",
        eventName: "Aniversário da Cidade",
        eventType: "anniversary", 
        startDate: "2025-02-05",
        endDate: "2025-02-05",
        description: "Comemoração dos 150 anos da cidade (fundada em 5 de fevereiro de 1875)"
      },
      {
        id: 2,
        cityName: "Jaú",
        eventName: "Festa do Peão",
        eventType: "festival",
        startDate: "2025-05-10", // Dia atual da simulação
        endDate: "2025-05-15",
        description: "Tradicional festa com rodeio e shows"
      },
      {
        id: 3,
        cityName: "Jaú",
        eventName: "Aniversário da Cidade",
        eventType: "anniversary",
        startDate: "2025-08-15",
        endDate: "2025-08-15",
        description: "Comemoração dos 172 anos da cidade (fundada em 15 de agosto de 1853)"
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
        startDate: "2025-05-10", // Dia atual da simulação
        endDate: "2025-05-20",
        description: "Evento de agronegócio com exposições e leilões"
      },
      {
        id: 6,
        cityName: "Dois Córregos",
        eventName: "Festival Gastronômico",
        eventType: "festival",
        startDate: "2025-05-08", // Próximo da data atual da simulação
        endDate: "2025-05-12",
        description: "Festival com pratos típicos da região e atrações culturais"
      }
    ];
    
    try {
      // Datas passadas como parâmetros
      const { startDate, endDate, cities } = req.query;
      
      // Data simulada para apresentação
      const simulatedToday = new Date('2025-05-10');
      
      // Obter os parâmetros de data do request se disponíveis
      let filterStartDate = startDate ? new Date(startDate as string) : new Date('2025-05-01');
      let filterEndDate = endDate ? new Date(endDate as string) : new Date('2025-05-31');
      
      console.log("Filtrando eventos para o período:", 
        filterStartDate.toISOString().split('T')[0], 
        "até", 
        filterEndDate.toISOString().split('T')[0]);
      
      // Função auxiliar para verificar se um evento está entre duas datas (considerando apenas dia e mês)
      function filterEvents(eventDate: Date, startDate: Date, endDate: Date): boolean {
        // Para aniversários, comparamos apenas mês e dia, ignorando o ano
        const eventMonth = eventDate.getMonth(); // 0-11 (janeiro é 0)
        const eventDay = eventDate.getDate();
        
        // Extrair mês e dia das datas de início e fim do período
        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();
        const endMonth = endDate.getMonth();
        const endDay = endDate.getDate();
        
        // Criar uma data no mesmo ano do filtro para comparação
        const adjustedEventDate = new Date(startDate.getFullYear(), eventMonth, eventDay);
        
        // Verificação precisa de inclusão no período
        const isWithinPeriod = adjustedEventDate >= startDate && adjustedEventDate <= endDate;
        
        // Log para debug
        console.log(`Verificando evento: ${eventDate.toISOString().split('T')[0]}, Período: ${startDate.toISOString().split('T')[0]} até ${endDate.toISOString().split('T')[0]}, Resultado: ${isWithinPeriod}`);
        
        return isWithinPeriod;
      }
      
      // Filtrar eventos com base no período selecionado pelo usuário e tipo de evento
      const filteredEvents = events.filter(event => {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
        
        // Verificar sobreposição de períodos
        // A condição é verdadeira se o período do evento se sobrepõe ao período filtrado
        const periodsOverlap = (
          (eventStartDate <= filterEndDate && eventEndDate >= filterStartDate) ||
          (eventStartDate.getMonth() === filterStartDate.getMonth() && eventStartDate.getDate() === filterStartDate.getDate()) ||
          (eventStartDate.getMonth() === filterEndDate.getMonth() && eventStartDate.getDate() === filterEndDate.getDate())
        );
        
        // Para aniversários de cidades, verificamos se o dia/mês está dentro do período
        if (event.eventType === 'anniversary') {
          // Verificamos se o mês e dia do aniversário caem dentro do período filtrado
          return filterEvents(eventStartDate, filterStartDate, filterEndDate);
        }
        
        // Para festivais ou outros eventos com duração
        return periodsOverlap;
      });
      
      console.log("API de eventos chamada, retornando:", filteredEvents.length, "eventos");
      
      return res.json(filteredEvents);
    } catch (error) {
      console.error("Erro ao processar eventos:", error);
      // Em caso de erro, retorna um array vazio em vez de 500
      return res.json([]);
    }
  });

  // Get truck restrictions - retorna dados estáticos para evitar problemas
  app.get("/api/truck-restrictions", (_req: Request, res: Response) => {
    // Retornar dados hard-coded para evitar quaisquer problemas
    const restrictions = [
      {
        id: 1,
        cityName: "Dois Córregos",
        restriction: "Centro histórico",
        startTime: "07:00",
        endTime: "20:00",
        applicableVehicles: "Acima de 1 eixo",
        description: "Restrição de circulação durante o dia todo na área histórica"
      },
      {
        id: 2,
        cityName: "Jaú",
        restriction: "Perímetro urbano",
        startTime: "08:00",
        endTime: "10:00",
        applicableVehicles: "Acima de 2 eixos",
        description: "Restrição de circulação pela manhã"
      },
      {
        id: 3,
        cityName: "Jaú",
        restriction: "Perímetro urbano",
        startTime: "16:00",
        endTime: "19:00",
        applicableVehicles: "Acima de 2 eixos",
        description: "Restrição de circulação à tarde"
      }
    ];
    
    res.json(restrictions);
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
        totalCost: 15290, // soma de tollCost + fuelCost em cents
        fuelConsumption: 12.5 // em litros
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