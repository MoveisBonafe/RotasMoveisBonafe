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
  
  // Número de paradas (excluindo origem e destino)
  const numberOfStops = calculatedRoute ? (calculatedRoute.length - 2 > 0 ? calculatedRoute.length - 2 : 0) : 0;

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
        
        {/* Cards de resumo da rota */}
        <div className="route-summary-card">
          <div className="summary-item">
            <div className="summary-item-title">Distância Total</div>
            <div className="summary-item-value">{totalDistanceKm.toFixed(1).replace('.', ',')} km</div>
          </div>
          <div className="summary-item">
            <div className="summary-item-title">Tempo Estimado</div>
            <div className="summary-item-value">{formatDuration(routeInfo.totalDuration)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-item-title">Número de Paradas</div>
            <div className="summary-item-value">{numberOfStops} paradas</div>
          </div>
          <div className="summary-item">
            <div className="summary-item-title">Custo Total</div>
            <div className="summary-item-value">{formatCurrency(routeInfo.totalCost)}</div>
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
                <th>Número de Paradas</th>
                <td>{numberOfStops} paradas</td>
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
          <h2>Sequência de Pontos</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Seq.</th>
                <th>Local</th>
                <th>Endereço</th>
                <th>CEP</th>
              </tr>
            </thead>
            <tbody>
              {/* Origem */}
              <tr>
                <td>
                  <span className="point-label origin-label">A</span>
                </td>
                <td><strong>{origin.name || 'Origem'}</strong></td>
                <td>{origin.address || '-'}</td>
                <td>{origin.cep || '-'}</td>
              </tr>
              
              {/* Waypoints (da rota calculada, sem incluir origem) */}
              {calculatedRoute.slice(1).map((point, index) => (
                <tr key={index}>
                  <td>
                    <span className={`point-label ${index === calculatedRoute.length - 2 ? 'destination-label' : ''}`}>
                      {index === calculatedRoute.length - 2 ? 'B' : (index + 1)}
                    </span>
                  </td>
                  <td>{point.name || `Ponto ${index + 1}`}</td>
                  <td>{point.address || '-'}</td>
                  <td>{point.cep || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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