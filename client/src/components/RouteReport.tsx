import React, { useRef } from 'react';
import { Location } from '@/lib/types';
import { formatDistance, formatDuration, formatCurrency } from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';

interface RouteReportProps {
  origin: Location | null;
  calculatedRoute: Location[] | null;
  routeInfo: {
    totalDistance: number;
    totalDuration: number;
    tollCost: number;
    fuelCost: number;
    totalCost: number;
    fuelConsumption: number;
  } | null;
  vehicleType: {
    id?: number;
    name: string;
    type: string;
    fuelEfficiency: number;
    tollMultiplier: number;
    fuelCostPerLiter?: number;
  } | null;
  startDate: string | null;
  endDate: string | null;
}

export default function RouteReport({
  origin,
  calculatedRoute,
  routeInfo,
  vehicleType,
  startDate,
  endDate
}: RouteReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Salvar o título de página atual
    const originalTitle = document.title;
    
    // Configurar título para impressão
    document.title = `Relatório de Rota - ${origin?.name || 'Origem'} - ${new Date().toLocaleDateString('pt-BR')}`;
    
    // Conteúdo HTML do relatório
    const printContent = reportRef.current?.innerHTML || '';
    
    // Abrir janela de impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
              }
              .report-header {
                margin-bottom: 30px;
                border-bottom: 3px solid #3b82f6;
                padding-bottom: 15px;
                position: relative;
              }
              .report-header:after {
                content: '';
                position: absolute;
                bottom: -5px;
                left: 0;
                width: 60%;
                height: 2px;
                background-color: #1e40af;
              }
              .date-range {
                color: #4b5563;
                font-style: italic;
              }
              .report-section {
                margin-bottom: 35px;
                padding: 0 10px;
              }
              h1 {
                font-size: 28px;
                color: #1e40af;
                margin-bottom: 10px;
                font-weight: 600;
              }
              h2 {
                font-size: 20px;
                margin: 25px 0 15px 0;
                color: #1e40af;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
                font-weight: 600;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                border-radius: 6px;
                overflow: hidden;
              }
              th, td {
                padding: 12px 16px;
                text-align: left;
                border: 1px solid #e5e7eb;
              }
              th {
                background-color: #f3f4f6;
                font-weight: 600;
                color: #4b5563;
              }
              tr:nth-child(even) {
                background-color: #fafafa;
              }
              tr:hover {
                background-color: #f9fafb;
              }
              .point-label {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                text-align: center;
                border-radius: 50%;
                background-color: #3b82f6;
                color: white;
                font-weight: bold;
                margin-right: 12px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .destination-label {
                background-color: #10b981;
              }
              .origin-label {
                background-color: #2563eb;
              }
              .summary-row {
                font-weight: bold;
                background-color: #f3f4f6 !important;
                border-top: 2px solid #d1d5db;
              }
              .page-break {
                page-break-before: always;
              }
              .notes {
                font-size: 13px;
                margin-top: 40px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 16px;
                background-color: #f9fafb;
              }
              .notes ul {
                padding-left: 20px;
                margin: 10px 0;
              }
              .notes li {
                margin-bottom: 8px;
              }
              .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 11px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                padding-top: 15px;
              }
              .report-company {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              }
              .company-logo {
                font-weight: bold;
                font-size: 18px;
                color: #1e40af;
              }
              .report-date {
                text-align: right;
                font-size: 14px;
              }
              .route-summary-card {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin: 20px 0;
              }
              .summary-item {
                background-color: #f3f4f6;
                border-radius: 8px;
                padding: 15px;
                flex: 1;
                min-width: 200px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              }
              .summary-item-title {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 5px;
              }
              .summary-item-value {
                font-size: 18px;
                font-weight: 600;
                color: #1e40af;
              }
              .route-map-placeholder {
                width: 100%;
                background-color: #f3f4f6;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 20px 0;
                border-radius: 8px;
                color: #6b7280;
              }
              @media print {
                button {
                  display: none;
                }
                body {
                  font-size: 12px;
                }
                h1 {
                  font-size: 24px;
                }
                h2 {
                  font-size: 18px;
                }
                .summary-item-value {
                  font-size: 16px;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <div class="footer">
              Gerado em ${new Date().toLocaleString('pt-BR')} por Roteirizador Logístico Profissional
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // Imprimir após o conteúdo ser carregado
      printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
          // Restaurar título original após a impressão
          document.title = originalTitle;
        };
      };
    }
  };

  // Se não há rota calculada ou informações de rota, não mostrar o relatório
  if (!calculatedRoute || !routeInfo || !origin) {
    return null;
  }

  // Formatar datas para exibição se disponíveis
  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('pt-BR') : null;
  const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('pt-BR') : null;
  const dateRangeText = formattedStartDate && formattedEndDate
    ? `Período: ${formattedStartDate} a ${formattedEndDate}`
    : '';

  // Calcular distância total em km
  const totalDistanceKm = routeInfo.totalDistance / 1000;
  
  // Total de pontos na rota: Origem + Destinos
  // Para 5 CEPs importados (1 origem + 4 destinos), mostraremos 5 pontos
  // O usuário espera ver o número total de pontos, não apenas os destinos
  const totalPoints = calculatedRoute ? calculatedRoute.length : 0;
  
  // Número de destinos (pontos - origem)
  const numberOfStops = totalPoints > 0 ? totalPoints : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-blue-700">Relatório Detalhado da Rota</h2>
        <Button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Relatório
        </Button>
      </div>

      <div ref={reportRef} className="print-container">
        <div className="report-header">
          <div className="report-company">
            <div className="company-logo">
              Roteirizador Logístico
            </div>
            <div className="report-date">
              Data: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
          <h1>Relatório de Rota Otimizada</h1>
          <p className="date-range">{dateRangeText}</p>
        </div>
        
        {/* Cards de resumo da rota - mais visuais */}
        <div className="route-summary-card">
          <div className="summary-item">
            <div className="summary-item-title text-blue-700 font-medium text-lg">
              <svg className="w-6 h-6 inline-block mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Distância Total
            </div>
            <div className="summary-item-value text-blue-700 text-2xl font-bold">{totalDistanceKm.toFixed(1).replace('.', ',')} km</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-item-title text-green-700 font-medium">
              <svg className="w-4 h-4 inline-block mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tempo Estimado
            </div>
            <div className="summary-item-value text-green-700">{formatDuration(routeInfo.totalDuration)}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-item-title">
              <svg className="w-5 h-5 inline-block mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Total de Pontos
            </div>
            <div className="summary-item-value text-orange-700">{numberOfStops} pontos</div>
            <div className="flex mt-2">
              {Array.from({ length: Math.min(numberOfStops, 10) }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-orange-500 mr-1 flex-shrink-0"></div>
              ))}
              {numberOfStops > 10 && <div className="text-xs text-gray-500 ml-1 self-center">+{numberOfStops - 10}</div>}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-item-title">
              <svg className="w-5 h-5 inline-block mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Custo Total
            </div>
            <div className="summary-item-value text-purple-700">{formatCurrency(routeInfo.totalCost)}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Combustível: {Math.round(routeInfo.fuelCost / routeInfo.totalCost * 100)}%</span>
              <span>Pedágios: {Math.round(routeInfo.tollCost / routeInfo.totalCost * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
              <div className="bg-green-500 h-2 float-left" style={{ width: `${Math.round(routeInfo.fuelCost / routeInfo.totalCost * 100)}%` }}></div>
              <div className="bg-yellow-500 h-2 float-left" style={{ width: `${Math.round(routeInfo.tollCost / routeInfo.totalCost * 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2>Informações do Veículo</h2>
          <table>
            <tbody>
              <tr>
                <th>Tipo de Veículo</th>
                <td>{vehicleType?.name || '-'}</td>
              </tr>
              <tr>
                <th>Consumo Médio</th>
                <td>{vehicleType?.fuelEfficiency.toFixed(1) || '-'} km/l</td>
              </tr>
              <tr>
                <th>Custo do Combustível</th>
                <td>R$ {vehicleType?.fuelCostPerLiter ? 
                  (vehicleType.fuelCostPerLiter as number).toFixed(2).replace('.', ',') : 
                  '5,00'}/litro</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>Resumo da Rota</h2>
          <table>
            <tbody>
              <tr>
                <th>Distância Total</th>
                <td>{formatDistance(routeInfo.totalDistance)} ({totalDistanceKm.toFixed(1).replace('.', ',')} km)</td>
              </tr>
              <tr>
                <th>Tempo Estimado</th>
                <td>{formatDuration(routeInfo.totalDuration)}</td>
              </tr>
              <tr>
                <th>Total de Pontos</th>
                <td>{numberOfStops} pontos</td>
              </tr>
              <tr>
                <th>Consumo de Combustível</th>
                <td>{routeInfo.fuelConsumption.toFixed(2).replace('.', ',')} litros</td>
              </tr>
              <tr>
                <th>Custo com Combustível</th>
                <td>{formatCurrency(routeInfo.fuelCost)}</td>
              </tr>
              <tr>
                <th>Custo com Pedágios</th>
                <td>{formatCurrency(routeInfo.tollCost)}</td>
              </tr>
              <tr className="summary-row">
                <th>Custo Total Estimado</th>
                <td>{formatCurrency(routeInfo.totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>
            <svg className="w-5 h-5 inline-block mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Sequência de Pontos
          </h2>
          
          <div className="flex flex-col space-y-3 my-4">
            {/* Origem */}
            <div className="flex items-start bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600 shadow-sm">
              <div className="flex-shrink-0 mr-3">
                <span className="point-label origin-label w-8 h-8 flex items-center justify-center">A</span>
              </div>
              <div className="flex-grow">
                <div className="font-bold text-blue-800">{origin.name || 'Origem'}</div>
                <div className="text-sm text-gray-600">{origin.address || '-'}</div>
                <div className="text-xs text-gray-500 mt-1">CEP: {origin.cep || '-'}</div>
              </div>
              <div className="flex-shrink-0 ml-2">
                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            
            {/* Seta de conexão */}
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            
            {/* Waypoints (da rota calculada, sem incluir origem) */}
            {calculatedRoute.slice(1, -1).map((point, index) => (
              <React.Fragment key={index}>
                <div className="flex items-start bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 shadow-sm">
                  <div className="flex-shrink-0 mr-3">
                    <span className="point-label w-8 h-8 flex items-center justify-center bg-orange-500">{index + 1}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-orange-800">{point.name || `Ponto ${index + 1}`}</div>
                    <div className="text-sm text-gray-600">{point.address || '-'}</div>
                    <div className="text-xs text-gray-500 mt-1">CEP: {point.cep || '-'}</div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Seta de conexão */}
                <div className="flex justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </React.Fragment>
            ))}
            
            {/* Destino final */}
            {calculatedRoute.length > 1 && (
              <div className="flex items-start bg-green-50 p-3 rounded-lg border-l-4 border-green-600 shadow-sm">
                <div className="flex-shrink-0 mr-3">
                  <span className="point-label destination-label w-8 h-8 flex items-center justify-center">B</span>
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-green-800">{calculatedRoute[calculatedRoute.length - 1]?.name || 'Destino Final'}</div>
                  <div className="text-sm text-gray-600">{calculatedRoute[calculatedRoute.length - 1]?.address || '-'}</div>
                  <div className="text-xs text-gray-500 mt-1">CEP: {calculatedRoute[calculatedRoute.length - 1]?.cep || '-'}</div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="report-section">
          <h2>Instruções da Rota</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Etapa</th>
                <th>De</th>
                <th>Para</th>
                <th>Distância</th>
              </tr>
            </thead>
            <tbody>
              {calculatedRoute.slice(0, -1).map((point, index) => {
                const nextPoint = calculatedRoute[index + 1];
                // Aqui poderíamos calcular distâncias individuais entre pontos se tivéssemos essa informação
                const segmentDistance = routeInfo.totalDistance / (calculatedRoute.length - 1);
                
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{point.name || `Ponto ${index}`}</td>
                    <td>{nextPoint.name || `Ponto ${index + 1}`}</td>
                    <td>~{formatDistance(segmentDistance)}</td>
                  </tr>
                );
              })}
              <tr className="summary-row">
                <td colSpan={3} style={{ textAlign: 'right' }}>Total:</td>
                <td>{formatDistance(routeInfo.totalDistance)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="notes">
          <p><strong>Notas:</strong></p>
          <ul>
            <li>Esta rota foi otimizada utilizando algoritmo de Caixeiro Viajante para encontrar o percurso mais curto.</li>
            <li>Os custos de pedágio podem variar de acordo com o horário, feriados e promoções temporárias.</li>
            <li>O consumo de combustível é uma estimativa baseada na eficiência média do veículo selecionado.</li>
            <li>Recomenda-se verificar condições de tráfego e restrições em tempo real antes de iniciar a viagem.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}