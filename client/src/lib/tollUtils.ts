import { PointOfInterest } from "../../../shared/schema";

// Base de dados de pedágios conhecidos e frequentes na região de São Paulo
const knownTolls = [
  { 
    name: "Pedágio Boa Esperança do Sul", 
    lat: -21.9901, 
    lng: -48.3923,
    roadName: "SP-255"
  },
  { 
    name: "Pedágio SP-225 (Brotas)", 
    lat: -22.2794, 
    lng: -48.1257,
    roadName: "SP-225"
  },
  { 
    name: "Pedágio SP-225 (Dois Córregos)", 
    lat: -22.3673, 
    lng: -48.2823,
    roadName: "SP-225"
  },
  { 
    name: "Pedágio SP-255 (Jaú)", 
    lat: -22.1856, 
    lng: -48.6087,
    roadName: "SP-255"
  },
  {
    name: "Pedágio SP-304 (Torrinha)", 
    lat: -22.4238, 
    lng: -48.1701,
    roadName: "SP-304"
  },
  {
    name: "Pedágio SP-255 (Barra Bonita)", 
    lat: -22.5123, 
    lng: -48.5566,
    roadName: "SP-255"
  },
  {
    name: "Pedágio SP-310 (São Carlos)", 
    lat: -22.0105, 
    lng: -47.9107,
    roadName: "SP-310"
  },
  {
    name: "Pedágio SP-310 (Itirapina)", 
    lat: -22.2449, 
    lng: -47.8278,
    roadName: "SP-310"
  },
  {
    name: "Pedágio SP-330 (Ribeirão Preto)", 
    lat: -21.2089, 
    lng: -47.8651,
    roadName: "SP-330"
  },
  {
    name: "Pedágio SP-330 (Sertãozinho)", 
    lat: -21.0979, 
    lng: -47.9959,
    roadName: "SP-330"
  }
];

/**
 * Verifica se um ponto (pedágio) já existe na lista, para evitar duplicações
 */
export function checkIfTollExists(
  tollPoints: PointOfInterest[], 
  lat: number | string, 
  lng: number | string
): boolean {
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  return tollPoints.some(toll => {
    const tollLat = parseFloat(toll.lat);
    const tollLng = parseFloat(toll.lng);
    
    // Tolerância de aproximadamente 1-2km
    const latDiff = Math.abs(tollLat - latNum);
    const lngDiff = Math.abs(tollLng - lngNum);
    
    return latDiff < 0.02 && lngDiff < 0.02;
  });
}

/**
 * Verifica se um ponto está próximo da linha direta entre dois pontos
 * Útil para determinar se um pedágio está perto da rota
 */
export function pointIsNearLine(
  pointLat: number,
  pointLng: number,
  lineLat1: number,
  lineLng1: number,
  lineLat2: number,
  lineLng2: number,
  threshold = 0.05 // aproximadamente 5km
): boolean {
  // Cálculo da distância de um ponto a uma linha reta
  // usando a fórmula: d = |Ax0 + By0 + C| / sqrt(A² + B²)
  // onde a linha é Ax + By + C = 0
  
  // Convertendo para a forma Ax + By + C = 0
  const A = lineLat2 - lineLat1;
  const B = lineLng1 - lineLng2;
  const C = (lineLng2 * lineLat1) - (lineLng1 * lineLat2);
  
  // Calculando a distância
  const numerator = Math.abs(A * pointLat + B * pointLng + C);
  const denominator = Math.sqrt(A * A + B * B);
  
  const distance = numerator / denominator;
  
  return distance < threshold;
}

/**
 * Extrai informações de rodovias a partir das instruções da rota
 */
export function extractHighwaysFromInstructions(instructions: string): string[] {
  const highways: string[] = [];
  
  // Padrão para rodovias brasileiras: SP-XXX, BR-XXX, etc.
  const highwayPattern = /(?:SP|BR|MG|RJ|PR|RS|SC|ES|GO|MT|MS|PA|AM|RO|TO|BA|PE|CE|MA|PI|RN|PB|AL|SE|AC|AP|RR)-\d{3}/g;
  
  const matches = instructions.match(highwayPattern);
  
  if (matches) {
    matches.forEach(highway => {
      if (!highways.includes(highway)) {
        highways.push(highway);
      }
    });
  }
  
  return highways;
}

/**
 * Extrai nomes de cidades de um endereço ou texto
 */
export function extractCityNames(text: string): string[] {
  const cities: string[] = [];
  
  // Padrão para cidades em endereços brasileiros: "Cidade - UF"
  const cityPattern = /([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\s*-\s*[A-Z]{2}/g;
  
  const matches = text.match(cityPattern);
  
  if (matches) {
    matches.forEach(match => {
      const city = match.split('-')[0].trim();
      if (!cities.includes(city)) {
        cities.push(city);
      }
    });
  }
  
  // Procurar padrões de "passa por Cidade" ou "entrar em Cidade"
  const altPattern = /(?:passar por|entrar em|chegar em|chegar a|pegar|sair de)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/g;
  
  const altMatches = text.match(altPattern);
  
  if (altMatches) {
    altMatches.forEach(match => {
      const city = match.replace(/(?:passar por|entrar em|chegar em|chegar a|pegar|sair de)\s+/, '');
      if (!cities.includes(city)) {
        cities.push(city);
      }
    });
  }
  
  return cities;
}

/**
 * Verifica se a rota passa por uma cidade específica
 */
export function routePassesThroughCity(route: any, cityName: string): boolean {
  if (!route || !route.legs) return false;
  
  // Verificar nos endereços de início e fim
  for (const leg of route.legs) {
    if (leg.start_address && leg.start_address.includes(cityName)) {
      return true;
    }
    if (leg.end_address && leg.end_address.includes(cityName)) {
      return true;
    }
    
    // Verificar nas instruções de cada passo
    if (leg.steps) {
      for (const step of leg.steps) {
        if (step.html_instructions && step.html_instructions.includes(cityName)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Retorna os pedágios conhecidos para uma rodovia específica
 */
export function getTollsForHighway(highway: string): any[] {
  return knownTolls.filter(toll => toll.roadName === highway);
}

/**
 * Função principal para extrair informações de pedágio de uma rota
 * Combina múltiplos métodos para garantir que pedágios sejam encontrados
 */
export function extractTollsFromRoute(directionsResult: any): PointOfInterest[] {
  if (!directionsResult || !directionsResult.routes || directionsResult.routes.length === 0) {
    console.log("Nenhuma rota para extrair pedágios");
    return [];
  }

  const route = directionsResult.routes[0];
  const legs = route.legs || [];
  const tollPoints: PointOfInterest[] = [];
  let tollId = 10000;
  
  console.log(`Analisando ${legs.length} trechos da rota para pedágios`);
  
  // MÉTODO 1: Verificar informações explícitas de pedágio da API
  legs.forEach((leg: any, legIndex: number) => {
    if (leg.toll_info && leg.toll_info.toll_points && leg.toll_info.toll_points.length > 0) {
      console.log(`Método 1: Encontrados ${leg.toll_info.toll_points.length} pedágios no trecho ${legIndex + 1}`);
      
      leg.toll_info.toll_points.forEach((tollPoint: any) => {
        if (tollPoint.location) {
          const lat = tollPoint.location.lat.toString();
          const lng = tollPoint.location.lng.toString();
          
          if (!checkIfTollExists(tollPoints, lat, lng)) {
            const poi: PointOfInterest = {
              id: tollId++,
              name: tollPoint.name || `Pedágio ${legIndex + 1}`,
              lat: lat,
              lng: lng,
              type: 'toll',
              cost: tollPoint.cost || 0,
              roadName: tollPoint.road || "",
              restrictions: ""
            };
            
            tollPoints.push(poi);
            console.log(`Método 1: Adicionado pedágio ${poi.name}`);
          }
        }
      });
    }
  });
  
  // MÉTODO 2: Verificar menções explícitas a pedágios nas instruções
  legs.forEach((leg: any, legIndex: number) => {
    const steps = leg.steps || [];
    
    steps.forEach((step: any) => {
      if (!step.html_instructions) return;
      
      const instructions = step.html_instructions.replace(/<[^>]*>/g, '').toLowerCase();
      
      if (instructions.includes("pedágio") || 
          instructions.includes("pedagio") || 
          instructions.includes("praça de pedágio") || 
          instructions.includes("toll")) {
        
        console.log(`Método 2: Menção a pedágio encontrada: "${instructions}"`);
        
        if (step.start_location) {
          const lat = step.start_location.lat.toString();
          const lng = step.start_location.lng.toString();
          
          if (!checkIfTollExists(tollPoints, lat, lng)) {
            const poi: PointOfInterest = {
              id: tollId++,
              name: `Pedágio (instruções)`,
              lat: lat,
              lng: lng,
              type: 'toll',
              cost: 0,
              roadName: `Trecho ${legIndex + 1}`,
              restrictions: ""
            };
            
            tollPoints.push(poi);
            console.log(`Método 2: Adicionado pedágio em ${lat},${lng}`);
          }
        }
      }
    });
  });
  
  // MÉTODO 3: Verificar rodovias na rota
  const highways: string[] = [];
  
  legs.forEach(leg => {
    const steps = leg.steps || [];
    
    steps.forEach(step => {
      if (!step.html_instructions) return;
      
      const extracted = extractHighwaysFromInstructions(step.html_instructions);
      
      extracted.forEach(highway => {
        if (!highways.includes(highway)) {
          highways.push(highway);
        }
      });
    });
  });
  
  if (highways.length > 0) {
    console.log(`Método 3: Rodovias detectadas: ${highways.join(', ')}`);
    
    highways.forEach(highway => {
      const highwayTolls = getTollsForHighway(highway);
      
      if (highwayTolls.length > 0) {
        console.log(`Método 3: ${highwayTolls.length} pedágios encontrados para ${highway}`);
        
        // Para cada pedágio conhecido na rodovia
        highwayTolls.forEach(toll => {
          // Verificar se o pedágio está próximo da rota
          let isNearRoute = false;
          
          // Verificar se está próximo de algum trecho da rota
          for (const leg of legs) {
            if (leg.start_location && leg.end_location) {
              if (pointIsNearLine(
                toll.lat, 
                toll.lng,
                leg.start_location.lat,
                leg.start_location.lng,
                leg.end_location.lat,
                leg.end_location.lng
              )) {
                isNearRoute = true;
                break;
              }
            }
          }
          
          // Se o pedágio estiver próximo e não for duplicado
          if (isNearRoute && !checkIfTollExists(tollPoints, toll.lat, toll.lng)) {
            const poi: PointOfInterest = {
              id: tollId++,
              name: toll.name,
              lat: toll.lat.toString(),
              lng: toll.lng.toString(),
              type: 'toll',
              cost: 0,
              roadName: toll.roadName,
              restrictions: ""
            };
            
            tollPoints.push(poi);
            console.log(`Método 3: Adicionado pedágio ${toll.name} (${toll.roadName})`);
          }
        });
      }
    });
  }
  
  // MÉTODO 4: Verificar pedágios específicos para localidades importantes
  
  // Verificar se a rota passa por Boa Esperança do Sul
  if (routePassesThroughCity(route, "Boa Esperança")) {
    console.log("Método 4: Rota passa por Boa Esperança do Sul");
    
    // Encontrar o pedágio específico para Boa Esperança
    const boaEsperancaToll = knownTolls.find(t => t.name.includes("Boa Esperança"));
    
    if (boaEsperancaToll && !checkIfTollExists(tollPoints, boaEsperancaToll.lat, boaEsperancaToll.lng)) {
      const poi: PointOfInterest = {
        id: tollId++,
        name: boaEsperancaToll.name,
        lat: boaEsperancaToll.lat.toString(),
        lng: boaEsperancaToll.lng.toString(),
        type: 'toll',
        cost: 0,
        roadName: boaEsperancaToll.roadName,
        restrictions: "Pedágio importante"
      };
      
      tollPoints.push(poi);
      console.log(`Método 4: Adicionado pedágio específico ${boaEsperancaToll.name}`);
    }
  }
  
  // Se ainda não encontramos pedágios, verificar cidades na rota
  if (tollPoints.length === 0) {
    console.log("Método 5: Nenhum pedágio encontrado, verificando cidades na rota");
    
    const cities: string[] = [];
    
    // Extrair cidades dos endereços de origem e destino
    legs.forEach(leg => {
      if (leg.start_address) {
        const extractedStart = extractCityNames(leg.start_address);
        extractedStart.forEach(city => {
          if (!cities.includes(city)) cities.push(city);
        });
      }
      
      if (leg.end_address) {
        const extractedEnd = extractCityNames(leg.end_address);
        extractedEnd.forEach(city => {
          if (!cities.includes(city)) cities.push(city);
        });
      }
      
      // Extrair cidades das instruções
      if (leg.steps) {
        leg.steps.forEach((step: any) => {
          if (step.html_instructions) {
            const extractedSteps = extractCityNames(step.html_instructions);
            extractedSteps.forEach(city => {
              if (!cities.includes(city)) cities.push(city);
            });
          }
        });
      }
    });
    
    if (cities.length > 0) {
      console.log(`Método 5: Cidades na rota: ${cities.join(', ')}`);
      
      // Verificar rota específica entre Dois Córregos e Boa Esperança
      if (cities.some(c => c.includes("Dois Córregos")) && 
          cities.some(c => c.includes("Boa Esperança"))) {
        
        console.log("Método 5: Rota específica Dois Córregos <-> Boa Esperança detectada");
        
        // Adicionar pedágio específico
        const boaEsperancaToll = knownTolls.find(t => t.name.includes("Boa Esperança"));
        
        if (boaEsperancaToll && !checkIfTollExists(tollPoints, boaEsperancaToll.lat, boaEsperancaToll.lng)) {
          const poi: PointOfInterest = {
            id: tollId++,
            name: boaEsperancaToll.name,
            lat: boaEsperancaToll.lat.toString(),
            lng: boaEsperancaToll.lng.toString(),
            type: 'toll',
            cost: 0,
            roadName: boaEsperancaToll.roadName,
            restrictions: "Rota específica"
          };
          
          tollPoints.push(poi);
          console.log(`Método 5: Adicionado pedágio específico ${boaEsperancaToll.name}`);
        }
      }
    }
  }
  
  console.log(`Total de ${tollPoints.length} pedágios encontrados na rota`);
  return tollPoints;
}

export default {
  knownTolls,
  extractTollsFromRoute,
  checkIfTollExists,
  pointIsNearLine,
  extractHighwaysFromInstructions,
  extractCityNames,
  routePassesThroughCity,
  getTollsForHighway
};