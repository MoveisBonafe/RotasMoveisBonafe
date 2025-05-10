import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

/**
 * Componente para adicionar pontos de pesagem (balanças) ao sistema
 */
export default function WeighingStationInput() {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [roadName, setRoadName] = useState("");
  const [city, setCity] = useState("");
  const [restrictions, setRestrictions] = useState("Veículos de carga");
  const [loading, setLoading] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [showBatchInput, setShowBatchInput] = useState(false);

  /**
   * Adiciona um ponto de pesagem individual
   */
  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!name || !lat || !lng) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e as coordenadas do ponto de pesagem",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Criar o ponto de pesagem
      const point = {
        name,
        lat,
        lng,
        roadName,
        city,
        restrictions
      };
      
      // Enviar para a API
      const response = await fetch('/api/import-weighing-stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points: [point] })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Ponto de pesagem adicionado",
          description: `${name} foi adicionado com sucesso!`,
          variant: "default"
        });
        
        // Limpar o formulário
        setName("");
        setLat("");
        setLng("");
        setRoadName("");
        setCity("");
        setRestrictions("Veículos de carga");
      } else {
        throw new Error(data.message || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao adicionar ponto de pesagem:", error);
      toast({
        title: "Erro ao adicionar",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adiciona vários pontos de pesagem a partir de um texto CSV
   */
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchInput.trim()) {
      toast({
        title: "Entrada vazia",
        description: "Por favor, insira dados no formato CSV",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Parsear o CSV
      const lines = batchInput.trim().split('\n');
      const points = lines.map(line => {
        const [name, lat, lng, roadName, city, restrictions] = line.split(',').map(s => s.trim());
        return {
          name,
          lat,
          lng,
          roadName: roadName || "",
          city: city || "",
          restrictions: restrictions || "Veículos de carga"
        };
      }).filter(p => p.name && p.lat && p.lng);
      
      if (points.length === 0) {
        throw new Error("Nenhum ponto válido encontrado no CSV");
      }
      
      // Enviar para a API
      const response = await fetch('/api/import-weighing-stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Pontos de pesagem importados",
          description: `${points.length} pontos foram importados com sucesso!`,
          variant: "default"
        });
        
        // Limpar o formulário
        setBatchInput("");
        setShowBatchInput(false);
      } else {
        throw new Error(data.message || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao importar pontos de pesagem:", error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Adicionar Pontos de Pesagem</CardTitle>
        <CardDescription>
          Adicione pontos de pesagem (balanças) para mostrar no mapa
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showBatchInput ? (
          <form onSubmit={handleAddSingle} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Balança</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Balança Rodovia SP-255 (km 150)"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input 
                  id="lat" 
                  value={lat} 
                  onChange={(e) => setLat(e.target.value)} 
                  placeholder="-21.3456"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input 
                  id="lng" 
                  value={lng} 
                  onChange={(e) => setLng(e.target.value)} 
                  placeholder="-47.8901"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roadName">Rodovia</Label>
              <Input 
                id="roadName" 
                value={roadName} 
                onChange={(e) => setRoadName(e.target.value)} 
                placeholder="SP-255"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input 
                id="city" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="Luís Antônio"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restrictions">Restrições</Label>
              <Input 
                id="restrictions" 
                value={restrictions} 
                onChange={(e) => setRestrictions(e.target.value)} 
                placeholder="Veículos acima de 1 eixo"
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar Ponto"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleAddBatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchInput">
                Formato CSV: nome,latitude,longitude,rodovia,cidade,restrições
              </Label>
              <Textarea 
                id="batchInput" 
                value={batchInput} 
                onChange={(e) => setBatchInput(e.target.value)} 
                placeholder="Balança SP-255 (km 150),-21.5483,-47.7699,SP-255,Luís Antônio,Veículos acima de 1 eixo"
                className="h-40"
                required
              />
              <p className="text-xs text-muted-foreground">
                Uma linha por ponto de pesagem. Os campos rodovia, cidade e restrições são opcionais.
              </p>
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? "Importando..." : "Importar Pontos"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={() => setShowBatchInput(!showBatchInput)}
          className="mr-auto"
        >
          {showBatchInput ? "Adicionar Individual" : "Importar em Lote"}
        </Button>
      </CardFooter>
    </Card>
  );
}