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
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <label className="text-sm mr-2">Data início:</label>
        <input 
          type="date" 
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          value={startDate || ""}
          onChange={(e) => onStartDateChange(e.target.value || null)}
        />
      </div>
      <div className="flex items-center">
        <label className="text-sm mr-2">Data fim:</label>
        <input 
          type="date" 
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          value={endDate || ""}
          onChange={(e) => onEndDateChange(e.target.value || null)}
        />
      </div>
    </div>
  );
}
