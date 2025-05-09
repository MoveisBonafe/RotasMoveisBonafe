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
    
    // Alterar título para impressão
    document.title = `Relatório de Rota - ${origin?.name || 'Rota'} - ${new Date().toLocaleDateString('pt-BR')}`;
    
    // Imprimir apenas a seção do relatório
    const printContent = reportRef.current?.innerHTML || '';
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              .report-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #ddd;
              }
              .report-section {
                margin-bottom: 20px;
                page-break-inside: avoid;
              }
              h1 {
                font-size: 24px;
                color: #2563eb;
              }
              h2 {
                font-size: 18px;
                margin-top: 20px;
                color: #1e40af;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              th, td {
                padding: 8px 12px;
                text-align: left;
                border: 1px solid #ddd;
              }
              th {
                background-color: #f9fafb;
              }
              .point-label {
                display: inline-block;
                width: 25px;
                height: 25px;
                line-height: 25px;
                text-align: center;
                border-radius: 50%;
                background-color: #3b82f6;
                color: white;
                font-weight: bold;
                margin-right: 10px;
              }
              .destination-label {
                background-color: #ef4444;
              }
              .summary-row {
                font-weight: bold;
                background-color: #f9fafb;
              }
              .page-break {
                page-break-before: always;
              }
              .notes {
                font-size: 12px;
                font-style: italic;
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              .footer {
                margin-top: 30px;
                font-size: 10px;
                text-align: center;
                color: #666;
              }
              .date-range {
                font-style: italic;
                color: #666;
                margin-bottom: 15px;
              }
              @media print {
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <div class="footer">
              Gerado em ${new Date().toLocaleString('pt-BR')} por Aplicativo de Roteirização de Logística
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-blue-700">Relatório Detalhado da Rota</h2>
        <Button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Relatório
        </Button>
      </div>

      <div ref={reportRef}>
        <div className="report-header">
          <h1>Relatório de Rota Otimizada</h1>
          <p className="date-range">{dateRangeText}</p>
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
                  <span className="point-label">A</span>
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
                      {index === calculatedRoute.length - 2 ? 'B' : (index + 1).toString()}
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