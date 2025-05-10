import React from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeighingStationInput from '@/components/WeighingStationInput';
import ExcelWeighingStationImporter from '@/components/ExcelWeighingStationImporter';

/**
 * Página de administração para adicionar pontos de pesagem
 */
export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" className="mr-2">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar para o Mapa
              </Button>
            </Link>
            <h1 className="text-2xl font-bold hidden md:block">Administração de Pontos de Interesse</h1>
          </div>
          
          <Link href="/">
            <Button variant="outline" className="flex items-center">
              <MapIcon className="mr-2 h-4 w-4" />
              Ver no Mapa
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto my-8 px-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Gerenciador de Pontos de Pesagem</h2>
          <p className="text-gray-600">
            Adicione e gerencie os pontos de pesagem (balanças) que serão exibidos no mapa durante o cálculo de rotas.
          </p>
        </div>
        
        <Tabs defaultValue="excel" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="excel">Importar Excel</TabsTrigger>
            <TabsTrigger value="manual">Adicionar Manualmente</TabsTrigger>
          </TabsList>
          
          <TabsContent value="excel" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <ExcelWeighingStationImporter />
              </div>
              
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Sobre a Importação de Dados</h2>
                  <div className="space-y-4">
                    <p>
                      Este sistema permite importar os dados do arquivo Excel <strong>pontos_pesagem.xlsx</strong> para o mapa.
                    </p>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                      <h3 className="text-lg font-medium text-amber-800 mb-2">Observações Importantes:</h3>
                      <ul className="list-disc pl-6 space-y-2 text-amber-700">
                        <li>Os dados já foram convertidos do Excel para um formato de texto compatível</li>
                        <li>Você pode revisar e editar os dados antes de importar</li>
                        <li>Após a importação, os pontos aparecerão no mapa somente quando estiverem próximos à rota calculada</li>
                      </ul>
                    </div>
                    
                    <h3 className="text-lg font-medium">Formato dos Dados:</h3>
                    <p>Cada linha contém as seguintes informações separadas por vírgula:</p>
                    <code className="block bg-gray-100 p-2 rounded text-sm">
                      nome,latitude,longitude,rodovia,cidade,restrições
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <WeighingStationInput />
              </div>
              
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Instruções</h2>
                  <div className="space-y-4">
                    <p>
                      Use o formulário para adicionar pontos de pesagem (balanças) ao sistema. Estas balanças serão exibidas no mapa durante o cálculo de rotas.
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}