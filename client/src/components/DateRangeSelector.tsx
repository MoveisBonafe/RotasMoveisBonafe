import { useEffect } from "react";
import { useToast } from '@/hooks/use-toast';

interface DateRangeSelectorProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
}

export default function DateRangeSelector({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeSelectorProps) {
  const { toast } = useToast();
  
  // Efeito para validar se a data fim não é menor que a data início
  useEffect(() => {
    // Só verificar quando ambas as datas estiverem selecionadas
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Se a data final for menor que a data inicial
      if (endDateObj < startDateObj) {
        // Corrigir automaticamente definindo a data fim igual à data início
        onEndDateChange(startDate);
        
        // Notificar o usuário
        toast({
          title: "Data ajustada",
          description: "A data de fim não pode ser anterior à data de início",
          variant: "default"
        });
      }
    }
  }, [startDate, endDate, onEndDateChange, toast]);
  
  // Handler para mudança da data de início
  const handleStartDateChange = (date: string | null) => {
    onStartDateChange(date);
    
    // Se já temos uma data fim selecionada que agora é menor que a nova data início
    if (date && endDate && new Date(endDate) < new Date(date)) {
      // Ajustar a data fim para ser igual à data início
      onEndDateChange(date);
    }
  };
  
  // Usar a data atual como valor padrão para o atributo min, mas sem restringir datas anteriores
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="w-full">
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">Período da viagem</label>
        <p className="text-xs text-gray-500 mb-2">Selecione para ver eventos nas cidades</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Data início:</label>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full"
            value={startDate || ""}
            onChange={(e) => handleStartDateChange(e.target.value || null)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Data fim:</label>
          <input 
            type="date" 
            className={`border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full ${!startDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={endDate || ""}
            min={startDate || ""} // Definir o mínimo como a data de início
            disabled={!startDate} // Desabilitar até que a data início seja selecionada
            onChange={(e) => onEndDateChange(e.target.value || null)}
          />
        </div>
      </div>
    </div>
  );
}
