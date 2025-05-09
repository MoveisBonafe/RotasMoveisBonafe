import { useState } from "react";

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
  return (
    <div className="w-full">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Período da viagem</label>
        <p className="text-xs text-gray-500 mb-2">Selecione para ver eventos nas cidades</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Data início:</label>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full"
            value={startDate || ""}
            onChange={(e) => onStartDateChange(e.target.value || null)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Data fim:</label>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full"
            value={endDate || ""}
            onChange={(e) => onEndDateChange(e.target.value || null)}
          />
        </div>
      </div>
    </div>
  );
}
