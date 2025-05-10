import { PointOfInterest } from "./types";

/**
 * Banco de dados ampliado de balanças rodoviárias no Brasil, especialmente em São Paulo
 * Contém dados de diversas fontes para maior cobertura de balanças em rodovias
 */

// Mapeamento de balanças por rodovia
export const balancasPorRodovia: Record<string, {nome: string, lat: string, lng: string, km?: number, fonte?: string}[]> = {
  // Principais Rodovias do Estado de São Paulo
  'SP-255': [
    {nome: 'Balança Luís Antônio (km 150)', lat: '-21.5510', lng: '-47.7770', km: 150, fonte: 'DER-SP'},
    {nome: 'Balança Borborema (km 210)', lat: '-21.6214', lng: '-49.0741', km: 210, fonte: 'DER-SP'},
    {nome: 'Balança Boa Esperança do Sul', lat: '-21.9935', lng: '-48.3917', km: 177, fonte: 'DNIT'}
  ],
  'SP-330': [
    {nome: 'Balança Limeira (km 145)', lat: '-22.5890', lng: '-47.4120', km: 145, fonte: 'DER-SP'},
    {nome: 'Balança Ribeirão Preto (km 310)', lat: '-21.1776', lng: '-47.8234', km: 310, fonte: 'DER-SP'},
    {nome: 'Posto de Pesagem Anhanguera', lat: '-21.1670', lng: '-47.8430', km: 308, fonte: 'ANTT'},
    {nome: 'Balança Sertãozinho', lat: '-21.0970', lng: '-47.9900', km: 325, fonte: 'DER-SP'}
  ],
  'SP-310': [
    {nome: 'Balança São Carlos (km 227)', lat: '-22.0105', lng: '-47.8907', km: 227, fonte: 'DER-SP'},
    {nome: 'Balança Matão (km 290)', lat: '-21.6215', lng: '-48.3663', km: 290, fonte: 'DER-SP'},
    {nome: 'Balança Araraquara', lat: '-21.7950', lng: '-48.1758', km: 267, fonte: 'DER-SP'}
  ],
  'SP-225': [
    {nome: 'Balança Itirapina (km 110)', lat: '-22.2505', lng: '-47.8456', km: 110, fonte: 'DER-SP'},
    {nome: 'Balança Jaú (km 230)', lat: '-22.3006', lng: '-48.5584', km: 230, fonte: 'DER-SP'},
    {nome: 'Balança Dois Córregos', lat: '-22.3650', lng: '-48.3750', km: 185, fonte: 'ANTT'}
  ],
  'SP-280': [
    {nome: 'Balança Sorocaba (km 80)', lat: '-23.4823', lng: '-47.4458', km: 80, fonte: 'DER-SP'},
    {nome: 'Balança Botucatu (km 180)', lat: '-23.0810', lng: '-48.2630', km: 180, fonte: 'DER-SP'},
    {nome: 'Balança Castelo Branco - Bauru', lat: '-22.3336', lng: '-49.0300', km: 290, fonte: 'ANTT'}
  ],
  'SP-270': [
    {nome: 'Balança Ourinhos (km 370)', lat: '-22.9828', lng: '-49.8610', km: 370, fonte: 'DER-SP'},
    {nome: 'Balança Presidente Prudente', lat: '-22.1317', lng: '-51.3889', km: 560, fonte: 'DER-SP'}
  ],
  'SP-348': [
    {nome: 'Balança Bandeirantes (km 110)', lat: '-22.8700', lng: '-47.1200', km: 110, fonte: 'DER-SP'},
    {nome: 'Balança Cordeirópolis', lat: '-22.5150', lng: '-47.4290', km: 160, fonte: 'ARTESP'}
  ],
  'SP-300': [
    {nome: 'Balança Marechal Rondon (km 320)', lat: '-22.3420', lng: '-49.0570', km: 320, fonte: 'DER-SP'},
    {nome: 'Balança Araçatuba', lat: '-21.2090', lng: '-50.4410', km: 530, fonte: 'DER-SP'}
  ],
  'SP-333': [
    {nome: 'Balança Jaboticabal (km 120)', lat: '-21.2420', lng: '-48.3233', km: 120, fonte: 'DER-SP'}
  ],
  // Rodovias federais relevantes
  'BR-116': [
    {nome: 'PPV Régis Bittencourt (Registro)', lat: '-24.4877', lng: '-47.8453', km: 400, fonte: 'DNIT'},
    {nome: 'PPV Via Dutra (Guarulhos)', lat: '-23.4560', lng: '-46.4230', km: 210, fonte: 'DNIT'}
  ],
  'BR-381': [
    {nome: 'PPV Fernão Dias (Atibaia)', lat: '-23.1190', lng: '-46.5660', km: 50, fonte: 'DNIT'}
  ],
  'BR-153': [
    {nome: 'PPV Transbrasiliana (Ourinhos)', lat: '-22.9790', lng: '-49.8693', km: 340, fonte: 'DNIT'},
    {nome: 'PPV São José do Rio Preto', lat: '-20.8120', lng: '-49.3770', km: 220, fonte: 'DNIT'}
  ]
};

// Mapeamento de balanças por proximidade de cidades importantes
export const balancasPorCidade: Record<string, {nome: string, lat: string, lng: string, rodovia?: string, fonte?: string}[]> = {
  'Ribeirão Preto': [
    {nome: 'Balança DER Ribeirão Preto', lat: '-21.1776', lng: '-47.8234', rodovia: 'SP-330', fonte: 'DER-SP'},
    {nome: 'Posto de Pesagem Rodovia Abraão Assed', lat: '-21.2310', lng: '-47.8560', rodovia: 'SP-333', fonte: 'ANTT'},
    {nome: 'PPV Rodovia Antônio Machado Sant\'Anna', lat: '-21.1740', lng: '-47.7940', rodovia: 'SP-255', fonte: 'DNIT'}
  ],
  'Luís Antônio': [
    {nome: 'Balança Luís Antônio', lat: '-21.5510', lng: '-47.7770', rodovia: 'SP-255', fonte: 'DER-SP'}
  ],
  'Araraquara': [
    {nome: 'Balança DER Araraquara', lat: '-21.7950', lng: '-48.1758', rodovia: 'SP-310', fonte: 'DER-SP'},
    {nome: 'Balança Washington Luiz', lat: '-21.7930', lng: '-48.1720', rodovia: 'SP-310', fonte: 'ARTESP'}
  ],
  'São Carlos': [
    {nome: 'Balança São Carlos', lat: '-22.0105', lng: '-47.8907', rodovia: 'SP-310', fonte: 'DER-SP'},
    {nome: 'PPV Washington Luiz', lat: '-22.0090', lng: '-47.8930', rodovia: 'SP-310', fonte: 'DNIT'}
  ],
  'Dois Córregos': [
    {nome: 'Posto de Fiscalização Dois Córregos', lat: '-22.3650', lng: '-48.3750', rodovia: 'SP-225', fonte: 'DER-SP'}
  ],
  'Jaú': [
    {nome: 'Balança Jaú', lat: '-22.3006', lng: '-48.5584', rodovia: 'SP-225', fonte: 'DER-SP'}
  ],
  'Bauru': [
    {nome: 'Balança Marechal Rondon', lat: '-22.3420', lng: '-49.0570', rodovia: 'SP-300', fonte: 'DER-SP'},
    {nome: 'PPV Entrada de Bauru', lat: '-22.3350', lng: '-49.0270', rodovia: 'SP-225', fonte: 'ANTT'}
  ],
  'Piracicaba': [
    {nome: 'Balança Rodovia Luiz de Queiroz', lat: '-22.7165', lng: '-47.6490', rodovia: 'SP-304', fonte: 'DER-SP'}
  ],
  'Campinas': [
    {nome: 'Balança Rodovia Anhanguera', lat: '-22.9340', lng: '-47.0130', rodovia: 'SP-330', fonte: 'DER-SP'},
    {nome: 'Balança Bandeirantes', lat: '-22.9050', lng: '-47.0860', rodovia: 'SP-348', fonte: 'ARTESP'}
  ],
  'Franca': [
    {nome: 'Balança Franca', lat: '-20.5388', lng: '-47.4010', rodovia: 'SP-334', fonte: 'DER-SP'}
  ],
  'Limeira': [
    {nome: 'Balança Limeira', lat: '-22.5890', lng: '-47.4120', rodovia: 'SP-330', fonte: 'DER-SP'}
  ],
  'Rio Preto': [
    {nome: 'Balança São José do Rio Preto', lat: '-20.8120', lng: '-49.3770', rodovia: 'BR-153', fonte: 'DNIT'},
    {nome: 'Posto de Pesagem Washington Luiz', lat: '-20.8210', lng: '-49.3450', rodovia: 'SP-310', fonte: 'DER-SP'}
  ]
};

/**
 * Busca balanças nas proximidades das cidades da rota
 * @param citiesOnRoute Lista de nomes de cidades na rota
 * @returns Array de pontos de interesse representando balanças
 */
export function getWeighingStationsByCities(citiesOnRoute: string[]): PointOfInterest[] {
  const stations: PointOfInterest[] = [];
  let stationId = 60000; // ID base para estas balanças
  
  // Normalizar nomes das cidades (remover acentos, converter para lowercase)
  const normalizedCities = citiesOnRoute.map(city => 
    city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  );
  
  // Buscar correspondências aproximadas
  Object.keys(balancasPorCidade).forEach(cityKey => {
    const normalizedCityKey = cityKey
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    
    // Verificar se esta cidade está na rota ou próxima
    const isNearRoute = normalizedCities.some(city => 
      normalizedCityKey.includes(city) || 
      city.includes(normalizedCityKey)
    );
    
    if (isNearRoute) {
      const cityStations = balancasPorCidade[cityKey];
      if (cityStations && cityStations.length > 0) {
        console.log(`Encontradas ${cityStations.length} balanças próximas à cidade ${cityKey}`);
        
        // Converter para o formato PointOfInterest
        cityStations.forEach(station => {
          const poi: PointOfInterest = {
            id: stationId++,
            name: station.nome,
            type: 'weighing_station',
            lat: station.lat,
            lng: station.lng,
            roadName: station.rodovia || `Próximo a ${cityKey}`,
            city: cityKey,
            // Adicionar metadados específicos
            address: `${station.nome}, ${cityKey}, SP`,
            knownHighwaySource: true
          };
          
          stations.push(poi);
        });
      }
    }
  });
  
  return stations;
}

/**
 * Busca balanças nas proximidades das rodovias da rota
 * @param highwaysOnRoute Lista de identificadores de rodovias na rota (ex: SP-255)
 * @returns Array de pontos de interesse representando balanças
 */
export function getWeighingStationsByHighways(highwaysOnRoute: string[]): PointOfInterest[] {
  const stations: PointOfInterest[] = [];
  let stationId = 70000; // ID base para estas balanças
  
  // Normalizar códigos de rodovias
  const normalizedHighways = highwaysOnRoute.map(highway => 
    highway.replace(/\s+/g, '-').toUpperCase()
  );
  
  // Buscar balanças nas rodovias da rota
  normalizedHighways.forEach(highway => {
    const highwayStations = balancasPorRodovia[highway];
    if (highwayStations && highwayStations.length > 0) {
      console.log(`Encontradas ${highwayStations.length} balanças na rodovia ${highway}`);
      
      // Converter para o formato PointOfInterest
      highwayStations.forEach(station => {
        const poi: PointOfInterest = {
          id: stationId++,
          name: station.nome,
          type: 'weighing_station',
          lat: station.lat,
          lng: station.lng,
          roadName: highway,
          // Adicionar metadados específicos
          address: `${station.nome}, km ${station.km || 'N/A'}, ${highway}`,
          knownHighwaySource: true
        };
        
        stations.push(poi);
      });
    }
  });
  
  return stations;
}

/**
 * Combina resultados de múltiplas fontes, removendo duplicatas
 * @param stationsArrays Arrays de balanças de diferentes fontes
 * @returns Array combinado sem duplicatas
 */
export function combineWeighingStations(...stationsArrays: PointOfInterest[][]): PointOfInterest[] {
  // Função para calcular distância entre dois pontos (simplificada)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distância em km
  };

  // Combinar todos os arrays em um único array
  const combined: PointOfInterest[] = [];
  
  stationsArrays.forEach(stationArray => {
    stationArray.forEach(station => {
      // Verificar se já existe uma balança similar no array combinado
      const isDuplicate = combined.some(existingStation => {
        // Considerar duplicata se estiver a menos de 5km de distância
        try {
          const distance = calculateDistance(
            parseFloat(station.lat), parseFloat(station.lng),
            parseFloat(existingStation.lat), parseFloat(existingStation.lng)
          );
          return distance < 5; // 5km para considerar duplicata
        } catch (e) {
          // Em caso de erro, verificar pelos nomes
          return existingStation.name === station.name || 
                 existingStation.name.includes(station.name) || 
                 station.name.includes(existingStation.name);
        }
      });
      
      // Adicionar apenas se não for duplicata
      if (!isDuplicate) {
        combined.push(station);
      }
    });
  });
  
  return combined;
}