import { useState } from "react";
import { extractTextFromPDF } from "../services/api";

export const usePdfUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPdf = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const result = await extractTextFromPDF(file);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar o PDF.";

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploadPdf,
    loading,
    error,
    clearError,
  };
};
