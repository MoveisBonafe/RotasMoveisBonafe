import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VehicleType } from '../lib/types';
import { getFuelPrice, setFuelPrice, resetFuelPrice } from '../lib/costCalculator';

interface FuelSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVehicleType: VehicleType | null;
  onVehicleEfficiencyChange: (vehicleType: VehicleType, newEfficiency: number) => void;
  onSettingsChanged: () => void; // Callback to notify parent that settings were changed
}

export default function FuelSettingsDialog({
  open,
  onOpenChange,
  selectedVehicleType,
  onVehicleEfficiencyChange,
  onSettingsChanged
}: FuelSettingsDialogProps) {
  const [fuelPrice, setLocalFuelPrice] = useState(getFuelPrice());
  const [fuelEfficiency, setFuelEfficiency] = useState(
    selectedVehicleType ? selectedVehicleType.fuelEfficiency / 10 : 0
  );

  // Update the local state when the selected vehicle type changes
  useEffect(() => {
    if (selectedVehicleType) {
      setFuelEfficiency(selectedVehicleType.fuelEfficiency / 10);
    }
  }, [selectedVehicleType]);

  const handleSave = () => {
    // Save the fuel price
    setFuelPrice(parseFloat(fuelPrice.toString()));
    
    // Save the fuel efficiency for the selected vehicle type
    if (selectedVehicleType) {
      const newEfficiency = parseFloat(fuelEfficiency.toString()) * 10; // Convert back to internal format
      onVehicleEfficiencyChange(selectedVehicleType, newEfficiency);
    }
    
    // Notify parent that settings were changed to trigger recalculation
    onSettingsChanged();
    
    // Close the dialog
    onOpenChange(false);
  };

  const handleReset = () => {
    // Reset fuel price to default
    resetFuelPrice();
    setLocalFuelPrice(getFuelPrice());
    
    // Reset fuel efficiency to vehicle default (would require storing original values)
    if (selectedVehicleType) {
      // For now, we just keep current values as we don't store original defaults
      setFuelEfficiency(selectedVehicleType.fuelEfficiency / 10);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações de Combustível</DialogTitle>
          <DialogDescription>
            Ajuste o preço do combustível e o consumo do veículo
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fuelPrice" className="text-right">
              Preço (R$)
            </Label>
            <Input
              id="fuelPrice"
              type="number"
              step="0.01"
              min="0.01"
              value={fuelPrice}
              onChange={(e) => setLocalFuelPrice(parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          
          {selectedVehicleType && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fuelEfficiency" className="text-right">
                Consumo (km/l)
              </Label>
              <Input
                id="fuelEfficiency"
                type="number"
                step="0.1"
                min="0.1"
                value={fuelEfficiency}
                onChange={(e) => setFuelEfficiency(parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}