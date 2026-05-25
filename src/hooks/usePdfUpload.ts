import { useState } from "react";
import httpClient from "../lib/httpClient";

export const usePdfUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPdf = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await httpClient.post("/api/pdf/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (err) {
      const error = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Erro ao processar o PDF.";

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
