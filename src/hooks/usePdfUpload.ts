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
      setError("Erro ao processar o PDF.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadPdf,
    loading,
    error,
  };
};
