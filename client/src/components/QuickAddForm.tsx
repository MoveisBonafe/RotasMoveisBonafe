import { useState } from "react";

interface QuickAddFormProps {
  onAddLocation: (name: string, cep: string) => void;
}

export default function QuickAddForm({ onAddLocation }: QuickAddFormProps) {
  const [name, setName] = useState("");
  const [cep, setCep] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  
  // Função para adicionar destino manualmente
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!name.trim()) {
      alert("Por favor, informe o nome do destino.");
      return;
    }
    
    // CEP é opcional, mas se fornecido, é melhor validar
    if (cep.trim() && !/^\d{5}-?\d{3}$/.test(cep.trim())) {
      alert("O CEP informado não é válido. Use o formato 12345-678 ou 12345678.");
      return;
    }
    
    setIsBusy(true);
    
    try {
      // Formatar CEP se necessário
      const formattedCep = cep.trim().replace(/(\d{5})(\d{3})/, "$1-$2");
      
      // Chamar a função para adicionar local
      onAddLocation(name.trim(), formattedCep);
      
      // Limpar os campos após o sucesso
      setName("");
      setCep("");
    } catch (error) {
      console.error("Erro ao adicionar destino:", error);
      alert("Não foi possível adicionar o destino. Por favor, tente novamente.");
    } finally {
      setIsBusy(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <input
          type="text"
          placeholder="Nome da cidade ou local"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isBusy}
        />
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="CEP (opcional)"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          disabled={isBusy}
        />
        
        <button
          type="submit"
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isBusy || !name.trim()}
        >
          {isBusy ? "Adicionando..." : "Adicionar"}
        </button>
      </div>
    </form>
  );
}