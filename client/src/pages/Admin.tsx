import React from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import WeighingStationInput from '@/components/WeighingStationInput';

/**
 * Página de administração para adicionar pontos de pesagem
 */
export default function Admin() {
  return (
    <div className="container mx-auto my-8 px-4">
      <div className="mb-6 flex items-center">
        <Link href="/">
          <Button variant="ghost" className="mr-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar para o Mapa
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Administração</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <WeighingStationInput />
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Instruções</h2>
            <div className="space-y-4">
              <p>
                Use o formulário para adicionar pontos de pesagem (balanças) ao sistema. Essas balanças serão exibidas no mapa durante o cálculo de rotas.
              </p>
              
              <h3 className="text-lg font-medium">Dados Necessários:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Nome:</strong> identificação da balança (ex: "Balança SP-255 (km 150)")</li>
                <li><strong>Latitude/Longitude:</strong> coordenadas precisas da balança na rodovia</li>
                <li><strong>Rodovia:</strong> identificação da rodovia onde a balança está localizada</li>
                <li><strong>Cidade:</strong> cidade mais próxima da balança</li>
                <li><strong>Restrições:</strong> informações sobre as restrições desta balança</li>
              </ul>
              
              <h3 className="text-lg font-medium">Importação em Lote:</h3>
              <p>
                Para importar vários pontos de uma vez, use o formato CSV:
              </p>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                nome,latitude,longitude,rodovia,cidade,restrições
              </code>
              <p className="text-sm">
                Exemplo:<br />
                Balança SP-255 (km 150),-21.5483,-47.7699,SP-255,Luís Antônio,Veículos acima de 1 eixo<br />
                Balança SP-225 (km 177),-22.2734,-48.3917,SP-225,Dois Córregos,Veículos acima de 1 eixo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}