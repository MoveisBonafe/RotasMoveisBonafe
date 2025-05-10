import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai o nome da cidade a partir de um endereço completo
 * @param address Endereço completo (ex: "R. Exemplo, 123 - Bairro, Cidade - UF, 12345-678, Brasil")
 * @returns Nome da cidade ou endereço abreviado se não for possível extrair
 */
export function extractCityFromAddress(address: string | undefined | null): string {
  if (!address) return "";
  
  // Tenta encontrar o padrão "Cidade - UF" no endereço
  const cityStateMatch = address.match(/([^,]+) - ([A-Z]{2})/);
  if (cityStateMatch && cityStateMatch.length > 1) {
    const cityWithNeighborhood = cityStateMatch[1].trim();
    // Se tiver um traço antes do UF, pode conter bairro - pega só a cidade
    const parts = cityWithNeighborhood.split('-');
    return parts[parts.length - 1].trim();
  }
  
  // Tenta encontrar o padrão mais simples: nome antes de SP, RJ, MG, etc.
  const stateMatch = address.match(/([^,]+), ([A-Z]{2})/);
  if (stateMatch && stateMatch.length > 1) {
    return stateMatch[1].trim();
  }
  
  // Se o endereço tem "Ribeirão Preto", "Dois Córregos", "Jaú" 
  // ou outras cidades conhecidas, retorna o nome da cidade
  const knownCities = ["Ribeirão Preto", "Dois Córregos", "Jaú", "São Paulo"];
  for (const city of knownCities) {
    if (address.includes(city)) {
      return city;
    }
  }
  
  // Se não conseguiu extrair um nome claro, retorna a primeira parte do endereço
  return address.split(',')[0].trim();
}
