import { useState, useRef, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { ParsedCepFile } from "@/lib/types";

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(async (file: File): Promise<ParsedCepFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error("Nenhum arquivo selecionado");
      }

      // Aceitar qualquer tipo de arquivo de texto, não apenas text/plain
      if (!file.name.endsWith('.txt') && file.type !== "text/plain" && file.type !== "text/csv") {
        throw new Error("Por favor, envie um arquivo de texto (.txt)");
      }

      // Read the file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log("Conteúdo do arquivo lido:", result.length, "caracteres");
          resolve(result);
        };
        reader.onerror = (e) => reject(new Error("Falha ao ler o arquivo"));
        reader.readAsText(file);
      });

      if (!content || content.trim() === "") {
        throw new Error("O arquivo está vazio");
      }

      console.log("Enviando conteúdo para processamento no servidor");
      // Send the content to the server for parsing
      const response = await apiRequest("POST", "/api/parse-cep-file", { content });
      const data = await response.json();
      console.log("Resposta do servidor:", data);

      if (!data.locations || data.locations.length === 0) {
        throw new Error("Nenhum CEP válido encontrado no arquivo");
      }

      return data;
    } catch (err) {
      console.error("Erro ao processar arquivo:", err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao processar o arquivo");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      return await parseFile(file);
    }
    return null;
  }, [parseFile]);

  return {
    isLoading,
    error,
    fileInputRef,
    triggerFileInput,
    handleFileChange,
    parseFile
  };
}
