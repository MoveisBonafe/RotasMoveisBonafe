import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { UploadIcon, PlusCircleIcon, TableIcon } from 'lucide-react';

/**
 * Componente para adicionar pontos de pesagem (balanças) ao sistema
 */
export default function WeighingStationInput() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  
  // Estado para adição individual
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [roadName, setRoadName] = useState('');
  const [city, setCity] = useState('');
  const [restrictions, setRestrictions] = useState('');
  
  // Estado para importação em lote
  const [bulkData, setBulkData] = useState('');
  
  /**
   * Adiciona um ponto de pesagem individual
   */
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !lat || !lng) {
      toast({
        title: "Campos incompletos",
        description: "Nome, latitude e longitude são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const point = {
        name,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        roadName,
        city,
        restrictions
      };
      
      const response = await apiRequest('POST', '/api/import-weighing-stations', {
        points: [point]
      });
      
      toast({
        title: "Ponto de pesagem adicionado!",
        description: `${name} foi adicionado com sucesso.`
      });
      
      // Limpar formulário
      setName('');
      setLat('');
      setLng('');
      setRoadName('');
      setCity('');
      setRestrictions('');
      
    } catch (error) {
      console.error("Erro ao adicionar ponto de pesagem:", error);
      toast({
        title: "Erro ao adicionar ponto",
        description: "Não foi possível adicionar o ponto de pesagem.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Adiciona vários pontos de pesagem a partir de um texto CSV
   */
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkData.trim()) {
      toast({
        title: "Nenhum dado fornecido",
        description: "Insira os dados em formato CSV.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Processar texto CSV
      const lines = bulkData.trim().split('\n');
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
          name: parts[0],
          lat: parseFloat(parts[1]),
          lng: parseFloat(parts[2]),
          roadName: parts[3] || "",
          city: parts[4] || "",
          restrictions: parts[5] || ""
        };
        
        points.push(point);
      }
      
      const response = await apiRequest('POST', '/api/import-weighing-stations', {
        points
      });
      
      toast({
        title: "Pontos importados!",
        description: `${points.length} pontos de pesagem foram adicionados.`
      });
      
      // Limpar dados
      setBulkData('');
      
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
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkData(content);
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Adicionar Pontos de Pesagem</CardTitle>
        <CardDescription>
          Adicione balanças rodoviárias para serem exibidas no mapa
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Adicionar Individual
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <TableIcon className="mr-2 h-4 w-4" />
              Importação em Lote
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4">
            <form onSubmit={handleSingleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Balança *</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Balança SP-255 (km 150)"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lat">Latitude *</Label>
                    <Input 
                      id="lat" 
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="-21.5483"
                      required
                      type="number"
                      step="any"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="lng">Longitude *</Label>
                    <Input 
                      id="lng" 
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="-47.7699"
                      required
                      type="number"
                      step="any"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="roadName">Rodovia</Label>
                  <Input 
                    id="roadName" 
                    value={roadName}
                    onChange={(e) => setRoadName(e.target.value)}
                    placeholder="SP-255"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input 
                    id="city" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Luís Antônio"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="restrictions">Restrições</Label>
                  <Input 
                    id="restrictions" 
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="Veículos acima de 1 eixo"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="mt-6 w-full"
                disabled={isLoading}
              >
                {isLoading ? "Adicionando..." : "Adicionar Ponto de Pesagem"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-4">
            <form onSubmit={handleBulkSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bulkUpload">Importação CSV</Label>
                  <Input 
                    id="fileUpload" 
                    type="file" 
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ou cole os dados diretamente no campo abaixo
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bulkData">Dados (Formato CSV)</Label>
                  <Textarea 
                    id="bulkData" 
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    placeholder="nome,latitude,longitude,rodovia,cidade,restrições"
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Exemplo: Balança SP-255 (km 150),-21.5483,-47.7699,SP-255,Luís Antônio,Veículos acima de 1 eixo
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="mt-6 w-full"
                disabled={isLoading}
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                {isLoading ? "Importando..." : "Importar Pontos de Pesagem"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}