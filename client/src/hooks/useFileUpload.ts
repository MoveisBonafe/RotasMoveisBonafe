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
        throw new Error("No file selected");
      }

      if (file.type !== "text/plain") {
        throw new Error("Please upload a text file (.txt)");
      }

      // Read the file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });

      // Send the content to the server for parsing
      const response = await apiRequest("POST", "/api/parse-cep-file", { content });
      const data = await response.json();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
