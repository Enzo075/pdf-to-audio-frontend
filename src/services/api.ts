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

export const extractTextFromPDF = async (file: File): Promise<PDFResult> => {
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await axios.post<PDFResult>(
      `${API_BASE_URL}/api/pdf/extract`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    throw error;
  }
};
