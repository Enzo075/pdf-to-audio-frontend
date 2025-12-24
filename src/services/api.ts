import axios from "axios";
import { API_BASE_URL } from "../config/constants";

export const extractTextFromPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/pdf/extract`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    throw error;
  }
};
