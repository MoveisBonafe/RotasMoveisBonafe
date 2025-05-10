import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { FileSpreadsheet, TableIcon } from 'lucide-react';

/**
 * Processadores específicos para diferentes tipos de arquivos de planilha
 * Nota: Este componente não processa o Excel diretamente, mas os dados convertidos em CSV
 */
export default function ExcelWeighingStationImporter() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exampleData, setExampleData] = useState(`
Balança SP-255 (km 150),-21.5483,-47.7699,SP-255,Luís Antônio,Veículos acima de 1 eixo
Balança SP-225 (km 177),-22.2734,-48.3917,SP-225,Dois Córregos,Veículos acima de 1 eixo
Balança SP-304 (km 83),-22.3654,-47.5423,SP-304,São Pedro,Veículos acima de 2 eixos
Balança SP-318 (km 252),-21.9932,-47.8819,SP-318,São Carlos,Veículos acima de 1 eixo
Balança SP-294 (km 389),-22.1654,-49.9632,SP-294,Marília,Veículos acima de 2 eixos
`.trim());
  
  // Quando implementar, carregue os dados da planilha Excel
  const handleImportExample = async () => {
    if (!exampleData.trim()) {
      toast({
        title: "Dados de exemplo vazios",
        description: "Por favor, mantenha ou ajuste os dados de exemplo antes de importar.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Processar texto CSV
      const lines = exampleData.trim().split('\n');
      const points = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length < 3) {
          toast({
            title: "Formato inválido",
            description: `Linha ${i+1} não tem informações suficientes.`,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        const point = {
          name: parts[0].trim(),
          lat: parseFloat(parts[1].trim()),
          lng: parseFloat(parts[2].trim()),
          roadName: parts[3] ? parts[3].trim() : "",
          city: parts[4] ? parts[4].trim() : "",
          restrictions: parts[5] ? parts[5].trim() : ""
        };
        
        points.push(point);
      }
      
      const response = await apiRequest('POST', '/api/import-weighing-stations', {
        points
      });
      
      toast({
        title: "Pontos importados!",
        description: `${points.length} pontos de pesagem foram adicionados.`,
      });
      
    } catch (error) {
      console.error("Erro ao importar pontos de pesagem:", error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar os pontos de pesagem.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Importar Dados do Arquivo Excel</CardTitle>
        <CardDescription>
          Importe os pontos de pesagem do arquivo de exemplo fornecido
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex items-center mb-4">
              <FileSpreadsheet className="h-6 w-6 text-muted-foreground mr-2" />
              <h3 className="font-medium">Dados de Exemplo dos Pontos de Pesagem</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              Estes dados representam o conteúdo convertido do arquivo Excel 'pontos_pesagem.xlsx'.
              Você pode editar os valores antes de importar.
            </p>
            
            <div className="bg-background border rounded-md p-3 font-mono text-xs">
              <pre className="whitespace-pre-wrap break-all">
                {exampleData}
              </pre>
            </div>
          </div>
          
          <Button 
            onClick={handleImportExample}
            className="w-full"
            disabled={isLoading}
          >
            <TableIcon className="mr-2 h-4 w-4" />
            {isLoading ? "Importando..." : "Importar Pontos de Pesagem de Exemplo"}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-1">
            Nota: Esta ação adicionará os pontos de pesagem acima ao sistema. Eles aparecerão no mapa 
            quando estiverem na rota selecionada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}