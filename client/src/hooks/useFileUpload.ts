import { useState, useRef, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { ParsedCepFile } from "@/lib/types";

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função simplificada para importar CEP de um arquivo
  const parseFile = useCallback(async (file: File): Promise<ParsedCepFile | null> => {
    // Marca como carregando
    setIsLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (!file) {
        throw new Error("Nenhum arquivo selecionado");
      }

      // Aceitar arquivos .txt e .csv
      if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv') && 
          file.type !== "text/plain" && file.type !== "text/csv") {
        throw new Error("Por favor, envie um arquivo de texto (.txt ou .csv)");
      }

      // Lê o conteúdo do arquivo
      const content = await readFileAsText(file);
      
      // Verifica se o arquivo está vazio
      if (!content || content.trim() === "") {
        throw new Error("O arquivo está vazio");
      }

      console.log("Enviando arquivo para o servidor. Tamanho:", content.length);

      // Envia para o servidor usando fetch diretamente
      const response = await fetch("/api/parse-cep-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileContent: content }),
      });

      // Verifica se a resposta é válida
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do servidor: ${response.status} ${errorText}`);
      }

      // Processa a resposta
      const data = await response.json();
      console.log("Resposta do servidor:", data);

      // Verifica se recebemos localizações
      if (!data.locations || data.locations.length === 0) {
        throw new Error("Nenhum CEP válido foi encontrado no arquivo");
      }

      // Retorna os dados processados
      return data;
    } catch (err) {
      // Trata e exibe o erro
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao processar o arquivo";
      console.error("Erro ao processar arquivo:", errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      // Desativa o estado de carregamento
      setIsLoading(false);
    }
  }, []);

  // Função auxiliar para ler o arquivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error("Falha ao ler o arquivo"));
      };
      
      reader.readAsText(file);
    });
  };

  // Abre o seletor de arquivo
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Processa o evento de mudança do input de arquivo
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
