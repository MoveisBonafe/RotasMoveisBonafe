import React from 'react';
import { mockOrigin, mockVehicleTypes, mockPointsOfInterest, mockCityEvents, mockTruckRestrictions } from '../lib/mockData';

// Componente que permite visualizar os dados simulados quando o ambiente está em modo de depuração
export default function MockDataDebug() {
  // Detectar se estamos em modo de dados simulados
  const isGitHubPages = window.location.hostname.includes('github.io') || 
                        import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Se não estamos em modo de dados simulados, não renderizar nada
  if (!isGitHubPages) return null;

  // Layout básico para mostrar os dados em um painel minimizado
  return (
    <div className="fixed bottom-2 right-2 z-50">
      <div className="bg-blue-100 p-2 rounded shadow-lg border border-blue-300 text-xs">
        <div className="font-bold text-blue-800 mb-1">Modo GitHub Pages</div>
        <div className="text-blue-600">Usando dados simulados</div>
        <div className="mt-1 text-blue-500">
          {mockOrigin ? '✓ Origem' : '✗ Origem'} | 
          {mockVehicleTypes.length > 0 ? `✓ Veículos (${mockVehicleTypes.length})` : '✗ Veículos'} | 
          {mockPointsOfInterest.length > 0 ? `✓ POIs (${mockPointsOfInterest.length})` : '✗ POIs'} | 
          {mockCityEvents.length > 0 ? `✓ Eventos (${mockCityEvents.length})` : '✗ Eventos'} | 
          {mockTruckRestrictions.length > 0 ? `✓ Restrições (${mockTruckRestrictions.length})` : '✗ Restrições'}
        </div>
      </div>
    </div>
  );
}