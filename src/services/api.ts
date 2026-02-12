import axios from "axios";
import { API_BASE_URL } from "../config/constants";

export interface PDFInfo {
  Title?: string;
  Author?: string;
}

export interface PDFResult {
  pages: string[];
  text: string;
  info?: PDFInfo;
}

// Cria instância do Axios com configuração base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const extractTextFromPDF = async (file: File): Promise<PDFResult> => {
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await apiClient.post<PDFResult>(
      "/api/pdf/extract",
      formData,
    );
    return response.data;
  } catch (error) {
    // Tratamento específico de erro para melhor feedback
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "O processamento do PDF demorou muito. Tente novamente.",
        );
      }
      if (error.response) {
        throw new Error(`Erro no servidor: ${error.response.status}`);
      }
      if (error.request) {
        throw new Error(
          "Não foi possível conectar ao servidor. Verifique sua conexão.",
        );
      }
    }
    throw new Error("Erro inesperado ao processar o PDF.");
  }
};
